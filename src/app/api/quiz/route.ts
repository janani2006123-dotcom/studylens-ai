import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type QuestionType = "mcq" | "short" | "long";

function parseModelJson(content: string) {
  if (!content.trim()) {
    throw new Error("The AI returned an empty response.");
  }

  const cleaned = content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      action,
      material,
      questionCount = 10,
      questionTypes = ["mcq", "short", "long"],
      answers = [],
    } = body;

    if (
      !material ||
      typeof material.text !== "string" ||
      !material.text.trim()
    ) {
      return Response.json(
        { error: "Please upload a PDF in Materials first." },
        { status: 400 }
      );
    }

    const notes = material.text.slice(0, 24000);

    // =========================
    // GRADE ANSWERS
    // =========================

    if (action === "grade") {
      if (!Array.isArray(answers) || answers.length === 0) {
        return Response.json(
          { error: "No answers were submitted." },
          { status: 400 }
        );
      }

      const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",

        response_format: {
          type: "json_object",
        },

        messages: [
          {
            role: "system",
            content: `You are a fair college tutor grading answers against the provided study notes.

Grade short and long answers for correctness, relevant ideas, and understanding.
Accept different wording when the meaning is correct.
Do not demand exact sentences from the notes.

Return ONLY valid JSON with this shape:
{
  "results": [
    {
      "questionId": "same id",
      "score": 0,
      "maxScore": 2,
      "feedback": "specific helpful feedback",
      "modelAnswer": "a concise correct answer"
    }
  ]
}

Use integer scores.
Be encouraging but honest.
Include a result for every submitted answer.`,
          },
          {
            role: "user",
            content: `STUDY NOTES:
${notes}

GRADE THESE ANSWERS:
${JSON.stringify(answers)}`,
          },
        ],
      });

      const content =
        completion.choices[0]?.message?.content ?? "";

      const parsed = parseModelJson(content);

      if (!Array.isArray(parsed.results)) {
        throw new Error("Invalid grading response.");
      }

      return Response.json(parsed);
    }

    // =========================
    // GENERATE QUIZ
    // =========================

    if (action !== "generate") {
      return Response.json(
        { error: "Unknown quiz action." },
        { status: 400 }
      );
    }

    const count = Math.min(
      20,
      Math.max(3, Number(questionCount) || 10)
    );

    const allowedTypes: QuestionType[] = [
      "mcq",
      "short",
      "long",
    ];

    const types: QuestionType[] = Array.isArray(questionTypes)
      ? questionTypes.filter((type: QuestionType) =>
          allowedTypes.includes(type)
        )
      : ["mcq", "short", "long"];

    if (types.length === 0) {
      return Response.json(
        { error: "Choose at least one question type." },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

      response_format: {
        type: "json_object",
      },

      messages: [
        {
          role: "system",
          content: `You create high-quality college-level practice quizzes from study notes.

Use the supplied notes as the primary source.
Test important concepts, understanding, applications, comparisons, and cause-and-effect.
Avoid trivial, repeated, vague, or unsupported questions.

Create questions using ONLY the requested question types.

Question types:
- mcq: four options and one clearly correct answer.
- short: a question answered in a few sentences.
- long: a developed explanation, comparison, derivation, or application question.

Return ONLY valid JSON with this exact structure:

{
  "title": "short quiz title",
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "exact correct option",
      "modelAnswer": "explanation",
      "marks": 1
    },
    {
      "id": "q2",
      "type": "short",
      "question": "Question text",
      "options": [],
      "correctAnswer": "",
      "modelAnswer": "key points",
      "marks": 2
    },
    {
      "id": "q3",
      "type": "long",
      "question": "Question text",
      "options": [],
      "correctAnswer": "",
      "modelAnswer": "structured sample answer",
      "marks": 5
    }
  ]
}

Give every question a unique ID.
MCQs must have four options.
Short and long questions must have empty correctAnswer.
Marks: MCQ = 1, short = 2, long = 5.
Return the requested number of questions.`,
        },
        {
          role: "user",
          content: `MATERIAL NAME: ${String(
            material.name || "Study notes"
          )}

QUESTION COUNT: ${count}

ALLOWED QUESTION TYPES: ${types.join(", ")}

STUDY NOTES:
${notes}`,
        },
      ],
    });

    const content =
      completion.choices[0]?.message?.content ?? "";

    const parsed = parseModelJson(content);

    if (
      !parsed ||
      !Array.isArray(parsed.questions) ||
      parsed.questions.length === 0
    ) {
      throw new Error("The model returned no questions.");
    }

    const questions = parsed.questions
      .slice(0, count)
      .map((q: any, index: number) => {
        const type: QuestionType = allowedTypes.includes(q.type)
          ? q.type
          : "short";

        return {
          id: String(q.id || `q${index + 1}`),

          type,

          question: String(
            q.question || "Review this topic from your notes."
          ),

          options:
            type === "mcq" && Array.isArray(q.options)
              ? q.options.slice(0, 4).map(String)
              : [],

          correctAnswer:
            type === "mcq"
              ? String(q.correctAnswer || "")
              : "",

          modelAnswer: String(q.modelAnswer || ""),

          marks:
            type === "mcq"
              ? 1
              : type === "long"
              ? 5
              : 2,
        };
      });

    return Response.json({
      title: String(
        parsed.title ||
          `${material.name || "Study"} practice quiz`
      ),
      questions,
    });
  } catch (error) {
    console.error("StudyLens quiz error:", error);

    console.error(
      "Quiz error details:",
      error instanceof Error
        ? error.message
        : String(error)
    );

    return Response.json(
      {
        error:
          "Quiz generation or grading failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
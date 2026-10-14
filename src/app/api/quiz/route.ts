
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type QuestionType = "mcq" | "short" | "long";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, material, questionCount = 10, questionTypes = ["mcq", "short", "long"], answers = [] } = body;

    if (!material || typeof material.text !== "string" || !material.text.trim()) {
      return Response.json(
        { error: "Please upload a PDF in Materials first." },
        { status: 400 }
      );
    }

    const notes = material.text.slice(0, 24000);

    if (action === "grade") {
      if (!Array.isArray(answers) || answers.length === 0) {
        return Response.json({ error: "No answers were submitted." }, { status: 400 });
      }

      const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: `You are a fair college tutor grading answers against the provided study notes.
Grade short and long answers for correctness, relevant ideas, and understanding. Accept different wording when the meaning is correct. Do not demand exact sentences from the notes.
Return ONLY valid JSON with this shape:
{"results":[{"questionId":"same id","score":0,"maxScore":2,"feedback":"specific helpful feedback","modelAnswer":"a concise correct answer"}]}
Use integer scores. Be encouraging but honest.`,
          },
          {
            role: "user",
            content: `STUDY NOTES:\n${notes}\n\nGRADE THESE ANSWERS:\n${JSON.stringify(answers)}`,
          },
        ],
      });

      const content = completion.choices[0]?.message?.content ?? "";
      const cleaned = content.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return Response.json(parsed);
    }

    if (action !== "generate") {
      return Response.json({ error: "Unknown quiz action." }, { status: 400 });
    }

    const count = Math.min(20, Math.max(3, Number(questionCount) || 10));
    const allowedTypes: QuestionType[] = ["mcq", "short", "long"];
    const types = Array.isArray(questionTypes)
      ? questionTypes.filter((type: QuestionType) => allowedTypes.includes(type))
      : ["mcq", "short", "long"];

    if (types.length === 0) {
      return Response.json({ error: "Choose at least one question type." }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `You create high-quality college-level practice quizzes from study notes.
Use the supplied notes as the primary source. Test important concepts, understanding, applications, comparisons, and cause-and-effect. Avoid trivial questions, repeated questions, vague wording, and facts not supported by the notes.
Create a balanced mix of the requested types:
- mcq: four options, one clearly correct answer.
- short: a question answered in a few sentences.
- long: an explanation, comparison, derivation, or application question requiring a developed answer.
Make questions useful for exam preparation, not merely definitions.
Return ONLY valid JSON, no Markdown, using this exact shape:
{"title":"short quiz title","questions":[{"id":"q1","type":"mcq","question":"Question text","options":["A","B","C","D"],"correctAnswer":"exact correct option","modelAnswer":"explanation of the answer","marks":1},{"id":"q2","type":"short","question":"Question text","options":[],"correctAnswer":"","modelAnswer":"key points in a good answer","marks":2},{"id":"q3","type":"long","question":"Question text","options":[],"correctAnswer":"","modelAnswer":"a structured sample answer","marks":5}]}
For short and long questions, keep correctAnswer empty. Give every question a unique id. Set marks to 1 for MCQ, 2 for short, and 5 for long questions. Include options only for MCQs.`,
        },
        {
          role: "user",
          content: `MATERIAL NAME: ${String(material.name || "Study notes")}\nQUESTION COUNT: ${count}\nALLOWED QUESTION TYPES: ${types.join(", ")}\n\nSTUDY NOTES:\n${notes}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const cleaned = content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error("The model returned no questions.");
    }

    const questions = parsed.questions.slice(0, count).map((q: any, index: number) => {
      const type = allowedTypes.includes(q.type) ? q.type : "short";
      return {
        id: String(q.id || `q${index + 1}`),
        type,
        question: String(q.question || "Review this topic from your notes."),
        options: type === "mcq" && Array.isArray(q.options)
          ? q.options.slice(0, 4).map(String)
          : [],
        correctAnswer: type === "mcq" ? String(q.correctAnswer || "") : "",
        modelAnswer: String(q.modelAnswer || ""),
        marks: type === "mcq" ? 1 : type === "long" ? 5 : 2,
      };
    });

    return Response.json({
      title: String(parsed.title || `${material.name || "Study"} practice quiz`),
      questions,
    });
  } catch (error) {
    console.error("StudyLens quiz error:", error);
    return Response.json(
      { error: "Quiz generation or grading failed. Please try again." },
      { status: 500 }
    );
  }
}

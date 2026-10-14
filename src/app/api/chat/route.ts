import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type Material = {
  name: string;
  text: string;
};

export async function POST(request: Request) {
  try {
    const { message, materials = [] } = await request.json();

    if (typeof message !== "string" || !message.trim()) {
      return Response.json(
        { error: "Please enter a question." },
        { status: 400 }
      );
    }

    const validMaterials: Material[] = Array.isArray(materials)
      ? materials.filter(
          (item: unknown): item is Material =>
            typeof item === "object" &&
            item !== null &&
            "name" in item &&
            "text" in item &&
            typeof item.name === "string" &&
            typeof item.text === "string"
        )
      : [];

    const pdfContext = validMaterials
      .map(
        (material) =>
          `Document: ${material.name}\n${material.text.slice(0, 12000)}`
      )
      .join("\n\n---\n\n")
      .slice(0, 24000);

    const systemPrompt = `
You are StudyLens, a friendly and patient college study tutor.

YOUR PURPOSE:
Help students understand academic concepts clearly, simply, and accurately.

RESPONSE RULES:
1. Start with a simple, direct definition.
2. Use easy English suitable for a beginner.
3. Explain concepts in short paragraphs.
4. Use useful bullet points when needed.
5. Give one simple example when helpful.
6. Keep ordinary answers around 100-180 words.
7. Use Markdown headings and bold text sparingly.
8. Do not create tables unless explicitly requested.
9. Never repeat the question unnecessarily.
10. For exam preparation, provide structured answers.
11. For code requests, provide code relevant to the request.

${
  pdfContext
    ? `IMPORTANT: The extracted text of the student's uploaded PDFs is provided below. You CAN read and use this text. Never claim that you cannot open, view, or read a PDF when its extracted text is available here. If the student asks whether you can access their notes, confirm that you can use the extracted text.

UPLOADED STUDY MATERIALS:
${pdfContext}

Use these materials as your primary source for related questions. If an answer is not present, clearly distinguish general knowledge from information in the notes. Never invent content or claim the notes say something they do not.`
    : `No extracted PDF text was received with this question. Do not pretend to have read a document. Answer using general knowledge when appropriate.`
}
`.trim();

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message.trim(),
        },
      ],
    });

    const reply = completion.choices[0]?.message?.content;

    return Response.json({
      reply: reply || "I couldn't prepare an answer. Please try again.",
    });
  } catch (error) {
    console.error("StudyLens chat error:", error);

    return Response.json(
      { error: "The AI tutor couldn't respond. Please try again." },
      { status: 500 }
    );
  }
}
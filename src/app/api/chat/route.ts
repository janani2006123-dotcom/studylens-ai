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

Help students understand academic concepts clearly, simply, and accurately.

RESPONSE RULES:
1. Start with a simple definition.
2. Use easy English suitable for beginners.
3. Explain concepts step by step.
4. Use short paragraphs and helpful bullet points.
5. Give real-life examples when useful.
6. Keep answers around 100-180 words.
7. Use Markdown headings sparingly.
8. For exam preparation, provide structured answers.
9. Never invent information from uploaded notes.

${
  pdfContext
    ? `Use the following uploaded study materials as your primary source:

${pdfContext}

Clearly distinguish general knowledge from information in the notes.`
    : "No extracted PDF text was provided. Answer using general knowledge when appropriate."
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
      {
        error: error instanceof Error
          ? error.message
          : String(error),
      },
      { status: 500 }
    );
  }
}
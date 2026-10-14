import { extractText, getDocumentProxy } from "unpdf";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "Please select a PDF file." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return Response.json(
        { error: "The selected PDF is empty." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json(
        { error: "The PDF must be smaller than 10 MB." },
        { status: 413 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return Response.json(
        { error: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocumentProxy(buffer);
    const result = await extractText(pdf, { mergePages: true });
    const text = result.text.trim();

    if (!text) {
      return Response.json(
        { error: "No selectable text found. This PDF may be scanned." },
        { status: 422 }
      );
    }

    return Response.json({
      text,
      pages: pdf.numPages,
    });
  } catch (error) {
    console.error("StudyLens PDF processing error:", error);

    return Response.json(
      { error: "Could not process this PDF. Please try another file." },
      { status: 500 }
    );
  }
}

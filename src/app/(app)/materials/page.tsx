
"use client";

import { useRef, useState } from "react";
import { FileUp, FileText, Trash2, LoaderCircle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Material = {
  id: string;
  name: string;
  pages: number;
  text: string;
};

export default function MaterialsPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function uploadPDF(file?: File) {
    if (!file) return;

    setError("");

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please choose a PDF file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Your PDF must be smaller than 10 MB.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not process this PDF.");
      }

      const material: Material = {
        id: crypto.randomUUID(),
        name: file.name,
        pages: data.pages,
        text: data.text,
      };

      setMaterials((previous) => [...previous, material]);

      try {
        const saved = JSON.parse(
          localStorage.getItem("studylens-materials") || "[]"
        ) as Material[];

        localStorage.setItem(
          "studylens-materials",
          JSON.stringify([...saved, material])
        );
      } catch {
        setError(
          "PDF processed, but it could not be saved in browser storage. Keep this tab open."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeMaterial(id: string) {
    setMaterials((previous) => previous.filter((item) => item.id !== id));

    try {
      const saved = JSON.parse(
        localStorage.getItem("studylens-materials") || "[]"
      ) as Material[];

      localStorage.setItem(
        "studylens-materials",
        JSON.stringify(saved.filter((item) => item.id !== id))
      );
    } catch {
      setError("Could not update browser storage.");
    }
  }

  return (
    <>
      <PageHeader
        title="Study materials"
        description="Upload your notes and PDFs to study with StudyLens."
        action={
          <Button onClick={() => inputRef.current?.click()} disabled={loading}>
            {loading ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : (
              <FileUp className="mr-2 size-4" />
            )}
            {loading ? "Processing PDF..." : "Upload PDF"}
          </Button>
        }
      />

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(event) => uploadPDF(event.target.files?.[0])}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="mt-6 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed bg-card px-6 py-12 text-center transition-colors hover:border-primary hover:bg-muted/40 disabled:opacity-60"
      >
        <FileUp className="size-8 text-primary" />
        <span className="mt-3 font-medium">
          {loading ? "Reading your document..." : "Drop into your study zone"}
        </span>
        <span className="mt-1 text-sm text-muted-foreground">
          Click to choose a PDF · Maximum 10 MB
        </span>
      </button>

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Your library
            <Badge variant="outline">{materials.length} files</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {materials.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Your library is waiting for its first PDF. ✨
            </div>
          ) : (
            <div className="divide-y">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between gap-3 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <FileText className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{material.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {material.pages} pages · Text extracted
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    <button
                      type="button"
                      onClick={() => removeMaterial(material.id)}
                      aria-label={`Remove ${material.name}`}
                      className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

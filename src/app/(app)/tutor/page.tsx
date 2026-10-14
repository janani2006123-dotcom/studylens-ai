
"use client";

import { useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SendHorizontal, Bot, User, LoaderCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function TutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const question = input.trim();
    if (!question || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", content: question },
    ]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const materials = JSON.parse(
  localStorage.getItem("studylens-materials") || "[]"
);

const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: question,
    materials: materials.map(
      (material: { name: string; text: string }) => ({
        name: material.name,
        text: material.text,
      })
    ),
  }),
});

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The tutor couldn't respond.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            typeof data.reply === "string"
              ? data.reply
              : "I couldn't format that response. Please try again.",
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="AI tutor"
        description="Ask questions and learn concepts step by step."
      />

      <div className="flex h-[32rem] flex-col overflow-hidden rounded-xl border bg-card">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="grid size-10 place-items-center rounded-xl bg-primary/10">
            <Bot className="size-5" />
          </div>
          <div>
            <p className="font-medium">StudyLens AI</p>
            <p className="text-xs text-muted-foreground">
              Your personal study assistant
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="grid h-full place-items-center text-center">
              <div className="max-w-sm">
                <Bot className="mx-auto mb-3 size-10 text-primary" />
                <p className="font-medium">What are we learning today?</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ask me to explain a concept, give you an example, or help
                  you understand a difficult topic.
                </p>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-2 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10">
                  <Bot className="size-4" />
                </div>
              )}

              <div
                className={`min-w-0 max-w-[85%] break-words rounded-2xl px-4 py-3 text-sm ${
                  message.role === "user"
                    ? "whitespace-pre-wrap bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.role === "user" ? (
                  message.content
                ) : (
                  <div className="study-markdown">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="mb-3 mt-4 text-xl font-bold first:mt-0">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-2 mt-4 text-lg font-semibold first:mt-0">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-2 mt-3 font-semibold first:mt-0">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-3 last:mb-0 leading-6">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => <li>{children}</li>,
                        strong: ({ children }) => (
                          <strong className="font-semibold">
                            {children}
                          </strong>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="my-3 border-l-4 border-primary/40 pl-3 text-muted-foreground">
                            {children}
                          </blockquote>
                        ),
                        table: ({ children }) => (
                          <div className="my-3 max-w-full overflow-x-auto rounded-lg border">
                            <table className="w-full border-collapse text-left text-sm">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-background/70">
                            {children}
                          </thead>
                        ),
                        th: ({ children }) => (
                          <th className="border-b px-3 py-2 font-semibold">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border-b px-3 py-2 align-top">
                            {children}
                          </td>
                        ),
                        hr: () => <hr className="my-4 border-border" />,
                        code: ({ children }) => (
                          <code className="rounded bg-background px-1.5 py-0.5 font-mono text-[0.9em]">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {message.role === "user" && (
                <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted">
                  <User className="size-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              StudyLens is thinking...
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
          <textarea
            rows={1}
            aria-label="Message"
            placeholder="Ask a study question..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            disabled={loading}
            className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <SendHorizontal className="size-4" />
            )}
          </button>
        </form>
      </div>
    </>
  );
}

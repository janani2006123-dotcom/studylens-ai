
"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type QuestionType = "mcq" | "short" | "long";

type Question = {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: string;
  modelAnswer: string;
  marks: number;
};

type Material = {
  id: string;
  name: string;
  pages: number;
  text: string;
};

type Quiz = {
  title: string;
  questions: Question[];
};

type GradeResult = {
  questionId: string;
  score: number;
  maxScore: number;
  feedback: string;
  modelAnswer: string;
};

type QuizAttempt = {
  id: string;
  date: string;
  title: string;
  materialName: string;
  score: number;
  maxScore: number;
  percentage: number;
};

const HISTORY_KEY = "studylens-quiz-history";

export default function QuizPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialId, setMaterialId] = useState("");
  const [count, setCount] = useState("10");
  const [types, setTypes] = useState<QuestionType[]>([
    "mcq",
    "short",
    "long",
  ]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [results, setResults] = useState<GradeResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("studylens-materials");

      if (saved) {
        const parsed: Material[] = JSON.parse(saved);
        setMaterials(
          parsed.filter((material) => material.text?.trim())
        );
      }
    } catch {
      setError(
        "Could not read saved materials. Please revisit Materials and try again."
      );
    }
  }, []);

  const selectedMaterial =
    materials.find((material) => material.id === materialId) ??
    materials[0];

  function toggleType(type: QuestionType) {
    setTypes((previous) =>
      previous.includes(type)
        ? previous.filter((item) => item !== type)
        : [...previous, type]
    );
  }

  async function generateQuiz() {
    if (!selectedMaterial) {
      setError("Upload a PDF with selectable text in Materials first.");
      return;
    }

    if (types.length === 0) {
      setError("Choose at least one question type.");
      return;
    }

    setLoading(true);
    setError("");
    setQuiz(null);
    setResults(null);
    setAnswers({});
    setCurrent(0);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          material: selectedMaterial,
          questionCount: Number(count),
          questionTypes: types,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not generate quiz.");
      }

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("No questions were returned. Please try again.");
      }

      setQuiz(data as Quiz);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function saveQuizAttempt(
    gradedResults: GradeResult[],
    materialName: string,
    quizTitle: string
  ) {
    const score = gradedResults.reduce(
      (sum, result) => sum + result.score,
      0
    );

    const maxScore = gradedResults.reduce(
      (sum, result) => sum + result.maxScore,
      0
    );

    const attempt: QuizAttempt = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      title: quizTitle || "Practice quiz",
      materialName,
      score,
      maxScore,
      percentage: maxScore
        ? Math.round((score / maxScore) * 100)
        : 0,
    };

    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      const history: QuizAttempt[] = saved ? JSON.parse(saved) : [];

      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify([attempt, ...history])
      );
    } catch (e) {
      console.error("Could not save quiz history:", e);
      setError(
        "Your quiz was graded, but its history could not be saved."
      );
    }
  }

  async function submitQuiz() {
    if (!quiz || !selectedMaterial) return;

    setLoading(true);
    setError("");

    const mcqResults: GradeResult[] = quiz.questions
      .filter((question) => question.type === "mcq")
      .map((question) => ({
        questionId: question.id,
        score:
          answers[question.id] === question.correctAnswer ? 1 : 0,
        maxScore: 1,
        feedback:
          answers[question.id] === question.correctAnswer
            ? "Correct!"
            : `Not quite. The correct answer is: ${question.correctAnswer}`,
        modelAnswer: question.modelAnswer,
      }));

    const writtenAnswers = quiz.questions
      .filter((question) => question.type !== "mcq")
      .map((question) => ({
        questionId: question.id,
        question: question.question,
        type: question.type,
        studentAnswer: answers[question.id] || "(No answer provided)",
        modelAnswer: question.modelAnswer,
        maxScore: question.marks,
      }));

    try {
      let gradedResults: GradeResult[];

      if (writtenAnswers.length === 0) {
        // MCQ-only quizzes can be graded locally.
        gradedResults = mcqResults;
      } else {
        const response = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "grade",
            material: selectedMaterial,
            answers: writtenAnswers,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Could not grade your answers."
          );
        }

        if (!Array.isArray(data.results)) {
          throw new Error("The grading service returned an invalid result.");
        }

        gradedResults = [...mcqResults, ...data.results];
      }

      saveQuizAttempt(
        gradedResults,
        selectedMaterial.name,
        quiz.title
      );

      setResults(gradedResults);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not grade your answers."
      );
    } finally {
      setLoading(false);
    }
  }

  const question = quiz?.questions[current];

  const totalScore =
    results?.reduce((sum, result) => sum + result.score, 0) ?? 0;

  const maxScore =
    results?.reduce((sum, result) => sum + result.maxScore, 0) ?? 0;

  return (
    <>
      <PageHeader
        title="Quiz"
        description="Turn your study materials into useful practice questions."
      />

      {!quiz && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Create your practice quiz</CardTitle>
            <p className="text-sm text-muted-foreground">
              Questions are generated from the text in your uploaded notes.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Study material
              </label>

              <select
                value={materialId || materials[0]?.id || ""}
                onChange={(e) => setMaterialId(e.target.value)}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
                disabled={materials.length === 0}
              >
                {materials.length === 0 && (
                  <option value="">No materials uploaded</option>
                )}

                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name}
                  </option>
                ))}
              </select>

              {materials.length === 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload a text-based PDF in Materials first.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Number of questions
              </label>

              <select
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
              >
                <option value="5">5 questions</option>
                <option value="10">10 questions</option>
                <option value="15">15 questions</option>
                <option value="20">20 questions</option>
              </select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Question types</p>

              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ["mcq", "Multiple choice"],
                    ["short", "Short answer"],
                    ["long", "Long answer"],
                  ] as [QuestionType, string][]
                ).map(([type, label]) => (
                  <label
                    key={type}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={types.includes(type)}
                      onChange={() => toggleType(type)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              onClick={generateQuiz}
              disabled={loading || materials.length === 0}
            >
              {loading ? "Preparing your quiz..." : "Generate quiz"}
            </Button>
          </CardContent>
        </Card>
      )}

      {quiz && !results && question && (
        <Card className="max-w-3xl">
          <CardHeader>
            <p className="text-sm text-muted-foreground">
              Question {current + 1} of {quiz.questions.length} ·{" "}
              {question.marks} mark{question.marks === 1 ? "" : "s"}
            </p>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: `${((current + 1) / quiz.questions.length) * 100}%`,
                }}
              />
            </div>

            <CardTitle className="pt-3">{question.question}</CardTitle>

            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {question.type === "mcq"
                ? "Multiple choice"
                : question.type === "short"
                  ? "Short answer"
                  : "Long answer"}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {question.type === "mcq" ? (
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <label
                    key={`${question.id}-${index}`}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm hover:bg-muted/50"
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers[question.id] === option}
                      onChange={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [question.id]: option,
                        }))
                      }
                      className="mt-1"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                value={answers[question.id] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [question.id]: e.target.value,
                  }))
                }
                placeholder={
                  question.type === "short"
                    ? "Write a few sentences..."
                    : "Explain your answer step by step..."
                }
                rows={question.type === "short" ? 4 : 7}
                className="w-full rounded-lg border bg-background p-3 text-sm"
              />
            )}

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="flex flex-wrap justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrent((n) => n - 1)}
                disabled={current === 0 || loading}
              >
                Previous
              </Button>

              {current < quiz.questions.length - 1 ? (
                <Button
                  onClick={() => setCurrent((n) => n + 1)}
                  disabled={loading}
                >
                  Next question
                </Button>
              ) : (
                <Button onClick={submitQuiz} disabled={loading}>
                  {loading ? "Checking answers..." : "Submit quiz"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {quiz && results && (
        <div className="max-w-3xl space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz results</CardTitle>
              <p className="text-muted-foreground">
                You earned {totalScore} out of {maxScore} marks.
              </p>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-semibold">
                {maxScore
                  ? Math.round((totalScore / maxScore) * 100)
                  : 0}
                %
              </p>
            </CardContent>
          </Card>

          {quiz.questions.map((q, index) => {
            const result = results.find(
              (item) => item.questionId === q.id
            );

            return (
              <Card key={q.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {index + 1}. {q.question}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3 text-sm">
                  <p>
                    <strong>Your answer:</strong>{" "}
                    {answers[q.id] || "Not answered"}
                  </p>

                  <p>
                    <strong>Score:</strong>{" "}
                    {result
                      ? `${result.score}/${result.maxScore}`
                      : "Not graded"}
                  </p>

                  <p>
                    <strong>Feedback:</strong>{" "}
                    {result?.feedback || "No feedback available."}
                  </p>

                  {q.type !== "mcq" && (
                    <p>
                      <strong>Sample answer:</strong>{" "}
                      {result?.modelAnswer || q.modelAnswer}
                    </p>
                  )}

                  {q.type === "mcq" && (
                    <p>
                      <strong>Explanation:</strong> {q.modelAnswer}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <div className="flex flex-wrap gap-2">
            <Button onClick={generateQuiz}>Generate another quiz</Button>

            <Button
              variant="outline"
              onClick={() => {
                setQuiz(null);
                setResults(null);
                setError("");
                setAnswers({});
                setCurrent(0);
              }}
            >
              Change settings
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

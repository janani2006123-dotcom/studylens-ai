
"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type QuizAttempt = {
  id?: string;
  date?: string;
  title?: string;
  materialName?: string;
  score: number;
  maxScore: number;
  percentage: number;
};

export default function ProgressPage() {
  const [documents, setDocuments] = useState(0);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    function loadProgress() {
      try {
        const materials = JSON.parse(
          localStorage.getItem("studylens-materials") || "[]"
        );

        const history = JSON.parse(
          localStorage.getItem("studylens-quiz-history") || "[]"
        );

        setDocuments(Array.isArray(materials) ? materials.length : 0);
        setAttempts(Array.isArray(history) ? history : []);
      } catch (error) {
        console.error("Could not load StudyLens progress:", error);
        setDocuments(0);
        setAttempts([]);
      }
    }

    loadProgress();

    // Refresh when the user returns to this page.
    window.addEventListener("focus", loadProgress);
    window.addEventListener("storage", loadProgress);

    return () => {
      window.removeEventListener("focus", loadProgress);
      window.removeEventListener("storage", loadProgress);
    };
  }, []);

  const validAttempts = attempts.filter(
    (attempt) =>
      Number.isFinite(attempt.percentage) &&
      attempt.percentage >= 0 &&
      attempt.percentage <= 100
  );

  const averageScore =
    validAttempts.length > 0
      ? Math.round(
          validAttempts.reduce(
            (total, attempt) => total + attempt.percentage,
            0
          ) / validAttempts.length
        )
      : 0;

  return (
    <>
      <PageHeader
        title="Progress"
        description="Track your StudyLens learning activity."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Documents uploaded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{documents}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Saved in this browser
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Quiz attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{attempts.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Completed quizzes
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your learning progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              Average quiz score
            </span>
            <span className="text-sm font-semibold">{averageScore}%</span>
          </div>

          <Progress value={averageScore} />

          <p className="text-sm text-muted-foreground">
            {attempts.length > 0
              ? `You've completed ${attempts.length} quiz ${
                  attempts.length === 1 ? "attempt" : "attempts"
                }. Keep practising to build your understanding.`
              : documents > 0
                ? "Your documents are ready to study. Complete a quiz to start tracking your scores."
                : "Upload a PDF in Materials to get started."}
          </p>
        </CardContent>
      </Card>

      {attempts.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent quiz attempts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...attempts].reverse().map((attempt, index) => (
              <div
                key={attempt.id ?? `${attempt.date ?? "quiz"}-${index}`}
                className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {attempt.title || attempt.materialName || "Study quiz"}
                  </p>
                  {attempt.date && (
                    <p className="text-sm text-muted-foreground">
                      {new Date(attempt.date).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {attempt.score} / {attempt.maxScore} points
                  </p>
                </div>

                <span className="shrink-0 font-semibold">
                  {Math.round(attempt.percentage)}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
}

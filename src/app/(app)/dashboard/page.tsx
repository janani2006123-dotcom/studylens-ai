
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Material = {
  id?: string;
  title?: string;
  name?: string;
  fileName?: string;
  filename?: string;
  topic?: string;
  subject?: string;
};

type QuizAttempt = {
  id?: string;
  date?: string;
  title?: string;
  materialName?: string;
  score: number;
  maxScore: number;
  percentage: number;
};

export default function DashboardPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    function loadDashboard() {
      try {
        const savedMaterials = JSON.parse(
          localStorage.getItem("studylens-materials") || "[]"
        );

        const savedAttempts = JSON.parse(
          localStorage.getItem("studylens-quiz-history") || "[]"
        );

        setMaterials(
          Array.isArray(savedMaterials) ? savedMaterials : []
        );
        setAttempts(
          Array.isArray(savedAttempts) ? savedAttempts : []
        );
      } catch (error) {
        console.error("Could not load dashboard data:", error);
        setMaterials([]);
        setAttempts([]);
      }
    }

    loadDashboard();
    window.addEventListener("focus", loadDashboard);
    window.addEventListener("storage", loadDashboard);

    return () => {
      window.removeEventListener("focus", loadDashboard);
      window.removeEventListener("storage", loadDashboard);
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

  function materialTitle(material: Material) {
    return (
      material.title ||
      material.name ||
      material.fileName ||
      material.filename ||
      "Untitled material"
    );
  }

  return (
    <>
      <PageHeader
        title="Your study desk"
        description="Pick up where you left off, explore your materials, and track your learning."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Saved materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{materials.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Materials in this browser
            </p>
            <Link
              href="/materials"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              View materials →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Completed quizzes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{attempts.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Saved quiz attempts
            </p>
            <Link
              href="/quiz"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              Practise now →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Average quiz score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{averageScore}%</p>
            <Progress value={averageScore} className="mt-3" />
            <p className="mt-2 text-sm text-muted-foreground">
              {validAttempts.length > 0
                ? "Based on saved quiz results"
                : "Complete a quiz to start tracking"}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Pick up where you left off</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/materials"
              className="rounded-xl border p-4 transition-colors hover:bg-muted"
            >
              <p className="font-medium">Explore materials</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Open your study resources.
              </p>
            </Link>

            <Link
              href="/quiz"
              className="rounded-xl border p-4 transition-colors hover:bg-muted"
            >
              <p className="font-medium">Take a quiz</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Test your understanding and save your results.
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>Recent materials</CardTitle>
            <Link
              href="/materials"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {materials.length === 0 ? (
              <div className="py-6 text-center">
                <p className="font-medium">Your study desk is waiting!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a material to see it here.
                </p>
                <Link
                  href="/materials"
                  className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                >
                  Go to Materials →
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {[...materials].reverse().slice(0, 5).map((material, index) => (
                  <div
                    key={material.id ?? `${materialTitle(material)}-${index}`}
                    className="flex items-center justify-between gap-3 py-3 text-sm"
                  >
                    <span className="min-w-0 truncate font-medium">
                      {materialTitle(material)}
                    </span>
                    <Badge>
                      {material.topic || material.subject || "Study material"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent quiz activity</CardTitle>
          </CardHeader>
          <CardContent>
            {attempts.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                Your completed quizzes will appear here.
              </p>
            ) : (
              <div className="divide-y">
                {[...attempts].reverse().slice(0, 3).map((attempt, index) => (
                  <div
                    key={attempt.id ?? `${attempt.date ?? "quiz"}-${index}`}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {attempt.title || attempt.materialName || "Study quiz"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {attempt.score} / {attempt.maxScore} points
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold">
                      {Math.round(attempt.percentage)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

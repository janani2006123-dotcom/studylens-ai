"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Bot,
  ClipboardCheck,
  FileText,
  FileUp,
  Sparkles,
  Target,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { useStudyData } from "@/hooks/use-study-data";
import {
  averagePercentage,
  formatRelativeDate,
  getGreeting,
} from "@/lib/study-data";
import { cn } from "@/lib/utils";

type QuizAttempt = {
  id: string;
  title: string;
  materialName?: string;
  date: string;
  percentage: number;
};

export default function DashboardPage() {
  const { materials, attempts, ready } = useStudyData();

  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const averageScore = averagePercentage(attempts);

  const latestMaterial =
    materials.length > 0 ? materials[materials.length - 1] : null;

  const recentMaterials = [...materials].reverse().slice(0, 4);

  const recentAttempts: QuizAttempt[] = attempts.slice(0, 3);

  return (
    <>
      <PageHeader
        title={greeting}
        description="Pick up where you left off, or start something new."
        action={
          <Link href="/tutor" className={buttonVariants()}>
            <Sparkles />
            Ask the AI tutor
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Study materials"
          value={ready ? String(materials.length) : "–"}
          suffix={materials.length === 1 ? "file" : "files"}
          icon={BookOpen}
        />

        <StatCard
          label="Quizzes taken"
          value={ready ? String(attempts.length) : "–"}
          suffix="completed"
          icon={ClipboardCheck}
        />

        <StatCard
          label="Average score"
          value={
            ready && attempts.length > 0 ? String(averageScore) : "–"
          }
          suffix={attempts.length > 0 ? "%" : undefined}
          hint={
            attempts.length > 0
              ? undefined
              : "Complete a quiz to see your score"
          }
          icon={Target}
        />
      </div>

      <Card className="mt-6 overflow-hidden bg-linear-to-br from-secondary/80 via-card to-card">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          {latestMaterial ? (
            <>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                  Latest material
                </p>

                <h2 className="mt-2 truncate text-xl font-semibold sm:text-2xl">
                  {latestMaterial.name}
                </h2>

                <p className="mt-1.5 text-sm text-muted-foreground">
                  {latestMaterial.pages > 0
                    ? `${latestMaterial.pages} pages · `
                    : ""}
                  Ready for tutoring and practice quizzes.
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Link href="/tutor" className={buttonVariants()}>
                  <Bot />
                  Ask the tutor
                </Link>

                <Link
                  href="/quiz"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Generate a quiz
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                  Get started
                </p>

                <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
                  Add your first study material
                </h2>

                <p className="mt-1.5 max-w-lg text-sm text-muted-foreground">
                  Upload a PDF of your notes, slides or textbook chapters. The
                  AI tutor and quiz generator will use it.
                </p>
              </div>

              <Link
                href="/materials"
                className={cn(buttonVariants(), "shrink-0")}
              >
                <FileUp />
                Upload a PDF
              </Link>
            </>
          )}
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="items-center">
            <CardTitle>Recent materials</CardTitle>

            <Link
              href="/materials"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>

          <CardContent>
            {recentMaterials.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No materials yet"
                description="Materials you upload will appear here."
                className="py-8"
              />
            ) : (
              <ul className="divide-y">
                {recentMaterials.map((material) => (
                  <li
                    key={material.id}
                    className="flex items-center gap-3 py-3"
                  >
                    <span
                      aria-hidden
                      className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary"
                    >
                      <FileText className="size-4" />
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {material.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {material.pages > 0
                          ? `${material.pages} pages`
                          : "Text extracted"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="items-center">
            <CardTitle>Recent quizzes</CardTitle>

            <Link
              href="/progress"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View progress
              <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>

          <CardContent>
            {recentAttempts.length === 0 ? (
              <EmptyState
                icon={ClipboardCheck}
                title="No quizzes yet"
                description="Your completed quizzes will appear here."
                action={
                  <Link
                    href="/quiz"
                    className={buttonVariants({
                      variant: "secondary",
                      size: "sm",
                    })}
                  >
                    Take a quiz
                  </Link>
                }
                className="py-8"
              />
            ) : (
              <ul className="divide-y">
                {recentAttempts.map((attempt: QuizAttempt) => (
                  <li
                    key={attempt.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {attempt.title}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {[
                          attempt.materialName,
                          formatRelativeDate(attempt.date),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>

                    <span className="shrink-0 text-sm font-semibold text-primary tabular-nums">
                      {Math.round(attempt.percentage)}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
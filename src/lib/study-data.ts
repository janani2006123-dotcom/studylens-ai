/**
 * Read-only helpers for the data StudyLens already keeps in the browser.
 * The keys below are the same ones the Materials and Quiz pages write to.
 */

export const MATERIALS_KEY = "studylens-materials";
export const QUIZ_HISTORY_KEY = "studylens-quiz-history";

export type StoredMaterial = {
  id: string;
  name: string;
  pages: number;
  text: string;
};

export type StoredQuizAttempt = {
  id: string;
  date: string;
  title: string;
  materialName: string;
  score: number;
  maxScore: number;
  percentage: number;
};

function readJsonArray(key: string): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function timeOf(date: string): number {
  return Date.parse(date) || 0;
}

/** Saved materials, oldest first (the order they were uploaded). */
export function loadMaterials(): StoredMaterial[] {
  return readJsonArray(MATERIALS_KEY).flatMap((item, index) => {
    const record = asRecord(item);
    if (!record) return [];

    const name =
      firstString(record.name, record.title, record.fileName, record.filename) ||
      "Untitled material";

    return [
      {
        id: typeof record.id === "string" && record.id ? record.id : `${name}-${index}`,
        name,
        pages:
          typeof record.pages === "number" && Number.isFinite(record.pages)
            ? record.pages
            : 0,
        text: typeof record.text === "string" ? record.text : "",
      },
    ];
  });
}

/** Saved quiz attempts, newest first. Entries with an invalid score are skipped. */
export function loadQuizHistory(): StoredQuizAttempt[] {
  const attempts = readJsonArray(QUIZ_HISTORY_KEY).flatMap((item, index) => {
    const record = asRecord(item);
    if (!record) return [];

    const percentage = Number(record.percentage);
    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) return [];

    const score = Number(record.score);
    const maxScore = Number(record.maxScore);

    return [
      {
        id: typeof record.id === "string" && record.id ? record.id : `attempt-${index}`,
        date: typeof record.date === "string" ? record.date : "",
        title: firstString(record.title, record.materialName) || "Practice quiz",
        materialName: firstString(record.materialName) || "Study material",
        score: Number.isFinite(score) ? score : 0,
        maxScore: Number.isFinite(maxScore) ? maxScore : 0,
        percentage,
      },
    ];
  });

  return attempts.sort((a, b) => timeOf(b.date) - timeOf(a.date));
}

export function averagePercentage(attempts: StoredQuizAttempt[]): number {
  if (attempts.length === 0) return 0;
  const total = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
  return Math.round(total / attempts.length);
}

export function bestPercentage(attempts: StoredQuizAttempt[]): number {
  return attempts.reduce((best, attempt) => Math.max(best, attempt.percentage), 0);
}

export function attemptsInLastDays(attempts: StoredQuizAttempt[], days: number): number {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return attempts.filter((attempt) => timeOf(attempt.date) >= cutoff).length;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function getGreeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function formatShortDate(iso: string): string {
  const time = Date.parse(iso);
  if (!time) return "";
  const date = new Date(time);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export function formatRelativeDate(iso: string): string {
  const time = Date.parse(iso);
  if (!time) return "";

  const minutes = Math.floor((Date.now() - time) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return formatShortDate(iso);
}

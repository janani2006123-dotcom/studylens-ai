import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight">
      <span aria-hidden className="grid size-7 place-items-center rounded-full border-2 border-primary">
        <span className="size-2.5 rounded-full bg-accent ring-2 ring-primary" />
      </span>
      StudyLens AI
    </Link>
  );
}

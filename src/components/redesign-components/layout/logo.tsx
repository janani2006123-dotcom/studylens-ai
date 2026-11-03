import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-heading text-lg font-semibold tracking-tight">
      <span aria-hidden className="grid size-8 place-items-center rounded-xl bg-linear-to-br from-primary to-[#8856e5] text-white shadow-sm">
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="7.5" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
        </svg>
      </span>
      StudyLens AI
    </Link>
  );
}

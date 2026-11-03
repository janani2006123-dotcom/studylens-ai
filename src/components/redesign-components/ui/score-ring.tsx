export function ScoreRing({ value }: { value: number }) {
  const safe = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative grid size-28 shrink-0 place-items-center">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={radius} fill="none" strokeWidth="8" className="stroke-secondary" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - safe / 100)}
        />
      </svg>
      <span className="absolute text-2xl font-semibold tabular-nums">{safe}%</span>
    </div>
  );
}

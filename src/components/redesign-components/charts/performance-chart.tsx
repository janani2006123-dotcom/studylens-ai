import { formatShortDate, type StoredQuizAttempt } from "@/lib/study-data";

const WIDTH = 640;
const HEIGHT = 250;
const PAD_LEFT = 44;
const PAD_RIGHT = 24;
const PAD_TOP = 30;
const PAD_BOTTOM = 40;

/**
 * Simple SVG line + area chart of quiz scores over time.
 * `attempts` must be in chronological order (oldest first).
 */
export function PerformanceChart({ attempts }: { attempts: StoredQuizAttempt[] }) {
  const count = attempts.length;
  if (count === 0) return null;

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const bottom = PAD_TOP + plotHeight;

  const points = attempts.map((attempt, index) => ({
    x: count === 1 ? PAD_LEFT + plotWidth / 2 : PAD_LEFT + (index * plotWidth) / (count - 1),
    y: PAD_TOP + (1 - attempt.percentage / 100) * plotHeight,
    value: Math.round(attempt.percentage),
    label: formatShortDate(attempt.date) || `#${index + 1}`,
    title: `${attempt.title}: ${Math.round(attempt.percentage)}%`,
  }));

  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const previous = points[i - 1];
    const current = points[i];
    const midX = (previous.x + current.x) / 2;
    linePath += ` C ${midX} ${previous.y} ${midX} ${current.y} ${current.x} ${current.y}`;
  }

  const areaPath = `${linePath} L ${points[count - 1].x} ${bottom} L ${points[0].x} ${bottom} Z`;
  const gridValues = [0, 50, 100];

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Quiz scores over your last ${count} ${count === 1 ? "quiz" : "quizzes"}`}
    >
      <defs>
        <linearGradient id="performance-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--primary)", stopOpacity: 0.22 }} />
          <stop offset="100%" style={{ stopColor: "var(--primary)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>

      {gridValues.map((value) => {
        const y = PAD_TOP + (1 - value / 100) * plotHeight;
        return (
          <g key={value}>
            <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={y} y2={y} className="stroke-border" strokeDasharray="4 4" />
            <text x={PAD_LEFT - 10} y={y + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
              {value}%
            </text>
          </g>
        );
      })}

      {count > 1 && (
        <>
          <path d={areaPath} fill="url(#performance-fill)" />
          <path d={linePath} fill="none" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}

      {points.map((point, index) => (
        <g key={index}>
          <title>{point.title}</title>
          <circle cx={point.x} cy={point.y} r="5" className="fill-card stroke-primary" strokeWidth="2.5" />
          <text x={point.x} y={point.y - 12} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
            {point.value}%
          </text>
          <text x={point.x} y={HEIGHT - 12} textAnchor="middle" className="fill-muted-foreground text-[11px]">
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

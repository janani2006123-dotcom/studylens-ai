import { cn } from "@/lib/utils";

export function Progress({ value, className, indicatorClassName }: { value: number; className?: string; indicatorClassName?: string }) {
  const safe = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  return (
    <div role="progressbar" aria-valuenow={safe} aria-valuemin={0} aria-valuemax={100} className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div className={cn("h-full rounded-full bg-primary transition-all duration-500", indicatorClassName)} style={{ width: `${safe}%` }} />
    </div>
  );
}

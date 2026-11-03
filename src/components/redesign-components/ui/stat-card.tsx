import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  suffix,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  suffix?: string;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && (
          <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-secondary text-primary">
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <p className="mt-3 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">{value}</span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

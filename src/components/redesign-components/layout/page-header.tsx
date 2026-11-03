import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  sample,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  sample?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold tracking-wider text-primary uppercase">{eyebrow}</p>
        )}
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold sm:text-[2rem]">{title}</h1>
          {sample && <Badge variant="highlight">Sample layout</Badge>}
        </div>
        <p className="mt-1.5 max-w-xl text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  );
}

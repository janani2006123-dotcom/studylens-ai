import { Badge } from "@/components/ui/badge";

export function PageHeader({ title, description, sample, action }: { title: string; description: string; sample?: boolean; action?: React.ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold">{title}</h1>
          {sample && <Badge variant="highlight">Sample layout</Badge>}
        </div>
        <p className="mt-1 max-w-xl text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  );
}

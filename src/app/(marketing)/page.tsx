import Link from "next/link";
import { BookOpen, Bot, ChartNoAxesColumn, ClipboardCheck } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  { icon: BookOpen, title: "Bring your own materials", text: "Upload lecture notes, slides and PDFs. Everything you study with comes from your own course." },
  { icon: Bot, title: "Ask questions about them", text: "A tutor that answers from your materials, so explanations match what your class actually teaches." },
  { icon: ClipboardCheck, title: "Practice what you just read", text: "Quizzes built from your notes, aimed at the topics you find hardest." },
  { icon: ChartNoAxesColumn, title: "See what is sticking", text: "Track mastery by topic and know what to review before the exam." },
];

export default function LandingPage() {
  return (
    <div>
      <header className="mx-auto flex max-w-6xl items-center justify-between p-5">
        <Logo />
        <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>Open dashboard</Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
        <div>
          <h1 className="text-5xl leading-[1.05] font-semibold sm:text-6xl">Study the material you already have, but smarter.</h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            StudyLens AI turns your notes and slides into a tutor, quizzes and a clear picture of what you know.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>Start studying</Link>
            <Link href="/materials" className={buttonVariants({ size: "lg", variant: "outline" })}>Add study materials</Link>
          </div>
        </div>

        <div aria-hidden className="relative rounded-xl border bg-card p-6 shadow-sm">
          <p className="text-xs text-muted-foreground">Cell respiration, lecture 4</p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Glycolysis takes place in the cytoplasm and splits one glucose molecule into two pyruvate molecules.
          </p>
          <p className="mt-2 rounded-md bg-accent/70 px-2 py-1 text-sm leading-7 font-medium text-accent-foreground">
            The net gain is two ATP and two NADH, which is why later stages matter for total energy yield.
          </p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Pyruvate then enters the mitochondria when oxygen is available, continuing into the citric acid cycle.
          </p>
          <div className="absolute -right-4 -bottom-6 size-24 rounded-full border-[6px] border-primary bg-primary/5 sm:size-28" />
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto grid max-w-6xl gap-px bg-border sm:grid-cols-2">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-card p-8">
              <Icon className="size-5 text-primary" />
              <h2 className="mt-4 text-xl font-semibold">{title}</h2>
              <p className="mt-2 max-w-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className={cn("mx-auto max-w-6xl p-8 text-sm text-muted-foreground")}>StudyLens AI. Hackathon build in progress.</footer>
    </div>
  );
}

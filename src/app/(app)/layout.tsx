import { AppNav } from "@/components/layout/app-nav";
import { Logo } from "@/components/layout/logo";

export default function AppLayout({ children }: { children: React.ReactNode }) {
return (
<div className="lg:grid lg:min-h-screen lg:grid-cols-[15rem_1fr]">
<aside className="flex flex-col gap-4 border-b bg-card p-4 lg:gap-8 lg:border-r lg:border-b-0 lg:p-5">
<Logo />
<AppNav />
</aside>
<main className="mx-auto w-full max-w-5xl p-5 lg:p-10">{children}</main>
</div>
);
}
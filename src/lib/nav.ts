import { BookOpen, Bot, ChartNoAxesColumn, ClipboardCheck, LayoutDashboard, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const appNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/materials", label: "Study materials", icon: BookOpen },
  { href: "/tutor", label: "AI tutor", icon: Bot },
  { href: "/quiz", label: "Quiz", icon: ClipboardCheck },
  { href: "/progress", label: "Progress", icon: ChartNoAxesColumn },
];

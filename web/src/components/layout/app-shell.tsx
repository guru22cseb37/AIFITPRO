"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  CalendarDays,
  Apple,
  LineChart,
  Moon,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/nutrition", label: "Nutrition", icon: Apple },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/community", label: "Sleep", icon: Moon },
  { href: "/ai-coach", label: "AI Coach", icon: Bot },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 pb-24 pt-6 sm:px-6 lg:pb-10">
      <aside className="hidden w-56 shrink-0 lg:block">
        <nav className="sticky top-24 space-y-1 rounded-2xl border border-white/10 bg-[var(--card)] p-3">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-zinc-100",
                pathname === href && "bg-white/10 text-zinc-100",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[color-mix(in_oklab,var(--background)_90%,transparent)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg justify-around px-2 py-2">
          {items.slice(0, 5).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] text-zinc-500",
                pathname === href && "text-[var(--accent)]",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

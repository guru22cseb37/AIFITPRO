"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/use-app-store";
import { StreakBadge } from "@/components/gamification/streak-badge";

const appLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/workouts", label: "Workouts" },
  { href: "/schedule", label: "Schedule" },
  { href: "/nutrition", label: "Nutrition" },
  { href: "/progress", label: "Progress" },
  { href: "/community", label: "Sleep" },
  { href: "/ai-coach", label: "AI Coach" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const colorTheme = useAppStore((s) => s.colorTheme);
  const setColorTheme = useAppStore((s) => s.setColorTheme);
  const streakDays = useAppStore((s) => s.streakDays);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const navItems = user
    ? appLinks
    : [
        { href: "/", label: "Home" },
        { href: "/#features", label: "Features" },
        { href: "/#bmi", label: "BMI" },
      ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[color-mix(in_oklab,var(--background)_82%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-zinc-950">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">AIFIT PRO</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:text-zinc-100",
                pathname === l.href && "bg-white/10 text-zinc-100",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-xl border border-white/10 p-1 sm:flex">
            <Button
              type="button"
              size="sm"
              variant={colorTheme === "midnight" ? "primary" : "ghost"}
              className="h-8 px-2 text-xs"
              onClick={() => setColorTheme("midnight")}
            >
              Gold
            </Button>
            <Button
              type="button"
              size="sm"
              variant={colorTheme === "energy" ? "primary" : "ghost"}
              className="h-8 px-2 text-xs"
              onClick={() => setColorTheme("energy")}
            >
              Blue/Orange
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </Button>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-200 sm:block"
              >
                Hi, {user.name.split(" ")[0]}
              </Link>
              <StreakBadge days={streakDays} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-xl px-3 py-2 text-sm text-zinc-300 hover:text-white sm:block"
              >
                Log in
              </Link>
              <Link href="/register">
                <Button size="sm" className="hidden sm:inline-flex">
                  Start free
                </Button>
              </Link>
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            className="lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {navItems.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm hover:bg-white/5">
                  {l.label}
                </Link>
              ))}
              {!user ? (
                <>
                  <Link href="/login" className="rounded-lg px-3 py-2 text-sm hover:bg-white/5">
                    Log in
                  </Link>
                  <Link href="/register" className="rounded-lg px-3 py-2 text-sm hover:bg-white/5">
                    Register
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5"
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                >
                  Log out
                </button>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

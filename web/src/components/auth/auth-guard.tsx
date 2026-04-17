"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";
import { useStoreHydrated } from "@/hooks/use-store-hydrated";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAppStore((s) => s.user);
  const router = useRouter();
  const hydrated = useStoreHydrated();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) router.replace("/login");
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        <p className="text-sm text-[var(--muted)]">Loading your training hub…</p>
      </div>
    );
  }

  return <>{children}</>;
}

import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-zinc-950/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-semibold">AIFIT PRO</p>
          <p className="mt-1 max-w-md text-sm text-[var(--muted)]">
            Self-guided training with calculators, scheduling, and AI-assisted coaching experiences. Not medical
            advice.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          <Link href="/legal/privacy" className="hover:text-zinc-200">
            Privacy
          </Link>
          <Link href="/legal/terms" className="hover:text-zinc-200">
            Terms
          </Link>
          <Link href="/register" className="hover:text-zinc-200">
            Create account
          </Link>
        </div>
      </div>
    </footer>
  );
}

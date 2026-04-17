"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/use-app-store";
import { CuteRobot } from "@/components/auth/cute-robot";

export default function LoginPage() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const ok = login(email, password);
    if (!ok) {
      setErr("Invalid email or password. Register first or check credentials.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-8">
      <CuteRobot isPasswordFocused={isPasswordFocused} />
      <Card className="relative z-20 -mt-8 bg-zinc-950/90 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader title="Log in" subtitle="Secure authentication" />
        <form onSubmit={submit} className="space-y-3">
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Email</span>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Password</span>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              autoComplete="current-password"
            />
          </label>
          {err ? <p className="text-sm text-red-400">{err}</p> : null}
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
        <div className="mt-4 space-y-2">
          <Button type="button" variant="secondary" className="w-full" disabled>
            Continue with Google (OAuth)
          </Button>
          <Button type="button" variant="secondary" className="w-full" disabled>
            Continue with Facebook (OAuth)
          </Button>
        </div>
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          No account?{" "}
          <Link href="/register" className="text-[var(--accent)] hover:underline">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("success");
      setMessage("A password reset link has been sent to your email address.");
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-8">
      <Card className="relative z-20 bg-zinc-950/90 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader title="Forgot password" subtitle="We'll send you a recovery link" />
        
        {status === "success" ? (
          <div className="flex flex-col items-center p-4 text-center">
            <div className="mb-4 rounded-full bg-green-500/20 p-4">
              <MailCheck className="h-8 w-8 text-green-400" />
            </div>
            <p className="mb-6 text-[var(--muted)]">{message}</p>
            <Link href="/login" className="flex w-full">
              <Button type="button" variant="outline" className="w-full">
                Return to log in
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm">
              <span className="text-[var(--muted)]">Email address</span>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-1"
              />
            </label>
            
            {status === "error" && <p className="text-sm text-red-400">{message}</p>}
            
            <Button type="submit" className="w-full" disabled={status === "loading"}>
              {status === "loading" ? "Sending..." : "Send reset link"}
            </Button>
            
            <p className="mt-4 text-center text-sm text-[var(--muted)]">
              Remembered your password?{" "}
              <Link href="/login" className="text-[var(--accent)] hover:underline">
                Log in
              </Link>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
}

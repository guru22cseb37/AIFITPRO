"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check if the user is actually in a recovery session
    // Supabase automatically extracts the hash from the URL and sets the session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setStatus("error");
        setMessage("Invalid or expired recovery link. Please try resetting your password again.");
      }
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("success");
      setMessage("Your password has been successfully updated!");
      // Automatically redirect after a few seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-8">
      <Card className="relative z-20 bg-zinc-950/90 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader title="Update password" subtitle="Create a new strong password" />
        
        {status === "success" ? (
          <div className="p-4 text-center">
            <p className="mb-6 text-green-400">{message}</p>
            <p className="text-sm text-[var(--muted)]">Redirecting you to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm">
              <span className="text-[var(--muted)]">New password</span>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-1"
              />
            </label>
            
            <label className="block text-sm">
              <span className="text-[var(--muted)]">Confirm new password</span>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-1"
              />
            </label>
            
            {status === "error" && <p className="text-sm text-red-400">{message}</p>}
            
            <Button type="submit" className="w-full" disabled={status === "loading" || status === "error" && !password}>
              {status === "loading" ? "Updating..." : "Update password"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

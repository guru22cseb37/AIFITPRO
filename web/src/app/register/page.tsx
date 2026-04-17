"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActivityLevel, GoalType } from "@/lib/calculations";
import type { FitnessLevel } from "@/types/index";
import { useAppStore } from "@/store/use-app-store";
import { CuteRobot } from "@/components/auth/cute-robot";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAppStore((s) => s.register);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(78);
  const [goalWeightKg, setGoalWeightKg] = useState(72);
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>("beginner");
  const [goalType, setGoalType] = useState<GoalType>("loss");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [dietaryPreference, setDietaryPreference] = useState<"omnivore" | "vegetarian" | "vegan">("omnivore");
  const [allergies, setAllergies] = useState("");
  const [budget, setBudget] = useState<"low" | "medium" | "high">("medium");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    register({
      email,
      password,
      name,
      age,
      gender,
      heightCm,
      weightKg,
      goalWeightKg,
      fitnessLevel,
      goalType,
      activity,
      dietaryPreference,
      allergies,
      budget,
    });
    router.push("/onboarding");
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <CuteRobot isPasswordFocused={isPasswordFocused} />
      <Card className="relative z-20 -mt-8 bg-zinc-950/90 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader
          title="Create your account"
          subtitle="Passwords are stored only in this browser demo — use bcrypt + server session in production."
        />
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-[var(--muted)]">Name</span>
              <Input required value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="text-sm">
              <span className="text-[var(--muted)]">Email</span>
              <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
          </div>
          <label className="block text-sm">
            <span className="text-[var(--muted)]">Password</span>
            <Input 
              required 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-[var(--muted)]">Age</span>
              <Input type="number" min={16} value={age} onChange={(e) => setAge(Number(e.target.value))} />
            </label>
            <div className="text-sm">
              <span className="text-[var(--muted)]">Gender</span>
              <div className="mt-1 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="flex-1"
                  variant={gender === "male" ? "primary" : "secondary"}
                  onClick={() => setGender("male")}
                >
                  Male
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="flex-1"
                  variant={gender === "female" ? "primary" : "secondary"}
                  onClick={() => setGender("female")}
                >
                  Female
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-[var(--muted)]">Height (cm)</span>
              <Input type="number" value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} />
            </label>
            <label className="text-sm">
              <span className="text-[var(--muted)]">Weight (kg)</span>
              <Input type="number" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} />
            </label>
          </div>

          <label className="block text-sm">
            <span className="text-[var(--muted)]">Goal weight (kg)</span>
            <Input type="number" value={goalWeightKg} onChange={(e) => setGoalWeightKg(Number(e.target.value))} />
          </label>

          <label className="block text-sm">
            <span className="text-[var(--muted)]">Primary goal</span>
            <select
              className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-3"
              value={goalType}
              onChange={(e) => setGoalType(e.target.value as GoalType)}
            >
              <option value="loss">Weight loss</option>
              <option value="gain">Weight gain</option>
              <option value="recomp">Body recomposition</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="text-[var(--muted)]">Fitness experience</span>
            <select
              className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-3"
              value={fitnessLevel}
              onChange={(e) => setFitnessLevel(e.target.value as FitnessLevel)}
            >
              <option value="beginner">Beginner (0–6 months)</option>
              <option value="intermediate">Intermediate (6 months–2 years)</option>
              <option value="advanced">Advanced (2+ years)</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="text-[var(--muted)]">Activity level</span>
            <select
              className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-3"
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityLevel)}
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very active</option>
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-[var(--muted)]">Diet</span>
              <select
                className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-3"
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value as typeof dietaryPreference)}
              >
                <option value="omnivore">Non-vegetarian</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="text-[var(--muted)]">Budget</span>
              <select
                className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-zinc-950/50 px-3"
                value={budget}
                onChange={(e) => setBudget(e.target.value as typeof budget)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>

          <label className="block text-sm">
            <span className="text-[var(--muted)]">Allergies / restrictions</span>
            <Input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g. peanuts, dairy" />
          </label>

          <Button type="submit" className="w-full" size="lg">
            Complete registration
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--accent)] hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}

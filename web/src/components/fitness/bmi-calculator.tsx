"use client";

import { useMemo, useState } from "react";
import {
  bmiCategory,
  bmiTips,
  cmFromFeetInches,
  computeBmi,
  kgFromLbs,
} from "@/lib/calculations";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BMIGauge } from "@/components/fitness/bmi-gauge";

type HeightUnit = "cm" | "ft";
type WeightUnit = "kg" | "lb";

export function BMICalculator({ compact }: { compact?: boolean }) {
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [heightCm, setHeightCm] = useState(175);
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(10);
  const [weight, setWeight] = useState(78);
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState<"male" | "female">("male");

  const bmi = useMemo(() => {
    const h =
      heightUnit === "cm" ? heightCm : cmFromFeetInches(feet, inches);
    const w = weightUnit === "kg" ? weight : kgFromLbs(weight);
    return computeBmi(w, h);
  }, [heightUnit, weightUnit, heightCm, feet, inches, weight]);

  const category = bmiCategory(bmi);
  const tips = bmiTips(category);

  return (
    <Card className={compact ? "p-4 sm:p-5" : undefined}>
      <CardHeader
        title="BMI calculator"
        subtitle="Instant category + tips (BMI is a screening tool; not diagnostic)."
      />
      <div className={`grid gap-6 ${compact ? "lg:grid-cols-1" : "lg:grid-cols-2"}`}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={heightUnit === "cm" ? "primary" : "secondary"}
              onClick={() => setHeightUnit("cm")}
            >
              cm
            </Button>
            <Button
              type="button"
              size="sm"
              variant={heightUnit === "ft" ? "primary" : "secondary"}
              onClick={() => setHeightUnit("ft")}
            >
              ft / in
            </Button>
            <span className="mx-2 hidden w-px bg-white/10 sm:block" />
            <Button
              type="button"
              size="sm"
              variant={weightUnit === "kg" ? "primary" : "secondary"}
              onClick={() => setWeightUnit("kg")}
            >
              kg
            </Button>
            <Button
              type="button"
              size="sm"
              variant={weightUnit === "lb" ? "primary" : "secondary"}
              onClick={() => setWeightUnit("lb")}
            >
              lbs
            </Button>
          </div>

          {heightUnit === "cm" ? (
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--muted)]">Height (cm)</span>
              <Input
                type="number"
                min={120}
                max={230}
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
              />
            </label>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1 text-sm">
                <span className="text-[var(--muted)]">Feet</span>
                <Input
                  type="number"
                  min={4}
                  max={7}
                  value={feet}
                  onChange={(e) => setFeet(Number(e.target.value))}
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-[var(--muted)]">Inches</span>
                <Input
                  type="number"
                  min={0}
                  max={11}
                  value={inches}
                  onChange={(e) => setInches(Number(e.target.value))}
                />
              </label>
            </div>
          )}

          <label className="block space-y-1 text-sm">
            <span className="text-[var(--muted)]">Weight ({weightUnit})</span>
            <Input
              type="number"
              min={35}
              max={300}
              step={0.1}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--muted)]">Age</span>
              <Input
                type="number"
                min={16}
                max={100}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
            </label>
            <div className="space-y-1 text-sm">
              <span className="text-[var(--muted)]">Gender</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  className="flex-1"
                  size="sm"
                  variant={gender === "male" ? "primary" : "secondary"}
                  onClick={() => setGender("male")}
                >
                  Male
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  size="sm"
                  variant={gender === "female" ? "primary" : "secondary"}
                  onClick={() => setGender("female")}
                >
                  Female
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <BMIGauge bmi={bmi} />
          <div className="text-center">
            <p className="text-4xl font-bold tracking-tight">{bmi.toFixed(1)}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Category: {category}</p>
          </div>
          <ul className="w-full space-y-2 text-sm text-[var(--muted)]">
            {tips.map((t) => (
              <li key={t} className="rounded-lg bg-white/5 px-3 py-2">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

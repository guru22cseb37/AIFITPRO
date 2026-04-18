"use client";

import { useMemo, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import { useAppStore } from "@/store/use-app-store";
import { Moon, Zap, Brain, TrendingUp, AlertTriangle, CheckCircle, BedDouble, Star } from "lucide-react";

/* ──────────────────────── helpers ──────────────────────── */
function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-zinc-950/40 p-6 shadow-xl backdrop-blur-md ${className}`}>
      {children}
    </div>
  );
}

/** Recovery score 0-100 based on sleep quality, energy, and stress */
function calcRecoveryScore(hoursSlept: number, quality: number, energy: number, stress: number): number {
  const sleepScore = Math.min(hoursSlept / 8, 1) * 40;        // 40 pts max
  const qualityScore = ((quality - 1) / 4) * 30;             // 30 pts max
  const energyScore = ((energy - 1) / 4) * 20;               // 20 pts max
  const stressScore = ((5 - stress) / 4) * 10;               // 10 pts max (inverted)
  return Math.round(sleepScore + qualityScore + energyScore + stressScore);
}

function scoreColor(score: number) {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}

function scoreLabel(score: number) {
  if (score >= 80) return "Fully Recovered";
  if (score >= 60) return "Moderate Recovery";
  if (score >= 40) return "Low Recovery";
  return "Rest Needed";
}

/** SVG arc (half-circle) for sleep visualization */
function SleepArc({ hours, max = 10 }: { hours: number; max?: number }) {
  const r = 70;
  const cx = 90, cy = 90;
  const pct = Math.min(hours / max, 1);
  const startAngle = Math.PI;
  const endAngle = Math.PI + pct * Math.PI;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = pct > 0.5 ? 1 : 0;

  return (
    <svg viewBox="0 0 180 100" className="w-full max-w-[220px]">
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Fill */}
      {hours > 0 && (
        <path
          d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
          fill="none"
          stroke={hours >= 7 ? "#6366f1" : hours >= 5 ? "#f59e0b" : "#ef4444"}
          strokeWidth="12"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 8px rgba(99,102,241,0.6))" }}
        />
      )}
      {/* Goal marker at 8h */}
      <circle
        cx={cx + r * Math.cos(Math.PI + (8 / max) * Math.PI)}
        cy={cy + r * Math.sin(Math.PI + (8 / max) * Math.PI)}
        r="4"
        fill="#22c55e"
        opacity={0.8}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
        {hours > 0 ? hours.toFixed(1) : "—"}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#71717a" fontSize="10">
        hours
      </text>
    </svg>
  );
}

/** Ring for recovery score */
function RecoveryRing({ score }: { score: number }) {
  const r = 54, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <svg viewBox="0 0 128 128" className="w-32 h-32">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 64 64)"
        style={{ filter: `drop-shadow(0 0 8px ${color}80)`, transition: "stroke-dashoffset 1s ease" }}
      />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">{score}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#71717a" fontSize="9">/ 100</text>
    </svg>
  );
}

const RatingBtn = ({ value, selected, onClick, emoji }: { value: number; selected: boolean; onClick: () => void; emoji: string }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex h-10 w-10 flex-col items-center justify-center rounded-xl border text-sm transition-all ${
      selected
        ? "border-[var(--accent)] bg-[var(--accent)]/20 text-white shadow-[0_0_10px_var(--accent-glow)]"
        : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/30"
    }`}
  >
    {emoji}
  </button>
);

const QUALITY_EMOJIS = ["😣", "😕", "😐", "🙂", "😄"];
const ENERGY_EMOJIS  = ["🪫", "😴", "😐", "⚡", "🔥"];
const STRESS_EMOJIS  = ["😌", "🙂", "😐", "😰", "😱"];

const CustomTooltipStyle = {
  background: "rgba(9,9,11,0.95)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  color: "#f4f4f5",
  fontSize: 12,
};

/* ──────────────────────── main page ──────────────────────── */
export default function SleepPage() {
  const sleepLogs = useAppStore((s) => s.sleepLogs);
  const addSleepLog = useAppStore((s) => s.addSleepLog);

  const [hours, setHours] = useState("");
  const [quality, setQuality] = useState<1|2|3|4|5>(3);
  const [energy, setEnergy] = useState<1|2|3|4|5>(3);
  const [stress, setStress] = useState<1|2|3|4|5>(2);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  // Build last-7-days series
  const weekSeries = useMemo(() => {
    const map: Record<string, typeof sleepLogs[0] | undefined> = {};
    sleepLogs.forEach((e) => { map[e.date] = e; });
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      const e = map[key];
      return {
        date: key.slice(5),
        hours: e?.hoursSlept ?? 0,
        recovery: e ? calcRecoveryScore(e.hoursSlept, e.sleepQuality, e.energyLevel, e.stressLevel) : 0,
      };
    });
  }, [sleepLogs]);

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayLog = sleepLogs.find((e) => e.date === todayKey);
  const todayScore = todayLog
    ? calcRecoveryScore(todayLog.hoursSlept, todayLog.sleepQuality, todayLog.energyLevel, todayLog.stressLevel)
    : 0;
  const avgHours = sleepLogs.length
    ? sleepLogs.slice(0, 7).reduce((a, e) => a + e.hoursSlept, 0) / Math.min(sleepLogs.length, 7)
    : 0;

  // Radar data
  const radarData = todayLog
    ? [
        { axis: "Sleep", val: (todayLog.hoursSlept / 9) * 100 },
        { axis: "Quality", val: (todayLog.sleepQuality / 5) * 100 },
        { axis: "Energy", val: (todayLog.energyLevel / 5) * 100 },
        { axis: "Calm", val: ((6 - todayLog.stressLevel) / 5) * 100 },
      ]
    : [];

  function handleSave() {
    const h = parseFloat(hours);
    if (isNaN(h) || h <= 0 || h > 24) return;
    addSleepLog({ hoursSlept: h, sleepQuality: quality, energyLevel: energy, stressLevel: stress, notes: notes.trim() || undefined });
    setSaved(true);
    setHours(""); setNotes("");
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="bg-gradient-to-r from-indigo-400 via-purple-400 to-white bg-clip-text text-4xl font-black tracking-tight text-transparent">
          Sleep & Recovery
        </h1>
        <p className="mt-2 text-sm font-medium text-zinc-400">
          Track your sleep, measure recovery, and unlock peak performance.
        </p>
      </div>

      {/* Low recovery warning */}
      {todayLog && todayScore < 60 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
          <span>
            <strong>Low Recovery Score ({todayScore}/100)</strong> — Consider a lighter workout or a rest day today.
          </span>
        </div>
      )}
      {todayLog && todayScore >= 80 && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
          <CheckCircle className="h-5 w-5 shrink-0 text-green-400" />
          <span><strong>Excellent Recovery ({todayScore}/100)</strong> — You're ready to crush your workout today! 💪</span>
        </div>
      )}

      {/* Top Row */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Log Form */}
        <GlassCard className="lg:col-span-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <Moon className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">Log Tonight's Sleep</h2>
          </div>

          <div className="space-y-5">
            {/* Hours */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">Hours Slept</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="e.g. 7.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white shadow-inner placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Sleep Quality */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">Sleep Quality</label>
              <div className="flex gap-2">
                {([1,2,3,4,5] as const).map((v) => (
                  <RatingBtn key={v} value={v} selected={quality === v} onClick={() => setQuality(v)} emoji={QUALITY_EMOJIS[v-1]} />
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">Morning Energy</label>
              <div className="flex gap-2">
                {([1,2,3,4,5] as const).map((v) => (
                  <RatingBtn key={v} value={v} selected={energy === v} onClick={() => setEnergy(v)} emoji={ENERGY_EMOJIS[v-1]} />
                ))}
              </div>
            </div>

            {/* Stress */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">Stress Level</label>
              <div className="flex gap-2">
                {([1,2,3,4,5] as const).map((v) => (
                  <RatingBtn key={v} value={v} selected={stress === v} onClick={() => setStress(v)} emoji={STRESS_EMOJIS[v-1]} />
                ))}
              </div>
            </div>

            {/* Notes */}
            <textarea
              placeholder="Any notes? (e.g. woke up twice, vivid dreams…)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
            />

            <button
              type="button"
              onClick={handleSave}
              disabled={!hours}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] disabled:opacity-40"
            >
              {saved ? <><CheckCircle className="h-5 w-5" /> Saved!</> : <><BedDouble className="h-5 w-5" /> Save Sleep Log</>}
            </button>
          </div>
        </GlassCard>

        {/* Today's Summary */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* Recovery Ring + Sleep Arc */}
          <GlassCard>
            <h2 className="mb-5 text-lg font-bold">Today's Recovery</h2>
            {todayLog ? (
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div className="flex flex-col items-center gap-2">
                  <RecoveryRing score={todayScore} />
                  <p className={`text-sm font-bold ${scoreColor(todayScore)}`}>{scoreLabel(todayScore)}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <SleepArc hours={todayLog.hoursSlept} />
                  <p className="text-xs text-zinc-500">Green dot = 8h goal</p>
                </div>
                {radarData.length > 0 && (
                  <div className="h-44 w-full max-w-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis dataKey="axis" stroke="#71717a" fontSize={10} />
                        <Radar dataKey="val" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center gap-2 text-center text-zinc-500">
                <Moon className="h-8 w-8 opacity-30" />
                <p className="text-sm">Log tonight's sleep to see your recovery score.</p>
              </div>
            )}
          </GlassCard>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: BedDouble, label: "Avg Sleep", value: avgHours ? `${avgHours.toFixed(1)}h` : "—", color: "text-indigo-400" },
              { icon: Zap,       label: "Logs",      value: `${sleepLogs.length}`,                color: "text-amber-400" },
              { icon: Star,      label: "Best Score", value: sleepLogs.length ? `${Math.max(...sleepLogs.map(e => calcRecoveryScore(e.hoursSlept, e.sleepQuality, e.energyLevel, e.stressLevel)))}` : "—", color: "text-green-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-4">
                <Icon className={`mb-1 h-5 w-5 ${color}`} />
                <p className={`text-xl font-black ${color}`}>{value}</p>
                <p className="text-[10px] font-medium text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7-Day Sleep Chart */}
      <GlassCard>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold">7-Day Sleep Trend</h2>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weekSeries}>
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#52525b" fontSize={11} />
              <YAxis domain={[0, 10]} stroke="#52525b" fontSize={11} unit="h" />
              <Tooltip contentStyle={CustomTooltipStyle} formatter={(v) => [`${v}h`, "Sleep"]} />
              <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2.5} fill="url(#sleepGrad)"
                dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* 7-Day Recovery Chart */}
      <GlassCard>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
            <Brain className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold">7-Day Recovery Score Trend</h2>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weekSeries}>
              <defs>
                <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#52525b" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="#52525b" fontSize={11} />
              <Tooltip contentStyle={CustomTooltipStyle} formatter={(v) => [`${v}`, "Recovery"]} />
              <Area type="monotone" dataKey="recovery" stroke="#22c55e" strokeWidth={2.5} fill="url(#recGrad)"
                dot={{ fill: "#22c55e", r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Sleep Log History */}
      {sleepLogs.length > 0 && (
        <GlassCard>
          <h2 className="mb-5 text-lg font-bold">Sleep History</h2>
          <ul className="space-y-3">
            {sleepLogs.slice(0, 10).map((e) => {
              const score = calcRecoveryScore(e.hoursSlept, e.sleepQuality, e.energyLevel, e.stressLevel);
              return (
                <li key={e.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm transition-all hover:bg-white/10">
                  <div>
                    <p className="font-semibold text-zinc-200">{e.date} &mdash; {e.hoursSlept}h sleep</p>
                    {e.notes && <p className="mt-0.5 text-xs text-zinc-500">{e.notes}</p>}
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-bold ${score >= 80 ? "bg-green-500/15 text-green-400" : score >= 60 ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}>
                    {score}/100
                  </div>
                </li>
              );
            })}
          </ul>
        </GlassCard>
      )}
    </div>
  );
}

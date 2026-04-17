"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SUCCESS_STORIES } from "@/data/success-stories";

const threads = [
  { id: "t1", title: "Best protein sources on a budget?", replies: 24, tag: "Nutrition" },
  { id: "t2", title: "Deload week experiences", replies: 18, tag: "Training" },
  { id: "t3", title: "30-day step challenge — join", replies: 56, tag: "Challenge" },
];

const leaderboard = [
  { name: "You", streak: 0, pts: 120 },
  { name: "Demo User A", streak: 14, pts: 980 },
  { name: "Demo User B", streak: 9, pts: 720 },
];

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Community & motivation</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Stories, challenges, and forum threads — back with PostgreSQL + moderation in production.
        </p>
      </div>

      <Card>
        <CardHeader title="Before / after gallery" subtitle="Curated transformations (demo content)." />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80",
            "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
          ].map((url, i) => (
              <div
                key={url}
                className="aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-800 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${url})`,
                }}
              >
                <div className="flex h-full items-end bg-gradient-to-t from-black/80 to-transparent p-3 text-xs text-white">
                  Story {i + 1}
                </div>
              </div>
            ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Success stories" />
          <ul className="space-y-3">
            {SUCCESS_STORIES.map((s) => (
              <li key={s.id} className="rounded-xl border border-white/10 bg-zinc-950/40 p-3">
                <p className="font-medium">{s.headline}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{s.excerpt}</p>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Leaderboard (demo)" subtitle="Weekly engagement points." />
          <ol className="space-y-2">
            {leaderboard.map((r, idx) => (
              <li
                key={r.name}
                className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm"
              >
                <span>
                  <span className="mr-2 text-[var(--muted)]">{idx + 1}.</span>
                  {r.name}
                </span>
                <span className="text-[var(--accent)]">
                  {r.pts} pts • {r.streak}d streak
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Forum / challenges"
          action={
            <Button type="button" size="sm" variant="secondary">
              New thread (demo)
            </Button>
          }
        />
        <ul className="divide-y divide-white/10">
          {threads.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-xs text-[var(--muted)]">
                  {t.replies} replies • {t.tag}
                </p>
              </div>
              <Button type="button" size="sm" variant="outline">
                Open
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader title="Push notifications" subtitle="Web Push + Firebase FCM when deployed." />
        <p className="text-sm text-[var(--muted)]">
          Enable reminders for workouts, meal timing, and hydration — implement service worker registration + VAPID keys.
        </p>
        <Button type="button" className="mt-3" variant="outline" disabled>
          Enable notifications (requires setup)
        </Button>
      </Card>
    </div>
  );
}

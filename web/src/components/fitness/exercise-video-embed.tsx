"use client";

import { ExternalLink } from "lucide-react";
import { youtubeEmbedSrc, extractYoutubeId, youtubeWatchUrl } from "@/lib/youtube";

type Props = {
  videoUrl: string;
  title: string;
  className?: string;
};

export function ExerciseVideoEmbed({ videoUrl, title, className = "" }: Props) {
  const id = extractYoutubeId(videoUrl);
  const src = id ? youtubeEmbedSrc(videoUrl) : videoUrl;
  const watch = id ? youtubeWatchUrl(id) : videoUrl;

  return (
    <div className={`overflow-hidden rounded-xl border border-white/10 bg-black ${className}`}>
      <div className="aspect-video w-full">
        <iframe
          title={title}
          src={src}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-3 py-2">
        <p className="text-xs text-[var(--muted)]">Tap play on the video. If it doesn’t load, open in YouTube (ad blockers sometimes block embeds).</p>
        <a
          href={watch}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[var(--accent)] hover:underline"
        >
          Open in YouTube <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

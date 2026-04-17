/**
 * Normalize any YouTube URL or raw 11-char ID to a privacy-enhanced embed URL.
 * Embed-friendly: rel=0 reduces suggested videos noise; playsinline helps mobile.
 */
export function extractYoutubeId(input: string): string | null {
  const s = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const u = s.startsWith("http") ? s : `https://${s}`;
  try {
    const url = new URL(u);
    const host = url.hostname.replace("www.", "");
    if (host === "youtu.be") {
      const id = url.pathname.slice(1).slice(0, 11);
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (host.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      const m = url.pathname.match(/\/(embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      if (m?.[2]) return m[2];
    }
  } catch {
    return null;
  }
  return null;
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** Prefer nocookie domain — often more reliable for embedded playback */
export function youtubeEmbedSrc(input: string): string {
  const id = extractYoutubeId(input);
  if (!id) return input;
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    enablejsapi: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

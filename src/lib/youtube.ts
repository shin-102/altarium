export type YTMeta = {
  videoId: string;
  title: string;
  thumbnail: string;
  isLive: boolean;
};

export function extractVideoId(input: string): string | null {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /\/embed\/([a-zA-Z0-9_-]{11})/,
    /\/shorts\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const re of patterns) {
    const m = input.match(re);
    if (m) return m[1];
  }
  return null;
}

/** Fetch title + thumbnail via YouTube oEmbed — no API key required. */
export async function fetchYTMeta(videoId: string): Promise<YTMeta> {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Video not found or unavailable.");
  const data = await res.json();
  return {
    videoId,
    title: data.title ?? "Unknown title",
    thumbnail: data.thumbnail_url ?? `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    // oEmbed doesn't expose live status — we infer from title heuristic
    isLive: /\blive\b|\bradio\b/i.test(data.title ?? ""),
  };
}

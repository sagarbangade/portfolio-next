export type Video = { id: string; title: string; published: string; views: number; likes: number };

export type Channel = { id: string; name: string; url: string; tagline: string; videos: Video[] };

const CHANNELS = [
  { id: "UCd93GgRkwFrNJjROYdWSu2w", url: "https://www.youtube.com/channel/UCd93GgRkwFrNJjROYdWSu2w", tagline: "Vlogs: travel, life and behind the scenes" },
  { id: "UCvevh7-t5vmZW_JPZtksHKQ", url: "https://www.youtube.com/@GameOSbySagar", tagline: "Gaming: streams and play-throughs" },
];

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

/** Latest uploads (up to 15) from each channel's public RSS feed, refreshed hourly. No API key needed. */
export async function getChannels(): Promise<Channel[]> {
  const results = await Promise.all(
    CHANNELS.map(async (c) => {
      try {
        const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${c.id}`, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        const xml = await res.text();
        const name = decode(xml.match(/<title>([^<]*)<\/title>/)?.[1] ?? "YouTube");
        const videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
          id: e.match(/<yt:videoId>([^<]+)/)?.[1] ?? "",
          title: decode(e.match(/<title>([^<]*)/)?.[1] ?? ""),
          published: e.match(/<published>([^<]+)/)?.[1] ?? "",
          views: Number(e.match(/views="(\d+)"/)?.[1] ?? 0),
          likes: Number(e.match(/starRating count="(\d+)"/)?.[1] ?? 0),
        }));
        return { ...c, name, videos: videos.filter((v) => v.id) };
      } catch {
        return null;
      }
    }),
  );
  return results.filter((c): c is Channel => Boolean(c && c.videos.length));
}

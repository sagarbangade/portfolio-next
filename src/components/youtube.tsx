"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Eye, Play, ThumbsUp } from "lucide-react";
import type { Channel, Video } from "@/lib/youtube";

const sorts = {
  latest: { label: "Latest", fn: (a: Video, b: Video) => b.published.localeCompare(a.published) },
  popular: { label: "Most viewed", fn: (a: Video, b: Video) => b.views - a.views },
  liked: { label: "Most liked", fn: (a: Video, b: Video) => b.likes - a.likes },
} as const;

type SortId = keyof typeof sorts;

const compact = new Intl.NumberFormat("en", { notation: "compact" });

export function ChannelShelf({ channel }: { channel: Channel }) {
  const [sort, setSort] = useState<SortId>("latest");
  const [playing, setPlaying] = useState<string | null>(null);
  const videos = [...channel.videos].sort(sorts[sort].fn).slice(0, 3);

  return (
    <div className="rounded-2xl border border-line bg-elev p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <a href={channel.url} target="_blank" rel="noreferrer" className="group min-w-0">
          <p className="flex items-center gap-1.5 font-medium">
            {channel.name} <ArrowUpRight className="size-4 text-subtle group-hover:text-accent" />
          </p>
          <p className="text-sm text-muted">{channel.tagline}</p>
        </a>
        <div role="group" aria-label={`Sort ${channel.name} videos`} className="flex gap-1 rounded-full border border-line p-1">
          {(Object.keys(sorts) as SortId[]).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={sort === id}
              data-testid={`yt-sort-${id}`}
              onClick={() => setSort(id)}
              className={`rounded-full px-3 py-1 text-xs transition ${sort === id ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}
            >
              {sorts[id].label}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {videos.map((v) => (
          <li key={v.id} className="group">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-surface">
              {playing === v.id ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1`}
                  title={v.title}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 size-full border-0"
                />
              ) : (
                <button type="button" onClick={() => setPlaying(v.id)} className="absolute inset-0" aria-label={`Play ${v.title}`}>
                  <Image
                    src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-black/20 opacity-0 transition group-hover:opacity-100">
                    <span className="grid size-11 place-items-center rounded-full bg-accent text-[#0a0a0b]">
                      <Play className="size-5 fill-current" />
                    </span>
                  </span>
                </button>
              )}
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-snug">{v.title}</p>
            <p className="mt-1 flex items-center gap-3 font-mono text-[11px] text-subtle">
              <span className="inline-flex items-center gap-1">
                <Eye className="size-3" /> {compact.format(v.views)}
              </span>
              {v.likes > 0 && (
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="size-3" /> {compact.format(v.likes)}
                </span>
              )}
              <span>{new Date(v.published).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

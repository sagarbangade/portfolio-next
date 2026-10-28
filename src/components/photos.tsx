"use client";

import Image from "next/image";
import type { Photo } from "@/lib/photos";
import { emitSignal, uiStore, useUi } from "@/lib/ui-store";

/** Crossfading portrait with a small switcher: work, formal and the AI-made ninja-mode shots. */
export function PhotoSwitcher({ photos }: { photos: Photo[] }) {
  const activeId = useUi((s) => s.activePhoto);
  const active = photos.find((p) => p.id === activeId) ?? photos[0];
  if (!active) return null;

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-surface sm:aspect-[5/4] lg:aspect-[4/5]" data-testid="photo-frame" data-active={active.id}>
        {photos.map((p, i) => (
          <Image
            key={p.id}
            src={p.src}
            alt={p.alt}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 440px, (min-width: 640px) 90vw, 100vw"
            aria-hidden={p.id !== active.id}
            className={`object-cover transition-[opacity,transform] duration-700 ease-out ${
              p.id === active.id ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
            }`}
            style={{ objectPosition: p.position }}
          />
        ))}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
          <p className="text-sm font-medium text-white drop-shadow">{active.caption}</p>
          {active.ai && (
            <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur">
              AI art
            </span>
          )}
        </div>
      </div>

      {photos.length > 1 && (
        <div role="group" aria-label="Choose a photo" className="flex gap-1.5 border-b border-line p-2.5">
          {photos.map((p) => {
            const on = p.id === active.id;
            return (
              <button
                key={p.id}
                type="button"
                data-testid={`photo-tab-${p.id}`}
                aria-pressed={on}
                onClick={() => {
                  uiStore.setState({ activePhoto: p.id });
                  emitSignal("photo:select", { id: p.id });
                }}
                className={`flex-1 rounded-lg px-2 py-1.5 text-xs transition ${
                  on ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface hover:text-fg"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

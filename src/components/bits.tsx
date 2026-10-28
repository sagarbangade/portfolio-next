"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Command, Copy } from "lucide-react";
import { profile } from "@/lib/data";
import { copyEmail, emitSignal, uiStore, useUi } from "@/lib/ui-store";

/** Rotates through the stack in the hero. */
export function RoleTicker({ words = profile.roles }: { words?: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % words.length), 2200);
    return () => window.clearInterval(id);
  }, [words.length]);
  return (
    <span className="relative inline-flex min-w-[9ch] text-fg" aria-live="polite">
      <span key={i} className="role-in">
        {words[i]}
      </span>
      <span className="caret ml-0.5 text-accent">_</span>
    </span>
  );
}

/** Wall-clock time in Bengaluru, rendered after mount so server and client markup agree. */
function useClock<T>(read: () => T, every: number, fallback: T) {
  return useSyncExternalStore(
    (cb) => {
      const id = window.setInterval(cb, every);
      return () => window.clearInterval(id);
    },
    read,
    () => fallback,
  );
}

export function LocalTime({ withSeconds = false }: { withSeconds?: boolean }) {
  const label = useClock(
    () =>
      new Date().toLocaleTimeString("en-GB", {
        timeZone: profile.timezone,
        hour: "2-digit",
        minute: "2-digit",
        ...(withSeconds ? { second: "2-digit" } : {}),
      }),
    withSeconds ? 1000 : 15000,
    withSeconds ? "--:--:--" : "--:--",
  );
  return (
    <time suppressHydrationWarning className="tabular-nums" data-testid="local-time">
      {label}
    </time>
  );
}

/** Small "it's late/early for me" hint so visitors know when to expect a reply. */
export function AvailabilityHint() {
  const hour = useClock<number | null>(
    () => Number(new Date().toLocaleString("en-GB", { timeZone: profile.timezone, hour: "2-digit", hour12: false })),
    60000,
    null,
  );
  if (hour === null) return null;
  const awake = hour >= 9 && hour < 23;
  return <span className="text-subtle">{awake ? "· usually replies same day" : "· asleep, replies by morning"}</span>;
}

export function CopyEmailButton({ className = "", size = "md" }: { className?: string; size?: "md" | "lg" }) {
  const copied = useUi((s) => s.emailCopied);
  return (
    <button
      type="button"
      data-testid="copy-email"
      onClick={() => copyEmail(profile.email)}
      className={`group inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface font-mono transition hover:border-accent hover:text-fg ${
        size === "lg" ? "px-5 py-3 text-sm sm:text-base" : "px-3.5 py-2 text-xs"
      } ${className}`}
      aria-label={copied ? "Email copied" : `Copy email address ${profile.email}`}
    >
      <span className="truncate">{profile.email}</span>
      <span className="grid size-5 shrink-0 place-items-center text-muted group-hover:text-accent">
        {copied ? <Check className="size-4 text-ok" /> : <Copy className="size-4" />}
      </span>
      <span role="status" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}

export function PaletteHint({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      data-testid="palette-hint"
      onClick={() => {
        uiStore.setState({ paletteOpen: true, menuOpen: false });
        emitSignal("palette:open", { via: "hero" });
      }}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs text-subtle transition hover:text-fg ${className}`}
    >
      <span>Press</span>
      <kbd className="inline-flex items-center gap-0.5 rounded-md border border-line-strong bg-surface px-1.5 py-0.5 font-mono text-[11px] text-muted">
        <Command className="size-3" />K
      </kbd>
      <span>to jump anywhere</span>
    </button>
  );
}

export function EmailCopiedToast() {
  const copied = useUi((s) => s.emailCopied);
  if (!copied) return null;
  return (
    <div
      role="status"
      className="pop-in fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 rounded-full border border-line-strong bg-elev px-4 py-2 text-sm shadow-2xl shadow-black/40"
    >
      <span className="inline-flex items-center gap-2">
        <Check className="size-4 text-ok" /> Email copied. Talk soon!
      </span>
    </div>
  );
}

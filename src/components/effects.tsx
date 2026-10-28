"use client";

import { useEffect, useRef } from "react";
import { sections } from "@/lib/data";
import { emitSignal, uiStore, type Theme } from "@/lib/ui-store";

/** Page-wide behaviour with no markup of its own: reveal-on-scroll, card spotlight, active section, ⌘K, theme sync. */
export function Effects() {
  useEffect(() => {
    const root = document.documentElement;
    uiStore.setState({ theme: (root.dataset.theme as Theme) || "dark" });

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            reveal.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));

    const ids = ["top", ...sections.map((s) => s.id)];
    const spy = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const id = visible.target.id as (typeof ids)[number];
          if (uiStore.getState().activeSection !== id) {
            uiStore.setState({ activeSection: id as never });
            emitSignal("section:active", { id });
          }
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) spy.observe(el);
    });

    const onPointer = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.("[data-spotlight]") as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const open = !uiStore.getState().paletteOpen;
        uiStore.setState({ paletteOpen: open, menuOpen: false });
        if (open) emitSignal("palette:open", { via: "shortcut" });
        return;
      }
      const t = e.target as HTMLElement;
      const typing = t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName);
      if (!typing && e.key === "/" && !uiStore.getState().paletteOpen) {
        e.preventDefault();
        uiStore.setState({ paletteOpen: true, menuOpen: false });
        emitSignal("palette:open", { via: "slash" });
      }
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      reveal.disconnect();
      spy.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return <ScrollProgress />;
}

function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-0.5">
      <div ref={bar} className="h-full origin-left bg-gradient-to-r from-accent to-gold" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}

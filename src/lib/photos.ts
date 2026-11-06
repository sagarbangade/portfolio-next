import { existsSync } from "node:fs";
import { join } from "node:path";

export type Photo = {
  id: string;
  label: string;
  caption: string;
  src: string;
  alt: string;
  /** CSS object-position that keeps the face in frame when the photo is cropped. */
  position: string;
  ai?: boolean;
  /** A transparent cut-out, shown frameless over the page instead of cropped into a box. */
  cutout?: boolean;
};

const catalog: Photo[] = [
  {
    id: "desk",
    label: "Desk",
    caption: "Day job · InspironLabs, Bengaluru",
    src: "/photos/desk.jpg",
    alt: "Sagar Eknath Bangade at an office desk, with a “my ninja way” Naruto poster on the wall behind",
    position: "50% 42%",
  },
];

/** Only the photos that are actually present in /public, so the page never renders a broken image. */
export function getPhotos(): Photo[] {
  return catalog.filter((p) => existsSync(join(process.cwd(), "public", p.src.slice(1))));
}

/**
 * The large portrait in the hero: Sagar's cut-out portrait (transparent PNG) if present, else a
 * hero.* file, else the desk photo. `cutout` tells the hero to float it frameless over the glow.
 * (Avoid .avif or .heic: the Next.js image optimizer can't read every variant of those.)
 */
export function getHeroPhoto(): Photo | undefined {
  const base = {
    id: "hero",
    label: "Portrait",
    caption: "Software Engineer · InspironLabs, Bengaluru",
    alt: "Portrait of Sagar Eknath Bangade",
  };
  for (const [file, cutout] of [["sagar2.png", true], ["sagar.png", true], ["hero.webp", false], ["hero.jpg", false], ["hero.jpeg", false], ["hero.png", false]] as const) {
    const src = `/photos/${file}`;
    if (existsSync(join(process.cwd(), "public", src.slice(1)))) return { ...base, src, position: "55% 22%", cutout };
  }
  return getPhotos()[0];
}

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
  {
    id: "formal",
    label: "Formal",
    caption: "Suited up",
    src: "/photos/formal.jpg",
    alt: "Sagar Eknath Bangade in a charcoal suit, white shirt and navy tie",
    position: "50% 34%",
  },
  {
    id: "shinobi-day",
    label: "Shinobi",
    caption: "Ninja mode, Hidden Leaf village",
    src: "/photos/shinobi-day.jpg",
    alt: "AI-generated portrait of Sagar Eknath Bangade in a cloud-print jacket in an anime-inspired village",
    position: "50% 30%",
    ai: true,
  },
  {
    id: "shinobi-dusk",
    label: "Dusk",
    caption: "Ninja mode, sunset over the village",
    src: "/photos/shinobi-dusk.jpg",
    alt: "AI-generated portrait of Sagar Eknath Bangade at sunset below a mountain carved with faces",
    position: "50% 36%",
    ai: true,
  },
];

/** Only the photos that are actually present in /public, so the page never renders a broken image. */
export function getPhotos(): Photo[] {
  return catalog.filter((p) => existsSync(join(process.cwd(), "public", p.src.slice(1))));
}

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
];

/** Only the photos that are actually present in /public, so the page never renders a broken image. */
export function getPhotos(): Photo[] {
  return catalog.filter((p) => existsSync(join(process.cwd(), "public", p.src.slice(1))));
}

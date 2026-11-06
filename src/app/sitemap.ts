import type { MetadataRoute } from "next";
import { profile } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1, images: [`${siteUrl}/photos/sagar2.png`] },
    { url: `${siteUrl}${profile.resume}`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];
}

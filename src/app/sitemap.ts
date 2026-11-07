import type { MetadataRoute } from "next";
import { siteMeta } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteMeta.url, changeFrequency: "weekly", priority: 1 }];
}

import type { MetadataRoute } from "next";
import { siteMeta } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: `${siteMeta.url}/sitemap.xml`,
  };
}

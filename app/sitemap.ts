import type { MetadataRoute } from "next";
import { caseStudies } from "@/lib/case-studies";
import { siteUrl } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl }, ...caseStudies.map((c) => ({ url: `${siteUrl}/work/${c.slug}` }))];
}

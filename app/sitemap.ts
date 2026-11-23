import type { MetadataRoute } from "next";
import { caseStudies } from "@/lib/case-studies";
import { siteUrl } from "@/lib/content";

export const pages = ["", "/work", "/lab", "/about", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...pages.map((p) => ({ url: `${siteUrl}${p}` })),
    ...caseStudies.map((c) => ({ url: `${siteUrl}/work/${c.slug}` })),
  ];
}

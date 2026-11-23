import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/content";

// Everyone may read everything except the private signature review page and the API. The search and AI crawlers are named so the intent is unmistakable:
// Google (and Gemini), Bing (also DuckDuckGo, Yahoo, Ecosia, ChatGPT search, Copilot), Apple (Safari, Siri,
// Spotlight), OpenAI, Anthropic, Perplexity and others.
const crawlers = [
  "Googlebot",
  "Google-Extended",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
  "DuckDuckBot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "CCBot",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [...crawlers, "*"].map((userAgent) => ({ userAgent, allow: "/", disallow: ["/lab/review", "/api/"] })),
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

import { siteKnowledge } from "@/lib/site-knowledge";

// A plain-text summary for AI assistants and crawlers (the llms.txt convention), built from the same content as the site.
export function GET() {
  return new Response(siteKnowledge(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

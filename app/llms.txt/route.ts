import { caseStudies } from "@/lib/case-studies";
import { about, experience, profile, projects, siteUrl, workshop } from "@/lib/content";

// A plain-text summary for AI assistants and crawlers (the llms.txt convention), built from the same content as the site.
export function GET() {
  const lines = [
    `# ${profile.name}`,
    "",
    `> ${profile.name} is a full-stack engineer and AI systems builder in ${profile.location}, open to remote work. He designs and ships production SaaS, fintech infrastructure and AI-powered products for African businesses.`,
    "",
    ...about.paragraphs,
    "",
    "## Experience",
    ...experience.map((e) => `- ${e.role}, ${e.org}: ${e.detail}`),
    "",
    "## Projects",
    ...projects.map((p) => {
      const page = caseStudies.some((c) => c.slug === p.slug) ? ` Case study: ${siteUrl}/work/${p.slug}` : "";
      const live = p.live ? ` Live: ${p.live}` : "";
      return `- ${p.name} (${p.kind}): ${p.outcome} Built with ${p.stack.join(", ")}.${page}${live}`;
    }),
    "",
    "## In progress",
    ...workshop.map((w) => `- ${w.name} (${w.status.toLowerCase()}): ${w.summary}`),
    "",
    "## Pages",
    `- Work: ${siteUrl}/work`,
    `- About: ${siteUrl}/about`,
    `- Lab (games, signature wall, projects in progress): ${siteUrl}/lab`,
    `- Contact: ${siteUrl}/contact`,
    "",
    "## Contact",
    `- Website: ${siteUrl}`,
    `- Email: ${profile.email}`,
    `- GitHub: ${profile.github}`,
    `- LinkedIn: ${profile.linkedin}`,
    `- X: ${profile.x}`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

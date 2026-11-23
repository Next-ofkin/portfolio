import { caseStudies } from "./case-studies";
import { about, experience, profile, projects, siteUrl, skills, workshop } from "./content";

// Everything the site says about Excel, as plain text. Served at /llms.txt and given to the site assistant as its
// only source of facts, so both always match the pages.
export function siteKnowledge({ detailed = false } = {}) {
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
    ...(detailed
      ? [
          "## Case studies in detail",
          ...caseStudies.flatMap((c) => {
            const p = projects.find((x) => x.slug === c.slug);
            return [
              `### ${p?.name ?? c.slug}`,
              c.summary,
              ...c.problem,
              ...c.built.map((b) => `- ${b.title}: ${b.body}`),
              ...c.numbers.map((n) => `- ${n.value}: ${n.label}`),
              `Stack: ${c.stack.map((g) => `${g.group}: ${g.items.join(", ")}`).join("; ")}.`,
              "",
            ];
          }),
          "## Skills",
          ...skills.map((s) => `- ${s.group}: ${s.items.join(", ")}`),
          "",
        ]
      : []),
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
  return lines.join("\n");
}

// Everything written on the site lives here. Edit this file; you should not need to touch the components.

export const siteUrl = "https://portfolio.dastrings.name.ng";

export const profile = {
  name: "Excel Shogbola",
  title: "Full-Stack Engineer & AI Systems Builder",
  subtitle:
    "I design and ship production SaaS, fintech infrastructure, and AI-powered products for African businesses.",
  location: "Lagos, Nigeria",
  availability: "Open to Remote",
  email: "exceldistrings@gmail.com",
  github: "https://github.com/Next-ofkin",
  githubUser: "Next-ofkin",
  linkedin: "https://www.linkedin.com/in/excel-shogbola-710ba0244",
  x: "https://x.com/exceldastrings",
  xHandle: "@exceldastrings",
};

export const nav = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Open source", href: "#open-source" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export const about = {
  statement: "I build tools that actually get used.",
  paragraphs: [
    "I'm a full-stack engineer in Lagos. I founded Lumenware Technologies, and I'm building Strings Automation, a multi-tenant messaging SaaS for email, SMS and WhatsApp.",
    "At NOLT Finance I work on fintech: loan and payroll systems for real lending teams. Most of what I ship sits on NestJS, Next.js, Fastify, PostgreSQL, Redis and Supabase, with AI APIs (Claude, OpenRouter), Playwright and BullMQ doing the heavy lifting.",
  ],
};

export type VisualKind = "strings" | "loanpilot" | "applied" | "oracle" | "guardrail" | "ippis" | "sisi";

export type Project = {
  slug: string;
  name: string;
  kind: string;
  outcome: string;
  stack: string[];
  visual: VisualKind;
  // How the card is laid out in the Work grid.
  layout: "feature" | "wide" | "half" | "slim";
  span: string; // Tailwind col-span classes (md and up)
  github?: string;
  live?: string;
};

// Outcome lines paraphrase each project's description. Add real numbers and live links when you have them.
export const projects: Project[] = [
  {
    slug: "strings-automation",
    name: "Strings Automation",
    kind: "Multi-tenant messaging SaaS",
    outcome:
      "One platform where African businesses message their customers by email, SMS and WhatsApp, with every tenant's data kept separate.",
    stack: ["NestJS", "React", "PostgreSQL", "WhatsApp API"],
    visual: "strings",
    layout: "feature",
    span: "md:col-span-12",
    github: "https://github.com/Next-ofkin",
  },
  {
    slug: "loanpilot",
    name: "LoanPilot",
    kind: "AI agent for loan verification and credit decisions",
    outcome:
      "An AI autopilot that verifies a borrower's identity and supports the credit decision. Built for the Qwen Cloud Global AI Hackathon.",
    stack: ["NestJS", "Baileys", "Prisma", "Dojah", "Prembly"],
    visual: "loanpilot",
    layout: "half",
    span: "md:col-span-7",
    github: "https://github.com/Next-ofkin",
  },
  {
    slug: "appliaed",
    name: "AppliaED",
    kind: "Job automation SaaS",
    outcome: "Scrapes new jobs, scores each one with AI, and sends the best matches to WhatsApp.",
    stack: ["NestJS", "Vite", "BullMQ", "Playwright", "OpenRouter"],
    visual: "applied",
    layout: "half",
    span: "md:col-span-5",
    github: "https://github.com/Next-ofkin",
  },
  {
    slug: "oracle-na",
    name: "OracleNA",
    kind: "Cloud AI code intelligence platform",
    outcome: "Code intelligence in the cloud, with a graph database (KuzuDB) and Claude working together.",
    stack: ["Next.js", "Fastify", "KuzuDB", "Claude API", "Redis"],
    visual: "oracle",
    layout: "half",
    span: "md:col-span-5",
    github: "https://github.com/Next-ofkin",
  },
  {
    slug: "guardrail-aml",
    name: "GuardRail AML",
    kind: "CBN-compliant AML/CFT SaaS",
    outcome:
      "Helps Nigerian financial institutions meet CBN anti-money-laundering and counter-terrorism-financing rules.",
    stack: ["Fastify", "PostgreSQL", "Redis", "Python AI"],
    visual: "guardrail",
    layout: "half",
    span: "md:col-span-7",
    github: "https://github.com/Next-ofkin",
  },
  {
    slug: "nolt-ippis",
    name: "NOLT IPPIS Intelligence",
    kind: "AI-powered payroll and loan eligibility platform",
    outcome: "Reads IPPIS payroll data to work out who is eligible for a loan, and for how much.",
    stack: ["Next.js", "Supabase", "Claude API", "PostgreSQL"],
    visual: "ippis",
    layout: "wide",
    span: "md:col-span-12",
    github: "https://github.com/Next-ofkin",
  },
  {
    slug: "sisi-igbadun",
    name: "Sisi Igbadun",
    kind: "Nigerian snacks e-commerce",
    outcome: "A snack shop taken from zero to production, with payments through Paystack.",
    stack: ["Next.js 15", "Supabase", "Paystack"],
    visual: "sisi",
    layout: "slim",
    span: "md:col-span-12",
    github: "https://github.com/Next-ofkin",
  },
];

export const skills: { group: string; items: string[] }[] = [
  { group: "Frontend", items: ["Next.js", "React", "Vite"] },
  { group: "Backend", items: ["NestJS", "Fastify", "Node.js"] },
  { group: "Data and infrastructure", items: ["PostgreSQL", "Supabase", "Prisma", "Redis", "Railway"] },
  { group: "AI and automation", items: ["Claude API", "OpenRouter", "Playwright", "BullMQ", "Baileys"] },
];

export const experience: { org: string; role: string; detail: string }[] = [
  { org: "Lumenware Technologies", role: "Founder", detail: "Building SaaS products." },
  { org: "NOLT Finance", role: "Fintech Engineer", detail: "Loan systems, IPPIS and credit tools." },
  {
    org: "Open source and personal products",
    role: "Independent",
    detail: "Including autoApply-ng and VerifyFlow.",
  },
];

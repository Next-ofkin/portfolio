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
  { label: "About", href: "/#about" },
  { label: "Work", href: "/#work" },
  { label: "Open source", href: "/#open-source" },
  { label: "Lab", href: "/#lab" },
  { label: "Skills", href: "/#skills" },
  { label: "Experience", href: "/#experience" },
  { label: "Contact", href: "/#contact" },
];

export const about = {
  statement: "I build tools that actually get used.",
  paragraphs: [
    "I'm a full-stack engineer in Lagos. I founded Lumenware Technologies, and I'm building Strings Automation, a multi-tenant messaging SaaS for email, SMS and WhatsApp.",
    "At NOLT Finance I work on fintech: loan and payroll systems for real lending teams. Most of what I ship sits on NestJS, Next.js, Fastify, PostgreSQL, Redis and Supabase, with AI APIs (Claude, OpenRouter), Playwright and BullMQ doing the heavy lifting.",
  ],
};

export type VisualKind =
  | "strings"
  | "handgraph"
  | "verifyflow"
  | "loanpilot"
  | "applied"
  | "oracle"
  | "guardrail"
  | "ippis"
  | "sisi";

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
  // Private codebase: no public repo link, offer a walkthrough instead.
  private?: boolean;
  live?: string;
  // Has a case-study page at /work/<slug> (see lib/case-studies.ts).
  caseStudy?: boolean;
  // Short proof points shown on the card.
  facts?: string[];
};

// Outcome lines paraphrase each project's description. Add real numbers and live links when you have them.
export const projects: Project[] = [
  {
    slug: "strings-automation",
    name: "Strings Automation",
    kind: "Multi-tenant messaging SaaS",
    outcome:
      "One platform where African businesses message their customers by email, SMS and WhatsApp, with a drag-and-drop automation builder and every tenant's data kept separate.",
    stack: ["NestJS", "React", "PostgreSQL", "BullMQ", "WhatsApp API"],
    visual: "strings",
    layout: "feature",
    span: "md:col-span-12",
    private: true,
    caseStudy: true,
    facts: ["3 channels", "HubSpot + Salesforce sync", "Paystack + Stripe billing"],
  },
  {
    slug: "hand-graph",
    name: "Hand Graph",
    kind: "Codebase explorer you control with your hands",
    outcome:
      "Turns any GitHub repo into a living map of its files, explained in plain English. Pinch, turn and throw files to your phone with your hands in the air, or walk through it as a 3D code city.",
    stack: ["JavaScript", "MediaPipe", "Three.js", "Supabase Realtime", "OpenRouter"],
    visual: "handgraph",
    layout: "wide",
    span: "md:col-span-12",
    private: true,
    live: "https://hand-graph.vercel.app",
    caseStudy: true,
    facts: ["Webcam hand control", "3D code city", "AI presenter"],
  },
  {
    slug: "verifyflow",
    name: "VerifyFlow",
    kind: "Loan verification for salary lenders",
    outcome:
      "Upload a bank statement and payslip; get hidden debts, true debt-to-income, the maximum safe loan and a risk level in minutes.",
    stack: ["Python", "FastAPI", "Next.js", "Postgres (Neon)", "Cloudflare R2"],
    visual: "verifyflow",
    layout: "half",
    span: "md:col-span-7",
    private: true,
    caseStudy: true,
    facts: ["330 tests", "₦143,000/mo hidden debt caught in the demo case"],
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
    private: true,
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
    private: true,
  },
  {
    slug: "nolt-ippis",
    name: "NOLT IPPIS Intelligence",
    kind: "AI-powered payroll and loan eligibility platform",
    outcome: "Reads IPPIS payroll data to work out who is eligible for a loan, and for how much.",
    stack: ["Next.js", "Supabase", "Claude API", "PostgreSQL"],
    visual: "ippis",
    layout: "half",
    span: "md:col-span-7",
    private: true,
  },
  {
    slug: "loanpilot",
    name: "LoanPilot",
    kind: "AI agent for loan verification and credit decisions",
    outcome:
      "An AI autopilot that verifies a borrower's identity and supports the credit decision. Built for the Qwen Cloud Global AI Hackathon.",
    stack: ["NestJS", "Baileys", "Prisma", "Dojah", "Prembly"],
    visual: "loanpilot",
    layout: "slim",
    span: "md:col-span-12",
    private: true,
  },
  {
    slug: "guardrail-aml",
    name: "GuardRail AML",
    kind: "CBN-compliant AML/CFT SaaS",
    outcome:
      "Helps Nigerian financial institutions meet CBN anti-money-laundering and counter-terrorism-financing rules.",
    stack: ["Fastify", "PostgreSQL", "Redis", "Python AI"],
    visual: "guardrail",
    layout: "slim",
    span: "md:col-span-12",
    private: true,
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
    private: true,
  },
];

// Shown in the "Now building" ticker alongside live GitHub activity. Keep these true and current.
export const nowBuilding = [
  "Designing Hand Glove, a pair of wireless sensing gloves for Hand Graph",
  "Building Strings Automation, messaging for African businesses",
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
    detail: "Including Hand Graph, VerifyFlow and autoApply-ng.",
  },
];

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
  { label: "Work", href: "/work" },
  { label: "Lab", href: "/lab" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const about = {
  statement: "I build tools that actually get used.",
  paragraphs: [
    "I'm a full-stack engineer in Lagos. I founded Lumenware Technologies, and I'm building Strings Automation, a multi-tenant messaging SaaS for email, SMS and WhatsApp.",
    "At NOLT Finance I'm a verification officer and software developer: I verify borrowers in the field and build the tools the lending team uses every day. Most of what I ship sits on NestJS, Next.js, Fastify, PostgreSQL, Redis and Supabase, with AI APIs (Claude, OpenRouter), Playwright and BullMQ doing the heavy lifting.",
  ],
};

export type VisualKind =
  "strings" | "handgraph" | "verifyflow" | "loanpilot" | "applied" | "oracle" | "guardrail" | "ippis" | "sisi" | "autoapply" | "dastrings" | "benniepocket" | "royalty";

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
      "One platform where African businesses message their customers by email, SMS and WhatsApp, with every tenant's data kept separate. I led a team of three and built the frontend.",
    stack: ["NestJS", "React", "PostgreSQL", "BullMQ", "WhatsApp API"],
    visual: "strings",
    layout: "feature",
    span: "md:col-span-12",
    private: true,
    caseStudy: true,
    facts: ["3 channels", "Team of 3, I led it", "Built the frontend"],
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
    slug: "ai-model-royalty-protocol",
    name: "AI Model Royalty Protocol",
    kind: "On-chain licensing and royalties for AI models",
    outcome:
      "AI builders register a model and set a price per inference. Users buy credits in USDC, and one smart contract pays the creator 98% in the same transaction. Runs on Base, Ethereum and Polygon.",
    stack: ["Solidity", "OpenZeppelin", "Next.js 14", "TypeScript", "wagmi + viem", "RainbowKit", "Tailwind CSS"],
    visual: "royalty",
    layout: "feature",
    span: "md:col-span-12",
    github: "https://github.com/Next-ofkin/ai-model-royalty-protocol",
    caseStudy: true,
    facts: ["98% to the creator, same transaction", "3 EVM chains", "Open source"],
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
    slug: "autoapply-ng",
    name: "autoApply-ng",
    kind: "Job application automation",
    outcome:
      "Pulls jobs from five job boards, scores each one against your CV and sends WhatsApp alerts every six hours. Version one cut AI cost with a two-layer match: local embeddings filter first, then Llama 3.3 70B explains the fit.",
    stack: ["Next.js 16", "NestJS 11", "BullMQ", "Redis", "Supabase", "Turborepo"],
    visual: "autoapply",
    layout: "half",
    span: "md:col-span-7",
    github: "https://github.com/Next-ofkin/autoApply-ng",
  },
  {
    slug: "dastrings",
    name: "DaStrings",
    kind: "Web design studio and template platform",
    outcome:
      "Businesses preview a template site and claim it, then edit it and see their orders themselves. Social posts go out automatically, with an email alert on every success or failure.",
    stack: ["Next.js", "Vercel", "Resend", "Metricool"],
    visual: "dastrings",
    layout: "half",
    span: "md:col-span-5",
    private: true,
    live: "https://dastrings.name.ng",
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
    slug: "benniepocket",
    name: "Benniepocket",
    kind: "Multi-tenant savings SaaS",
    outcome: "Savings software built for many businesses at once, each with its own separate data.",
    stack: [],
    visual: "benniepocket",
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

// The Lab's "In the workshop": real projects in progress. Keep each status honest and current.
export const workshop: { name: string; status: string; summary: string; stack: string[] }[] = [
  {
    name: "Hand Glove",
    status: "Design and documentation",
    summary:
      "A pair of wireless sensing gloves for Hand Graph: finger joints, hand rotation and thumb-to-finger contacts, each glove with its own rechargeable wrist pod.",
    stack: ["Microcontrollers", "IMU sensors", "Wireless receiver", "Hand Graph"],
  },
  {
    name: "AI Electronics Builder",
    status: "Phase 1",
    summary:
      "Design, wire and test electronics in the browser. An AI planner designs the circuit, simulates it and fixes its own mistakes, starting with power banks and mini drones.",
    stack: ["Next.js", "React Flow", "Python", "FastAPI", "OpenRouter"],
  },
  {
    name: "JARVIS",
    status: "In development",
    summary:
      "A personal AI assistant running on a Linux VPS. Its career agent finds jobs, scores each one against real experience and prepares the application, with approval before anything is sent.",
    stack: ["Python", "FastAPI", "PostgreSQL", "Playwright"],
  },

  {
    name: "Mementrail",
    status: "Early build",
    summary:
      "An offline-first journal for text, photos and voice that turns everyday moments into useful reflections. Your journal works without the cloud.",
    stack: ["Expo", "React Native", "SQLite", "Supabase"],
  },
];

export const skills: { group: string; items: string[] }[] = [
  { group: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vite"] },
  { group: "Backend", items: ["NestJS", "Fastify", "Node.js", "Python"] },
  { group: "Data and infrastructure", items: ["PostgreSQL", "Supabase", "Redis", "Docker", "Railway"] },
  { group: "AI and automation", items: ["Claude API", "OpenRouter", "Embeddings", "BullMQ", "Playwright"] },
];

export const experience: { org: string; role: string; period: string; detail: string }[] = [
  {
    org: "NOLT Finance",
    role: "Verification Officer & Software Developer",
    period: "2024 to now",
    detail:
      "Built internal tools for loan operations (verification workflows, automated borrower emails, digital certificates), cutting manual processing by about 30%. Field verification and credit assessment on IPPIS and Remita salary loans.",
  },
  {
    org: "Lumenware Technologies",
    role: "Founder & Lead Developer",
    period: "2024 to now",
    detail:
      "Leads product and engineering across its SaaS products, including the Strings Automation team. Also runs DaStrings, a web design studio for small businesses.",
  },
  {
    org: "Payva Innovations",
    role: "Full Stack Developer (contract)",
    period: "Feb 2026 to now",
    detail:
      "Moved the escrow backend into a standalone NestJS service on Supabase with scheduled pg_cron jobs, and built an admin platform with five staff roles, dispute resolution and audit logs.",
  },
  {
    org: "Earlier",
    role: "Data and digital marketing",
    period: "2020 to 2023",
    detail:
      "Data analyst and digital manager at RCCG Throne of Mercy (online engagement up about 50%), and digital marketing strategist at Yessboss Clothing (online sales up about 40%).",
  },
];

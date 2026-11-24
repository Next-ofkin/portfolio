// Long-form write-ups for /work/<slug>. Every fact here comes from the project's own repository docs.

export type ArchNode = {
  id: string;
  label: string;
  sub?: string;
  col: number; // 0-4, left to right
  row: number; // 0-3, top to bottom
  tone?: "accent" | "gold" | "dim";
};

export type CaseStudy = {
  slug: string;
  summary: string;
  role?: string; // Excel's part, when the work was a team effort
  builtTitle?: string;
  problem: string[];
  built: { title: string; body: string }[];
  numbers: { value: string; label: string }[];
  arch: { nodes: ArchNode[]; edges: [string, string][]; caption: string };
  stack: { group: string; items: string[] }[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "strings-automation",
    role: "I led a team of three (me, a backend developer and an infrastructure teammate): I set the plan, split ownership by area, reviewed all work through GitHub, and built the frontend.",
    builtTitle: "What the team built",
    summary:
      "A multi-tenant platform that lets African businesses, starting with Nigerian microfinance banks, SMBs, clinics and estate agencies, reach their customers by email, SMS and WhatsApp from one place.",
    problem: [
      "Businesses that talk to customers at scale juggle three providers, three dashboards and a spreadsheet of contacts. In Nigeria, SMS needs an approved sender ID, and bulk email from a new domain gets a sender flagged fast.",
      "I wanted one product where a team imports contacts once, draws an automation once, and lets it run across every channel, with each business's data kept completely apart.",
    ],
    built: [
      {
        title: "A real multi-tenant core",
        body: "Complete data isolation per organisation, branded subdomains, and four team roles: owner, admin, editor and viewer.",
      },
      {
        title: "A visual automation builder",
        body: "Drag-and-drop workflows built on React Flow, plus a drag-and-drop email designer. Campaigns run once or on a schedule.",
      },
      {
        title: "Bulk email that protects its reputation",
        body: "Mail goes out in batches every 30 minutes, within each provider's limits. Bounce and complaint rates are watched, sending pauses on its own when they degrade, and every organisation has a daily cap.",
      },
      {
        title: "SMS and WhatsApp that work in Nigeria",
        body: "Termii for Nigerian SMS with approved sender IDs, Twilio internationally, and the WhatsApp Business Cloud API.",
      },
      {
        title: "CRM sync and billing",
        body: "HubSpot and Salesforce over OAuth with real-time webhooks. Paystack for Nigeria, Stripe internationally, and pay-as-you-go credits for SMS and WhatsApp.",
      },
    ],
    numbers: [
      { value: "3", label: "channels from one inbox: email, SMS, WhatsApp" },
      { value: "4", label: "team roles per organisation" },
      { value: "30 min", label: "email batches, paused automatically if bounces rise" },
      { value: "2", label: "CRMs synced live: HubSpot and Salesforce" },
    ],
    arch: {
      caption:
        "The React app talks to one NestJS API. Sending happens in BullMQ workers off Redis, so a big campaign never blocks the app.",
      nodes: [
        { id: "web", label: "Web app", sub: "React + Vite", col: 0, row: 1, tone: "accent" },
        { id: "api", label: "API", sub: "NestJS + JWT", col: 1, row: 1, tone: "accent" },
        { id: "db", label: "PostgreSQL", sub: "Prisma", col: 2, row: 0, tone: "dim" },
        { id: "queue", label: "Queues", sub: "Redis + BullMQ", col: 2, row: 1, tone: "dim" },
        { id: "crm", label: "CRM sync", sub: "HubSpot, Salesforce", col: 2, row: 2, tone: "gold" },
        { id: "workers", label: "Send workers", sub: "batching, rate limits", col: 3, row: 1, tone: "accent" },
        { id: "pay", label: "Billing", sub: "Paystack, Stripe", col: 1, row: 2, tone: "gold" },
        { id: "email", label: "Email", sub: "Resend", col: 4, row: 0, tone: "gold" },
        { id: "sms", label: "SMS", sub: "Termii, Twilio", col: 4, row: 1, tone: "gold" },
        { id: "wa", label: "WhatsApp", sub: "Cloud API", col: 4, row: 2, tone: "gold" },
      ],
      edges: [
        ["web", "api"],
        ["api", "db"],
        ["api", "queue"],
        ["api", "crm"],
        ["api", "pay"],
        ["queue", "workers"],
        ["workers", "email"],
        ["workers", "sms"],
        ["workers", "wa"],
      ],
    },
    stack: [
      {
        group: "Backend",
        items: ["NestJS", "TypeScript", "PostgreSQL", "Prisma", "Redis", "BullMQ", "Passport + JWT"],
      },
      { group: "Frontend", items: ["React 18", "Vite", "Mantine", "TanStack Query", "Zustand", "React Flow"] },
      {
        group: "Services",
        items: ["Resend", "Termii", "Twilio", "WhatsApp Cloud API", "Paystack", "Stripe", "Sentry"],
      },
    ],
  },
  {
    slug: "verifyflow",
    summary:
      "Loan verification for salary lenders. A credit officer uploads a bank statement and a payroll file or payslip, and in minutes gets the hidden debts, the true debt-to-income, the maximum safe loan and a risk level. It advises; people decide.",
    problem: [
      "Salary lenders lend against government payroll (IPPIS). The borrower's payslip looks healthy, but the bank statement tells the truth: repayments to other lenders that never show up on the application.",
      "Reading PDF statements and payroll sheets by hand is slow, and the costly debts are the ones a tired reviewer misses.",
    ],
    built: [
      {
        title: "Hidden Debt Check",
        body: "Parses bank statements and finds recurring repayments to other lenders, then works out true debt-to-income and the largest loan the person can safely carry.",
      },
      {
        title: "IPPIS three-month check",
        body: "Imports monthly IPPIS pay sheets in all three real layouts and flags 11 kinds of finding: missing from the latest month, net pay down more than 10%, rising deductions, name mismatches, salary paid to a dependant and more.",
      },
      {
        title: "Built like a bank would want",
        body: "Every upload is virus-scanned and the server fails closed without a scanner. Files are read in a separate process with time and memory limits. Account numbers are stored only as HMAC hashes, and lender files are encrypted.",
      },
      {
        title: "A workspace for credit officers",
        body: "Cases, decisions and overrides with an audit log, PDF and Word reports, sign-in codes and idle sign-out after 15 minutes, plus API keys and webhooks for lenders who integrate.",
      },
      {
        title: "One database per lender",
        body: "Each lender gets its own Neon Postgres project, provisioned automatically, with uploads in a private Cloudflare R2 bucket.",
      },
    ],
    numbers: [
      { value: "330", label: "automated tests passing" },
      { value: "₦143k", label: "a month of hidden debt found in the demo borrower" },
      { value: "11", label: "IPPIS checks across three months of payroll" },
      { value: "0", label: "raw account numbers stored" },
    ],
    arch: {
      caption:
        "Uploads pass a virus scan and a sandboxed parser before any check runs. Each lender's data lives in its own database.",
      nodes: [
        { id: "web", label: "Officer app", sub: "Next.js", col: 0, row: 1, tone: "accent" },
        { id: "api", label: "Engine API", sub: "Python, FastAPI", col: 1, row: 1, tone: "accent" },
        { id: "scan", label: "Virus scan", sub: "ClamAV, fails closed", col: 2, row: 0, tone: "gold" },
        { id: "parse", label: "Parser sandbox", sub: "30 s, 512 MB limits", col: 2, row: 1, tone: "dim" },
        { id: "checks", label: "Checks", sub: "debt, DTI, IPPIS", col: 3, row: 1, tone: "accent" },
        { id: "report", label: "Report", sub: "PDF, Word, webhook", col: 4, row: 1, tone: "gold" },
        { id: "control", label: "Control DB", sub: "users, audit log", col: 1, row: 2, tone: "dim" },
        { id: "lender", label: "Lender DB", sub: "Neon, one per lender", col: 3, row: 2, tone: "dim" },
        { id: "files", label: "Files", sub: "R2, encrypted", col: 2, row: 2, tone: "dim" },
      ],
      edges: [
        ["web", "api"],
        ["api", "scan"],
        ["api", "parse"],
        ["parse", "checks"],
        ["checks", "report"],
        ["api", "control"],
        ["api", "files"],
        ["checks", "lender"],
      ],
    },
    stack: [
      { group: "Engine", items: ["Python 3.11", "FastAPI", "pdfplumber", "openpyxl", "SQLAlchemy", "Alembic"] },
      { group: "App", items: ["Next.js", "React 19", "TypeScript"] },
      { group: "Infrastructure", items: ["Neon Postgres", "Cloudflare R2", "ClamAV", "Resend", "Railway"] },
    ],
  },
  {
    slug: "hand-graph",
    summary:
      "See how any codebase is built: its real folders and files, explained in plain English, on a map you can steer with your hands in the air through the webcam.",
    problem: [
      "Explaining a codebase to a new developer, a client or an investor usually means scrolling a file tree and hoping the README is current. Neither shows how the pieces connect.",
      "I wanted to point at a project and walk someone through it, the way you'd walk them through a building.",
    ],
    built: [
      {
        title: "A living map of the code",
        body: "Folders become bubbles and files become dots, coloured by what they do: page, API endpoint, UI, test, config. Click a file to light up what it uses and what uses it, with a warning on busy files.",
      },
      {
        title: "Plain-English descriptions",
        body: "Taken from each file's own header comment, from Next.js routing rules, or written by a free AI model when a file has neither.",
      },
      {
        title: "Hands in the air",
        body: "MediaPipe hand tracking in the browser. Each hand gets its own job: one is the mouse, the other turns and zooms. Pinch to pick up a file, crumple it into a ball, flick it into the bin.",
      },
      {
        title: "Throw files to your phone",
        body: "Scan a QR code and your phone, tablet or TV joins. Pinch a file and flick it toward that screen; it lands there and sends back a receipt. About 200 screens can join at once.",
      },
      {
        title: "3D code city and an AI presenter",
        body: "Folders become districts and files become buildings. Pick an audience and a length, and the AI writes the talk from the real files and drives the map, step by step, out loud.",
      },
    ],
    numbers: [
      { value: "2", label: "hands, each with its own job" },
      { value: "~200", label: "phones, tablets or TVs on one session" },
      { value: "5–20 s", label: "to map any GitHub repo" },
      { value: "$0", label: "AI cost, on free OpenRouter models" },
    ],
    arch: {
      caption:
        "Hand tracking runs entirely in the browser. The server only reads repositories and relays AI calls; screens talk through Supabase Realtime and nothing is stored.",
      nodes: [
        { id: "cam", label: "Webcam", sub: "stays on device", col: 0, row: 0, tone: "dim" },
        { id: "hands", label: "Hand tracking", sub: "MediaPipe, in browser", col: 1, row: 0, tone: "accent" },
        { id: "gh", label: "GitHub repo", sub: "any, public or private", col: 0, row: 2, tone: "gold" },
        { id: "read", label: "Repo reader", sub: "Vercel function", col: 1, row: 2, tone: "dim" },
        { id: "map", label: "Code map", sub: "2D map + 3D city", col: 2, row: 1, tone: "accent" },
        { id: "ai", label: "AI", sub: "OpenRouter, server-side key", col: 3, row: 0, tone: "gold" },
        { id: "rt", label: "Realtime", sub: "Supabase, nothing stored", col: 3, row: 2, tone: "dim" },
        { id: "phone", label: "Phone, tablet, TV", sub: "catches thrown files", col: 4, row: 2, tone: "gold" },
      ],
      edges: [
        ["cam", "hands"],
        ["hands", "map"],
        ["gh", "read"],
        ["read", "map"],
        ["map", "ai"],
        ["map", "rt"],
        ["rt", "phone"],
      ],
    },
    stack: [
      { group: "In the browser", items: ["JavaScript", "MediaPipe Hands", "Three.js", "SVG"] },
      { group: "Server", items: ["Vercel Functions", "GitHub API", "OpenRouter"] },
      { group: "Realtime", items: ["Supabase Realtime", "QR pairing"] },
    ],
  },
];

// Excel's CV as plain text, for the site assistant (phone number left out on purpose).
// Update this when the CV changes; leave it empty to leave the CV out.
export const cv = `
EXCEL L. SHOGBOLA
Full Stack Developer · Node.js, Next.js & AI-Assisted Engineering
Lagos, Nigeria (GMT+1) · Open to remote · Contact through the website: https://portfolio.dastrings.name.ng/contact
github.com/Next-ofkin | linkedin.com/in/excel-shogbola-710ba0244 | dastrings.name.ng

PROFILE
Full stack developer who builds and ships complete web products end to end: Next.js and React frontends, NestJS
and Fastify APIs, PostgreSQL and Redis data layers, background workers, and cloud deployment. I work in the
lending industry, which gives me rare domain depth in fintech, verification and compliance. I use LLM coding agents
in a disciplined build-and-review workflow, which lets me deliver fast while keeping architecture, security and code
quality under my control. Founder of Lumenware Technologies, building SaaS products for Nigerian and African
businesses.

TECHNICAL SKILLS

Frontend          Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, Mantine UI, Zustand, Vite, PWA
Backend           Node.js, NestJS, Fastify, Express, REST API design, Swagger/OpenAPI, JWT/OAuth, RBAC, webhooks,
 Python
Data              PostgreSQL (Neon, Supabase, Railway), Redis, BullMQ job queues, MongoDB, Firebase, Cloudflare R2
DevOps            Git/GitHub, GitHub Actions, Docker, Vercel, Railway, Render, Linux VPS, DNS & SSL, Sentry, monorepos
 (pnpm + Turborepo)
AI                Claude, Gemini, Llama (Groq) APIs, embeddings (sentence-transformers), prompt design, structured
 LLM output, LLM coding agents
Integrations      Paystack, Gmail API, WhatsApp, Twilio, Termii, ZeptoMail, Resend, Dojah/Prembly, Make.com,
 Playwright

EXPERIENCE

Verification Officer & Software Developer · NOLT Finance Loan & Investment Co.                            2024 – Present
Lagos, Nigeria · Lending & financial services
• Built internal tools for the company’s loan operations, including verification workflows, automated borrower
 emails and digital certificate generation, reducing manual processing time by about 30%.
• Carry out field verification and credit assessment, and write structured loan verification reports for management,
 giving me first-hand knowledge of lending risk and IPPIS/Remita salary loans.
• Turned daily verification pain points into product ideas, including VerifyFlow, a hidden-debt check tool for small
 lenders.

Founder & Lead Developer · Lumenware Technologies                                                         2024 – Present
Lagos, Nigeria · SaaS products for African fintech and SMEs
• Lead product and engineering for a portfolio of SaaS products (below): planning, architecture, build, deployment
 and client pitches.
• Led the Strings Automation team (backend developer + infrastructure teammate): set the plan, split ownership by
 area, and reviewed all work through GitHub.
• Run DaStrings, a web design studio that builds modern, mobile-first websites for small businesses on a reusable
 template platform.

Full Stack Developer (Contract) · Payva Innovations Ltd                                              Feb 2026 – Present
Escrow & payments platform
• Migrated the escrow backend from a Next.js/Vercel setup into a standalone NestJS service on Supabase,
 including scheduled jobs with pg_cron.
• Built an internal admin platform with role-based access for five staff roles, a dispute resolution module and
 paginated audit logs.

Data Analyst & Digital Manager · RCCG Throne of Mercy                                                        2022 – 2023
• Used data-driven campaigns and reporting to grow online engagement by about 50%.
Digital Marketing Strategist · Yessboss Clothing                                                             2020 – 2022
• Planned and ran digital campaigns that grew online sales by about 40%.

SELECTED PROJECTS

autoApply-ng V2 — job application automation Next.js 16 · NestJS 11 · BullMQ · Redis · Supabase · Railway · Turborepo
• Monorepo with three services (web app, API, worker). Pulls jobs from 5 job boards, scores them against the
 user’s CV and sends WhatsApp alerts every 6 hours.
• V1 used a two-layer AI match: local embeddings filter jobs first, then Llama 3.3 70B (Groq) explains the fit, cutting
 LLM cost and time.
Strings Automation — multi-tenant messaging SaaS React · Vite · TypeScript · Mantine · NestJS · PostgreSQL
• Email, SMS and WhatsApp messaging for African businesses from one dashboard, with each business’s data kept
 separate. I built the frontend and led the product.
VerifyFlow — loan verification API for lenders Node.js · Neon Postgres · Cloudflare R2 · Railway
• Helps small salary lenders find hidden debts before approving loans. The system advises; the credit officer
 makes the final decision and records the reason.
DaStrings — website template platform Next.js · Vercel · Resend · Metricool
• Template sites businesses can preview and claim, with owner editing and order views; automated social posting
 with email alerts on every success or failure.
Other builds
• Sisi Igbadun (live e-commerce, Next.js + Supabase + Paystack) · OracleNA (AI code intelligence) · Benniepocket
 (multi-tenant savings SaaS) · GuardRail (AML compliance dashboard) · JARVIS (personal AI assistant on a Linux
 VPS).

EDUCATION & CERTIFICATIONS

Higher National Diploma (HND), Mechanical Engineering · The Polytechnic of Ibadan                                   2025
Certifications: IT Support · Cybersecurity Fundamentals · Microsoft Excel (Expert)
Languages: English (fluent), Yoruba (fluent)
`;

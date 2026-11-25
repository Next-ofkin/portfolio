import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Architecture } from "@/components/Architecture";
import { Magnetic } from "@/components/Magnetic";
import { ProjectVisual } from "@/components/ProjectVisual";
import { Reveal } from "@/components/Reveal";
import { SiteShell } from "@/components/SiteShell";
import { caseStudies } from "@/lib/case-studies";
import { projects, siteUrl } from "@/lib/content";

const find = (slug: string) => {
  const study = caseStudies.find((c) => c.slug === slug);
  const project = projects.find((p) => p.slug === slug);
  return study && project ? { study, project } : null;
};

// All case studies are prerendered at build time; the page reads params at the top on purpose.
export const instant = false;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = find(slug);
  if (!found) return {};
  const title = `${found.project.name}, a case study`;
  return {
    title,
    description: found.study.summary,
    alternates: { canonical: `${siteUrl}/work/${slug}` },
    openGraph: { title, description: found.study.summary, url: `${siteUrl}/work/${slug}` },
  };
}

const linkClass =
  "font-medium underline decoration-line-strong decoration-2 underline-offset-[6px] transition-colors hover:decoration-gold";

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-[clamp(1.9rem,4.5vw,3.25rem)] font-semibold leading-none tracking-[-0.04em]">
      {children}
    </h2>
  );
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const found = find(slug);
  if (!found) notFound();
  const { study, project } = found;
  const i = caseStudies.findIndex((c) => c.slug === slug);
  const next = projects.find((p) => p.slug === caseStudies[(i + 1) % caseStudies.length].slug);

  return (
    <SiteShell>
      <article>
        <header className="pt-14 pb-16 md:pt-24 md:pb-24">
          <Link href="/work" className={`text-muted ${linkClass}`}>
            All work
          </Link>
          <p className="hero-in mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 font-medium text-accent-soft">
            {project.kind}
            {project.private && (
              <span className="rounded-full border border-gold/40 px-2.5 py-0.5 text-xs text-gold">
                Private codebase
              </span>
            )}
          </p>
          <h1 className="hero-line mt-4 font-display text-[clamp(3.2rem,11vw,8.5rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
            <span>{project.name}</span>
          </h1>
          <p className="hero-in mt-8 max-w-2xl text-xl text-muted md:text-2xl">{study.summary}</p>
          {study.role && (
            <p className="hero-in mt-6 max-w-2xl border-l-2 border-gold pl-5 text-lg text-ink/85">
              <span className="text-gold">My role: </span>
              {study.role}
            </p>
          )}
          {(project.live || project.github) && (
            <div className="hero-in mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              {project.live && (
                <Magnetic>
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex rounded-full bg-accent-strong px-7 py-3.5 font-medium text-white transition-colors hover:bg-accent"
                  >
                    Try it live<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </Magnetic>
              )}
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener" className={linkClass}>
                  View the code on GitHub<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </div>
          )}
        </header>

        <Reveal>
          <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-line bg-[#0d0d0d] md:aspect-[16/8]">
            <ProjectVisual kind={project.visual} />
          </div>
        </Reveal>

        <section
          aria-label="In numbers"
          className="grid grid-cols-2 gap-x-6 gap-y-10 border-b border-line py-16 md:grid-cols-4 md:py-24"
        >
          {study.numbers.map((n, k) => (
            <Reveal key={n.label} delay={k * 80}>
              <p className="font-display text-[clamp(2.4rem,6vw,4rem)] font-semibold leading-none tracking-[-0.04em] text-gold">
                {n.value}
              </p>
              <p className="mt-3 max-w-[16rem] text-muted">{n.label}</p>
            </Reveal>
          ))}
        </section>

        <section className="grid gap-10 border-b border-line py-20 md:grid-cols-[1fr_1.4fr] md:py-28">
          <Reveal>
            <Heading>The problem</Heading>
          </Reveal>
          <Reveal delay={90} className="space-y-5 text-lg text-muted md:text-xl">
            {study.problem.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Reveal>
        </section>

        <section className="border-b border-line py-20 md:py-28">
          <Reveal>
            <Heading>{study.builtTitle ?? "What I built"}</Heading>
          </Reveal>
          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            {study.built.map((b, k) => (
              <Reveal key={b.title} delay={(k % 2) * 90} className={k === 0 ? "md:col-span-2" : ""}>
                <li className="spot h-full rounded-3xl border border-line bg-surface p-8 md:p-10">
                  <h3 className="font-display text-2xl font-semibold tracking-tight">{b.title}</h3>
                  <p className="mt-3 max-w-2xl text-lg text-muted">{b.body}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="border-b border-line py-20 md:py-28">
          <Reveal>
            <Heading>How it fits together</Heading>
            <p className="mt-5 max-w-2xl text-lg text-muted">{study.arch.caption}</p>
          </Reveal>
          <Reveal className="mt-12 rounded-[2rem] border border-line bg-[#0d0d0d] p-4 md:p-8">
            <Architecture
              nodes={study.arch.nodes}
              edges={study.arch.edges}
              label={`${project.name} architecture. ${study.arch.caption}`}
            />
          </Reveal>
        </section>

        <section className="border-b border-line py-20 md:py-28">
          <Reveal>
            <Heading>Stack</Heading>
          </Reveal>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {study.stack.map((g) => (
              <Reveal key={g.group}>
                <h3 className="font-medium text-accent-soft">{g.group}</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <li key={s} className="rounded-full border border-line-strong px-3.5 py-1 text-sm text-ink/85">
                      {s}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-10 py-20 md:flex-row md:items-end md:justify-between md:py-28">
          <Reveal>
            <Heading>Want the full walkthrough?</Heading>
            <p className="mt-5 max-w-xl text-lg text-muted">
              {project.private
                ? "The code is private, but I'm happy to show it running and talk through the decisions."
                : "The code is open on GitHub, and I'm happy to show it running and talk through the decisions."}
            </p>
            <div className="mt-8">
              <Magnetic>
                <Link
                  href="/contact"
                  className="inline-flex rounded-full bg-accent-strong px-7 py-3.5 font-medium text-white transition-colors hover:bg-accent"
                >
                  Get in Touch
                </Link>
              </Magnetic>
            </div>
          </Reveal>
          {next && (
            <Reveal>
              <p className="text-muted">Next case study</p>
              <Link
                href={`/work/${next.slug}`}
                className="mt-2 inline-block font-display text-3xl font-semibold tracking-tight hover:text-gold md:text-4xl"
              >
                {next.name}
              </Link>
            </Reveal>
          )}
        </section>
      </article>
    </SiteShell>
  );
}

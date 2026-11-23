import Link from "next/link";
import { projects as all, type Project } from "@/lib/content";
import { ProjectCard } from "./ProjectCard";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

const linkClass =
  "font-medium underline decoration-line-strong decoration-2 underline-offset-[6px] transition-colors hover:decoration-gold";

export function ProjectGrid({ items }: { items: Project[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-12">
      {items.map((p, i) => (
        <Reveal key={p.slug} delay={(i % 2) * 90} className={p.span}>
          <ProjectCard p={p} />
        </Reveal>
      ))}
    </div>
  );
}

// Home page: the three projects with case studies, and a way into the full list.
export function FeaturedWork() {
  const featured = all.filter((p) => p.caseStudy);
  return (
    <Section id="work" title="Selected work" intro="Three products I'd show you first. Each has a full case study.">
      <ProjectGrid items={featured} />
      <Reveal className="mt-12">
        <Link href="/work" className={`text-lg ${linkClass}`}>
          See all {all.length} projects
        </Link>
      </Reveal>
    </Section>
  );
}

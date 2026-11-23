import { projects } from "@/lib/content";
import { ProjectCard } from "./ProjectCard";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function Work() {
  return (
    <Section id="work" title="Work" intro="Selected products, from messaging infrastructure to fintech compliance.">
      <div className="grid gap-5 md:grid-cols-12">
        {projects.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 2) * 90} className={p.span}>
            <ProjectCard p={p} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

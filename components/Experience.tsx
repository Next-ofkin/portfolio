import { experience } from "@/lib/content";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function Experience() {
  return (
    <Section id="experience" title="Experience">
      <ol className="divide-y divide-line border-y border-line">
        {experience.map((e, i) => (
          <li key={e.org + e.role}>
            <Reveal delay={i * 80}>
              <div className="group grid gap-3 py-10 transition-colors md:grid-cols-12 md:items-baseline md:gap-8 md:py-12">
                <h3 className="font-display text-3xl font-semibold tracking-[-0.035em] transition-colors group-hover:text-gold md:col-span-6 md:text-5xl">
                  {e.org}
                </h3>
                <div className="md:col-span-2">
                  <p className="font-medium text-accent-soft">{e.role}</p>
                  <p className="mt-1 text-sm text-muted">{e.period}</p>
                </div>
                <p className="text-lg text-muted md:col-span-4">{e.detail}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}

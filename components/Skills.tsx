import { skills } from "@/lib/content";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

// Each group is one string. Heavier gauge, lower down; the lower two are wound in gold. Hover to pluck.
const gauge = [
  { h: 1, color: "bg-accent/70" },
  { h: 2, color: "bg-accent" },
  { h: 3, color: "bg-gold/90" },
  { h: 4, color: "bg-gold" },
];

export function Skills() {
  return (
    <Section id="skills" title="Skills" intro="The tools I reach for, grouped the way I use them.">
      <dl className="space-y-12 md:space-y-16">
        {skills.map((s, i) => (
          <Reveal key={s.group} delay={i * 70}>
            <div className="group">
              <div
                aria-hidden="true"
                className={`skill-string w-full rounded-full ${gauge[i].color}`}
                style={{ height: gauge[i].h }}
              />
              <div className="mt-6 grid gap-3 md:grid-cols-12 md:gap-8">
                <dt className="font-display text-2xl font-semibold tracking-tight md:col-span-4">{s.group}</dt>
                <dd className="md:col-span-8">
                  <ul className="flex flex-wrap gap-x-8 gap-y-2 font-display text-xl font-medium tracking-tight text-ink md:text-2xl">
                    {s.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </div>
          </Reveal>
        ))}
      </dl>
    </Section>
  );
}

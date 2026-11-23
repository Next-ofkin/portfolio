import { about } from "@/lib/content";
import { Reveal } from "./Reveal";

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-16 border-t border-line py-24 md:py-36">
      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <Reveal className="md:col-span-6">
          <h2
            id="about-title"
            className="font-display text-[clamp(2.5rem,6.5vw,5rem)] font-semibold leading-[0.98] tracking-[-0.045em]"
          >
            {about.statement}
          </h2>
        </Reveal>
        <Reveal delay={120} className="md:col-span-5 md:col-start-8">
          <div className="space-y-6 text-lg leading-[1.7] text-muted">
            {about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

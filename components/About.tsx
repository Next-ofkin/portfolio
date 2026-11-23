import Link from "next/link";
import { about } from "@/lib/content";
import { Portrait } from "./Portrait";
import { Reveal } from "./Reveal";

export function About({ short = false }: { short?: boolean }) {
  const paragraphs = short ? about.paragraphs.slice(0, 1) : about.paragraphs;
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-16 border-t border-line py-24 md:py-36">
      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <Reveal className="md:col-span-5">
          <Portrait />
        </Reveal>
        <Reveal delay={120} className="md:col-span-6 md:col-start-7 md:self-center">
          <h2
            id="about-title"
            className="font-display text-[clamp(2.5rem,6.5vw,5rem)] font-semibold leading-[0.98] tracking-[-0.045em]"
          >
            {about.statement}
          </h2>
          <div className="mt-10 space-y-6 text-lg leading-[1.7] text-muted">
            {paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {short && (
            <Link
              href="/about"
              className="mt-8 inline-block text-lg font-medium underline decoration-line-strong decoration-2 underline-offset-[6px] transition-colors hover:decoration-gold"
            >
              More about me
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  );
}

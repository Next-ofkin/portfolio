import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-16 border-t border-line py-24 md:py-36">
      <Reveal>
        <h2
          id={`${id}-title`}
          className="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.045em]"
        >
          {title}
        </h2>
        {intro && <p className="mt-5 max-w-xl text-lg text-muted">{intro}</p>}
      </Reveal>
      <div className="mt-14 md:mt-20">{children}</div>
    </section>
  );
}

import type { ReactNode } from "react";

// The opening of an inner page: one big title that rises in, and a short line under it.
export function PageHeader({ title, intro, children }: { title: string; intro: string; children?: ReactNode }) {
  return (
    <header className="pt-16 pb-14 md:pt-28 md:pb-20">
      <h1 className="hero-line font-display text-[clamp(3.4rem,13vw,9.5rem)] font-semibold leading-[0.9] tracking-[-0.055em]">
        <span>{title}</span>
      </h1>
      <p className="hero-in mt-8 max-w-2xl text-xl text-muted md:text-2xl">{intro}</p>
      {children}
    </header>
  );
}

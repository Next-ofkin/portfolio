import { profile } from "@/lib/content";
import { Magnetic } from "./Magnetic";
import { Parallax } from "./Parallax";
import { Strings } from "./Strings";

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative flex min-h-[calc(100svh-4.5rem)] flex-col justify-between gap-10 pb-8 pt-8 md:pt-10"
    >
      <Parallax rate={0.14}>
        <h1
          id="hero-title"
          className="font-display text-[clamp(3.6rem,15.5vw,10.25rem)] font-semibold leading-[0.9] tracking-[-0.055em]"
        >
          <span className="hero-line">
            <span style={{ animationDelay: "120ms" }}>Excel</span>
          </span>
          <span className="hero-line">
            <span style={{ animationDelay: "280ms" }}>Shogbola</span>
          </span>
        </h1>
      </Parallax>

      <div className="hero-in grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="font-display text-2xl font-medium tracking-tight md:text-3xl">{profile.title}</p>
          <p className="mt-4 max-w-xl text-lg text-muted">{profile.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-2">
          <Magnetic>
            <a
              href="#work"
              className="inline-flex h-12 items-center rounded-full bg-accent-strong px-7 text-base font-semibold text-white transition-colors hover:bg-accent"
            >
              View Work
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href="#contact"
              className="inline-flex h-12 items-center rounded-full border border-line-strong px-7 text-base font-semibold transition-colors hover:border-gold hover:text-gold"
            >
              Get in Touch
            </a>
          </Magnetic>
        </div>
      </div>

      <div className="hero-in">
        <Strings height={200} />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-muted">
          <p className="flex items-center gap-2.5">
            <span aria-hidden="true" className="pulse-dot h-2 w-2 rounded-full bg-gold" />
            {profile.location} · {profile.availability}
          </p>
          <p aria-hidden="true">Move across the strings, or tap one.</p>
        </div>
      </div>
    </section>
  );
}

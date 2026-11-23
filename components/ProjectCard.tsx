import type { Project } from "@/lib/content";
import { ProjectVisual } from "./ProjectVisual";
import { Spotlight } from "./Spotlight";

const link =
  "underline decoration-line-strong decoration-2 underline-offset-[6px] transition-colors hover:decoration-gold";

function Links({ p }: { p: Project }) {
  if (!p.live && !p.github && !p.private) return null;
  return (
    <p className="mt-7 flex flex-wrap gap-x-7 gap-y-2 font-medium">
      {p.live && (
        <a href={p.live} target="_blank" rel="noopener" className={link}>
          Live demo<span className="sr-only"> of {p.name} (opens in a new tab)</span>
        </a>
      )}
      {p.private && (
        <a href="#contact" className={link}>
          Ask for a walkthrough<span className="sr-only"> of {p.name}</span>
        </a>
      )}
      {p.github && (
        <a href={p.github} target="_blank" rel="noopener" className={link}>
          GitHub<span className="sr-only"> for {p.name} (opens in a new tab)</span>
        </a>
      )}
    </p>
  );
}

function Stack({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 flex flex-wrap gap-2" aria-label="Built with">
      {items.map((s) => (
        <li key={s} className="rounded-full border border-line-strong px-3.5 py-1 text-sm text-ink/85">
          {s}
        </li>
      ))}
    </ul>
  );
}

export function ProjectCard({ p }: { p: Project }) {
  const big = p.layout === "feature" || p.layout === "wide";
  const slim = p.layout === "slim";

  const text = (
    <div className={`relative z-10 flex flex-col justify-center ${slim ? "p-7 md:p-9" : big ? "p-8 md:p-14" : "p-8 md:p-10"}`}>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-accent-soft">
        {p.kind}
        {p.private && (
          <span className="rounded-full border border-gold/40 px-2.5 py-0.5 text-xs text-gold">Private codebase</span>
        )}
      </p>
      <h3
        className={`mt-3 font-display font-semibold tracking-[-0.04em] ${
          big ? "text-4xl md:text-6xl" : slim ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
        }`}
      >
        {p.name}
      </h3>
      <p className={`mt-4 max-w-xl text-muted ${slim ? "text-base" : "text-lg"}`}>{p.outcome}</p>
      <Stack items={p.stack} />
      <Links p={p} />
    </div>
  );

  const visual = (
    <div
      className={`relative overflow-hidden bg-[#0d0d0d] ${
        big ? "min-h-64 md:min-h-[26rem]" : slim ? "min-h-44" : "h-52 md:h-60"
      } ${p.layout === "wide" ? "md:order-2" : ""}`}
    >
      <ProjectVisual kind={p.visual} />
    </div>
  );

  const radius = big ? "rounded-[2rem]" : slim ? "rounded-2xl" : "rounded-3xl";
  const grid =
    p.layout === "feature"
      ? "md:grid md:grid-cols-[1.05fr_1fr]"
      : p.layout === "wide"
        ? "md:grid md:grid-cols-[1fr_1.05fr]"
        : slim
          ? "md:grid md:grid-cols-[16rem_1fr]"
          : "flex flex-col";

  return (
    <Spotlight className={`group h-full overflow-hidden border border-line bg-surface ${radius} ${grid}`}>
      {/* Visual first in the markup so it sits on top on phones; "wide" swaps sides on desktop. */}
      {visual}
      {text}
    </Spotlight>
  );
}

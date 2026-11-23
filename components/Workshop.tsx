import { workshop } from "@/lib/content";
import { Reveal } from "./Reveal";

// Real projects in progress, each with an honest status.
export function Workshop() {
  return (
    <ul className="grid gap-5 md:grid-cols-2">
      {workshop.map((w, i) => (
        <Reveal key={w.name} delay={(i % 2) * 90} className={i === 0 ? "md:col-span-2" : ""}>
          <li className="spot h-full rounded-3xl border border-line bg-surface p-7 md:p-9">
            <div className="relative z-10">
              <p className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-3 py-1 text-sm text-gold">
                <span aria-hidden="true" className="pulse-dot h-1.5 w-1.5 rounded-full bg-gold" />
                {w.status}
              </p>
              <h3 className="mt-5 font-display text-3xl font-semibold tracking-tight">{w.name}</h3>
              <p className="mt-3 max-w-2xl text-lg text-muted">{w.summary}</p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Built with">
                {w.stack.map((s) => (
                  <li key={s} className="rounded-full border border-line-strong px-3.5 py-1 text-sm text-ink/85">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        </Reveal>
      ))}
    </ul>
  );
}

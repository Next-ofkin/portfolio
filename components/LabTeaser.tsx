import Link from "next/link";
import { Reveal } from "./Reveal";

const items = [
  { title: "Pluck", body: "A 30-second rhythm game on the six strings." },
  { title: "Spot the hidden debt", body: "Catch loan repayments in a bank statement before they slip past." },
  { title: "Signature wall", body: "Sign your name and watch it float with everyone else's." },
];

// Home page invitation into the Lab.
export function LabTeaser() {
  return (
    <section aria-labelledby="lab-teaser-title" className="border-t border-line py-24 md:py-36">
      <Reveal>
        <Link
          href="/lab"
          className="spot group block overflow-hidden rounded-[2rem] border border-line bg-surface p-8 transition-colors md:p-14"
        >
          <div className="relative z-10 grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-end">
            <div>
              <p className="font-medium text-gold">The Lab</p>
              <h2
                id="lab-teaser-title"
                className="mt-3 font-display text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.045em]"
              >
                Come and play.
              </h2>
              <p className="mt-5 max-w-md text-lg text-muted">
                Small experiments, two games, and a wall where visitors leave their signature.
              </p>
              <span className="mt-8 inline-block text-lg font-medium underline decoration-line-strong decoration-2 underline-offset-[6px] transition-colors group-hover:decoration-gold">
                Open the Lab
              </span>
            </div>
            <ul className="grid gap-3">
              {items.map((it) => (
                <li key={it.title} className="rounded-2xl border border-line bg-bg/60 px-5 py-4">
                  <p className="font-display text-xl font-semibold tracking-tight">{it.title}</p>
                  <p className="mt-1 text-muted">{it.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Link>
      </Reveal>
    </section>
  );
}

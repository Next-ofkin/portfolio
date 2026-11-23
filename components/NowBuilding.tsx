import { Suspense, type ReactNode } from "react";
import { nowBuilding } from "@/lib/content";
import { getActivity } from "@/lib/github";

function Item({ children }: { children: ReactNode }) {
  return (
    <li className="flex shrink-0 items-center gap-3 pr-10 whitespace-nowrap">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold" />
      {children}
    </li>
  );
}

async function Ticker() {
  const a = await getActivity();
  const items: ReactNode[] = [
    ...nowBuilding.map((t) => <span key={t}>{t}</span>),
    a.lastCommit && (
      <span key="last">
        Last commit <span className="text-ink">{a.lastCommit}</span>
      </span>
    ),
    a.last30 !== null && (
      <span key="30">
        <span className="text-ink">{a.last30}</span> contributions in the last 30 days
      </span>
    ),
    ...a.repos.map((r) => (
      <span key={r.name}>
        <a href={r.url} target="_blank" rel="noopener" className="text-ink underline-offset-4 hover:underline">
          {r.name}
        </a>{" "}
        pushed {r.when}
      </span>
    )),
  ].filter(Boolean);

  const list = (hidden: boolean) => (
    <ul className="ticker-track flex" aria-hidden={hidden || undefined}>
      {items.map((it, i) => (
        <Item key={i}>{it}</Item>
      ))}
    </ul>
  );

  return (
    <section
      aria-label="Now building"
      className="ticker group relative -mx-5 overflow-hidden border-y border-line py-4 text-muted md:-mx-10"
    >
      <p className="absolute top-0 bottom-0 left-0 z-10 flex items-center bg-bg pr-5 pl-5 font-medium text-gold md:pl-10">
        <span className="pulse-dot mr-2.5 inline-block h-2 w-2 rounded-full bg-gold" />
        Now building
      </p>
      <div className="ticker-mask flex pl-44 md:pl-52">
        <div className="ticker-run flex">
          {list(false)}
          {list(true)}
        </div>
      </div>
    </section>
  );
}

export function NowBuilding() {
  return (
    <Suspense fallback={<div className="-mx-5 h-[3.6rem] border-y border-line md:-mx-10" />}>
      <Ticker />
    </Suspense>
  );
}

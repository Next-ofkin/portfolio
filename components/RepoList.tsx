"use client";

import { useMemo, useState } from "react";
import { formatDate, type Repo } from "@/lib/github-parse";

type Sort = "recent" | "stars";
const INITIAL = 8;

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#6366f1",
  JavaScript: "#f59e0b",
  Python: "#60a5fa",
  HTML: "#fb7185",
  CSS: "#a78bfa",
  Shell: "#86efac",
};

export function RepoList({ repos, profileUrl }: { repos: Repo[]; profileUrl: string }) {
  const [sort, setSort] = useState<Sort>("recent");
  const [language, setLanguage] = useState("All");
  const [showAll, setShowAll] = useState(false);

  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of repos) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    return ["All", ...[...counts.entries()].sort((a, b) => b[1] - a[1]).map(([l]) => l)];
  }, [repos]);

  const list = useMemo(() => {
    const filtered = language === "All" ? repos : repos.filter((r) => r.language === language);
    return [...filtered].sort((a, b) =>
      sort === "stars" ? b.stars - a.stars || (a.pushedAt < b.pushedAt ? 1 : -1) : a.pushedAt < b.pushedAt ? 1 : -1,
    );
  }, [repos, sort, language]);

  const visible = showAll ? list : list.slice(0, INITIAL);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Sort repositories" className="inline-flex rounded-full border border-line-strong p-1">
          {(
            [
              ["recent", "Recently updated"],
              ["stars", "Most stars"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={sort === value}
              onClick={() => setSort(value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                sort === value ? "bg-ink text-bg" : "text-muted hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {languages.length > 2 && (
          <label className="flex items-center gap-3 text-sm text-muted">
            Language
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-full border border-line-strong bg-raised px-4 py-2 text-sm text-ink"
            >
              {languages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {visible.map((r) => (
          <li key={r.name}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener"
              className="group grid gap-3 py-6 transition-colors md:grid-cols-12 md:items-baseline md:gap-8"
            >
              <div className="md:col-span-7">
                <h3 className="flex flex-wrap items-center gap-3 font-display text-2xl font-semibold tracking-tight transition-colors group-hover:text-gold">
                  {r.name}
                  {r.active && (
                    <span className="rounded-full border border-gold/50 px-2.5 py-0.5 font-sans text-xs font-medium tracking-normal text-gold">
                      Active
                    </span>
                  )}
                  <span className="sr-only"> (opens in a new tab)</span>
                </h3>
                <p className="mt-1.5 max-w-xl text-muted">{r.description ?? "No description yet."}</p>
              </div>
              <dl className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted md:col-span-5 md:justify-end">
                {r.language && (
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Language</dt>
                    <dd className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: LANG_COLORS[r.language] ?? "#a3a3a3" }}
                      />
                      {r.language}
                    </dd>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Stars</dt>
                  <dd className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {r.stars}
                  </dd>
                </div>
                {r.pushedAt && (
                  <div>
                    <dt className="sr-only">Last updated</dt>
                    <dd>Updated {formatDate(r.pushedAt)}</dd>
                  </div>
                )}
              </dl>
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
        {list.length > INITIAL && (
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            aria-expanded={showAll}
            className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium transition-colors hover:border-gold hover:text-gold"
          >
            {showAll ? "Show fewer" : `Show all ${list.length}`}
          </button>
        )}
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener"
          className="font-medium underline decoration-line-strong decoration-2 underline-offset-[6px] transition-colors hover:decoration-gold"
        >
          See everything on GitHub<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}

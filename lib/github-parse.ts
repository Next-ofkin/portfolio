// Pure helpers for GitHub data. No imports, so they can be tested on their own.

export type Repo = {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  pushedAt: string; // ISO timestamp
  url: string;
  homepage: string | null;
  active: boolean; // pushed within the last 30 days, judged when the data was fetched
};

export type ContributionDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

const DAY = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export function normalizeRepos(raw: unknown, user: string, nowMs: number): Repo[] {
  if (!Array.isArray(raw)) return [];
  const repos: Repo[] = [];
  for (const r of raw) {
    if (!isRecord(r)) continue;
    if (r.fork === true || r.archived === true || r.private === true) continue;
    const name = typeof r.name === "string" ? r.name : "";
    if (!name || name.toLowerCase() === user.toLowerCase()) continue; // skip the profile README repo
    const pushedAt = typeof r.pushed_at === "string" ? r.pushed_at : "";
    repos.push({
      name,
      description: typeof r.description === "string" && r.description ? r.description : null,
      language: typeof r.language === "string" && r.language ? r.language : null,
      stars: typeof r.stargazers_count === "number" ? r.stargazers_count : 0,
      forks: typeof r.forks_count === "number" ? r.forks_count : 0,
      pushedAt,
      url: typeof r.html_url === "string" ? r.html_url : `https://github.com/${user}/${name}`,
      homepage: typeof r.homepage === "string" && r.homepage ? r.homepage : null,
      active: pushedAt ? nowMs - Date.parse(pushedAt) < 30 * DAY : false,
    });
  }
  return repos.sort((a, b) => (a.pushedAt < b.pushedAt ? 1 : -1));
}

const LEVELS: Record<string, 0 | 1 | 2 | 3 | 4> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const clampLevel = (n: number): 0 | 1 | 2 | 3 | 4 => (n <= 0 ? 0 : n >= 4 ? 4 : (Math.round(n) as 1 | 2 | 3));

// GitHub GraphQL: user.contributionsCollection.contributionCalendar.weeks[].contributionDays[]
export function parseGraphql(json: unknown): ContributionDay[] | null {
  try {
    const pick = (o: unknown, key: string): unknown => (isRecord(o) ? o[key] : undefined);
    const calendar = pick(pick(pick(pick(json, "data"), "user"), "contributionsCollection"), "contributionCalendar");
    const weeks = pick(calendar, "weeks");
    if (!Array.isArray(weeks)) return null;
    const days: ContributionDay[] = [];
    for (const w of weeks) {
      const inWeek = pick(w, "contributionDays");
      if (!Array.isArray(inWeek)) continue;
      for (const d of inWeek) {
        if (!isRecord(d)) continue;
        days.push({
          date: String(d.date),
          count: Number(d.contributionCount) || 0,
          level: LEVELS[String(d.contributionLevel)] ?? 0,
        });
      }
    }
    return days.length ? days : null;
  } catch {
    return null;
  }
}

// github-contributions-api.jogruber.de: { contributions: [{ date, count, level }] }
export function parseJogruber(json: unknown): ContributionDay[] | null {
  if (!isRecord(json) || !Array.isArray(json.contributions)) return null;
  const days: ContributionDay[] = [];
  for (const d of json.contributions) {
    if (!isRecord(d) || typeof d.date !== "string") continue;
    days.push({ date: d.date, count: Number(d.count) || 0, level: clampLevel(Number(d.level) || 0) });
  }
  return days.length ? days : null;
}

// github.com/users/<name>/contributions: an HTML fragment with one <td data-date data-level> per day
// and a <tool-tip for="<td id>"> that holds the count in words.
export function parseContributionsHtml(html: string): ContributionDay[] | null {
  const counts = new Map<string, number>();
  for (const m of html.matchAll(/<tool-tip[^>]*\sfor="([^"]+)"[^>]*>\s*([^<]*)</g)) {
    const n = /^(\d+)\s+contribution/i.exec(m[2].trim());
    counts.set(m[1], n ? Number(n[1]) : 0);
  }
  const days: ContributionDay[] = [];
  for (const m of html.matchAll(/<td\b[^>]*>/g)) {
    const tag = m[0];
    const date = /data-date="(\d{4}-\d{2}-\d{2})"/.exec(tag)?.[1];
    if (!date) continue;
    const level = clampLevel(Number(/data-level="(\d)"/.exec(tag)?.[1] ?? 0));
    const id = /\sid="([^"]+)"/.exec(tag)?.[1];
    days.push({ date, count: id ? (counts.get(id) ?? 0) : 0, level });
  }
  days.sort((a, b) => (a.date < b.date ? -1 : 1));
  return days.length ? days : null;
}

// "2026-11-12" -> "12 Nov 2026", independent of locale and time zone.
export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  const month = MONTHS[Number(m) - 1];
  return month ? `${Number(d)} ${month} ${y}` : iso;
}

// Columns of seven days, Sunday first. The first column is padded so rows line up with weekdays.
export function groupWeeks(days: ContributionDay[]): (ContributionDay | null)[][] {
  if (!days.length) return [];
  const [y, m, d] = days[0].date.split("-").map(Number);
  const pad = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const cells: (ContributionDay | null)[] = [...Array<null>(pad).fill(null), ...days];
  const weeks: (ContributionDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// Label for a week column when it is the first one of a new month, else empty.
export function monthLabels(weeks: (ContributionDay | null)[][]): string[] {
  let last = -1;
  return weeks.map((w) => {
    const first = w.find(Boolean);
    if (!first) return "";
    const month = Number(first.date.slice(5, 7)) - 1;
    if (month === last) return "";
    last = month;
    return MONTHS[month];
  });
}

// "today", "yesterday", "5 days ago", "3 weeks ago", "2 months ago"
export function ago(thenMs: number, nowMs: number): string {
  const days = Math.max(0, Math.floor((nowMs - thenMs) / DAY));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return `${Math.round(days / 30)} months ago`;
}

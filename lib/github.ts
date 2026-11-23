import { cacheLife } from "next/cache";
import { profile } from "./content";
import {
  ago,
  normalizeRepos,
  parseContributionsHtml,
  parseGraphql,
  parseJogruber,
  type ContributionDay,
  type Repo,
} from "./github-parse";

const USER = profile.githubUser;

// Optional: set GITHUB_TOKEN (no scopes needed) for a higher rate limit and GitHub's own contribution data.
function headers(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "excel-shogbola-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

const FAILED_LIFE = { stale: 30, revalidate: 60, expire: 300 };

export type ReposResult = { ok: true; repos: Repo[] } | { ok: false };

// Public repositories for the account, newest push first. Cached for an hour; a failure is retried after a minute.
export async function getRepos(): Promise<ReposResult> {
  "use cache";
  try {
    const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed&type=owner`, {
      headers: headers(),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`GitHub repos ${res.status}`);
    const repos = normalizeRepos(await res.json(), USER, Date.now());
    cacheLife("hours");
    return { ok: true, repos };
  } catch {
    cacheLife(FAILED_LIFE);
    return { ok: false };
  }
}

async function viaGraphql(): Promise<ContributionDay[] | null> {
  if (!process.env.GITHUB_TOKEN) return null;
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount contributionLevel}}}}}}`,
        variables: { login: USER },
      }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok ? parseGraphql(await res.json()) : null;
  } catch {
    return null;
  }
}

async function viaJogruber(): Promise<ContributionDay[] | null> {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`, {
      signal: AbortSignal.timeout(8000),
    });
    return res.ok ? parseJogruber(await res.json()) : null;
  } catch {
    return null;
  }
}

async function viaHtml(): Promise<ContributionDay[] | null> {
  try {
    const res = await fetch(`https://github.com/users/${USER}/contributions`, {
      headers: { Accept: "text/html", "User-Agent": "excel-shogbola-portfolio" },
      signal: AbortSignal.timeout(8000),
    });
    return res.ok ? parseContributionsHtml(await res.text()) : null;
  } catch {
    return null;
  }
}

export type ContributionsResult = { ok: true; total: number; days: ContributionDay[] } | { ok: false };

// The last year of contributions. Tries GitHub's API (with a token), then a public mirror, then GitHub's own calendar page.
export async function getContributions(): Promise<ContributionsResult> {
  "use cache";
  try {
    const days = (await viaGraphql()) ?? (await viaJogruber()) ?? (await viaHtml());
    if (!days || days.length < 30) throw new Error("No contribution data");
    cacheLife("hours");
    return { ok: true, total: days.reduce((sum, d) => sum + d.count, 0), days };
  } catch {
    cacheLife(FAILED_LIFE);
    return { ok: false };
  }
}

export type Activity = {
  lastCommit: string | null;
  last30: number | null;
  repos: { name: string; url: string; when: string }[];
};

// Short, human lines for the "Now building" ticker. Private repositories never appear: the API only returns public ones.
export async function getActivity(): Promise<Activity> {
  "use cache";
  cacheLife("hours");
  const [repos, contrib] = await Promise.all([getRepos(), getContributions()]);
  const now = Date.now();
  let lastCommit: string | null = null;
  let last30: number | null = null;
  if (contrib.ok) {
    const days = contrib.days;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        lastCommit = ago(Date.parse(days[i].date), Date.parse(days[days.length - 1].date));
        break;
      }
    }
    last30 = days.slice(-30).reduce((s, d) => s + d.count, 0);
  }
  return {
    lastCommit,
    last30,
    repos: repos.ok
      ? repos.repos.slice(0, 4).map((r) => ({ name: r.name, url: r.url, when: ago(Date.parse(r.pushedAt), now) }))
      : [],
  };
}

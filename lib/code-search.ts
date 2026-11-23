import { readFileSync } from "node:fs";
import { join } from "node:path";

// Keyword search (BM25) over the code index built by scripts/build-knowledge.mjs.

type Repo = { name: string; private: boolean; description: string; language: string; url: string; pushedAt: string };
type Chunk = { r: number; p: string; s: number; t: string };
type Index = { builtAt: string | null; repos: Repo[]; chunks: Chunk[] };
export type Hit = { repo: Repo; path: string; start: number; end: number; text: string; score: number };

// Project names people use, mapped to the repositories behind them.
const ALIASES: Record<string, string[]> = {
  verifyflow: ["verifyflow-engine-v1", "verifyflow-now"],
  stringsautomation: ["strings-automation", "nolt-messagingplat4m", "sms-platform"],
  strings: ["strings-automation"],
  handgraph: ["hand-graph"],
  handglove: ["hand-glove"],
  appliaed: ["appliaed"],
  oraclena: ["oraclena"],
  sisiigbadun: ["sisi-igbadun"],
  ippis: ["ippis-structure", "verifyflow-engine-v1"],
  jarvis: ["jarvis-career-agent", "jarvis-search-gateway", "jarvis-field-worker"],
  electronicsbuilder: ["electronics-builder"],
  mementrail: ["mementrail"],
  payva: ["payva"],
  autoapply: ["autoapply-ng", "autoapply-ngv2", "ai-auto-apply"],
  portfolio: ["portfolio"],
  askwell: ["askwell"],
  particlehands: ["particle-hands"],
};

const STOP = new Set(
  "the a an and or of to in on for with how did does do is are was were what which who why when where this that it its he his excel shogbola you your me my i can could would should about from by as at be use used using build built make made work works handle handled code project app".split(
    " ",
  ),
);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function tokens(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && t.length < 30 && !STOP.has(t));
}

let cache: { index: Index; tf: Map<string, number>[]; len: number[]; df: Map<string, number>; avg: number } | null = null;

function load() {
  if (cache) return cache;
  let index: Index = { builtAt: null, repos: [], chunks: [] };
  try {
    index = JSON.parse(readFileSync(join(process.cwd(), "data", "knowledge.json"), "utf8")) as Index;
  } catch {
    /* no index yet: the assistant uses site text only */
  }
  const tf: Map<string, number>[] = [];
  const len: number[] = [];
  const df = new Map<string, number>();
  for (const c of index.chunks) {
    const m = new Map<string, number>();
    const toks = tokens(`${c.p.replace(/[/._-]/g, " ")} ${c.t}`);
    for (const t of toks) m.set(t, (m.get(t) ?? 0) + 1);
    for (const t of m.keys()) df.set(t, (df.get(t) ?? 0) + 1);
    tf.push(m);
    len.push(toks.length || 1);
  }
  const avg = len.reduce((a, b) => a + b, 0) / (len.length || 1);
  cache = { index, tf, len, df, avg };
  return cache;
}

export function indexStats() {
  const { index } = load();
  return { repos: index.repos.length, chunks: index.chunks.length, builtAt: index.builtAt };
}

// Repositories the question names, by project name or repository name.
function namedRepos(q: string, repos: Repo[]): Set<number> {
  const nq = norm(q);
  const out = new Set<number>();
  repos.forEach((r, i) => {
    const n = norm(r.name);
    if (n.length >= 4 && nq.includes(n)) out.add(i);
  });
  for (const [alias, names] of Object.entries(ALIASES)) {
    if (!nq.includes(alias)) continue;
    repos.forEach((r, i) => {
      if (names.includes(r.name.toLowerCase())) out.add(i);
    });
  }
  return out;
}

export function searchCode(query: string, k = 8): Hit[] {
  const { index, tf, len, df, avg } = load();
  if (!index.chunks.length) return [];
  const q = [...new Set(tokens(query))];
  const named = namedRepos(query, index.repos);
  const N = index.chunks.length;
  const k1 = 1.2;
  const b = 0.75;
  const scored: { i: number; score: number }[] = [];
  for (let i = 0; i < N; i++) {
    const c = index.chunks[i];
    if (named.size && !named.has(c.r)) continue; // a named project narrows the search to it
    let s = 0;
    for (const t of q) {
      const f = tf[i].get(t);
      if (!f) continue;
      const idf = Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));
      s += (idf * f * (k1 + 1)) / (f + k1 * (1 - b + (b * len[i]) / avg));
    }
    if (/readme\.mdx?$/i.test(c.p)) s *= 1.25;
    if (named.size && s === 0 && /readme\.mdx?$/i.test(c.p) && c.s === 1) s = 0.01; // at least show what the project is
    if (s > 0) scored.push({ i, score: s });
  }
  scored.sort((a, z) => z.score - a.score);
  const perFile = new Map<string, number>();
  const hits: Hit[] = [];
  for (const { i, score } of scored) {
    const c = index.chunks[i];
    const key = `${c.r}:${c.p}`;
    if ((perFile.get(key) ?? 0) >= 2) continue;
    perFile.set(key, (perFile.get(key) ?? 0) + 1);
    const lines = c.t.split("\n").length;
    hits.push({ repo: index.repos[c.r], path: c.p, start: c.s, end: c.s + lines - 1, text: c.t, score });
    if (hits.length >= k) break;
  }
  return hits;
}

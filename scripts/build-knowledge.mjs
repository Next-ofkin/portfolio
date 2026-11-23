// Builds data/knowledge.json: the code and docs the site assistant can search.
// Runs before every build. Needs GITHUB_TOKEN with read access to Excel's repositories (private ones included);
// without it the index is empty and the assistant answers from the site text alone.
//
// Safety: forks are skipped (their code isn't Excel's), secret-looking files are never read, and keys, tokens,
// passwords and connection strings are redacted from everything that is kept. The index stays on the server.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import * as tar from "tar";

const OWNER = "Next-ofkin";
const API = process.env.GITHUB_API_URL || "https://api.github.com";
const TOKEN = process.env.GITHUB_TOKEN;
const LOCAL = process.env.KNOWLEDGE_TARBALL_DIR; // testing: read <repo>.tgz files and repos.json from here
const OUT = new URL("../data/knowledge.json", import.meta.url);

const FORKS_THAT_ARE_MINE = new Set(["strings-automation"]);
const SKIP_REPOS = new Set(["gamedev-free-resources"]);
const MAX_FILE = 80_000;
const MAX_FILES_PER_REPO = 140;
const MAX_TEXT_PER_REPO = 700_000;
const MAX_TEXT_TOTAL = 14_000_000;
const CHUNK_LINES = 50;
const CHUNK_STEP = 44;

const CODE = /\.(md|mdx|ts|tsx|js|jsx|mjs|cjs|py|sql|prisma|php|dart|vue|svelte|go|java|kt|rb|rs|cs)$/i;
const SKIP_DIR =
  /(^|\/)(node_modules|\.next|dist|build|out|coverage|vendor|\.git|__pycache__|\.venv|venv|env|\.expo|ios|android|public|static|assets|fixtures|__snapshots__|sample_data|\.idx|\.vercel|\.turbo|site\/vendor)\//i;
const SKIP_FILE =
  /(\.min\.(js|css)$|\.d\.ts$|\.map$|(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml)$|(^|\/)\.env|secret|credential|\.pem$|\.key$|\.p12$|(^|\/)(test_|tests?\/)|\.(test|spec)\.[jt]sx?$)/i;

const REDACTIONS = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[redacted private key]"],
  [/\b(postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|rediss|amqps?):\/\/[^\s'"`<>]+/gi, "[redacted connection string]"],
  [/\bsk-(?:or-|ant-|proj-)?[A-Za-z0-9_-]{16,}/g, "[redacted key]"],
  [/\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})/g, "[redacted token]"],
  [/\bAKIA[0-9A-Z]{16}\b/g, "[redacted key]"],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/g, "[redacted token]"],
  [/\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{10,}/g, "[redacted key]"],
  [/\bre_[A-Za-z0-9]{20,}/g, "[redacted key]"],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, "[redacted token]"],
  [
    /((?:api[_-]?key|secret|token|password|passwd|pwd|private[_-]?key|access[_-]?key|client[_-]?secret|auth)[\w-]*["']?\s*[:=]\s*)(["'`])[^"'`\s]{8,}\2/gi,
    "$1$2[redacted]$2",
  ],
];

const redact = (text) => REDACTIONS.reduce((t, [re, rep]) => t.replace(re, rep), text);

async function gh(path) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "excel-shogbola-portfolio",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`GitHub ${path} ${res.status}`);
  return res.json();
}

async function listRepos() {
  if (LOCAL) return JSON.parse(readFileSync(`${LOCAL}/repos.json`, "utf8"));
  const all = [];
  for (let page = 1; page <= 5; page++) {
    const batch = await gh(`/user/repos?per_page=100&page=${page}&affiliation=owner&sort=pushed`);
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

// Read a repository's tarball and keep the files worth searching.
async function readRepo(repo) {
  const files = [];
  const parser = new tar.Parser({
    filter: (p, entry) => {
      const rel = p.split("/").slice(1).join("/");
      return entry.type === "File" && entry.size <= MAX_FILE && CODE.test(rel) && !SKIP_DIR.test(rel) && !SKIP_FILE.test(rel);
    },
    onReadEntry: (entry) => {
      const rel = entry.path.split("/").slice(1).join("/");
      const parts = [];
      entry.on("data", (c) => parts.push(c));
      entry.on("end", () => files.push({ path: rel, text: Buffer.concat(parts).toString("utf8") }));
    },
  });
  let source;
  if (LOCAL) {
    source = Readable.from(readFileSync(`${LOCAL}/${repo.name}.tgz`));
  } else {
    const res = await fetch(`${API}/repos/${repo.full_name}/tarball`, {
      headers: { Authorization: `Bearer ${TOKEN}`, "User-Agent": "excel-shogbola-portfolio" },
      redirect: "follow",
      signal: AbortSignal.timeout(90_000),
    });
    if (!res.ok || !res.body) throw new Error(`tarball ${res.status}`);
    source = Readable.fromWeb(res.body);
  }
  await pipeline(source, parser);

  // READMEs and docs first, then code nearer the top of the tree.
  const rank = (f) =>
    (/(^|\/)readme\.mdx?$/i.test(f.path) ? 0 : /\.mdx?$/i.test(f.path) ? 1 : 2) * 1000 + f.path.split("/").length * 10;
  files.sort((a, b) => rank(a) - rank(b) || a.text.length - b.text.length);
  const kept = [];
  let size = 0;
  for (const f of files) {
    if (kept.length >= MAX_FILES_PER_REPO || size + f.text.length > MAX_TEXT_PER_REPO) continue;
    if (!f.text.trim() || /\u0000/.test(f.text)) continue;
    kept.push({ path: f.path, text: redact(f.text) });
    size += f.text.length;
  }
  return kept;
}

function chunk(text) {
  const lines = text.split("\n");
  const out = [];
  for (let s = 0; s < lines.length; s += CHUNK_STEP) {
    const body = lines.slice(s, s + CHUNK_LINES).join("\n");
    if (body.replace(/\s/g, "").length > 40) out.push({ s: s + 1, t: body });
    if (s + CHUNK_LINES >= lines.length) break;
  }
  return out;
}

async function main() {
  mkdirSync(new URL("../data/", import.meta.url), { recursive: true });
  if (!TOKEN && !LOCAL) {
    writeFileSync(OUT, JSON.stringify({ builtAt: null, repos: [], chunks: [] }));
    console.log("Knowledge: no GITHUB_TOKEN, wrote an empty index (the assistant uses site text only)");
    return;
  }
  const started = Date.now();
  let repos;
  try {
    repos = (await listRepos()).filter(
      (r) =>
        r.owner?.login === OWNER &&
        !r.archived &&
        !SKIP_REPOS.has(r.name) &&
        (!r.fork || FORKS_THAT_ARE_MINE.has(r.name)),
    );
  } catch (e) {
    console.log(`Knowledge: could not list repositories (${e.message}); wrote an empty index`);
    writeFileSync(OUT, JSON.stringify({ builtAt: null, repos: [], chunks: [] }));
    return;
  }

  const index = { builtAt: new Date().toISOString(), repos: [], chunks: [] };
  let total = 0;
  const queue = [...repos];
  const worker = async () => {
    for (let repo; (repo = queue.shift()); ) {
      if (total > MAX_TEXT_TOTAL || Date.now() - started > 240_000) return;
      try {
        const files = await readRepo(repo);
        const r = index.repos.length;
        index.repos.push({
          name: repo.name,
          private: !!repo.private,
          description: repo.description || "",
          language: repo.language || "",
          url: repo.html_url,
          pushedAt: repo.pushed_at,
        });
        for (const f of files) for (const c of chunk(f.text)) index.chunks.push({ r, p: f.path, s: c.s, t: c.t });
        total += files.reduce((n, f) => n + f.text.length, 0);
        console.log(`Knowledge: ${repo.name}: ${files.length} files`);
      } catch (e) {
        console.log(`Knowledge: skipped ${repo.name} (${e.message})`);
      }
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  writeFileSync(OUT, JSON.stringify(index));
  console.log(
    `Knowledge: ${index.repos.length} repos, ${index.chunks.length} chunks, ${(total / 1e6).toFixed(1)} MB in ${Math.round((Date.now() - started) / 1000)}s`,
  );
}

main().catch((e) => {
  console.log(`Knowledge: failed (${e.message}); wrote an empty index`);
  mkdirSync(new URL("../data/", import.meta.url), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ builtAt: null, repos: [], chunks: [] }));
});


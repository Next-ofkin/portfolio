import { AwsClient } from "aws4fetch";

// Cloudflare R2 through its S3-compatible API. Needs R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET.
// R2_ENDPOINT can point somewhere else (a local mock in tests).

function config() {
  const account = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (!account || !accessKeyId || !secretAccessKey || !bucket) return null;
  const endpoint = process.env.R2_ENDPOINT ?? `https://${account}.r2.cloudflarestorage.com`;
  return {
    client: new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto" }),
    base: `${endpoint}/${bucket}`,
  };
}

export const r2Configured = () => config() !== null;

const path = (key: string) => key.split("/").map(encodeURIComponent).join("/");

async function call(method: string, key: string, init: RequestInit = {}, query = "") {
  const c = config();
  if (!c) throw new Error("R2 is not configured");
  return c.client.fetch(`${c.base}/${path(key)}${query}`, { method, ...init, signal: AbortSignal.timeout(10_000) });
}

export async function r2Put(key: string, body: string, contentType = "application/json") {
  const res = await call("PUT", key, { body, headers: { "Content-Type": contentType } });
  if (!res.ok) throw new Error(`R2 put ${res.status}`);
}

export async function r2Get(key: string): Promise<string | null> {
  const res = await call("GET", key);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`R2 get ${res.status}`);
  return res.text();
}

export async function r2Delete(key: string) {
  const res = await call("DELETE", key);
  if (!res.ok && res.status !== 404) throw new Error(`R2 delete ${res.status}`);
}

// Keys under a prefix (first 1000, which is plenty here).
export async function r2List(prefix: string): Promise<string[]> {
  const c = config();
  if (!c) throw new Error("R2 is not configured");
  const res = await c.client.fetch(`${c.base}?list-type=2&max-keys=1000&prefix=${encodeURIComponent(prefix)}`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`R2 list ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<Key>([^<]+)<\/Key>/g)].map((m) =>
    m[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'"),
  );
}

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cacheLife, cacheTag } from "next/cache";
import { r2Configured, r2Delete, r2Get, r2List, r2Put } from "./r2";
import type { Signature } from "./signature-shape";

// Signatures live in R2 as JSON: <prefix>pending/<id>.json until approved, then <prefix>approved/<id>.json.
const PREFIX = process.env.SIGNATURE_PREFIX ?? "portfolio/signatures/";
const pendingKey = (id: string) => `${PREFIX}pending/${id}.json`;
const approvedKey = (id: string) => `${PREFIX}approved/${id}.json`;

// Review links are signed with SIGNATURE_SECRET, or with the R2 secret key when that isn't set.
const linkSecret = () => process.env.SIGNATURE_SECRET || process.env.R2_SECRET_ACCESS_KEY || "";
export const signaturesOpen = () => r2Configured() && linkSecret().length >= 16;

// Ids sort by time: base-36 milliseconds, then random.
export const newId = () => `${Date.now().toString(36).padStart(9, "0")}-${randomBytes(4).toString("hex")}`;
export const validId = (id: unknown): id is string => typeof id === "string" && /^[0-9a-z]{9}-[0-9a-f]{8}$/.test(id);

export function reviewToken(id: string) {
  return createHmac("sha256", linkSecret())
    .update(`signature:${id}`)
    .digest("hex")
    .slice(0, 40);
}
export function checkToken(id: string, token: unknown) {
  if (typeof token !== "string" || token.length !== 40) return false;
  return timingSafeEqual(Buffer.from(reviewToken(id)), Buffer.from(token));
}

const parse = (text: string | null): Signature | null => {
  if (!text) return null;
  try {
    return JSON.parse(text) as Signature;
  } catch {
    return null;
  }
};

export async function savePending(sig: Signature) {
  await r2Put(pendingKey(sig.id), JSON.stringify(sig));
}

export async function getPending(id: string) {
  return parse(await r2Get(pendingKey(id)));
}

export async function getApprovedOne(id: string) {
  return parse(await r2Get(approvedKey(id)));
}

export async function approve(id: string) {
  const sig = await getPending(id);
  if (!sig) return false;
  await r2Put(approvedKey(id), JSON.stringify(sig));
  await r2Delete(pendingKey(id));
  return true;
}

export async function reject(id: string) {
  await r2Delete(pendingKey(id));
  await r2Delete(approvedKey(id));
}

export type WallResult = { ok: true; signatures: Signature[] } | { ok: false };

// The newest 40 approved signatures. Cached; approving or removing one clears the "signatures" tag.
export async function getApproved(): Promise<WallResult> {
  "use cache";
  cacheTag("signatures");
  if (!r2Configured()) {
    cacheLife("hours");
    return { ok: true, signatures: [] };
  }
  try {
    const keys = (await r2List(`${PREFIX}approved/`)).sort().reverse().slice(0, 40);
    const sigs = (await Promise.all(keys.map(async (k) => parse(await r2Get(k))))).filter((s): s is Signature => !!s);
    cacheLife("hours");
    return { ok: true, signatures: sigs };
  } catch (e) {
    console.error("Signature wall: could not read R2", e);
    cacheLife({ stale: 30, revalidate: 60, expire: 300 });
    return { ok: false };
  }
}

import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/content";
import { emailExcel, escapeHtml } from "@/lib/email";
import { cleanSignature } from "@/lib/signature-shape";
import { newId, reviewToken, savePending, signaturesOpen } from "@/lib/signatures";

// A visitor signs the wall. The signature is stored as pending and Excel gets an email with a review link.
// Nothing appears on the wall until he approves it.

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  return false;
}

const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });

export async function POST(request: Request) {
  if (!signaturesOpen()) return fail("The wall isn't open yet. Please come back soon.", 503);
  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) return fail("Nothing to save.", 400);
  const b = body as Record<string, unknown>;
  if (typeof b.company === "string" && b.company.trim() !== "") return NextResponse.json({ ok: true }); // honeypot
  if (typeof b.elapsed !== "number" || b.elapsed < 1500) return fail("That was very quick. Please draw your signature again.", 400);

  const clean = cleanSignature(b);
  if (!clean.ok) return fail(clean.error, 400);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (tooMany(ip)) return fail("You've signed a few times already. Please try again later.", 429);

  const id = newId();
  try {
    await savePending({ id, name: clean.name, color: clean.color, strokes: clean.strokes, createdAt: new Date().toISOString() });
  } catch (e) {
    console.error("Signature wall: save failed", e);
    return fail("Your signature couldn't be saved. Please try again.", 502);
  }

  const link = `${siteUrl}/lab/review?id=${id}&t=${reviewToken(id)}`;
  const who = clean.name || "Someone";
  await emailExcel({
    subject: `New signature on your wall from ${who}`,
    text: `${who} signed the wall on your portfolio.\n\nReview it (approve or delete): ${link}`,
    html: `<p><strong>${escapeHtml(who)}</strong> signed the wall on your portfolio.</p><p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#4f46e5;color:#fff;border-radius:999px;text-decoration:none">Review the signature</a></p><p style="color:#666">Nothing shows on the wall until you approve it.</p>`,
  });

  return NextResponse.json({ ok: true });
}

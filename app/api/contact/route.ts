import { NextResponse } from "next/server";

// Sends the contact form to your inbox through Resend (https://resend.com).
// Environment variables (set them in Vercel, Project Settings, Environment Variables):
//   RESEND_API_KEY  required. Without it the form tells visitors to use email instead.
//   CONTACT_TO      optional. Defaults to exceldistrings@gmail.com.
//   CONTACT_FROM    optional. Defaults to "Portfolio <onboarding@resend.dev>", which Resend only lets you send to
//                   the email address your Resend account was created with. To send to any inbox, verify your
//                   domain in Resend and use an address on it, e.g. "Portfolio <contact@dastrings.name.ng>".

const TO = process.env.CONTACT_TO ?? "exceldistrings@gmail.com";
const FROM = process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>";
const RESEND_URL = process.env.RESEND_API_URL ?? "https://api.resend.com/emails";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
// Best-effort limit per server instance. It slows spam; the honeypot and the checks below do the rest.
const hits = new Map<string, number[]>();

function tooMany(ip: string): boolean {
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

const oneLine = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const fail = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status });

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) return fail("That didn't look like a form submission.", 400);
  const b = body as Record<string, unknown>;

  // Honeypot: a hidden field that people leave empty. Pretend it worked so bots move on.
  if (typeof b.company === "string" && b.company.trim() !== "") return NextResponse.json({ ok: true });

  const name = oneLine(b.name, 100);
  const email = oneLine(b.email, 200);
  const message = typeof b.message === "string" ? b.message.trim().slice(0, 4000) : "";
  const elapsed = typeof b.elapsed === "number" ? b.elapsed : 0;

  if (!name) return fail("Please add your name.", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Please enter a valid email address.", 400);
  if (message.length < 10) return fail("Please write a message of at least 10 characters.", 400);
  if (elapsed < 1500) return fail("That was very quick. Please check your message and send it again.", 400);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (tooMany(ip)) return fail("Too many messages from this connection. Please try again later.", 429);

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("Contact form: RESEND_API_KEY is not set.");
    return fail("The form isn't connected to email yet. Please write to exceldistrings@gmail.com instead.", 503);
  }

  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject: `Portfolio message from ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
        html: `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("Contact form: Resend returned", res.status, await res.text().catch(() => ""));
      return fail("Your message couldn't be sent. Please try again, or email exceldistrings@gmail.com.", 502);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form: send failed", err);
    return fail("Your message couldn't be sent. Please try again, or email exceldistrings@gmail.com.", 502);
  }
}

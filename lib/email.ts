// Sends an email to Excel through Resend, with the same settings as the contact form.
const TO = process.env.CONTACT_TO ?? "exceldistrings@gmail.com";
const FROM = process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>";
const RESEND_URL = process.env.RESEND_API_URL ?? "https://api.resend.com/emails";

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export async function emailExcel(msg: { subject: string; text: string; html: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [TO], ...msg }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error("Email: Resend returned", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("Email: send failed", e);
    return false;
  }
}

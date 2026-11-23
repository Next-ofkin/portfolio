// Pure helpers shared by the drawing pad, the floating wall and the server. No imports.
// A signature is drawn in a 1000 x 500 box; each stroke is a flat list [x0, y0, x1, y1, ...] of whole numbers.

export const SIG_W = 1000;
export const SIG_H = 500;
export const SIG_COLORS = ["#a5a8ff", "#f59e0b", "#f5f5f4"] as const;

export type Signature = { id: string; name: string; color: string; strokes: number[][]; createdAt: string };

// Smooth SVG path through the points (quadratic curves through midpoints).
export function strokePath(s: number[]): string {
  if (s.length < 2) return "";
  if (s.length < 6) return `M${s[0]} ${s[1]}L${s[s.length - 2] ?? s[0]} ${s[s.length - 1] ?? s[1]}`;
  let d = `M${s[0]} ${s[1]}`;
  for (let i = 2; i < s.length - 2; i += 2) {
    const mx = (s[i] + s[i + 2]) / 2;
    const my = (s[i + 1] + s[i + 3]) / 2;
    d += `Q${s[i]} ${s[i + 1]} ${mx} ${my}`;
  }
  return d + `L${s[s.length - 2]} ${s[s.length - 1]}`;
}

export type Clean = { ok: true; name: string; color: string; strokes: number[][] } | { ok: false; error: string };

export function cleanSignature(input: unknown): Clean {
  if (typeof input !== "object" || input === null) return { ok: false, error: "Nothing to save." };
  const b = input as Record<string, unknown>;
  const name =
    typeof b.name === "string"
      ? b.name
          .replace(/[\u0000-\u001f\u007f<>]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 40)
      : "";
  const color =
    typeof b.color === "string" && (SIG_COLORS as readonly string[]).includes(b.color) ? b.color : SIG_COLORS[0];
  if (!Array.isArray(b.strokes) || b.strokes.length === 0) return { ok: false, error: "Draw your signature first." };
  if (b.strokes.length > 60) return { ok: false, error: "That signature has too many strokes." };
  const strokes: number[][] = [];
  let points = 0;
  for (const raw of b.strokes) {
    if (!Array.isArray(raw) || raw.length < 2 || raw.length % 2 !== 0 || raw.length > 1200) {
      return { ok: false, error: "That drawing couldn't be read." };
    }
    const s: number[] = [];
    for (let i = 0; i < raw.length; i++) {
      const v = raw[i];
      const max = i % 2 === 0 ? SIG_W : SIG_H;
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > max) {
        return { ok: false, error: "That drawing couldn't be read." };
      }
      s.push(Math.round(v));
    }
    points += s.length / 2;
    strokes.push(s);
  }
  if (points < 8) return { ok: false, error: "Draw a little more: that's barely a dot." };
  if (points > 6000) return { ok: false, error: "That signature is too detailed." };
  return { ok: true, name, color, strokes };
}

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Excel Shogbola, Full-Stack Engineer & AI Systems Builder, Lagos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The preview shown when the site is shared (WhatsApp, LinkedIn, X): name on the left, portrait on the right,
// lit from behind in the site's amber and indigo, with the hero strings running underneath.
export default async function Image() {
  const [portrait, bold] = await Promise.all([
    readFile(join(process.cwd(), "assets/og-portrait.png")),
    readFile(join(process.cwd(), "node_modules/@fontsource/geist/files/geist-latin-700-normal.woff")),
  ]);
  const src = `data:image/png;base64,${portrait.toString("base64")}`;
  const line = (h: number, color: string) => (
    <div style={{ width: "100%", height: h, background: color, borderRadius: h, opacity: 0.85 }} />
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0a0a0a", color: "#f5f5f4" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background:
              "radial-gradient(circle at 82% 25%, rgba(245,158,11,0.4), transparent 32%), radial-gradient(circle at 62% 100%, rgba(99,102,241,0.45), transparent 40%)",
          }}
        />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 120, display: "flex", flexDirection: "column", gap: 18 }}>
          {line(2, "#6366f1")}
          {line(3, "#6366f1")}
          {line(4, "#6366f1")}
          {line(4, "#f59e0b")}
          {line(6, "#f59e0b")}
        </div>
        <img src={src} width={519} height={630} alt="" style={{ position: "absolute", right: 40, bottom: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, width: 720 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "Geist", fontSize: 118, fontWeight: 700, lineHeight: 0.92, letterSpacing: -6 }}>Excel</div>
            <div style={{ fontFamily: "Geist", fontSize: 118, fontWeight: 700, lineHeight: 0.92, letterSpacing: -6 }}>Shogbola</div>
            <div style={{ fontSize: 30, marginTop: 28, color: "#f59e0b" }}>Full-Stack Engineer & AI Systems Builder</div>
          </div>
          <div style={{ fontSize: 26, color: "#a3a3a3" }}>portfolio.dastrings.name.ng</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Geist", data: bold, weight: 700, style: "normal" }] },
  );
}

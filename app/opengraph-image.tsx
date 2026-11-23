import { ImageResponse } from "next/og";

export const alt = "Excel Shogbola, Full-Stack Engineer & AI Systems Builder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const line = (h: number, color: string) => (
    <div style={{ width: "100%", height: h, background: color, borderRadius: h }} />
  );
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#f5f5f4",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 132, fontWeight: 700, lineHeight: 0.95, letterSpacing: -6 }}>Excel Shogbola</div>
          <div style={{ fontSize: 40, marginTop: 30, color: "#f59e0b" }}>Full-Stack Engineer & AI Systems Builder</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {line(3, "#6366f1")}
          {line(5, "#6366f1")}
          {line(8, "#f59e0b")}
        </div>
      </div>
    ),
    size,
  );
}

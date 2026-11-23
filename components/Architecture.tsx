import type { ArchNode } from "@/lib/case-studies";
import { LiveSvg } from "./LiveSvg";
import { Pulse } from "./svg-motion";

const W = 168;
const H = 60;
const X = (col: number) => 24 + col * 190;
const Y = (row: number) => 24 + row * 100;

// Connect two boxes: side to side when they sit in different columns, top to bottom when stacked.
function route(a: ArchNode, b: ArchNode) {
  const ax = X(a.col);
  const ay = Y(a.row);
  const bx = X(b.col);
  const by = Y(b.row);
  if (a.col === b.col) {
    const down = b.row > a.row;
    const x = ax + W / 2;
    const y1 = down ? ay + H : ay;
    const y2 = down ? by : by + H;
    return `M${x} ${y1} L${x} ${y2}`;
  }
  const right = b.col > a.col;
  const x1 = right ? ax + W : ax;
  const x2 = right ? bx : bx + W;
  const y1 = ay + H / 2;
  const y2 = by + H / 2;
  const mx = (x1 + x2) / 2;
  return `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`;
}

const stroke = { accent: "v-acc", gold: "v-gold", dim: "v-dim" } as const;

// System diagram for a case study. Data pulses travel each connection in turn while it is on screen.
export function Architecture({ nodes, edges, label }: { nodes: ArchNode[]; edges: [string, string][]; label: string }) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const cols = Math.max(...nodes.map((n) => n.col)) + 1;
  const rows = Math.max(...nodes.map((n) => n.row)) + 1;
  const width = X(cols - 1) + W + 24;
  const height = Y(rows - 1) + H + 24;
  return (
    <div className="overflow-x-auto pb-2">
      <div className="sr-only">
        <p>{label}</p>
        <ul>
          {edges.map(([from, to]) => (
            <li key={`${from}-${to}`}>
              {byId.get(from)?.label} connects to {byId.get(to)?.label}
              {byId.get(to)?.sub ? ` (${byId.get(to)?.sub})` : ""}
            </li>
          ))}
        </ul>
      </div>
      <div className="relative min-w-[760px]" style={{ aspectRatio: `${width} / ${height}` }}>
        <LiveSvg still={1.2} viewBox={`0 0 ${width} ${height}`}>
          {edges.map(([from, to], i) => {
            const a = byId.get(from);
            const b = byId.get(to);
            if (!a || !b) return null;
            const d = route(a, b);
            return (
              <g key={`${from}-${to}`}>
                <path d={d} className="v-dim v-flow" />
                <Pulse path={d} dur={3.2} begin={i * 0.35} travel={0.4} r={4} className={b.tone === "gold" ? "v-fill-gold" : "v-fill-acc"} />
              </g>
            );
          })}
          {nodes.map((n) => (
            <g key={n.id}>
              <rect x={X(n.col)} y={Y(n.row)} width={W} height={H} rx="14" className="arch-box" />
              <rect x={X(n.col)} y={Y(n.row)} width={W} height={H} rx="14" className={stroke[n.tone ?? "dim"]} />
              <text x={X(n.col) + 16} y={Y(n.row) + (n.sub ? 26 : 35)} className="arch-label">
                {n.label}
              </text>
              {n.sub && (
                <text x={X(n.col) + 16} y={Y(n.row) + 45} className="arch-sub">
                  {n.sub}
                </text>
              )}
            </g>
          ))}
        </LiveSvg>
      </div>
    </div>
  );
}

import type { VisualKind } from "@/lib/content";

// One drawn scene per project, in the same two-colour line language as the hero strings.
// Strokes keep their width when the scene is scaled; lines flow when the card is hovered.

function Strings() {
  const channels: [string, number][] = [
    ["Email", 70],
    ["SMS", 150],
    ["WhatsApp", 230],
  ];
  const tenants = [50, 115, 180, 245];
  return (
    <>
      {channels.map(([label, y]) => (
        <g key={label}>
          <rect x="28" y={y - 17} width="112" height="34" rx="17" className="v-dim" />
          <text x="84" y={y + 4} textAnchor="middle" className="v-text">
            {label}
          </text>
          <path d={`M140 ${y} C200 ${y} 210 150 244 150`} className="v-acc v-flow" />
        </g>
      ))}
      <circle cx="270" cy="150" r="26" className="v-acc" />
      <circle cx="270" cy="150" r="7" className="v-fill-gold" />
      {tenants.map((cy) => (
        <g key={cy}>
          <path d={`M296 150 C336 150 336 ${cy} 376 ${cy}`} className="v-gold v-flow" />
          <rect x="376" y={cy - 18} width="76" height="36" rx="8" className="v-dim" />
          <path d={`M390 ${cy} H420`} className="v-dim" />
        </g>
      ))}
    </>
  );
}

function LoanPilot() {
  return (
    <>
      <path d="M60 220 C100 220 110 140 150 140 S200 200 240 200" className="v-acc v-flow" />
      {[
        [60, 220],
        [150, 140],
        [240, 200],
      ].map(([x, y]) => (
        <g key={x}>
          <circle cx={x} cy={y} r="11" className="v-dim" />
          <path d={`M${x - 4} ${y} l3 3 l5 -6`} className="v-acc" />
        </g>
      ))}
      <path d="M251 200 C270 200 270 210 290 210" className="v-acc v-flow" />
      <path d="M290 210 A80 80 0 0 1 450 210" className="v-dim" />
      <path d="M290 210 A80 80 0 0 1 417 145.3" className="v-acc" strokeWidth="3" />
      <path d="M370 210 L412 156" className="v-gold" />
      <circle cx="370" cy="210" r="5" className="v-fill-gold" />
    </>
  );
}

function Applied() {
  const dots = Array.from({ length: 24 }, (_, i) => [74 + ((i * 83) % 330), 30 + ((i * 47) % 48)]);
  return (
    <>
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.6" className={i % 7 === 0 ? "v-fill-gold" : "v-fill-dim"} />
      ))}
      <path d="M80 100 L200 165 H280 L400 100" className="v-dim" />
      <path d="M200 165 V196 M280 165 V196" className="v-dim" />
      <rect x="110" y="212" width="190" height="10" rx="5" className="v-fill-gold" />
      <rect x="110" y="232" width="125" height="10" rx="5" className="v-fill-dim" />
      <rect x="110" y="252" width="70" height="10" rx="5" className="v-fill-dim" />
      <rect x="350" y="206" width="92" height="52" rx="14" className="v-acc" />
      <path d="M368 258 L360 274 L384 258" className="v-acc" />
      <path d="M376 232 l8 8 l18 -20" className="v-gold" />
    </>
  );
}

function Oracle() {
  const nodes: [number, number][] = [
    [240, 150], [130, 92], [350, 82], [88, 205], [204, 246], [322, 232],
    [404, 160], [170, 38], [292, 34], [58, 124], [432, 92], [412, 254],
    [118, 272], [252, 74], [330, 152],
  ];
  const edges: [number, number][] = [
    [0, 13], [0, 14], [0, 4], [0, 5], [0, 1], [1, 7], [1, 9], [1, 3], [13, 8], [13, 2],
    [2, 10], [14, 6], [6, 10], [6, 11], [5, 11], [4, 12], [3, 12], [3, 9],
  ];
  return (
    <>
      {edges.map(([a, b], i) => (
        <path
          key={i}
          d={`M${nodes[a][0]} ${nodes[a][1]} L${nodes[b][0]} ${nodes[b][1]}`}
          className={a === 0 ? "v-acc v-flow" : "v-dim"}
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === 0 ? 11 : i % 4 === 0 ? 6 : 4.5}
          className={i === 0 ? "v-fill-gold" : i % 4 === 0 ? "v-fill-acc" : "v-fill-dim"}
        />
      ))}
    </>
  );
}

function Guardrail() {
  const flagged = new Set([7, 19, 31]);
  return (
    <>
      <path
        d="M240 34 L322 64 V136 C322 190 284 224 240 242 C196 224 158 190 158 136 V64 Z"
        className="v-acc"
      />
      <path d="M212 142 L232 162 L272 116" className="v-gold" />
      <path d="M60 150 H146 M334 150 H420" className="v-dim v-flow" />
      {Array.from({ length: 40 }, (_, i) => (
        <path
          key={i}
          d={`M${40 + i * 10} 280 V${flagged.has(i) ? 252 : 266}`}
          className={flagged.has(i) ? "v-gold" : "v-dim"}
        />
      ))}
    </>
  );
}

function Ippis() {
  const heights = [60, 82, 70, 112, 96, 122, 102, 142, 132, 152, 126, 164];
  return (
    <>
      {heights.map((h, i) => (
        <rect
          key={i}
          x={58 + i * 34}
          y={246 - h}
          width="18"
          height={h}
          rx="4"
          className={h >= 105 ? "v-fill-acc" : "v-fill-dim"}
        />
      ))}
      <path d="M36 141 H456" className="v-gold v-flow" />
      <text x="40" y="130" className="v-text">
        eligible
      </text>
    </>
  );
}

function Sisi() {
  const picked = new Set([1, 6]);
  const tags = new Set([1, 3, 6]);
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => {
        const x = 62 + (i % 4) * 92;
        const y = 54 + Math.floor(i / 4) * 100;
        return (
          <g key={i}>
            <rect x={x} y={y} width="78" height="86" rx="16" className={picked.has(i) ? "v-acc" : "v-dim"} />
            <circle cx={x + 39} cy={y + 38} r="15" className={picked.has(i) ? "v-acc" : "v-dim"} />
            <path d={`M${x + 16} ${y + 68} H${x + 52}`} className="v-dim" />
            {tags.has(i) && <circle cx={x + 66} cy={y + 12} r="6" className="v-fill-gold" />}
          </g>
        );
      })}
    </>
  );
}

const scenes: Record<VisualKind, () => React.JSX.Element> = {
  strings: Strings,
  loanpilot: LoanPilot,
  applied: Applied,
  oracle: Oracle,
  guardrail: Guardrail,
  ippis: Ippis,
  sisi: Sisi,
};

export function ProjectVisual({ kind }: { kind: VisualKind }) {
  const Scene = scenes[kind];
  return (
    <svg
      viewBox="0 0 480 300"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <Scene />
    </svg>
  );
}

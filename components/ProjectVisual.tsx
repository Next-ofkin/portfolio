import type { VisualKind } from "@/lib/content";
import { LiveSvg } from "./LiveSvg";

// One animated scene per project, in the same two-colour line language as the hero strings.
// Each scene tells the product's story in a few seconds (SMIL, so no script runs per frame).
// LiveSvg starts a scene's clock when it scrolls into view and pauses it off screen.

import { Flash, Pulse, Ripple, ease } from "./svg-motion";

/* ---------- Strings Automation: channels flow into one hub, then out to each tenant ---------- */
function Strings() {
  const channels: [string, number][] = [
    ["Email", 70],
    ["SMS", 150],
    ["WhatsApp", 230],
  ];
  const tenants = [50, 115, 180, 245];
  const D = 3.6;
  return (
    <>
      {channels.map(([label, y], i) => {
        const d = `M140 ${y} C200 ${y} 210 150 244 150`;
        return (
          <g key={label}>
            <rect x="28" y={y - 17} width="112" height="34" rx="17" className="v-dim" />
            <rect x="28" y={y - 17} width="112" height="34" rx="17" className="v-fill-acc" opacity="0">
              <Flash at={0} dur={D} begin={i * 1.2} peak={0.22} />
            </rect>
            <text x="84" y={y + 4} textAnchor="middle" className="v-text">
              {label}
            </text>
            <path d={d} className="v-acc v-flow" />
            <Pulse path={d} dur={D} begin={i * 1.2} travel={0.34} />
          </g>
        );
      })}
      <Ripple cx={270} cy={150} r={26} dur={1.2} />
      <circle cx="270" cy="150" r="26" className="v-acc" />
      <circle cx="270" cy="150" r="7" className="v-fill-gold" />
      {tenants.map((cy, i) => {
        const d = `M296 150 C336 150 336 ${cy} 376 ${cy}`;
        const begin = 1.25 + i * 0.9;
        return (
          <g key={cy}>
            <path d={d} className="v-gold v-flow" />
            <Pulse path={d} dur={D} begin={begin} travel={0.25} className="v-fill-gold" r={3} />
            <rect x="376" y={cy - 18} width="76" height="36" rx="8" className="v-dim" />
            <rect x="376" y={cy - 18} width="76" height="36" rx="8" className="v-fill-gold" opacity="0">
              <Flash at={0.25} dur={D} begin={begin} peak={0.3} />
            </rect>
            <path d={`M390 ${cy} H420`} className="v-dim" />
          </g>
        );
      })}
    </>
  );
}

/* ---------- Hand Graph: a hand pinches a file on the code map and throws it to a phone ---------- */
function HandGraph() {
  const D = 6;
  const bubbles: [number, number, number][] = [
    [100, 100, 58],
    [222, 196, 66],
    [248, 70, 40],
  ];
  const files: [number, number, number][] = [
    [78, 84, 4],
    [112, 74, 5],
    [128, 112, 3.5],
    [90, 124, 4.5],
    [64, 108, 3],
    [196, 172, 5],
    [250, 214, 4],
    [204, 228, 3.5],
    [246, 172, 3],
    [188, 204, 4],
    [236, 56, 4],
    [262, 84, 3.5],
    [258, 58, 3],
  ];
  const S: [number, number] = [222, 196];
  const uses = [files[1], files[3], files[10]];
  const usedBy = [files[6], files[12]];
  const route = `M340 268 L${S[0]} ${S[1]} L423 128`;
  // S sits about 37% along the route (115 of 314 units).
  const at = 0.366;
  const pts = `0;${at};${at};1;1`;
  const kt = "0;0.25;0.37;0.6;1";
  const lit = (
    <animate
      attributeName="opacity"
      values="0.2;0.2;1;1;0.2"
      keyTimes="0;0.3;0.36;0.9;1"
      dur={`${D}s`}
      repeatCount="indefinite"
    />
  );
  return (
    <>
      {bubbles.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} className="v-dim" />
      ))}
      {uses.map(([x, y]) => (
        <path key={`u${x}`} d={`M${S[0]} ${S[1]} L${x} ${y}`} className="v-acc" opacity="0.2">
          {lit}
        </path>
      ))}
      {usedBy.map(([x, y]) => (
        <path key={`b${x}`} d={`M${S[0]} ${S[1]} L${x} ${y}`} className="v-gold v-flow" opacity="0.2">
          {lit}
        </path>
      ))}
      {files.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} className={i % 5 === 1 ? "v-fill-acc" : "v-fill-dim"} />
      ))}
      <circle cx={S[0]} cy={S[1]} r="7" className="v-fill-gold" />
      <Ripple cx={S[0]} cy={S[1]} r={7} grow={14} dur={1.5} />

      {/* the phone it lands on */}
      <rect x="392" y="68" width="62" height="120" rx="12" className="v-dim" />
      <path d="M414 78 H432" className="v-dim" />
      <rect x="400" y="112" width="46" height="34" rx="6" className="v-fill-gold" opacity="0">
        <animate
          attributeName="opacity"
          values="0;0;0.55;0.55;0"
          keyTimes="0;0.6;0.64;0.9;1"
          dur={`${D}s`}
          repeatCount="indefinite"
        />
      </rect>
      <text x="423" y="210" textAnchor="middle" className="v-text" opacity="0">
        Phone got it
        <animate
          attributeName="opacity"
          values="0;0;1;1;0"
          keyTimes="0;0.62;0.66;0.9;1"
          dur={`${D}s`}
          repeatCount="indefinite"
        />
      </text>

      {/* the file card, lifted by the pinch */}
      <rect x="-15" y="-11" width="30" height="22" rx="4" className="v-gold" opacity="0">
        <animateMotion
          path={route}
          dur={`${D}s`}
          repeatCount="indefinite"
          keyPoints={`${at};${at};1;1`}
          keyTimes="0;0.37;0.6;1"
          calcMode="linear"
        />
        <animate
          attributeName="opacity"
          values="0;0;1;1;0;0"
          keyTimes="0;0.33;0.37;0.6;0.64;1"
          dur={`${D}s`}
          repeatCount="indefinite"
        />
      </rect>

      {/* thumb and index fingertips */}
      <g>
        <animateMotion
          path={route}
          dur={`${D}s`}
          repeatCount="indefinite"
          keyPoints={pts}
          keyTimes={kt}
          calcMode="spline"
          keySplines={`${ease};0 0 1 1;${ease};0 0 1 1`}
        />
        <circle r="5" className="v-acc">
          <animate
            attributeName="cx"
            values="-10;-10;-4;-4;-10;-10"
            keyTimes="0;0.24;0.3;0.6;0.66;1"
            dur={`${D}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values="9;9;3;3;9;9"
            keyTimes="0;0.24;0.3;0.6;0.66;1"
            dur={`${D}s`}
            repeatCount="indefinite"
          />
        </circle>
        <circle r="5" className="v-acc">
          <animate
            attributeName="cx"
            values="10;10;4;4;10;10"
            keyTimes="0;0.24;0.3;0.6;0.66;1"
            dur={`${D}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values="-9;-9;-3;-3;-9;-9"
            keyTimes="0;0.24;0.3;0.6;0.66;1"
            dur={`${D}s`}
            repeatCount="indefinite"
          />
        </circle>
      </g>
    </>
  );
}

/* ---------- VerifyFlow: a statement is read line by line, hidden debts light up, risk swings high ---------- */
function VerifyFlow() {
  const step = 26;
  const rows = 14;
  const flagged = new Set([2, 6, 9, 13]);
  const widths = [92, 70, 104, 60, 84, 96, 66, 88, 74, 100, 58, 90, 80, 72];
  const D = 6;
  const row = (i: number, offset: number) => {
    const y = 66 + i * step + offset;
    const f = flagged.has(i);
    return (
      <g key={`${offset}-${i}`}>
        <rect x="58" y={y} width={widths[i]} height="7" rx="3.5" className="v-fill-dim" />
        <rect x="170" y={y} width="34" height="7" rx="3.5" className={f ? "v-fill-gold" : "v-fill-dim"} />
        {f && <path d={`M52 ${y - 4} V${y + 11}`} className="v-gold" />}
      </g>
    );
  };
  const needle = "350 206";
  return (
    <>
      <defs>
        <clipPath id="vf-statement">
          <rect x="44" y="52" width="172" height="214" />
        </clipPath>
      </defs>
      <rect x="36" y="24" width="188" height="252" rx="14" className="v-dim" />
      <path d="M58 40 H140" className="v-dim" />
      <g clipPath="url(#vf-statement)">
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`0 0;0 ${-rows * step}`}
            dur={`${D * 2}s`}
            repeatCount="indefinite"
          />
          {Array.from({ length: rows }, (_, i) => row(i, 0))}
          {Array.from({ length: rows }, (_, i) => row(i, rows * step))}
        </g>
      </g>
      {/* reading line */}
      <path d="M40 160 H220" className="v-acc" opacity="0.8" />

      {/* risk gauge */}
      <path d="M266 206 A84 84 0 0 1 434 206" className="v-dim" />
      <path d="M392 133.3 A84 84 0 0 1 434 206" className="v-gold" strokeWidth="3" />
      <text x="262" y="226" className="v-text">
        Low
      </text>
      <text x="438" y="226" textAnchor="end" className="v-text">
        High
      </text>
      <path d="M350 206 L350 140" className="v-acc" strokeWidth="2.5">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values={`-72 ${needle};-72 ${needle};64 ${needle};64 ${needle};-72 ${needle}`}
          keyTimes="0;0.12;0.42;0.9;1"
          calcMode="spline"
          keySplines={`${ease};${ease};0 0 1 1;${ease}`}
          dur={`${D}s`}
          repeatCount="indefinite"
        />
      </path>
      <circle cx="350" cy="206" r="6" className="v-fill-gold" />
      <g opacity="0">
        <animate
          attributeName="opacity"
          values="0;0;1;1;0"
          keyTimes="0;0.4;0.46;0.88;1"
          dur={`${D}s`}
          repeatCount="indefinite"
        />
        <text x="350" y="252" textAnchor="middle" className="v-text">
          Hidden debt found
        </text>
        <text x="350" y="276" textAnchor="middle" className="v-text-gold">
          ₦143,000 a month · high risk
        </text>
      </g>
    </>
  );
}

/* ---------- LoanPilot: identity checks tick off one by one, then the decision gauge settles ---------- */
function LoanPilot() {
  const D = 5;
  const checks: [number, number][] = [
    [60, 220],
    [150, 140],
    [240, 200],
  ];
  const route = "M60 220 C100 220 110 140 150 140 S200 200 240 200 C270 200 270 210 290 210";
  return (
    <>
      <path d={route} className="v-acc v-flow" />
      <Pulse path={route} dur={D} travel={0.5} />
      {checks.map(([x, y], i) => {
        const a = 0.08 + i * 0.15;
        return (
          <g key={x}>
            <circle cx={x} cy={y} r="11" className="v-dim" />
            <path d={`M${x - 4} ${y} l3 3 l5 -6`} className="v-acc" opacity="0">
              <animate
                attributeName="opacity"
                values="0;0;1;1;0"
                keyTimes={`0;${a.toFixed(2)};${(a + 0.04).toFixed(2)};0.92;1`}
                dur={`${D}s`}
                repeatCount="indefinite"
              />
            </path>
          </g>
        );
      })}
      <path d="M290 210 A80 80 0 0 1 450 210" className="v-dim" />
      <path d="M290 210 A80 80 0 0 1 417 145.3" className="v-acc" strokeWidth="3" />
      <path d="M370 210 L370 142" className="v-gold">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-80 370 210;-80 370 210;38 370 210;38 370 210;-80 370 210"
          keyTimes="0;0.5;0.68;0.92;1"
          calcMode="spline"
          keySplines={`0 0 1 1;${ease};0 0 1 1;${ease}`}
          dur={`${D}s`}
          repeatCount="indefinite"
        />
      </path>
      <circle cx="370" cy="210" r="5" className="v-fill-gold" />
    </>
  );
}

/* ---------- AppliaED: jobs rain into a scorer; the best match is sent to WhatsApp ---------- */
function Applied() {
  const D = 4.8;
  const drops = [80, 140, 200, 260, 320, 380, 110, 350];
  return (
    <>
      {drops.map((x, i) => (
        <Pulse
          key={i}
          path={`M${x} 26 L240 150 L240 200`}
          dur={D}
          begin={i * 0.6}
          travel={0.32}
          r={2.8}
          className={i % 4 === 0 ? "v-fill-gold" : "v-fill-dim"}
        />
      ))}
      <path d="M80 100 L200 165 H280 L400 100" className="v-dim" />
      <path d="M200 165 V196 M280 165 V196" className="v-dim" />
      <rect x="110" y="212" width="190" height="10" rx="5" className="v-fill-gold">
        <animate
          attributeName="width"
          values="8;190;190;8"
          keyTimes="0;0.3;0.9;1"
          dur={`${D}s`}
          repeatCount="indefinite"
        />
      </rect>
      <rect x="110" y="232" width="125" height="10" rx="5" className="v-fill-dim">
        <animate
          attributeName="width"
          values="8;125;125;8"
          keyTimes="0;0.36;0.9;1"
          dur={`${D}s`}
          repeatCount="indefinite"
        />
      </rect>
      <rect x="110" y="252" width="70" height="10" rx="5" className="v-fill-dim">
        <animate
          attributeName="width"
          values="8;70;70;8"
          keyTimes="0;0.42;0.9;1"
          dur={`${D}s`}
          repeatCount="indefinite"
        />
      </rect>
      <rect x="350" y="206" width="92" height="52" rx="14" className="v-acc" />
      <path d="M368 258 L360 274 L384 258" className="v-acc" />
      <path d="M376 232 l8 8 l18 -20" className="v-gold" opacity="0">
        <animate
          attributeName="opacity"
          values="0;0;1;1;0"
          keyTimes="0;0.45;0.5;0.9;1"
          dur={`${D}s`}
          repeatCount="indefinite"
        />
      </path>
    </>
  );
}

/* ---------- OracleNA: queries ripple out from the core of a code graph ---------- */
function Oracle() {
  const nodes: [number, number][] = [
    [240, 150],
    [130, 92],
    [350, 82],
    [88, 205],
    [204, 246],
    [322, 232],
    [404, 160],
    [170, 38],
    [292, 34],
    [58, 124],
    [432, 92],
    [412, 254],
    [118, 272],
    [252, 74],
    [330, 152],
  ];
  const edges: [number, number][] = [
    [0, 13],
    [0, 14],
    [0, 4],
    [0, 5],
    [0, 1],
    [1, 7],
    [1, 9],
    [1, 3],
    [13, 8],
    [13, 2],
    [2, 10],
    [14, 6],
    [6, 10],
    [6, 11],
    [5, 11],
    [4, 12],
    [3, 12],
    [3, 9],
  ];
  const path = (a: number, b: number) => `M${nodes[a][0]} ${nodes[a][1]} L${nodes[b][0]} ${nodes[b][1]}`;
  return (
    <>
      {edges.map(([a, b], i) => (
        <path key={i} d={path(a, b)} className={a === 0 ? "v-acc v-flow" : "v-dim"} />
      ))}
      {edges
        .filter(([a]) => a === 0)
        .map(([a, b], i) => (
          <Pulse
            key={`p${i}`}
            path={path(a, b)}
            dur={2.5}
            begin={i * 0.5}
            travel={0.45}
            r={3}
            className="v-fill-gold"
          />
        ))}
      {edges
        .filter(([a]) => a !== 0)
        .slice(0, 6)
        .map(([a, b], i) => (
          <Pulse key={`q${i}`} path={path(a, b)} dur={3} begin={1 + i * 0.45} travel={0.4} r={2.4} />
        ))}
      <Ripple cx={240} cy={150} r={11} grow={22} dur={2} />
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

/* ---------- GuardRail AML: a scanner sweeps transactions and flags the suspicious ones ---------- */
function Guardrail() {
  const D = 4;
  const flagged = new Set([7, 19, 31]);
  return (
    <>
      <path d="M240 34 L322 64 V136 C322 190 284 224 240 242 C196 224 158 190 158 136 V64 Z" className="v-acc" />
      <path
        d="M240 34 L322 64 V136 C322 190 284 224 240 242 C196 224 158 190 158 136 V64 Z"
        className="v-acc"
        opacity="0"
      >
        <animate attributeName="opacity" values="0;0.9;0" dur="2s" repeatCount="indefinite" />
        <animate attributeName="stroke-width" values="1.75;6;1.75" dur="2s" repeatCount="indefinite" />
      </path>
      <path d="M212 142 L232 162 L272 116" className="v-gold" />
      <path d="M60 150 H146 M334 150 H420" className="v-dim v-flow" />
      {Array.from({ length: 40 }, (_, i) => {
        const f = flagged.has(i);
        const at = (i * 10) / 400;
        return (
          <path
            key={i}
            d={`M${40 + i * 10} 280 V${f ? 248 : 266}`}
            className={f ? "v-gold" : "v-dim"}
            opacity={f ? 0.35 : 1}
          >
            {f && (
              <animate
                attributeName="opacity"
                values="0.35;0.35;1;1;0.35"
                keyTimes={`0;${at.toFixed(3)};${(at + 0.02).toFixed(3)};${(at + 0.18).toFixed(3)};1`}
                dur={`${D}s`}
                repeatCount="indefinite"
              />
            )}
          </path>
        );
      })}
      <path d="M40 240 V288" className="v-acc" strokeWidth="2.5">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0;400 0"
          dur={`${D}s`}
          repeatCount="indefinite"
        />
      </path>
    </>
  );
}

/* ---------- NOLT IPPIS: payroll bars rise; the ones above the line qualify ---------- */
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
        >
          <animate
            attributeName="height"
            values={`0;${h}`}
            dur="1s"
            begin={`${i * 0.09}s`}
            fill="freeze"
            calcMode="spline"
            keySplines={ease}
          />
          <animate
            attributeName="y"
            values={`246;${246 - h}`}
            dur="1s"
            begin={`${i * 0.09}s`}
            fill="freeze"
            calcMode="spline"
            keySplines={ease}
          />
        </rect>
      ))}
      <path d="M36 141 H456" className="v-gold v-flow" />
      <Pulse path="M36 141 H456" dur={3.2} begin={1.6} travel={0.9} r={4} className="v-fill-gold" />
      <text x="40" y="130" className="v-text">
        eligible
      </text>
    </>
  );
}

/* ---------- Sisi Igbadun: a shopper's pick moves across the shelf ---------- */
function Sisi() {
  const tags = new Set([1, 3, 6]);
  const pos = (i: number) => [62 + (i % 4) * 92, 54 + Math.floor(i / 4) * 100];
  const order = [1, 6, 3, 4, 2, 7, 0, 5];
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => {
        const [x, y] = pos(i);
        return (
          <g key={i}>
            <rect x={x} y={y} width="78" height="86" rx="16" className="v-dim" />
            <circle cx={x + 39} cy={y + 38} r="15" className="v-dim" />
            <path d={`M${x + 16} ${y + 68} H${x + 52}`} className="v-dim" />
            {tags.has(i) && <circle cx={x + 66} cy={y + 12} r="6" className="v-fill-gold" />}
          </g>
        );
      })}
      <rect
        width="78"
        height="86"
        rx="16"
        className="v-acc"
        strokeWidth="2.5"
        x={pos(order[0])[0]}
        y={pos(order[0])[1]}
      >
        <animate
          attributeName="x"
          values={order.map((i) => pos(i)[0]).join(";")}
          dur="8s"
          calcMode="discrete"
          repeatCount="indefinite"
        />
        <animate
          attributeName="y"
          values={order.map((i) => pos(i)[1]).join(";")}
          dur="8s"
          calcMode="discrete"
          repeatCount="indefinite"
        />
      </rect>
    </>
  );
}

/* ---------- autoApply-ng: five job boards feed a cheap filter, then the AI, then a WhatsApp alert ---------- */
function AutoApply() {
  const D = 4.5;
  const boards = [50, 100, 150, 200, 250];
  return (
    <>
      {boards.map((y, i) => {
        const d = `M118 ${y} C150 ${y} 160 150 196 150`;
        return (
          <g key={y}>
            <rect x="30" y={y - 15} width="88" height="30" rx="8" className="v-dim" />
            <path d={`M44 ${y} H96`} className="v-dim" />
            <path d={d} className="v-dim v-flow" />
            <Pulse path={d} dur={D} begin={i * 0.45} travel={0.3} r={3} className="v-fill-dim" />
          </g>
        );
      })}
      {/* embeddings filter: many in, few through */}
      <path d="M196 104 L238 132 V168 L196 196 Z" className="v-acc" />
      <path d="M238 150 H300" className="v-acc v-flow" />
      <Pulse path="M238 150 H300" dur={D} begin={0.9} travel={0.2} className="v-fill-acc" />
      <Pulse path="M238 150 H300" dur={D} begin={2.6} travel={0.2} className="v-fill-acc" />
      {/* the LLM explains the fit */}
      <circle cx="324" cy="150" r="24" className="v-gold" />
      <Ripple cx={324} cy={150} r={24} grow={14} dur={1.8} />
      <circle cx="324" cy="150" r="6" className="v-fill-gold" />
      <path d="M348 150 H392" className="v-gold v-flow" />
      <Pulse path="M348 150 H392" dur={D} begin={1.5} travel={0.15} className="v-fill-gold" />
      <Pulse path="M348 150 H392" dur={D} begin={3.2} travel={0.15} className="v-fill-gold" />
      {/* WhatsApp alert */}
      <rect x="392" y="124" width="62" height="44" rx="12" className="v-acc" />
      <path d="M404 168 L398 182 L418 168" className="v-acc" />
      <path d="M408 140 H440 M408 152 H428" className="v-dim" />
      {/* every six hours */}
      <circle cx="424" cy="58" r="22" className="v-dim" />
      <path d="M424 58 V42" className="v-gold" strokeWidth="2.5">
        <animateTransform attributeName="transform" type="rotate" values="0 424 58;360 424 58" dur="6s" repeatCount="indefinite" />
      </path>
      <text x="424" y="100" textAnchor="middle" className="v-text">
        every 6 h
      </text>
    </>
  );
}

/* ---------- DaStrings: a business picks a template site, claims it, and posts go out on their own ---------- */
function DaStrings() {
  const D = 6;
  const cards = [40, 180, 320];
  return (
    <>
      {cards.map((x, i) => (
        <g key={x}>
          <rect x={x} y="40" width="120" height="150" rx="12" className="v-dim" />
          <path d={`M${x} 62 H${x + 120}`} className="v-dim" />
          <circle cx={x + 12} cy="51" r="2.5" className="v-fill-dim" />
          <circle cx={x + 22} cy="51" r="2.5" className="v-fill-dim" />
          <rect x={x + 14} y="76" width="92" height="40" rx="6" className={i === 1 ? "v-acc" : "v-dim"} />
          <path d={`M${x + 14} 132 H${x + 96} M${x + 14} 146 H${x + 76} M${x + 14} 160 H${x + 86}`} className="v-dim" />
        </g>
      ))}
      {/* the claimed site */}
      <rect x="180" y="40" width="120" height="150" rx="12" className="v-gold" strokeWidth="2.5" opacity="0">
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.3;0.34;0.9;1" dur={`${D}s`} repeatCount="indefinite" />
      </rect>
      <g opacity="0">
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.32;0.36;0.9;1" dur={`${D}s`} repeatCount="indefinite" />
        <circle cx="290" cy="40" r="12" className="v-fill-gold" />
        <path d="M284 40 l4 4 l8 -8" stroke="#0a0a0a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
      {/* the visitor's pointer */}
      <circle r="7" className="v-acc" strokeWidth="2.5">
        <animateMotion
          path="M90 270 C150 250 210 180 240 120"
          dur={`${D}s`}
          repeatCount="indefinite"
          keyPoints="0;1;1;0"
          keyTimes="0;0.3;0.85;1"
          calcMode="linear"
        />
      </circle>
      {/* automated social posts, each with an email alert */}
      {[300, 344, 388].map((x, i) => (
        <g key={x}>
          <rect x={x} y="236" width="30" height="30" rx="8" className="v-dim" />
          <Pulse path={`M240 190 C250 230 ${x} 210 ${x + 15} 236`} dur={D} begin={2.4 + i * 0.4} travel={0.18} r={3} className="v-fill-gold" />
        </g>
      ))}
      <rect x="436" y="240" width="30" height="22" rx="4" className="v-acc" />
      <path d="M436 242 L451 254 L466 242" className="v-acc" />
    </>
  );
}

/* ---------- Benniepocket: savings land in each business's own pocket, kept apart ---------- */
function Benniepocket() {
  const D = 5;
  const pockets = [60, 170, 280, 390];
  return (
    <>
      {pockets.map((x, i) => (
        <g key={x}>
          {i > 0 && <path d={`M${x - 25} 60 V270`} className="v-dim v-flow" />}
          <Pulse path={`M${x + 30} 20 L${x + 30} 200`} dur={D} begin={i * 0.7} travel={0.35} r={5} className="v-fill-gold" />
          <Pulse path={`M${x + 30} 20 L${x + 30} 200`} dur={D} begin={i * 0.7 + 2.4} travel={0.35} r={5} className="v-fill-gold" />
          <path d={`M${x} 110 V250 Q${x} 268 ${x + 18} 268 H${x + 42} Q${x + 60} 268 ${x + 60} 250 V110`} className="v-acc" />
          <rect x={x + 6} y={262 - 40 - i * 12} width="48" height={40 + i * 12} rx="6" className="v-fill-acc" opacity="0.35">
            <animate
              attributeName="height"
              values={`${20 + i * 8};${60 + i * 14};${20 + i * 8}`}
              dur={`${D * 2}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              values={`${262 - 20 - i * 8};${262 - 60 - i * 14};${262 - 20 - i * 8}`}
              dur={`${D * 2}s`}
              repeatCount="indefinite"
            />
          </rect>
        </g>
      ))}
    </>
  );
}

const scenes: Record<VisualKind, { Scene: () => React.JSX.Element; still: number }> = {
  strings: { Scene: Strings, still: 1.6 },
  handgraph: { Scene: HandGraph, still: 2.6 },
  verifyflow: { Scene: VerifyFlow, still: 3.6 },
  loanpilot: { Scene: LoanPilot, still: 4.2 },
  applied: { Scene: Applied, still: 2.6 },
  oracle: { Scene: Oracle, still: 1 },
  guardrail: { Scene: Guardrail, still: 1.3 },
  ippis: { Scene: Ippis, still: 3 },
  sisi: { Scene: Sisi, still: 0.5 },
  autoapply: { Scene: AutoApply, still: 1.6 },
  dastrings: { Scene: DaStrings, still: 3 },
  benniepocket: { Scene: Benniepocket, still: 1.2 },
};

export function ProjectVisual({ kind }: { kind: VisualKind }) {
  const { Scene, still } = scenes[kind];
  return (
    <LiveSvg still={still}>
      <Scene />
    </LiveSvg>
  );
}

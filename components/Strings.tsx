"use client";

import { useEffect, useRef } from "react";

// The signature moment: six strings, thin indigo on top and heavier amber wound strings below.
// Each string is a row of points that follows the wave equation, so a pluck travels, reflects and fades like a real one.
// Move the pointer across a string, or tap one, to pluck it. The page also strums once, right after the name lands.

const PAD = 28;
const POINTS = 64;
const SUBSTEPS = 6;

type Spec = {
  at: number; // 0 (top) to 1 (bottom) within the band
  width: number; // stroke width in px
  opacity: number;
  k: number; // wave speed squared: higher is a brighter, faster string
  damp: number; // per-step decay: closer to 1 rings longer
  tone: "accent" | "gold";
};

const SPECS: Spec[] = [
  { at: 0.0, width: 1.25, opacity: 0.7, k: 0.46, damp: 0.9935, tone: "accent" },
  { at: 0.2, width: 1.5, opacity: 0.8, k: 0.4, damp: 0.9945, tone: "accent" },
  { at: 0.4, width: 2, opacity: 0.95, k: 0.34, damp: 0.995, tone: "accent" },
  { at: 0.6, width: 2.5, opacity: 0.9, k: 0.28, damp: 0.9958, tone: "gold" },
  { at: 0.8, width: 3, opacity: 0.95, k: 0.23, damp: 0.9965, tone: "gold" },
  { at: 1.0, width: 3.75, opacity: 1, k: 0.19, damp: 0.997, tone: "gold" },
];

export function Strings({ height = 200 }: { height?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const baseY = (s: Spec) => PAD + s.at * (height - PAD * 2);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ys = SPECS.map((s) => PAD + s.at * (height - PAD * 2));
    const u = SPECS.map(() => new Float32Array(POINTS)); // displacement
    const v = SPECS.map(() => new Float32Array(POINTS)); // velocity
    const lastPluck = SPECS.map(() => 0);
    const timers: number[] = [];

    let width = wrap.clientWidth;
    let raf = 0;
    let running = false;

    const draw = (i: number) => {
      const el = pathRefs.current[i];
      if (!el) return;
      const y = ys[i];
      const ui = u[i];
      const step = width / (POINTS - 1);
      let d = `M0 ${y}`;
      for (let j = 1; j < POINTS - 1; j++) {
        const x = j * step;
        const py = y + ui[j];
        const nx = (j + 1) * step;
        const ny = y + ui[j + 1];
        d += `Q${x.toFixed(1)} ${py.toFixed(2)} ${((x + nx) / 2).toFixed(1)} ${((py + ny) / 2).toFixed(2)}`;
      }
      d += `L${width} ${y}`;
      el.setAttribute("d", d);
    };

    const drawAll = () => SPECS.forEach((_, i) => draw(i));

    const tick = () => {
      let energy = 0;
      for (let i = 0; i < SPECS.length; i++) {
        const { k, damp } = SPECS[i];
        const ui = u[i];
        const vi = v[i];
        for (let s = 0; s < SUBSTEPS; s++) {
          for (let j = 1; j < POINTS - 1; j++) {
            vi[j] += k * (ui[j - 1] + ui[j + 1] - 2 * ui[j]);
          }
          for (let j = 1; j < POINTS - 1; j++) {
            vi[j] *= damp;
            ui[j] += vi[j];
          }
        }
        for (let j = 1; j < POINTS - 1; j++) {
          energy = Math.max(energy, Math.abs(ui[j]) + Math.abs(vi[j]) * 4);
        }
        draw(i);
      }
      if (energy > 0.05) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
        u.forEach((a) => a.fill(0));
        v.forEach((a) => a.fill(0));
        drawAll();
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    // disp is how far the string is pushed, in px. Positive pushes it down.
    const pluck = (i: number, xFrac: number, disp: number) => {
      const centre = Math.min(Math.max(xFrac, 0.02), 0.98) * (POINTS - 1);
      const amp = disp * Math.sqrt(SPECS[i].k) * 0.36;
      const vi = v[i];
      for (let j = 1; j < POINTS - 1; j++) {
        const d = j - centre;
        vi[j] += amp * Math.exp(-(d * d) / (2 * 2.2 * 2.2));
      }
      start();
    };

    drawAll();

    const ro = new ResizeObserver(() => {
      width = wrap.clientWidth;
      drawAll();
    });
    ro.observe(wrap);

    if (reduceMotion) {
      return () => ro.disconnect();
    }

    // One strum after the name lands, thin to heavy.
    SPECS.forEach((_, i) => {
      timers.push(window.setTimeout(() => pluck(i, 0.18, 15), 1100 + i * 110));
    });

    let prev: { x: number; y: number } | null = null;
    const local = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const p = local(e);
      if (prev) {
        for (let i = 0; i < SPECS.length; i++) {
          const y = ys[i];
          if ((prev.y - y) * (p.y - y) < 0) {
            const t = (y - prev.y) / (p.y - prev.y);
            const x = prev.x + t * (p.x - prev.x);
            const now = performance.now();
            if (x > 0 && x < width && now - lastPluck[i] > 80) {
              lastPluck[i] = now;
              const dy = p.y - prev.y;
              const disp = Math.sign(dy) * Math.min(26, Math.max(9, Math.abs(dy) * 0.8));
              pluck(i, x / width, disp);
            }
          }
        }
      }
      prev = p;
    };

    const onLeave = () => {
      prev = null;
    };

    const onDown = (e: PointerEvent) => {
      const p = local(e);
      let best = -1;
      let bestDist = 30;
      ys.forEach((y, i) => {
        const dist = Math.abs(p.y - y);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      if (best >= 0) pluck(best, p.x / width, 18);
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("pointerdown", onDown);

    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("pointerdown", onDown);
      timers.forEach((t) => window.clearTimeout(t));
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [height]);

  return (
    <div ref={wrapRef} aria-hidden="true" className="relative select-none" style={{ height, touchAction: "pan-y" }}>
      <svg width="100%" height={height} className="block overflow-hidden" focusable="false">
        {SPECS.map((s, i) => (
          <path
            key={i}
            ref={(el) => {
              pathRefs.current[i] = el;
            }}
            d={`M0 ${baseY(s)} H4000`}
            fill="none"
            strokeWidth={s.width}
            strokeOpacity={s.opacity}
            strokeLinecap="round"
            className={s.tone === "gold" ? "string-gold" : "string-accent"}
          />
        ))}
      </svg>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HandPoint } from "@/lib/hands";

const WORDS = ["Excel", "Lagos", "Build", "Ship it"];
const ACCENT = "#6366f1";
const SOFT = "#a5a8ff";
const GOLD = "#f59e0b";

type Sim = {
  n: number;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  tx: Float32Array;
  ty: Float32Array;
  w: number;
  h: number;
  dpr: number;
};

type Status = "idle" | "starting" | "on" | "camera-error" | "model-error";

// Points inside the word, in canvas pixels, `n` of them, shuffled so particles cross the field when it changes.
function wordTargets(word: string, w: number, h: number, n: number, family: string) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { tx: new Float32Array(n), ty: new Float32Array(n) };
  let size = h * 0.62;
  ctx.font = `700 ${size}px ${family}`;
  const width = ctx.measureText(word).width;
  if (width > w * 0.86) size *= (w * 0.86) / width;
  ctx.font = `700 ${size}px ${family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(word, w / 2, h / 2);
  const data = ctx.getImageData(0, 0, w, h).data;
  const gap = Math.max(2, Math.round(Math.sqrt((w * h) / (n * 9))));
  const pts: number[] = [];
  for (let y = 0; y < h; y += gap) {
    for (let x = 0; x < w; x += gap) {
      if (data[(y * w + x) * 4 + 3] > 128) pts.push(x, y);
    }
  }
  const count = pts.length / 2;
  const tx = new Float32Array(n);
  const ty = new Float32Array(n);
  const order = Array.from({ length: n }, (_, i) => i).sort(() => Math.random() - 0.5);
  for (let i = 0; i < n; i++) {
    const k = count ? (order[i] % count) * 2 : 0;
    tx[i] = (pts[k] ?? w / 2) + (Math.random() - 0.5) * gap;
    ty[i] = (pts[k + 1] ?? h / 2) + (Math.random() - 0.5) * gap;
  }
  return { tx, ty };
}

export function ParticleField() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sim = useRef<Sim | null>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const hands = useRef<HandPoint[]>([]);
  const pinched = useRef<boolean[]>([]);
  const word = useRef(0);
  const stopHands = useRef<(() => void) | null>(null);
  const redraw = useRef<() => void>(() => {});
  const [status, setStatus] = useState<Status>("idle");
  const [label, setLabel] = useState(WORDS[0]);

  const family = useRef("sans-serif");

  const retarget = useCallback(() => {
    const s = sim.current;
    if (!s) return;
    const t = wordTargets(WORDS[word.current], s.w, s.h, s.n, family.current);
    s.tx = t.tx;
    s.ty = t.ty;
    setLabel(WORDS[word.current]);
  }, []);

  // Scatter outward from a point, then settle into the next word.
  const burst = useCallback(
    (cx: number, cy: number) => {
      const s = sim.current;
      if (!s) return;
      for (let i = 0; i < s.n; i++) {
        const dx = s.x[i] - cx;
        const dy = s.y[i] - cy;
        const d = Math.hypot(dx, dy) || 1;
        const f = (14 + Math.random() * 10) * s.dpr;
        s.vx[i] += (dx / d) * f;
        s.vy[i] += (dy / d) * f;
      }
      word.current = (word.current + 1) % WORDS.length;
      retarget();
      redraw.current();
    },
    [retarget],
  );

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bodyFont = getComputedStyle(document.documentElement).getPropertyValue("--font-display").trim();
    family.current = bodyFont || '"Geist Variable", sans-serif';

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(wrap.clientWidth * dpr));
      const h = Math.max(1, Math.round(wrap.clientHeight * dpr));
      canvas.width = w;
      canvas.height = h;
      const n = wrap.clientWidth < 640 ? 1100 : 2200;
      const prev = sim.current;
      const s: Sim = {
        n,
        x: new Float32Array(n),
        y: new Float32Array(n),
        vx: new Float32Array(n),
        vy: new Float32Array(n),
        tx: new Float32Array(n),
        ty: new Float32Array(n),
        w,
        h,
        dpr,
      };
      for (let i = 0; i < n; i++) {
        if (prev && i < prev.n) {
          s.x[i] = (prev.x[i] / prev.w) * w;
          s.y[i] = (prev.y[i] / prev.h) * h;
        } else {
          s.x[i] = Math.random() * w;
          s.y[i] = Math.random() * h;
        }
      }
      sim.current = s;
      retarget();
      if (reduce) {
        s.x.set(s.tx);
        s.y.set(s.ty);
      }
    };

    const draw = () => {
      const s = sim.current;
      if (!s) return;
      ctx.clearRect(0, 0, s.w, s.h);
      const size = 1.7 * s.dpr;
      for (const [color, test] of [
        [ACCENT, (i: number) => i % 9 !== 0 && i % 5 !== 0],
        [SOFT, (i: number) => i % 5 === 0 && i % 9 !== 0],
        [GOLD, (i: number) => i % 9 === 0],
      ] as const) {
        ctx.fillStyle = color;
        for (let i = 0; i < s.n; i++) if (test(i)) ctx.fillRect(s.x[i], s.y[i], size, size);
      }
      // Hand cursors
      for (const hp of hands.current) {
        const x = hp.x * s.w;
        const y = hp.y * s.h;
        ctx.beginPath();
        ctx.arc(x, y, (hp.pinch ? 10 : 18) * s.dpr, 0, Math.PI * 2);
        ctx.strokeStyle = hp.pinch ? GOLD : SOFT;
        ctx.lineWidth = 2 * s.dpr;
        ctx.stroke();
      }
    };
    redraw.current = () => {
      if (reduce) {
        const s = sim.current;
        if (s) {
          s.x.set(s.tx);
          s.y.set(s.ty);
        }
        draw();
      }
    };

    const step = (t: number) => {
      const s = sim.current;
      if (!s) return;
      const pts: [number, number][] = [];
      if (pointer.current) pts.push([pointer.current.x * s.dpr, pointer.current.y * s.dpr]);
      for (const hp of hands.current) pts.push([hp.x * s.w, hp.y * s.h]);
      const R = 90 * s.dpr;
      const R2 = R * R;
      const time = t / 1000;
      for (let i = 0; i < s.n; i++) {
        // gentle shimmer around the target
        const tx = s.tx[i] + Math.sin(time * 1.3 + i) * 0.8 * s.dpr;
        const ty = s.ty[i] + Math.cos(time * 1.1 + i * 0.7) * 0.8 * s.dpr;
        let vx = s.vx[i] + (tx - s.x[i]) * 0.035;
        let vy = s.vy[i] + (ty - s.y[i]) * 0.035;
        for (const [px, py] of pts) {
          const dx = s.x[i] - px;
          const dy = s.y[i] - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const f = (1 - d / R) * 6 * s.dpr;
            vx += (dx / d) * f;
            vy += (dy / d) * f;
          }
        }
        vx *= 0.84;
        vy *= 0.84;
        s.vx[i] = vx;
        s.vy[i] = vy;
        s.x[i] += vx;
        s.y[i] += vy;
      }
    };

    let raf = 0;
    let running = false;
    const frame = (t: number) => {
      step(t);
      draw();
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    let ready = false;
    const init = () => {
      if (ready) return;
      ready = true;
      setup();
      draw();
    };
    // Wait for the display font so the word is drawn in Geist, not a fallback.
    (document.fonts?.ready ?? Promise.resolve()).then(init, init);

    const ro = new ResizeObserver(() => {
      if (!ready) return;
      setup();
      draw();
    });
    ro.observe(wrap);

    let inView = false;
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        if (inView) start();
        else stop();
      },
      { threshold: 0.05 },
    );
    io.observe(wrap);
    const onVis = () => {
      if (document.hidden) stop();
      else if (inView) start();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [retarget]);

  useEffect(() => () => stopHands.current?.(), []);

  const local = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const toggleHands = async () => {
    if (status === "on" || status === "starting") {
      stopHands.current?.();
      stopHands.current = null;
      hands.current = [];
      setStatus("idle");
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    setStatus("starting");
    try {
      const { startHands } = await import("@/lib/hands");
      stopHands.current = await startHands(video, (hs) => {
        hands.current = hs;
        hs.forEach((h, i) => {
          if (h.pinch && !pinched.current[i]) {
            const s = sim.current;
            if (s) burst(h.x * s.w, h.y * s.h);
          }
          pinched.current[i] = h.pinch;
        });
        pinched.current.length = hs.length;
      });
      setStatus("on");
    } catch (e) {
      setStatus(e instanceof Error && e.message === "model" ? "model-error" : "camera-error");
    }
  };

  const message =
    status === "starting"
      ? "Starting the camera and the hand model…"
      : status === "on"
        ? "Hands on. Move your hand through the word; pinch to change it."
        : status === "camera-error"
          ? "The camera didn't start. Allow camera access for this site, then try again."
          : status === "model-error"
            ? "The hand-tracking model didn't download. Check your connection, then try again."
          : "Move through it. Tap or click to change the word.";

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative h-[46svh] min-h-[18rem] max-h-[40rem] md:h-[62svh] md:min-h-[22rem] overflow-hidden rounded-[2rem] border border-line bg-[#0b0b0b]"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full cursor-crosshair touch-pan-y"
          role="img"
          aria-label={`Particles forming the word ${label}`}
          onPointerMove={(e) => (pointer.current = local(e))}
          onPointerLeave={() => (pointer.current = null)}
          onPointerCancel={() => (pointer.current = null)}
          onPointerDown={(e) => {
            const p = local(e);
            const dpr = sim.current?.dpr ?? 1;
            burst(p.x * dpr, p.y * dpr);
          }}
        />
        <video
          ref={videoRef}
          aria-hidden="true"
          className={`pointer-events-none absolute right-4 bottom-4 w-28 -scale-x-100 rounded-xl border border-line opacity-60 md:w-40 ${
            status === "on" ? "" : "hidden"
          }`}
        />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted" aria-live="polite">
          {message}
        </p>
        <button
          type="button"
          onClick={toggleHands}
          aria-pressed={status === "on"}
          className="rounded-full border border-line-strong px-5 py-2.5 font-medium transition-colors hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {status === "on" || status === "starting" ? "Turn off the camera" : "Use your hands"}
        </button>
      </div>
      <p className="mt-2 text-sm text-muted/80">The camera image stays on your device. Nothing is recorded or sent.</p>
    </div>
  );
}

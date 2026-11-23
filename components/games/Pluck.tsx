"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useBest } from "@/lib/useBest";

// Pluck: notes slide along the six strings toward the amber line. Tap (or press 1–6) the string as a note
// crosses the line. 30 seconds; it speeds up as you go.

const STRINGS = 6;
const ROUND = 30;
const COLORS = ["#6366f1", "#6366f1", "#6366f1", "#f59e0b", "#f59e0b", "#f59e0b"];
const BEST_KEY = "pluck-best";

type Note = { s: number; x: number; hit: boolean };
type State = "idle" | "playing" | "done";

export function Pluck() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<State>("idle");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [time, setTime] = useState(ROUND);
  const [best, offerBest] = useBest(BEST_KEY);
  const [newBest, setNewBest] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const game = useRef({
    notes: [] as Note[],
    amp: new Array(STRINGS).fill(0) as number[],
    start: 0,
    last: 0,
    nextSpawn: 0,
    score: 0,
    combo: 0,
    w: 0,
    h: 0,
    dpr: 1,
    running: false,
  });

  const layout = useCallback(() => {
    const g = game.current;
    const pad = g.h * 0.12;
    const gap = (g.h - pad * 2) / (STRINGS - 1);
    return { y: (s: number) => pad + s * gap, gap, hitX: g.w * 0.18 };
  }, []);

  const draw = useCallback(
    (t: number) => {
      const c = canvasRef.current;
      const ctx = c?.getContext("2d");
      if (!c || !ctx) return;
      const g = game.current;
      const { y, hitX } = layout();
      ctx.clearRect(0, 0, g.w, g.h);

      // hit line
      ctx.strokeStyle = "rgba(245,158,11,0.55)";
      ctx.lineWidth = 2 * g.dpr;
      ctx.setLineDash([4 * g.dpr, 6 * g.dpr]);
      ctx.beginPath();
      ctx.moveTo(hitX, 0);
      ctx.lineTo(hitX, g.h);
      ctx.stroke();
      ctx.setLineDash([]);

      // strings, vibrating when plucked
      for (let s = 0; s < STRINGS; s++) {
        const a = g.amp[s];
        ctx.strokeStyle = COLORS[s];
        ctx.lineWidth = (1 + s * 0.45) * g.dpr;
        ctx.beginPath();
        for (let i = 0; i <= 48; i++) {
          const px = (i / 48) * g.w;
          const py = y(s) + a * Math.sin((Math.PI * i) / 48) * Math.sin(t / 22 + s);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // notes
      for (const n of g.notes) {
        ctx.beginPath();
        ctx.arc(n.x, y(n.s), 9 * g.dpr, 0, Math.PI * 2);
        ctx.fillStyle = n.s < 3 ? "#a5a8ff" : "#fbbf24";
        ctx.fill();
      }
    },
    [layout],
  );

  // size the canvas to its box
  useEffect(() => {
    const wrap = wrapRef.current;
    const c = canvasRef.current;
    if (!wrap || !c) return;
    const resize = () => {
      const g = game.current;
      g.dpr = Math.min(window.devicePixelRatio || 1, 2);
      g.w = Math.round(wrap.clientWidth * g.dpr);
      g.h = Math.round(wrap.clientHeight * g.dpr);
      c.width = g.w;
      c.height = g.h;
      draw(0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [draw]);

  const end = useCallback(() => {
    const g = game.current;
    g.running = false;
    setState("done");
    setNewBest(offerBest(g.score));
  }, [offerBest]);

  // game loop
  useEffect(() => {
    if (state !== "playing") return;
    let raf = 0;
    const g = game.current;
    const frame = (t: number) => {
      if (!g.running) return;
      if (!g.start) {
        g.start = t;
        g.last = t;
        g.nextSpawn = t + 500;
      }
      const dt = Math.min(50, t - g.last) / 1000;
      g.last = t;
      const elapsed = (t - g.start) / 1000;
      const left = Math.max(0, ROUND - elapsed);
      setTime(Math.ceil(left));
      if (left <= 0) {
        end();
        draw(t);
        return;
      }
      const { hitX } = layout();
      const speed = (g.w / 3.2) * (1 + elapsed / 30); // crosses the screen in ~3s, twice as fast by the end
      if (t >= g.nextSpawn) {
        g.notes.push({ s: Math.floor(Math.random() * STRINGS), x: g.w + 12 * g.dpr, hit: false });
        g.nextSpawn = t + Math.max(260, 760 - elapsed * 16) + Math.random() * 260;
      }
      for (const n of g.notes) n.x -= speed * dt;
      const tol = 40 * g.dpr;
      const missed = g.notes.filter((n) => n.x < hitX - tol);
      if (missed.length) {
        g.combo = 0;
        setCombo(0);
      }
      g.notes = g.notes.filter((n) => n.x >= hitX - tol);
      for (let s = 0; s < STRINGS; s++) g.amp[s] *= 0.9;
      draw(t);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [state, draw, end, layout]);

  const pluck = useCallback(
    (s: number) => {
      const g = game.current;
      if (!g.running) return;
      const { hitX, gap } = layout();
      g.amp[s] = gap * 0.32;
      const tol = 40 * g.dpr;
      let bestI = -1;
      let bestD = Infinity;
      g.notes.forEach((n, i) => {
        const d = Math.abs(n.x - hitX);
        if (n.s === s && d < tol && d < bestD) {
          bestD = d;
          bestI = i;
        }
      });
      if (bestI < 0) {
        g.combo = 0;
        setCombo(0);
        return;
      }
      g.notes.splice(bestI, 1);
      const perfect = bestD < 14 * g.dpr;
      g.combo += 1;
      g.score += (perfect ? 2 : 1) * (g.combo >= 10 ? 2 : 1);
      setScore(g.score);
      setCombo(g.combo);
      setFlash(perfect ? "Perfect" : "Good");
      window.setTimeout(() => setFlash(null), 350);
    },
    [layout],
  );

  const start = () => {
    const g = game.current;
    g.notes = [];
    g.amp.fill(0);
    g.start = 0;
    g.score = 0;
    g.combo = 0;
    g.running = true;
    setScore(0);
    setCombo(0);
    setTime(ROUND);
    setState("playing");
  };

  useEffect(() => {
    if (state !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= STRINGS) {
        e.preventDefault();
        pluck(n - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, pluck]);

  const onPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (state !== "playing") return;
    const r = e.currentTarget.getBoundingClientRect();
    const g = game.current;
    const { y, gap } = layout();
    const py = (e.clientY - r.top) * g.dpr;
    let s = 0;
    for (let i = 1; i < STRINGS; i++) if (Math.abs(py - y(i)) < Math.abs(py - y(s))) s = i;
    if (Math.abs(py - y(s)) <= gap * 0.75) pluck(s);
  };

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative h-[22rem] overflow-hidden rounded-[1.5rem] border border-line bg-[#0b0b0b] md:h-[26rem]"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={onPointer}
          className="absolute inset-0 h-full w-full touch-none select-none"
          aria-label="Pluck game. Notes slide along six strings; tap a string, or press 1 to 6, as a note reaches the amber line."
          role="img"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-5 py-4 text-sm">
          <span>
            Score <span className="font-display text-lg font-semibold text-ink">{score}</span>
          </span>
          {combo >= 3 && (
            <span className="text-gold">
              {combo} in a row{combo >= 10 ? ", double points" : ""}
            </span>
          )}
          <span>
            <span className="font-display text-lg font-semibold text-ink">{time}</span>s
          </span>
        </div>
        {flash && state === "playing" && (
          <p className="pointer-events-none absolute top-14 left-[18%] -translate-x-1/2 font-display text-lg font-semibold text-gold">
            {flash}
          </p>
        )}
        {state !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-bg/70 px-6 text-center backdrop-blur-[2px]">
            {state === "done" ? (
              <>
                <p className="font-display text-5xl font-semibold tracking-tight" aria-live="polite">
                  {score}
                </p>
                <p className="text-muted">{newBest ? "New best score." : `Your best is ${best}.`}</p>
              </>
            ) : (
              <p className="max-w-xs text-muted">
                Tap a string as a note crosses the amber line. Ten in a row doubles your points.
              </p>
            )}
            <button
              type="button"
              onClick={start}
              className="rounded-full bg-accent-strong px-7 py-3 font-medium text-white transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {state === "done" ? "Play again" : "Start"}
            </button>
            <p className="hidden text-sm text-muted md:block">Keyboard: keys 1 to 6, top string to bottom.</p>
          </div>
        )}
      </div>
    </div>
  );
}

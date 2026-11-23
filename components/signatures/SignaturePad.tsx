"use client";

import { useEffect, useRef, useState } from "react";
import { SIG_COLORS, SIG_H, SIG_W, type Signature } from "@/lib/signature-shape";

const COLOR_NAMES: Record<string, string> = { "#a5a8ff": "Indigo", "#f59e0b": "Amber", "#f5f5f4": "White" };

type Status = { kind: "idle" | "sending" | "sent" | "error"; message?: string };

// Draw a signature with a finger, pen or mouse. Points are kept in a 1000 x 500 box so every screen agrees.
export function SignaturePad({ open, onSent }: { open: boolean; onSent: (sig: Signature) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<number[][]>([]);
  const current = useRef<number[] | null>(null);
  const firstInk = useRef<number | null>(null);
  const [color, setColor] = useState<string>(SIG_COLORS[0]);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const draw = (list: number[][]) => {
    const c = canvasRef.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const r = c.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (c.width !== Math.round(r.width * dpr)) {
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
    }
    ctx.setTransform(c.width / SIG_W, 0, 0, c.height / SIG_H, 0, 0);
    ctx.clearRect(0, 0, SIG_W, SIG_H);
    ctx.strokeStyle = "rgba(245,245,244,0.18)";
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 14]);
    ctx.beginPath();
    ctx.moveTo(60, 380);
    ctx.lineTo(940, 380);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const s of list) {
      ctx.beginPath();
      ctx.moveTo(s[0], s[1]);
      if (s.length === 2) ctx.lineTo(s[0] + 0.1, s[1]);
      for (let i = 2; i < s.length; i += 2) ctx.lineTo(s[i], s[i + 1]);
      ctx.stroke();
    }
  };

  useEffect(() => {
    draw(strokes);
    const onResize = () => draw(strokes);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes, color]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.min(SIG_W, Math.max(0, ((e.clientX - r.left) / r.width) * SIG_W));
    const y = Math.min(SIG_H, Math.max(0, ((e.clientY - r.top) / r.height) * SIG_H));
    return [Math.round(x), Math.round(y)];
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!open || status.kind === "sending") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    current.current = point(e);
    firstInk.current ??= performance.now();
    if (status.kind !== "idle") setStatus({ kind: "idle" });
    draw([...strokes, current.current]);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = current.current;
    if (!s) return;
    const [x, y] = point(e);
    const dx = x - s[s.length - 2];
    const dy = y - s[s.length - 1];
    if (dx * dx + dy * dy < 16 || s.length >= 1200) return; // skip tiny moves to keep signatures light
    s.push(x, y);
    draw([...strokes, s]);
  };
  const up = () => {
    const s = current.current;
    current.current = null;
    if (s && strokes.length < 60) setStrokes((list) => [...list, s]);
  };

  const clear = () => {
    setStrokes([]);
    firstInk.current = null;
    setStatus({ kind: "idle" });
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!strokes.length) {
      setStatus({ kind: "error", message: "Draw your signature first." });
      return;
    }
    setStatus({ kind: "sending" });
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          color,
          strokes,
          company: form.get("company") ?? "",
          elapsed: firstInk.current ? performance.now() - firstInk.current : 0,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setStatus({ kind: "error", message: data.error ?? "Your signature couldn't be sent. Please try again." });
        return;
      }
      onSent({ id: `mine-${Date.now()}`, name, color, strokes, createdAt: new Date().toISOString() });
      setStatus({
        kind: "sent",
        message: "Thank you. It's floating on your screen now, and everyone will see it once Excel approves it.",
      });
      setStrokes([]);
      setName("");
      firstInk.current = null;
    } catch {
      setStatus({ kind: "error", message: "Your signature couldn't be sent. Check your connection and try again." });
    }
  };

  const field =
    "w-full rounded-xl border border-line-strong bg-bg px-4 py-3 text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none";

  return (
    <form
      onSubmit={submit}
      className="rounded-[1.5rem] border border-line bg-surface p-5 md:p-7"
      aria-labelledby="sign-title"
    >
      <h3 id="sign-title" className="font-display text-2xl font-semibold tracking-tight">
        Sign the wall
      </h3>
      <p className="mt-1 text-muted">
        {open
          ? "Draw with your finger, pen or mouse. Signatures appear for everyone after a quick check."
          : "The wall opens soon."}
      </p>

      <div className="relative mt-5 aspect-[2/1] overflow-hidden rounded-xl border border-line bg-[#0b0b0b]">
        <canvas
          ref={canvasRef}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          className={`absolute inset-0 h-full w-full touch-none ${open ? "cursor-crosshair" : "cursor-not-allowed opacity-50"}`}
          role="img"
          aria-label="Drawing area for your signature"
        />
        {strokes.length === 0 && (
          <p className="pointer-events-none absolute inset-x-0 top-1/3 text-center text-muted/70">Sign here</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <fieldset className="flex items-center gap-2">
          <legend className="sr-only">Ink colour</legend>
          {SIG_COLORS.map((c) => (
            <label key={c} className="relative cursor-pointer">
              <input
                type="radio"
                name="ink"
                value={c}
                checked={color === c}
                onChange={() => setColor(c)}
                className="peer sr-only"
              />
              <span
                className="block h-8 w-8 rounded-full border-2 border-transparent ring-offset-2 ring-offset-surface peer-checked:border-ink peer-focus-visible:ring-2 peer-focus-visible:ring-accent"
                style={{ background: c }}
              />
              <span className="sr-only">{COLOR_NAMES[c]}</span>
            </label>
          ))}
        </fieldset>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setStrokes((s) => s.slice(0, -1))}
            disabled={!strokes.length}
            className="rounded-full border border-line-strong px-4 py-2 text-sm transition-colors hover:border-ink disabled:opacity-40"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={!strokes.length}
            className="rounded-full border border-line-strong px-4 py-2 text-sm transition-colors hover:border-ink disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="text-sm text-muted">Your name (optional)</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          autoComplete="name"
          className={`mt-1.5 ${field}`}
          placeholder="Shown under your signature"
          disabled={!open}
        />
      </label>
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button
        type="submit"
        disabled={!open || status.kind === "sending"}
        className="mt-5 w-full rounded-full bg-accent-strong px-7 py-3.5 font-medium text-white transition-colors hover:bg-accent disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {status.kind === "sending" ? "Sending…" : "Add my signature"}
      </button>
      <p
        aria-live="polite"
        className={`mt-3 min-h-6 text-sm ${status.kind === "error" ? "text-red-300" : "text-gold"}`}
      >
        {status.message}
      </p>
    </form>
  );
}

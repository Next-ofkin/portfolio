"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Signature } from "@/lib/signature-shape";
import { SignatureSvg } from "../SignatureSvg";
import { SignaturePad } from "./SignaturePad";

const MAX_VISIBLE = 12;
const SWAP_MS = 7000;

type Item = Signature & { mine?: boolean };

// Approved signatures drift slowly inside the wall and bounce off its edges. At most twelve float at once;
// with more, one quietly swaps for the next every few seconds, so the wall never clutters.
function Floating({ items }: { items: Item[] }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const els = useRef(new Map<string, HTMLDivElement>());
  const bodies = useRef(new Map<string, { x: number; y: number; vx: number; vy: number; phase: number }>());
  const [offset, setOffset] = useState(0);
  const reduce = useRef(false);

  // Yours first, then a moving window over the approved ones: every few seconds one leaves and the next arrives.
  const mine = items.filter((i) => i.mine);
  const others = items.filter((i) => !i.mine);
  const room = Math.max(0, MAX_VISIBLE - mine.length);
  const windowed =
    others.length <= room ? others : Array.from({ length: room }, (_, k) => others[(offset + k) % others.length]);
  const shown = [...mine.slice(0, MAX_VISIBLE), ...windowed];

  useEffect(() => {
    if (others.length <= room) return;
    const t = window.setInterval(() => setOffset((o) => o + 1), SWAP_MS);
    return () => window.clearInterval(t);
  }, [others.length, room]);

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const box = boxRef.current;
    if (!box) return;
    let raf = 0;
    let last = 0;
    let running = false;

    // New arrivals start in their own cell of a loose grid, so the wall begins evenly spread.
    const place = () => {
      const W = box.clientWidth;
      const H = box.clientHeight;
      const n = Math.max(1, els.current.size);
      const cols = Math.max(1, Math.round(Math.sqrt((n * W) / Math.max(1, H))));
      const rows = Math.ceil(n / cols);
      let i = 0;
      for (const [id, el] of els.current) {
        let b = bodies.current.get(id);
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        if (!b) {
          const cw = W / cols;
          const ch = H / rows;
          const cx = (i % cols) * cw + Math.max(0, cw - w) * (reduce.current ? 0.5 : Math.random());
          const cy = Math.floor(i / cols) * ch + Math.max(0, ch - h) * (reduce.current ? 0.5 : Math.random());
          b = {
            x: Math.min(Math.max(0, cx), Math.max(0, W - w)),
            y: Math.min(Math.max(0, cy), Math.max(0, H - h)),
            vx: reduce.current ? 0 : (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 10),
            vy: reduce.current ? 0 : (Math.random() < 0.5 ? -1 : 1) * (5 + Math.random() * 8),
            phase: Math.random() * Math.PI * 2,
          };
          bodies.current.set(id, b);
        }
        i++;
      }
    };

    const frame = (t: number) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      const W = box.clientWidth;
      const H = box.clientHeight;
      place();
      for (const [id, el] of els.current) {
        const b = bodies.current.get(id);
        if (!b) continue;
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < 0 || b.x > W - w) {
          b.vx *= -1;
          b.x = Math.min(Math.max(0, b.x), Math.max(0, W - w));
        }
        if (b.y < 0 || b.y > H - h) {
          b.vy *= -1;
          b.y = Math.min(Math.max(0, b.y), Math.max(0, H - h));
        }
      }
      // Signatures that drift into each other ease apart, so they never pile up.
      const list = [...els.current].map(([id, el]) => ({ b: bodies.current.get(id), w: el.offsetWidth, h: el.offsetHeight }));
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const A = list[i];
          const B = list[j];
          if (!A.b || !B.b) continue;
          const dx = B.b.x + B.w / 2 - (A.b.x + A.w / 2);
          const dy = B.b.y + B.h / 2 - (A.b.y + A.h / 2);
          const ox = (A.w + B.w) / 2 - Math.abs(dx);
          const oy = (A.h + B.h) / 2 - Math.abs(dy);
          if (ox > 0 && oy > 0) {
            const push = 40 * dt;
            if (ox < oy) {
              const s = dx >= 0 ? 1 : -1;
              A.b.x -= s * push;
              B.b.x += s * push;
              A.b.vx = -s * Math.abs(A.b.vx);
              B.b.vx = s * Math.abs(B.b.vx);
            } else {
              const s = dy >= 0 ? 1 : -1;
              A.b.y -= s * push;
              B.b.y += s * push;
              A.b.vy = -s * Math.abs(A.b.vy);
              B.b.vy = s * Math.abs(B.b.vy);
            }
          }
        }
      }
      for (const [id, el] of els.current) {
        const b = bodies.current.get(id);
        if (!b) continue;
        const tilt = Math.sin(t / 2400 + b.phase) * 4;
        el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) rotate(${tilt}deg)`;
      }
      if (running) raf = requestAnimationFrame(frame);
    };

    if (reduce.current) {
      place();
      frame(0);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) {
        running = true;
        last = 0;
        raf = requestAnimationFrame(frame);
      } else if (!e.isIntersecting) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(box);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={boxRef}
      className="relative h-[24rem] overflow-hidden rounded-[1.5rem] border border-line bg-[#0b0b0b] md:h-full md:min-h-[34rem]"
      role="img"
      aria-label={
        items.length
          ? `Signatures from ${items.length} ${items.length === 1 ? "visitor" : "visitors"} floating across the wall${
              items.some((i) => i.name)
                ? `, including ${items
                    .filter((i) => i.name)
                    .slice(0, 5)
                    .map((i) => i.name)
                    .join(", ")}`
                : ""
            }.`
          : "The signature wall is empty so far."
      }
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 40% at 70% 20%, rgba(245,158,11,0.1), transparent 70%), radial-gradient(55% 45% at 20% 90%, rgba(99,102,241,0.14), transparent 70%)",
        }}
      />
      {items.length === 0 && (
        <p className="absolute inset-0 flex items-center justify-center px-8 text-center text-lg text-muted">
          No signatures yet. Be the first.
        </p>
      )}
      {shown.map((s) => (
        <div
          key={s.id}
          ref={(el) => {
            if (el) els.current.set(s.id, el);
            else {
              els.current.delete(s.id);
              bodies.current.delete(s.id);
            }
          }}
          className="sig-float absolute top-0 left-0 w-36 md:w-48"
          style={{ opacity: s.mine ? 1 : 0.88 }}
        >
          <SignatureSvg sig={s} className="h-auto w-full drop-shadow-[0_0_12px_rgba(99,102,241,0.25)]" />
          <p className="-mt-2 truncate text-center text-xs text-muted">
            {s.mine ? "You, waiting for approval" : s.name}
          </p>
        </div>
      ))}
    </div>
  );
}

export function SignatureWall({ approved, open }: { approved: Signature[]; open: boolean }) {
  const [mine, setMine] = useState<Item[]>([]);
  const items = useMemo<Item[]>(() => [...mine, ...approved], [mine, approved]);
  return (
    <div className="grid gap-5 md:grid-cols-[1.25fr_1fr]">
      <Floating items={items} />
      <SignaturePad open={open} onSent={(sig) => setMine((m) => [{ ...sig, mine: true }, ...m])} />
    </div>
  );
}

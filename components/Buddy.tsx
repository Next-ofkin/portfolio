"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { buddyOff, canWebGL, setBuddyOff, subscribeBuddy } from "@/lib/buddy-store";
import type { AvatarHandle } from "@/lib/avatar-scene";

const noop = () => () => {};
const HIDE_ON = ["/about", "/lab/review"];

// A small floating 3D Excel. With a mouse he trails the cursor at a polite distance and, when the cursor
// rests, goes to sit on the end of the nearest heading. On touch screens he sits in the bottom-left corner
// and pops up to wave at each new section. Tapping him opens the assistant with a question about the page.
export function Buddy() {
  const pathname = usePathname();
  const supported = useSyncExternalStore(noop, canWebGL, () => false);
  const off = useSyncExternalStore(subscribeBuddy, buddyOff, () => true);
  // wait until the page has settled so he never competes with the first paint
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setArmed(true), 2500);
    return () => window.clearTimeout(t);
  }, []);

  if (!supported || off || !armed || HIDE_ON.includes(pathname)) return null;
  return <BuddyBody key={pathname} />;
}

function pageQuestion() {
  const h1 = document.querySelector("main h1")?.textContent?.trim();
  if (location.pathname.startsWith("/work/") && h1) return `How did you build ${h1}?`;
  if (h1) return `Tell me more about this page: "${h1}"`;
  return "What should I look at first on this site?";
}

function BuddyBody() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [perched, setPerched] = useState(false);
  const [hint, setHint] = useState(false);

  // The 3D scene.
  const scene = useRef<AvatarHandle | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    import("@/lib/avatar-scene")
      .then(({ createAvatar }) => {
        if (cancelled) return;
        scene.current = createAvatar(canvas, {
          framing: "buddy",
          drag: false,
          reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          onTap: () => window.dispatchEvent(new CustomEvent("ask:open", { detail: { prefill: pageQuestion() } })),
          onReady: () => {
            setReady(true);
            window.setTimeout(() => scene.current?.wave(), 600);
          },
          onError: () => setBuddyOff(true),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);

  // Where he goes.
  useEffect(() => {
    const el = wrap.current;
    if (!el || !ready) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const size = () => el.offsetWidth;
    const corner = () => ({ x: 12, y: window.innerHeight - size() - 16 });

    // Touch screens and reduced motion: stay in the corner. On touch, pop up for each new section.
    if (!mouse || reduce) {
      const place = () => {
        const c = corner();
        el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
      };
      place();
      window.addEventListener("resize", place);
      if (reduce) return () => window.removeEventListener("resize", place);
      const seen = new Set<Element>();
      let first = true;
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting || seen.has(e.target)) continue;
            seen.add(e.target);
            if (first) {
              first = false; // the opening wave already covers the first one
              continue;
            }
            el.animate(
              [{ translate: "0 0" }, { translate: "0 -22px" }, { translate: "0 0" }, { translate: "0 -8px" }, { translate: "0 0" }],
              { duration: 700, easing: "ease-out" },
            );
            scene.current?.wave();
          }
        },
        { rootMargin: "0px 0px -40% 0px" },
      );
      document.querySelectorAll("main h2").forEach((h) => io.observe(h));
      return () => {
        io.disconnect();
        window.removeEventListener("resize", place);
      };
    }

    // With a mouse: follow, then perch.
    const pos = { ...corner() };
    const m = { x: window.innerWidth * 0.7, y: window.innerHeight * 0.6, at: performance.now() };
    let perch: { el: Element; x: number; y: number } | null = null;
    let perches = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      m.x = e.clientX;
      m.y = e.clientY;
      m.at = performance.now();
      // leave the perch only when the cursor heads well away, so you can reach him to click
      if (perch && Math.hypot(e.clientX - perch.x, e.clientY - perch.y) > 220) {
        perch = null;
        setPerched(false);
      }
    };

    // Where the text of a heading ends, so he can sit just past it without covering any words.
    const endOf = (h: Element) => {
      const r = document.createRange();
      r.selectNodeContents(h);
      const rects = r.getClientRects();
      return rects.length ? rects[rects.length - 1] : h.getBoundingClientRect();
    };
    const perchSpot = (h: Element) => {
      const s = size();
      const line = endOf(h);
      let x = line.right + 6;
      let y = line.bottom - s * 0.92;
      if (x + s > window.innerWidth - 8) {
        // no room at the end of the line: sit on top of it instead
        x = Math.max(8, line.right - s);
        y = line.top - s * 0.86;
      }
      return { x, y };
    };
    const findPerch = () => {
      const vh = window.innerHeight;
      let best: Element | null = null;
      let bestD = Infinity;
      document.querySelectorAll("main h1, main h2, main h3").forEach((h) => {
        const r = endOf(h);
        if (r.top < 90 || r.bottom > vh - 40 || r.width === 0) return;
        const d = Math.hypot(r.right - m.x, (r.top + r.bottom) / 2 - m.y);
        if (d < bestD && d < 700) {
          bestD = d;
          best = h;
        }
      });
      return best;
    };

    const clampX = (x: number) => Math.max(8, Math.min(window.innerWidth - size() - 8, x));
    const clampY = (y: number, x: number) => {
      const s = size();
      // keep clear of the header and of the "Ask" button in the bottom-right corner
      const bottom = x + s > window.innerWidth - 240 ? window.innerHeight - s - 90 : window.innerHeight - s - 12;
      return Math.max(72, Math.min(bottom, y));
    };

    const tick = () => {
      const now = performance.now();
      let tx: number;
      let ty: number;
      if (!perch && now - m.at > 1600) {
        const h = findPerch();
        if (h) {
          const p = perchSpot(h);
          perch = { el: h, ...p };
          setPerched(true);
          perches++;
          if (perches === 1 || perches % 3 === 0) window.setTimeout(() => scene.current?.wave(), 500);
        }
      }
      if (perch) {
        // follow the heading as the page scrolls; let go if it leaves the screen
        const p = perchSpot(perch.el);
        perch.x = p.x;
        perch.y = p.y;
        const r = endOf(perch.el);
        if (r.bottom < 60 || r.top > window.innerHeight) {
          perch = null;
          setPerched(false);
        }
        tx = p.x;
        ty = p.y;
      } else {
        // trail behind and below-right of the cursor
        tx = m.x + 40;
        ty = m.y + 30;
      }
      tx = clampX(tx);
      ty = clampY(ty, tx);
      const k = perch ? 0.09 : 0.045;
      pos.x += (tx - pos.x) * k;
      pos.y += (ty - pos.y) * k;
      el.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [ready]);

  return (
    <div
      ref={wrap}
      className={`buddy fixed top-0 left-0 z-[55] h-24 w-24 transition-opacity duration-500 md:h-36 md:w-36 ${
        ready ? "opacity-100" : "pointer-events-none opacity-0"
      } ${perched ? "" : "md:pointer-events-none"}`}
      onPointerEnter={() => setHint(true)}
      onPointerLeave={() => setHint(false)}
    >
      <div
        aria-hidden="true"
        className="absolute inset-[12%] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(99,102,241,0.38), rgba(245,158,11,0.12) 65%, transparent)",
        }}
      />
      <canvas
        ref={canvasRef}
        tabIndex={0}
        role="button"
        aria-label="Mini Excel. Ask him about this page."
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("ask:open", { detail: { prefill: pageQuestion() } }));
          }
        }}
        className="absolute inset-0 h-full w-full cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-gold"
        style={{ maskImage: "linear-gradient(to bottom, #000 72%, transparent 98%)" }}
      />
      {hint && (
        <p className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-full border border-line-strong bg-surface/95 px-3 py-1 text-xs shadow-lg backdrop-blur">
          Ask me about this page
        </p>
      )}
      <button
        type="button"
        onClick={() => setBuddyOff(true)}
        aria-label="Hide mini Excel"
        className="absolute top-1 right-1 grid h-6 w-6 place-items-center rounded-full border border-line-strong bg-surface/90 text-xs text-muted opacity-70 transition-opacity hover:text-ink hover:opacity-100 focus-visible:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

// Footer link that brings him back after he's been hidden.
export function BuddyReturn() {
  const supported = useSyncExternalStore(noop, canWebGL, () => false);
  const off = useSyncExternalStore(subscribeBuddy, buddyOff, () => false);
  if (!supported || !off) return null;
  return (
    <button
      type="button"
      onClick={() => setBuddyOff(false)}
      className="text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink"
    >
      Bring back mini Excel
    </button>
  );
}

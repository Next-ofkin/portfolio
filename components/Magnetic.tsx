"use client";

import { useRef, type ReactNode } from "react";

// Pulls its child gently toward the pointer. Mouse and pen only, and off when reduced motion is on.
export function Magnetic({ children, strength = 0.28 }: { children: ReactNode; strength?: number }) {
  const inner = useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || !inner.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * strength;
    const dy = (e.clientY - (r.top + r.height / 2)) * strength;
    inner.current.style.transition = "transform 0.15s ease-out";
    inner.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  };

  const leave = () => {
    if (!inner.current) return;
    inner.current.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
    inner.current.style.transform = "translate3d(0, 0, 0)";
  };

  return (
    // The padding widens the area that attracts the button, without moving anything on the page.
    <div className="-m-4 inline-block p-4" onPointerMove={move} onPointerLeave={leave}>
      <div ref={inner}>{children}</div>
    </div>
  );
}

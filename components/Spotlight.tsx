"use client";

import type { ReactNode } from "react";

// A card whose border and surface light up where the pointer is.
export function Spotlight({ children, className = "" }: { children: ReactNode; className?: string }) {
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div className={`spot ${className}`} onPointerMove={onMove}>
      {children}
    </div>
  );
}

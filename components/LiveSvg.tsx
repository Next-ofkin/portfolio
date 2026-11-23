"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Wraps an animated (SMIL) scene. The scene's clock only runs while it is on screen, so every card
// starts its story when the visitor reaches it and nothing burns battery off screen.
// With reduced motion the clock is parked at `still`, a frame that tells the story without moving.
export function LiveSvg({
  children,
  still,
  viewBox = "0 0 480 300",
  className = "absolute inset-0 h-full w-full",
}: {
  children: ReactNode;
  still: number;
  viewBox?: string;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg || typeof svg.pauseAnimations !== "function") return;
    svg.pauseAnimations();
    svg.setCurrentTime(0);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      svg.setCurrentTime(still);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      svg.unpauseAnimations();
      svg.classList.add("is-live");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          svg.unpauseAnimations();
          svg.classList.add("is-live");
        } else {
          svg.pauseAnimations();
          svg.classList.remove("is-live");
        }
      },
      { threshold: 0.2 },
    );
    io.observe(svg);
    return () => io.disconnect();
  }, [still]);

  return (
    <svg
      ref={ref}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

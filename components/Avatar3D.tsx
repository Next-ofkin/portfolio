"use client";

import { useEffect, useRef, useState } from "react";

// The 3D cartoon Excel. three.js is loaded only when this mounts, and the scene pauses off screen.
export function Avatar3D({ onFail }: { onFail: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hi, setHi] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let handle: { dispose: () => void } | null = null;
    let cancelled = false;
    let timer = 0;
    import("@/lib/avatar-scene")
      .then(({ createAvatar }) => {
        if (cancelled) return;
        handle = createAvatar(canvas, {
          reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          onTap: () => {
            setHi(true);
            window.clearTimeout(timer);
            timer = window.setTimeout(() => setHi(false), 6000);
          },
        });
      })
      .catch(onFail);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      handle?.dispose();
    };
  }, [onFail]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
        role="img"
        aria-label="A 3D cartoon of Excel in a black polo, arms folded. He follows your pointer; tap him to say hi, drag to turn him."
      />
      {hi && (
        <div className="absolute bottom-20 left-1/2 z-10 w-[min(18rem,85%)] -translate-x-1/2 rounded-2xl border border-line-strong bg-surface/95 px-4 py-3 text-center shadow-lg backdrop-blur">
          <p className="font-medium">Hi, I&apos;m Excel.</p>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("ask:open"))}
            className="mt-1 text-sm text-gold underline underline-offset-4"
          >
            Ask me anything about my work
          </button>
        </div>
      )}
    </>
  );
}

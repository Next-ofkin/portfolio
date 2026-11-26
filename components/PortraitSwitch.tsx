"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Avatar3D } from "./Avatar3D";

let webgl: boolean | null = null;
const canWebGL = () => {
  if (webgl !== null) return webgl;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  return webgl;
};
const noop = () => () => {};

// Shows the 3D cartoon once the portrait scrolls near, with a switch back to the real photo.
export function PortraitSwitch({ photo }: { photo: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  // false on the server and during hydration, then whether this browser can draw 3D
  const supported = useSyncExternalStore(noop, canWebGL, () => false);
  const [failed, setFailed] = useState(false);
  const ready = supported && !failed;
  const [mode, setMode] = useState<"photo" | "3d">("3d");
  const [near, setNear] = useState(false);
  const fail = useCallback(() => setFailed(true), []);

  useEffect(() => {
    if (!supported) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [supported]);

  const show3d = ready && mode === "3d";

  return (
    <div ref={ref} className="absolute inset-0">
      <div className={`absolute inset-0 transition-opacity duration-500 ${show3d ? "opacity-0" : "opacity-100"}`}>
        {photo}
      </div>
      {show3d && near && <Avatar3D onFail={fail} />}
      {ready && (
        <div
          role="group"
          aria-label="Portrait style"
          className="absolute right-4 bottom-4 z-10 flex rounded-full border border-line-strong bg-bg/80 p-1 text-sm backdrop-blur"
        >
          {(["3d", "photo"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className="rounded-full px-3.5 py-1.5 transition-colors aria-pressed:bg-ink aria-pressed:text-bg"
            >
              {m === "3d" ? "3D me" : "Photo"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

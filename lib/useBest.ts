"use client";

import { useCallback, useSyncExternalStore } from "react";

// A best score kept in localStorage, shared by components and safe when storage is unavailable.
const EVENT = "best-score-change";

function read(key: string) {
  try {
    return Number(localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
}

export function useBest(key: string) {
  const best = useSyncExternalStore(
    (cb) => {
      window.addEventListener(EVENT, cb);
      window.addEventListener("storage", cb);
      return () => {
        window.removeEventListener(EVENT, cb);
        window.removeEventListener("storage", cb);
      };
    },
    () => read(key),
    () => 0,
  );
  const offer = useCallback(
    (score: number) => {
      if (score <= read(key)) return false;
      try {
        localStorage.setItem(key, String(score));
      } catch {
        return false;
      }
      window.dispatchEvent(new Event(EVENT));
      return true;
    },
    [key],
  );
  return [best, offer] as const;
}

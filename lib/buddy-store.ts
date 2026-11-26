// Whether the visitor has sent the floating 3D buddy away. Kept in localStorage so it stays away.
const KEY = "buddy:off";
const listeners = new Set<() => void>();
let memOff = false; // fallback when storage is blocked

export function subscribeBuddy(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => e.key === KEY && fn();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

export function buddyOff(): boolean {
  try {
    return memOff || localStorage.getItem(KEY) === "1";
  } catch {
    return memOff;
  }
}

export function setBuddyOff(off: boolean) {
  memOff = off;
  try {
    if (off) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {
    // storage blocked: the change lasts for this page only
  }
  listeners.forEach((fn) => fn());
}

let webgl: boolean | null = null;
export function canWebGL() {
  if (webgl !== null) return webgl;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  return webgl;
}

import type { ReactNode } from "react";
import { CursorGlow } from "./CursorGlow";
import { Footer } from "./Footer";
import { Header } from "./Header";

// The frame every page shares: skip link, cursor glow, grain, header, footer.
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-accent-strong focus:px-5 focus:py-2.5 focus:text-white"
      >
        Skip to main content
      </a>
      <CursorGlow />
      <div aria-hidden="true" className="grain" />
      <Header />
      <main id="main" className="relative z-10 mx-auto max-w-7xl px-5 md:px-10">
        {children}
      </main>
      <Footer />
    </>
  );
}

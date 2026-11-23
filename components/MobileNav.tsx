"use client";

import { useEffect, useRef, useState } from "react";
import { nav, profile } from "@/lib/content";
import { Monogram } from "./Monogram";

// Full-screen menu for small screens. Escape closes it, focus moves in and back, and the page behind stops scrolling.
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    firstLink.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={toggle}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong"
      >
        <span className="sr-only">Open menu</span>
        <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
          <path d="M0 1H18" stroke="#f5f5f4" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M0 6H18" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <path d="M0 11H18" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-50 flex flex-col bg-bg px-5"
        >
          <div className="flex h-[4.5rem] items-center justify-between">
            <Monogram />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                toggle.current?.focus();
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong"
            >
              <span className="sr-only">Close menu</span>
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M1 1L13 13M13 1L1 13" stroke="#f5f5f4" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-8 flex-1">
            <ul className="space-y-2">
              {nav.map((item, i) => (
                <li key={item.href}>
                  <a
                    ref={i === 0 ? firstLink : undefined}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 font-display text-5xl font-semibold tracking-[-0.04em] active:text-accent-soft"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a href={`mailto:${profile.email}`} className="mb-10 text-lg text-muted underline underline-offset-4">
            {profile.email}
          </a>
        </div>
      )}
    </div>
  );
}

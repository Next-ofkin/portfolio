import Link from "next/link";
import { nav, profile } from "@/lib/content";
import { BuddyReturn } from "./Buddy";
import { Monogram } from "./Monogram";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1fr_auto] md:px-10">
        <div>
          <p className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Have something in mind?</p>
          <a
            href={`mailto:${profile.email}`}
            className="mt-3 inline-block text-lg text-muted underline decoration-line-strong decoration-2 underline-offset-[6px] transition-colors hover:text-ink hover:decoration-gold"
          >
            {profile.email}
          </a>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 md:justify-end">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-muted transition-colors hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={profile.github}
                target="_blank"
                rel="noopener"
                className="text-muted transition-colors hover:text-ink"
              >
                GitHub<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener"
                className="text-muted transition-colors hover:text-ink"
              >
                LinkedIn<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-line px-5 py-8 md:px-10">
        <div className="flex items-center gap-4">
          <Monogram className="h-8 w-auto" />
          <p className="text-sm text-muted">&copy; 2026 {profile.name}</p>
        </div>
        <div className="text-sm">
          <BuddyReturn />
        </div>
        <p className="text-sm text-muted">Built with precision in Lagos</p>
      </div>
    </footer>
  );
}

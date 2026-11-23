"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav } from "@/lib/content";

// Desktop navigation. The current page is marked for screen readers and shown in amber.
export function NavLinks() {
  const path = usePathname();
  return (
    <ul className="flex items-center gap-8 text-[0.95rem]">
      {nav.map((item) => {
        const current = path.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={current ? "page" : undefined}
              className="text-muted transition-colors hover:text-ink aria-[current=page]:text-gold"
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

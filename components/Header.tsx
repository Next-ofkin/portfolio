import Link from "next/link";
import { nav } from "@/lib/content";
import { MobileNav } from "./MobileNav";
import { Monogram } from "./Monogram";

export function Header() {
  return (
    <header className="sticky top-0 z-40">
      {/* The blur sits on its own layer so the full-screen mobile menu can still cover the whole viewport. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 border-b border-line bg-bg/75 backdrop-blur-md" />
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 md:px-10">
        <Link href="/#top" aria-label="Excel Shogbola, home" className="rounded-md">
          <Monogram />
        </Link>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-8 text-[0.95rem]">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-muted transition-colors hover:text-ink">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}

import Link from "next/link";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";
import { Monogram } from "./Monogram";

export function Header() {
  return (
    <header className="sticky top-0 z-40">
      {/* The blur sits on its own layer so the full-screen mobile menu can still cover the whole viewport. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 border-b border-line bg-bg/75 backdrop-blur-md" />
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 md:px-10">
        <Link href="/" aria-label="Excel Shogbola, home" className="rounded-md">
          <Monogram />
        </Link>
        <nav aria-label="Main" className="hidden md:block">
          <NavLinks />
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}

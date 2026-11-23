import { profile } from "@/lib/content";
import { Monogram } from "./Monogram";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-5 py-10 md:px-10">
        <div className="flex items-center gap-4">
          <Monogram className="h-8 w-auto" />
          <p className="text-sm text-muted">&copy; 2026 {profile.name}</p>
        </div>
        <p className="text-sm text-muted">Built with precision in Lagos</p>
      </div>
    </footer>
  );
}

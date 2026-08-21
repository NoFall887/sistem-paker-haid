import { BookOpen, Droplets } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AppHeader({
  onHome,
  onEducation,
}: {
  onHome: () => void;
  onEducation: () => void;
}) {
  return (
    <header className="border-b border-border bg-card/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:px-4">
        <button
          type="button"
          className="flex min-h-9 items-center gap-2 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onHome}
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Droplets className="size-4" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold">
              Panduan Fikih Haid
            </span>
            <span className="block text-[11px] leading-tight text-muted-foreground">
              & Istihadhah
            </span>
          </span>
        </button>
        <Button variant="ghost" onClick={onEducation}>
          <BookOpen />
          <span className="hidden sm:inline">Contoh & Glosarium</span>
          <span className="sm:hidden">Panduan</span>
        </Button>
      </div>
      <div className="border-t border-border bg-secondary/70 px-3 py-1.5 text-center text-[11px] leading-snug text-secondary-foreground">
        Alat bantu edukasi berdasarkan aturan yang tersedia—bukan diagnosis
        medis atau fatwa. Verifikasikan kasus nyata kepada ahli yang kompeten
        bila diperlukan.
      </div>
    </header>
  );
}

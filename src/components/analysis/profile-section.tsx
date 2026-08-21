import type { Ref } from "react";
import { Check } from "lucide-react";

import { NumberedSection } from "@/components/analysis/analysis-section";
import { profiles } from "@/components/analysis/analysis-options";
import type { CaseInput, UserStatus } from "@/lib/fiqh-engine";
import { cn } from "@/lib/utils";

export function ProfileSection({
  sectionRef,
  value,
  onSelect,
}: {
  sectionRef: Ref<HTMLElement>;
  value: CaseInput["userStatus"];
  onSelect: (status: UserStatus) => void;
}) {
  return (
    <NumberedSection
      number={1}
      title="Pilih status pengalaman haid"
      description="Pilih keadaan yang paling sesuai dengan pengalaman dan ingatan Anda. Pilihan ini menentukan jalur analisis."
      sectionRef={sectionRef}
    >
      <div className="grid gap-2 md:grid-cols-2">
        {profiles.map((profile) => {
          const selected = value === profile.value;
          return (
            <button
              type="button"
              key={profile.value}
              aria-pressed={selected}
              onClick={() => onSelect(profile.value)}
              className={cn(
                "min-h-20 rounded-lg cursor-pointer border bg-card p-3 text-left shadow-sm transition hover:border-primary/50 hover:bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected &&
                  "border-primary bg-secondary/60 ring-2 ring-primary/15",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span>
                  <span className="block text-sm font-semibold">
                    {profile.title}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-muted-foreground">
                    {profile.description}
                  </span>
                </span>
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border",
                  )}
                >
                  {selected && <Check className="size-3.5" />}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </NumberedSection>
  );
}

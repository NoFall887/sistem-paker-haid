import type { Ref } from "react";
import { Droplets } from "lucide-react";

import { colors } from "@/components/analysis/analysis-options";
import {
  IssueList,
  NumberedSection,
} from "@/components/analysis/analysis-section";
import { Button } from "@/components/ui/button";
import type {
  BloodSegmentInput,
  CaseInput,
  ValidationIssue,
} from "@/lib/fiqh-engine";
import { PRAYER_TIME_FEATURE_ENABLED } from "@/lib/prayer-times";

export function ReviewSection({
  input,
  profile,
  segments,
  issues,
  validationRef,
  onAnalyze,
}: {
  input: CaseInput;
  profile: string;
  segments: BloodSegmentInput[];
  issues: ValidationIssue[];
  validationRef: Ref<HTMLDivElement>;
  onAnalyze: () => void;
}) {
  return (
    <NumberedSection
      number={4}
      title="Tinjau sebelum dianalisis"
      description="Pastikan profil, kebiasaan, serta waktu mulai dan berhenti sudah tepat sampai tingkat menit."
    >
      <div className="grid gap-3 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="rounded-lg border bg-secondary/15 p-3">
          <h3 className="text-sm font-semibold">Profil</h3>
          <div className="mt-2 space-y-2 text-sm">
            <ReviewLine label="Status" value={profile} />
            <ReviewLine
              label="Adat haid"
              value={
                input.menstrualHabitDays
                  ? `${input.menstrualHabitDays} hari`
                  : "Tidak digunakan"
              }
            />
            <ReviewLine
              label="Adat suci"
              value={
                input.purityHabitDays
                  ? `${input.purityHabitDays} hari`
                  : "Tidak digunakan"
              }
            />
            <ReviewLine
              label="Jam kebiasaan"
              value={input.habitualStartTime || "Tidak digunakan"}
            />
            <ReviewLine label="Tanggal lahir" value={input.birthDate || "Belum diisi"} />
            <ReviewLine label="Darah setelah persalinan" value={input.hasPostpartumBleeding ? "Ya" : "Tidak"} />
            {input.hasPostpartumBleeding && <ReviewLine label="Persalinan selesai" value={input.deliveryAt || "Belum diisi"} />}
            {PRAYER_TIME_FEATURE_ENABLED && <ReviewLine label="Lokasi" value={input.location?.latitude !== undefined && input.location?.longitude !== undefined ? `${input.location.latitude}, ${input.location.longitude}` : "Manual/perangkat belum diisi"} />}
          </div>
        </div>
        <div className="rounded-lg border bg-secondary/15 p-3">
          <h3 className="text-sm font-semibold">Kronologi terurut</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {segments.length} segmen akan dievaluasi.
          </p>
          <div className="mt-2 space-y-2">
            {segments.map((segment, index) => (
              <div
                key={segment.id}
                className="rounded-md border bg-card p-2 text-sm"
              >
                <p className="font-medium">Segmen {index + 1}</p>
                <p className="mt-0.5 break-words text-muted-foreground">
                  {segment.start
                    ? segment.start.replace("T", " ")
                    : "Waktu mulai belum diisi"}{" "}
                  —{" "}
                  {segment.end
                    ? segment.end.replace("T", " ")
                    : "waktu berhenti belum diisi"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {colors.find((item) => item.value === segment.color)?.label} ·{" "}
                  {segment.consistency === "KENTAL" ? "Kental" : "Cair"}
                  {" · "}{segment.odor === "BERAROMA" ? "Beraroma" : "Tidak beraroma"}
                  {" · "}{segment.origin === "LUKA_PENYAKIT" ? "Luka/penyakit" : "Alami"}
                </p>
              </div>
            ))}
            {!segments.length && (
              <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                Belum ada segmen darah yang lengkap.
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div
          ref={validationRef}
          tabIndex={-1}
          className="scroll-mt-6 outline-none"
        >
          <IssueList issues={issues} />
        </div>
        <Button className="w-full sm:w-auto" onClick={onAnalyze}>
          <Droplets /> Jalankan analisis
        </Button>
      </div>
    </NumberedSection>
  );
}

function ReviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

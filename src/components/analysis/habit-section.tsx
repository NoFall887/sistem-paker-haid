import { Info } from "lucide-react";

import { Field, NumberedSection } from "@/components/analysis/analysis-section";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import type { CaseInput } from "@/lib/fiqh-engine";

export function HabitSection({
  input,
  profile,
  onUpdate,
}: {
  input: CaseInput;
  profile?: string;
  onUpdate: (patch: Partial<CaseInput>) => void;
}) {
  return (
    <NumberedSection
      number={2}
      title="Catat kebiasaan yang masih diingat"
      description={
        profile
          ? `Profil terpilih: ${profile}. Isi hanya informasi yang diminta untuk profil ini.`
          : "Pilih profil pada bagian pertama untuk melihat informasi kebiasaan yang perlu diisi."
      }
    >
      {!input.userStatus ? (
        <Alert>
          <Info />
          <AlertTitle>Pilih profil terlebih dahulu</AlertTitle>
          <AlertDescription>
            Kolom kebiasaan yang sesuai akan muncul setelah profil dipilih.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {["MUTADAH", "DZAKIRAH_QADR"].includes(input.userStatus) && (
            <Field
              label="Adat durasi haid"
              hint="Antara 1–15 hari"
              htmlFor="habit-haid"
            >
              <Input
                id="habit-haid"
                type="number"
                inputMode="decimal"
                min={1}
                max={15}
                value={input.menstrualHabitDays ?? ""}
                onChange={(event) =>
                  onUpdate({ menstrualHabitDays: Number(event.target.value) })
                }
              />
            </Field>
          )}
          {["MUTADAH", "DZAKIRAH_WAQT"].includes(input.userStatus) && (
            <Field
              label="Adat durasi suci"
              hint="Minimal 15 hari; belum memengaruhi setiap cabang analisis"
              htmlFor="habit-suci"
            >
              <Input
                id="habit-suci"
                type="number"
                inputMode="decimal"
                min={15}
                value={input.purityHabitDays ?? ""}
                onChange={(event) =>
                  onUpdate({ purityHabitDays: Number(event.target.value) })
                }
              />
            </Field>
          )}
          {["MUTADAH", "DZAKIRAH_WAQT"].includes(input.userStatus) && (
            <Field
              label="Jam mulai kebiasaan"
              hint="Informasi konteks; batas utama tetap mengikuti log darah"
              htmlFor="habit-time"
            >
              <Input
                id="habit-time"
                type="time"
                value={input.habitualStartTime ?? ""}
                onChange={(event) =>
                  onUpdate({ habitualStartTime: event.target.value })
                }
              />
            </Field>
          )}
          {["MUBTADAH", "MUTAHAYYIRAH_MUTLAQAH"].includes(
            input.userStatus,
          ) && (
            <Alert className="sm:col-span-2">
              <Info />
              <AlertTitle>Tidak ada data kebiasaan yang perlu diisi</AlertTitle>
              <AlertDescription>
                Profil ini dianalisis dari status dan kronologi darah pada
                bagian berikutnya.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </NumberedSection>
  );
}

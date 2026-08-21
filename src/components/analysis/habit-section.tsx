import { Info, LocateFixed, Plus, Trash2 } from "lucide-react";

import { Field, NumberedSection } from "@/components/analysis/analysis-section";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CaseInput, HabitCycleInput } from "@/lib/fiqh-engine";
import { PRAYER_TIME_FEATURE_ENABLED } from "@/lib/prayer-times";

const numberOrUndefined = (value: string) => value === "" ? undefined : Number(value);
const durationParts = (hours?: number) => ({ days: Math.floor((hours ?? 0) / 24), hours: Math.floor((hours ?? 0) % 24), minutes: Math.round(((hours ?? 0) % 1) * 60) });
const totalHours = (days: number, hours: number, minutes: number) => days * 24 + hours + minutes / 60;

function DurationFields({ id, label, value, onChange, minDays = 0 }: { id: string; label: string; value?: number; onChange: (hours: number) => void; minDays?: number }) {
  const parts = durationParts(value);
  return (
    <fieldset className="rounded-lg border p-3">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Hari" htmlFor={`${id}-days`}><Input id={`${id}-days`} type="number" min={minDays} value={parts.days} onChange={(event) => onChange(totalHours(Number(event.target.value), parts.hours, parts.minutes))} /></Field>
        <Field label="Jam" htmlFor={`${id}-hours`}><Input id={`${id}-hours`} type="number" min={0} max={23} value={parts.hours} onChange={(event) => onChange(totalHours(parts.days, Number(event.target.value), parts.minutes))} /></Field>
        <Field label="Menit" htmlFor={`${id}-minutes`}><Input id={`${id}-minutes`} type="number" min={0} max={59} value={parts.minutes} onChange={(event) => onChange(totalHours(parts.days, parts.hours, Number(event.target.value)))} /></Field>
      </div>
    </fieldset>
  );
}

export function HabitSection({ input, profile, onUpdate }: { input: CaseInput; profile?: string; onUpdate: (patch: Partial<CaseInput>) => void }) {
  const history = input.habitHistory ?? [];
  const updateCycle = (index: number, patch: Partial<HabitCycleInput>) => onUpdate({ habitHistory: history.map((cycle, cycleIndex) => cycleIndex === index ? { ...cycle, ...patch } : cycle) });
  const requestLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => onUpdate({ location: { ...input.location, latitude: coords.latitude, longitude: coords.longitude, useDeviceLocation: true } }),
      () => onUpdate({ location: { ...input.location, useDeviceLocation: false } }),
    );
  };
  return (
    <NumberedSection number={2} title="Lengkapi profil dan adat" description={profile ? `Profil terpilih: ${profile}. Durasi dapat dicatat sampai tingkat menit.` : "Pilih profil pada bagian pertama."}>
      {!input.userStatus ? (
        <Alert><Info /><AlertTitle>Pilih profil terlebih dahulu</AlertTitle><AlertDescription>Kolom yang relevan akan muncul setelah profil dipilih.</AlertDescription></Alert>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Tanggal lahir" hint="Usia 9 tahun qamariyah Islamic Civil" htmlFor="birth-date"><Input id="birth-date" type="date" value={input.birthDate ?? ""} onChange={(event) => onUpdate({ birthDate: event.target.value })} /></Field>
            {input.userStatus === "MUBTADAH" && <label className="flex items-center gap-2 rounded-lg border p-3 text-sm"><input type="checkbox" checked={input.isFirstBleedingCycle !== false} onChange={(event) => onUpdate({ isFirstBleedingCycle: event.target.checked })} />Ini daur perdarahan pertama</label>}
            {["MUTADAH", "DZAKIRAH_WAQT"].includes(input.userStatus) && <Field label="Timestamp mulai adat" hint="Waktu mulai penuh, bukan hanya jam" htmlFor="remembered-start"><Input id="remembered-start" type="datetime-local" value={input.rememberedHabitStart ?? ""} onChange={(event) => onUpdate({ rememberedHabitStart: event.target.value })} /></Field>}
            {input.userStatus === "DZAKIRAH_QADR" && <><Field label="Awal rentang kemungkinan" htmlFor="range-start"><Input id="range-start" type="datetime-local" value={input.possibleHabitWindowStart ?? ""} onChange={(event) => onUpdate({ possibleHabitWindowStart: event.target.value })} /></Field><Field label="Akhir rentang kemungkinan" htmlFor="range-end"><Input id="range-end" type="datetime-local" value={input.possibleHabitWindowEnd ?? ""} onChange={(event) => onUpdate({ possibleHabitWindowEnd: event.target.value })} /></Field></>}
          </div>
          {["MUTADAH", "DZAKIRAH_QADR"].includes(input.userStatus) && <DurationFields id="menstrual-habit" label="Adat haid" value={input.menstrualHabitHours ?? (input.menstrualHabitDays ?? 7) * 24} onChange={(hours) => onUpdate({ menstrualHabitHours: hours, menstrualHabitDays: hours / 24 })} />}
          {input.userStatus === "MUTADAH" && <DurationFields id="purity-habit" label="Adat suci" minDays={15} value={input.purityHabitHours ?? (input.purityHabitDays ?? 15) * 24} onChange={(hours) => onUpdate({ purityHabitHours: hours, purityHabitDays: hours / 24 })} />}

          <fieldset className="rounded-lg border p-3">
            <legend className="px-1 text-sm font-semibold">Riwayat siklus untuk pola adat bergantian</legend>
            <div className="mt-2 space-y-2">
              {history.map((cycle, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input aria-label={`Haid siklus ${index + 1} dalam jam`} type="number" min={24} max={360} value={cycle.menstrualHours} onChange={(event) => updateCycle(index, { menstrualHours: Number(event.target.value) })} />
                  <Input aria-label={`Suci siklus ${index + 1} dalam jam`} type="number" min={360} value={cycle.purityHours} onChange={(event) => updateCycle(index, { purityHours: Number(event.target.value) })} />
                  <Button type="button" variant="ghost" size="icon" aria-label={`Hapus siklus ${index + 1}`} onClick={() => onUpdate({ habitHistory: history.filter((_, cycleIndex) => cycleIndex !== index) })}><Trash2 /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => onUpdate({ habitHistory: [...history, { menstrualHours: 120, purityHours: 360 }] })}><Plus />Tambah siklus</Button>
              <p className="text-xs text-muted-foreground">Kolom kiri = jam haid, kanan = jam suci. Pola diakui setelah dua putaran lengkap.</p>
            </div>
          </fieldset>

          <label className="flex items-center gap-2 rounded-lg border p-3 text-sm font-medium">
            <input type="checkbox" checked={input.hasPostpartumBleeding} onChange={(event) => onUpdate({ hasPostpartumBleeding: event.target.checked })} />
            Ada darah setelah persalinan
          </label>
          {input.hasPostpartumBleeding && <fieldset className="rounded-lg border p-3">
            <legend className="px-1 text-sm font-semibold">Rincian persalinan dan nifas</legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <Field label="Persalinan selesai" htmlFor="delivery-at"><Input id="delivery-at" type="datetime-local" value={input.deliveryAt ?? ""} onChange={(event) => onUpdate({ deliveryAt: event.target.value })} /></Field>
              <Field label="Adat nifas (jam)" htmlFor="nifas-habit"><Input id="nifas-habit" type="number" min={0} max={1440} value={input.postpartumHabitHours ?? ""} onChange={(event) => onUpdate({ postpartumHabitHours: numberOrUndefined(event.target.value) })} /></Field>
              <label className="flex items-center gap-2 rounded-lg border p-3 text-sm"><input type="checkbox" checked={input.deliveryComplete !== false} onChange={(event) => onUpdate({ deliveryComplete: event.target.checked })} />Persalinan sudah lengkap</label>
            </div>
          </fieldset>}

          {PRAYER_TIME_FEATURE_ENABLED && <fieldset className="rounded-lg border p-3">
            <legend className="px-1 text-sm font-semibold">Lokasi waktu shalat (opsional, diproses lokal)</legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <Field label="Lintang" htmlFor="latitude"><Input id="latitude" type="number" step="any" min={-90} max={90} value={input.location?.latitude ?? ""} onChange={(event) => onUpdate({ location: { ...input.location, latitude: numberOrUndefined(event.target.value) } })} /></Field>
              <Field label="Bujur" htmlFor="longitude"><Input id="longitude" type="number" step="any" min={-180} max={180} value={input.location?.longitude ?? ""} onChange={(event) => onUpdate({ location: { ...input.location, longitude: numberOrUndefined(event.target.value) } })} /></Field>
              <Button type="button" variant="outline" onClick={requestLocation}><LocateFixed />Gunakan lokasi perangkat</Button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {(["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).map((prayer) => (
                <Field key={prayer} label={`Koreksi ${prayer}`} hint="menit" htmlFor={`adjust-${prayer}`}>
                  <Input id={`adjust-${prayer}`} type="number" value={input.location?.prayerAdjustments?.[prayer] ?? 0} onChange={(event) => onUpdate({ location: { ...input.location, prayerAdjustments: { ...input.location?.prayerAdjustments, [prayer]: Number(event.target.value) } } })} />
                </Field>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Penolakan izin tidak menggagalkan analisis. Metode: Kemenag 20°/18°, Asar Syafi‘i, zona Asia/Jakarta.</p>
          </fieldset>}
        </div>
      )}
    </NumberedSection>
  );
}

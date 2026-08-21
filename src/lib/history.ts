import { TIMEZONE, type CaseInput } from "@/lib/fiqh-engine";

const STORAGE_KEY = "panduan-fikih-haid:history";
export const HISTORY_SCHEMA_VERSION = 3;

export interface PersistedHistory {
  schemaVersion: number;
  timezone: typeof TIMEZONE;
  updatedAt: string;
  caseInput: CaseInput;
}

export function historyEnvelope(caseInput: CaseInput): PersistedHistory {
  return {
    schemaVersion: HISTORY_SCHEMA_VERSION,
    timezone: TIMEZONE,
    updatedAt: new Date().toISOString(),
    caseInput,
  };
}

export function serializeHistory(caseInput: CaseInput) {
  return JSON.stringify(historyEnvelope(caseInput), null, 2);
}

export function saveHistory(caseInput: CaseInput) {
  localStorage.setItem(STORAGE_KEY, serializeHistory(caseInput));
}

export function migrateHistory(value: unknown): CaseInput | null {
  if (!value || typeof value !== "object") return null;
  const parsed = value as Partial<PersistedHistory>;
  if (parsed.timezone !== TIMEZONE || !parsed.caseInput || !Array.isArray(parsed.caseInput.segments)) return null;
  if (![1, 2, HISTORY_SCHEMA_VERSION].includes(parsed.schemaVersion ?? 0)) return null;
  const source = parsed.caseInput;
  return {
    ...source,
    birthDate: source.birthDate ?? "",
    menstrualHabitHours: source.menstrualHabitHours ?? (source.menstrualHabitDays ?? 7) * 24,
    purityHabitHours: source.purityHabitHours ?? (source.purityHabitDays ?? 15) * 24,
    rememberedHabitStart: source.rememberedHabitStart ?? "",
    possibleHabitWindowStart: source.possibleHabitWindowStart ?? "",
    possibleHabitWindowEnd: source.possibleHabitWindowEnd ?? "",
    isFirstBleedingCycle: source.isFirstBleedingCycle ?? true,
    habitHistory: source.habitHistory ?? [],
    hasPostpartumBleeding: source.hasPostpartumBleeding ?? Boolean(source.deliveryAt),
    isPregnant: source.isPregnant ?? false,
    deliveryAt: source.deliveryAt ?? "",
    deliveryComplete: source.deliveryComplete ?? true,
    location: source.location ?? { useDeviceLocation: false, prayerAdjustments: {} },
    segments: source.segments.map((segment) => ({
      ...segment,
      odor: segment.odor ?? "TIDAK_BERAROMA",
      origin: segment.origin ?? "ALAMI",
    })),
  };
}

export function loadHistory(): CaseInput | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return migrateHistory(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export function historyAsText(caseInput: CaseInput) {
  const status = caseInput.userStatus || "Belum dipilih";
  const segments = [...caseInput.segments].sort((a, b) => a.start.localeCompare(b.start));
  const lines = [
    "RIWAYAT DARAH — PANDUAN FIKIH HAID & ISTIHADHAH",
    `Zona waktu: ${TIMEZONE}`,
    `Status pengalaman: ${status}`,
    `Tanggal lahir: ${caseInput.birthDate || "-"}`,
    `Adat haid: ${caseInput.menstrualHabitHours ?? (caseInput.menstrualHabitDays ?? 0) * 24} jam`,
    `Adat suci: ${caseInput.purityHabitHours ?? (caseInput.purityHabitDays ?? 0) * 24} jam`,
    `Timestamp mulai yang diingat: ${caseInput.rememberedHabitStart || caseInput.habitualStartTime || "-"}`,
    `Rentang kemungkinan: ${caseInput.possibleHabitWindowStart || "-"} — ${caseInput.possibleHabitWindowEnd || "-"}`,
    `Darah setelah persalinan: ${caseInput.hasPostpartumBleeding ? "ya" : "tidak"}`,
    ...(caseInput.hasPostpartumBleeding ? [
      `Persalinan selesai: ${caseInput.deliveryAt || "-"}`,
      `Adat nifas: ${caseInput.postpartumHabitHours ?? "-"} jam`,
    ] : []),
    `Lokasi: ${caseInput.location?.latitude ?? "-"}, ${caseInput.location?.longitude ?? "-"}`,
    "",
    "KRONOLOGI DARAH",
  ];

  if (!segments.length) lines.push("Belum ada segmen darah.");
  segments.forEach((segment, index) => {
    lines.push(
      `${index + 1}. ${segment.start || "(mulai belum diisi)"} — ${segment.end || "(berhenti belum diisi)"}`,
      `   Warna: ${segment.color}; Kekentalan: ${segment.consistency}; Aroma: ${segment.odor ?? "TIDAK_BERAROMA"}; Asal: ${segment.origin ?? "ALAMI"}`,
    );
  });
  return `${lines.join("\r\n")}\r\n`;
}

export async function copyHistoryJson(caseInput: CaseInput) {
  await navigator.clipboard.writeText(serializeHistory(caseInput));
}

export function downloadHistoryText(caseInput: CaseInput) {
  const blob = new Blob([historyAsText(caseInput)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `riwayat-darah-${new Date().toISOString().slice(0, 10)}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

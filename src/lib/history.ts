import { TIMEZONE, type CaseInput } from "@/lib/fiqh-engine";

const STORAGE_KEY = "panduan-fikih-haid:history";
export const HISTORY_SCHEMA_VERSION = 1;

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

export function loadHistory(): CaseInput | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedHistory;
    if (
      parsed.schemaVersion !== HISTORY_SCHEMA_VERSION ||
      parsed.timezone !== TIMEZONE ||
      !parsed.caseInput ||
      !Array.isArray(parsed.caseInput.segments)
    ) {
      return null;
    }
    return parsed.caseInput;
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
    `Adat haid: ${caseInput.menstrualHabitDays ?? "-"} hari`,
    `Adat suci: ${caseInput.purityHabitDays ?? "-"} hari`,
    `Jam mulai kebiasaan: ${caseInput.habitualStartTime || "-"}`,
    "",
    "KRONOLOGI DARAH",
  ];

  if (!segments.length) lines.push("Belum ada segmen darah.");
  segments.forEach((segment, index) => {
    lines.push(
      `${index + 1}. ${segment.start || "(mulai belum diisi)"} — ${segment.end || "(berhenti belum diisi)"}`,
      `   Warna: ${segment.color}; Sifat: ${segment.consistency}`,
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

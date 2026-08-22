import { earliestEligibleHaidTimestamp, forbiddenFastDay } from "@/lib/islamic-calendar";
import { PRAYER_TIME_FEATURE_ENABLED, calculateKemenagPrayerTimes, prayerQadhaAtCessation, prayerQadhaAtOnset, type PrayerAdjustments, type PrayerName } from "@/lib/prayer-times";

export const TIMEZONE = "Asia/Jakarta" as const;
export const MINUTE_MS = 60_000;
export const HOUR_MS = 3_600_000;
export const MIN_HAID_HOURS = 24;
export const FIFTEEN_DAYS_HOURS = 360;
export const MAX_NIFAS_HOURS = 60 * 24;

export type UserStatus =
  | "MUTADAH"
  | "MUBTADAH"
  | "MUTAHAYYIRAH_MUTLAQAH"
  | "DZAKIRAH_QADR"
  | "DZAKIRAH_WAQT";
export type BloodColor = "TIDAK_DIKETAHUI" | "HITAM" | "MERAH" | "PIRANG" | "KUNING" | "KERUH" | "COKELAT";
export type BloodConsistency = "TIDAK_DIKETAHUI" | "KENTAL" | "CAIR";
export type BloodOdor = "TIDAK_DIKETAHUI" | "BERAROMA" | "TIDAK_BERAROMA";
export type BloodOrigin = "ALAMI" | "LUKA_PENYAKIT";
export type FiqhStatus = "HAID" | "HAID_SAHB" | "NIFAS" | "ISTIHADHAH" | "SUCI" | "FASAD" | "IHTIYATH";
export type Certainty = "YAKIN" | "ZHANNI" | "IHTIYATH";

export interface BloodSegmentInput {
  id: string;
  start: string;
  end: string;
  color: BloodColor;
  consistency: BloodConsistency;
  odor?: BloodOdor;
  origin?: BloodOrigin;
}

export interface HabitCycleInput {
  menstrualHours: number;
  purityHours: number;
  start?: string;
}

export interface LocationInput {
  latitude?: number;
  longitude?: number;
  useDeviceLocation?: boolean;
  prayerAdjustments?: PrayerAdjustments;
}

export interface CaseInput {
  userStatus: UserStatus | "";
  birthDate?: string;
  menstrualHabitDays?: number;
  menstrualHabitHours?: number;
  purityHabitDays?: number;
  purityHabitHours?: number;
  habitualStartTime?: string;
  rememberedHabitStart?: string;
  possibleHabitWindowStart?: string;
  possibleHabitWindowEnd?: string;
  isFirstBleedingCycle?: boolean;
  habitHistory?: HabitCycleInput[];
  knowsBloodCharacteristics: boolean;
  hasPostpartumBleeding: boolean;
  isPregnant?: boolean;
  deliveryAt?: string;
  deliveryComplete?: boolean;
  postpartumHabitHours?: number;
  location?: LocationInput;
  segments: BloodSegmentInput[];
}

export interface AnalysisRow {
  label: string;
  start: number;
  end: number;
  durationHours: number;
  status: FiqhStatus;
  displayStatus: string;
  note: string;
  ruleIds: string[];
  certainty: Certainty;
}

export interface TimelineSegment { label: string; hours: number; status: FiqhStatus }
export interface SourceReference { book: string; arabic: string; translation: string }
export interface HabitUpdate {
  menstrualHours?: number;
  purityHours?: number;
  postpartumHours?: number;
  alternatingPattern?: number[];
  text: string;
}
export interface WorshipEvent {
  at: number;
  type: "MANDI" | "QADHA" | "WUDU";
  description: string;
  certainty: Certainty;
}

export interface AnalysisResult {
  category: string;
  categoryTone: "haid" | "istihadhah" | "ihtiyath";
  summary: string;
  timeline: TimelineSegment[];
  rows: AnalysisRow[];
  haidPeriods: { label: string; start: number; end: number; totalBloodHours?: number }[];
  nifasPeriods: { label: string; start: number; end: number }[];
  guidance: { bath: string; prayer: string; fasting: string; intimacy: string };
  source: SourceReference;
  fastingWarnings: string[];
  habitUpdate: string;
  habitUpdateData: HabitUpdate;
  worshipEvents: WorshipEvent[];
  assumptions: string[];
  expertWarnings: string[];
  ruleIds: string[];
}

export interface ValidationIssue { segmentId?: string; message: string }

interface NormalizedSegment {
  start: number;
  end: number;
  durationHours: number;
  color: BloodColor;
  consistency: BloodConsistency;
  odor: BloodOdor;
  origin: BloodOrigin;
  sourceIds: string[];
}
interface Episode { start: number; end: number; durationHours: number; segments: NormalizedSegment[] }

const JAKARTA_OFFSET_MS = 7 * HOUR_MS;
const COLOR_RANK: Record<BloodColor, number> = { TIDAK_DIKETAHUI: 0, HITAM: 5, MERAH: 4, PIRANG: 3, KUNING: 2, KERUH: 1, COKELAT: 1 };
const GENERAL_SOURCE: SourceReference = {
  book: "Kodifikasi Master Kaidah Fiqih Haid Mazhab Syafi'i — Edisi Terkoreksi",
  arabic: "أَقَلُّ الْحَيْضِ يَوْمٌ وَلَيْلَةٌ وَأَكْثَرُهُ خَمْسَةَ عَشَرَ يَوْمًا وَأَقَلُّ الطُّهْرِ خَمْسَةَ عَشَرَ يَوْمًا",
  translation: "Minimal haid sehari semalam, maksimalnya lima belas hari, dan minimal suci antara dua haid lima belas hari.",
};
const NIFAS_SOURCE: SourceReference = {
  book: "Al-Majmu' dan Raudhat al-Thalibin — qaul ashahh/mu'tamad",
  arabic: "وَلَا حَدَّ لِأَقَلِّ النِّفَاسِ وَأَكْثَرُهُ سِتُّونَ يَوْمًا وَغَالِبُهُ أَرْبَعُونَ",
  translation: "Nifas tidak memiliki batas minimum nyata; maksimal enam puluh hari dan kebiasaan umumnya empat puluh hari.",
};

export const emptyCase = (): CaseInput => ({
  userStatus: "",
  birthDate: "",
  menstrualHabitDays: 7,
  menstrualHabitHours: 168,
  purityHabitDays: 15,
  purityHabitHours: 360,
  habitualStartTime: "06:00",
  rememberedHabitStart: "",
  possibleHabitWindowStart: "",
  possibleHabitWindowEnd: "",
  isFirstBleedingCycle: true,
  habitHistory: [],
  knowsBloodCharacteristics: false,
  hasPostpartumBleeding: false,
  isPregnant: false,
  deliveryAt: "",
  deliveryComplete: true,
  postpartumHabitHours: undefined,
  location: { useDeviceLocation: false, prayerAdjustments: {} },
  segments: [],
});

export function createEmptySegment(): BloodSegmentInput {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `segment-${Date.now()}`,
    start: "", end: "", color: "TIDAK_DIKETAHUI", consistency: "TIDAK_DIKETAHUI",
    odor: "TIDAK_DIKETAHUI", origin: "ALAMI",
  };
}

export function parseJakartaDateTime(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d, h, min] = match.map(Number);
  const timestamp = Date.UTC(y, m - 1, d, h, min) - JAKARTA_OFFSET_MS;
  return formatJakartaInput(timestamp) === value ? timestamp : null;
}
export function formatJakartaInput(timestamp: number): string {
  const date = new Date(timestamp + JAKARTA_OFFSET_MS);
  const part = (value: number) => String(value).padStart(2, "0");
  return `${date.getUTCFullYear()}-${part(date.getUTCMonth() + 1)}-${part(date.getUTCDate())}T${part(date.getUTCHours())}:${part(date.getUTCMinutes())}`;
}
export function formatJakartaDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat("id-ID", { timeZone: TIMEZONE, day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(timestamp);
}

const diffHours = (end: number, start: number) => (end - start) / HOUR_MS;
const addHours = (start: number, hours: number) => start + hours * HOUR_MS;
const traitCount = (segment: NormalizedSegment) => (segment.consistency === "KENTAL" ? 1 : 0) + (segment.odor === "BERAROMA" ? 1 : 0);
const signature = (segment: NormalizedSegment) => `${segment.color}/${segment.consistency}/${segment.odor}`;
const comparePrimaryStrength = (left: NormalizedSegment, right: NormalizedSegment) => traitCount(left) - traitCount(right) || COLOR_RANK[left.color] - COLOR_RANK[right.color];
const hasUnknownCharacteristics = (segments: NormalizedSegment[]) => segments.some((segment) => segment.color === "TIDAK_DIKETAHUI" || segment.consistency === "TIDAK_DIKETAHUI" || segment.odor === "TIDAK_DIKETAHUI");

export function normalizeInput(input: CaseInput): { segments: NormalizedSegment[]; episodes: Episode[]; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  const parsed: NormalizedSegment[] = [];
  input.segments.forEach((segment, index) => {
    if (!segment.start && !segment.end) return;
    if (!segment.start || !segment.end) {
      issues.push({ segmentId: segment.id, message: `Segmen ${index + 1}: waktu mulai dan berhenti harus diisi lengkap.` });
      return;
    }
    const start = parseJakartaDateTime(segment.start);
    const end = parseJakartaDateTime(segment.end);
    if (start === null || end === null) {
      issues.push({ segmentId: segment.id, message: `Segmen ${index + 1}: tanggal atau jam tidak valid.` });
      return;
    }
    if (end <= start) {
      issues.push({ segmentId: segment.id, message: `Segmen ${index + 1}: waktu berhenti harus setelah waktu mulai.` });
      return;
    }
    parsed.push({
      start, end, durationHours: diffHours(end, start), color: segment.color,
      consistency: segment.consistency, odor: segment.odor ?? "TIDAK_BERAROMA",
      origin: segment.origin ?? "ALAMI", sourceIds: [segment.id],
    });
  });
  parsed.sort((a, b) => a.start - b.start);
  for (let index = 1; index < parsed.length; index++) {
    if (parsed[index].start < parsed[index - 1].end) {
      issues.push({ segmentId: parsed[index].sourceIds[0], message: "Ada rentang darah yang tumpang-tindih. Periksa kedua segmen terkait." });
    }
  }
  if (issues.length) return { segments: [], episodes: [], issues };
  const segments: NormalizedSegment[] = [];
  for (const segment of parsed) {
    const previous = segments.at(-1);
    if (previous && previous.end === segment.start && signature(previous) === signature(segment) && previous.origin === segment.origin) {
      previous.end = segment.end;
      previous.durationHours = diffHours(previous.end, previous.start);
      previous.sourceIds.push(...segment.sourceIds);
    } else segments.push({ ...segment, sourceIds: [...segment.sourceIds] });
  }
  const episodes: Episode[] = [];
  for (const segment of segments) {
    const previous = episodes.at(-1);
    if (previous && previous.end === segment.start) {
      previous.end = segment.end;
      previous.durationHours = diffHours(previous.end, previous.start);
      previous.segments.push(segment);
    } else episodes.push({ start: segment.start, end: segment.end, durationHours: segment.durationHours, segments: [segment] });
  }
  return { segments, episodes, issues };
}

function baseResult(): AnalysisResult {
  return {
    category: "", categoryTone: "haid", summary: "", timeline: [], rows: [], haidPeriods: [], nifasPeriods: [],
    guidance: { bath: "", prayer: "", fasting: "", intimacy: "" }, source: GENERAL_SOURCE,
    fastingWarnings: [], habitUpdate: "", habitUpdateData: { text: "" }, worshipEvents: [],
    assumptions: [], expertWarnings: [], ruleIds: [],
  };
}

function displayStatus(status: FiqhStatus) {
  if (status === "HAID_SAHB") return "HAID (SAHB)";
  if (status === "ISTIHADHAH") return "ISTIHADHAH / SUCI HUKMI";
  return status;
}

function addRow(result: AnalysisResult, label: string, start: number, end: number, status: FiqhStatus, note: string, ruleIds: string[], certainty: Certainty = "YAKIN") {
  if (end <= start) return;
  const previous = result.rows.at(-1);
  if (previous && previous.end === start && previous.status === status && previous.note === note && previous.certainty === certainty && previous.ruleIds.join() === ruleIds.join()) {
    previous.end = end;
    previous.durationHours = diffHours(end, previous.start);
    return;
  }
  result.rows.push({ label, start, end, durationHours: diffHours(end, start), status, displayStatus: displayStatus(status), note, ruleIds, certainty });
}

function rebuildTimeline(result: AnalysisResult) {
  result.timeline = result.rows.map((row) => ({ label: row.label, hours: row.durationHours, status: row.status }));
  result.ruleIds = [...new Set(result.rows.flatMap((row) => row.ruleIds))];
}

function summarizeBlood(segments: NormalizedSegment[]) {
  return [...new Set(segments.map((segment) => `${segment.color} / ${segment.consistency} / ${segment.odor}`))].join(", ");
}

function tamyizPattern(segments: NormalizedSegment[], episodes: Episode[]) {
  const natural = segments.filter((segment) => segment.origin === "ALAMI");
  if (hasUnknownCharacteristics(natural)) return null;
  if (!natural.length || episodes.length !== 1 || episodes[0].segments.some((segment) => segment.origin !== "ALAMI")) return null;
  const first = natural[0];
  if (natural.some((segment) => comparePrimaryStrength(segment, first) > 0)) return null;
  const transition = natural.findIndex((segment, index) => index > 0 && (comparePrimaryStrength(segment, first) < 0 || signature(segment) !== signature(first)));
  if (transition < 1) return null;
  if (natural.slice(transition).some((segment) => comparePrimaryStrength(segment, first) > 0 || signature(segment) === signature(first))) return null;
  const strongStart = first.start;
  const strongEnd = natural[transition - 1].end;
  const weakStart = natural[transition].start;
  const weakEnd = natural.at(-1)!.end;
  return { transition, strongStart, strongEnd, weakStart, weakEnd, strongHours: diffHours(strongEnd, strongStart), weakHours: diffHours(weakEnd, weakStart), natural };
}

function applyAgeAndOrigin(input: CaseInput, segments: NormalizedSegment[], result: AnalysisResult) {
  if (!input.birthDate) {
    result.assumptions.push("Tanggal lahir tidak diisi; engine tidak dapat memverifikasi batas usia sembilan tahun qamariyah.");
    return segments;
  }
  const threshold = earliestEligibleHaidTimestamp(input.birthDate);
  if (threshold === null) {
    result.expertWarnings.push("Tanggal lahir tidak valid untuk perhitungan Islamic Civil.");
    return segments;
  }
  const eligible: NormalizedSegment[] = [];
  for (const segment of segments) {
    if (segment.end <= threshold) {
      addRow(result, "Darah sebelum usia memungkinkan haid", segment.start, segment.end, "FASAD", "Belum masuk toleransi kurang dari 16 hari sebelum ulang tahun qamariyah kesembilan.", ["AGE-09", "AGE-TAQRIB"]);
    } else {
      if (segment.start < threshold) addRow(result, "Darah sebelum ambang usia", segment.start, threshold, "FASAD", "Bagian sebelum ambang usia dipotong otomatis.", ["AGE-09", "AGE-TAQRIB"]);
      const start = Math.max(segment.start, threshold);
      eligible.push({ ...segment, start, durationHours: diffHours(segment.end, start) });
    }
  }
  return eligible;
}

function episodesFrom(segments: NormalizedSegment[]) {
  const episodes: Episode[] = [];
  for (const segment of segments) {
    const last = episodes.at(-1);
    if (last && last.end === segment.start) {
      last.end = segment.end; last.durationHours = diffHours(last.end, last.start); last.segments.push(segment);
    } else episodes.push({ start: segment.start, end: segment.end, durationHours: segment.durationHours, segments: [segment] });
  }
  return episodes;
}

function clipRow(result: AnalysisResult, label: string, start: number, end: number, globalStart: number, globalEnd: number, status: FiqhStatus, note: string, rules: string[], certainty: Certainty) {
  addRow(result, label, Math.max(start, globalStart), Math.min(end, globalEnd), status, note, rules, certainty);
}

function analyzeMemoryCategory(input: CaseInput, segments: NormalizedSegment[], result: AnalysisResult) {
  const globalStart = segments[0].start;
  const globalEnd = segments.at(-1)!.end;
  if (input.userStatus === "MUTAHAYYIRAH_MUTLAQAH") {
    result.category = "MUTAHAYYIRAH MUTHLAQAH (ADH-DHĀLLAH)"; result.categoryTone = "ihtiyath";
    result.summary = "Jumlah dan waktu adat sama-sama terlupa; seluruh rentang diperlakukan dengan ihtiyath.";
    addRow(result, "Masa ragu", globalStart, globalEnd, "IHTIYATH", "Berpotensi haid, suci, atau waktu terputusnya haid.", ["MUST-07", "MUTA-IHTIYATH"], "IHTIYATH");
    result.guidance = {
      bath: "Mandi untuk setiap shalat fardhu menurut qaul ashahh selama keadaan mutahayyirah berlangsung.",
      prayer: "Tetap shalat setelah bersuci dan menangani darah seperti mustahadhah.",
      fasting: "Puasa 30 hari menjamin 14 hari sah. Qadha 30 hari berikutnya menjamin 14 lagi; sisa dapat dituntaskan dengan pola 6 hari (hari 1–3 dan 16–18) atau alternatif 5 hari menurut Ibn Hajar dengan verifikasi ahli.",
      intimacy: "Jima' dihindari selama darah terus mengalir menurut hukum ihtiyath.",
    };
    return true;
  }
  if (input.userStatus === "DZAKIRAH_WAQT") {
    const remembered = parseJakartaDateTime(input.rememberedHabitStart ?? "") ?? globalStart;
    if (!input.rememberedHabitStart) result.assumptions.push("Waktu mulai adat tidak diisi; awal darah pertama dipakai sebagai asumsi sementara.");
    result.category = "DZĀKIRAH LIL-WAQT FAQATH"; result.categoryTone = "ihtiyath";
    result.summary = "Waktu mulai diingat tetapi kadar terlupa: 24 jam pertama yakin haid, berikutnya ihtiyath sampai batas 15 hari.";
    clipRow(result, "Sebelum waktu adat", globalStart, remembered, globalStart, globalEnd, "SUCI", "Di luar waktu mulai yang diingat.", ["MUST-06"], "YAKIN");
    clipRow(result, "Yakin haid 24 jam", remembered, addHours(remembered, 24), globalStart, globalEnd, "HAID", "Kadar minimum haid dari waktu mulai yang diingat.", ["MUST-06", "HAID-MIN-24"], "YAKIN");
    clipRow(result, "Ihtiyath hari 2–15", addHours(remembered, 24), addHours(remembered, 360), globalStart, globalEnd, "IHTIYATH", "Kadar sebenarnya mungkin berakhir pada setiap saat.", ["MUST-06"], "IHTIYATH");
    clipRow(result, "Setelah maksimum haid", addHours(remembered, 360), globalEnd, globalStart, globalEnd, "ISTIHADHAH", "Yakin bukan haid setelah 15 hari.", ["MUST-06", "HAID-MAX-360"], "YAKIN");
    result.haidPeriods.push({ label: "HAID YAKIN", start: remembered, end: Math.min(addHours(remembered, 24), globalEnd) });
    result.guidance = { bath: "Mandi setelah 24 jam, lalu mandi pada setiap kemungkinan berhenti sampai hari ke-15.", prayer: "Tidak shalat pada 24 jam yakin haid; setelahnya shalat dengan ihtiyath.", fasting: "Puasa pada masa yakin haid tidak sah; masa ihtiyath memerlukan penyelesaian qadha.", intimacy: "Dihindari sampai batas ihtiyath selesai." };
    return true;
  }
  if (input.userStatus === "DZAKIRAH_QADR") {
    const duration = input.menstrualHabitHours ?? (input.menstrualHabitDays ?? 7) * 24;
    const windowStart = parseJakartaDateTime(input.possibleHabitWindowStart ?? "");
    const windowEnd = parseJakartaDateTime(input.possibleHabitWindowEnd ?? "");
    if (windowStart === null || windowEnd === null || windowEnd - windowStart < duration * HOUR_MS) return false;
    const latestStart = windowEnd - duration * HOUR_MS;
    const earliestEnd = windowStart + duration * HOUR_MS;
    result.category = "DZĀKIRAH LIL-QADR FAQATH"; result.categoryTone = "ihtiyath";
    result.summary = "Rentang semua kemungkinan awal adat dihitung; irisan seluruh kemungkinan menjadi haid yakin.";
    clipRow(result, "Kemungkinan awal haid", globalStart, latestStart, globalStart, globalEnd, "IHTIYATH", "Mungkin sudah haid atau masih suci; wudhu sesuai hukum mustahadhah.", ["MUST-05", "QADR-RANGE"], "IHTIYATH");
    if (earliestEnd > latestStart) {
      clipRow(result, "Haid yakin", latestStart, earliestEnd, globalStart, globalEnd, "HAID", "Irisan dari seluruh kemungkinan posisi adat.", ["MUST-05", "QADR-RANGE"], "YAKIN");
      result.haidPeriods.push({ label: "HAID YAKIN", start: latestStart, end: earliestEnd });
    }
    clipRow(result, "Kemungkinan akhir haid", Math.max(latestStart, earliestEnd), windowEnd, globalStart, globalEnd, "IHTIYATH", "Mungkin haid telah berhenti; mandi pada setiap kemungkinan berhenti.", ["MUST-05", "QADR-RANGE"], "IHTIYATH");
    clipRow(result, "Setelah rentang kemungkinan", windowEnd, globalEnd, globalStart, globalEnd, "ISTIHADHAH", "Di luar semua kemungkinan adat haid.", ["MUST-05"], "YAKIN");
    result.guidance = { bath: "Mandi pada bagian kemungkinan akhir haid.", prayer: "Shalat pada bagian ragu setelah bersuci; tidak shalat pada irisan haid yakin.", fasting: "Nilai puasa mengikuti bagian yakin dan ragu pada ledger.", intimacy: "Hindari pada bagian haid yakin dan ihtiyath." };
    return true;
  }
  return false;
}

function analyzeTamyiz(input: CaseInput, segments: NormalizedSegment[], episodes: Episode[], result: AnalysisResult) {
  if (!input.knowsBloodCharacteristics) return false;
  const pattern = tamyizPattern(segments, episodes);
  if (!pattern || pattern.strongHours < 24 || pattern.strongHours > 360 || pattern.weakHours < 360) return false;
  const firstMubtadahCycle = input.userStatus === "MUBTADAH" && input.isFirstBleedingCycle !== false;
  const categoryRule = input.userStatus === "MUBTADAH" ? "MUST-01" : "MUST-03";
  result.category = input.userStatus === "MUBTADAH" ? "MUBTADA'AH MUMAYYIZAH" : "MU'TADAH MUMAYYIZAH";
  result.summary = `Tamyiz sah: jumlah sifat kuat didahulukan, lalu warna, lalu darah terdahulu ketika benar-benar setara; tamyiz mendahului adat.${firstMubtadahCycle ? " Pada daur pertama, kepastian istihadhah baru diketahui setelah darah tembus 15 hari." : ""}`;
  addRow(result, "Darah kuat — haid", pattern.strongStart, pattern.strongEnd, "HAID", summarizeBlood(pattern.natural.slice(0, pattern.transition)), [categoryRule, "TAMYIZ-ORDER", "TAMYIZ-VALID"], "YAKIN");
  addRow(result, "Darah lemah — istihadhah", pattern.weakStart, pattern.weakEnd, "ISTIHADHAH", summarizeBlood(pattern.natural.slice(pattern.transition)), [categoryRule, "TAMYIZ-VALID"], "YAKIN");
  result.haidPeriods.push({ label: "HAID TAMYIZ", start: pattern.strongStart, end: pattern.strongEnd });
  result.guidance = firstMubtadahCycle
    ? {
        bath: "Pada daur pertama, tetap menahan diri sampai darah tembus 15 hari. Begitu masuk hari ke-16, wajib langsung mandi besar.",
        prayer: "Qadha seluruh shalat fardhu yang ditinggalkan sejak darah berubah lemah sampai akhir hari ke-15. Pada daur berikutnya, langsung shalat setelah darah berubah lemah dan mandi.",
        fasting: "Darah kuat adalah haid dan darah lemah secara akhir berstatus istihadhah; ibadah daur pertama diselesaikan setelah kepastian pada hari ke-16.",
        intimacy: "Pada daur pertama, ikuti kehati-hatian sampai darah tembus 15 hari; setelah mandi pada hari ke-16 berlaku hukum istihadhah.",
      }
    : { bath: "Mandi saat darah kuat beralih menjadi darah lemah.", prayer: "Tidak shalat pada darah kuat; shalat pada darah lemah setelah mandi.", fasting: "Puasa darah kuat tidak sah; puasa darah lemah sah.", intimacy: "Boleh pada istihadhah setelah mandi dari haid." };
  return true;
}

function habitHours(input: CaseInput) {
  return input.menstrualHabitHours ?? (input.menstrualHabitDays ?? 7) * 24;
}

function analyzeSingleLong(input: CaseInput, segments: NormalizedSegment[], episodes: Episode[], result: AnalysisResult) {
  if (episodes.length !== 1 || episodes[0].durationHours <= 360 || episodes[0].segments.some((segment) => segment.origin !== "ALAMI")) return false;
  const start = episodes[0].start;
  const end = episodes[0].end;
  const mubtadah = input.userStatus === "MUBTADAH";
  const hours = mubtadah ? 24 : habitHours(input);
  const rememberedStart = !mubtadah ? parseJakartaDateTime(input.rememberedHabitStart ?? "") : null;
  const validRememberedStart = rememberedStart !== null && rememberedStart >= start && rememberedStart < end;
  const haidStart = validRememberedStart ? rememberedStart! : start;
  if (!mubtadah && !validRememberedStart) result.assumptions.push("Timestamp mulai adat Mu'tadah tidak diisi atau berada di luar episode; awal episode dipakai sebagai waktu adat.");
  const haidEnd = Math.min(addHours(haidStart, hours), end);
  const natural = segments.filter((segment) => segment.origin === "ALAMI");
  if (!input.knowsBloodCharacteristics) result.assumptions.push("Tamyiz tidak dinilai karena pengguna menyatakan tidak dapat mengamati perbedaan sifat darah.");
  else if (hasUnknownCharacteristics(natural)) result.assumptions.push("Tamyiz tidak dinilai karena ada sifat darah alami yang tidak diketahui.");
  result.category = mubtadah ? "MUBTADA'AH GHOIRU MUMAYYIZAH" : "MU'TADAH GHOIRU MUMAYYIZAH";
  result.categoryTone = "istihadhah";
  result.summary = mubtadah ? "Darah melampaui 15 hari tanpa tamyiz: 24 jam haid dan 29 hari suci hukmi dalam daur 30 hari." : `Darah melampaui 15 hari tanpa tamyiz: kembali kepada adat ${hours} jam pada waktu adat.`;
  addRow(result, "Istihadhah sebelum waktu adat", start, Math.max(start, haidStart), "ISTIHADHAH", "Darah berada sebelum timestamp adat yang diingat.", ["MUST-04"], "YAKIN");
  addRow(result, "Haid", Math.max(start, haidStart), haidEnd, "HAID", mubtadah ? "Kadar minimal haid." : "Kembali kepada kadar dan waktu adat.", [mubtadah ? "MUST-02" : "MUST-04"], "YAKIN");
  addRow(result, "Istihadhah", haidEnd, end, "ISTIHADHAH", "Suci hukmi di luar kadar haid.", [mubtadah ? "MUST-02" : "MUST-04"], "YAKIN");
  result.haidPeriods.push({ label: "HAID", start: Math.max(start, haidStart), end: haidEnd });
  result.guidance = mubtadah
    ? { bath: input.isFirstBleedingCycle === false ? "Pada daur berikutnya mandi setelah 24 jam." : "Pada daur pertama menunggu sampai hari ke-16, lalu mandi dan mengqadha ibadah hari ke-2–15.", prayer: "Daur pertama: qadha shalat hari ke-2–15; daur berikutnya shalat setelah 24 jam.", fasting: "Puasa pada istihadhah sah setelah bersuci.", intimacy: "Boleh setelah mandi di luar 24 jam haid." }
    : { bath: `Mandi setelah adat ${hours} jam.`, prayer: "Shalat setelah kadar adat selesai.", fasting: "Puasa di luar kadar adat sah.", intimacy: "Boleh pada istihadhah setelah mandi." };
  return true;
}

function prospectiveBloodHours(segments: NormalizedSegment[], index: number, start: number) {
  const windowEnd = addHours(start, 360);
  let total = 0;
  for (let cursor = index; cursor < segments.length; cursor++) {
    const segment = segments[cursor];
    if (segment.start >= windowEnd) break;
    if (segment.origin === "ALAMI") total += diffHours(Math.min(segment.end, windowEnd), Math.max(segment.start, start));
  }
  return total;
}

function runGeneralEngine(segments: NormalizedSegment[], result: AnalysisResult) {
  let cursor = segments[0].start;
  let active: AnalysisResult["haidPeriods"][number] | null = null;
  let activeMaySahb = true;
  let purityDue: number | null = null;
  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    if (segment.origin !== "ALAMI") {
      if (segment.start > cursor) addRow(result, "Suci", cursor, segment.start, "SUCI", "Tidak ada darah alami.", ["ORIGIN-NATURAL"]);
      addRow(result, "Darah luka/penyakit", segment.start, segment.end, "FASAD", "Asal darah dinyatakan luka atau penyakit, sehingga bukan haid/nifas.", ["ORIGIN-NATURAL"]);
      cursor = segment.end;
      continue;
    }
    if (!active) {
      if (segment.start > cursor) addRow(result, "Suci", cursor, segment.start, "SUCI", "Masa bersih.", ["PURITY"]);
      const possible = prospectiveBloodHours(segments, index, segment.start) >= 24;
      if (!possible) {
        addRow(result, "Darah fasad", segment.start, segment.end, "FASAD", "Akumulasi darah tidak mencapai 24 jam dalam imkan 15 hari.", ["HAID-MIN-24"]);
      } else {
        active = { label: `HAID ${result.haidPeriods.length + 1}`, start: segment.start, end: segment.end, totalBloodHours: segment.durationHours };
        result.haidPeriods.push(active);
        activeMaySahb = true;
        addRow(result, active.label, segment.start, segment.end, "HAID", "Awal haid sah.", ["HAID-MIN-24", "HAID-MAX-360"]);
        purityDue = addHours(segment.end, 360);
      }
      cursor = segment.end;
      continue;
    }

    const withinSameMaximum = segment.end <= addHours(active.start, 360);
    if (withinSameMaximum && activeMaySahb) {
      if (segment.start > cursor) addRow(result, `Naqa' — ${active.label}`, cursor, segment.start, "HAID_SAHB", "Masa bersih ditarik menjadi haid karena rangkaian tidak melampaui 15 hari dan darah nyata mencapai 24 jam.", ["SAHB"]);
      addRow(result, `Lanjutan ${active.label}`, segment.start, segment.end, "HAID", "Darah nyata dalam maksimum satu haid.", ["SAHB"]);
      active.end = segment.end;
      active.totalBloodHours = (active.totalBloodHours ?? 0) + segment.durationHours;
      purityDue = addHours(segment.end, 360);
      cursor = segment.end;
      continue;
    }

    const due = purityDue ?? addHours(active.end, 360);
    const crossedTakmil = segment.start < due;
    if (segment.start > cursor) addRow(result, "Suci sela", cursor, segment.start, "SUCI", "Suci nyata setelah haid.", ["PURITY", "TAKMIL"]);
    if (segment.start < due) {
      const takmilEnd = Math.min(segment.end, due);
      addRow(result, "Istihadhah takmil", segment.start, takmilEnd, "ISTIHADHAH", "Darah menggenapkan minimal suci 15 hari.", ["TAKMIL"]);
      cursor = takmilEnd;
      if (segment.end <= due) continue;
    }
    const newStart = Math.max(segment.start, due);
    const available = prospectiveBloodHours(segments, index, newStart);
    if (available >= 24) {
      active = { label: `HAID ${result.haidPeriods.length + 1}`, start: newStart, end: segment.end, totalBloodHours: diffHours(segment.end, newStart) };
      result.haidPeriods.push(active);
      activeMaySahb = !crossedTakmil;
      addRow(result, active.label, newStart, segment.end, "HAID", "Sisa setelah takmil mencapai minimal 24 jam dan menjadi haid baru.", ["TAKMIL", "HAID-MIN-24"]);
      purityDue = addHours(segment.end, 360);
    } else {
      addRow(result, "Sisa darah fasad", newStart, segment.end, "FASAD", "Sisa setelah takmil tidak mencapai 24 jam.", ["TAKMIL", "HAID-MIN-24"]);
      active = null;
      activeMaySahb = true;
      purityDue = null;
    }
    cursor = segment.end;
  }
  result.category = "HASIL ANALISIS FIKIH";
  result.summary = `Ditemukan ${result.haidPeriods.length} haid sah melalui ledger Sahb/Takmil tanpa gap atau tumpang tindih.`;
  result.guidance = { bath: "Mandi setiap kali haid sah berakhir.", prayer: "Tidak shalat pada haid; shalat pada suci, fasad, dan istihadhah setelah tata cara bersuci yang sesuai.", fasting: "Puasa haid tidak sah dan wajib diqadha; puasa istihadhah/suci sah selain hari yang haram berpuasa.", intimacy: "Boleh pada suci atau istihadhah setelah mandi dari haid." };
}

function analyzeNifas(input: CaseInput, allSegments: NormalizedSegment[], result: AnalysisResult, delivery: number) {
  const before = allSegments.filter((segment) => segment.start < delivery).map((segment) => segment.end > delivery ? { ...segment, end: delivery, durationHours: diffHours(delivery, segment.start) } : segment);
  const after = allSegments.filter((segment) => segment.end > delivery).map((segment) => segment.start < delivery ? { ...segment, start: delivery, durationHours: diffHours(segment.end, delivery) } : segment);
  if (before.length) {
    const preResult = baseResult();
    runGeneralEngine(before, preResult);
    for (const row of preResult.rows) result.rows.push(row);
    result.haidPeriods.push(...preResult.haidPeriods);
  }
  if (!after.length) return false;
  const firstNatural = after.find((segment) => segment.origin === "ALAMI");
  if (!firstNatural) {
    for (const segment of after) addRow(result, "Darah luka/penyakit", segment.start, segment.end, "FASAD", "Bukan darah alami.", ["ORIGIN-NATURAL"]);
    return true;
  }
  const delay = diffHours(firstNatural.start, delivery);
  if (delay >= 360) {
    if (firstNatural.start > delivery) addRow(result, "Suci setelah persalinan", delivery, firstNatural.start, "SUCI", "Tidak ada darah nifas selama 15 hari penuh.", ["NIFAS-DELAY-15"]);
    const postResult = baseResult();
    runGeneralEngine(after, postResult);
    result.rows.push(...postResult.rows); result.haidPeriods.push(...postResult.haidPeriods);
    result.category = "DARAH SETELAH PERSALINAN BUKAN NIFAS";
    result.summary = "Darah pertama baru keluar setelah suci 15 hari penuh; darah dinilai sebagai haid/fasad, bukan nifas.";
    return true;
  }
  if (firstNatural.start > delivery && (!result.rows.length || result.rows.at(-1)!.end < firstNatural.start)) addRow(result, "Suci sebelum nifas", delivery, firstNatural.start, "SUCI", "Darah nifas tertunda kurang dari 15 hari; jeda tetap dihitung dalam batas 60 hari.", ["NIFAS-DELAY-LT15"]);

  const maxEnd = addHours(delivery, MAX_NIFAS_HOURS);
  const continuousPastMax = after.some((segment) => segment.start <= maxEnd && segment.end > maxEnd);
  let nifasLimit = maxEnd;
  if (continuousPastMax) {
    const postpartumHabit = input.postpartumHabitHours;
    if (postpartumHabit && postpartumHabit > 0 && postpartumHabit <= MAX_NIFAS_HOURS) nifasLimit = addHours(firstNatural.start, postpartumHabit);
    else {
      const postEpisodes = episodesFrom(after.filter((segment) => segment.origin === "ALAMI"));
      const naturalAfter = after.filter((segment) => segment.origin === "ALAMI");
      const hasUnknown = hasUnknownCharacteristics(naturalAfter);
      const pattern = input.knowsBloodCharacteristics && !hasUnknown ? tamyizPattern(after, postEpisodes) : null;
      if (!input.knowsBloodCharacteristics) result.assumptions.push("Tamyiz nifas tidak dinilai karena pengguna menyatakan tidak dapat mengamati perbedaan sifat darah.");
      else if (hasUnknown) result.assumptions.push("Tamyiz nifas tidak dinilai karena ada sifat darah alami yang tidak diketahui.");
      if (pattern && pattern.strongHours <= MAX_NIFAS_HOURS && pattern.weakHours >= 360) nifasLimit = pattern.strongEnd;
      else nifasLimit = firstNatural.start + MINUTE_MS;
    }
  }

  let cursor = firstNatural.start;
  let lastNifasEnd: number | null = null;
  for (let index = 0; index < after.length; index++) {
    const segment = after[index];
    if (segment.end <= firstNatural.start) continue;
    if (segment.origin !== "ALAMI") {
      if (segment.start > cursor) addRow(result, "Suci", cursor, segment.start, "SUCI", "Masa bersih.", ["PURITY"]);
      addRow(result, "Darah luka/penyakit", segment.start, segment.end, "FASAD", "Bukan darah alami.", ["ORIGIN-NATURAL"]);
      cursor = segment.end; continue;
    }
    if (segment.start > cursor) {
      const gap = diffHours(segment.start, cursor);
      const withinSixty = segment.start < maxEnd;
      if (lastNifasEnd !== null && gap < 360 && withinSixty) addRow(result, "Naqa' nifas", cursor, segment.start, "NIFAS", "Naqa' kurang dari 15 hari di antara darah nifas mengikuti qaul Sahb.", ["NIFAS-NAQA-SAHB"]);
      else {
        addRow(result, "Suci", cursor, segment.start, "SUCI", "Naqa' mencapai 15 hari atau berada di luar nifas.", ["NIFAS-NAQA-15"]);
        if (lastNifasEnd !== null && gap >= 360) {
          const postResult = baseResult();
          runGeneralEngine(after.slice(index), postResult);
          result.rows.push(...postResult.rows);
          result.haidPeriods.push(...postResult.haidPeriods);
          break;
        }
      }
    }
    const nifasStart = Math.max(segment.start, firstNatural.start);
    const nifasEnd = Math.min(segment.end, nifasLimit, maxEnd);
    if (nifasEnd > nifasStart) {
      addRow(result, "Nifas", nifasStart, nifasEnd, "NIFAS", continuousPastMax ? "Kadar nifas ditentukan oleh tamyiz/adat atau minimal satu menit pada resolusi aplikasi." : "Darah alami setelah persalinan dalam batas maksimal 60 hari.", ["NIFAS-MIN", "NIFAS-MAX-60"], continuousPastMax ? "ZHANNI" : "YAKIN");
      result.nifasPeriods.push({ label: `NIFAS ${result.nifasPeriods.length + 1}`, start: nifasStart, end: nifasEnd });
      lastNifasEnd = nifasEnd;
    }
    if (segment.end > nifasEnd) addRow(result, "Istihadhah setelah nifas", Math.max(nifasEnd, segment.start), segment.end, "ISTIHADHAH", "Darah melampaui kadar nifas yang ditentukan atau maksimum 60 hari.", ["NIFAS-OVER-60"], "ZHANNI");
    cursor = segment.end;
  }
  result.category = "ANALISIS NIFAS MAZHAB SYAFI'I";
  result.summary = "Nifas dihitung tanpa minimum nyata (satu menit pada resolusi aplikasi), maksimum 60 hari, dengan darah tertunda dan naqa' dinilai otomatis.";
  result.source = NIFAS_SOURCE;
  result.guidance = { bath: "Mandi saat nifas berakhir; pada darah lebih dari 60 hari ikuti batas tamyiz/adat yang ditampilkan.", prayer: "Larangan shalat saat nifas sama dengan haid; shalat pada suci/istihadhah.", fasting: "Puasa nifas tidak sah dan wajib diqadha.", intimacy: "Jima' dilarang selama nifas." };
  result.expertWarnings.push("Batas minimum nifas yang secara kitab dapat sesaat direpresentasikan sebagai satu menit karena resolusi aplikasi.");
  return true;
}

function alternatingPattern(history: HabitCycleInput[] = []) {
  const values = history.map((item) => item.menstrualHours).filter((value) => value > 0);
  for (let length = 2; length <= Math.floor(values.length / 2); length++) {
    const last = values.slice(-length);
    const previous = values.slice(-2 * length, -length);
    if (last.every((value, index) => value === previous[index])) return last;
  }
  return undefined;
}

function prayerWindowAt(timestamp: number, input: CaseInput) {
  const latitude = input.location?.latitude;
  const longitude = input.location?.longitude;
  if (latitude === undefined || longitude === undefined) return null;
  const local = new Date(timestamp + JAKARTA_OFFSET_MS);
  const year = local.getUTCFullYear();
  const month = local.getUTCMonth() + 1;
  const day = local.getUTCDate();
  const times = calculateKemenagPrayerTimes(year, month, day, latitude, longitude, input.location?.prayerAdjustments);
  const tomorrow = new Date(Date.UTC(year, month - 1, day + 1));
  const next = calculateKemenagPrayerTimes(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth() + 1, tomorrow.getUTCDate(), latitude, longitude, input.location?.prayerAdjustments);
  const windows: { prayer: PrayerName; start: number; end: number }[] = [
    { prayer: "fajr", start: times.fajr, end: times.sunrise },
    { prayer: "dhuhr", start: times.dhuhr, end: times.asr },
    { prayer: "asr", start: times.asr, end: times.maghrib },
    { prayer: "maghrib", start: times.maghrib, end: times.isha },
    { prayer: "isha", start: times.isha, end: next.fajr },
  ];
  return windows.find((window) => timestamp >= window.start && timestamp < window.end) ?? null;
}

function appendPrayerEvents(input: CaseInput, result: AnalysisResult) {
  if (input.location?.latitude === undefined || input.location?.longitude === undefined) {
    result.assumptions.push("Lokasi tidak tersedia; peristiwa qadha berbasis waktu shalat tidak dihitung, tanpa memengaruhi klasifikasi darah.");
    return;
  }
  try {
    for (const period of [...result.haidPeriods, ...result.nifasPeriods]) {
      const onsetWindow = prayerWindowAt(period.start, input);
      if (onsetWindow) {
        const event = prayerQadhaAtOnset(period.start, onsetWindow.prayer, onsetWindow.start);
        if (event.qadha.length || event.certainty === "UNCERTAIN") result.worshipEvents.push({ at: event.at, type: "QADHA", description: event.qadha.length ? `Qadha ${event.qadha.join(" dan ")} karena darah mulai setelah tersedia waktu yang cukup.` : `Batas qadha ${event.prayer} meragukan (tersedia 3–5 menit).`, certainty: event.certainty === "CERTAIN" ? "YAKIN" : "IHTIYATH" });
      }
      const endWindow = prayerWindowAt(period.end, input);
      if (endWindow) {
        const event = prayerQadhaAtCessation(period.end, endWindow.prayer, endWindow.end);
        if (event.qadha.length || event.certainty === "UNCERTAIN") result.worshipEvents.push({ at: event.at, type: "QADHA", description: event.qadha.length ? `Kerjakan ${event.qadha.join(" dan ")} karena darah berhenti dengan waktu bersuci dan takbir yang cukup.` : `Akhir waktu ${event.prayer} berada pada batas meragukan.`, certainty: event.certainty === "CERTAIN" ? "YAKIN" : "IHTIYATH" });
      }
    }
  } catch {
    result.expertWarnings.push("Koordinat tidak valid; waktu shalat lokal tidak dapat dihitung.");
  }
}

function finish(input: CaseInput, result: AnalysisResult) {
  result.rows.sort((a, b) => a.start - b.start || a.end - b.end);
  rebuildTimeline(result);
  result.fastingWarnings = collectFastingWarnings(result.rows);
  const deferredFirstTamyiz = input.userStatus === "MUBTADAH" && input.isFirstBleedingCycle !== false && result.category === "MUBTADA'AH MUMAYYIZAH";
  for (const period of [...result.haidPeriods, ...result.nifasPeriods]) {
    const mandiAt = deferredFirstTamyiz && period.label === "HAID TAMYIZ" ? addHours(period.start, 360) : period.end;
    result.worshipEvents.push({ at: mandiAt, type: "MANDI", description: deferredFirstTamyiz ? "Mandi wajib saat darah daur pertama tembus 15 hari dan masuk hari ke-16." : `Mandi wajib pada akhir ${period.label.toLowerCase()}.`, certainty: "YAKIN" });
    if (deferredFirstTamyiz && period.label === "HAID TAMYIZ") result.worshipEvents.push({ at: mandiAt, type: "QADHA", description: "Qadha shalat fardhu yang ditinggalkan selama darah lemah sebelum kepastian istihadhah.", certainty: "YAKIN" });
  }
  if (PRAYER_TIME_FEATURE_ENABLED) appendPrayerEvents(input, result);
  const lastHaid = result.haidPeriods.at(-1);
  let latestPurity: number | undefined;
  for (let index = 1; index < result.haidPeriods.length; index++) {
    const purity = diffHours(result.haidPeriods[index].start, result.haidPeriods[index - 1].end);
    if (purity >= 360) latestPurity = purity;
  }
  const pattern = alternatingPattern(input.habitHistory);
  const update: HabitUpdate = {
    menstrualHours: lastHaid ? diffHours(lastHaid.end, lastHaid.start) : undefined,
    purityHours: latestPurity,
    postpartumHours: result.nifasPeriods.at(-1) ? diffHours(result.nifasPeriods.at(-1)!.end, result.nifasPeriods.at(-1)!.start) : undefined,
    alternatingPattern: pattern,
    text: "",
  };
  const messages: string[] = [];
  if (update.menstrualHours) messages.push(`Adat haid terbaru ${update.menstrualHours.toFixed(2)} jam (terbentuk setelah satu kejadian sah).`);
  if (update.purityHours) messages.push(`Adat suci terakhir ${update.purityHours.toFixed(2)} jam.`);
  if (update.postpartumHours) messages.push(`Adat nifas terbaru ${update.postpartumHours.toFixed(2)} jam.`);
  if (pattern) messages.push(`Pola bergantian terkonfirmasi setelah dua putaran lengkap: ${pattern.join(" → ")} jam.`);
  if (!messages.length) messages.push("Tidak ada pembaruan adat sah dari ledger ini.");
  update.text = messages.join(" ");
  result.habitUpdateData = update;
  result.habitUpdate = update.text;
  if (!result.source.book) result.source = GENERAL_SOURCE;
  return result;
}

export function analyzeCase(input: CaseInput): { result?: AnalysisResult; issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (!input.userStatus) issues.push({ message: "Pilih status pengalaman haid terlebih dahulu." });
  const duration = habitHours(input);
  if (["MUTADAH", "DZAKIRAH_QADR"].includes(input.userStatus) && (duration < 24 || duration > 360)) issues.push({ message: "Adat haid harus berada antara 24 dan 360 jam." });
  if (input.userStatus === "DZAKIRAH_WAQT" && !input.rememberedHabitStart) issues.push({ message: "Isi timestamp mulai adat yang masih diingat." });
  if (input.userStatus === "DZAKIRAH_QADR" && (!input.possibleHabitWindowStart || !input.possibleHabitWindowEnd)) issues.push({ message: "Isi awal dan akhir rentang kemungkinan adat." });
  if (input.hasPostpartumBleeding && !input.deliveryAt) issues.push({ message: "Isi waktu persalinan selesai untuk menganalisis darah setelah persalinan." });
  if (input.hasPostpartumBleeding && input.deliveryAt && input.deliveryComplete === false) issues.push({ message: "Engine nifas memerlukan waktu persalinan selesai lengkap." });
  const normalized = normalizeInput(input);
  issues.push(...normalized.issues);
  const postpartumDelivery = input.hasPostpartumBleeding ? parseJakartaDateTime(input.deliveryAt ?? "") : null;
  if (input.hasPostpartumBleeding && input.deliveryAt && postpartumDelivery === null) issues.push({ message: "Waktu persalinan selesai tidak valid." });
  if (input.hasPostpartumBleeding && postpartumDelivery !== null && !normalized.segments.some((segment) => segment.end > postpartumDelivery)) {
    issues.push({ message: "Tambahkan minimal satu segmen darah setelah waktu persalinan selesai." });
  }
  if (!normalized.segments.length && !normalized.issues.length) issues.push({ message: "Masukkan minimal satu segmen darah yang lengkap." });
  if (issues.length || !input.userStatus) return { issues };
  const result = baseResult();
  const segments = applyAgeAndOrigin(input, normalized.segments, result);
  if (!segments.length) {
    result.category = "DARAH FASAD — BELUM USIA HAID";
    result.summary = "Seluruh darah berada sebelum ambang kurang dari 16 hari menuju ulang tahun qamariyah kesembilan.";
    result.guidance = { bath: "Tidak wajib mandi karena haid.", prayer: "Tetap shalat.", fasting: "Puasa tetap sah.", intimacy: "Tidak terkena larangan haid." };
    return { result: finish(input, result), issues: [] };
  }
  if (postpartumDelivery !== null && analyzeNifas(input, segments, result, postpartumDelivery)) return { result: finish(input, result), issues: [] };
  const episodes = episodesFrom(segments);
  if (analyzeMemoryCategory(input, segments, result)) return { result: finish(input, result), issues: [] };
  if (analyzeTamyiz(input, segments, episodes, result)) return { result: finish(input, result), issues: [] };
  if (analyzeSingleLong(input, segments, episodes, result)) return { result: finish(input, result), issues: [] };
  runGeneralEngine(segments, result);
  return { result: finish(input, result), issues: [] };
}

function collectFastingWarnings(rows: AnalysisRow[]) {
  const warnings = new Set<string>();
  for (const row of rows) {
    for (let timestamp = row.start, guard = 0; timestamp < row.end && guard < 800; timestamp += 24 * HOUR_MS, guard++) {
      const warning = forbiddenFastDay(timestamp);
      if (warning) warnings.add(warning);
    }
  }
  return [...warnings];
}

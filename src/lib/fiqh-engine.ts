export const TIMEZONE = "Asia/Jakarta" as const;
export const HOUR_MS = 3_600_000;
export const MIN_HAID_HOURS = 24;
export const FIFTEEN_DAYS_HOURS = 360;

export type UserStatus =
  | "MUTADAH"
  | "MUBTADAH"
  | "MUTAHAYYIRAH_MUTLAQAH"
  | "DZAKIRAH_QADR"
  | "DZAKIRAH_WAQT";

export type BloodColor = "HITAM" | "MERAH" | "COKELAT" | "KUNING" | "KERUH";
export type BloodConsistency = "KENTAL" | "CAIR";
export type FiqhStatus =
  | "HAID"
  | "HAID_SAHB"
  | "ISTIHADHAH"
  | "SUCI"
  | "FASAD"
  | "IHTIYATH";

export interface BloodSegmentInput {
  id: string;
  start: string;
  end: string;
  color: BloodColor;
  consistency: BloodConsistency;
}

export interface CaseInput {
  userStatus: UserStatus | "";
  menstrualHabitDays?: number;
  purityHabitDays?: number;
  habitualStartTime?: string;
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
}

export interface TimelineSegment {
  label: string;
  hours: number;
  status: FiqhStatus;
}

export interface SourceReference {
  book: string;
  arabic: string;
  translation: string;
}

export interface AnalysisResult {
  category: string;
  categoryTone: "haid" | "istihadhah" | "ihtiyath";
  summary: string;
  timeline: TimelineSegment[];
  rows: AnalysisRow[];
  haidPeriods: { label: string; start: number; end: number; totalBloodHours?: number }[];
  guidance: { bath: string; prayer: string; fasting: string; intimacy: string };
  source: SourceReference;
  fastingWarnings: string[];
  habitUpdate: string;
}

export interface ValidationIssue {
  segmentId?: string;
  message: string;
}

interface NormalizedSegment {
  start: number;
  end: number;
  durationHours: number;
  color: BloodColor;
  consistency: BloodConsistency;
  strength: number;
  sourceIds: string[];
}

interface Episode {
  start: number;
  end: number;
  durationHours: number;
  segments: NormalizedSegment[];
}

const COLOR_SCORE: Record<BloodColor, number> = {
  HITAM: 50,
  MERAH: 40,
  COKELAT: 30,
  KUNING: 20,
  KERUH: 10,
};

const CONSISTENCY_SCORE: Record<BloodConsistency, number> = { KENTAL: 5, CAIR: 0 };
const JAKARTA_OFFSET_MS = 7 * HOUR_MS;

export const emptyCase = (): CaseInput => ({
  userStatus: "",
  menstrualHabitDays: 7,
  purityHabitDays: 15,
  habitualStartTime: "06:00",
  segments: [],
});

export function createEmptySegment(): BloodSegmentInput {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `segment-${Date.now()}`,
    start: "",
    end: "",
    color: "MERAH",
    consistency: "CAIR",
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
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(timestamp);
}

const diffHours = (end: number, start: number) => (end - start) / HOUR_MS;
const addHours = (start: number, hours: number) => start + hours * HOUR_MS;

export function normalizeInput(input: CaseInput): {
  segments: NormalizedSegment[];
  episodes: Episode[];
  issues: ValidationIssue[];
} {
  const issues: ValidationIssue[] = [];
  const parsed: NormalizedSegment[] = [];

  input.segments.forEach((segment, index) => {
    if (!segment.start && !segment.end) return;
    if (!segment.start || !segment.end) {
      issues.push({
        segmentId: segment.id,
        message: `Segmen ${index + 1}: waktu mulai dan berhenti harus diisi lengkap.`,
      });
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
      start,
      end,
      durationHours: diffHours(end, start),
      color: segment.color,
      consistency: segment.consistency,
      strength: COLOR_SCORE[segment.color] + CONSISTENCY_SCORE[segment.consistency],
      sourceIds: [segment.id],
    });
  });

  parsed.sort((a, b) => a.start - b.start);
  for (let index = 1; index < parsed.length; index++) {
    if (parsed[index].start < parsed[index - 1].end) {
      issues.push({
        segmentId: parsed[index].sourceIds[0],
        message: "Ada rentang darah yang tumpang-tindih. Periksa kedua segmen terkait.",
      });
    }
  }
  if (issues.length) return { segments: [], episodes: [], issues };

  const normalized: NormalizedSegment[] = [];
  parsed.forEach((segment) => {
    const last = normalized.at(-1);
    if (
      last &&
      last.end === segment.start &&
      last.color === segment.color &&
      last.consistency === segment.consistency
    ) {
      last.end = segment.end;
      last.durationHours = diffHours(last.end, last.start);
      last.sourceIds.push(...segment.sourceIds);
    } else {
      normalized.push({ ...segment, sourceIds: [...segment.sourceIds] });
    }
  });

  const episodes: Episode[] = [];
  normalized.forEach((segment) => {
    const episode = episodes.at(-1);
    if (episode && episode.end === segment.start) {
      episode.end = segment.end;
      episode.durationHours = diffHours(episode.end, episode.start);
      episode.segments.push(segment);
    } else {
      episodes.push({
        start: segment.start,
        end: segment.end,
        durationHours: segment.durationHours,
        segments: [segment],
      });
    }
  });

  return { segments: normalized, episodes, issues };
}

function baseResult(): AnalysisResult {
  return {
    category: "",
    categoryTone: "haid",
    summary: "",
    timeline: [],
    rows: [],
    haidPeriods: [],
    guidance: { bath: "", prayer: "", fasting: "", intimacy: "" },
    source: { book: "", arabic: "", translation: "" },
    fastingWarnings: [],
    habitUpdate: "",
  };
}

function addRow(
  result: AnalysisResult,
  label: string,
  start: number,
  end: number,
  status: FiqhStatus,
  note: string,
  displayStatus = status === "HAID_SAHB" ? "HAID (SAHB)" : status,
) {
  const durationHours = diffHours(end, start);
  result.rows.push({ label, start, end, durationHours, status, displayStatus, note });
}

function addTimeline(result: AnalysisResult, label: string, hours: number, status: FiqhStatus) {
  if (hours > 0) result.timeline.push({ label, hours, status });
}

function tamyizPattern(segments: NormalizedSegment[], episodes: Episode[], maxScore: number) {
  if (!segments.length || episodes.length !== 1 || segments[0].strength !== maxScore) return null;
  const transition = segments.findIndex((segment) => segment.strength !== maxScore);
  if (transition === -1) return null;
  if (segments.slice(transition).some((segment) => segment.strength === maxScore)) return null;

  const strongStart = segments[0].start;
  const strongEnd = segments[transition - 1].end;
  const weakStart = segments[transition].start;
  const weakEnd = segments.at(-1)!.end;
  return {
    transition,
    strongStart,
    strongEnd,
    weakStart,
    weakEnd,
    strongHours: diffHours(strongEnd, strongStart),
    weakHours: diffHours(weakEnd, weakStart),
  };
}

function summarizeBlood(segments: NormalizedSegment[]) {
  return [...new Set(segments.map((segment) => `${segment.color} / ${segment.consistency}`))].join(", ");
}

function finish(result: AnalysisResult): AnalysisResult {
  result.fastingWarnings = collectFastingWarnings(result.rows);
  const lastHaid = result.haidPeriods.at(-1);
  result.habitUpdate = lastHaid
    ? `Adat haid yang ditunjukkan oleh haid sah terakhir (${lastHaid.label}) adalah ${(diffHours(lastHaid.end, lastHaid.start) / 24).toFixed(1)} hari. Adat suci baru dinilai setelah masa suci minimal 15 hari terpenuhi.`
    : "Tidak ada pembaruan adat karena analisis ini tidak menghasilkan haid sah.";
  return result;
}

export function analyzeCase(input: CaseInput): { result?: AnalysisResult; issues: ValidationIssue[] } {
  const profileIssues: ValidationIssue[] = [];
  if (!input.userStatus) profileIssues.push({ message: "Pilih status pengalaman haid terlebih dahulu." });
  if (
    ["MUTADAH", "DZAKIRAH_QADR"].includes(input.userStatus) &&
    (!input.menstrualHabitDays || input.menstrualHabitDays < 1 || input.menstrualHabitDays > 15)
  ) {
    profileIssues.push({ message: "Adat haid harus berada antara 1 dan 15 hari." });
  }
  if (
    ["MUTADAH", "DZAKIRAH_WAQT"].includes(input.userStatus) &&
    (!input.purityHabitDays || input.purityHabitDays < 15)
  ) {
    profileIssues.push({ message: "Adat suci harus minimal 15 hari." });
  }

  const normalized = normalizeInput(input);
  const issues = [...profileIssues, ...normalized.issues];
  if (!normalized.segments.length && !normalized.issues.length) {
    issues.push({ message: "Masukkan minimal satu segmen darah yang lengkap." });
  }
  if (issues.length || !input.userStatus) return { issues };

  const segments = normalized.segments;
  const episodes = normalized.episodes;
  const globalStart = segments[0].start;
  const globalEnd = segments.at(-1)!.end;
  const totalRangeHours = diffHours(globalEnd, globalStart);
  const menstrualHabitDays = input.menstrualHabitDays || 7;
  const result = baseResult();

  if (input.userStatus === "MUTAHAYYIRAH_MUTLAQAH") {
    result.category = "MUTAHAYYIRAH MUTHLAQAH (ADH-DHĀLLAH)";
    result.categoryTone = "ihtiyath";
    result.summary = `Darah tercatat sepanjang ${(totalRangeHours / 24).toFixed(1)} hari dan pengguna lupa jumlah hari serta waktu mulai kebiasaannya. Seluruh rentang mengikuti hukum ihtiyāṭ.`;
    addTimeline(result, "Ragu / Ihtiyath", totalRangeHours, "IHTIYATH");
    addRow(result, "Masa Ragu (Ihtiyath)", globalStart, globalEnd, "IHTIYATH", "Probabilitas Haid / Suci / Terputus");
    result.guidance = {
      bath: "Wajib mandi besar setiap kali hendak shalat fardhu menurut pendapat al-ashahh dalam Mazhab Syafi'i.",
      prayer: "Wajib shalat lima waktu setelah bersuci dan menyumbat keluarnya darah. Shalat sah secara hukum zhahir.",
      fasting: "Wajib puasa Ramadhan sebulan penuh. Wajib meng-qadha 16 hari puasa di bulan lain untuk memastikan tercapainya 15 hari puasa suci sah.",
      intimacy: "Haram berhubungan suami-istri selama darah masih terus mengalir.",
    };
    result.source = {
      book: "Al-Majmu' Syarah al-Muhadzdzab – Imam an-Nawawi",
      arabic: "وَالْمُتَحَيِّرَةُ وَهِيَ النَّاسِيَةُ لِعَادَتِهَا قَدْرًا وَوَقْتًا تَلْزَمُهَا الصَّلَاةُ وَالصَّوْمُ احْتِيَاطًا وَتَغْتَسِلُ لِكُلِّ فَرِيضَةٍ فِي الْأَصَحِّ",
      translation: "Wanita mutahayyirah yang lupa kadar dan waktu kebiasaannya wajib shalat dan puasa atas jalan kehati-hatian serta mandi untuk setiap shalat fardhu menurut pendapat paling sahih.",
    };
    return { result: finish(result), issues: [] };
  }

  if (input.userStatus === "DZAKIRAH_WAQT") {
    const dayOneEnd = addHours(globalStart, MIN_HAID_HOURS);
    const dayFifteenEnd = addHours(globalStart, FIFTEEN_DAYS_HOURS);
    const ihtiyathEnd = Math.min(globalEnd, dayFifteenEnd);
    result.category = "DZĀKIRAH LIL WAQT FAQATH";
    result.categoryTone = "ihtiyath";
    result.summary = "Pengguna mengingat waktu mulai haid tetapi lupa jumlah harinya. Dua puluh empat jam pertama adalah yakin haid, hari ke-2 sampai ke-15 adalah ihtiyāṭ, dan setelah hari ke-15 adalah yakin suci.";
    addTimeline(result, "Yakin Haid (24 jam)", MIN_HAID_HOURS, "HAID");
    addRow(result, "Hari Ke-1 (Yakin Haid)", globalStart, dayOneEnd, "HAID", "Kadar Minimal Haid Sah");
    result.haidPeriods.push({ label: "HAID 1 (24 Jam)", start: globalStart, end: dayOneEnd });
    if (ihtiyathEnd > dayOneEnd) {
      addTimeline(result, "Ihtiyath (Hari 2–15)", diffHours(ihtiyathEnd, dayOneEnd), "IHTIYATH");
      addRow(result, "Hari Ke-2 s.d. 15 (Masa Ragu)", dayOneEnd, ihtiyathEnd, "IHTIYATH", "Wajib Mandi Tiap Shalat");
    }
    if (globalEnd > dayFifteenEnd) {
      addTimeline(result, "Yakin Suci (>15 hari)", diffHours(globalEnd, dayFifteenEnd), "SUCI");
      addRow(result, "Setelah Hari Ke-15 (Yakin Suci)", dayFifteenEnd, globalEnd, "SUCI", "Melebihi Batas Maksimal Haid", "SUCI / ISTIHADHAH");
    }
    result.guidance = {
      bath: "Wajib mandi setelah 24 jam pertama, lalu mandi setiap hendak shalat fardhu pada hari ke-2 sampai hari ke-15.",
      prayer: "Haram shalat pada 24 jam pertama. Wajib shalat pada hari ke-2 dan seterusnya setelah mandi.",
      fasting: "Puasa sah setelah hari ke-15. Puasa hari ke-2 sampai ke-15 wajib di-qadha atas jalan ihtiyath.",
      intimacy: "Haram jima' pada hari ke-1 sampai hari ke-15.",
    };
    result.source = {
      book: "Al-Majmu' Syarah al-Muhadzdzab – Imam an-Nawawi",
      arabic: "وَإِنْ ذَكَرَتْ الْوَقْتَ دُونَ الْقَدْرِ فَبِدَايَتُهُ حَيْضٌ بِيَقِينٍ ثُمَّ تَتَرَبَّصُ إِلَى خَمْسَةَ عَشَرَ احْتِيَاطًا",
      translation: "Jika ia mengingat waktu mulainya tanpa mengingat kadarnya, permulaannya adalah haid secara yakin, kemudian ia bersikap ihtiyath hingga hari kelima belas.",
    };
    return { result: finish(result), issues: [] };
  }

  if (input.userStatus === "DZAKIRAH_QADR") {
    result.category = "DZĀKIRAH LIL QADR FAQATH";
    result.categoryTone = "ihtiyath";
    result.summary = `Pengguna mengingat durasi haidnya (${menstrualHabitDays} hari), tetapi lupa waktu mulainya. Seluruh rentang mengikuti hukum ihtiyāṭ karena setiap waktu berpotensi haid atau suci.`;
    addTimeline(result, "Ihtiyath (Ragu)", totalRangeHours, "IHTIYATH");
    addRow(result, "Masa Ihtiyath (Kadar Ingat)", globalStart, globalEnd, "IHTIYATH", `Ingat kadar ${menstrualHabitDays} hari, lupa waktu mulai`);
    result.guidance = {
      bath: "Wajib mandi setiap kali hendak shalat fardhu karena ada potensi terputusnya haid pada setiap waktu.",
      prayer: "Wajib shalat lima waktu setelah bersuci dan menyumbat darah.",
      fasting: `Wajib puasa Ramadhan sebulan penuh. Wajib meng-qadha puasa sebanyak durasi kebiasaan yang diingat (${menstrualHabitDays} hari) ditambah 1 atau 2 hari sesuai kaidah pembebasan tanggungan.`,
      intimacy: "Haram berhubungan suami-istri selama darah masih mengalir.",
    };
    result.source = {
      book: "Mughni al-Muhtaj – Syaikh al-Khatib asy-Syirbini",
      arabic: "وَالذَّاكِرَةُ لِلْقَدْرِ دُونَ الْوَقْتِ كَالنَّاسِيَةِ لَهُمَا فِي الْأَحْكَامِ لِأَنَّ كُلَّ زَمَنٍ يَحْتَمِلُ الْحَيْضَ وَالطُّهْرَ",
      translation: "Wanita yang mengingat kadar tanpa mengingat waktunya dihukumi seperti yang lupa keduanya karena setiap masa berpotensi haid dan suci.",
    };
    return { result: finish(result), issues: [] };
  }

  const maxScore = Math.max(...segments.map((segment) => segment.strength));
  const minScore = Math.min(...segments.map((segment) => segment.strength));
  const pattern = maxScore > minScore ? tamyizPattern(segments, episodes, maxScore) : null;
  const validTamyiz =
    pattern &&
    pattern.strongHours >= MIN_HAID_HOURS &&
    pattern.strongHours <= FIFTEEN_DAYS_HOURS &&
    pattern.weakHours >= FIFTEEN_DAYS_HOURS;

  if (validTamyiz) {
    const strongSegments = segments.slice(0, pattern.transition);
    const weakSegments = segments.slice(pattern.transition);
    result.category = input.userStatus === "MUBTADAH" ? "MUBTADA'AH MUMAYYIZAH" : "MU'TADAH MUMAYYIZAH";
    result.summary = `Tamyiz sah: darah kuat berlangsung ${(pattern.strongHours / 24).toFixed(1)} hari dalam satu blok di awal dan darah lemah berlangsung ${(pattern.weakHours / 24).toFixed(1)} hari setelahnya. Tamyiz didahulukan atas adat.`;
    addTimeline(result, "Haid (Darah Kuat)", pattern.strongHours, "HAID");
    addTimeline(result, "Istihadhah (Darah Lemah)", pattern.weakHours, "ISTIHADHAH");
    addRow(result, "Darah Kuat (Haid)", pattern.strongStart, pattern.strongEnd, "HAID", summarizeBlood(strongSegments));
    addRow(result, "Darah Lemah (Istihadhah)", pattern.weakStart, pattern.weakEnd, "ISTIHADHAH", summarizeBlood(weakSegments));
    result.haidPeriods.push({ label: "HAID (Tamyiz)", start: pattern.strongStart, end: pattern.strongEnd });
    result.guidance = {
      bath: "Wajib mandi besar saat darah kuat selesai dan beralih menjadi darah lemah.",
      prayer: "Selama darah kuat haram shalat. Ketika masuk darah lemah, wajib shalat fardhu setelah mandi.",
      fasting: "Puasa pada masa darah kuat wajib di-qadha; puasa pada masa darah lemah dihukumi sah.",
      intimacy: "Halal bersetubuh pada masa darah lemah setelah mandi dari darah kuat.",
    };
    result.source = {
      book: "Al-Minhaj – Imam an-Nawawi",
      arabic: "وَالْمُمَيِّزَةُ تَعْمَلُ بِالتَّمْيِيزِ فَيَكُونُ الْقَوِيُّ حَيْضًا وَالضَّعِيفُ طُهْرًا إِذَا لَمْ يَنْقُصِ الْقَوِيُّ عَنْ يَوْمٍ وَلَيْلَةٍ وَلَا عَبَرَ خَمْسَةَ عَشَرَ وَلَا نَقَصَ الضَّعِيفُ عَنْهَا",
      translation: "Wanita mumayyizah beramal dengan tamyiznya: darah kuat adalah haid dan darah lemah adalah suci apabila batas durasi darah kuat dan lemah terpenuhi.",
    };
    return { result: finish(result), issues: [] };
  }

  const singleEpisode = episodes.length === 1 ? episodes[0] : null;
  if (input.userStatus === "MUBTADAH" && singleEpisode && singleEpisode.durationHours > FIFTEEN_DAYS_HOURS) {
    const haidEnd = addHours(globalStart, MIN_HAID_HOURS);
    result.category = "MUBTADA'AH GHOIRU MUMAYYIZAH";
    result.categoryTone = "istihadhah";
    result.summary = "Darah satu episode melampaui 15 hari tanpa tamyiz sah. Dua puluh empat jam pertama diklasifikasikan sebagai haid dan sisanya sebagai istihadhah.";
    addTimeline(result, "Haid (24 jam)", MIN_HAID_HOURS, "HAID");
    addTimeline(result, "Istihadhah", totalRangeHours - MIN_HAID_HOURS, "ISTIHADHAH");
    addRow(result, "Haid Minimal (24 Jam)", globalStart, haidEnd, "HAID", "Kadar Minimal Haid");
    addRow(result, "Istihadhah (Suci Hukmi)", haidEnd, globalEnd, "ISTIHADHAH", "Penyempurna Siklus");
    result.haidPeriods.push({ label: "HAID (24 Jam)", start: globalStart, end: haidEnd });
    result.guidance = {
      bath: "Pada daur pertama mandi saat mencapai 15 hari dan qadha shalat hari ke-2 sampai ke-15. Pada daur berikutnya langsung bersuci setelah 24 jam pertama.",
      prayer: "Wajib meng-qadha shalat mulai jam ke-25 hingga hari ke-15 pada daur pertama.",
      fasting: "Puasa sah pada masa istihadhah setelah bersuci.",
      intimacy: "Halal jima' setelah mandi wajib di luar 24 jam pertama.",
    };
    result.source = {
      book: "Nihayat al-Muhtaj – Imam ar-Ramli",
      arabic: "وَالْمُبْتَدَأَةُ غَيْرُ الْمُمَيِّزَةِ حَيْضُهَا يَوْمٌ وَلَيْلَةٌ وَطُهْرُهَا تِسْعَةٌ وَعِشْرُونَ يَوْمًا",
      translation: "Haid wanita mubtada'ah yang tidak memiliki tamyiz adalah sehari semalam dan masa sucinya dua puluh sembilan hari.",
    };
    return { result: finish(result), issues: [] };
  }

  if (input.userStatus === "MUTADAH" && singleEpisode && singleEpisode.durationHours > FIFTEEN_DAYS_HOURS) {
    const habitHours = menstrualHabitDays * 24;
    const haidEnd = addHours(globalStart, habitHours);
    result.category = "MU'TADAH GHOIRU MUMAYYIZAH";
    result.categoryTone = "istihadhah";
    result.summary = `Darah satu episode berlangsung ${(totalRangeHours / 24).toFixed(1)} hari tanpa tamyiz sah. ${menstrualHabitDays} hari pertama mengikuti adat sebagai haid dan sisanya sebagai istihadhah.`;
    addTimeline(result, `Haid (${menstrualHabitDays} hari)`, habitHours, "HAID");
    addTimeline(result, "Istihadhah", totalRangeHours - habitHours, "ISTIHADHAH");
    addRow(result, `Haid Sesuai 'Ādah (${menstrualHabitDays} Hari)`, globalStart, haidEnd, "HAID", "Kembali ke Durasi Adat");
    addRow(result, "Istihadhah", haidEnd, globalEnd, "ISTIHADHAH", "Kelebihan dari Adat");
    result.haidPeriods.push({ label: `HAID (${menstrualHabitDays} Hari)`, start: globalStart, end: haidEnd });
    result.guidance = {
      bath: `Wajib mandi besar setelah tuntasnya hari ke-${menstrualHabitDays}.`,
      prayer: `Haram shalat selama ${menstrualHabitDays} hari pertama. Setelahnya wajib berwudhu setiap masuk waktu shalat dan tetap shalat.`,
      fasting: `Puasa wajib di-qadha untuk ${menstrualHabitDays} hari pertama. Puasa setelahnya dihukumi sah.`,
      intimacy: "Halal hubungan suami-istri pada masa istihadhah setelah mandi besar dari haid.",
    };
    result.source = {
      book: "Tuhfat al-Muhtaj – Imam Ibnu Hajar al-Haitami",
      arabic: "وَالْمُعْتَادَةُ غَيْرُ الْمُمَيِّزَةِ تُرَدُّ إِلَى عَادَتِهَا قَدْرًا وَوَقْتًا فَيَكُونُ حَيْضُهَا قَدْرَ عَادَتِهَا وَمَا زَادَ اسْتِحَاضَةٌ",
      translation: "Wanita mu'tadah ghayr mumayyizah dikembalikan kepada kebiasaannya; haidnya mengikuti kadar kebiasaan dan kelebihannya adalah istihadhah.",
    };
    return { result: finish(result), issues: [] };
  }

  return { result: finish(runMultiSegmentEngine(result, segments, globalStart)), issues: [] };
}

function bloodInWindow(segments: NormalizedSegment[], fromIndex: number, start: number) {
  let total = 0;
  for (let index = fromIndex; index < segments.length; index++) {
    const fromStart = diffHours(segments[index].end, start);
    if (fromStart <= FIFTEEN_DAYS_HOURS) total += segments[index].durationHours;
    else {
      const remaining = FIFTEEN_DAYS_HOURS - diffHours(segments[index].start, start);
      if (remaining > 0) total += remaining;
      break;
    }
  }
  return total;
}

function runMultiSegmentEngine(result: AnalysisResult, segments: NormalizedSegment[], globalStart: number) {
  let activeHaid: AnalysisResult["haidPeriods"][number] | null = null;
  let lastEnd = globalStart;

  for (let index = 0; index < segments.length; index++) {
    const current = segments[index];

    if (current.start > lastEnd && activeHaid === null && index > 0) {
      addTimeline(result, "Suci Sela", diffHours(current.start, lastEnd), "SUCI");
      addRow(result, "Suci Sela", lastEnd, current.start, "SUCI", "Masa Bersih Murni");
    }

    if (activeHaid === null) {
      if (bloodInWindow(segments, index, current.start) >= MIN_HAID_HOURS) {
        activeHaid = {
          start: current.start,
          end: current.end,
          totalBloodHours: current.durationHours,
          label: `HAID ${result.haidPeriods.length + 1}`,
        };
        addTimeline(result, activeHaid.label, current.durationHours, "HAID");
        addRow(result, activeHaid.label, current.start, current.end, "HAID", "Awal Haid Sah");
        result.haidPeriods.push(activeHaid);
      } else {
        addTimeline(result, "Fasad (<24 jam)", current.durationHours, "FASAD");
        addRow(result, "Darah Fasad", current.start, current.end, "FASAD", "Akumulasi < 24 Jam");
      }
      lastEnd = current.end;
      continue;
    }

    const previousEnd = segments[index - 1].end;
    const cleanGapHours = diffHours(current.start, previousEnd);
    if (cleanGapHours >= FIFTEEN_DAYS_HOURS) {
      addTimeline(result, "Suci Sempurna", cleanGapHours, "SUCI");
      addRow(result, "Suci Sempurna (≥15 Hari)", previousEnd, current.start, "SUCI", "Pemisah Antar Siklus");
      if (bloodInWindow(segments, index, current.start) >= MIN_HAID_HOURS) {
        activeHaid = {
          start: current.start,
          end: current.end,
          totalBloodHours: current.durationHours,
          label: `HAID ${result.haidPeriods.length + 1}`,
        };
        addTimeline(result, activeHaid.label, current.durationHours, "HAID");
        addRow(result, activeHaid.label, current.start, current.end, "HAID", "Haid Baru (Lembaran Baru)");
        result.haidPeriods.push(activeHaid);
      } else {
        addTimeline(result, "Fasad (<24 jam)", current.durationHours, "FASAD");
        addRow(result, "Darah Fasad", current.start, current.end, "FASAD", "Akumulasi < 24 Jam");
        activeHaid = null;
      }
      lastEnd = current.end;
      continue;
    }

    if (diffHours(current.end, activeHaid.start) <= FIFTEEN_DAYS_HOURS) {
      if (cleanGapHours > 0) {
        addTimeline(result, `Sahb (${activeHaid.label})`, cleanGapHours, "HAID_SAHB");
        addRow(result, `Masa Bersih (Sahb ${activeHaid.label})`, previousEnd, current.start, "HAID_SAHB", "Ditarik Menjadi Haid");
      }
      addTimeline(result, `Lanjutan ${activeHaid.label}`, current.durationHours, "HAID");
      addRow(result, `Lanjutan ${activeHaid.label}`, current.start, current.end, "HAID", "Lanjutan Darah Nyata");
      activeHaid.end = current.end;
      activeHaid.totalBloodHours = (activeHaid.totalBloodHours ?? 0) + current.durationHours;
      lastEnd = current.end;
      continue;
    }

    const takmilEnd = addHours(activeHaid.end, FIFTEEN_DAYS_HOURS);
    if (cleanGapHours > 0) {
      addTimeline(result, "Suci Sela", cleanGapHours, "SUCI");
      addRow(result, "Suci Sela (Masa Takmil)", previousEnd, current.start, "SUCI", "Bagian 15 Hari Suci");
    }

    if (current.end <= takmilEnd) {
      addTimeline(result, "Istihadhah Takmil", current.durationHours, "ISTIHADHAH");
      addRow(result, "Istihadhah (Penyempurna Suci)", current.start, current.end, "ISTIHADHAH", "Takmilah Aqall ath-Thuhr");
    } else if (current.start < takmilEnd) {
      const takmilHours = diffHours(takmilEnd, current.start);
      const remainingHours = diffHours(current.end, takmilEnd);
      addTimeline(result, "Istihadhah Takmil", takmilHours, "ISTIHADHAH");
      addRow(result, "Istihadhah (Penyempurna Suci)", current.start, takmilEnd, "ISTIHADHAH", "Penggenap 15 Hari Suci");

      let remainingWithNext = remainingHours;
      for (let next = index + 1; next < segments.length; next++) {
        const fromTakmil = diffHours(segments[next].end, takmilEnd);
        if (fromTakmil <= FIFTEEN_DAYS_HOURS) remainingWithNext += segments[next].durationHours;
        else {
          const withinWindow = FIFTEEN_DAYS_HOURS - diffHours(segments[next].start, takmilEnd);
          if (withinWindow > 0) remainingWithNext += withinWindow;
          break;
        }
      }

      if (remainingWithNext >= MIN_HAID_HOURS) {
        activeHaid = {
          start: takmilEnd,
          end: current.end,
          totalBloodHours: remainingHours,
          label: `HAID ${result.haidPeriods.length + 1}`,
        };
        addTimeline(result, activeHaid.label, remainingHours, "HAID");
        addRow(result, activeHaid.label, takmilEnd, current.end, "HAID", "Awal Haid Sah Baru");
        result.haidPeriods.push(activeHaid);
      } else {
        addTimeline(result, "Fasad (<24 jam)", remainingHours, "FASAD");
        addRow(result, "Sisa Fasad (<24 Jam)", takmilEnd, current.end, "FASAD", "Akumulasi < 24 Jam");
        activeHaid = null;
      }
    } else if (bloodInWindow(segments, index, current.start) >= MIN_HAID_HOURS) {
      activeHaid = {
        start: current.start,
        end: current.end,
        totalBloodHours: current.durationHours,
        label: `HAID ${result.haidPeriods.length + 1}`,
      };
      addTimeline(result, activeHaid.label, current.durationHours, "HAID");
      addRow(result, activeHaid.label, current.start, current.end, "HAID", "Haid Sah Baru");
      result.haidPeriods.push(activeHaid);
    } else {
      addTimeline(result, "Fasad (<24 jam)", current.durationHours, "FASAD");
      addRow(result, "Darah Fasad", current.start, current.end, "FASAD", "Akumulasi < 24 Jam");
      activeHaid = null;
    }
    lastEnd = current.end;
  }

  result.category = "HASIL ANALISIS FIKIH";
  result.summary = `Ditemukan ${result.haidPeriods.length} kali haid sah. Analisis mengevaluasi Qaul as-Sahb, Takmilah Aqall ath-Thuhr, dan pemisahan masa suci berdasarkan kronologi yang dimasukkan.`;
  result.guidance = {
    bath: `Wajib mandi besar setiap kali masa haid sah berakhir. Terdapat ${result.haidPeriods.length} titik akhir haid pada kronologi ini.`,
    prayer: "Haram shalat pada masa haid sah. Wajib shalat pada masa suci dan istihadhah setelah membersihkan darah dan berwudhu.",
    fasting: "Haram berpuasa pada masa haid sah dan wajib meng-qadha puasa wajib. Puasa sah pada masa suci dan istihadhah, kecuali pada hari yang memang haram untuk berpuasa.",
    intimacy: "Halal bersetubuh pada masa suci dan istihadhah setelah mandi dari haid.",
  };
  result.source = {
    book: "Fath al-Wahhab – Syaikhul Islam Zakariya al-Ansari",
    arabic: "وَإِنْ نَقَصَ الطُّهْرُ عَنْ خَمْسَةَ عَشَرَ وَتَجَاوَزَ مَجْمُوعُ الدَّمَيْنِ وَالنَّقَاءِ خَمْسَةَ عَشَرَ فَالْدَّمُ الثَّانِي فِي تَمَامِ خَمْسَةَ عَشَرَ طُهْرًا اسْتِحَاضَةٌ تَكْمِلَةً لِأَقَلِّ الطُّهْرِ وَمَا بَعْدَهُ حَيْضٌ إِنْ بَلَغَ يَوْمًا وَلَيْلَةً",
    translation: "Jika masa suci kurang dari 15 hari dan rangkaian darah serta masa bersih melampaui 15 hari, darah pada penyempurna masa suci adalah istihadhah dan darah setelahnya menjadi haid jika mencapai sehari semalam.",
  };
  return result;
}

function collectFastingWarnings(rows: AnalysisRow[]) {
  const warnings = new Set<string>();
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat("id-u-ca-islamic-umalqura", {
      timeZone: TIMEZONE,
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  } catch {
    return ["Pemeriksaan hari haram puasa tidak tersedia pada perangkat ini."];
  }

  rows.forEach((row) => {
    for (let timestamp = row.start, guard = 0; timestamp <= row.end && guard < 400; timestamp += 24 * HOUR_MS, guard++) {
      const parts = formatter.formatToParts(timestamp);
      const day = Number(parts.find((part) => part.type === "day")?.value);
      const month = Number(parts.find((part) => part.type === "month")?.value);
      if (month === 10 && day === 1) warnings.add("Hari Raya Idulfitri (1 Syawal)");
      if (month === 12 && day === 10) warnings.add("Hari Raya Iduladha (10 Zulhijah)");
      if (month === 12 && day >= 11 && day <= 13) warnings.add(`Hari Tasyrik (${day} Zulhijah)`);
    }
  });
  return [...warnings];
}

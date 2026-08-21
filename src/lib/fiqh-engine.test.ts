import { describe, expect, it } from "vitest";

import {
  HOUR_MS,
  analyzeCase,
  formatJakartaInput,
  parseJakartaDateTime,
  type BloodColor,
  type BloodConsistency,
  type BloodOdor,
  type CaseInput,
  type UserStatus,
} from "@/lib/fiqh-engine";

const segment = (
  id: string,
  start: string,
  end: string,
  color: BloodColor = "MERAH",
  consistency: BloodConsistency = "CAIR",
  odor: BloodOdor = "TIDAK_BERAROMA",
  origin: "ALAMI" | "LUKA_PENYAKIT" = "ALAMI",
) => ({ id, start, end, color, consistency, odor, origin });

const at = (base: string, hours: number, minutes = 0) => formatJakartaInput(parseJakartaDateTime(base)! + hours * HOUR_MS + minutes * 60_000);
const run = (userStatus: UserStatus, segments: CaseInput["segments"], patch: Partial<CaseInput> = {}) => {
  const analysis = analyzeCase({
    userStatus,
    menstrualHabitDays: 7,
    menstrualHabitHours: 168,
    purityHabitDays: 15,
    purityHabitHours: 360,
    isFirstBleedingCycle: true,
    hasPostpartumBleeding: false,
    segments,
    ...patch,
  });
  expect(analysis.issues).toEqual([]);
  expect(analysis.result).toBeDefined();
  return analysis.result!;
};

function expectContinuousLedger(result: ReturnType<typeof run>, start: string, end: string) {
  expect(result.rows[0].start).toBe(parseJakartaDateTime(start));
  expect(result.rows.at(-1)!.end).toBe(parseJakartaDateTime(end));
  for (let index = 1; index < result.rows.length; index++) expect(result.rows[index].start).toBe(result.rows[index - 1].end);
}

describe("batas waktu presisi", () => {
  const base = "2026-01-01T00:00";
  it("membedakan 23:59 dari 24:00 jam", () => {
    expect(run("MUBTADAH", [segment("a", base, at(base, 23, 59))]).rows[0].status).toBe("FASAD");
    expect(run("MUBTADAH", [segment("a", base, at(base, 24))]).rows[0].status).toBe("HAID");
  });

  it("membedakan 360:00 dari 360:01 jam", () => {
    const exact = run("MUBTADAH", [segment("a", base, at(base, 360))]);
    const over = run("MUBTADAH", [segment("a", base, at(base, 360, 1))]);
    expect(exact.rows.map((row) => [row.status, row.durationHours])).toEqual([["HAID", 360]]);
    expect(over.rows.map((row) => row.status)).toEqual(["HAID", "ISTIHADHAH"]);
  });

  it("membedakan suci 359:59 dari 360:00 jam", () => {
    const firstEnd = at(base, 24);
    const shortStart = at(firstEnd, 359, 59);
    const exactStart = at(firstEnd, 360);
    const short = run("MUTADAH", [segment("a", base, firstEnd), segment("b", shortStart, at(shortStart, 24))]);
    const exact = run("MUTADAH", [segment("a", base, firstEnd), segment("b", exactStart, at(exactStart, 24))]);
    expect(short.rows.filter((row) => row.start >= parseJakartaDateTime(shortStart)!).map((row) => row.status)).toEqual(["ISTIHADHAH", "FASAD"]);
    expect(exact.haidPeriods).toHaveLength(2);
  });
});

describe("tamyiz lengkap", () => {
  const base = "2026-02-01T06:00";
  const valid = (strong: ReturnType<typeof segment>, weak: ReturnType<typeof segment>) => run("MUBTADAH", [strong, weak]);

  it("mendahulukan jumlah sifat kuat atas warna", () => {
    const result = valid(segment("a", base, at(base, 48), "MERAH", "CAIR", "BERAROMA"), segment("b", at(base, 48), at(base, 408), "HITAM"));
    expect(result.category).toContain("MUMAYYIZAH");
  });

  it("memakai hierarki warna ketika jumlah sifat sama", () => {
    const result = valid(segment("a", base, at(base, 48), "HITAM"), segment("b", at(base, 48), at(base, 408), "MERAH"));
    expect(result.rows.map((row) => row.status)).toEqual(["HAID", "ISTIHADHAH"]);
  });

  it("memakai darah terdahulu saat warna dan jumlah sifat setara", () => {
    const result = valid(segment("a", base, at(base, 48), "MERAH", "KENTAL"), segment("b", at(base, 48), at(base, 408), "MERAH", "CAIR", "BERAROMA"));
    expect(result.rows[0].durationHours).toBe(48);
  });

  it("menerima tiga tingkatan yang terus melemah", () => {
    const result = run("MUBTADAH", [
      segment("a", base, at(base, 48), "HITAM", "KENTAL", "BERAROMA"),
      segment("b", at(base, 48), at(base, 240), "MERAH", "KENTAL"),
      segment("c", at(base, 240), at(base, 480), "KUNING"),
    ]);
    expect(result.category).toContain("MUMAYYIZAH");
  });

  it("menolak darah lemah terputus dan pola kuat–lemah–kuat", () => {
    const interrupted = run("MUBTADAH", [segment("a", base, at(base, 48), "HITAM"), segment("b", at(base, 49), at(base, 409), "MERAH")]);
    const returned = run("MUBTADAH", [segment("a", base, at(base, 48), "HITAM"), segment("b", at(base, 48), at(base, 408), "MERAH"), segment("c", at(base, 408), at(base, 432), "HITAM")]);
    expect(interrupted.category).not.toContain("MUMAYYIZAH");
    expect(returned.category).toContain("GHOIRU");
  });

  it("invarian terhadap pembagian baris identik", () => {
    const one = run("MUBTADAH", [segment("a", base, at(base, 528))]);
    const split = run("MUBTADAH", [segment("a", base, at(base, 264)), segment("b", at(base, 264), at(base, 528))]);
    expect(split.rows.map((row) => [row.status, row.durationHours])).toEqual(one.rows.map((row) => [row.status, row.durationHours]));
  });
});

describe("tujuh golongan mustahadhah", () => {
  const base = "2026-03-01T00:00";
  const long = [segment("a", base, at(base, 528))];
  it("membedakan Mubtada'ah mumayyizah dan ghairu mumayyizah", () => {
    expect(run("MUBTADAH", [segment("a", base, at(base, 48), "HITAM"), segment("b", at(base, 48), at(base, 408), "MERAH")]).category).toContain("MUMAYYIZAH");
    expect(run("MUBTADAH", long).category).toContain("GHOIRU");
  });
  it("membedakan panduan daur pertama dan berikutnya", () => {
    expect(run("MUBTADAH", long).guidance.bath).toContain("hari ke-16");
    expect(run("MUBTADAH", long, { isFirstBleedingCycle: false }).guidance.bath).toContain("24 jam");
  });
  it("mendahulukan tamyiz Mu'tadah dan kembali ke adat bila tanpa tamyiz", () => {
    expect(run("MUTADAH", [segment("a", base, at(base, 48), "HITAM"), segment("b", at(base, 48), at(base, 408), "MERAH")]).category).toContain("MUMAYYIZAH");
    expect(run("MUTADAH", long).rows[0].durationHours).toBe(168);
  });
  it("menggunakan timestamp penuh untuk Mu'tadah yang ingat kadar dan waktu", () => {
    const remembered = at(base, 24);
    const result = run("MUTADAH", long, { rememberedHabitStart: remembered });
    expect(result.rows.map((row) => [row.status, row.durationHours])).toEqual([["ISTIHADHAH", 24], ["HAID", 168], ["ISTIHADHAH", 336]]);
  });
  it("menghitung rentang Dzākirah lil-Qadr", () => {
    const result = run("DZAKIRAH_QADR", [segment("a", base, at(base, 288))], { menstrualHabitHours: 144, possibleHabitWindowStart: base, possibleHabitWindowEnd: at(base, 240) });
    expect(result.rows.find((row) => row.status === "HAID")?.durationHours).toBe(48);
  });
  it("memulai Dzākirah lil-Waqt dari timestamp yang diingat", () => {
    const remembered = at(base, 48);
    const result = run("DZAKIRAH_WAQT", [segment("a", base, at(base, 480))], { rememberedHabitStart: remembered });
    expect(result.rows.find((row) => row.status === "HAID")?.start).toBe(parseJakartaDateTime(remembered));
  });
  it("memuat panduan Mutahayyirah dan skema qadha", () => {
    const result = run("MUTAHAYYIRAH_MUTLAQAH", long);
    expect(result.rows[0].status).toBe("IHTIYATH");
    expect(result.guidance.fasting).toContain("Qadha 30 hari");
    expect(result.guidance.fasting).toContain("pola 6 hari");
  });
});

describe("Sahb, Takmil, dan adat", () => {
  it("mengunci KD1–KD5 dengan matriks umum menang", () => {
    const result = run("MUTADAH", [
      segment("1", "2026-06-14T03:00", "2026-06-21T15:00"),
      segment("2", "2026-07-03T13:00", "2026-07-08T04:00"),
      segment("3", "2026-07-17T10:00", "2026-07-28T11:00"),
      segment("4", "2026-08-01T13:00", "2026-08-05T07:00"),
      segment("5", "2026-08-08T13:00", "2026-08-09T19:00"),
    ]);
    expect(result.rows.map((row) => [row.status, row.durationHours])).toEqual([
      ["HAID", 180], ["SUCI", 286], ["ISTIHADHAH", 74], ["HAID", 37],
      ["SUCI", 222], ["ISTIHADHAH", 138], ["HAID", 127], ["SUCI", 98],
      ["ISTIHADHAH", 90], ["SUCI", 78], ["ISTIHADHAH", 30],
    ]);
    expect(result.habitUpdateData.menstrualHours).toBe(127);
    expect(result.habitUpdateData.purityHours).toBe(360);
    expectContinuousLedger(result, "2026-06-14T03:00", "2026-08-09T19:00");
  });

  it("menarik naqa' pendek dengan Sahb", () => {
    const base = "2026-04-01T00:00";
    const result = run("MUTADAH", [segment("a", base, at(base, 12)), segment("b", at(base, 24), at(base, 36))]);
    expect(result.rows.map((row) => row.status)).toEqual(["HAID", "HAID_SAHB", "HAID"]);
  });

  it("menandai sisa pasca-takmil kurang 24 jam sebagai fasad", () => {
    const base = "2026-04-01T00:00";
    const firstEnd = at(base, 48);
    const returned = at(firstEnd, 350);
    const result = run("MUTADAH", [segment("a", base, firstEnd), segment("b", returned, at(returned, 20))]);
    expect(result.rows.slice(-2).map((row) => row.status)).toEqual(["ISTIHADHAH", "FASAD"]);
  });

  it.each([
    { name: "darah penutup berhenti sebelum suci lengkap", returnedAfter: 340, duration: 12, expected: ["ISTIHADHAH"] },
    { name: "darah penutup menyisakan tepat 24 jam", returnedAfter: 350, duration: 34, expected: ["ISTIHADHAH", "HAID"] },
    { name: "suci sempurna membuat darah mandiri", returnedAfter: 360, duration: 24, expected: ["HAID"] },
  ])("matriks Takmil: $name", ({ returnedAfter, duration, expected }) => {
    const base = "2026-04-01T00:00";
    const firstEnd = at(base, 48);
    const returned = at(firstEnd, returnedAfter);
    const result = run("MUTADAH", [segment("a", base, firstEnd), segment("b", returned, at(returned, duration))]);
    expect(result.rows.filter((row) => row.start >= parseJakartaDateTime(returned)!).map((row) => row.status)).toEqual(expected);
  });

  it("mengakui pola bergantian setelah dua putaran", () => {
    const result = run("MUTADAH", [segment("a", "2026-01-01T00:00", "2026-01-06T00:00")], { habitHistory: [
      { menstrualHours: 120, purityHours: 360 }, { menstrualHours: 168, purityHours: 360 },
      { menstrualHours: 120, purityHours: 360 }, { menstrualHours: 168, purityHours: 360 },
    ] });
    expect(result.habitUpdateData.alternatingPattern).toEqual([120, 168]);
  });
});

describe("nifas", () => {
  const delivery = "2026-05-01T00:00";
  it("mengabaikan data persalinan lama ketika toggle postpartum mati", () => {
    const result = run("MUTADAH", [segment("a", delivery, at(delivery, 24))], {
      hasPostpartumBleeding: false,
      deliveryAt: delivery,
      postpartumHabitHours: 960,
      isPregnant: true,
    });
    expect(result.rows.map((row) => row.status)).toEqual(["HAID"]);
    expect(result.assumptions.some((item) => item.includes("hamil"))).toBe(false);
  });

  it("memvalidasi timestamp dan segmen darah postpartum", () => {
    const missingDelivery = analyzeCase({
      userStatus: "MUTADAH",
      hasPostpartumBleeding: true,
      segments: [segment("a", delivery, at(delivery, 24))],
    });
    const noPostpartumSegment = analyzeCase({
      userStatus: "MUTADAH",
      hasPostpartumBleeding: true,
      deliveryAt: delivery,
      deliveryComplete: true,
      segments: [segment("a", at(delivery, -24), delivery)],
    });
    expect(missingDelivery.issues.some((issue) => issue.message.includes("waktu persalinan"))).toBe(true);
    expect(noPostpartumSegment.issues.some((issue) => issue.message.includes("setelah waktu persalinan"))).toBe(true);
  });

  it("menerima satu menit sebagai representasi minimum nyata", () => {
    const result = run("MUTADAH", [segment("a", delivery, at(delivery, 0, 1))], { hasPostpartumBleeding: true, deliveryAt: delivery });
    expect(result.rows[0].status).toBe("NIFAS");
    expect(result.rows[0].durationHours).toBeCloseTo(1 / 60);
  });
  it("menerima tepat 60 hari dan memproses 60 hari + 1 menit", () => {
    const exact = run("MUTADAH", [segment("a", delivery, at(delivery, 1440))], { hasPostpartumBleeding: true, deliveryAt: delivery });
    const over = run("MUTADAH", [segment("a", delivery, at(delivery, 1440, 1))], { hasPostpartumBleeding: true, deliveryAt: delivery });
    expect(exact.rows.map((row) => row.status)).toEqual(["NIFAS"]);
    expect(over.rows.map((row) => row.status)).toEqual(["NIFAS", "ISTIHADHAH"]);
  });
  it("kembali ke adat nifas atau tamyiz ketika darah melampaui 60 hari", () => {
    const byHabit = run("MUTADAH", [segment("a", delivery, at(delivery, 1500))], { hasPostpartumBleeding: true, deliveryAt: delivery, postpartumHabitHours: 960 });
    const byTamyiz = run("MUTADAH", [
      segment("a", delivery, at(delivery, 120), "HITAM", "KENTAL", "BERAROMA"),
      segment("b", at(delivery, 120), at(delivery, 1500), "MERAH"),
    ], { hasPostpartumBleeding: true, deliveryAt: delivery });
    expect(byHabit.rows.map((row) => [row.status, row.durationHours])).toEqual([["NIFAS", 960], ["ISTIHADHAH", 540]]);
    expect(byTamyiz.rows.map((row) => [row.status, row.durationHours])).toEqual([["NIFAS", 120], ["ISTIHADHAH", 1380]]);
  });
  it("membedakan darah tertunda sebelum dan tepat 15 hari", () => {
    const before = at(delivery, 359, 59);
    const exact = at(delivery, 360);
    expect(run("MUTADAH", [segment("a", before, at(before, 24))], { hasPostpartumBleeding: true, deliveryAt: delivery }).rows.at(-1)!.status).toBe("NIFAS");
    expect(run("MUTADAH", [segment("a", exact, at(exact, 24))], { hasPostpartumBleeding: true, deliveryAt: delivery }).rows.at(-1)!.status).toBe("HAID");
  });
  it("membedakan naqa' pendek dan panjang", () => {
    const short = run("MUTADAH", [segment("a", delivery, at(delivery, 48)), segment("b", at(delivery, 288), at(delivery, 336))], { hasPostpartumBleeding: true, deliveryAt: delivery });
    const long = run("MUTADAH", [segment("a", delivery, at(delivery, 48)), segment("b", at(delivery, 408), at(delivery, 456))], { hasPostpartumBleeding: true, deliveryAt: delivery });
    expect(short.rows.some((row) => row.label.includes("Naqa'") && row.status === "NIFAS")).toBe(true);
    expect(long.rows.at(-1)!.status).toBe("HAID");
  });
  it("memungkinkan haid tepat sebelum persalinan tanpa pemisah 15 hari", () => {
    const start = at(delivery, -24);
    const result = run("MUTADAH", [segment("a", start, delivery), segment("b", delivery, at(delivery, 24))], { hasPostpartumBleeding: true, deliveryAt: delivery });
    expect(result.rows.map((row) => row.status)).toEqual(["HAID", "NIFAS"]);
  });
});

describe("asal darah dan validasi", () => {
  it("mengeluarkan darah luka/penyakit dari akumulasi haid", () => {
    const result = run("MUBTADAH", [segment("a", "2026-01-01T00:00", "2026-01-03T00:00", "MERAH", "CAIR", "TIDAK_BERAROMA", "LUKA_PENYAKIT")]);
    expect(result.rows[0].status).toBe("FASAD");
  });
  it("menolak rentang tumpang tindih dan baris parsial", () => {
    expect(analyzeCase({ userStatus: "MUBTADAH", hasPostpartumBleeding: false, segments: [segment("a", "2026-01-01T00:00", "2026-01-03T00:00"), segment("b", "2026-01-02T00:00", "2026-01-04T00:00")] }).issues[0].message).toContain("tumpang-tindih");
    expect(analyzeCase({ userStatus: "MUBTADAH", hasPostpartumBleeding: false, segments: [segment("a", "2026-01-01T00:00", "")] }).issues[0].message).toContain("lengkap");
  });
});

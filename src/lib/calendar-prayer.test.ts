import { describe, expect, it } from "vitest";

import { analyzeCase, formatJakartaInput } from "@/lib/fiqh-engine";
import {
  earliestEligibleHaidTimestamp,
  forbiddenFastDay,
  gregorianToIslamicCivil,
  islamicCivilToGregorian,
  ninthLunarBirthdayTimestamp,
} from "@/lib/islamic-calendar";
import { PRAYER_TIME_FEATURE_ENABLED, calculateKemenagPrayerTimes, prayerQadhaAtCessation, prayerQadhaAtOnset } from "@/lib/prayer-times";

describe("kalender Islamic Civil", () => {
  it("mengonversi epoch dan tanggal modern secara deterministik", () => {
    expect(gregorianToIslamicCivil(622, 7, 19)).toEqual({ year: 1, month: 1, day: 1 });
    expect(gregorianToIslamicCivil(2026, 6, 17)).toEqual({ year: 1448, month: 1, day: 1 });
    expect(islamicCivilToGregorian(1448, 1, 1)).toEqual({ year: 2026, month: 6, day: 17 });
  });

  it("memotong tepat pada toleransi kurang dari 16 hari", () => {
    const birthDate = "2018-01-01";
    const birthday = ninthLunarBirthdayTimestamp(birthDate)!;
    const threshold = earliestEligibleHaidTimestamp(birthDate)!;
    expect(threshold).toBe(birthday - 16 * 24 * 3_600_000 + 60_000);

    const tooEarly = analyzeCase({
      userStatus: "MUBTADAH",
      knowsBloodCharacteristics: false,
      hasPostpartumBleeding: false,
      birthDate,
      segments: [{ id: "a", start: formatJakartaInput(birthday - 16 * 24 * 3_600_000), end: formatJakartaInput(birthday - 15 * 24 * 3_600_000), color: "MERAH", consistency: "CAIR", odor: "TIDAK_BERAROMA", origin: "ALAMI" }],
    }).result!;
    expect(tooEarly.rows.map((row) => row.status)).toEqual(["FASAD", "FASAD"]);

    const eligible = analyzeCase({
      userStatus: "MUBTADAH",
      knowsBloodCharacteristics: false,
      hasPostpartumBleeding: false,
      birthDate,
      segments: [{ id: "a", start: formatJakartaInput(threshold), end: formatJakartaInput(threshold + 24 * 3_600_000), color: "MERAH", consistency: "CAIR", odor: "TIDAK_BERAROMA", origin: "ALAMI" }],
    }).result!;
    expect(eligible.rows[0].status).toBe("HAID");
  });

  it("mendeteksi hari haram puasa dengan kalender yang sama", () => {
    const eid = islamicCivilToGregorian(1448, 10, 1);
    const tasyrik = islamicCivilToGregorian(1448, 12, 12);
    expect(forbiddenFastDay(Date.UTC(eid.year, eid.month - 1, eid.day))).toContain("Idulfitri");
    expect(forbiddenFastDay(Date.UTC(tasyrik.year, tasyrik.month - 1, tasyrik.day))).toContain("Tasyrik");
  });
});

describe("waktu shalat lokal", () => {
  it("tetap dinonaktifkan pada produk sampai diaktifkan kembali secara eksplisit", () => {
    expect(PRAYER_TIME_FEATURE_ENABLED).toBe(false);
  });

  it("menggunakan sudut Kemenag, Asar Syafi'i, dan koreksi menit", () => {
    const base = calculateKemenagPrayerTimes(2026, 8, 21, -6.2, 106.8167);
    const adjusted = calculateKemenagPrayerTimes(2026, 8, 21, -6.2, 106.8167, { fajr: 2, isha: -1 });
    expect(adjusted.fajr - base.fajr).toBe(2 * 60_000);
    expect(adjusted.isha - base.isha).toBe(-60_000);
    expect(base.fajr).toBeLessThan(base.sunrise);
    expect(base.dhuhr).toBeLessThan(base.asr);
    expect(base.asr).toBeLessThan(base.maghrib);
  });

  it("menerapkan batas 3–5 menit dan pasangan Dhuhr/Asar serta Maghrib/Isya", () => {
    const start = Date.UTC(2026, 0, 1, 5);
    expect(prayerQadhaAtOnset(start + 2 * 60_000, "dhuhr", start).qadha).toEqual([]);
    expect(prayerQadhaAtOnset(start + 4 * 60_000, "dhuhr", start).certainty).toBe("UNCERTAIN");
    expect(prayerQadhaAtOnset(start + 5 * 60_000, "dhuhr", start).qadha).toEqual(["dhuhr"]);
    expect(prayerQadhaAtCessation(start, "asr", start + 10 * 60_000).qadha).toEqual(["dhuhr", "asr"]);
    expect(prayerQadhaAtCessation(start, "isha", start + 10 * 60_000).qadha).toEqual(["maghrib", "isha"]);
  });
});

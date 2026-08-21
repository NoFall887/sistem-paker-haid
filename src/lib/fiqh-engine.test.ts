import { describe, expect, it } from "vitest";

import {
  analyzeCase,
  formatJakartaInput,
  parseJakartaDateTime,
  type BloodColor,
  type BloodConsistency,
  type CaseInput,
  type UserStatus,
} from "@/lib/fiqh-engine";

const segment = (
  id: string,
  start: string,
  end: string,
  color: BloodColor = "MERAH",
  consistency: BloodConsistency = "CAIR",
) => ({ id, start, end, color, consistency });

const run = (
  userStatus: UserStatus,
  segments: CaseInput["segments"],
  menstrualHabitDays = 7,
) => {
  const analysis = analyzeCase({
    userStatus,
    menstrualHabitDays,
    purityHabitDays: 15,
    habitualStartTime: "06:00",
    segments,
  });
  expect(analysis.issues).toEqual([]);
  expect(analysis.result).toBeDefined();
  return analysis.result!;
};

describe("fixed Asia/Jakarta time", () => {
  it("round-trips local wall time without using the host timezone", () => {
    const value = "2026-02-01T06:00";
    expect(formatJakartaInput(parseJakartaDateTime(value)!)).toBe(value);
  });
});

describe("canonical classification parity", () => {
  it("normalizes adjacent identical rows for a Mubtada'ah case", () => {
    const one = run("MUBTADAH", [segment("a", "2026-02-01T06:00", "2026-02-23T06:00")]);
    const split = run("MUBTADAH", [
      segment("a", "2026-02-01T06:00", "2026-02-12T06:00"),
      segment("b", "2026-02-12T06:00", "2026-02-23T06:00"),
    ]);

    expect(split.category).toBe("MUBTADA'AH GHOIRU MUMAYYIZAH");
    expect(split.rows.map((row) => [row.durationHours, row.status])).toEqual(
      one.rows.map((row) => [row.durationHours, row.status]),
    );
    expect(split.rows.map((row) => row.durationHours)).toEqual([24, 504]);
  });

  it("returns a Mu'tadah case over 15 days to its seven-day habit", () => {
    const result = run("MUTADAH", [segment("a", "2026-02-01T06:00", "2026-02-23T06:00")]);
    expect(result.category).toBe("MU'TADAH GHOIRU MUMAYYIZAH");
    expect(result.rows.map((row) => row.durationHours)).toEqual([168, 360]);
  });

  it("accepts one strong block followed by one sufficiently long weak block", () => {
    const result = run("MUBTADAH", [
      segment("a", "2026-02-01T06:00", "2026-02-06T06:00", "HITAM", "KENTAL"),
      segment("b", "2026-02-06T06:00", "2026-02-24T06:00", "MERAH", "CAIR"),
    ]);
    expect(result.category).toBe("MUBTADA'AH MUMAYYIZAH");
    expect(result.rows.map((row) => [row.durationHours, row.status])).toEqual([
      [120, "HAID"],
      [432, "ISTIHADHAH"],
    ]);
  });

  it("rejects a strong-weak-strong tamyiz pattern", () => {
    const result = run("MUBTADAH", [
      segment("a", "2026-02-01T06:00", "2026-02-04T06:00", "HITAM", "KENTAL"),
      segment("b", "2026-02-04T06:00", "2026-02-20T06:00"),
      segment("c", "2026-02-20T06:00", "2026-02-23T06:00", "HITAM", "KENTAL"),
    ]);
    expect(result.category).toBe("MUBTADA'AH GHOIRU MUMAYYIZAH");
  });

  it("treats even a one-minute gap as a separate episode", () => {
    const result = run("MUBTADAH", [
      segment("a", "2026-02-01T06:00", "2026-02-06T06:00", "HITAM", "KENTAL"),
      segment("b", "2026-02-06T06:01", "2026-02-24T06:01"),
    ]);
    expect(result.category).not.toBe("MUBTADA'AH MUMAYYIZAH");
  });

  it("runs the chained Sahb and Takmil case without zero-hour rows", () => {
    const result = run("MUTADAH", [
      segment("1", "2026-06-14T03:00", "2026-06-21T15:00"),
      segment("2", "2026-07-03T13:00", "2026-07-08T04:00"),
      segment("3", "2026-07-17T10:00", "2026-07-28T11:00"),
      segment("4", "2026-08-01T13:00", "2026-08-05T07:00"),
      segment("5", "2026-08-08T13:00", "2026-08-09T19:00"),
    ]);
    expect(result.category).toBe("HASIL ANALISIS FIKIH");
    expect(result.haidPeriods.length).toBeGreaterThan(1);
    expect(result.rows.every((row) => row.durationHours > 0)).toBe(true);
  });
});

describe("validation", () => {
  it("rejects overlapping ranges", () => {
    const analysis = analyzeCase({
      userStatus: "MUBTADAH",
      segments: [
        segment("a", "2026-02-01T06:00", "2026-02-10T06:00"),
        segment("b", "2026-02-09T06:00", "2026-02-23T06:00"),
      ],
    });
    expect(analysis.result).toBeUndefined();
    expect(analysis.issues.some((issue) => issue.message.includes("tumpang-tindih"))).toBe(true);
  });

  it("rejects a partial row but ignores a fully empty row", () => {
    const partial = analyzeCase({
      userStatus: "MUBTADAH",
      segments: [segment("a", "2026-02-01T06:00", "")],
    });
    expect(partial.issues[0].message).toContain("lengkap");

    const empty = analyzeCase({ userStatus: "MUBTADAH", segments: [segment("a", "", "")] });
    expect(empty.issues).toEqual([{ message: "Masukkan minimal satu segmen darah yang lengkap." }]);
  });
});

import { describe, expect, it } from "vitest";

import { emptyCase } from "@/lib/fiqh-engine";
import { HISTORY_SCHEMA_VERSION, historyAsText, migrateHistory, serializeHistory } from "@/lib/history";

describe("history export", () => {
  it("copies a versioned, parseable JSON envelope", () => {
    const parsed = JSON.parse(serializeHistory(emptyCase()));
    expect(parsed.schemaVersion).toBe(HISTORY_SCHEMA_VERSION);
    expect(parsed.timezone).toBe("Asia/Jakarta");
    expect(parsed.caseInput.segments).toEqual([]);
    expect(parsed.caseInput.hasPostpartumBleeding).toBe(false);
    expect(parsed.caseInput.knowsBloodCharacteristics).toBe(false);
  });

  it("exports UTF-8-safe human-readable text in chronological order", () => {
    const input = emptyCase();
    input.userStatus = "MUTADAH";
    input.knowsBloodCharacteristics = true;
    input.segments = [
      { id: "b", start: "2026-02-03T06:00", end: "2026-02-04T06:00", color: "MERAH", consistency: "CAIR" },
      { id: "a", start: "2026-02-01T06:00", end: "2026-02-02T06:00", color: "HITAM", consistency: "KENTAL" },
    ];
    const text = historyAsText(input);
    expect(text.indexOf("2026-02-01")).toBeLessThan(text.indexOf("2026-02-03"));
    expect(text).toContain("PANDUAN FIKIH HAID & ISTIHADHAH");
    expect(text).toContain("Aroma:");
    expect(text).toContain("Asal:");
    expect(text).toContain("Darah setelah persalinan: tidak");
    expect(text).not.toContain("Persalinan selesai:");
  });

  it("migrates v1 with safe defaults and preserves all old blood rows", () => {
    const migrated = migrateHistory({
      schemaVersion: 1,
      timezone: "Asia/Jakarta",
      updatedAt: "2026-01-01T00:00:00.000Z",
      caseInput: {
        userStatus: "MUTADAH",
        menstrualHabitDays: 7,
        purityHabitDays: 15,
        habitualStartTime: "06:00",
        segments: [{ id: "a", start: "2026-01-01T00:00", end: "2026-01-02T00:00", color: "MERAH", consistency: "CAIR" }],
      },
    });
    expect(migrated?.menstrualHabitHours).toBe(168);
    expect(migrated?.purityHabitHours).toBe(360);
    expect(migrated?.segments[0].odor).toBe("TIDAK_BERAROMA");
    expect(migrated?.segments[0].origin).toBe("ALAMI");
    expect(migrated?.deliveryComplete).toBe(true);
    expect(migrated?.hasPostpartumBleeding).toBe(false);
    expect(migrated?.knowsBloodCharacteristics).toBe(true);
  });

  it("migrates v2 delivery data as an active postpartum case", () => {
    const migrated = migrateHistory({
      schemaVersion: 2,
      timezone: "Asia/Jakarta",
      updatedAt: "2026-01-01T00:00:00.000Z",
      caseInput: {
        userStatus: "MUTADAH",
        deliveryAt: "2026-05-01T00:00",
        deliveryComplete: true,
        postpartumHabitHours: 960,
        segments: [],
      },
    });
    expect(migrated?.hasPostpartumBleeding).toBe(true);
    expect(migrated?.deliveryAt).toBe("2026-05-01T00:00");
    expect(migrated?.knowsBloodCharacteristics).toBe(true);
  });

  it("migrates v3 as observed and preserves the v4 knowledge flag", () => {
    const legacy = migrateHistory({
      schemaVersion: 3,
      timezone: "Asia/Jakarta",
      updatedAt: "2026-01-01T00:00:00.000Z",
      caseInput: { userStatus: "MUBTADAH", hasPostpartumBleeding: false, segments: [] },
    });
    const current = migrateHistory({
      schemaVersion: 4,
      timezone: "Asia/Jakarta",
      updatedAt: "2026-01-01T00:00:00.000Z",
      caseInput: { userStatus: "MUBTADAH", knowsBloodCharacteristics: false, hasPostpartumBleeding: false, segments: [] },
    });
    expect(legacy?.knowsBloodCharacteristics).toBe(true);
    expect(current?.knowsBloodCharacteristics).toBe(false);
  });

  it("keeps hidden characteristics in JSON and omits them from inactive TXT", () => {
    const input = emptyCase();
    input.segments = [{ id: "a", start: "2026-02-01T06:00", end: "2026-02-02T06:00", color: "HITAM", consistency: "KENTAL", odor: "BERAROMA", origin: "ALAMI" }];
    expect(JSON.parse(serializeHistory(input)).caseInput.segments[0].color).toBe("HITAM");
    expect(historyAsText(input)).not.toContain("Warna:");
    expect(historyAsText(input)).toContain("Asal: ALAMI");

    input.knowsBloodCharacteristics = true;
    expect(historyAsText(input)).toContain("Warna: HITAM");
    expect(historyAsText(input)).toContain("Aroma: BERAROMA");
  });

  it("keeps hidden postpartum values in JSON but omits them from inactive TXT", () => {
    const input = emptyCase();
    input.deliveryAt = "2026-05-01T00:00";
    input.postpartumHabitHours = 960;
    expect(JSON.parse(serializeHistory(input)).caseInput.deliveryAt).toBe("2026-05-01T00:00");
    expect(historyAsText(input)).not.toContain("2026-05-01T00:00");

    input.hasPostpartumBleeding = true;
    expect(historyAsText(input)).toContain("Persalinan selesai: 2026-05-01T00:00");
  });
});

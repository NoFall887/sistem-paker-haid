import { describe, expect, it } from "vitest";

import { emptyCase } from "@/lib/fiqh-engine";
import { HISTORY_SCHEMA_VERSION, historyAsText, serializeHistory } from "@/lib/history";

describe("history export", () => {
  it("copies a versioned, parseable JSON envelope", () => {
    const parsed = JSON.parse(serializeHistory(emptyCase()));
    expect(parsed.schemaVersion).toBe(HISTORY_SCHEMA_VERSION);
    expect(parsed.timezone).toBe("Asia/Jakarta");
    expect(parsed.caseInput.segments).toEqual([]);
  });

  it("exports UTF-8-safe human-readable text in chronological order", () => {
    const input = emptyCase();
    input.userStatus = "MUTADAH";
    input.segments = [
      { id: "b", start: "2026-02-03T06:00", end: "2026-02-04T06:00", color: "MERAH", consistency: "CAIR" },
      { id: "a", start: "2026-02-01T06:00", end: "2026-02-02T06:00", color: "HITAM", consistency: "KENTAL" },
    ];
    const text = historyAsText(input);
    expect(text.indexOf("2026-02-01")).toBeLessThan(text.indexOf("2026-02-03"));
    expect(text).toContain("PANDUAN FIKIH HAID & ISTIHADHAH");
  });
});

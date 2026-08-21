import { CalculationParameters, Coordinates, Madhab, PrayerTimes, Rounding } from "adhan";

// Disabled for now. Set to true to restore the location UI and prayer-time analysis.
export const PRAYER_TIME_FEATURE_ENABLED: boolean = false;

export const PRAYER_NAMES = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerName = (typeof PRAYER_NAMES)[number];
export type PrayerAdjustments = Partial<Record<PrayerName, number>>;

export interface LocalPrayerTimes {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export function kemenagParameters(adjustments: PrayerAdjustments = {}) {
  const parameters = new CalculationParameters(null, 20, 18);
  parameters.madhab = Madhab.Shafi;
  parameters.rounding = Rounding.Nearest;
  for (const prayer of PRAYER_NAMES) parameters.adjustments[prayer] = adjustments[prayer] ?? 0;
  return parameters;
}

export function calculateKemenagPrayerTimes(
  year: number,
  month: number,
  day: number,
  latitude: number,
  longitude: number,
  adjustments: PrayerAdjustments = {},
): LocalPrayerTimes {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) throw new Error("Lintang tidak valid.");
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error("Bujur tidak valid.");
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  const times = new PrayerTimes(new Coordinates(latitude, longitude), date, kemenagParameters(adjustments));
  return {
    fajr: times.fajr.getTime(),
    sunrise: times.sunrise.getTime(),
    dhuhr: times.dhuhr.getTime(),
    asr: times.asr.getTime(),
    maghrib: times.maghrib.getTime(),
    isha: times.isha.getTime(),
  };
}

export interface PrayerQadhaEvent {
  at: number;
  prayer: PrayerName;
  reason: "ONSET" | "CESSATION";
  certainty: "CERTAIN" | "UNCERTAIN";
  qadha: PrayerName[];
}

export function prayerQadhaAtOnset(
  onset: number,
  prayer: PrayerName,
  prayerStart: number,
  requiredMinutes = 5,
): PrayerQadhaEvent {
  const availableMinutes = (onset - prayerStart) / 60_000;
  return {
    at: onset,
    prayer,
    reason: "ONSET",
    certainty: availableMinutes >= requiredMinutes || availableMinutes < 3 ? "CERTAIN" : "UNCERTAIN",
    qadha: availableMinutes >= requiredMinutes ? [prayer] : [],
  };
}

export function prayerQadhaAtCessation(
  cessation: number,
  prayer: PrayerName,
  prayerEnd: number,
  purificationMinutes = 5,
): PrayerQadhaEvent {
  const availableMinutes = (prayerEnd - cessation) / 60_000;
  const enough = availableMinutes >= purificationMinutes + 1;
  const qadha: PrayerName[] = enough ? [prayer] : [];
  if (enough && prayer === "asr") qadha.unshift("dhuhr");
  if (enough && prayer === "isha") qadha.unshift("maghrib");
  return {
    at: cessation,
    prayer,
    reason: "CESSATION",
    certainty: availableMinutes >= purificationMinutes + 1 || availableMinutes < purificationMinutes ? "CERTAIN" : "UNCERTAIN",
    qadha,
  };
}

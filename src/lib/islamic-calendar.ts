export interface IslamicCivilDate {
  year: number;
  month: number;
  day: number;
}

const ISLAMIC_EPOCH = 1_948_439.5;
const HOUR_MS = 3_600_000;
const JAKARTA_OFFSET_MS = 7 * HOUR_MS;

function parseJakartaDateTime(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match.map(Number);
  return Date.UTC(year, month - 1, day, hour, minute) - JAKARTA_OFFSET_MS;
}

function gregorianToJulianDay(year: number, month: number, day: number) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const integer =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  return integer - 0.5;
}

function julianDayToGregorian(julianDay: number) {
  const j = Math.floor(julianDay + 0.5);
  const a = j + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: 100 * b + d - 4800 + Math.floor(m / 10),
  };
}

function islamicToJulianDay(year: number, month: number, day: number) {
  return (
    day +
    Math.ceil(29.5 * (month - 1)) +
    (year - 1) * 354 +
    Math.floor((3 + 11 * year) / 30) +
    ISLAMIC_EPOCH -
    1
  );
}

export function isIslamicCivilLeapYear(year: number) {
  return ((11 * year + 14) % 30) < 11;
}

export function islamicCivilMonthLength(year: number, month: number) {
  if (month === 12) return isIslamicCivilLeapYear(year) ? 30 : 29;
  return month % 2 === 1 ? 30 : 29;
}

export function gregorianToIslamicCivil(year: number, month: number, day: number): IslamicCivilDate {
  const julianDay = gregorianToJulianDay(year, month, day);
  const islamicYear = Math.floor((30 * (julianDay - ISLAMIC_EPOCH) + 10646) / 10631);
  const firstDay = islamicToJulianDay(islamicYear, 1, 1);
  const islamicMonth = Math.min(12, Math.max(1, Math.ceil((julianDay - 29 - firstDay) / 29.5) + 1));
  const islamicDay = Math.floor(julianDay - islamicToJulianDay(islamicYear, islamicMonth, 1) + 1);
  return { year: islamicYear, month: islamicMonth, day: islamicDay };
}

export function islamicCivilToGregorian(year: number, month: number, day: number) {
  return julianDayToGregorian(islamicToJulianDay(year, month, day));
}

export function ninthLunarBirthdayTimestamp(birthDate: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const roundTrip = new Date(Date.UTC(year, month - 1, day));
  if (
    roundTrip.getUTCFullYear() !== year ||
    roundTrip.getUTCMonth() + 1 !== month ||
    roundTrip.getUTCDate() !== day
  ) return null;

  const islamic = gregorianToIslamicCivil(year, month, day);
  const targetYear = islamic.year + 9;
  const targetDay = Math.min(islamic.day, islamicCivilMonthLength(targetYear, islamic.month));
  const gregorian = islamicCivilToGregorian(targetYear, islamic.month, targetDay);
  return parseJakartaDateTime(
    `${gregorian.year}-${String(gregorian.month).padStart(2, "0")}-${String(gregorian.day).padStart(2, "0")}T00:00`,
  );
}

export function earliestEligibleHaidTimestamp(birthDate: string) {
  const birthday = ninthLunarBirthdayTimestamp(birthDate);
  return birthday === null ? null : birthday - 16 * 24 * HOUR_MS + 60_000;
}

export function islamicCivilAtTimestamp(timestamp: number): IslamicCivilDate {
  const local = new Date(timestamp + 7 * HOUR_MS);
  return gregorianToIslamicCivil(local.getUTCFullYear(), local.getUTCMonth() + 1, local.getUTCDate());
}

export function forbiddenFastDay(timestamp: number) {
  const date = islamicCivilAtTimestamp(timestamp);
  if (date.month === 10 && date.day === 1) return "Hari Raya Idulfitri (1 Syawal)";
  if (date.month === 12 && date.day === 10) return "Hari Raya Iduladha (10 Zulhijah)";
  if (date.month === 12 && date.day >= 11 && date.day <= 13) return `Hari Tasyrik (${date.day} Zulhijah)`;
  return null;
}

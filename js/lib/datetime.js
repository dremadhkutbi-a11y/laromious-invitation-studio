/**
 * Dates and times: reading what people type, writing what the card shows.
 *
 * Input accepts Latin, Arabic-Indic and Persian digits; dates as d/m/y, y/m/d or
 * ISO; times in 24-hour form or 12-hour form with an English or Arabic AM/PM word.
 * Output follows the card: Arabic weekday and month names with Arabic-Indic digits.
 */
import { time as timeWords } from "../i18n/ar.js";

const ARABIC_INDIC_ZERO = 0x0660;
const PERSIAN_ZERO = 0x06f0;
const NON_LATIN_DIGIT = /[\u0660-\u0669\u06f0-\u06f9]/g;

const PM = new RegExp(`pm|p\\.m\\.|${timeWords.pmPrefix}`, "i");
const AM = new RegExp(`am|a\\.m\\.|${timeWords.amPrefix}`, "i");
// Hours, then optional minutes after ":", "." or the Arabic decimal separator.
const CLOCK = /(\d{1,2})(?:\s*[:.\u066b]\s*(\d{1,2}))?/;

const CARD_DATE = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function toLatinDigits(value) {
  return String(value ?? "").replace(NON_LATIN_DIGIT, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code - (code >= PERSIAN_ZERO ? PERSIAN_ZERO : ARABIC_INDIC_ZERO));
  });
}

export function toArabicDigits(value) {
  return String(value).replace(/\d/g, (digit) => String.fromCharCode(ARABIC_INDIC_ZERO + Number(digit)));
}

/** @returns {Date | null} the calendar date, or null when the input is not a real Gregorian date */
export function parseDate(input) {
  const raw = toLatinDigits(input).trim();
  if (!raw) return null;

  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  let year;
  let month;
  let day;
  if (iso) {
    [year, month, day] = iso.slice(1).map(Number);
  } else {
    const parts = raw.split(/[./\-\s]+/).filter(Boolean).map(Number);
    if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return null;
    [day, month, year] = String(parts[0]).length === 4 ? parts.reverse() : parts;
  }

  if (year < 100) year += 2000;
  if (year < 1900 || year > 2200 || month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  const rolledOver = date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day;
  return rolledOver ? null : date;
}

/** @returns {{ hour: number, minute: number } | null} a 24-hour time, or null when unreadable */
export function parseTime(input) {
  const raw = toLatinDigits(input).trim().toLowerCase().replace(/\s+/g, " ");
  const clock = raw.match(CLOCK);
  if (!clock) return null;

  let hour = Number(clock[1]);
  const minute = clock[2] === undefined ? 0 : Number(clock[2]);
  if (minute > 59) return null;

  const isPm = PM.test(raw);
  const isAm = AM.test(raw);
  if (isPm || isAm) {
    if (hour < 1 || hour > 12) return null;
    if (isPm && hour < 12) hour += 12;
    if (isAm && hour === 12) hour = 0;
  } else if (hour > 23) {
    return null;
  }
  return { hour, minute };
}

export function formatCardDate(date) {
  return CARD_DATE.format(date);
}

export function formatCardTime({ hour, minute }) {
  const hour12 = hour % 12 || 12;
  const minutes = minute ? `:${toArabicDigits(String(minute).padStart(2, "0"))}` : "";
  return `${toArabicDigits(hour12)}${minutes} ${hour >= 12 ? timeWords.pm : timeWords.am}`;
}

/** Shows a date picked from the native date picker (yyyy-mm-dd) in the text field. */
export function formatEditorDate(isoValue, language) {
  const date = parseDate(isoValue);
  if (!date) return isoValue;
  const pad = (number) => String(number).padStart(2, "0");
  const text = `${pad(date.getDate())} / ${pad(date.getMonth() + 1)} / ${date.getFullYear()}`;
  return language === "ar" ? toArabicDigits(text) : text;
}

/** Shows a time picked from the native time picker (hh:mm) in the text field. */
export function formatEditorTime(value, language) {
  const [hour, minute] = value.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value;
  if (language === "ar") return formatCardTime({ hour, minute });
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

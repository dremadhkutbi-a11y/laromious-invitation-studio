/** Form rules, independent of the DOM. Error codes map to interface copy in the editor. */
import { parseDate, parseTime } from "../lib/datetime.js";

/** In form order, so the first error found is the first one on screen. */
export const FIELDS = Object.freeze(["eventTitle", "eventDescription", "eventDate", "eventTime", "guestName"]);

const PARSERS = { eventDate: [parseDate, "invalidDate"], eventTime: [parseTime, "invalidTime"] };

/** @returns {"required" | "invalidDate" | "invalidTime" | null} */
export function validateField(field, value) {
  if (!String(value ?? "").trim()) return "required";
  const [parse, error] = PARSERS[field] ?? [];
  return parse && !parse(value) ? error : null;
}

/** @returns {Map<string, string>} field → error code, in form order; empty when valid */
export function validate(state) {
  const errors = new Map();
  for (const field of FIELDS) {
    const error = validateField(field, state[field]);
    if (error) errors.set(field, error);
  }
  return errors;
}

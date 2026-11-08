/** Download file names built from the guest's name, spelled in Latin letters. */
import { transliteration } from "../i18n/ar.js";

const MAX_SLUG_LENGTH = 48;

export function transliterate(value) {
  return Array.from(String(value ?? "").normalize("NFKD"), (character) => transliteration[character] ?? character).join("");
}

/** e.g. a guest named "Sara Ali" → "invitation-sara-ali.png" */
export function invitationFileName(guestName) {
  const slug = transliterate(guestName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH);
  return `invitation-${slug || "guest"}.png`;
}

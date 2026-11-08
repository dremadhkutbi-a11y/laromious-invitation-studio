/**
 * What the card says, derived from the editor state. Both renderers draw from
 * this model, so a value can never read differently in the preview and the PNG.
 */
import { card as copy } from "../i18n/ar.js";
import { formatCardDate, formatCardTime, parseDate, parseTime } from "../lib/datetime.js";

/** A line of card text; placeholders stand in for empty or unreadable input and are drawn muted. */
function textField(value, placeholder) {
  const text = String(value ?? "").trim();
  return text ? { text, isPlaceholder: false } : { text: placeholder, isPlaceholder: true };
}

function parsedField(value, parse, format, placeholder) {
  const parsed = parse(value);
  if (parsed) return { text: format(parsed), isPlaceholder: false };
  return { text: String(value ?? "").trim() || placeholder, isPlaceholder: true };
}

/**
 * @param {{ guestName: string, eventTitle: string, eventDescription: string,
 *           eventDate: string, eventTime: string, nameStyle: "standalone" | "greeting" }} state
 */
export function buildCardModel(state) {
  const { placeholders, labels } = copy;
  return {
    kicker: copy.kicker,
    greeting: state.nameStyle === "greeting" ? copy.greeting : null,
    guestName: textField(state.guestName, placeholders.guestName),
    title: textField(state.eventTitle, placeholders.title),
    description: textField(state.eventDescription, placeholders.description),
    details: [
      { label: labels.date, ...parsedField(state.eventDate, parseDate, formatCardDate, placeholders.date) },
      { label: labels.time, ...parsedField(state.eventTime, parseTime, formatCardTime, placeholders.time) },
      { label: labels.venue, text: copy.venue, isPlaceholder: false },
    ],
  };
}

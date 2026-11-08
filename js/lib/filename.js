/** Download file names, written in Arabic from the guest's name as typed. */
import { files } from "../i18n/ar.js";

const MAX_NAME_LENGTH = 80;
// Characters that file systems reject, control characters, and the invisible
// direction marks that could make a name display differently from how it reads.
const UNSAFE = /[\\/:*?"<>|\u0000-\u001f\u007f\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;

/** e.g. guest "Sara Ali" → "<invitation> Sara Ali.png", with the Arabic word for invitation */
export function invitationFileName(guestName) {
  const name = String(guestName ?? "")
    .replace(UNSAFE, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\.+|\.+$/g, "")
    .slice(0, MAX_NAME_LENGTH)
    .trim();
  return `${[files.invitation, name].filter(Boolean).join(" ")}.png`;
}

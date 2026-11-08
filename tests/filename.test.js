import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { files } from "../js/i18n/ar.js";
import { invitationFileName } from "../js/lib/filename.js";

// "Mostafa Emam", written in Arabic script.
const ARABIC_NAME = String.fromCodePoint(0x0645, 0x0635, 0x0637, 0x0641, 0x064a, 0x20, 0x0627, 0x0645, 0x0627, 0x0645);
const RIGHT_TO_LEFT_MARK = String.fromCodePoint(0x200f);

describe("invitationFileName", () => {
  it("keeps the guest's name exactly as typed, in Arabic", () => {
    assert.equal(invitationFileName(ARABIC_NAME), `${files.invitation} ${ARABIC_NAME}.png`);
  });

  it("keeps Latin and mixed names", () => {
    assert.equal(invitationFileName("Sara Al-Qahtani"), `${files.invitation} Sara Al-Qahtani.png`);
  });

  it("tidies spacing", () => {
    assert.equal(invitationFileName("  Sara   Ali  "), `${files.invitation} Sara Ali.png`);
  });

  it("removes characters that file systems reject and invisible direction marks", () => {
    assert.equal(invitationFileName(`Sara/Ali: "VIP"?${RIGHT_TO_LEFT_MARK}`), `${files.invitation} Sara Ali VIP.png`);
  });

  it("never produces a hidden or empty name", () => {
    assert.equal(invitationFileName("..."), `${files.invitation}.png`);
    assert.equal(invitationFileName(""), `${files.invitation}.png`);
  });

  it("limits very long names", () => {
    const name = invitationFileName("a".repeat(200)).slice(files.invitation.length + 1, -".png".length);
    assert.equal(name.length, 80);
  });
});

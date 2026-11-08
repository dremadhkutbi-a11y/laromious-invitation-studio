import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { invitationFileName } from "../js/lib/filename.js";

describe("invitationFileName", () => {
  it("spells Arabic names in Latin letters", () => {
    const mostafaInArabicScript = "\u0645\u0635\u0637\u0641\u0649";
    assert.equal(invitationFileName(mostafaInArabicScript), "invitation-mstfa.png");
  });

  it("keeps Latin names readable", () => {
    assert.equal(invitationFileName("  Sara  Al-Qahtani "), "invitation-sara-al-qahtani.png");
  });

  it("falls back when nothing usable is left", () => {
    assert.equal(invitationFileName(""), "invitation-guest.png");
    assert.equal(invitationFileName("***"), "invitation-guest.png");
  });

  it("limits long names", () => {
    const slug = invitationFileName("a".repeat(200)).slice("invitation-".length, -".png".length);
    assert.equal(slug.length, 48);
  });
});

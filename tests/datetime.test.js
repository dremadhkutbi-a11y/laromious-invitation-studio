import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { time } from "../js/i18n/ar.js";
import {
  formatCardTime,
  formatEditorDate,
  formatEditorTime,
  parseDate,
  parseTime,
  toArabicDigits,
  toLatinDigits,
} from "../js/lib/datetime.js";

describe("digits", () => {
  it("round-trips between Latin and Arabic-Indic digits", () => {
    assert.equal(toLatinDigits(toArabicDigits("2026/05/30 19:45")), "2026/05/30 19:45");
  });

  it("reads Persian digits", () => {
    assert.equal(toLatinDigits("\u06f1\u06f2:\u06f3\u06f0"), "12:30");
  });
});

describe("parseDate", () => {
  it("accepts day/month/year, year/month/day and ISO dates", () => {
    for (const input of ["30/5/2026", "30-05-2026", "30.5.2026", "2026/5/30", "2026-05-30", toArabicDigits("30/5/2026")]) {
      assert.deepEqual(parseDate(input), new Date(2026, 4, 30), input);
    }
  });

  it("expands two-digit years into this century", () => {
    assert.deepEqual(parseDate("1/2/26"), new Date(2026, 1, 1));
  });

  it("rejects dates that do not exist", () => {
    for (const input of ["31/2/2026", "0/1/2026", "1/13/2026", "1/2", "", "soon"]) {
      assert.equal(parseDate(input), null, input);
    }
  });
});

describe("parseTime", () => {
  it("reads 24-hour times", () => {
    assert.deepEqual(parseTime("19:30"), { hour: 19, minute: 30 });
    assert.deepEqual(parseTime("7"), { hour: 7, minute: 0 });
  });

  it("reads English AM/PM", () => {
    assert.deepEqual(parseTime("7 pm"), { hour: 19, minute: 0 });
    assert.deepEqual(parseTime("7:15 P.M."), { hour: 19, minute: 15 });
    assert.deepEqual(parseTime("12 am"), { hour: 0, minute: 0 });
    assert.deepEqual(parseTime("12 pm"), { hour: 12, minute: 0 });
  });

  it("reads the Arabic AM/PM words, as written on the card or typed short", () => {
    assert.deepEqual(parseTime(`${toArabicDigits(7)} ${time.pm}`), { hour: 19, minute: 0 });
    assert.deepEqual(parseTime(`9:30 ${time.amPrefix}`), { hour: 9, minute: 30 });
  });

  it("rejects times that cannot be read", () => {
    for (const input of ["25", "13 pm", "7:75", "", "evening"]) {
      assert.equal(parseTime(input), null, input);
    }
  });
});

describe("formatting", () => {
  it("writes card times in Arabic, omitting zero minutes", () => {
    assert.equal(formatCardTime({ hour: 19, minute: 0 }), `${toArabicDigits(7)} ${time.pm}`);
    assert.equal(formatCardTime({ hour: 0, minute: 5 }), `${toArabicDigits("12:05")} ${time.am}`);
  });

  it("shows native picker values in the editor's language", () => {
    assert.equal(formatEditorDate("2026-05-30", "en"), "30 / 05 / 2026");
    assert.equal(formatEditorDate("2026-05-30", "ar"), toArabicDigits("30 / 05 / 2026"));
    assert.equal(formatEditorTime("19:05", "en"), "7:05 PM");
    assert.equal(formatEditorTime("19:05", "ar"), formatCardTime({ hour: 19, minute: 5 }));
  });
});

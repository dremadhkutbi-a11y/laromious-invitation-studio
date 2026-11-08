import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { FIELDS, validate, validateField } from "../js/editor/validation.js";

const complete = {
  eventTitle: "Fragrance launch evening",
  eventDescription: "Join us for the new collection.",
  eventDate: "30/5/2026",
  eventTime: "7 pm",
  guestName: "Sara",
};

describe("validate", () => {
  it("accepts a complete form", () => {
    assert.equal(validate(complete).size, 0);
  });

  it("requires every field", () => {
    assert.deepEqual([...validate({}).keys()], FIELDS);
  });

  it("reports errors in form order, whatever their kind", () => {
    const errors = validate({ ...complete, guestName: "  ", eventDate: "31/2/2026" });
    assert.deepEqual([...errors], [
      ["eventDate", "invalidDate"],
      ["guestName", "required"],
    ]);
  });
});

describe("validateField", () => {
  it("checks dates and times beyond presence", () => {
    assert.equal(validateField("eventTime", "25:00"), "invalidTime");
    assert.equal(validateField("eventTime", "19:00"), null);
    assert.equal(validateField("eventTitle", "anything"), null);
  });
});

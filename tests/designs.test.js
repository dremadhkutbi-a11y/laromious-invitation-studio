import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";

import { DESIGNS, findDesign, resolveFontId, resolveWeight } from "../js/card/designs/index.js";
import { findFont } from "../js/fonts.js";
import { ui as arabic } from "../js/i18n/ar.js";
import { ui as english } from "../js/i18n/en.js";

const [classic] = DESIGNS;
const night = findDesign("night");
const gallery = findDesign("gallery");

describe("design registry", () => {
  it("offers the classic design first, then the others, each once", () => {
    assert.deepEqual(
      DESIGNS.map((design) => design.id),
      ["classic", "gallery", "night"],
    );
  });

  it("falls back to the classic design for unknown or missing ids", () => {
    assert.equal(findDesign("poster"), classic);
    assert.equal(findDesign(null), classic);
  });

  it("names every design in both interface languages", () => {
    for (const { copyKey } of DESIGNS) {
      assert.ok(arabic[copyKey], `Arabic copy for ${copyKey}`);
      assert.ok(english[copyKey], `English copy for ${copyKey}`);
    }
  });

  it("ships every picture a design refers to", () => {
    for (const { photo, thumbnail, logo } of DESIGNS) {
      for (const file of [photo, thumbnail, logo].filter(Boolean)) {
        assert.ok(existsSync(new URL(`../${file}`, import.meta.url)), file);
      }
    }
  });
});

describe("resolveFontId", () => {
  it("uses the design's own font while the picker is on Default", () => {
    assert.equal(resolveFontId(gallery, "name", "default"), "aref-ruqaa");
    assert.equal(resolveFontId(gallery, "text", "default"), "almarai");
    assert.equal(resolveFontId(night, "name", "default"), "el-messiri");
  });

  it("keeps the system fonts for the classic design", () => {
    assert.equal(resolveFontId(classic, "name", "default"), "default");
    assert.equal(resolveFontId(classic, "text", "default"), "default");
  });

  it("always honours a font picked by hand", () => {
    for (const design of DESIGNS) assert.equal(resolveFontId(design, "name", "amiri"), "amiri");
  });
});

describe("resolveWeight", () => {
  it("draws the design's weight when the font ships that face", () => {
    assert.equal(resolveWeight(night, "name", findFont("el-messiri")), 600);
  });

  it("falls back to regular rather than faking a bold", () => {
    assert.equal(resolveWeight(night, "name", findFont("almarai")), 400);
    assert.equal(resolveWeight(night, "name", findFont("default")), 400);
  });

  it("uses regular where the design asks for nothing else", () => {
    assert.equal(resolveWeight(classic, "name", findFont("el-messiri")), 400);
    assert.equal(resolveWeight(gallery, "text", findFont("almarai")), 400);
  });
});

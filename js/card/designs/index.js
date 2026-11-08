/**
 * The card designs offered in the editor. Every design shares the same card model
 * (js/card/model.js) and exports:
 *
 *   id, copyKey   identifier and interface-copy key for its name
 *   photo         default photo, used until one is uploaded
 *   logo          optional logo file; without one, the design draws the page's logo
 *   thumbnail     picture shown in the design picker
 *   fonts         { name, text } font ids used while the font pickers are on "Default"
 *                 (null keeps the platform's Arabic system fonts)
 *   weights       optional { name, text } weights the design draws with when the font has them
 *   livePreview   "markup" for a live HTML card; otherwise the preview is the drawn PNG
 *   render        ({ model, fonts, images, canvas? }) → a 1080 × 1920 canvas
 */
import { fontWeights } from "../../fonts.js";
import { classic } from "./classic.js";
import { gallery } from "./gallery.js";
import { night } from "./night.js";

export const DESIGNS = Object.freeze([classic, gallery, night]);

const STORAGE_KEY = "laromious.design";

export function findDesign(id) {
  return DESIGNS.find((design) => design.id === id) ?? DESIGNS[0];
}

/**
 * The font a role ("name" or "text") actually uses: the picker's choice, or, while
 * the picker is on "default", the design's own font.
 */
export function resolveFontId(design, role, chosenId) {
  return chosenId === "default" ? design.fonts[role] ?? "default" : chosenId;
}

/**
 * The weight a role is drawn in: the design's, when the font ships that face,
 * otherwise regular, so the browser never fakes a bold.
 */
export function resolveWeight(design, role, font) {
  const wanted = design.weights?.[role] ?? 400;
  return fontWeights(font).includes(wanted) ? wanted : 400;
}

/** Remembers the chosen design in this browser; storage can be blocked, so failures fall back quietly. */
export const designPreference = {
  read() {
    try {
      return findDesign(window.localStorage.getItem(STORAGE_KEY)).id;
    } catch {
      return DESIGNS[0].id;
    }
  },
  save(id) {
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Not persisted; the choice still applies until the page closes.
    }
  },
};

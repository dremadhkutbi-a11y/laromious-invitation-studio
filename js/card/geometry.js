/**
 * The card design, in pixels of the exported 1080 × 1920 PNG.
 *
 * The live preview draws the same design in container-query units
 * (100cqw = CARD.width), so both renderers share one coordinate system and
 * everything here applies to both. Vertical "middle" values are the centre
 * lines that text is drawn on (canvas textBaseline "middle").
 */
export const CARD = Object.freeze({ width: 1080, height: 1920 });
export const CENTER_X = CARD.width / 2;

/** The photo fills the top 47%; the white body below holds all the text. */
export const BODY_TOP = CARD.height * 0.47;
const BODY_HEIGHT = CARD.height - BODY_TOP;

export const HERO = Object.freeze({
  height: Math.round(BODY_TOP),
  focusX: 0.5,
  focusY: 0.4,
  // Mirrors .hero-tint in css/app.css.
  shade: [
    [0, "rgba(0, 0, 0, 0.01)"],
    [0.72, "rgba(18, 15, 12, 0.03)"],
    [1, "rgba(12, 10, 8, 0.16)"],
  ],
});

export const KICKER = Object.freeze({ baseline: 1016, size: 30 });

export const NAME = Object.freeze({
  maxWidth: 880,
  maxSize: 68,
  // An 80-character name still fits on one line at this size.
  minSize: 22,
  lineHeight: 1.2,
  middle: { standalone: 1104, greeting: 1124 },
  // Space kept under the name's lowest stroke; some fonts (Amiri's final yeh)
  // draw deep tails that would otherwise run into the next line.
  clearance: 10,
});

export const GREETING = Object.freeze({
  size: 24,
  lineHeight: 1.5,
  preludeMiddle: 1047,
  followupMiddle: 1173,
});

export const TITLE = Object.freeze({
  top: BODY_TOP + BODY_HEIGHT * 0.31,
  // Minimum gap above the title when a tall name pushes it down.
  clearance: 20,
  maxWidth: 900,
  maxSize: 37,
  minSize: 22,
  maxLines: 2,
  lineHeight: 1.28,
  gapBelow: 31,
});

export const DESCRIPTION = Object.freeze({
  maxWidth: 860,
  maxSize: 31,
  // Wide families such as Alexandria need 19px to fit a full 360-character message.
  minSize: 18,
  lineHeight: 1.55,
  gapBelow: 32,
});

export const DETAILS = Object.freeze({
  top: BODY_TOP + BODY_HEIGHT * 0.489,
  // A long message pushes the details row down, but never into the logo.
  maxTop: 1530,
  ruleInset: 92,
  columns: [860, 540, 220],
  dividers: [380, 700],
  dividerSpan: [35, 145],
  labelBaseline: 65,
  labelSize: 19,
  valueBaseline: 110,
  value: { maxWidth: 270, maxSize: 25, minSize: 16 },
});

export const LOGO = Object.freeze({ top: 1718, width: 290 });

export const COLORS = Object.freeze({
  paper: "#fff",
  ink: "#171717",
  muted: "#9fa4a9",
  followup: "#3d3d3d",
  label: "#333",
  rule: "#d5d5d5",
  divider: "#c9c9c9",
});

/**
 * Gallery: the photo fills the whole card, a dark shade rises from the
 * bottom, and the text sits on it in cream and gold, anchored to the bottom edge.
 * Measurements are the approved prototype's, in pixels of the 1080 × 1920 PNG.
 */
import { CARD, CENTER_X } from "../geometry.js";
import { cardCanvas, drawCentredImage, drawCover, drawLine, fillGradient, writeLine } from "../paint.js";
import { fitLine, fitParagraph, fitToHeight, font } from "../text-fit.js";
import { drawDetails, drawLines } from "./shared.js";

const INSET = 88;
const TEXT_WIDTH = CARD.width - 2 * INSET;
const BOTTOM = CARD.height - 108;
// The text never climbs above this line, so it always sits on the dark part of the shade.
const MIN_TOP = 1060;

const COLORS = {
  ground: "#110c09",
  gold: "#d9b45a",
  cream: "#f4ede1",
  creamSoft: "rgba(244, 237, 225, 0.74)",
  rule: "rgba(217, 180, 90, 0.38)",
};
const SHADE = [
  [0, "rgba(10, 7, 5, 0.38)"],
  [0.2, "rgba(10, 7, 5, 0)"],
  [0.4, "rgba(10, 7, 5, 0)"],
  [0.62, "rgba(10, 7, 5, 0.84)"],
  [1, "rgba(10, 7, 5, 0.96)"],
];
// Almarai's natural line height, which the prototype gave the kicker and the detail labels.
const NATURAL_LINE_HEIGHT = 1.115;
const LOGO = { top: 68, width: 248, alpha: 0.94 };
const KICKER = { size: 26, lineHeight: NATURAL_LINE_HEIGHT, gapBelow: 32, rule: 68, ruleGap: 24 };
const GREETING = { size: 26, lineHeight: 1.5, gap: 6 };
const NAME = { maxSize: 104, minSize: 40, lineHeight: 1.25 };
const TITLE = { maxSize: 34, minSize: 26, maxLines: 2, lineHeight: 1.6, gapAbove: 36 };
const MESSAGE = { maxSize: 28, minSize: 20, lineHeight: 1.6, gapAbove: 4 };
const DETAILS = {
  gapAbove: 60,
  rule: 2,
  paddingTop: 36,
  label: { size: 21, lineHeight: NATURAL_LINE_HEIGHT },
  value: { maxSize: 26, minSize: 18, lineHeight: 1.5 },
  gap: 10,
  padding: 12,
};

/** The kicker between two short gold rules. Returns the row's height. */
function drawKicker(ctx, text, top, family) {
  const height = KICKER.size * KICKER.lineHeight;
  const middle = top + height / 2;
  ctx.font = font(KICKER.size, family);
  const half = ctx.measureText(text).width / 2 + KICKER.ruleGap;
  drawLine(ctx, CENTER_X + half, middle, CENTER_X + half + KICKER.rule, middle, COLORS.gold);
  drawLine(ctx, CENTER_X - half, middle, CENTER_X - half - KICKER.rule, middle, COLORS.gold);
  writeLine(ctx, text, middle, { size: KICKER.size, family, color: COLORS.gold });
  return height;
}

function render({ model, fonts, images, canvas }) {
  const target = cardCanvas(canvas);
  const ctx = target.getContext("2d");

  ctx.fillStyle = COLORS.ground;
  ctx.fillRect(0, 0, CARD.width, CARD.height);
  drawCover(ctx, images.photo, { x: 0, y: 0, width: CARD.width, height: CARD.height, focusX: 0.5, focusY: 0.38 });
  fillGradient(ctx, SHADE);
  drawCentredImage(ctx, images.logo, LOGO);

  // Measure the text block so it can be anchored to the bottom edge...
  const nameSize = fitLine(ctx, model.guestName.text, { maxWidth: TEXT_WIDTH, ...NAME, family: fonts.name });
  const title = fitParagraph(ctx, model.title.text, { maxWidth: TEXT_WIDTH, ...TITLE, family: fonts.text });
  const greetingLine = GREETING.gap + GREETING.size * GREETING.lineHeight;
  const detailsHeight = DETAILS.gapAbove + DETAILS.rule + DETAILS.paddingTop + DETAILS.label.size * DETAILS.label.lineHeight
    + DETAILS.gap + DETAILS.value.maxSize * DETAILS.value.lineHeight;
  const fixedHeight = KICKER.size * KICKER.lineHeight + KICKER.gapBelow
    + (model.greeting ? 2 * greetingLine : 0)
    + nameSize * NAME.lineHeight
    + TITLE.gapAbove + title.lines.length * title.size * TITLE.lineHeight
    + MESSAGE.gapAbove + detailsHeight;
  const message = fitToHeight(ctx, model.description.text, {
    maxWidth: TEXT_WIDTH,
    ...MESSAGE,
    maxHeight: BOTTOM - MIN_TOP - fixedHeight,
    family: fonts.text,
  });

  // ...then draw it top to bottom.
  let y = BOTTOM - fixedHeight - message.lines.length * message.size * MESSAGE.lineHeight;
  y += drawKicker(ctx, model.kicker, y, fonts.text) + KICKER.gapBelow;
  if (model.greeting) {
    writeLine(ctx, model.greeting.prelude, y + greetingLine / 2 - GREETING.gap / 2, { size: GREETING.size, family: fonts.text, color: COLORS.creamSoft });
    y += greetingLine;
  }
  writeLine(ctx, model.guestName.text, y + (nameSize * NAME.lineHeight) / 2, {
    size: nameSize,
    family: fonts.name,
    color: COLORS.gold,
    placeholder: model.guestName.isPlaceholder,
  });
  y += nameSize * NAME.lineHeight;
  if (model.greeting) {
    writeLine(ctx, model.greeting.followup, y + greetingLine / 2 + GREETING.gap / 2, { size: GREETING.size, family: fonts.text, color: COLORS.creamSoft });
    y += greetingLine;
  }
  y += TITLE.gapAbove;
  y += drawLines(ctx, title, y, { lineHeight: TITLE.lineHeight, family: fonts.text, color: COLORS.cream, placeholder: model.title.isPlaceholder });
  y += MESSAGE.gapAbove;
  y += drawLines(ctx, message, y, { lineHeight: MESSAGE.lineHeight, family: fonts.text, color: COLORS.creamSoft, placeholder: model.description.isPlaceholder });

  y += DETAILS.gapAbove;
  drawLine(ctx, INSET, y + DETAILS.rule / 2, CARD.width - INSET, y + DETAILS.rule / 2, COLORS.rule, DETAILS.rule);
  drawDetails(ctx, model.details, {
    left: INSET,
    width: TEXT_WIDTH,
    top: y + DETAILS.rule + DETAILS.paddingTop,
    family: fonts.text,
    label: DETAILS.label,
    value: DETAILS.value,
    gap: DETAILS.gap,
    padding: DETAILS.padding,
    colors: { label: COLORS.gold, value: COLORS.cream, divider: COLORS.rule },
  });

  return target;
}

export const gallery = {
  id: "gallery",
  copyKey: "designGallery",
  photo: "assets/wood-wall.webp",
  logo: "assets/laromious-logo-white.png",
  thumbnail: "assets/designs/gallery.webp",
  fonts: { name: "aref-ruqaa", text: "almarai" },
  render,
};

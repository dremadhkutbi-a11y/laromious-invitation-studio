/**
 * Navy Night: a navy card with a fine gold border, the photo framed
 * in gold above, gold name and white text below, and a gold-ruled strip for the
 * date, time and venue. Measurements are the approved prototype's, in pixels of the
 * 1080 × 1920 PNG.
 */
import { CARD, CENTER_X } from "../geometry.js";
import { cardCanvas, drawCentredImage, drawCoverClipped, drawLine, strokeBox, writeLine } from "../paint.js";
import { fitLine, fitParagraph, fitToHeight } from "../text-fit.js";
import { drawDetails, drawLines } from "./shared.js";

const COLORS = {
  ground: "#071f4c",
  gold: "#d5b552",
  white: "#ffffff",
  whiteSoft: "rgba(255, 255, 255, 0.72)",
  border: "rgba(213, 181, 82, 0.5)",
  strip: "rgba(213, 181, 82, 0.6)",
  divider: "rgba(213, 181, 82, 0.45)",
  photoGround: "#2b1b10",
};
const BORDER = { x: 40, y: 40, width: CARD.width - 80, height: CARD.height - 80 };
const FRAME = { x: 128, y: 116, width: CARD.width - 256, height: 768 };
const PHOTO = { x: 152, y: 140, width: CARD.width - 304, height: 720, focusX: 0.5, focusY: 0.4 };

const TEXT_TOP = 948;
const TEXT_WIDTH = CARD.width - 2 * 112;
const KICKER = { size: 30, lineHeight: 1.5 };
const GREETING = { size: 28, lineHeight: 1.5, gap: 6 };
const NAME = { maxSize: 92, minSize: 40, lineHeight: 1.3, gapAbove: 12 };
const RULE = { width: 112, gapAbove: 32 };
const TITLE = { maxSize: 38, minSize: 28, maxLines: 2, lineHeight: 1.6, gapAbove: 32 };
const MESSAGE = { maxSize: 30, minSize: 20, lineHeight: 1.6, gapAbove: 4 };

const STRIP = {
  bottom: 280,
  inset: 112,
  border: 2,
  padding: 28,
  // El Messiri's natural line height, as in the prototype.
  label: { size: 24, lineHeight: 1.565 },
  value: { maxSize: 28, minSize: 18, lineHeight: 1.5 },
  gap: 6,
  cellPadding: 16,
  // Space kept between the message and the strip.
  clearance: 36,
};
const STRIP_HEIGHT = 2 * (STRIP.border + STRIP.padding)
  + STRIP.label.size * STRIP.label.lineHeight + STRIP.gap + STRIP.value.maxSize * STRIP.value.lineHeight;
const STRIP_TOP = CARD.height - STRIP.bottom - STRIP_HEIGHT;
const LOGO = { bottom: 104, width: 224, alpha: 0.9 };

function render({ model, fonts, images, canvas }) {
  const target = cardCanvas(canvas);
  const ctx = target.getContext("2d");

  ctx.fillStyle = COLORS.ground;
  ctx.fillRect(0, 0, CARD.width, CARD.height);
  strokeBox(ctx, BORDER, COLORS.border);
  strokeBox(ctx, FRAME, COLORS.gold);
  ctx.fillStyle = COLORS.photoGround;
  ctx.fillRect(PHOTO.x, PHOTO.y, PHOTO.width, PHOTO.height);
  drawCoverClipped(ctx, images.photo, PHOTO);

  let y = TEXT_TOP;
  const kickerHeight = KICKER.size * KICKER.lineHeight;
  writeLine(ctx, model.kicker, y + kickerHeight / 2, { size: KICKER.size, family: fonts.text, color: COLORS.gold });
  y += kickerHeight;

  const greetingLine = GREETING.gap + GREETING.size * GREETING.lineHeight;
  if (model.greeting) {
    writeLine(ctx, model.greeting.prelude, y + greetingLine / 2 + GREETING.gap / 2, { size: GREETING.size, family: fonts.text, color: COLORS.whiteSoft });
    y += greetingLine;
  }

  const nameSize = fitLine(ctx, model.guestName.text, { maxWidth: TEXT_WIDTH, ...NAME, family: fonts.name, weight: fonts.nameWeight });
  y += NAME.gapAbove;
  writeLine(ctx, model.guestName.text, y + (nameSize * NAME.lineHeight) / 2, {
    size: nameSize,
    family: fonts.name,
    weight: fonts.nameWeight,
    color: COLORS.gold,
    placeholder: model.guestName.isPlaceholder,
  });
  y += nameSize * NAME.lineHeight;

  if (model.greeting) {
    writeLine(ctx, model.greeting.followup, y + greetingLine / 2 + GREETING.gap / 2, { size: GREETING.size, family: fonts.text, color: COLORS.whiteSoft });
    y += greetingLine;
  }

  y += RULE.gapAbove;
  drawLine(ctx, CENTER_X - RULE.width / 2, y + 1, CENTER_X + RULE.width / 2, y + 1, COLORS.strip);
  y += 2 + TITLE.gapAbove;

  const title = fitParagraph(ctx, model.title.text, { maxWidth: TEXT_WIDTH, ...TITLE, family: fonts.text });
  y += drawLines(ctx, title, y, { lineHeight: TITLE.lineHeight, family: fonts.text, color: COLORS.white, placeholder: model.title.isPlaceholder });

  y += MESSAGE.gapAbove;
  const message = fitToHeight(ctx, model.description.text, {
    maxWidth: TEXT_WIDTH,
    ...MESSAGE,
    maxHeight: STRIP_TOP - STRIP.clearance - y,
    family: fonts.text,
  });
  drawLines(ctx, message, y, { lineHeight: MESSAGE.lineHeight, family: fonts.text, color: COLORS.whiteSoft, placeholder: model.description.isPlaceholder });

  const strip = { x: STRIP.inset, y: STRIP_TOP, width: CARD.width - 2 * STRIP.inset, height: STRIP_HEIGHT };
  strokeBox(ctx, strip, COLORS.strip);
  drawDetails(ctx, model.details, {
    left: strip.x,
    width: strip.width,
    top: strip.y + STRIP.border + STRIP.padding,
    family: fonts.text,
    label: STRIP.label,
    value: STRIP.value,
    gap: STRIP.gap,
    padding: STRIP.cellPadding,
    colors: { label: COLORS.gold, value: COLORS.white, divider: COLORS.divider },
  });

  const { logo } = images;
  if (logo?.naturalWidth) {
    const height = LOGO.width * (logo.naturalHeight / logo.naturalWidth);
    drawCentredImage(ctx, logo, { top: CARD.height - LOGO.bottom - height, width: LOGO.width, alpha: LOGO.alpha });
  }

  return target;
}

export const night = {
  id: "night",
  copyKey: "designNight",
  photo: "assets/wood-wall.webp",
  logo: "assets/laromious-logo-white.png",
  thumbnail: "assets/designs/night.webp",
  fonts: { name: "el-messiri", text: "el-messiri" },
  weights: { name: 600 },
  render,
};

/** Canvas drawing primitives shared by every card design. */
import { CARD, CENTER_X } from "./geometry.js";
import { font } from "./text-fit.js";

/** A 1080 × 1920 canvas: the given one, cleared, or a new one. */
export function cardCanvas(target = document.createElement("canvas")) {
  target.width = CARD.width;
  target.height = CARD.height;
  return target;
}

/** Scales an image to cover the box, keeping the focal point (0–1 on each axis) in view. */
export function drawCover(ctx, image, { x, y, width, height, focusX, focusY }) {
  if (!image?.naturalWidth) return;
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawnWidth = image.naturalWidth * scale;
  const drawnHeight = image.naturalHeight * scale;
  ctx.drawImage(image, x + (width - drawnWidth) * focusX, y + (height - drawnHeight) * focusY, drawnWidth, drawnHeight);
}

/** drawCover, cut to the box. */
export function drawCoverClipped(ctx, image, box) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.width, box.height);
  ctx.clip();
  drawCover(ctx, image, box);
  ctx.restore();
}

export function drawLine(ctx, x1, y1, x2, y2, color, width = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/** A rectangle outline whose outer edge sits on the given box, like a CSS border. */
export function strokeBox(ctx, { x, y, width, height }, color, lineWidth = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(x + lineWidth / 2, y + lineWidth / 2, width - lineWidth, height - lineWidth);
}

/** Vertical gradient over the whole card from [offset, colour] stops. */
export function fillGradient(ctx, stops) {
  const gradient = ctx.createLinearGradient(0, 0, 0, CARD.height);
  for (const [offset, color] of stops) gradient.addColorStop(offset, color);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD.width, CARD.height);
}

/** Draws a loaded image scaled to `width`, centred horizontally, with its top at `top`. Returns its height. */
export function drawCentredImage(ctx, image, { top, width, alpha = 1 }) {
  if (!image?.naturalWidth) return 0;
  const height = width * (image.naturalHeight / image.naturalWidth);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(image, (CARD.width - width) / 2, top, width, height);
  ctx.restore();
  return height;
}

/**
 * One line of right-to-left text centred on (x, middle). Like a CSS line box, it
 * centres the font's ascent-to-descent span rather than its em box, which matters
 * for tall-shouldered Arabic faces. Placeholders draw at half strength.
 */
export function writeLine(ctx, text, middle, { size, family, color, weight = 400, x = CENTER_X, placeholder = false }) {
  ctx.save();
  ctx.font = font(size, family, weight);
  ctx.fillStyle = color;
  ctx.globalAlpha = placeholder ? 0.5 : 1;
  ctx.textAlign = "center";
  ctx.direction = "rtl";
  ctx.textBaseline = "middle";
  const { fontBoundingBoxAscent: ascent, fontBoundingBoxDescent: descent } = ctx.measureText(text);
  ctx.fillText(text, x, middle + ((ascent - descent) / 2 || 0));
  ctx.restore();
}

/** The classic design: photo above, white body below. Draws the PNG from the shared layout. */
import { CARD, CENTER_X, COLORS, DESCRIPTION, DETAILS, GREETING, HERO, KICKER, LOGO, TITLE } from "./geometry.js";
import { drawCover, drawLine } from "./paint.js";
import { font } from "./text-fit.js";

function drawHero(ctx, photo) {
  drawCover(ctx, photo, { x: 0, y: 0, width: CARD.width, height: HERO.height, focusX: HERO.focusX, focusY: HERO.focusY });
  const shade = ctx.createLinearGradient(0, 0, 0, HERO.height);
  for (const [offset, color] of HERO.shade) shade.addColorStop(offset, color);
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, CARD.width, HERO.height);
  // A covering photo overflows its box; paint the body over the overflow rather than
  // clipping, because a clip changes how the browser resamples the photo.
  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(0, HERO.height, CARD.width, CARD.height - HERO.height);
}

/**
 * @param {{ model: object, layout: object, fonts: { name: string, text: string },
 *           images: { photo: HTMLImageElement, logo: HTMLImageElement } }} card
 * @returns {HTMLCanvasElement}
 */
export function renderCardImage({ model, layout, fonts, images }) {
  const canvas = document.createElement("canvas");
  canvas.width = CARD.width;
  canvas.height = CARD.height;
  const ctx = canvas.getContext("2d");
  ctx.textAlign = "center";
  ctx.direction = "rtl";

  // Paper first, so a photo with transparency sits on white like the live card.
  ctx.fillStyle = COLORS.paper;
  ctx.fillRect(0, 0, CARD.width, CARD.height);
  drawHero(ctx, images.photo);

  const write = (text, y, { size, color, family = fonts.text, weight = 400, baseline = "alphabetic" }) => {
    ctx.font = font(size, family, weight);
    ctx.fillStyle = color;
    ctx.textBaseline = baseline;
    ctx.fillText(text, CENTER_X, y);
  };
  const ink = (field) => (field.isPlaceholder ? COLORS.muted : COLORS.ink);
  const writeLines = ({ lines, size, top }, lineHeight, color) => {
    lines.forEach((line, index) => write(line, top + (index + 0.5) * size * lineHeight, { size, color, baseline: "middle" }));
  };

  write(model.kicker, KICKER.baseline, { size: KICKER.size, color: COLORS.ink });

  if (model.greeting) {
    write(model.greeting.prelude, GREETING.preludeMiddle, { size: GREETING.size, color: COLORS.ink, baseline: "middle" });
    write(model.greeting.followup, layout.greeting.followupMiddle, { size: GREETING.size, color: COLORS.followup, weight: 500, baseline: "middle" });
  }
  write(model.guestName.text, layout.name.middle, { size: layout.name.size, color: ink(model.guestName), family: fonts.name, baseline: "middle" });

  writeLines(layout.title, TITLE.lineHeight, ink(model.title));
  writeLines(layout.description, DESCRIPTION.lineHeight, ink(model.description));

  const detailsTop = layout.details.top;
  const [dividerTop, dividerBottom] = DETAILS.dividerSpan;
  drawLine(ctx, DETAILS.ruleInset, detailsTop, CARD.width - DETAILS.ruleInset, detailsTop, COLORS.rule);
  for (const x of DETAILS.dividers) drawLine(ctx, x, detailsTop + dividerTop, x, detailsTop + dividerBottom, COLORS.divider);

  model.details.forEach((detail, index) => {
    const x = DETAILS.columns[index];
    ctx.textBaseline = "alphabetic";
    ctx.font = font(DETAILS.labelSize, fonts.text);
    ctx.fillStyle = COLORS.label;
    ctx.fillText(detail.label, x, detailsTop + DETAILS.labelBaseline);
    ctx.font = font(layout.details.valueSizes[index], fonts.text);
    ctx.fillStyle = ink(detail);
    ctx.fillText(detail.text, x, detailsTop + DETAILS.valueBaseline);
  });

  if (images.logo?.naturalWidth) {
    const height = LOGO.width * (images.logo.naturalHeight / images.logo.naturalWidth);
    ctx.drawImage(images.logo, (CARD.width - LOGO.width) / 2, LOGO.top, LOGO.width, height);
  }

  return canvas;
}

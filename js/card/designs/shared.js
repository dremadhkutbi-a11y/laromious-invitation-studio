/** Pieces shared by the designs drawn entirely on canvas. */
import { drawLine, writeLine } from "../paint.js";
import { fitLine } from "../text-fit.js";

/**
 * The date / time / venue row: three equal columns read right to left, a label above
 * each value and a hairline between columns. Values shrink to fit their column.
 *
 * @returns {number} the row's height
 */
export function drawDetails(ctx, details, row) {
  const { left, width, top, family, label, value, gap, padding, colors } = row;
  const column = width / details.length;
  const labelHeight = label.size * label.lineHeight;
  const valueHeight = value.maxSize * value.lineHeight;
  const contentHeight = labelHeight + gap + valueHeight;

  details.forEach((detail, index) => {
    const right = left + width - index * column;
    const centre = right - column / 2;
    if (index > 0) drawLine(ctx, right, top, right, top + contentHeight, colors.divider);
    writeLine(ctx, detail.label, top + labelHeight / 2, { size: label.size, family, color: colors.label, x: centre });
    const size = fitLine(ctx, detail.text, { maxWidth: column - 2 * padding, maxSize: value.maxSize, minSize: value.minSize, family });
    writeLine(ctx, detail.text, top + labelHeight + gap + valueHeight / 2, {
      size,
      family,
      color: colors.value,
      x: centre,
      placeholder: detail.isPlaceholder,
    });
  });
  return contentHeight;
}

/** Lines of text centred on the card, each in its own line box. Returns the block's height. */
export function drawLines(ctx, { lines, size }, top, { lineHeight, family, color, weight = 400, placeholder = false }) {
  const step = size * lineHeight;
  lines.forEach((line, index) => {
    writeLine(ctx, line, top + (index + 0.5) * step, { size, family, color, weight, placeholder });
  });
  return lines.length * step;
}

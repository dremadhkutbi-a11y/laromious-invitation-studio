/** Canvas text measurement: wrapping words and finding the largest size that fits. */
const ELLIPSIS = "…";

export function font(size, family, weight = 400) {
  return `${weight} ${size}px ${family}`;
}

/** Greedy word wrap. Past `maxLines`, the last kept line ends with an ellipsis. */
export function wrapWords(ctx, text, { maxWidth, size, family, maxLines = Infinity }) {
  const words = String(text ?? "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  ctx.font = font(size, family);
  ctx.direction = "rtl";
  const lines = [];
  let line = words[0];
  for (const word of words.slice(1)) {
    const candidate = `${line} ${word}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  lines.push(line);

  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1].replace(new RegExp(`${ELLIPSIS}$`), "")}${ELLIPSIS}`;
  return kept;
}

/** Largest size from maxSize down to minSize whose wrap fits in maxLines without truncation. */
export function fitParagraph(ctx, text, { maxWidth, maxSize, minSize, maxLines, family }) {
  for (let size = maxSize; size >= minSize; size -= 1) {
    const lines = wrapWords(ctx, text, { maxWidth, size, family, maxLines });
    if (!lines.at(-1)?.endsWith(ELLIPSIS)) return { size, lines };
  }
  return { size: minSize, lines: wrapWords(ctx, text, { maxWidth, size: minSize, family, maxLines }) };
}

/**
 * Largest size from maxSize down to minSize at which one line fits maxWidth.
 * Text still too wide at minSize (a very long name in a very wide font) is
 * scaled down further, just enough to fit.
 */
export function fitLine(ctx, text, { maxWidth, maxSize, minSize, family, weight = 400 }) {
  let size = maxSize;
  ctx.font = font(size, family, weight);
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 1;
    ctx.font = font(size, family, weight);
  }
  const width = ctx.measureText(text).width;
  if (width > maxWidth) size = Math.max(1, Math.floor((size * maxWidth) / width));
  return size;
}

/**
 * Largest size whose full wrap fits in maxHeight; at minSize, keeps as many lines as fit
 * and ends the last with an ellipsis.
 */
export function fitToHeight(ctx, text, { maxWidth, maxSize, minSize, lineHeight, maxHeight, family }) {
  for (let size = maxSize; size >= minSize; size -= 1) {
    const lines = wrapWords(ctx, text, { maxWidth, size, family });
    if (lines.length * size * lineHeight <= maxHeight) return { size, lines };
  }
  const maxLines = Math.max(1, Math.floor(maxHeight / (minSize * lineHeight)));
  return { size: minSize, lines: wrapWords(ctx, text, { maxWidth, size: minSize, family, maxLines }) };
}

/** How far the drawn glyphs reach below the line's centre. */
export function inkBelowMiddle(ctx, text, size, family) {
  ctx.font = font(size, family);
  ctx.textBaseline = "middle";
  const { actualBoundingBoxDescent } = ctx.measureText(text);
  ctx.textBaseline = "alphabetic";
  return actualBoundingBoxDescent;
}

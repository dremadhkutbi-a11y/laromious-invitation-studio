/**
 * Measures the card once and decides every size and position that depends on
 * the text. The preview and the PNG both render from this result, which is
 * what keeps them identical.
 *
 * Text flows top to bottom: the name block can push the title down, the title
 * pushes the message, and a long message pushes the details row (never past
 * DETAILS.maxTop, shrinking the message instead).
 */
import { DESCRIPTION, DETAILS, GREETING, NAME, TITLE } from "./geometry.js";
import { fitLine, fitParagraph, inkBelowMiddle, wrapWords } from "./text-fit.js";

let measuringContext;
function context() {
  measuringContext ??= document.createElement("canvas").getContext("2d");
  return measuringContext;
}

/** Largest message size that keeps the details row above DETAILS.maxTop; truncates only at the minimum size. */
function fitDescription(ctx, text, top, family) {
  const maxBottom = DETAILS.maxTop - DESCRIPTION.gapBelow;
  const { maxWidth, maxSize, minSize, lineHeight } = DESCRIPTION;
  for (let size = maxSize; size >= minSize; size -= 1) {
    const lines = wrapWords(ctx, text, { maxWidth, size, family });
    if (top + lines.length * size * lineHeight <= maxBottom) return { size, lines };
  }
  const maxLines = Math.max(1, Math.floor((maxBottom - top) / (minSize * lineHeight)));
  return { size: minSize, lines: wrapWords(ctx, text, { maxWidth, size: minSize, family, maxLines }) };
}

/**
 * @param {ReturnType<import("./model.js").buildCardModel>} model
 * @param {{ name: string, text: string }} fonts CSS font-family stacks
 */
export function computeLayout(model, fonts) {
  const ctx = context();

  const nameText = model.guestName.text;
  const nameSize = fitLine(ctx, nameText, { ...NAME, family: fonts.name });
  const nameMiddle = model.greeting ? NAME.middle.greeting : NAME.middle.standalone;
  const nameInkBottom = nameMiddle + inkBelowMiddle(ctx, nameText, nameSize, fonts.name);
  const followupMiddle = Math.max(GREETING.followupMiddle, nameInkBottom + NAME.clearance + GREETING.size / 2);
  const nameBlockBottom = model.greeting ? followupMiddle + GREETING.size / 2 : nameInkBottom;

  const titleTop = Math.max(TITLE.top, nameBlockBottom + TITLE.clearance);
  const title = fitParagraph(ctx, model.title.text, { ...TITLE, family: fonts.text });

  const descriptionTop = titleTop + title.lines.length * title.size * TITLE.lineHeight + TITLE.gapBelow;
  const description = fitDescription(ctx, model.description.text, descriptionTop, fonts.text);
  const descriptionBottom = descriptionTop + description.lines.length * description.size * DESCRIPTION.lineHeight;

  return {
    name: { size: nameSize, middle: nameMiddle },
    greeting: { followupMiddle },
    title: { top: titleTop, ...title },
    description: { top: descriptionTop, ...description },
    details: {
      top: Math.max(DETAILS.top, descriptionBottom + DESCRIPTION.gapBelow),
      valueSizes: model.details.map(({ text }) => fitLine(ctx, text, { ...DETAILS.value, family: fonts.text })),
    },
  };
}

/**
 * Classic: the original design, photo above and white body below.
 * Its live preview is real markup (js/card/preview.js) kept in step with the PNG by
 * the shared layout; the other designs preview by drawing the PNG itself.
 */
import { renderCardImage } from "../canvas.js";
import { computeLayout } from "../layout.js";

export const classic = {
  id: "classic",
  copyKey: "designClassic",
  photo: "assets/wood-wall.webp",
  thumbnail: "assets/designs/classic.webp",
  fonts: { name: null, text: null },
  livePreview: "markup",
  render: ({ model, fonts, images }) => renderCardImage({ model, fonts, images, layout: computeLayout(model, fonts) }),
};

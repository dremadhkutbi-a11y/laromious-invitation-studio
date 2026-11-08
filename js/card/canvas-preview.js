/**
 * The live card for designs drawn only on canvas: the preview is the PNG itself,
 * redrawn on every change, so it cannot drift from the download.
 */
import { cardCanvas } from "./paint.js";

export function createCanvasPreview(canvas) {
  let pulseFrame;

  /** The same brief glow as the markup card (js/card/preview.js). */
  function pulse() {
    cancelAnimationFrame(pulseFrame);
    pulseFrame = requestAnimationFrame(() => {
      canvas.classList.remove("is-updating");
      void canvas.offsetWidth; // Restart the animation.
      canvas.classList.add("is-updating");
    });
  }

  function render(design, { model, fonts, images }) {
    design.render({ model, fonts, images, canvas });
    pulse();
  }

  /** A static copy for the review dialog. */
  function snapshot() {
    const copy = cardCanvas();
    copy.className = canvas.className;
    copy.classList.remove("is-updating");
    copy.setAttribute("role", "img");
    copy.setAttribute("aria-label", canvas.getAttribute("aria-label") ?? "");
    copy.getContext("2d").drawImage(canvas, 0, 0);
    return copy;
  }

  return { render, snapshot, element: canvas };
}

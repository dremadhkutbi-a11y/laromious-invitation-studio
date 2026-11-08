/**
 * The live card in the page. Text goes into the card's [data-slot] elements;
 * sizes and positions come from the shared layout as CSS custom properties in
 * container-query units, so the card scales to any width (including the
 * enlarged copy in the review dialog) without re-measuring.
 */
import { BODY_TOP, CARD, GREETING, NAME } from "./geometry.js";

const toCqw = (pixels) => `${((pixels / CARD.width) * 100).toFixed(3)}cqw`;
const belowBodyTop = (pixels) => toCqw(pixels - BODY_TOP);
/** Top of a line box whose centre sits where the PNG draws that line. */
const lineTop = (middle, size, lineHeight) => belowBodyTop(middle - (size * lineHeight) / 2);

function fill(element, field) {
  element.textContent = field.text;
  element.classList.toggle("is-placeholder", field.isPlaceholder);
}

export function createCardPreview(card) {
  const slot = (name) => card.querySelector(`[data-slot="${name}"]`);
  const slots = {
    kicker: slot("kicker"),
    invitee: slot("invitee"),
    prelude: slot("prelude"),
    guestName: slot("guest-name"),
    followup: slot("followup"),
    title: slot("title"),
    description: slot("description"),
    photo: slot("photo"),
    logo: slot("logo"),
    details: [...card.querySelectorAll('[data-slot="detail"]')].map((detail) => ({
      element: detail,
      label: detail.querySelector('[data-slot="detail-label"]'),
      value: detail.querySelector('[data-slot="detail-value"]'),
    })),
  };
  let pulseFrame;

  /** A brief glow that acknowledges each change. */
  function pulse() {
    cancelAnimationFrame(pulseFrame);
    pulseFrame = requestAnimationFrame(() => {
      card.classList.remove("is-updating");
      void card.offsetWidth; // Restart the animation.
      card.classList.add("is-updating");
    });
  }

  function render(model, layout, fonts) {
    slots.kicker.textContent = model.kicker;
    slots.invitee.classList.toggle("is-greeting", Boolean(model.greeting));
    slots.prelude.textContent = model.greeting?.prelude ?? "";
    slots.followup.textContent = model.greeting?.followup ?? "";
    fill(slots.guestName, model.guestName);
    // One DOM line per measured line, so both renderers break text identically.
    fill(slots.title, { text: layout.title.lines.join("\n"), isPlaceholder: model.title.isPlaceholder });
    fill(slots.description, { text: layout.description.lines.join("\n"), isPlaceholder: model.description.isPlaceholder });

    model.details.forEach((detail, index) => {
      const { element, label, value } = slots.details[index];
      label.textContent = detail.label;
      fill(value, detail);
      element.style.setProperty("--value-size", toCqw(layout.details.valueSizes[index]));
    });

    const style = card.style;
    style.setProperty("--font-card", fonts.text);
    style.setProperty("--font-name", fonts.name);
    style.setProperty("--name-size", toCqw(layout.name.size));
    style.setProperty("--name-top", lineTop(layout.name.middle, layout.name.size, NAME.lineHeight));
    style.setProperty("--prelude-top", lineTop(GREETING.preludeMiddle, GREETING.size, GREETING.lineHeight));
    style.setProperty("--followup-top", lineTop(layout.greeting.followupMiddle, GREETING.size, GREETING.lineHeight));
    style.setProperty("--title-top", belowBodyTop(layout.title.top));
    style.setProperty("--title-size", toCqw(layout.title.size));
    style.setProperty("--description-top", belowBodyTop(layout.description.top));
    style.setProperty("--description-size", toCqw(layout.description.size));
    style.setProperty("--details-top", belowBodyTop(layout.details.top));
    pulse();
  }

  /** A static copy for the review dialog; slots are not cloned as live references. */
  function snapshot() {
    const copy = card.cloneNode(true);
    copy.removeAttribute("id");
    return copy;
  }

  return { render, pulse, snapshot, element: card, photo: slots.photo, logo: slots.logo };
}

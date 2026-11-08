/** The design choice at the top of the editor: one picture tile per design. */
import { DESIGNS } from "../card/designs/index.js";
import { t } from "../i18n/index.js";

/**
 * @param {{ container: HTMLElement, selected: string, onSelect: (id: string) => void }} options
 */
export function createDesignPicker({ container, selected, onSelect }) {
  const options = DESIGNS.map((design) => {
    const option = document.createElement("label");
    option.className = "design-option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "design";
    input.value = design.id;
    input.checked = design.id === selected;

    const thumbnail = document.createElement("img");
    thumbnail.className = "design-thumb";
    thumbnail.src = design.thumbnail;
    thumbnail.alt = "";

    const name = document.createElement("span");
    name.className = "design-name";
    name.dataset.i18n = design.copyKey;
    name.textContent = t(design.copyKey);

    const mark = document.createElement("span");
    mark.className = "radio-mark";
    mark.setAttribute("aria-hidden", "true");

    option.append(input, thumbnail, name, mark);
    return option;
  });

  container.replaceChildren(...options);
  container.addEventListener("change", (event) => {
    if (event.target.name === "design") onSelect(event.target.value);
  });
}

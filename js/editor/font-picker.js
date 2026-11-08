/**
 * A collapsible list of fonts, grouped by style. The closed list shows the
 * current choice written in that font; fonts inside a closed list are never
 * downloaded, because nothing renders with them.
 */
import { FONTS, FONT_GROUPS, findFont, fontStack } from "../fonts.js";
import { t } from "../i18n/index.js";

const GROUP_COPY = { modern: "fontGroupModern", classic: "fontGroupClassic", decorative: "fontGroupDecorative" };

function element(tag, className, attributes = {}) {
  const node = document.createElement(tag);
  node.className = className;
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  return node;
}

function fontLabel(font) {
  return font.family ?? t("fontDefault");
}

/**
 * @param {{ name: string, container: HTMLElement, current: HTMLElement, sample: string,
 *           selected: string, onSelect: (id: string) => void }} options
 */
export function createFontPicker({ name, container, current, sample, selected, onSelect }) {
  function option(font) {
    const label = element("label", "font-option");
    const input = element("input", "", { type: "radio", name, value: font.id });
    input.checked = font.id === selected;

    const preview = element("span", "font-option-sample", { "aria-hidden": "true" });
    preview.style.setProperty("--option-font", fontStack(font));
    preview.textContent = sample;

    const caption = element("span", "font-option-name");
    caption.textContent = fontLabel(font);
    if (!font.family) caption.dataset.i18n = "fontDefault";

    label.append(input, preview, caption, element("span", "radio-mark", { "aria-hidden": "true" }));
    return label;
  }

  function group(id) {
    const section = element("div", "font-group");
    const title = element("p", "font-group-title", { "data-i18n": GROUP_COPY[id] });
    title.textContent = t(GROUP_COPY[id]);
    const grid = element("div", "font-options");
    grid.append(...FONTS.filter((font) => font.group === id).map(option));
    section.append(title, grid);
    return section;
  }

  /** Re-reads translated text: the current choice may be the localized "Default". */
  function refresh() {
    const font = findFont(selected);
    current.textContent = fontLabel(font);
    current.style.setProperty("--option-font", fontStack(font));
  }

  container.replaceChildren(...FONT_GROUPS.map(group));
  container.addEventListener("change", (event) => {
    if (event.target.name !== name) return;
    selected = event.target.value;
    refresh();
    onSelect(selected);
  });
  refresh();

  return { refresh };
}

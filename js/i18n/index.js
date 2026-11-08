/**
 * Interface translation. Markup declares what it needs and this module fills it in:
 *
 *   data-i18n="key"             → text content
 *   data-i18n-placeholder="key" → placeholder attribute
 *   data-i18n-label="key"       → aria-label attribute
 *   data-i18n-endonym="lang"    → that language's own name (for the language switch)
 */
import * as ar from "./ar.js";
import * as en from "./en.js";

const LOCALES = { ar, en };
const DIRECTION = { ar: "rtl", en: "ltr" };
const FALLBACK = "en";

let current = "ar";

export function getLanguage() {
  return current;
}

export function setLanguage(language) {
  if (!(language in LOCALES)) return;
  current = language;
  document.documentElement.lang = language;
  document.documentElement.dir = DIRECTION[language];
}

export function t(key) {
  return LOCALES[current].ui[key] ?? LOCALES[FALLBACK].ui[key] ?? key;
}

export function translatePage(root = document) {
  for (const element of root.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }
  for (const element of root.querySelectorAll("[data-i18n-placeholder]")) {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  }
  for (const element of root.querySelectorAll("[data-i18n-label]")) {
    element.setAttribute("aria-label", t(element.dataset.i18nLabel));
  }
  for (const element of root.querySelectorAll("[data-i18n-endonym]")) {
    element.textContent = LOCALES[element.dataset.i18nEndonym].ui.languageName;
  }
}

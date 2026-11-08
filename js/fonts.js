/**
 * The fonts offered for the card. Each family is self-hosted under assets/fonts
 * and declared in css/fonts.css, split into an Arabic and a Latin file.
 * "default" uses the platform's Arabic system fonts. `weights` lists the faces
 * a family ships when it has more than the regular one.
 */
const SYSTEM_STACK = '"New Peninim MT", "Nadeem", "Geeza Pro", "SF Arabic", "Noto Sans Arabic", Tahoma, Arial, sans-serif';

export const FONT_GROUPS = ["modern", "classic", "decorative"];

export const FONTS = Object.freeze([
  { id: "default", family: null, group: "modern" },
  { id: "almarai", family: "Almarai", group: "modern" },
  { id: "tajawal", family: "Tajawal", group: "modern" },
  { id: "ibm-plex-sans-arabic", family: "IBM Plex Sans Arabic", group: "modern" },
  { id: "readex-pro", family: "Readex Pro", group: "modern" },
  { id: "alexandria", family: "Alexandria", group: "modern" },
  { id: "noto-kufi-arabic", family: "Noto Kufi Arabic", group: "modern" },
  { id: "cairo", family: "Cairo", group: "modern" },
  { id: "changa", family: "Changa", group: "modern" },
  { id: "rubik", family: "Rubik", group: "modern" },
  { id: "noto-sans-arabic", family: "Noto Sans Arabic", group: "modern" },
  { id: "mada", family: "Mada", group: "modern" },
  { id: "beiruti", family: "Beiruti", group: "modern" },
  { id: "amiri", family: "Amiri", group: "classic" },
  { id: "el-messiri", family: "El Messiri", group: "classic", weights: [400, 600] },
  { id: "aref-ruqaa", family: "Aref Ruqaa", group: "classic" },
  { id: "markazi-text", family: "Markazi Text", group: "classic" },
  { id: "noto-naskh-arabic", family: "Noto Naskh Arabic", group: "classic" },
  { id: "scheherazade-new", family: "Scheherazade New", group: "classic" },
  { id: "lateef", family: "Lateef", group: "classic" },
  { id: "reem-kufi", family: "Reem Kufi", group: "classic" },
  { id: "lalezar", family: "Lalezar", group: "decorative" },
  { id: "lemonada", family: "Lemonada", group: "decorative" },
  { id: "marhey", family: "Marhey", group: "decorative" },
  { id: "kufam", family: "Kufam", group: "decorative" },
  { id: "rakkas", family: "Rakkas", group: "decorative" },
]);

// One character from each @font-face unicode-range, so loading fetches both files.
const SUBSET_PROBES = ["\u0627", "A"];

export function findFont(id) {
  return FONTS.find((font) => font.id === id) ?? FONTS[0];
}

export function fontStack(font) {
  return font.family ? `"${font.family}", ${SYSTEM_STACK}` : SYSTEM_STACK;
}

/**
 * Canvas text never waits for web fonts, so anything measured or drawn on a
 * canvas must wait for this first. Failures resolve quietly to the fallback stack.
 */
export function loadFonts(...fonts) {
  const loads = fonts
    .filter((font) => font.family && document.fonts?.load)
    .flatMap((font) =>
      fontWeights(font).flatMap((weight) => SUBSET_PROBES.map((probe) => document.fonts.load(`${weight} 32px "${font.family}"`, probe))),
    );
  return Promise.all(loads).catch(() => {});
}

export function fontWeights(font) {
  return font.weights ?? [400];
}

/** Remembers each font choice in this browser. Storage can be blocked (private mode); choices then last one visit. */
export const fontPreference = {
  read(key) {
    try {
      return findFont(window.localStorage.getItem(key)).id;
    } catch {
      return FONTS[0].id;
    }
  },
  save(key, id) {
    try {
      window.localStorage.setItem(key, id);
    } catch {
      // Not persisted; the choice still applies until the page closes.
    }
  },
};

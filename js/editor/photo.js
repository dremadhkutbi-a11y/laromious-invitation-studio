/**
 * The card photo: upload a replacement or return to the default.
 * Uploads are read through a local object URL and never leave the device.
 */
import { t } from "../i18n/index.js";

/**
 * @param {{ input: HTMLInputElement, uploadButton: HTMLButtonElement, resetButton: HTMLButtonElement,
 *           thumbnail: HTMLImageElement, nameLabel: HTMLElement, defaultSource: string,
 *           onChange: (source: string) => void, onError: (message: string) => void }} options
 */
export function createPhotoPicker({ input, uploadButton, resetButton, thumbnail, nameLabel, defaultSource, onChange, onError }) {
  const acceptedTypes = input.accept.split(",").map((type) => type.trim());
  let uploaded = null; // { url, name } while a custom photo is in use

  function refresh() {
    nameLabel.textContent = uploaded?.name ?? t("photoDefault");
    resetButton.hidden = !uploaded;
  }

  function show(source) {
    thumbnail.src = source;
    refresh();
    onChange(source);
  }

  function use(file) {
    if (!file) return;
    if (!acceptedTypes.includes(file.type)) {
      onError(t("photoError"));
      return;
    }
    const url = URL.createObjectURL(file);
    const probe = new Image();
    probe.onload = () => {
      if (uploaded) URL.revokeObjectURL(uploaded.url);
      uploaded = { url, name: file.name };
      show(url);
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      onError(t("photoError"));
    };
    probe.src = url;
  }

  function useDefault() {
    if (uploaded) URL.revokeObjectURL(uploaded.url);
    uploaded = null;
    input.value = "";
    show(defaultSource);
    uploadButton.focus();
  }

  uploadButton.addEventListener("click", () => input.click());
  input.addEventListener("change", () => use(input.files[0]));
  resetButton.addEventListener("click", useDefault);
  refresh();

  return { refresh };
}

/**
 * Laromious Invitation Studio: builds a personalised Arabic invitation card
 * and downloads it as a 1080 × 1920 PNG, entirely in the browser.
 *
 * Data flow, one direction:
 *
 *   form ─▶ state ─▶ buildCardModel ─▶ computeLayout ─┬─▶ live preview (DOM)
 *                                                    └─▶ PNG export (canvas)
 */
import { renderCardImage } from "./card/canvas.js";
import { computeLayout } from "./card/layout.js";
import { buildCardModel } from "./card/model.js";
import { createCardPreview } from "./card/preview.js";
import { createFontPicker } from "./editor/font-picker.js";
import { createPhotoPicker } from "./editor/photo.js";
import { FIELDS, validate, validateField } from "./editor/validation.js";
import { findFont, fontPreference, fontStack, loadFonts } from "./fonts.js";
import { card as cardCopy } from "./i18n/ar.js";
import { getLanguage, setLanguage, t, translatePage } from "./i18n/index.js";
import { formatEditorDate, formatEditorTime } from "./lib/datetime.js";
import { invitationFileName } from "./lib/filename.js";

const TOAST_DURATION_MS = 4200;
const ERROR_COPY = { required: "errorRequired", invalidDate: "errorDate", invalidTime: "errorTime" };
const FONT_ROLES = {
  nameFont: { storageKey: "laromious.nameFont", sample: cardCopy.placeholders.guestName },
  textFont: { storageKey: "laromious.textFont", sample: cardCopy.kicker },
};

const $ = (id) => document.getElementById(id);

const ui = {
  form: $("invitationForm"),
  /** Text inputs keyed by the state field they edit. */
  fields: {
    eventTitle: $("eventTitle"),
    eventDescription: $("eventDescription"),
    eventDate: $("eventDateText"),
    eventTime: $("eventTimeText"),
    guestName: $("guestName"),
  },
  descriptionCount: $("descriptionCount"),
  venueName: $("venueName"),
  previewButton: $("previewButton"),
  downloadButton: $("downloadButton"),
  resetButton: $("resetButton"),
  dialog: $("previewDialog"),
  dialogStage: $("dialogPreviewStage"),
  dialogClose: $("closePreviewButton"),
  dialogEdit: $("dialogEditButton"),
  dialogDownload: $("dialogDownloadButton"),
  toast: $("toast"),
  toastMessage: $("toastMessage"),
};

const state = {
  eventTitle: "",
  eventDescription: "",
  eventDate: "",
  eventTime: "",
  guestName: "",
  nameStyle: "standalone",
  nameFont: fontPreference.read(FONT_ROLES.nameFont.storageKey),
  textFont: fontPreference.read(FONT_ROLES.textFont.storageKey),
};

const preview = createCardPreview($("invitationPreview"));
const fieldErrors = new Map();
/** Downloading unlocks once the finished card has been reviewed, and locks again on any edit. */
let isReviewed = false;
let toastTimer;

// ── Card ────────────────────────────────────────────────────────────────────

function cardFonts() {
  return { name: fontStack(findFont(state.nameFont)), text: fontStack(findFont(state.textFont)) };
}

function composeCard() {
  const model = buildCardModel(state);
  const fonts = cardFonts();
  return { model, fonts, layout: computeLayout(model, fonts) };
}

function renderPreview() {
  const { model, layout, fonts } = composeCard();
  preview.render(model, layout, fonts);
  preview.element.setAttribute("aria-label", `${state.eventTitle || t("previewTitle")} — ${state.guestName || t("previewGuest")}`);
}

async function imagesReady(...images) {
  await Promise.all(images.map((image) => (image.complete && image.naturalWidth ? null : image.decode().catch(() => {}))));
}

function saveFile(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: fileName });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportCard() {
  await Promise.all([loadFonts(findFont(state.nameFont), findFont(state.textFont)), imagesReady(preview.photo, preview.logo)]);
  const canvas = renderCardImage({ ...composeCard(), images: { photo: preview.photo, logo: preview.logo } });
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("PNG encoding failed");
  saveFile(blob, invitationFileName(state.guestName));
}

async function runExport(button, { closeDialog }) {
  button.disabled = true;
  try {
    await exportCard();
    showToast(t("downloadSuccess"));
    if (closeDialog) closeReview();
  } catch {
    showToast(t("downloadError"));
  } finally {
    button.disabled = false;
  }
}

// ── Editor feedback ─────────────────────────────────────────────────────────

function showToast(message) {
  clearTimeout(toastTimer);
  ui.toastMessage.textContent = message;
  ui.toast.classList.add("is-visible");
  toastTimer = setTimeout(() => ui.toast.classList.remove("is-visible"), TOAST_DURATION_MS);
}

function showFieldError(field, error) {
  if (error) fieldErrors.set(field, error);
  else fieldErrors.delete(field);
  ui.fields[field].setAttribute("aria-invalid", String(Boolean(error)));
  $(`${field}Error`).textContent = error ? t(ERROR_COPY[error]) : "";
}

/** Validates every field and shows the result; returns the errors in form order. */
function validateForm() {
  const errors = validate(state);
  for (const field of FIELDS) showFieldError(field, errors.get(field));
  return errors;
}

function reportErrors(errors) {
  const [firstInvalid] = errors.keys();
  ui.fields[firstInvalid].focus();
  showToast(t("genericError"));
}

function updateCounter() {
  const { value, maxLength } = ui.fields.eventDescription;
  ui.descriptionCount.textContent = `${value.length} / ${maxLength}`;
}

function setReviewed(reviewed) {
  isReviewed = reviewed;
  ui.downloadButton.disabled = !reviewed;
  ui.downloadButton.setAttribute("aria-disabled", String(!reviewed));
}

/** Any change to the card invalidates the last review. */
function cardChanged() {
  setReviewed(false);
  if (ui.dialog.open) ui.dialog.close();
  renderPreview();
}

function editField(field, value) {
  state[field] = value;
  // Errors clear as soon as the field becomes valid, but new ones wait for review.
  if (!validateField(field, value)) showFieldError(field, null);
  cardChanged();
}

// ── Review dialog ───────────────────────────────────────────────────────────

function openReview() {
  const errors = validateForm();
  if (errors.size) {
    reportErrors(errors);
    return;
  }
  setReviewed(true);
  ui.dialogStage.replaceChildren(preview.snapshot());
  ui.dialog.showModal();
  requestAnimationFrame(() => ui.dialogClose.focus());
}

function closeReview() {
  if (ui.dialog.open) ui.dialog.close();
  requestAnimationFrame(() => ui.previewButton.focus());
}

// ── Form ────────────────────────────────────────────────────────────────────

function resetForm() {
  if (!window.confirm(t("resetConfirm"))) return;
  for (const [field, input] of Object.entries(ui.fields)) {
    input.value = "";
    state[field] = "";
    showFieldError(field, null);
  }
  $("eventDatePicker").value = "";
  $("eventTimePicker").value = "";
  state.nameStyle = "standalone";
  ui.form.elements.nameStyle.value = "standalone";
  updateCounter();
  cardChanged();
}

/** The native date/time pickers fill the matching text field in the interface language. */
function bindNativePicker({ picker, openButton, field, format }) {
  openButton.addEventListener("click", () => (picker.showPicker ? picker.showPicker() : picker.click()));
  picker.addEventListener("change", () => {
    ui.fields[field].value = format(picker.value, getLanguage());
    editField(field, picker.value);
  });
  // Typing replaces the picked value, so a language switch never rewrites typed text.
  ui.fields[field].addEventListener("input", () => {
    picker.value = "";
  });
  return () => {
    if (picker.value) ui.fields[field].value = format(picker.value, getLanguage());
  };
}

const fieldByInput = new Map(Object.entries(ui.fields).map(([field, input]) => [input, field]));

ui.form.addEventListener("input", (event) => {
  const field = fieldByInput.get(event.target);
  if (!field) return;
  if (field === "eventDescription") updateCounter();
  editField(field, event.target.value);
});

ui.form.addEventListener("change", (event) => {
  if (event.target.name !== "nameStyle") return;
  state.nameStyle = event.target.value;
  cardChanged();
});

ui.form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isReviewed) {
    openReview();
    return;
  }
  const errors = validateForm();
  if (errors.size) reportErrors(errors);
  else runExport(ui.downloadButton, { closeDialog: false });
});

ui.resetButton.addEventListener("click", resetForm);
ui.previewButton.addEventListener("click", openReview);
ui.dialogClose.addEventListener("click", closeReview);
ui.dialogEdit.addEventListener("click", closeReview);
ui.dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeReview();
});
ui.dialogDownload.addEventListener("click", () => {
  if (isReviewed) runExport(ui.dialogDownload, { closeDialog: true });
});

const refreshPickedValues = [
  bindNativePicker({ picker: $("eventDatePicker"), openButton: $("openDatePicker"), field: "eventDate", format: formatEditorDate }),
  bindNativePicker({ picker: $("eventTimePicker"), openButton: $("openTimePicker"), field: "eventTime", format: formatEditorTime }),
];

const photoPicker = createPhotoPicker({
  input: $("photoInput"),
  uploadButton: $("photoUploadButton"),
  resetButton: $("photoResetButton"),
  thumbnail: $("photoThumb"),
  nameLabel: $("photoName"),
  defaultSource: preview.photo.getAttribute("src"),
  onChange(source) {
    preview.photo.src = source;
    cardChanged();
  },
  onError: showToast,
});

const fontPickers = Object.entries(FONT_ROLES).map(([role, { storageKey, sample }]) =>
  createFontPicker({
    name: role,
    container: $(`${role}Options`),
    current: $(`${role}Current`),
    sample,
    selected: state[role],
    async onSelect(id) {
      state[role] = id;
      fontPreference.save(storageKey, id);
      setReviewed(false);
      // Measure only once the new font has loaded; a newer choice may win the race.
      await loadFonts(findFont(id));
      if (state[role] === id) cardChanged();
    },
  }),
);

// ── Language ────────────────────────────────────────────────────────────────

function applyLanguage(language) {
  setLanguage(language);
  translatePage();
  for (const button of document.querySelectorAll("[data-language]")) {
    const isActive = button.dataset.language === language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
  for (const refresh of refreshPickedValues) refresh();
  for (const [field, error] of fieldErrors) showFieldError(field, error);
  photoPicker.refresh();
  for (const picker of fontPickers) picker.refresh();
  renderPreview();
}

for (const button of document.querySelectorAll("[data-language]")) {
  button.addEventListener("click", () => applyLanguage(button.dataset.language));
}

// ── Start ───────────────────────────────────────────────────────────────────

ui.venueName.textContent = cardCopy.venue;
updateCounter();
applyLanguage(getLanguage());
document.documentElement.classList.remove("is-booting");
// The first render used fallback metrics if a saved web font was still loading.
loadFonts(findFont(state.nameFont), findFont(state.textFont)).then(renderPreview);

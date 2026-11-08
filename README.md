# Laromious Invitation Studio

A branded invitation card generator for Laromious Boutique. Pick a design, fill
in the event, the guest's name and a photo, choose the fonts, and download a
personalised Arabic invitation as a 1080 × 1920 PNG.

Everything runs in the browser. Names, event details and photos never leave the
device: there is no server, no build step and no dependency.

## Run it

Any static file server works. With Python:

```bash
npm start            # python3 -m http.server 5173
```

Then open <http://localhost:5173>. Opening `index.html` straight from disk does
not work: browsers block ES modules on `file://`.

## Designs

The editor opens with a choice of three designs. Every design draws the same
card model, so switching keeps everything typed in.

| Design | Module | Look | Fonts on "Default" |
| --- | --- | --- | --- |
| Classic | `js/card/designs/classic.js` | Photo above, white body below | System Arabic fonts |
| Gallery | `js/card/designs/gallery.js` | Full-bleed photo, dark shade, cream and gold text | Aref Ruqaa name, Almarai text |
| Navy Night | `js/card/designs/night.js` | Navy card, gold-framed photo, ruled details strip | El Messiri (name in 600) |

Each design brings its own default photo; an uploaded photo stays across
designs. The font pickers work the same in every design: a font picked by hand
always wins, and "Default" means the design's own font.

To add a design: write a module exporting `{ id, copyKey, photo, thumbnail,
fonts, render }` (see `js/card/designs/index.js`), add it to `DESIGNS`, name it
in both locale files, add a thumbnail to `assets/designs/`, and add the module to
the import map.

## How it works

The editor state flows one way into the chosen design:

```
form ─▶ state ─▶ buildCardModel ─▶ design ─┬─▶ live preview
                                           └─▶ PNG export (canvas)
```

The classic design previews as live markup. Its preview and PNG share a single
measured layout, so they match down to the line breaks:

| Stage | Module | Responsibility |
| --- | --- | --- |
| Model | `js/card/model.js` | What the card says: placeholders, parsed dates, the greeting |
| Layout | `js/card/layout.js` | Measures text on a canvas; decides every size and position |
| Preview | `js/card/preview.js` | Writes the layout into the page as container-query units |
| Export | `js/card/canvas.js` | Draws the same layout into the 1080 × 1920 canvas |

Gallery and Navy Night are drawn only on canvas (`js/card/paint.js` holds the
shared drawing primitives), and their preview is that same canvas, redrawn on
every change, so it cannot drift from the download.

All coordinates are pixels of the exported PNG, defined once in
`js/card/geometry.js`. The preview converts them to `cqw` (100cqw = 1080px), so
the card scales to any width without re-measuring.

In the classic design, text flows top to bottom. A tall name (some fonts draw deep tails) pushes the
title down; the title pushes the message; a long message pushes the details row,
which never moves past the logo. The message shrinks to fit instead.

## Project layout

```
index.html              Markup only; every visible string comes from js/i18n
css/app.css             Interface and card styles
css/fonts.css           @font-face rules for the self-hosted card fonts
assets/                 Photos, logos, design thumbnails and fonts (each font folder holds its OFL licence)
js/main.js              Entry point: state, events, review dialog, download
js/card/                The card: geometry, model, text fitting, layout, preview, renderers
js/card/designs/        One module per design, plus the registry
js/editor/              Design and font pickers, photo upload, form validation
js/fonts.js             The font catalogue, loading and remembered choices
js/i18n/                Translation (ar.js holds every Arabic string in the app)
js/lib/                 Date and time parsing, download file names (Arabic)
tests/                  Unit tests for the DOM-free modules
scripts/                Release tooling
```

## Language

The editor switches between Arabic and English; the card itself is always
Arabic. Markup only declares keys (`data-i18n`, `data-i18n-placeholder`,
`data-i18n-label`) and `js/i18n/index.js` fills them in. All Arabic text, from
interface copy to the card's wording and the word that starts every download's
file name, lives in `js/i18n/ar.js`.

Downloads are named in Arabic after the guest, exactly as typed (for example
the Arabic for "Invitation Sara Ali.png"), with only characters that file
systems reject removed.

## Fonts

Twenty-five Arabic families plus the system default, offered separately for the
guest name and for the rest of the card. Each family is split into an Arabic and
a Latin `woff2` by `unicode-range`, and a closed font list downloads nothing.

To add a font: put its Arabic and Latin `woff2` files and licence in
`assets/fonts/<id>/`, declare both in `css/fonts.css`, and add an entry to
`FONTS` in `js/fonts.js`.

## Tests

```bash
npm test
```

Runs the unit tests with Node's built-in test runner (Node 20+). They cover
date and time parsing in Latin and Arabic-Indic digits, Arabic AM/PM words, file
naming, form validation and how designs resolve their fonts.

## Publishing

The site is served by GitHub Pages from `main`. Before publishing, give every
asset a fresh version so browsers fetch the new files instead of cached ones:

```bash
npm run stamp
```

This rewrites the `?v=` on the stylesheets, the entry module and every module in
the import map in `index.html`. When adding a module, add it to the import map
too.

/**
 * Stamps one fresh cache-busting version onto every asset URL in index.html
 * (stylesheets, the entry module and the import map). Run before publishing:
 *
 *   npm run stamp
 */
import { readFileSync, writeFileSync } from "node:fs";

const page = new URL("../index.html", import.meta.url);
const version = new Date().toISOString().replace(/\D/g, "").slice(0, 12);

const html = readFileSync(page, "utf8");
const stamped = html.replace(/\?v=\w+/g, `?v=${version}`);
writeFileSync(page, stamped);

const count = html.match(/\?v=\w+/g)?.length ?? 0;
console.log(`Stamped ${count} asset URLs with v=${version}`);

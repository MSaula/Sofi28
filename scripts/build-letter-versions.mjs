import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { basename, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseAst } from "vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
assert(process.argv[2], "Provide the checkout of the current editorial Pages edition.");
const pages = resolve(process.argv[2]);
const output = resolve(process.argv[3] || resolve(root, "artifacts/letter-versions"));
const withPage = existsSync(resolve(pages, "con-carta.html")) ? "con-carta.html" : "index.html";
const originalHtml = readFileSync(resolve(pages, withPage), "utf8");
const scriptMatch = originalHtml.match(/<script[^>]+src="\/Sofi28\/([^"/]+\.js)"[^>]*><\/script>/);
assert(scriptMatch, "Expected one editorial module in the published HTML.");
const originalScriptName = scriptMatch[1];
const code = readFileSync(resolve(pages, originalScriptName), "utf8");
const ast = parseAst(code);
const edits = [];
const assetEdits = [];
const assets = new Map();
let section;
let navigation;
let letter;
let title;

function value(node) {
  if (node?.type === "Literal") return node.value;
  if (node?.type === "TemplateLiteral" && node.expressions.length === 0) {
    return node.quasis[0].value.cooked;
  }
}

function property(node, name) {
  return node?.properties?.find((entry) => entry.key?.name === name || value(entry.key) === name);
}

function visit(node, parent) {
  if (!node || typeof node !== "object") return;
  if (node.type === "ObjectExpression" && property(node, "letterTitle")) {
    assert(!letter, "Ambiguous dedication data.");
    letter = property(node, "letter").value;
    title = property(node, "letterTitle").value;
  }
  if (node.type === "CallExpression" && value(node.arguments[0]) === "section") {
    const props = node.arguments[1];
    if (value(property(props, "className")?.value) === "letter-section section-pad") {
      assert(!section, "Ambiguous dedication section.");
      section = node;
    }
  }
  if (node.type === "ArrayExpression" && value(node.elements[0]) === "#carta") {
    assert(parent?.type === "ArrayExpression");
    assert(!navigation, "Ambiguous letter navigation.");
    navigation = { list: parent, entry: node };
  }
  const text = value(node);
  if (typeof text === "string" && text.startsWith("/Sofi28/")) {
    const name = text.slice("/Sofi28/".length);
    assert(name === basename(name), "Expected a flat editorial asset path.");
    assets.set(name, readFileSync(resolve(pages, name)));
    assetEdits.push({ start: node.start, end: node.end, text: `__sofiOfflineAssets[${JSON.stringify(name)}]` });
  }
  for (const child of Object.values(node)) {
    if (Array.isArray(child)) child.forEach((entry) => visit(entry, node));
    else if (child?.type) visit(child, node);
  }
}
visit(ast, null);
assert(section && navigation && letter && title, "The published letter structure has changed.");
assert(letter.type === "ArrayExpression" && letter.elements.length > 0, "The base edition must contain the dedication.");
const paragraphs = letter.elements.map(value);
assert(paragraphs.every((paragraph) => typeof paragraph === "string"));

edits.push({ start: section.start, end: section.end, text: "null" });
edits.push({ start: letter.start, end: letter.end, text: "[]" });
edits.push({ start: title.start, end: title.end, text: '""' });
const entries = navigation.list.elements.filter((entry) => entry !== navigation.entry);
edits.push({ start: navigation.list.start, end: navigation.list.end,
  text: `[${entries.map((entry) => code.slice(entry.start, entry.end)).join(",")}]` });

function retarget(node) {
  if (!node || typeof node !== "object") return;
  if (edits.some((edit) => node.start >= edit.start && node.end <= edit.end)) return;
  const text = value(node);
  if (text === "#carta" || text === "Saltar a la carta") {
    edits.push({ start: node.start, end: node.end,
      text: JSON.stringify(text === "#carta" ? "#fechas" : "Saltar a las fechas") });
  }
  for (const child of Object.values(node)) {
    if (Array.isArray(child)) child.forEach(retarget);
    else if (child?.type) retarget(child);
  }
}
retarget(ast);

function apply(replacements) {
  const ordered = [...replacements].sort((a, b) => a.start - b.start);
  for (let index = 1; index < ordered.length; index++) {
    assert(ordered[index - 1].end <= ordered[index].start, "Overlapping export edits.");
  }
  let result = code;
  for (const edit of ordered.reverse()) result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
  return result;
}

const noLetterCode = apply(edits);
parseAst(noLetterCode);
assert(!noLetterCode.includes("#carta"));
for (const paragraph of paragraphs) assert(!noLetterCode.includes(paragraph));

const types = { jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", svg: "image/svg+xml", ttf: "font/ttf", woff2: "font/woff2", png: "image/png", avif: "image/avif" };
function dataUrl(name, data) {
  const type = types[name.split(".").at(-1).toLowerCase()];
  assert(type, `Unsupported offline resource: ${name}`);
  return `data:${type};base64,${data.toString("base64")}`;
}
assert(!code.includes("__sofiOfflineAssets"));
const table = Object.fromEntries([...assets].map(([name, data]) => [name, dataUrl(name, data)]));
const assetTable = `const __sofiOfflineAssets=${JSON.stringify(table)};\n`;

function standalone(script) {
  assert(!script.includes("/Sofi28/"), "Unresolved offline module resource.");
  let html = originalHtml.replace(scriptMatch[0], () => `<script type="module">${script.replace(/<\/script/gi, "<\\/script")}</script>`);
  html = html.replace(/<link\b[^>]*>/g, (tag) => {
    const href = tag.match(/\bhref="\/Sofi28\/([^"/]+)"/);
    if (!href) return tag;
    const name = href[1];
    if (/\brel="stylesheet"/.test(tag)) {
      let css = readFileSync(resolve(pages, name), "utf8");
      css = css.replace(/\/Sofi28\/([A-Za-z0-9_.-]+)/g, (_, font) => dataUrl(font, readFileSync(resolve(pages, font))));
      return `<style>${css}</style>`;
    }
    return tag.replace(href[0], `href="${dataUrl(name, readFileSync(resolve(pages, name)))}"`);
  });
  const licenses = {
    "Instrument Serif": readFileSync(resolve(pages, "InstrumentSerif-OFL.txt"), "utf8"),
    Inter: readFileSync(resolve(root, "node_modules/@fontsource-variable/inter/LICENSE"), "utf8"),
  };
  html = html.replace("</head>", `<script type="application/json" id="font-licenses">${JSON.stringify(licenses)}</script></head>`);
  assert(!/\b(?:src|href)="\/Sofi28\//.test(html));
  return html;
}

mkdirSync(output, { recursive: true });
mkdirSync(resolve(root, "downloads"), { recursive: true });
const editions = [
  { name: "Sofi28-con-carta", withLetter: true, script: assetTable + apply(assetEdits) },
  { name: "Sofi28-sin-carta", withLetter: false, script: assetTable + apply([...edits, ...assetEdits]) },
];
const manifest = { title: value(title), paragraphs: paragraphs.length, embeddedResources: assets.size, editions: [] };
for (const edition of editions) {
  const html = standalone(edition.script);
  const file = resolve(output, `${edition.name}.html`);
  const archive = resolve(root, "downloads", `${edition.name}.zip`);
  writeFileSync(file, html);
  const result = spawnSync("python3", ["-c", [
    "import sys,zipfile",
    "from pathlib import Path",
    "source,archive=map(Path,sys.argv[1:])",
    "with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as bundle: bundle.write(source,source.name)",
    "with zipfile.ZipFile(archive) as bundle: assert bundle.testzip() is None",
  ].join("\n"), file, archive], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  manifest.editions.push({ name: edition.name, withLetter: edition.withLetter, html: file, zip: archive,
    htmlBytes: Buffer.byteLength(html), htmlSha256: createHash("sha256").update(html).digest("hex"),
    zipSha256: createHash("sha256").update(readFileSync(archive)).digest("hex") });
}

const newName = `editorial-${createHash("sha256").update(noLetterCode).digest("hex").slice(0, 12)}.js`;
const publicHtml = originalHtml.replace(originalScriptName, newName);
writeFileSync(resolve(pages, newName), noLetterCode);
writeFileSync(resolve(pages, "index.html"), publicHtml);
manifest.publishedScript = newName;
writeFileSync(resolve(output, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify(manifest));

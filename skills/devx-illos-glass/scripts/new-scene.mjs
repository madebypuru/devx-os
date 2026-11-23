#!/usr/bin/env node
// Starts a new devx glass scene from an approved one, wherever you want it (any project): the copy imports this
// skill's kit by its real path, so it renders and checks from that folder.
//   node new-scene.mjs <path/to/subject.mjs> [--from lucid|finops|landing|dev|devplatform]
import { existsSync, readFileSync, realpathSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(realpathSync(fileURLToPath(import.meta.url)));
const argv = process.argv.slice(2);
const target = argv.find((a, i) => !a.startsWith("--") && argv[i - 1] !== "--from");
const from = argv.includes("--from") ? argv[argv.indexOf("--from") + 1] : "lucid";
if (!target) { console.error("usage: node new-scene.mjs <path/to/subject.mjs> [--from lucid|finops|landing|dev|devplatform]"); process.exit(1); }
const out = resolve(target);
if (existsSync(out)) { console.error(`${out} exists; pick another name`); process.exit(1); }
const slug = basename(out, ".mjs").toLowerCase().replace(/[^a-z0-9]+/g, "-");
const src = join(HERE, "..", "examples", `${from}.mjs`);
let s = readFileSync(src, "utf8");
const kit = pathToFileURL(realpathSync(join(HERE, "..", "kit", "lucid-kit.mjs"))).href;
const was = s.match(/const CLS = "([^"]+)"/)[1];
s = s.replace(/from "\.\.\/kit\/lucid-kit\.mjs"/, `from "${kit}"`)
  .replace(`const CLS = "${was}"`, `const CLS = "dx-${slug}"`)
  .replace(/subject: "[^"]*"/, `subject: "${slug}"`)
  .replace(/name: "[^"]*"/, `name: "TODO: ${slug}"`)
  .replace(/alt: "[^"]*"/, `alt: "TODO: one sentence on what the drawing shows and what moves."`);
s = `// TODO: rewrite this header for ${slug}: what it shows, the sequence as it really happens, the timing, the seam.\n// Started from the approved ${from}.mjs; keep its approved parts, change the story around them.\n` + s;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, s);
console.log(`${out}\n  class dx-${slug}, kit ${kit}`);

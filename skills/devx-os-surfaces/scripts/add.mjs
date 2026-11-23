#!/usr/bin/env node
// Copies the devx surfaces into a project: surfaces.css, surfaces.mjs and the assets they use, into <folder>/devx-surfaces/.
//   node add.mjs <folder>
import { cpSync, mkdirSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(realpathSync(fileURLToPath(import.meta.url)));
const dest = process.argv[2];
if (!dest) { console.error("usage: node add.mjs <folder>"); process.exit(1); }
const to = join(resolve(dest), "devx-surfaces");
mkdirSync(to, { recursive: true });
cpSync(join(HERE, "..", "surfaces.css"), join(to, "surfaces.css"));
cpSync(join(HERE, "surfaces.mjs"), join(to, "surfaces.mjs"));
cpSync(join(HERE, "..", "assets"), join(to, "assets"), { recursive: true });
console.log(`${to}\n  link surfaces.css (it finds assets/ beside it); import surfaces.mjs for the SVG parts`);

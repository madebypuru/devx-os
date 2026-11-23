#!/usr/bin/env node
// Draws a devx glass scene to its SVG.   node render.mjs <scene.mjs> [--out scene.svg]
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const argv = process.argv.slice(2);
const file = argv.find((a, i) => !a.startsWith("--") && argv[i - 1] !== "--out");
if (!file) { console.error("usage: node render.mjs <scene.mjs> [--out scene.svg]"); process.exit(1); }
const out = argv.includes("--out") ? argv[argv.indexOf("--out") + 1] : file.replace(/\.mjs$/, ".svg");
const scene = await import(pathToFileURL(resolve(file)).href);
const svg = scene.render(scene.params ?? {});
writeFileSync(out, svg);
console.log(`${out} (${(svg.length / 1024).toFixed(1)} KB)`);

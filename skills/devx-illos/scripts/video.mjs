#!/usr/bin/env node
// Records an animated SVG (a devx glass scene's output) as an MP4, frame by frame at exact times, so a review shows
// the real timing. Needs ffmpeg on the PATH.
//   node video.mjs <drawing.svg> [--out drawing.mp4] [--fps 30] [--cycles 2] [--scale 2]
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { launch } from "./browser.mjs";

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const file = argv.find((a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--"));
if (!file) { console.error("usage: node video.mjs <drawing.svg> [--out file.mp4] [--fps 30] [--cycles 2] [--scale 2]"); process.exit(1); }
const fps = Number(opt("fps", 30)), cycles = Number(opt("cycles", 2)), scale = Number(opt("scale", 2));
const out = resolve(opt("out", file.replace(/\.svg$/, "") + ".mp4"));
const svg = readFileSync(file, "utf8");
const [w, h] = (svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/) || [, 800, 400]).slice(1).map(Number);
const browser = await launch();
const page = await browser.newPage({ viewport: { width: Math.round(w), height: Math.round(h) }, deviceScaleFactor: scale });
await page.goto(pathToFileURL(resolve(file)).href);
await page.waitForTimeout(300);
// the cycle: the longest animation's duration
const T = await page.evaluate(() => Math.max(...document.getAnimations().map((a) => Number(a.effect.getTiming().duration) || 0), 0));
if (!T) { console.error("no animation found in", file); await browser.close(); process.exit(1); }
const dir = mkdtempSync(join(tmpdir(), "dx-video-"));
const frames = Math.round((T / 1000) * fps * cycles);
for (let f = 0; f < frames; f++) {
  const t = ((f / fps) * 1000) % (cycles * T);
  await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), t);
  await page.screenshot({ path: join(dir, `f${String(f).padStart(5, "0")}.png`) });
}
await browser.close();
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(fps), "-i", join(dir, "f%05d.png"), "-pix_fmt", "yuv420p", "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2", out]);
rmSync(dir, { recursive: true, force: true });
console.log(`${out} (${frames} frames, ${(T / 1000).toFixed(2)} s cycle, ${cycles} cycles)`);

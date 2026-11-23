#!/usr/bin/env node
// Checks a devx glass scene with the Illos checker (style, timing, seam, reduced motion, CPU, contact sheet) and this
// skill's own kit, wherever that checker is installed.   node check.mjs <scene.mjs> [any illos-check option]
import { existsSync, realpathSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(realpathSync(fileURLToPath(import.meta.url)));
const KIT = join(HERE, "..", "kit", "kit.mjs");
const places = [join(homedir(), ".claude", "skills"), join(homedir(), ".agents", "skills"), join(homedir(), ".codex", "skills")];
const checker = places.map((p) => join(p, "illos-check", "check.mjs")).find(existsSync);
if (!checker) {
  console.error("The Illos checker is not installed (looked in ~/.claude/skills, ~/.agents/skills, ~/.codex/skills).\nInstall it with `npx -y illos@latest setup`, or at least render the scene with render.mjs and look at it.");
  process.exit(2);
}
const args = process.argv.slice(2);
if (!args.length) { console.error("usage: node check.mjs <scene.mjs> [--svg out.svg] [--out dir] [--at s,s]"); process.exit(1); }
const r = spawnSync(process.execPath, [checker, ...args, "--kit", KIT], { stdio: "inherit" });
process.exit(r.status ?? 1);

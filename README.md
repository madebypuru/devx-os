# devx-os

The devx illustration skills, for Claude Code and Codex.

- `skills/devx-os`: the starting point and the brand rules; shared scripts (video, browser).
- `skills/devx-os-glass`: Lucid, isometric edge-lit glass scenes on the blue devx field: the kit, the approved
  examples and their references, and scripts to start, render, check and record a scene.
- `skills/devx-os-surfaces`: the art around content on devx pages: `surfaces.css`, `surfaces.mjs` (SVG builders),
  the field images, and a playground.

## Install

```bash
git clone https://github.com/madebypuru/devx-os.git
cd devx-os
./install.sh
```

Or download the zip (https://github.com/madebypuru/devx-os/archive/refs/heads/main.zip), unzip it where you want to
keep it, and run `./install.sh` inside it.

`install.sh` links each skill into `~/.claude/skills` (Claude Code) and `~/.agents/skills` (Codex). Keep the folder
where it is: the links point to it. If you move it, run `./install.sh` again. Start a new Claude or Codex session and
ask for a devx illustration; the skills load on their own.

## Needs

- Node 18 or later, for every script.
- To check glass scenes: the Illos checker (`npx -y illos@latest setup`), which also brings Playwright.
- To record a scene as video: ffmpeg.
- To open the surfaces playground: nothing more (`node skills/devx-os-surfaces/scripts/play.mjs`).

## Try it

```bash
node skills/devx-os-surfaces/scripts/play.mjs                          # every page recipe, live
node skills/devx-os-surfaces/scripts/surfaces.mjs card --color 1 --seed 74 --out card.svg
node skills/devx-os-glass/scripts/render.mjs skills/devx-os-glass/examples/lucid.mjs --out lucid.svg
```

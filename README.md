# devx-os

The devx illustration skills, for Claude Code and Codex.

- `skills/devx-os`: the router and the brand rules; shared scripts (video, browser).
- `skills/devx-os-glass`: Lucid, isometric edge-lit glass scenes on the blue field (kit, approved examples,
  references, render, new-scene, check).
- `skills/devx-os-surfaces`: the art around content on devx pages (surfaces.css, surfaces.mjs, assets, playground).

Install, or repair after moving this folder:

```bash
./install.sh
```

It links each skill into `~/.claude/skills` (Claude Code) and `~/.agents/skills` (Codex), so both read these files.
Edit here; never in a copy.

Sources: the devx site in `/Users/purusharma/devx` (`illos/devx/` for the glass kit; `_src/v37/` for the surfaces).

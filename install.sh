#!/bin/sh
# Links the devx-os skills into Claude Code (~/.claude/skills) and Codex (~/.agents/skills).
# Safe to run again: it replaces its own links and refuses to touch a real folder of the same name.
set -e
HERE="$(cd "$(dirname "$0")" && pwd -P)"
for root in "$HOME/.claude/skills" "$HOME/.agents/skills"; do
  mkdir -p "$root"
  for skill in "$HERE"/skills/*/; do
    name="$(basename "$skill")"
    dest="$root/$name"
    if [ -e "$dest" ] && [ ! -L "$dest" ]; then
      echo "skipped $dest: a real folder is there; move it away and run this again" >&2
      continue
    fi
    ln -sfn "${skill%/}" "$dest"
    echo "linked $dest"
  done
done

---
name: devx-illos
description: Use for any devx (devx labs) illustration or page art, in any project, deck or site. It routes to devx-illos-glass (isometric edge-lit glass objects on the blue field, the Lucid style) or devx-illos-surfaces (card art with a rising flare, the gradient field, glass cards, tinted icons, the blue diagram panel, field bar charts, filling clips, the stage), and holds the brand rules both follow.
---

# devx illustrations

Two kinds of devx art, one skill each. Read this file, then the one you need, before drawing anything.

| You need | Use | Made of |
| --- | --- | --- |
| An illustration of a thing or a system: a hero object, a capability picture, a deck graphic that explains how something works | `devx-illos-glass` | An animated SVG scene: isometric, edge-lit glass on the blue devx field (the Lucid style) |
| The art around content on a page: the top of a card, the colour behind a fold, glass cards on it, icons, a diagram panel, a chart, a progress clip, a framed demo | `devx-illos-surfaces` | CSS plus SVG strings from `surfaces.mjs`, with the field images |

Both skills live in one folder, `/Users/purusharma/devx-illos` (a local git repo). `~/.claude/skills/devx-illos*`
and `~/.agents/skills/devx-illos*` are links to it, so Claude and Codex read the same files. Change the style there,
once; never copy a kit into a project and edit the copy.

## The brand, in rules (both skills)

These come from the user's reviews of the devx site; each one was asked for, or a mistake they rejected.

1. **Colours.** Field and panel blue `#436bf6`; the four number colours blue `#658ff8`, pink `#fc88ab`, orange
   `#fbac73`, green `#96cf70` (teal `#70cce2` as a fifth); card fields from `CARD_FIELD` in `surfaces.mjs`; ink
   `#14162e`; the yellow fringe and running light `#ffe27a`. Colour lives in the art; the UI stays ink and white.
2. **No gradient starts or ends on an edge.** Every field fades in and out at its top, foot and sides. Use the soft
   field images the surfaces skill ships (`field.webp`, `field-soft.webp`, `out-field.webp`), let them bleed past
   the fold, and mask any field in a clipped or sticky box at all four sides.
3. **No art behind text.** No photos or objects under words. The one exception: a soft field behind glass cards.
4. **Hover moves the colour, never adds a light.** No radial spotlight that follows the pointer.
5. **No pixel patterns as decoration** (rejected: "remove the pixel thing, ew"). Square pixels only when they are the
   subject.
6. **No coloured square or dot before a label, and no numbered or all-caps eyebrow labels.** A label is plain
   sentence-case text.
7. **Serif only for section headings.** Cooper Lt BT is for h1 and h2; nothing in the art, no item title or number,
   uses it. Everything else is Inter Display.
8. **One job per fold, few words.** A fold has a chip, one heading, one line and one picture. The picture explains;
   it is not decoration.
9. **A diagram needs a bold colour field and one focal object.** Thin dotted lines on white, grey tiles and pale
   empty cards read as lifeless (the user called that "a very very very very sad UI").
10. **One kit inside a section.** Every panel in a section shares the same box, tile and corner recipe.
11. **Sharp at any size.** Draw fills in CSS or SVG; never stretch a small image across a big area (a blurred
    timeline fill was rejected).
12. **From Figma: halve the blur.** A Figma layer blur of 26.7 is about `blur(13px)` in CSS. Read real layer data
    (effects, blend modes, transforms) with the Figma tools, because its SVG export drops glass and blur.
13. **True motion.** Things move in their real order, cause before effect, and loop without a jump. Nothing that moves
    carries a blur.
14. **Review locally.** Show work as a local page, screenshot or video. Never push or deploy to GitHub until the user
    asks.

## Shared tools

- `scripts/video.mjs <drawing.svg> [--out f.mp4] [--fps 30] [--cycles 2]`: records an animated SVG frame by frame at
  exact times (needs ffmpeg). Use it to show a glass scene for review.
- `scripts/browser.mjs`: how these scripts find Playwright and a browser (the project's, else Illos's runtime folder
  `~/.config/illos/runtime`). If none is found, the message says how to install one.

Paths in these skills are relative to the skill's own folder: `<this skill>/scripts/...`.

---
name: devx-illos
description: Use when drawing, animating or fixing any devx illustration (hero, section, capability or industry page, deck graphic). The base style is Lucid, the approved glass sample from Figma 634:138: isometric edge-lit glass on a blue field, panes that frost what is behind them, rims lit from the top-left, additive inner glows, a few clear glass tiles with white icons.
---

# devx illustrations: Lucid

Every devx illustration is drawn in **Lucid**, the user's approved glass sample: Figma `S6XrPqLuruYPOEZrv9Vdne`
node `634:138` (copy: `illos/devx/reference-634-138.png`), rebuilt and approved as `illos/devx/lucid.mjs` (live at
madebypuru.github.io/devx-labs-v32/lucid.html). The user called it "the base... that is the skill... what needs to be
considered when drawing illustrations for devx". The method lives in `illos/devx/lucid-kit.mjs`; read it and
`lucid.mjs` before writing anything. (The older white-puck style, `kit.mjs` + `platform.mjs`, is superseded: only its
shared helpers, colour roles and checker setup are still used.)

When the user sends an image of what to draw (a render, a sketch, a Figma frame), it is the **content and story**,
not the style: keep the approved sample's parts as they are (its ring stays the base, its stack stays its stack) and
add the story's parts around them in Lucid glass, colliding with nothing. Save it as `illos/devx/reference-<subject>.png`.

## The look, as rules

1. **The field.** The sample's blue field: the flat colour, its soft colour bands at the right edge, the grain
   (`L.field()`). One field per drawing.
2. **Glass is the material.** Every object is a glass pane: it frosts what is behind it (`L.glass({ frost })`), its
   rim catches the light from the top-left (lit rim), it carries an additive white inner glow along its top edge
   (`inner`, plus-lighter), and a hairline white stroke inside its edge. Cyan (`cyan`, `beam*`) only for glows and
   beams of light; the blue under-edges (`edge1..3`) only under glass layers. White glyphs; ink only for the hero
   symbol's very slight overlay shadow.
3. **Approved parts are drawn from the kit, never re-typed.** The approved stack (ring, edges, frosted coin and $,
   body) is `L.stack({ ox, oy })`: call it, don't copy its code into a scene. Re-typing it once dropped the face's
   frosted backdrop and the user saw the coin top go wrong ("you had corrected it in the original base version... why
   are we deviating?"). After placing approved parts, compare them with `lucid.svg` by pixel (mean difference near 0).
   Moving things never re-skin approved static glass: the FinOps gate opens in the coin instead of the lid lifting.
4. **Isometric, exact.** Shapes stand on the frame's isometric planes: tiles use `TILE(x, y, s)`, things lying on the
   ground use `GROUND(x, y, s)`; reuse the sample's parts (`PARTS`: the coin's rim, face and $, the body's bands, the
   tile, the ring, the model and code glyphs) wherever they fit. When copying a Figma frame, read its real layer data
   with `use_figma` (effects, blend modes, absolute transforms): the SVG export drops glass, blurs and blends.
5. **Light, not decoration.** Light runs inside the glass and along beams; it adds (plus-lighter). The hero object's
   symbol sits on a crisp inset face with a lit rim, and stands off it with a very slight overlay shadow.
6. **Icons centred, one size.** Every icon is centred in its tile and drawn at one size (`centre()`), even when the
   reference has them off.
7. **Simple and clean.** One hero object, a few supporting tiles or bars, one motion story, plenty of field. Never fake
   3D with squashed rectangles; build from ellipses, the iso tile, and the sample's parts. No gaps where things join.
8. **It is true.** Motion follows real cause and effect, in order (`~/.claude/skills/illos-motion/SKILL.md`).
9. **Nothing that moves carries a blur.** Frost, inner glows and soft edges are filters: static panes only
   (`L.glass`). Anything that moves is drawn with `L.pane()` (the same glass from gradients only) or as additive
   light over the scene (`L.over`). The checker fails a blurred moving part, and a moving frosted pane re-blurs the
   scene every frame.
10. **Match the reference by measurement.** Compare against the reference render with a difference heat-map and by
   sampling pixels, not by eye; fix what the numbers show.

## Learnt on the approved pieces (FinOps, 2026-10-30)

- **Openings are cut into the object.** A gate or slot is a patch of the coin's own surface (it follows the curve),
  never a pane stuck on. It opens and closes by fading while near full size: it must never thin into a line, and when
  shut there is no seam at all.
- **Don't show what happens inside.** Things that go in disappear at the opening and come out the other side.
- **Added parts never touch anything.** Lanes start exactly at an edge and run clear; queues sit clear of the object.
- **Colour sorts.** A thing and the lane it belongs to share a tint (coral, mint, lilac), so the story reads by
  colour.
- **Review locally, by video.** Never push or deploy until the user asks. Show the loop as a video rendered from the
  SVG frame by frame (`illos/devx/video/`, exact timing, 30 fps).

## Steps

1. **Read** `lucid-kit.mjs`, `lucid.mjs` and the reference. Write the sequence and storyboard comment first.
2. **Scene** at `illos/devx/<subject>.mjs` (or `illos/devx/pieces/<key>.mjs` for a page's panels): class
   `dx-<subject>`, keyframes `dx-<subject>_*`, `const L = lucid(CLS, { w, h, T })`, `L.field()`, static glass with
   `L.glass`, moving parts with `L.pane` / `L.over`, tracks with `L.add`, `return L.finish({ meta })`.
3. **Check, then look.**
   ```bash
   node ~/.claude/skills/illos-check/check.mjs illos/devx/<subject>.mjs --kit illos/devx/kit.mjs --svg illos/devx/<subject>.svg
   ```
   It must end "all checks passed" (watch the CPU line). Open `out/<subject>.png`, compare with the reference.
4. **Show one at a time**, as a local video beside its reference, before the next. Nothing goes to GitHub until asked.

Change `lucid-kit.mjs` only to change the style everywhere, then re-check `lucid.mjs` and every scene.

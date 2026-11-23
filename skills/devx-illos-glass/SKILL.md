---
name: devx-illos-glass
description: Use when drawing, animating or fixing a devx illustration of an object or system (a hero, a capability or industry picture, a deck graphic) in the Lucid style, the user's approved base from Figma 634:138. Isometric edge-lit glass on the blue devx field, panes that frost what is behind them, rims lit from the top-left, additive inner glows, a few clear glass tiles with white icons. Animated SVG, checked and recorded to video.
---

# devx glass: Lucid

Read `../devx-illos/SKILL.md` first: its brand rules apply here too.

Every devx illustration of a thing is drawn in **Lucid**, the user's approved glass sample: Figma file
`S6XrPqLuruYPOEZrv9Vdne`, node `634:138` (copy: `references/reference-634-138.png`), rebuilt and approved as
`examples/lucid.mjs`. The user called it "the base... that is the skill... what needs to be considered when drawing
illustrations for devx". The method lives in `kit/lucid-kit.mjs` (on top of `kit/kit.mjs`); read it and
`examples/lucid.mjs` before writing anything.

Approved scenes to learn from, all in `examples/`: `lucid.mjs` (the sample: coin stack on a ring), `finops.mjs` (a gate
cut into a coin, models on lanes), `landing.mjs` (AI landing zone), `dev.mjs` and `devplatform.mjs` (developer
platform). References for them are in `references/`.

When the user sends an image of what to draw (a render, a sketch, a Figma frame), it is the **content and story**,
not the style: keep the approved sample's parts as they are (its ring stays the base, its stack stays its stack) and
add the story's parts around them in Lucid glass, colliding with nothing. Save it next to the scene as
`reference-<subject>.png`.

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
   frosted backdrop and the user saw the coin top go wrong. After placing approved parts, compare them with the
   rendered `examples/lucid.mjs` by pixel. Moving things never re-skin approved static glass: the FinOps gate opens in
   the coin instead of the lid lifting.
4. **Isometric, exact.** Shapes stand on the isometric planes: tiles use `TILE(x, y, s)`, things lying on the ground
   use `GROUND(x, y, s)`; reuse the sample's parts (`PARTS`: the coin's rim, face and $, the body's bands, the tile, the
   ring, the model and code glyphs) wherever they fit.
5. **Light, not decoration.** Light runs inside the glass and along beams; it adds (plus-lighter). The hero object's
   symbol sits on a crisp inset face with a lit rim, and stands off it with a very slight overlay shadow.
6. **Icons centred, one size.** Every icon is centred in its tile and drawn at one size (`centre()`), even when the
   reference has them off.
7. **Simple and clean.** One hero object, a few supporting tiles or bars, one motion story, plenty of field. Never fake
   3D with squashed rectangles; build from ellipses, the iso tile and the sample's parts. No gaps where things join.
8. **Each subject gets its own object.** The material is shared; the composition is not. Six panels drawn as the same
   layout were rejected ("I see the same illustration repeating"). A gate, stacked slabs, hoops on a track, a dial, a
   coin stack, a tile grid: pick the object that is the subject.
9. **It is true.** Motion follows real cause and effect, in order, and the loop joins with no jump.
10. **Nothing that moves carries a blur.** Frost, inner glows and soft edges are filters: static panes only
    (`L.glass`). Anything that moves is drawn with `L.pane()` (the same glass from gradients only) or as additive light
    over the scene (`L.over`). A moving frosted pane re-blurs the scene every frame.
11. **Match the reference by measurement.** Compare against the reference render with a difference heat-map and by
    sampling pixels, not by eye; fix what the numbers show.

Learnt on the approved pieces: openings are cut into the object (a patch of its own surface that fades open and shut,
never thinning into a line, with no seam when shut); don't show what happens inside (things vanish at the opening and
come out the other side); added parts never touch anything (lanes start exactly at an edge and run clear); colour sorts
(a thing and its lane share a tint: coral, mint, lilac).

## Steps

1. **Read** `kit/lucid-kit.mjs`, `examples/lucid.mjs` and the reference. Write the scene's header comment first: what
   it shows, the sequence as it really happens, the timing of each step, and the seam (the start frame, which is also
   the reduced-motion still).
2. **Start the scene** where the user's project wants it (any folder). It imports this skill's kit by its real path:
   ```bash
   node <this skill>/scripts/new-scene.mjs <project>/art/<subject>.mjs --from lucid   # or finops, landing, dev, devplatform
   ```
   Then rewrite the TODOs (header, `meta.name`, `meta.alt`). A scene is: class `dx-<subject>`, keyframes
   `dx-<subject>_*`, `const L = lucid(CLS, { w, h, T })`, `L.field()`, static glass with `L.glass`, moving parts with
   `L.pane` / `L.over`, tracks with `L.add`, `return L.finish({ meta })`.
3. **Draw it:** `node <this skill>/scripts/render.mjs <scene.mjs>` writes `<scene>.svg` next to it.
4. **Check, then look:**
   ```bash
   node <this skill>/scripts/check.mjs <scene.mjs> --svg <scene>.svg
   ```
   It runs the Illos checker with this kit and must end "all checks passed" (watch the CPU line). Open the contact
   sheet it writes (`out/<subject>.png`) and compare with the reference.
5. **Show one at a time,** as a local video beside its reference, before the next:
   `node <this skill>/../devx-illos/scripts/video.mjs <scene>.svg`. Nothing goes to GitHub until the user asks.

To use a finished scene on a page, inline its SVG or load it as an `<img>`; it loops on its own, respects reduced
motion, and a page can pause it with `--illos-play: paused`.

Change `kit/lucid-kit.mjs` only to change the style everywhere, then re-render and re-check every scene in
`examples/` (their output must stay identical unless the change is meant to show).

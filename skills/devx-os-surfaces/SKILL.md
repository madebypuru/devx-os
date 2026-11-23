---
name: devx-os-surfaces
description: Use when a devx page, deck or prototype needs the art around its content, the devx site's own recipes. Card art (a flat colour with grain and a flare rising from its foot) with a frosted product panel, the gradient field behind a fold with glass cards on it, icons on a tint of the four number colours, the blue diagram panel (frosted boxes and tiles, white ribbons, the glass puck), field bar charts, clips that fill with a flare, and the stage (field and hummingbird behind a framed panel). CSS plus SVG from surfaces.mjs, with a live playground.
---

# devx surfaces

Read `../devx-os/SKILL.md` first: its brand rules apply here too.

The art the devx site (v30 to v37) draws around its content, made portable: `surfaces.css` (every class starts
`dx-`), `scripts/surfaces.mjs` (SVG and HTML strings; works in a browser and in Node) and `assets/` (the field
images, the grain, the hummingbird, the devx mark). `surfaces.mjs` is a port of the site's Python builders and gives
the same drawing for the same seed, byte for byte.

## Look before you build

```bash
node <this skill>/scripts/play.mjs          # the playground: every recipe live, with controls and Copy SVG
```

## Put it in a project

```bash
node <this skill>/scripts/add.mjs <project folder>     # copies surfaces.css, surfaces.mjs and assets/ into <folder>/devx-surfaces/
```

Link `devx-surfaces/surfaces.css` (it finds `assets/` beside it) and import `devx-surfaces/surfaces.mjs` where you need
an SVG part. For a static file or another language, print the SVG from the command line:
`node <this skill>/scripts/surfaces.mjs card --color 1 --seed 74 --out card.svg` (`--help` lists everything).

## The recipes

1. **The field behind a fold.** `<section class="dx-fold tall"><div class="dx-field" aria-hidden="true"></div>...`.
   It is stretched to its fold, so the fold needs real height (`tall` gives 640px; the site's are 690 to 920px).
   `dx-field flip` mirrors it for the next fold that carries one; `dx-field-side` sits behind only the top right of a
   fold (a heading and the first row of cards); `dx-hero-field` (with an empty `<i>` inside) sits off the hero's top
   right, beside the words, and moves above them on narrow screens. Never more than one field per fold, and never two
   folds in a row looking the same.
2. **Glass on the field.** `dx-glass` (white 80%, blur 12, radius 12) for cards; `dx-glass lg` (blur 6, radius 20, a
   soft lift) for big numbers. Only ever on a field; on white, a card is plain white with a hairline.
3. **Tinted icons.** `<span class="dx-icon" style="--oc:var(--dx-pink)"><svg viewBox="0 0 24 24">...</svg></span>`:
   the icon in the colour on a 20% tint of it. `dx-icon plain` is the neutral one. Icons are 24-unit line icons,
   stroke 1.8, round caps.
4. **Card art.** `cardArt({ k, col, acc, seed })` in `.dx-card-art` at the top of a `.dx-card`, with a `.dx-panel`
   (a frosted product panel: `.vh` header, `.row`s, `.dx-tag ok|warn|blue`, `.ck`, `.bar`) centred on it and the words
   in `.dx-card-body`. Take `col, acc` from `CARD_FIELD` and give each card in a row a different pair and seed. The
   flare rises from the foot: the blocks are cut out of the colour, so the card's white flows up into it. Panels show
   sample data, and the page says so. `afterArt()` is the variant for a before/after card: blocks bleed in from the
   right edge, and the text sits on the left.
5. **The diagram panel.** A `.dx-diagram` with `cardArt({ k: "panel", col: PANEL[0], acc: PANEL[1], W, H, rise: 1.1,
   seed: 29, wide: [170, 300], blur: 18, foot: 70 })` behind it (sized to the panel), `.dx-frost` boxes holding
   `.dx-tile`s (white icons and words), `.dx-pill`s for names, `puck()` as the one focal object, and ribbons:
   `fanIn` / `fanOut` give the paths (straight runs, corners of radius 16), `ribbon(d, k)` draws each, inside
   `<svg class="dx-ribbons live" viewBox="0 0 W H" preserveAspectRatio="none">`. With `live`, light runs down every
   ribbon. On narrow screens the ribbons hide and the boxes stack, joined by a short white `.dx-join` line. Every box
   in the panel uses the same frosted recipe.
6. **Field bars.** `fieldBars([heights in %])` makes a `.dx-bars` chart whose bars are windows onto one field, so
   colour flows through it; change a bar's `style.height` to animate it (it eases). Add `few` for three or four wide
   bars, and an `<svg class="dx-bars-line">` for a dashed reference line. Charts show direction, not data: say so.
7. **Clips.** `clip(text, { color, f, live })` makes a `.dx-clip`: `--f` (0 to 1) fills it in one flat colour with
   grain, and `live` shows the bright flare on its edge while it fills. One colour per step, in order: blue, pink,
   orange, green.
8. **The stage.** `.dx-stage` with a `.dx-stage-field` and `<img class="dx-stage-bird" src="assets/bird.webp" alt="">`
   behind a framed panel (a chat, a demo). The field rises from below the panel; the hummingbird sits off its left edge
   and hides on phones.

## Changing a recipe

Change it here, in `surfaces.css` or `scripts/surfaces.mjs`, then open the playground and look at it at desktop and
phone widths. `cardArt` and `afterArt` must keep matching the site's Python for the same arguments: if you change
their drawing on purpose, say so to the user, because existing pages built from the Python will no longer match.

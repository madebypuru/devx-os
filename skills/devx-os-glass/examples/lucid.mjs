// Lucid: the style sample, Figma S6XrPqLuruYPOEZrv9Vdne 634:138, rebuilt from the frame's own layer data (read with
// the Plugin API: transforms, fills, strokes, effects) and its exported shapes (illos/devx/ref-634-138/*.svg). An
// isometric glass coin stack with a $ on its top face stands on a glowing ring; three glass tiles float beside it, and
// a faint cyan beam runs from the lower tile to the ring. Blue field with grain and the field's colour bands.
//
// How Figma's effects are rebuilt (the SVG export drops them):
// - GLASS (frost radius r, light angle 315, light intensity 1) and BACKGROUND_BLUR r: a copy of everything drawn
//   before the layer, blurred and clipped to the layer's shape (a background blur at sigma r / 2, as Figma's export
//   writes it; Glass frost at about its full radius, which is what matches the frame); then the rim
//   the light catches: an inside stroke whose white runs from the top-left (the light) to
//   the bottom-right, bright, and quiet in between.
// - INNER_SHADOW in LINEAR_DODGE: the shape's own alpha, eroded by the spread, shifted, blurred and cut out of itself,
//   in white, added onto what is under it (mix-blend-mode: plus-lighter).
// - Strokes INSIDE: twice the width, clipped to the shape.
//
// Sequence, as it really happens: a call goes out from a model (the beam carries it from the lower tile to the
// platform); only once it reaches the ring does the ring brighten; only then does the light rise up through the
// stack (a band of light climbs inside the glass) and the $ face glints: the cost is counted. Then all settles.
// 0.05 to 0.95 s: a light runs up the beam (linear) and into the ring.
// 0.95 to 1.60 s: the ring's inner glow brightens and settles (EASE_OUT).
// 1.30 to 2.30 s: a band of light climbs the stack, bottom to top, inside the glass (EASE_IN_OUT).
// 2.20 to 3.00 s: the $ face glints (EASE_OUT). Rest to 3.2 s.
// Seam (3.2 s = 0 s): no light on the beam, ring and stack at rest: the start frame, which is the reduced-motion still.
import { lucid, PARTS, TILE, GROUND, centre, tileInner, R, EASE_OUT, EASE_IN_OUT, n } from "../kit/lucid-kit.mjs";

export const meta = {
  theme: "devx-glass",
  subject: "lucid",
  name: "Lucid sample",
  size: "section",
  bleed: true,
  alt: "An isometric glass coin stack with a dollar sign on top, standing on a glowing ring on a blue field, with glass tiles for two models and code beside it; a call runs along a beam into the ring and light rises through the stack.",
};
export const params = {};

const CLS = "dx-lucid";
const W = 422;
const H = 304;
const T = 3.2;
export function render() {
  const L = lucid(CLS, { w: W, h: H, T });
  const { defs, over, id, push, add, vec, glass } = L;
  L.field();

  // The tiles: 40 x 40, corner 6, stood at the isometric angle (the frame's transform, matrix(.866 .5 0 1)).
  const rect = PARTS.tile;
  const glyph = ([d], tf) => `<path d="${d}" transform="${tf}" class="wht"/>`;
  // Every icon centred on its tile and the same size (the frame has the two model logos 1.75 low and at 21.3 and
  // 23.9).

  // 634:198, lower left: a model. Glass r100.
  push(glass({ d: rect, tf: TILE(56.6, 190.19), bbox: [0, 0, 40, 40], box: [52, 186, 96, 255], frost: 100, stroke: { c: "white", w: 0.363 }, inner: tileInner }) + glyph(PARTS.glyph.spark, `${TILE(56.6, 190.19)} ${centre(PARTS.glyph.spark)}`));
  // 634:201, upper left: a model. White 11%, background blur 23.7 (no glass light).
  push(glass({ d: rect, tf: TILE(73.92, 99.57), bbox: [0, 0, 40, 40], box: [69, 95, 113, 164], frost: 23.7, sigma: 11.85, fill: `class="wht" opacity=".11"`, stroke: { c: "white", w: 0.363 }, inner: tileInner, light: false }) + glyph(PARTS.glyph.knot, `${TILE(73.92, 99.57)} ${centre(PARTS.glyph.knot)}`));
  // The approved stack (the light inside, the ring, edges, shafts and disc, the frosted coin and $, the body), from the
  // kit; 634:228, the beam (a blurred cyan stroke), goes between the coin and the body, as in the frame.
  const { COIN, BODY, RING } = L.stack({ between: vec("a1479", 13.16, 164.41) });
  const circle = PARTS.circle;
  const { rim: rimD, face: faceD } = PARTS.coin;
  const bodyD = PARTS.body.bands;
  // 634:240: code, in front of the stack. Glass r12.
  push(glass({ d: rect, tf: TILE(127.33, 149.31), bbox: [0, 0, 40, 40], box: [123, 145, 167, 214], frost: 12, fill: `class="wht" opacity=".2"`, stroke: { c: "white", w: 0.363 }, inner: tileInner }) + glyph(PARTS.glyph.code, `${TILE(127.33, 149.31)} ${centre(PARTS.glyph.code, 19)}`));

  // ---- The motion, over the scene (no blur on anything that moves; the light adds, like the frame's glows).
  // the call on the beam: a short bright dash from the lower tile up to the ring
  over.push(`<path class="call add" d="M16.75 251.12L176.96 167.99" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="22 220" style="stroke:${R("beam2")}"/>`);
  add("call", [[0, "stroke-dashoffset:22"], [0.05, "stroke-dashoffset:22"], [0.95, "stroke-dashoffset:-182"], [0.97, "stroke-dashoffset:22"]], "stroke-dashoffset:22;");
  // the ring brightens: its rim glow again, as a gradient, with the stack cut out of it (the stack stands in front)
  defs.push(`<radialGradient id="${CLS}-rg" cx="98.68" cy="100.5" r="98.5" gradientUnits="userSpaceOnUse"><stop offset=".78" style="stop-color:${R("white")}" stop-opacity="0"/><stop offset="1" style="stop-color:${R("white")}" stop-opacity=".9"/></radialGradient>`);
  const stack = `<g transform="${BODY}">${bodyD.map((d) => `<path d="${d}"/>`).join("")}</g><path d="${rimD}" transform="${COIN}"/>`;
  defs.push(`<mask id="${CLS}-nostack" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" style="fill:${R("white")}"/><g style="fill:${R("ink")}">${stack}</g></mask>`);
  defs.push(`<clipPath id="${CLS}-instack">${stack}</clipPath>`);
  over.push(`<g mask="url(#${CLS}-nostack)"><g class="rflash add"><path d="${circle}" transform="${RING}" fill="url(#${CLS}-rg)"/></g></g>`);
  add("rflash", [[0, "opacity:0"], [0.95, "opacity:0", EASE_OUT], [1.15, "opacity:1", EASE_OUT], [1.6, "opacity:0"]], "opacity:0;");
  // light climbing inside the glass, bottom to top
  defs.push(`<radialGradient id="${CLS}-band" cx=".5" cy=".5" r=".5"><stop offset="0" style="stop-color:${R("white")}" stop-opacity=".7"/><stop offset=".55" style="stop-color:${R("white")}" stop-opacity=".28"/><stop offset="1" style="stop-color:${R("white")}" stop-opacity="0"/></radialGradient>`);
  const up = (y) => `transform:translate(0px,${n(y)}px)`;
  over.push(`<g clip-path="url(#${CLS}-instack)"><g class="climb add"><ellipse cx="235" cy="236" rx="90" ry="24" fill="url(#${CLS}-band)"/></g></g>`);
  add("climb", [[0, `${up(0)};opacity:0`], [1.3, `${up(0)};opacity:0`, EASE_IN_OUT], [1.5, `${up(-24)};opacity:1`, EASE_IN_OUT], [2.3, `${up(-160)};opacity:0`]], `${up(0)};opacity:0;`);
  // the $ face glints once the light reaches it
  over.push(`<g class="glint add"><path d="${faceD}" transform="${COIN}" class="wht" opacity=".3"/></g>`);
  add("glint", [[0, "opacity:0"], [2.2, "opacity:0", EASE_OUT], [2.4, "opacity:1", EASE_OUT], [3.0, "opacity:0"]], "opacity:0;");

  return L.finish({ meta });
}

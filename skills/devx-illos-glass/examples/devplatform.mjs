// AI Developer Platform: "Golden paths, so teams build fast without rebuilding the stack." In Lucid, from the user's
// reference (illos/devx/reference-dev-platform.png): templates (search, layers, graph, code) wait on the left; one goes
// through a glass ring, the golden path, whose checks light one by one; it comes out on the right as a running app.
// Wide panel, coral field.
// Sequence, as it really happens: a team picks the code template; it goes into the ring (not seen inside, per the
// lessons); the ring runs its checks, the ticks lighting top to bottom; only once every check has passed does the app
// on the right fill in, and only then does its check badge appear; the app runs; then the next team's template slides
// in from the left, and the app clears for its build.
// 0.40 to 1.35 s: the code template slides into the ring (EASE_IN_OUT), fading as it enters the opening.
// 1.35 to 2.40 s: the ticks light top to bottom (linear); the ring's inside glows.
// 2.35 to 2.85 s: the app fills in (EASE_OUT); 2.85 to 3.15 s its check badge appears (from scale .92, EASE_OUT).
// 4.40 to 4.90 s: the ticks go out; 4.60 to 5.20 s the app clears; 4.60 to 5.60 s the next template slides in (SHEET).
// Throughout: a light runs round the ring's rim (linear), so nothing stands still.
// Seam (6.0 s = 0 s): the template waiting, the ring at rest, the app frame empty: the start frame and the still.
import { lucid, PARTS, centre, tileInner, R, EASE_OUT, EASE_IN_OUT, SHEET, n } from "../kit/lucid-kit.mjs";

export const meta = {
  theme: "devx-glass",
  subject: "dev",
  name: "AI developer platform",
  size: "section",
  bleed: true,
  alt: "On a coral field, glass template tiles wait beside a glass ring, the golden path: the code template goes through it, the ring's checks light one by one, and it comes out on the right as a running app with a check mark.",
};
export const params = {};

const CLS = "dx-dev";
const W = 772;
const H = 300;
const T = 6.0;

// The ring: an upright glass hoop seen three quarters on; its depth shows to the right.
const RG = { cx: 420, cy: 150, rx: 54, ry: 130, irx: 30, iry: 104, depth: 20 };
// The app window on the right.
const APP = { x: 548, y: 92, w: 176, h: 126, r: 16 };
// The tiles: [centre x, centre y, tint, glyph].
const TS = 58; // tile size
const tileD = `M14 0H${TS - 14}A14 14 0 0 1 ${TS} 14V${TS - 14}A14 14 0 0 1 ${TS - 14} ${TS}H14A14 14 0 0 1 0 ${TS - 14}V14A14 14 0 0 1 14 0Z`;

export function render() {
  const L = lucid(CLS, { w: W, h: H, T, field: "coral" });
  const { defs, over, push, add, glass, pane } = L;
  L.field();
  const tr = (x, y) => `transform:translate(${n(x)}px,${n(y)}px)`;
  const o = (v) => `opacity:${v}`;
  const { cx, cy, rx, ry, irx, iry, depth } = RG;
  const ell = (x, y, a, b, sweep = 1) => `M${n(x)} ${n(y - b)}A${n(a)} ${n(b)} 0 1 ${sweep} ${n(x)} ${n(y + b)}A${n(a)} ${n(b)} 0 1 ${sweep} ${n(x)} ${n(y - b)}Z`;
  // an annulus as one contour (outer clockwise, inner the other way), so it has a hole under the nonzero rule
  const ring = (x) => `${ell(x, cy, rx, ry, 1)}${ell(x + 4, cy, irx, iry, 0)}`;

  // ---- Glyphs, white, in a 58-unit tile.
  const g = TS / 2;
  const GLYPH = {
    search: `<g class="wl" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M${g - 11} ${g - 14}H${g + 3}L${g + 9} ${g - 8}V${g - 1}M${g - 11} ${g - 14}V${g + 14}H${g - 1}"/><path d="M${g - 6} ${g - 6}H${g + 1}M${g - 6} ${g}H${g - 2}"/><circle cx="${g + 4}" cy="${g + 6}" r="5.2"/><path d="M${g + 8} ${g + 10}L${g + 12} ${g + 14}"/></g>`,
    layers: `<g class="wl" fill="none" stroke-width="2.2" stroke-linejoin="round"><path d="M${g} ${g - 12}L${g + 13} ${g - 5}L${g} ${g + 2}L${g - 13} ${g - 5}Z"/><path d="M${g - 13} ${g + 1}L${g} ${g + 8}L${g + 13} ${g + 1}"/><path d="M${g - 13} ${g + 7}L${g} ${g + 14}L${g + 13} ${g + 7}"/></g>`,
    graph: `<g class="wl" fill="none" stroke-width="2.2" stroke-linecap="round"><path d="M${g - 8} ${g + 1}L${g + 8} ${g - 9}M${g - 8} ${g + 1}L${g + 8} ${g + 11}M${g + 8} ${g - 9}V${g + 11}"/><circle cx="${g - 8}" cy="${g + 1}" r="4.4" class="wht"/><circle cx="${g + 8}" cy="${g - 9}" r="4.4" class="wht"/><circle cx="${g + 8}" cy="${g + 11}" r="4.4" class="wht"/></g>`,
    code: `<path d="${PARTS.glyph.code[0]}" transform="translate(0 0) scale(${n(TS / 40)}) ${centre(PARTS.glyph.code, 19)}" class="wht"/>`,
  };
  const tileAt = (x, y) => `translate(${n(x - TS / 2)} ${n(y - TS / 2)})`;
  const staticTile = (x, y, tint, glyph) =>
    glass({ d: tileD, tf: tileAt(x, y), bbox: [0, 0, TS, TS], box: [x - 40, y - 40, x + 40, y + 40], frost: 14, fill: `style="fill:${R(tint)}" opacity=".78"`, stroke: { c: "white", w: 0.5 }, inner: tileInner, lit: [0.85, 0.45] }) +
    `<g transform="${tileAt(x, y)}">${glyph}</g>`;

  // ---- The waiting templates (still): search, graph, layers.
  push(staticTile(148, 96, "tlilac", GLYPH.search));
  push(staticTile(176, 210, "tmint", GLYPH.graph));
  push(staticTile(296, 96, "tcoral", GLYPH.layers));

  // ---- The ring's back: its outer side band (the depth), the inside glowing lilac.
  const sideD = `M${n(cx)} ${n(cy - ry)}H${n(cx + depth)}A${n(rx)} ${n(ry)} 0 0 1 ${n(cx + depth)} ${n(cy + ry)}H${n(cx)}A${n(rx)} ${n(ry)} 0 0 0 ${n(cx)} ${n(cy - ry)}Z`;
  push(glass({ d: sideD, bbox: [cx, cy - ry, cx + rx + depth, cy + ry], box: [cx - 10, cy - ry - 10, cx + rx + depth + 10, cy + ry + 10], frost: 11, stroke: { c: "white", w: 0.4 }, inner: tileInner, lit: [0.5, 0.4] }));
  const hole = ell(cx + 4, cy, irx, iry);
  defs.push(``);
  defs.push(`<linearGradient id="${CLS}-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:${R("tlilac")}"/><stop offset=".6" style="stop-color:${R("tlilac")}" stop-opacity=".85"/><stop offset="1" style="stop-color:${R("tlilac")}" stop-opacity=".6"/></linearGradient><linearGradient id="${CLS}-wl2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:${R("white")}" stop-opacity=".35"/><stop offset=".5" style="stop-color:${R("white")}" stop-opacity="0"/><stop offset="1" style="stop-color:${R("white")}" stop-opacity=".25"/></linearGradient>`);
  push(`<path d="${hole}" fill="url(#${CLS}-wall)"/><path d="${hole}" fill="url(#${CLS}-wl2)"/>`);
  // the inside glows while the checks run
  defs.push(`<radialGradient id="${CLS}-ig" cx=".35" cy=".5" r=".6"><stop offset="0" style="stop-color:${R("white")}" stop-opacity=".8"/><stop offset="1" style="stop-color:${R("tlilac")}" stop-opacity="0"/></radialGradient>`);
  push(`<g class="inglow add"><path d="${hole}" fill="url(#${CLS}-ig)"/></g>`);
  add("inglow", [[0, o(0)], [1.2, o(0), EASE_OUT], [1.5, o(1)], [2.4, o(1), EASE_OUT], [3.0, o(0)]], "opacity:0;");

  // ---- The moving template: it slides into the ring and fades at the opening (not seen inside).
  const START = [312, 206];
  const IN = [cx - 6, 196];
  push(`<g class="go">${pane({ d: tileD, tf: tileAt(...START), bbox: [0, 0, TS, TS], tint: "tlilac", tintO: 0.78, frostO: 0.25, lit: [0.85, 0.45], glow: 0.35 })}<g transform="${tileAt(...START)}">${GLYPH.code}</g></g>`);
  const dx = IN[0] - START[0];
  const dy = IN[1] - START[1];
  add("go", [[0, `${tr(0, 0)};${o(1)}`], [0.4, `${tr(0, 0)};${o(1)}`, EASE_IN_OUT], [1.15, `${tr(dx * 0.8, dy * 0.8)};${o(1)}`, EASE_OUT], [1.35, `${tr(dx, dy)};${o(0)}`], [4.6, `${tr(-60, 0)};${o(0)}`, SHEET], [5.6, `${tr(0, 0)};${o(1)}`]]);

  // ---- The ring's front face (glass), then its ticks: dim, and a lit copy revealed top to bottom as the checks pass.
  push(glass({ d: ring(cx), bbox: [cx - rx, cy - ry, cx + rx, cy + ry], box: [cx - rx - 10, cy - ry - 10, cx + rx + 10, cy + ry + 10], frost: 12, fill: `class="wht" opacity=".14"`, stroke: { c: "white", w: 0.5 }, inner: tileInner, lit: [0.9, 0.5], bevel: [10, 0.18] }));
  const mid = { a: (rx + irx) / 2 + 3, b: (ry + iry) / 2 };
  let ticks = "";
  for (let k = 0; k < 9; k++) {
    const t = -62 + k * 15.5;
    const x = cx + 4 + mid.a * Math.cos((t * Math.PI) / 180);
    const y = cy + mid.b * Math.sin((t * Math.PI) / 180);
    ticks += `M${n(x - 4)} ${n(y)}H${n(x + 4)}`;
  }
  push(`<path d="${ticks}" fill="none" stroke-width="3" stroke-linecap="round" style="stroke:${R("tmint")}" opacity=".45"/>`);
  defs.push(`<clipPath id="${CLS}-tk"><rect class="sweep" x="${cx - 10}" y="${cy - ry}" width="${rx + 20}" height="${ry * 2}"/></clipPath>`);
  push(`<g clip-path="url(#${CLS}-tk)"><path d="${ticks}" fill="none" stroke-width="3" stroke-linecap="round" class="wl"/><path d="${ticks}" fill="none" stroke-width="7" stroke-linecap="round" style="stroke:${R("tmint")}" opacity=".5"/></g>`);
  add("sweep", [[0, "transform:scaleY(0);opacity:1"], [1.35, "transform:scaleY(0);opacity:1"], [2.4, "transform:scaleY(1);opacity:1"], [4.4, "transform:scaleY(1);opacity:1", EASE_OUT], [4.9, "transform:scaleY(1);opacity:0"], [4.92, "transform:scaleY(0);opacity:0"], [5.9, "transform:scaleY(0);opacity:1"]], "transform-box:fill-box;transform-origin:50% 0;transform:scaleY(0);");
  // a light running round the rim, all the time
  const per = 2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2);
  over.push(`<path class="rim add" d="${ell(cx, cy, rx - 1, ry - 1)}" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="26 ${n(per - 26)}" style="stroke:${R("white")}" opacity=".7"/>`);
  add("rim", [[0, "stroke-dashoffset:0"], [T, `stroke-dashoffset:${n(-per)}`]], "");

  // ---- The app on the right: a frosted window frame (still), its content and badge (built by the ring).
  const { x, y, w, h, r } = APP;
  const winD = `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
  push(glass({ d: winD, bbox: [x, y, x + w, y + h], box: [x - 10, y - 10, x + w + 10, y + h + 10], frost: 16, fill: `class="wht" opacity=".34"`, stroke: { c: "white", w: 0.5 }, inner: tileInner, lit: [0.9, 0.5], bevel: [12, 0.18] }) + `<path d="M${x + 10} ${y + 30}H${x + w - 10}" class="wl" stroke-width=".8" stroke-opacity=".5"/>`);
  const dots = ["alert", "peach", "tmint"].map((c, i) => `<circle cx="${x + 20 + i * 13}" cy="${y + 16}" r="4" style="fill:${R(c)}"/>`).join("");
  const codeTf = `translate(${x + w / 2 - 30} ${y + 52}) scale(${n(60 / 40)}) ${centre(PARTS.glyph.code, 19)}`;
  push(`<g class="app"><g opacity=".9">${dots}</g><path d="${PARTS.glyph.code[0]}" transform="${codeTf}" class="wht"/></g>`);
  add("app", [[0, o(0.25)], [2.35, o(0.25), EASE_OUT], [2.85, o(1)], [4.6, o(1), EASE_IN_OUT], [5.2, o(0.25)]], "opacity:.25;");
  // the check badge
  const bx = x + w - 8;
  const by = y + h - 8;
  push(`<g class="ok"><circle cx="${bx}" cy="${by}" r="14" style="fill:${R("tmint")}"/><circle cx="${bx}" cy="${by}" r="14" fill="none" class="wl" stroke-width="1.2" stroke-opacity=".8"/><path d="M${bx - 6} ${by}l4 4.2 8-8.4" fill="none" class="wl" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>`);
  add("ok", [[0, "transform:scale(.92);opacity:0"], [2.85, "transform:scale(.92);opacity:0", EASE_OUT], [3.15, "transform:scale(1);opacity:1"], [4.6, "transform:scale(1);opacity:1", EASE_IN_OUT], [5.2, "transform:scale(.92);opacity:0"]], "transform-box:fill-box;transform-origin:50% 50%;opacity:0;");

  return L.finish({ meta });
}

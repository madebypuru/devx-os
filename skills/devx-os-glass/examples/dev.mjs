// AI Developer Platform: "Golden paths, so teams build fast without rebuilding the stack." The approved panel
// (illos/devx/pieces/dev.mjs: a grid of templates, a golden path, a running app) redrawn in Lucid: the same layout and
// story, the material now the base style's glass (frosted panes, lit rims, additive inner glows, white glyphs, a beam
// of light for the path) on the coral field.
// Sequence, as it really happens: the cursor moves to the RAG tile and clicks it; only then does that tile's edge
// light (picked); only then does a pulse of light run along the golden path from the tile to the app; as it lands, the
// app's first dot lights (running) and its content lines fill in one after another; then the tile's edge dims and the
// cursor drifts away; before the seam the app's lines and dot fade back to idle.
// 0.00 to 0.70 s: the cursor eases onto the RAG tile (EASE_IN_OUT); 0.72 to 0.95 s it presses (the glyph dips .92).
// 0.95 to 1.30 s: the tile's edge lights (EASE_OUT).
// 1.40 s on: a pulse runs tile to app along the path (linear); it lands at about 2.05 s.
// 2.05 to 2.35 s: the first dot lights (EASE_OUT); 2.10 to 3.10 s the four content lines draw on in turn (EASE_OUT).
// 3.30 to 3.90 s: the tile's edge dims; 3.90 to 4.90 s the cursor drifts back (EASE_IN_OUT).
// 4.90 to 5.50 s: the lines and the dot fade back to idle (EASE_OUT). Rest to 6.0 s.
// Seam (6.0 s = 0 s): grid at rest, app idle, cursor beside the grid: the start frame and the reduced-motion still.
import { lucid, tileInner, R, EASE_OUT, EASE_IN_OUT, n } from "../kit/lucid-kit.mjs";

export const meta = {
  theme: "devx-glass",
  subject: "dev",
  name: "AI Developer Platform",
  size: "section",
  bleed: true,
  alt: "A grid of six glass template tiles on a coral field and a glass app window: a click picks the RAG template, a pulse of light runs along the golden path to the app, and the app's content fills in.",
};
export const params = {};

const CLS = "dx-dev";
const T = 6;
const W = 772;
const H = 300;
const V = 260; // pulse speed, px per second
const LEN = 34; // pulse length

// The approved layout.
const TILE = { sw: 96, sd: 56, r: 14 };
const COLS = [28, 140, 252];
const ROWS = [66, 162];
const TILES = ROWS.flatMap((y) => COLS.map((x) => ({ x, y, cx: x + TILE.sw / 2, cy: y + TILE.sd / 2 })));
const PICK = 2; // the RAG tile, top right
const WIN = { x: 472, y: 58, w: 214, h: 178, r: 16 };
const DOTS = [0, 1, 2].map((i) => [WIN.x + 22 + i * 13, WIN.y + 20]);
const LINES = [
  { y: WIN.y + 58, len: 84, sw: 6 },
  { y: WIN.y + 82, len: 148, sw: 4 },
  { y: WIN.y + 100, len: 128, sw: 4 },
  { y: WIN.y + 118, len: 104, sw: 4 },
].map((l) => ({ ...l, x: WIN.x + 22 }));
// The golden path: from exactly the RAG tile's right edge to exactly the app window's left edge.
const PATH = [[COLS[2] + TILE.sw, ROWS[0] + TILE.sd / 2], [410, ROWS[0] + TILE.sd / 2], [410, WIN.y + WIN.h / 2], [WIN.x, WIN.y + WIN.h / 2]];
const TIP = [262, 146];
const PRESS = [TILES[PICK].cx + 4, TILES[PICK].cy + 5];

// Glyphs, white strokes centred on (x, y).
function circ(x, y, r) {
  return `M${n(x - r)} ${n(y)}A${n(r)} ${n(r)} 0 1 0 ${n(x + r)} ${n(y)}A${n(r)} ${n(r)} 0 1 0 ${n(x - r)} ${n(y)}Z`;
}
const G = {
  chat: (x, y) => `M${n(x - 5)} ${n(y - 5.5)}H${n(x + 5)}Q${n(x + 7)} ${n(y - 5.5)} ${n(x + 7)} ${n(y - 3.5)}V${n(y + 1.5)}Q${n(x + 7)} ${n(y + 3.5)} ${n(x + 5)} ${n(y + 3.5)}H${n(x - 1)}L${n(x - 4.5)} ${n(y + 6.5)}V${n(y + 3.5)}H${n(x - 5)}Q${n(x - 7)} ${n(y + 3.5)} ${n(x - 7)} ${n(y + 1.5)}V${n(y - 3.5)}Q${n(x - 7)} ${n(y - 5.5)} ${n(x - 5)} ${n(y - 5.5)}Z`,
  agent: (x, y) => `${circ(x, y - 4.5, 2.2)}${circ(x - 5, y + 4, 2.2)}${circ(x + 5, y + 4, 2.2)}M${n(x - 1.2)} ${n(y - 2.5)}L${n(x - 3.9)} ${n(y + 2)}M${n(x + 1.2)} ${n(y - 2.5)}L${n(x + 3.9)} ${n(y + 2)}M${n(x - 2.6)} ${n(y + 4)}H${n(x + 2.6)}`,
  rag: (x, y) => `M${n(x + 3.5)} ${n(y - 2.2)}V${n(y - 4)}L${n(x + 1)} ${n(y - 6.5)}H${n(x - 6.5)}V${n(y + 6.5)}H${n(x - 1.5)}M${n(x - 4)} ${n(y - 3)}H${n(x - 0.5)}M${n(x - 4)} ${n(y)}H${n(x - 2)}${circ(x + 2.5, y + 2.5, 3)}M${n(x + 4.7)} ${n(y + 4.7)}L${n(x + 7)} ${n(y + 7)}`,
  batch: (x, y) => `M${n(x - 4.5)} ${n(y - 1)}H${n(x + 4.5)}Q${n(x + 6)} ${n(y - 1)} ${n(x + 6)} ${n(y + 0.5)}V${n(y + 4.5)}Q${n(x + 6)} ${n(y + 6)} ${n(x + 4.5)} ${n(y + 6)}H${n(x - 4.5)}Q${n(x - 6)} ${n(y + 6)} ${n(x - 6)} ${n(y + 4.5)}V${n(y + 0.5)}Q${n(x - 6)} ${n(y - 1)} ${n(x - 4.5)} ${n(y - 1)}ZM${n(x - 4.5)} ${n(y - 3.8)}H${n(x + 4.5)}M${n(x - 3)} ${n(y - 6.4)}H${n(x + 3)}`,
  search: (x, y) => `${circ(x - 1.5, y - 1.5, 4.5)}M${n(x + 1.8)} ${n(y + 1.8)}L${n(x + 6)} ${n(y + 6)}`,
  eval: (x, y) => `M${n(x - 6)} ${n(y + 0.5)}L${n(x - 2)} ${n(y + 4.5)}L${n(x + 6)} ${n(y - 4.5)}`,
};
const ORDER = ["chat", "agent", "rag", "batch", "search", "eval"];

export function render() {
  const L = lucid(CLS, { w: W, h: H, T, field: "coral" });
  const { defs, over, push, add, glass, k } = L;
  L.field();
  const o = (v) => `opacity:${v}`;
  const rr = (x, y, w, h, r) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;

  // ---- The golden path: a beam of light (static, soft), exactly from the tile's edge to the window's edge.
  const pathD = k.rounded(PATH, 28);
  defs.push(`<filter id="${CLS}-beam" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter>`);
  push(`<path d="${pathD}" fill="none" stroke-width="7" stroke-linecap="round" class="wl" stroke-opacity=".22" filter="url(#${CLS}-beam)"/><path d="${pathD}" fill="none" stroke-width="1.4" class="wl" stroke-opacity=".7"/>`, { backdrop: true });
  // its pulse: additive light, unblurred (it moves)
  const P0 = 1.4;
  const L0 = k.length(PATH, 28);
  const travel = (L0 + LEN * 2) / V;
  const land = P0 + L0 / V;
  over.push(`<g class="add"><path class="pulse" d="${pathD}" fill="none" stroke-width="3" stroke-linecap="round" style="stroke:${R("white")}" stroke-dasharray="${LEN} ${n(L0 + LEN * 2)}"/></g>`);
  add("pulse", [[0, `stroke-dashoffset:${LEN}`], [P0, `stroke-dashoffset:${LEN}`], [P0 + travel, `stroke-dashoffset:${n(-L0 - LEN)}`], [P0 + travel + 0.02, `stroke-dashoffset:${LEN}`]], `stroke-dashoffset:${LEN};`);

  // ---- The template grid: six glass tiles (frosted, lit rim, inner glow), each named by its white glyph.
  TILES.forEach((t, i) => {
    const d = rr(t.x, t.y, TILE.sw, TILE.sd, TILE.r);
    const glyph = `<g transform="translate(${t.cx} ${t.cy}) scale(1.7) translate(${-t.cx} ${-t.cy})"><path class="gl" d="${G[ORDER[i]](t.cx, t.cy)}"/></g>`;
    push(glass({ d, bbox: [t.x, t.y, t.x + TILE.sw, t.y + TILE.sd], box: [t.x - 12, t.y - 12, t.x + TILE.sw + 12, t.y + TILE.sd + 12], frost: 14, fill: `class="wht" opacity=".16"`, stroke: { c: "white", w: 0.5 }, inner: tileInner, lit: [0.9, 0.5], bevel: [10, 0.16] }));
    if (i !== PICK) return push(glyph);
    // the picked tile: its glyph dips on the click, its edge lights
    push(`<g class="press">${glyph}</g><path class="edge" d="${d}" fill="none" style="stroke:${R("white")}" stroke-width="2.4"/>`);
  });
  add("press", [[0, "transform:scale(1)"], [0.72, "transform:scale(1)", EASE_OUT], [0.82, "transform:scale(.92)", EASE_OUT], [0.95, "transform:scale(1)"]], "transform-box:fill-box;transform-origin:50% 50%;");
  add("edge", [[0, o(0)], [0.95, o(0), EASE_OUT], [1.3, o(1)], [3.3, o(1), EASE_OUT], [3.9, o(0)]], "opacity:0;");

  // ---- The app: a glass window, its dots, idle content lines; it comes alive as the template lands.
  const winD = rr(WIN.x, WIN.y, WIN.w, WIN.h, WIN.r);
  push(glass({ d: winD, bbox: [WIN.x, WIN.y, WIN.x + WIN.w, WIN.y + WIN.h], box: [WIN.x - 12, WIN.y - 12, WIN.x + WIN.w + 12, WIN.y + WIN.h + 12], frost: 18, fill: `class="wht" opacity=".2"`, stroke: { c: "white", w: 0.5 }, inner: tileInner, lit: [0.9, 0.5], bevel: [12, 0.18] }));
  push(`<path d="M${WIN.x + 10} ${WIN.y + 36}H${WIN.x + WIN.w - 10}" class="wl" stroke-width=".9" stroke-opacity=".55"/>`);
  push(DOTS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" class="wht" opacity=".45"/>`).join(""));
  push(LINES.map((l) => `<path d="M${l.x} ${l.y}h${l.len}" class="wl" stroke-width="${l.sw}" stroke-linecap="round" stroke-opacity=".22"/>`).join(""));
  const [d0x, d0y] = DOTS[0];
  defs.push(`<radialGradient id="${CLS}-dg" cx=".5" cy=".5" r=".5"><stop offset="0" style="stop-color:${R("white")}" stop-opacity=".9"/><stop offset="1" style="stop-color:${R("white")}" stop-opacity="0"/></radialGradient>`);
  over.push(`<g class="live"><g class="add"><circle cx="${d0x}" cy="${d0y}" r="11" fill="url(#${CLS}-dg)"/></g><circle cx="${d0x}" cy="${d0y}" r="4" style="fill:${R("tmint")}"/></g>`);
  add("live", [[0, o(0)], [land, o(0), EASE_OUT], [land + 0.3, o(1)], [4.9, o(1), EASE_OUT], [5.5, o(0)]], "opacity:0;");
  LINES.forEach((l, i) => {
    const s = land + 0.05 + i * 0.2;
    const hide = `stroke-dashoffset:${l.len};opacity:0`;
    over.push(`<path class="ln${i}" d="M${l.x} ${l.y}h${l.len}" fill="none" style="stroke:${R("white")}" stroke-width="${l.sw}" stroke-linecap="round" stroke-dasharray="${l.len} ${l.len + 20}"/>`);
    add(`ln${i}`, [[0, hide], [s - 0.01, hide], [s, `stroke-dashoffset:${l.len};opacity:1`, EASE_OUT], [s + 0.4, "stroke-dashoffset:0;opacity:1"], [4.9 + i * 0.08, "stroke-dashoffset:0;opacity:1", EASE_OUT], [5.4 + i * 0.08, "stroke-dashoffset:0;opacity:0"], [5.75, hide]], hide + ";");
  });

  // ---- The cursor, over everything.
  const dx = PRESS[0] - TIP[0];
  const dy = PRESS[1] - TIP[1];
  over.push(k.cursor(TIP[0], TIP[1], { cls: "cur-move" }));
  add("cur-move", [[0, "transform:translate(0px,0px)", EASE_IN_OUT], [0.7, `transform:translate(${dx}px,${dy}px)`], [3.9, `transform:translate(${dx}px,${dy}px)`, EASE_IN_OUT], [4.9, "transform:translate(0px,0px)"]]);

  const gl = `.gl{fill:none;stroke:var(--illos-dx-white,var(--_dx-white));stroke-width:1.3px;stroke-linecap:round;stroke-linejoin:round}`;
  return L.finish({ meta, css: gl });
}

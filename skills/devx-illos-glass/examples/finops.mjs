// AI FinOps and Observability, in Lucid. The approved sample (lucid.mjs) is the base: its field, its glowing ring, its
// glass stack and coin. The user's render (illos/devx/reference-finops-base.png) gives the story: models queue in from
// the side, go in through a hole in one coin, the stack opens and works out what each one cost, and each comes out on
// its own lane (coral, mint, lilac) to the reading at its end (data, time, health); the stack closes; the loop repeats.
// The stack is the sample's, untouched (its thin glass bands, edges and frosted coin); the coin that opens is the second
// one: a hole in it opens from a closed slit to a glowing gate, and closes again.
// Sequence, as it really happens: the gate in the coin opens to take the calls; the queue moves up and each model goes
// in through it in turn and is not seen inside; it comes out on the other side, at the right edge,
// onto its own lane and runs along it while the lane's meter fills behind it; it reaches the reading, which lights;
// once all three are out, the gate closes; the next three slide in from the left and queue up.
// 0.30 to 0.80 s: the gate opens: it fades in as it grows to full size (EASE_OUT), its light coming up.
// 0.90 to 2.10 s: the queue moves up three places (linear); model i reaches the hole at e(i) and fades into it.
// e(i) + 0.50 to + 1.30 s: model i runs out along lane i (EASE_IN_OUT); the lane's meter fills behind it.
// e(i) + 1.30 s: the reading at the end of lane i lights (EASE_OUT).
// 3.70 to 4.15 s: the gate closes: it shrinks a little as it fades out, the coin whole again (EASE_IN_OUT); the meters
//   empty.
// 4.00 to 5.70 s: the next three models slide in from the left to the queue (SHEET).
// Seam (6.0 s = 0 s): gate closed, three models queued, lanes empty: the start frame and the reduced-motion still.
import { lucid, PARTS, TILE, GROUND, centre, tileInner, R, EASE_OUT, EASE_IN_OUT, SHEET, n } from "../kit/lucid-kit.mjs";

export const meta = {
  theme: "devx-glass",
  subject: "finops",
  name: "AI FinOps",
  size: "section",
  bleed: true,
  alt: "A glass coin stack with a dollar sign on a glowing ring: model tiles queue into a hole in one coin, the stack opens, and each model comes out on its own lane to data, time and health readings, keeping every model's cost apart; then the stack closes.",
};
export const params = {};

const CLS = "dx-finops";
const W = 372;
const H = 300;
const T = 6.0;
const OX = -25; // the sample's 422 x 304 frame, moved onto the 372 x 300 panel
const OY = -2;
const P = (x, y) => [x + OX, y + OY];
const tl = (x, y) => `translate(${n(x + OX)} ${n(y + OY)})`;

// The sample's stack, untouched: coin at (154.1, 38.14), body at (154.1, 88.79). Its layers are discs on the sample's
// iso ellipse (rx 80.84, ry 46.68), each 20.13 thick; the second one (the coin under the $, its top face centred at
// y 112.74) carries the gate.
const CX = 154.1 + 80.84; // the stack's axis
const RX = 80.84;
const RY = 46.68;
const GATE_COIN = { top: 112.74, t: 20.13 };
/** A disc layer's outline (its top face and its side), in the sample's space. */
function layer({ top, t }) {
  const x0 = CX - RX;
  const x1 = CX + RX;
  return `M${n(x0)} ${n(top)}V${n(top + t)}A${RX} ${RY} 0 0 0 ${n(x1)} ${n(top + t)}V${n(top)}A${RX} ${RY} 0 0 0 ${n(x0)} ${n(top)}Z`;
}
// The gate: a patch of the coin's side, from angle a0 to a1 (90 is the front, 180 the left), from depth h0 to h1.
const HOLE = { a0: 166, a1: 112, h0: 3.2, h1: 16.9 };
const onSide = (a, h, top = GATE_COIN.top) => [CX + RX * Math.cos((a * Math.PI) / 180), top + RY * Math.sin((a * Math.PI) / 180) + h];
function holePath(inset = 0) {
  const { a0, a1, h0, h1 } = HOLE;
  const A0 = a0 - inset * 1.4;
  const A1 = a1 + inset * 1.4;
  const pts = [];
  const r = 2.4;
  for (let a = A0 - 2; a >= A1 + 2; a -= 2) pts.push(onSide(a, h0 + inset));
  for (let h = h0 + inset + r; h <= h1 - inset - r; h += 1.5) pts.push(onSide(A1, h));
  for (let a = A1 + 2; a <= A0 - 2; a += 2) pts.push(onSide(a, h1 - inset));
  for (let h = h1 - inset - r; h >= h0 + inset + r; h -= 1.5) pts.push(onSide(A0, h));
  return `M${pts.map(([x, y]) => { const [a, b] = P(x, y); return `${n(a)} ${n(b)}`; }).join("L")}Z`;
}
const HOLE_C = onSide((HOLE.a0 + HOLE.a1) / 2, (HOLE.h0 + HOLE.h1) / 2);

// The queue: along the coin's outward direction at the hole, out to the lower left.
const ANG = ((HOLE.a0 + HOLE.a1) / 2) * (Math.PI / 180);
const OUTV = (() => {
  const v = [RX * Math.cos(ANG), RY * Math.sin(ANG)];
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l];
})();
const GAP = 40;
const TS = 0.62; // tile scale
const FIRST = 56; // the front place: clear of the stack's edge
const placeAt = (k) => [HOLE_C[0] + OUTV[0] * (FIRST + GAP * (k - 1)), HOLE_C[1] + OUTV[1] * (FIRST + GAP * (k - 1))];
const MODELS = [
  { tint: "tcoral", glyph: PARTS.glyph.spark },
  { tint: "tmint", glyph: PARTS.glyph.code, size: 19 },
  { tint: "tlilac", glyph: PARTS.glyph.knot },
];
const MOVE = [0.9, 2.1];
const ENTER = (i) => MOVE[0] + ((56 + 40 * i) / (56 + 80)) * (MOVE[1] - MOVE[0]); // reaches the gate: travel FIRST + GAP i

// The lanes: tinted glass bars that start exactly at the stack's right edge and rise to the right (the render's angle).
const LANE = { x: CX + RX, y: [101, 124, 147], len: 70, h: 17, slope: -0.3 };
const LANE_TF = (i) => `matrix(1 ${LANE.slope} 0 1 ${n(LANE.x + OX)} ${n(LANE.y[i] + OY)})`;

export function render() {
  const L = lucid(CLS, { w: W, h: H, T });
  const { defs, over, push, add, vec, glass, pane } = L;
  L.field();
  const tr = (x, y) => `transform:translate(${n(x)}px,${n(y)}px)`;
  const o = (v) => `opacity:${v}`;
  const glyph = ([d], tf) => `<path d="${d}" transform="${tf}" class="wht"/>`;

  // ---- The approved stack and ring, drawn by the kit exactly as signed off (moved onto the panel).
  L.stack({ ox: OX, oy: OY });

  // ---- The gate in the second coin: shut, nothing (the coin is whole); open, a dark opening into the coin with its floor
  // catching light, a cyan glow from inside, and a lit lip.
  const hole = holePath();
  defs.push(`<linearGradient id="${CLS}-hin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:${R("edge3")}"/><stop offset=".55" style="stop-color:${R("edge3")}" stop-opacity=".9"/><stop offset="1" style="stop-color:${R("edge1")}" stop-opacity=".85"/></linearGradient>`);
  defs.push(`<radialGradient id="${CLS}-hg" cx=".38" cy=".62" r=".55"><stop offset="0" style="stop-color:${R("beam2")}" stop-opacity=".85"/><stop offset=".6" style="stop-color:${R("cyan")}" stop-opacity=".3"/><stop offset="1" style="stop-color:${R("cyan")}" stop-opacity="0"/></radialGradient>`);
  push(`<g class="gate"><path d="${hole}" fill="url(#${CLS}-hin)"/><path d="${holePath(2.2)}" fill="none" class="wl" stroke-width=".8" stroke-opacity=".18"/><g class="add"><path d="${hole}" fill="url(#${CLS}-hg)"/></g><path d="${hole}" fill="none" class="wl" stroke-width=".9" stroke-opacity=".8"/></g>`);
  // shut, the coin is whole: no gate, no seam. It opens by growing a little and fading in, and closes the same way
  // back, so it never thins to a line
  const shut = "transform:scale(.82);opacity:0";
  add("gate", [[0, shut], [0.3, shut, EASE_OUT], [0.8, "transform:scale(1);opacity:1"], [3.7, "transform:scale(1);opacity:1", EASE_IN_OUT], [4.15, shut]], `transform-box:fill-box;transform-origin:50% 50%;${shut};`);

  // ---- A model goes into the gate and is not seen inside the coin: it comes out on the other side, on its lane.
  const tileOf = (m, s, x, y) => {
    const tf = TILE(x - 17.32 * s, y - 30 * s, s);
    return { tf, svg: pane({ d: PARTS.tile, tf, bbox: [0, 0, 40, 40], tint: m.tint, tintO: 0.5 }) + glyph(m.glyph, `${tf} ${centre(m.glyph, m.size || 22)}`) };
  };

  // ---- The lanes, from the stack's right edge: tinted glass, a meter that fills behind each model, its reading.
  const lanePath = `M0 0H${LANE.len - 6}A6 6 0 0 1 ${LANE.len} 6V${LANE.h - 6}A6 6 0 0 1 ${LANE.len - 6} ${LANE.h}H0Z`;
  const icon = [
    (x, y) => `<g class="wl" fill="none" stroke-width="1.2"><ellipse cx="${x}" cy="${y - 3}" rx="4.4" ry="1.7"/><path d="M${x - 4.4} ${y - 3}V${y + 3}A4.4 1.7 0 0 0 ${x + 4.4} ${y + 3}V${y - 3}M${x - 4.4} ${y}A4.4 1.7 0 0 0 ${x + 4.4} ${y}"/></g>`,
    (x, y) => `<g class="wl" fill="none" stroke-width="1.2" stroke-linecap="round"><circle cx="${x}" cy="${y}" r="4.6"/><path d="M${x} ${y - 2.6}V${y}L${x + 2} ${y + 1.3}"/></g>`,
    (x, y) => `<path class="wl" fill="none" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" d="M${x - 6} ${y}H${x - 2.6}L${x - 1.3} ${y - 3.4}L${x + 0.9} ${y + 3.4}L${x + 2.2} ${y}H${x + 6}"/>`,
  ];
  const lbox = [LANE.x + OX - 4, 50 + OY, LANE.x + OX + LANE.len + 6, 170 + OY];
  MODELS.forEach((m, i) => {
    const tf = LANE_TF(i);
    push(glass({ d: lanePath, tf, bbox: [0, 0, LANE.len, LANE.h], box: lbox, frost: 10, fill: `style="fill:${R(m.tint)}" opacity=".42"`, stroke: { c: "white", w: 0.4 }, inner: tileInner }));
    // the meter: the lane's own colour, brighter, filling from the stack out to the model
    const e = ENTER(i);
    const run = [e + 0.5, e + 1.3];
    const reach = LANE.len - 26;
    push(`<g transform="${tf}"><g class="meter${i}"><rect x="0" y="2" width="${reach}" height="${LANE.h - 4}" rx="4" style="fill:${R(m.tint)}" opacity=".55"/><rect x="0" y="2" width="${reach}" height="3" rx="1.5" class="wht" opacity=".45"/></g></g>`);
    add(`meter${i}`, [[0, "transform:scaleX(0)"], [run[0], "transform:scaleX(0)", EASE_IN_OUT], [run[1], "transform:scaleX(1)"], [3.7, "transform:scaleX(1)", EASE_OUT], [4.3, "transform:scaleX(0)"]], "transform-box:fill-box;transform-origin:0 50%;transform:scaleX(0);");
    // the reading: a soft chip with the icon; it lights when the model arrives
    const cx = LANE.len - 13;
    const cy = LANE.h / 2;
    push(`<g transform="${tf}"><rect x="${cx - 8}" y="${cy - 6.5}" width="16" height="13" rx="4" class="wht" opacity=".22"/>${icon[i](cx, cy)}</g>`);
    defs.push(`<radialGradient id="${CLS}-r${i}" cx=".5" cy=".5" r=".5"><stop offset="0" style="stop-color:${R("white")}" stop-opacity=".9"/><stop offset="1" style="stop-color:${R("white")}" stop-opacity="0"/></radialGradient>`);
    over.push(`<g transform="${tf}"><g class="read${i} add"><ellipse cx="${cx}" cy="${cy}" rx="15" ry="12" fill="url(#${CLS}-r${i})"/></g></g>`);
    add(`read${i}`, [[0, o(0)], [run[1] - 0.05, o(0), EASE_OUT], [run[1] + 0.15, o(1), EASE_OUT], [run[1] + 0.85, o(0)]], "opacity:0;");
    // the model running out along its lane
    const s = 0.34;
    const ride = `<g transform="${tf} translate(1 ${n((LANE.h - 40 * s) / 2)}) scale(${s})">${pane({ d: PARTS.tile, bbox: [0, 0, 40, 40], tint: m.tint, tintO: 0.65, frostO: 0.25 })}${glyph(m.glyph, centre(m.glyph, m.size || 22))}</g>`;
    over.push(`<g class="ride${i}"><g class="rideo${i}">${ride}</g></g>`);
    const dx = reach - 6;
    add(`ride${i}`, [[0, tr(0, 0)], [run[0], tr(0, 0), EASE_IN_OUT], [run[1], tr(dx, dx * LANE.slope)], [run[1] + 0.4, tr(dx, dx * LANE.slope)], [run[1] + 0.42, tr(0, 0)]]);
    add(`rideo${i}`, [[0, o(0)], [run[0], o(0), EASE_OUT], [run[0] + 0.2, o(1)], [run[1], o(1), EASE_OUT], [run[1] + 0.35, o(0)]], "opacity:0;");
  });

  // ---- The queue: the three models, in front of the stack, moving up into the hole; the next three slide in.
  MODELS.forEach((m, i) => {
    const [cx, cy] = P(...placeAt(i + 1));
    const t = tileOf(m, TS, cx, cy);
    // its thickness: the same tile, a little behind and darker
    const back = `<g transform="translate(${n(OUTV[0] * -3)} ${n(OUTV[1] * -3)}) ${t.tf}"><path d="${PARTS.tile}" style="fill:${R(m.tint)}" opacity=".55"/><path d="${PARTS.tile}" class="fld" opacity=".25"/></g>`;
    over.push(`<g class="q${i}"><g class="qs${i}">${back}${t.svg}</g></g>`);
    const step = (d) => tr(-OUTV[0] * d, -OUTV[1] * d); // a move of d px along the queue's line
    const e = ENTER(i);
    const from = 3.4; // places back, off the left edge
    add(`q${i}`, [[0, step(0)], [MOVE[0], step(0)], [e, step(FIRST + GAP * i)], [e + 0.02, step(-from * GAP)], [4.0, step(-from * GAP), SHEET], [5.7, step(0)]]);
    // it fades into the gate, narrowing to its height; it is back, full size, by the time it rejoins the queue
    add(`qs${i}`, [[0, "transform:scale(1);opacity:1"], [e - 0.35, "transform:scale(1);opacity:1", EASE_IN_OUT], [e - 0.1, "transform:scale(.55);opacity:1", EASE_OUT], [e, "transform:scale(.42);opacity:0"], [e + 0.02, "transform:scale(.92);opacity:0"], [4.0, "transform:scale(.92);opacity:0", EASE_OUT], [4.8, "transform:scale(1);opacity:1"]], "transform-box:fill-box;transform-origin:50% 50%;");
  });

  return L.finish({ meta });
}

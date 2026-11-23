// AI Landing Zone: "The secure ground floor for every AI workload." In Lucid, from the user's reference
// (illos/devx/reference-landing-zone.webp) and their direction: the coin comes down from the top onto the base, and
// the space between them glows and works like a landing pad.
// The base is the landing zone: a wide glass disc with a keyhole in its front, the sample's glowing ring on it as the
// pad. The coin (the workload, a sparkle on its face) lands on a column of light that rises from the pad to meet it.
// Sequence, as it really happens: the coin rests, landed, on the lit column (the start: the story's best frame); it
// lifts off (the keyhole goes dark, the column fades back into the pad); it waits above; it comes down, and as it
// nears, the pad brightens and the column of light rises to meet it; it touches down on the column, a ring of light
// runs out over the pad, and only then does the keyhole light: landed and secured.
// 0.40 to 0.70 s: the keyhole dims (EASE_OUT).
// 0.50 to 1.10 s: the column sinks back into the pad (EASE_IN_OUT); 0.70 to 1.70 s the coin lifts 72 px (EASE_IN_OUT).
// 1.70 to 2.50 s: it hovers (a slow bob).
// 2.50 to 3.95 s: it comes down (EASE_IN_OUT); 3.05 to 3.95 s the column rises from the pad to meet it and the pad
//   brightens; 3.95 s touchdown (1.5 px back up, settle).
// 3.95 to 4.70 s: a ring of light runs out over the pad (EASE_OUT); 4.05 to 4.40 s the keyhole lights.
// 4.70 to 6.00 s: landed; the column's light breathes.
// Seam (6.0 s = 0 s): landed, the column lit, the keyhole lit: the start frame and the reduced-motion still.
import { lucid, GROUND, PARTS, R, EASE_OUT, EASE_IN_OUT, n } from "../kit/lucid-kit.mjs";

export const meta = {
  theme: "devx-glass",
  subject: "landing",
  name: "AI landing zone",
  size: "section",
  bleed: true,
  alt: "A glass landing zone on a cyan field: a glass coin with a sparkle, the AI workload, comes down onto the base, a column of light rises from the landing pad to meet it, and the keyhole lights as it lands, secured.",
};
export const params = {};

const CLS = "dx-landing";
const W = 372;
const H = 300;
const T = 6.0;
const CX = 186;
const K = 0.5774; // the sample's iso ellipse

const BASE = { top: 192, rx: 124, t: 24 };
const COLUMN = { rx: 62, h: 34 }; // the light between the pad and the landed coin
const COIN = { rx: 74, t: 20 }; // the coin's face radius and its thickness
const LANDED_TOP = BASE.top - COLUMN.h - COIN.t; // the coin's top face centre when landed
const LIFT = 72;

export function render() {
  const L = lucid(CLS, { w: W, h: H, T, field: "cyan" });
  const { defs, over, push, add, glass, disc, coinPane } = L;
  L.field();
  const tr = (x, y) => `transform:translate(${n(x)}px,${n(y)}px)`;
  const o = (v) => `opacity:${v}`;
  const ry = (rx) => rx * K;

  // ---- The base and its pad (the sample's ring, scaled onto it).
  disc({ cx: CX, top: BASE.top, rx: BASE.rx, t: BASE.t, box: [50, 110, 322, 300] });
  const rs = 96 / (1.2247 * 98.48);
  const RING = GROUND(CX - 170.92 * rs, BASE.top, rs);
  push(glass({ d: PARTS.circle, tf: RING, bbox: [0, 0, 197.37, 197.37], stroke: { c: "cyan", w: 0.41 }, inner: { dy: 1.84, r: 13.87, spread: 4.15, a: 1 }, light: false }), { backdrop: true });
  // the pad brightens as the coin nears, and stays lit while it is landed
  defs.push(`<radialGradient id="${CLS}-pg" gradientUnits="userSpaceOnUse" cx="98.68" cy="100.5" r="98.5"><stop offset=".55" style="stop-color:${R("beam2")}" stop-opacity="0"/><stop offset=".85" style="stop-color:${R("beam2")}" stop-opacity=".5"/><stop offset="1" style="stop-color:${R("white")}" stop-opacity=".9"/></radialGradient>`);
  push(`<g class="pad add"><path d="${PARTS.circle}" transform="${RING}" fill="url(#${CLS}-pg)"/></g>`);
  add("pad", [[0, o(0.75)], [0.5, o(0.75), EASE_IN_OUT], [1.1, o(0.15)], [3.05, o(0.15), EASE_IN_OUT], [3.95, o(1), EASE_OUT], [4.7, o(0.75)]], "opacity:.75;");

  // ---- The keyhole in the base's front: dark, and lit while the coin is landed (secured).
  const kx = CX;
  const ky = BASE.top + ry(BASE.rx) + BASE.t * 0.45;
  const keyhole = `M${n(kx)} ${n(ky - 7.5)}a4.2 4.2 0 0 1 2.2 7.8l1.3 6.2h-7l1.3-6.2a4.2 4.2 0 0 1 2.2-7.8Z`;
  push(`<path d="${keyhole}" style="fill:${R("edge3")}" opacity=".75"/><path d="${keyhole}" fill="none" class="wl" stroke-width=".7" stroke-opacity=".7"/>`);
  defs.push(`<radialGradient id="${CLS}-kg" cx=".5" cy=".5" r=".5"><stop offset="0" style="stop-color:${R("beam2")}" stop-opacity=".95"/><stop offset="1" style="stop-color:${R("cyan")}" stop-opacity="0"/></radialGradient>`);
  push(`<g class="key add"><ellipse cx="${n(kx)}" cy="${n(ky)}" rx="15" ry="13" fill="url(#${CLS}-kg)"/><path d="${keyhole}" style="fill:${R("beam2")}"/></g>`);
  add("key", [[0, o(1)], [0.4, o(1), EASE_OUT], [0.7, o(0)], [4.05, o(0), EASE_OUT], [4.4, o(1)]]);

  // ---- The column of light between the pad and the coin: a glowing glass collar, brightest at the pad, with fine
  // vertical lights; it rises from the pad to meet the coin and sinks back into it.
  const cx0 = CX - COLUMN.rx;
  const cx1 = CX + COLUMN.rx;
  const cyTop = BASE.top - COLUMN.h;
  const colD = `M${n(cx0)} ${n(cyTop)}V${n(BASE.top)}A${n(COLUMN.rx)} ${n(ry(COLUMN.rx))} 0 0 0 ${n(cx1)} ${n(BASE.top)}V${n(cyTop)}A${n(COLUMN.rx)} ${n(ry(COLUMN.rx))} 0 0 1 ${n(cx0)} ${n(cyTop)}Z`;
  defs.push(`<linearGradient id="${CLS}-col" gradientUnits="userSpaceOnUse" x1="0" y1="${n(cyTop)}" x2="0" y2="${n(BASE.top + ry(COLUMN.rx))}"><stop offset="0" style="stop-color:${R("beam2")}" stop-opacity=".25"/><stop offset=".7" style="stop-color:${R("beam2")}" stop-opacity=".6"/><stop offset="1" style="stop-color:${R("white")}" stop-opacity=".8"/></linearGradient>`);
  defs.push(`<linearGradient id="${CLS}-cside" gradientUnits="userSpaceOnUse" x1="${n(cx0)}" y1="0" x2="${n(cx1)}" y2="0"><stop offset="0" style="stop-color:${R("white")}" stop-opacity=".55"/><stop offset=".25" style="stop-color:${R("white")}" stop-opacity="0"/><stop offset=".75" style="stop-color:${R("white")}" stop-opacity="0"/><stop offset="1" style="stop-color:${R("white")}" stop-opacity=".45"/></linearGradient>`);
  const lights = [0.18, 0.36, 0.64, 0.82]
    .map((f) => {
      const x = cx0 + (cx1 - cx0) * f;
      const yb = BASE.top + ry(COLUMN.rx) * Math.sin(Math.acos(2 * f - 1));
      return `<path d="M${n(x)} ${n(cyTop + ry(COLUMN.rx) * Math.sin(Math.acos(2 * f - 1)))}V${n(yb)}" class="wl" stroke-width=".8" stroke-opacity=".7"/>`;
    })
    .join("");
  push(`<g class="col"><g class="add"><path d="${colD}" fill="url(#${CLS}-col)"/><path d="${colD}" fill="url(#${CLS}-cside)"/>${lights}</g><path d="${colD}" fill="none" class="wl" stroke-width=".7" stroke-opacity=".6"/></g>`);
  const colOn = "transform:scaleY(1);opacity:1";
  const colOff = "transform:scaleY(.15);opacity:0";
  add("col", [[0, colOn], [0.5, colOn, EASE_IN_OUT], [1.1, colOff], [3.05, colOff, EASE_IN_OUT], [3.95, colOn]], "transform-box:fill-box;transform-origin:50% 100%;");
  // the column's light breathes while the coin is landed
  push(`<g class="breath add"><path d="${colD}" fill="url(#${CLS}-col)"/></g>`);
  add("breath", [[0, o(0.35), EASE_IN_OUT], [0.5, o(0)], [4.0, o(0), EASE_IN_OUT], [5.0, o(0.5), EASE_IN_OUT]], "opacity:.35;");

  // ---- The ring of light that runs out over the pad at touchdown.
  defs.push(`<radialGradient id="${CLS}-rp" gradientUnits="userSpaceOnUse" cx="98.68" cy="100.5" r="98.5"><stop offset=".86" style="stop-color:${R("white")}" stop-opacity="0"/><stop offset=".97" style="stop-color:${R("white")}" stop-opacity=".9"/><stop offset="1" style="stop-color:${R("white")}" stop-opacity="0"/></radialGradient>`);
  const rs2 = 70 / (1.2247 * 98.48);
  over.push(`<g class="ripple add"><path d="${PARTS.circle}" transform="${GROUND(CX - 170.92 * rs2, BASE.top, rs2)}" fill="url(#${CLS}-rp)"/></g>`);
  add("ripple", [[0, "transform:scale(1);opacity:0"], [3.95, "transform:scale(1);opacity:0", EASE_OUT], [4.0, "transform:scale(1);opacity:1", EASE_OUT], [4.7, "transform:scale(1.45);opacity:0"]], "transform-box:fill-box;transform-origin:50% 50%;opacity:0;");

  // ---- The coin: the approved coin as moving glass, with a sparkle, on its own glass band.
  const s = (COIN.rx * 2) / 161.68;
  const tf = `translate(${n(CX - 80.84 * s)} ${n(LANDED_TOP - 46.7 * s)}) scale(${n(s)})`;
  const r = 27;
  const c = r * 0.16;
  const star = `M0 ${-r}Q${c} ${-c} ${r} 0Q${c} ${c} 0 ${r}Q${-c} ${c} ${-r} 0Q${-c} ${-c} 0 ${-r}Z`;
  over.push(`<g class="coin"><g class="bob">${coinPane({ tf, s, t: COIN.t, symbol: { d: star, tf: `translate(80.84 46.7) scale(1 ${K})` } })}</g></g>`);
  add("coin", [[0, tr(0, 0)], [0.7, tr(0, 0), EASE_IN_OUT], [1.7, tr(0, -LIFT)], [2.5, tr(0, -LIFT), EASE_IN_OUT], [3.95, tr(0, 0.8)], [4.07, tr(0, -1.5), EASE_OUT], [4.2, tr(0, 0)]]);
  add("bob", [[0, tr(0, 0)], [1.7, tr(0, 0), EASE_IN_OUT], [2.1, tr(0, -2.5), EASE_IN_OUT], [2.5, tr(0, 0)]]);

  return L.finish({ meta });
}

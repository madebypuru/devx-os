// Lucid: the devx illustration style (Figma S6XrPqLuruYPOEZrv9Vdne 634:138, the approved sample in lucid.mjs).
// Edge-lit glass on a blue field: every pane frosts what is behind it, its rim catches a light from the top-left, its
// inner glows add light (plus-lighter), its strokes sit inside it. This module holds the method; scenes compose with it.
//
// How Figma's effects are rebuilt (its SVG export drops them; read them with use_figma when copying a frame):
// - GLASS (frost r, light angle 315, light intensity 1) and BACKGROUND_BLUR r: a blurred copy of the static backdrop
//   (the field and every layer that is not glass), clipped to the pane. Glass frost blurs at about its full radius,
//   a background blur at r / 2 (as Figma's export writes it). Never glass through glass: re-blurring the scene behind
//   every pane on every frame cost 2.6 phone cores.
// - The lit rim: an inside stroke whose white runs from the top-left (the light) to the bottom-right, quiet between.
// - INNER_SHADOW in LINEAR_DODGE: the shape's alpha, eroded by the spread, shifted, blurred, cut out of itself, in
//   white, added onto what is under it (mix-blend-mode: plus-lighter).
// - Strokes INSIDE: twice the width, clipped to the shape.
// Nothing that moves may carry a blur (frost, inner glow, soft edge): moving glass uses `pane()` instead, the same look
// built from gradients only.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { kit, keyframes, svgDoc, themeCss, n } from "./kit.mjs";

export { n, EASE_OUT, EASE_IN_OUT, SHEET } from "./kit.mjs";

const REF = join(dirname(fileURLToPath(import.meta.url)), "ref-634-138");
export const R = (role) => `var(--illos-dx-${role},var(--_dx-${role}))`;
// Colours in the sample frame's exported vectors, to the kit's roles.
const ROLE = { white: "white", "#ffffff": "white", "#d9d9d9": "white", "#82ffff": "cyan", "#9affff": "beam", "#b0ffff": "beam2", "#a3f9ff": "beam3", "#607bff": "edge1", "#6b87ff": "edge2", "#446dff": "edge3" };
const role = (c) => R(ROLE[c.toLowerCase()]);
export const read = (f) => readFileSync(join(REF, `${f}.svg`), "utf8");
/** The shapes a group export masks its inside strokes to, in order, and its other paths by id. */
export const masks = (f) => [...read(f).matchAll(/<mask id="[^"]+"[^>]*>\s*<path d="([^"]+)"\/>/g)].map((m) => m[1]);
export const pathById = (f, id) => read(f).match(new RegExp(`<path id="${id}"[^>]*?\\sd="([^"]+)"`))[1];

// The sample's parts, ready to place: the coin (rim, face, $), the body's five bands, the tile, the model and code
// glyphs, the ring. Shapes are in their own export's space; place them with a transform.
export const PARTS = {
  coin: { rim: masks("948cb")[0], face: pathById("948cb", "Vector_2"), dollar: pathById("948cb", "Vector_3"), w: 161.68, h: 93.39 },
  body: { bands: masks("c8ec3"), w: 162.04, h: 156.45 },
  tile: "M6 0H34A6 6 0 0 1 40 6V34A6 6 0 0 1 34 40H6A6 6 0 0 1 0 34V6A6 6 0 0 1 6 0Z",
  circle: "M0.2 98.68A98.48 98.48 0 1 0 197.16 98.68A98.48 98.48 0 1 0 0.2 98.68Z",
  glyph: {
    // [path, centre x, centre y, largest side]
    spark: [read("332f0").match(/<path id="Vector" d="([^"]+)"/)[1], 20, 21.75, 21.33],
    knot: [read("6ef14").match(/<path[^>]*\sd="([^"]+)"/)[1], 11.93, 12.1, 24.2],
    code: [read("8a7c9").match(/<path id="code_2" d="([^"]+)"/)[1], 11.45, 11.45, 19.08],
  },
};
// The isometric tile (the frame's transform), at (x, y), scaled by s.
const m3 = (v) => String(Math.round(v * 10000) / 10000); // matrix terms need more than two decimals (0.866, not 0.87)
export const TILE = (x, y, s = 1) => `matrix(${m3(0.866 * s)} ${m3(0.5 * s)} 0 ${m3(s)} ${n(x)} ${n(y)})`;
// The isometric ground plane (the frame's ring transform): a shape drawn flat in its own space lies on the ground.
export const GROUND = (x, y, s = 1) => `matrix(${m3(0.866 * s)} ${m3(-0.5 * s)} ${m3(0.866 * s)} ${m3(0.5 * s)} ${n(x)} ${n(y)})`;
/** A glyph centred in a 40-unit tile at `to` units (every icon centred and the same size). */
export const centre = ([, cx, cy, size], to = 22) => `translate(20 20) scale(${n(to / size)}) translate(${n(-cx)} ${n(-cy)})`;
export const tileInner = { dy: 1.45, r: 4.36, a: 0.52 };

/** A Lucid scene: `lucid(cls, { w, h, T })` gives the drawing tools; `finish()` returns the SVG. */
export function lucid(CLS, { w: W, h: H, T, field = "blue" }) {
  const k = kit(CLS, { w: W, h: H });
  const defs = [];
  const draw = [];
  const back = [];
  const over = [];
  const rules = [];
  const tracks = [];
  const extraBacks = [];
  let uid = 0;
  const id = (s) => `${CLS}-${s}${uid++}`;
  const push = (svg, { backdrop = false } = {}) => {
    draw.push(svg);
    if (backdrop) back.push(svg);
  };
  /** A track on the scene's cycle; stops are [s, css, easing]; it returns to its first value at the seam. */
  const add = (cls, stops, base = "") => {
    rules.push(`.${cls}{${base}animation:${CLS}_${cls} ${T}s linear}`);
    // a track that already ends at T (a linear run through the seam) keeps its own last value
    tracks.push(keyframes(`${CLS}_${cls}`, stops.at(-1)[0] >= T ? stops : [...stops, [T, stops[0][1]]], T));
  };

  /** One of the sample frame's exported vectors, at (x, y): ids prefixed, colours through the roles. */
  function vec(file, x, y) {
    const [, , inner] = read(file).match(/<svg([^>]*)>([\s\S]*)<\/svg>/);
    let body = inner.replace(/\bid="([^"]+)"/g, `id="${CLS}-${file}-$1"`).replace(/url\(#([^)]+)\)/g, `url(#${CLS}-${file}-$1)`);
    body = body.replace(/<([a-zA-Z]+)([^>]*?)(\/?)>/g, (m, tag, a, close) => {
      let style = "";
      a = a.replace(/\s(fill|stroke|stop-color|flood-color)="(white|#[0-9a-fA-F]{6})"/g, (_, prop, c) => ((style += `${prop}:${role(c)};`), ""));
      if (!style) return m;
      a += ` style="${style}"`;
      return `<${tag}${a}${close}>`;
    });
    return `<g transform="translate(${n(x)} ${n(y)})">${body}</g>`;
  }

  /** The lit rim's gradient over a box in the shape's own space, [top-left, bottom-right] opacities. */
  function litGrad([x0, y0, x1, y1], lit) {
    const g = id("l");
    defs.push(`<linearGradient id="${g}" gradientUnits="userSpaceOnUse" x1="${n(x0)}" y1="${n(y0)}" x2="${n(x1)}" y2="${n(y1)}"><stop offset="0" style="stop-color:${R("white")}" stop-opacity="${lit[0]}"/><stop offset=".32" style="stop-color:${R("white")}" stop-opacity="0"/><stop offset=".68" style="stop-color:${R("white")}" stop-opacity="0"/><stop offset="1" style="stop-color:${R("white")}" stop-opacity="${lit[1]}"/></linearGradient>`);
    return g;
  }

  /**
   * A static glass pane. d, tf: the shape and its transform. bbox: the shape's own box (for the light). box: its
   * screen box (the only area the frost blurs). frost: Figma's radius; sigma overrides the blur. src: the backdrop
   * ("B", or another one the scene defines). fill: an extra paint. stroke: { c, w, o } inside. inner: { dy, r,
   * spread, a } the additive inner glow. lit: the rim's two opacities; bevel: [width, opacity] of its wide band.
   * soft: a slight glow on the stroke (a deep bevel).
   */
  function glass({ d, tf = "", bbox, box, frost = 0, sigma = frost, src = "B", fill = "", stroke, inner, light = true, lit = [0.6, 0.35], bevel = [7, 0.12], soft = 0, extra = "" }) {
    const shape = (attrs) => `<path d="${d}"${attrs}/>`;
    const wrap = (s) => (tf ? `<g transform="${tf}">${s}</g>` : s);
    const clip = id("c");
    defs.push(`<clipPath id="${clip}">${tf ? `<path d="${d}" transform="${tf}"/>` : shape("")}</clipPath>`);
    let out = "";
    if (frost) {
      const f = id("f");
      const [bx0, by0, bx1, by1] = box;
      defs.push(`<filter id="${f}" filterUnits="userSpaceOnUse" x="${n(bx0)}" y="${n(by0)}" width="${n(bx1 - bx0)}" height="${n(by1 - by0)}"><feGaussianBlur stdDeviation="${n(Math.min(sigma, 100))}" edgeMode="duplicate"/></filter>`);
      out += `<g clip-path="url(#${clip})"><use href="#${CLS}-${src}" filter="url(#${f})"/></g>`;
    }
    if (fill) out += wrap(shape(` ${fill}`));
    if (inner) {
      const f = id("i");
      const s = inner.spread ? `<feMorphology in="SourceAlpha" operator="erode" radius="${n(inner.spread)}" result="e"/><feOffset in="e" dy="${n(inner.dy)}"/>` : `<feOffset in="SourceAlpha" dy="${n(inner.dy)}"/>`;
      defs.push(`<filter id="${f}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">${s}<feGaussianBlur stdDeviation="${n(inner.r / 2)}"/><feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 ${inner.a} 0"/></filter>`);
      out += `<g class="add">${wrap(shape(` class="wht" filter="url(#${f})"`))}</g>`;
    }
    if (light) {
      const g = litGrad(bbox, lit);
      out += `<g clip-path="url(#${clip})">${wrap(shape(` fill="none" stroke="url(#${g})" stroke-width="2.4"`) + shape(` fill="none" stroke="url(#${g})" stroke-width="${bevel[0]}" stroke-opacity="${bevel[1]}"`))}</g>`;
    }
    if (stroke) {
      let sf = "";
      if (soft) {
        sf = id("s");
        defs.push(`<filter id="${sf}" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="${n(soft)}"/></filter>`);
      }
      out += `<g clip-path="url(#${clip})">${wrap(shape(` fill="none" style="stroke:${R(stroke.c)}" stroke-width="${n(stroke.w * 2)}"${sf ? ` filter="url(#${sf})"` : ""}${stroke.o ? ` stroke-opacity="${stroke.o}"` : ""}`))}</g>`;
    }
    return out + extra;
  }

  /**
   * A glass pane that may move: the same look with no blur. tint: a role for coloured glass (or none for clear).
   * frostTo: the colour the frost would average to (default the field). The inner glow becomes a white band along
   * the top edge; the clip moves with the pane (it lives inside the pane's own transform).
   */
  function pane({ d, tf = "", bbox, tint = "", tintO = 0.42, frostO = 0.55, stroke = { c: "white", w: 0.363 }, lit = [0.75, 0.4], bevel = [7, 0.14], glow = 0.3 }) {
    const clip = id("p");
    defs.push(`<clipPath id="${clip}"><path d="${d}"/></clipPath>`);
    const [x0, y0, x1, y1] = bbox;
    const g = litGrad(bbox, lit);
    const top = id("t");
    defs.push(`<linearGradient id="${top}" gradientUnits="userSpaceOnUse" x1="0" y1="${n(y0)}" x2="0" y2="${n(y0 + (y1 - y0) * 0.35)}"><stop offset="0" style="stop-color:${R("white")}" stop-opacity="${glow}"/><stop offset="1" style="stop-color:${R("white")}" stop-opacity="0"/></linearGradient>`);
    const body =
      `<path d="${d}" class="fld" opacity="${frostO}"/><path d="${d}" class="wht" opacity=".1"/>` +
      (tint ? `<path d="${d}" style="fill:${R(tint)}" opacity="${tintO}"/>` : "") +
      `<g clip-path="url(#${clip})"><path d="${d}" fill="url(#${top})"/><path d="${d}" fill="none" stroke="url(#${g})" stroke-width="2.4"/><path d="${d}" fill="none" stroke="url(#${g})" stroke-width="${bevel[0]}" stroke-opacity="${bevel[1]}"/><path d="${d}" fill="none" style="stroke:${R(stroke.c)}" stroke-width="${n(stroke.w * 2)}"/></g>`;
    return tf ? `<g transform="${tf}">${body}</g>` : body;
  }

  /**
   * The field: the sample frame's colour bands (horizontal strips, each reaching its colour only past the right
   * edge), softened, the frame's noise as grain, lifted a little.
   */
  function fieldLayer() {
    const C = { x: -63.55, y: -45.18, w: 529 };
    const strip = (top, h, from, f0, f1) => {
      const at = (p) => C.x + C.w - (-533.04 + 999.965 * p) - (422 - W);
      const sid = `${CLS}-s${n(top)}`.replace(".", "_");
      const grad = from ? `<linearGradient id="${sid}" gradientUnits="userSpaceOnUse" x1="${n(at(f0))}" y1="0" x2="${n(at(f1))}" y2="0"><stop offset="0" style="stop-color:${from}"/><stop offset="1" style="stop-color:${R("field")}"/></linearGradient>` : "";
      return { grad, rect: `<rect x="-130" y="${n(C.y + top)}" width="${W + 260}" height="${n(h)}" ${from ? `fill="url(#${sid})"` : 'class="fld"'}/>` };
    };
    const strips = [strip(134.62, 123.5), strip(206.91, 135.41, R("live"), 0, 0.6518), strip(287.27, 55.04), strip(-0.5, 69.31, R("live"), 0, 0.6518), strip(68.81, 65.82, R("peach"), 0.398, 0.6812), strip(342.32, 68.69, R("live"), 0, 0.6518)];
    defs.push(...strips.map((s) => s.grad), `<filter id="${CLS}-soft-y" x="0" y="-20%" width="100%" height="140%"><feGaussianBlur stdDeviation="0 7"/></filter>`);
    push(`<rect class="fld" x="-130" y="-130" width="${W + 260}" height="${H + 260}"/><g filter="url(#${CLS}-soft-y)">${strips.map((s) => s.rect).join("")}</g>${k.ground().grain}<rect class="wht" width="${W}" height="${H}" opacity=".02"/>`, { backdrop: true });
  }

  /**
   * The approved frosted coin (634:220, as signed off): its rim (glass r12), its face (white wash, glass r93 over a
   * white disc of its own), a symbol with a very slight overlay shadow. tf places it (the sample's coin space, 161.68 x
   * 93.39, may be scaled); box and faceBox are the screen areas its frosts may blur. symbol: { d, tf } in coin space
   * (default the $). Returns the coin's own backdrop id.
   */
  let coins = 0;
  function coin({ tf, box, faceBox, symbol } = {}) {
    const k = coins++;
    const bd = k ? `BD${k}` : "BD";
    const disc = `<g transform="${tf}">${vec("aa9e7", 22.86, 21.97)}</g>`;
    push(disc);
    extraBacks.push(`<g id="${CLS}-${bd}"><use href="#${CLS}-B"/>${disc}</g>`);
    const { rim, face, dollar } = PARTS.coin;
    if (!k) defs.push(`<linearGradient id="${CLS}-wash" gradientUnits="userSpaceOnUse" x1="80.84" y1="12.2" x2="80.84" y2="81.19"><stop offset="0" style="stop-color:${R("white")}" stop-opacity=".66"/><stop offset="1" style="stop-color:${R("white")}" stop-opacity=".33"/></linearGradient><filter id="${CLS}-dsh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.2"/></filter>`);
    const sym = symbol || { d: dollar, tf: "" };
    const at = `${tf}${sym.tf ? ` ${sym.tf}` : ""}`;
    push(glass({ d: rim, tf, bbox: [0, 0, 161.68, 93.39], box, frost: 12, src: "B", stroke: { c: "white", w: 0.363 }, inner: tileInner }));
    push(glass({ d: face, tf, bbox: [16.4, 12.2, 145.3, 81.2], box: faceBox, frost: 93, sigma: 60, src: bd, fill: `fill="url(#${CLS}-wash)" fill-opacity=".2"`, stroke: { c: "white", w: 1.1, o: 0.8 }, soft: 0.7, lit: [0.8, 0.9], bevel: [16, 0.2] }) + `<path d="${sym.d}" transform="${at} translate(0 1.2)" class="ink ovl" opacity=".45" filter="url(#${CLS}-dsh)"/><path d="${sym.d}" transform="${at}" class="wht"/>`);
    return bd;
  }

  /**
   * The approved coin as glass that may move (gradients only, no blur): a disc band under it (its thickness, with the
   * sample's lit front edges), its rim, its face (the frosted white disc as a radial wash, tuned to the static coin),
   * a crisp lit edge, the symbol with its slight overlay shadow. Same coin space and arguments as `coin()`, plus t:
   * the band's thickness under the coin (in screen units, already scaled). Returns the SVG; the scene animates it.
   */
  function coinPane({ tf, s = 1, t = 0, symbol, face = [0.56, 0.4, 0.3] }) {
    const { rim, face: faceD, dollar } = PARTS.coin;
    const sym = symbol || { d: dollar, tf: "" };
    const g = id("cf");
    defs.push(`<radialGradient id="${g}" gradientUnits="userSpaceOnUse" cx="80.84" cy="50" r="66"><stop offset="0" style="stop-color:${R("white")}" stop-opacity="${face[0]}"/><stop offset=".72" style="stop-color:${R("white")}" stop-opacity="${face[1]}"/><stop offset="1" style="stop-color:${R("white")}" stop-opacity="${face[2]}"/></radialGradient>`);
    let band = "";
    if (t) {
      // the band in coin space: the rim's ellipse (80.84 x 46.7) carried down by t / s
      const tt = t / s;
      const d = `M0 46.7V${n(46.7 + tt)}A80.84 46.7 0 0 0 161.68 ${n(46.7 + tt)}V46.7A80.84 46.7 0 0 0 0 46.7Z`;
      const fr = (y) => `M1 ${n(y)}A79.84 45.7 0 0 0 160.68 ${n(y)}`;
      band = pane({ d, bbox: [0, 0, 161.68, 93.39 + tt], frostO: 0.55, lit: [0.6, 0.35], glow: 0.2 }) + `<path d="${fr(46.7)}" fill="none" class="wl" stroke-width="${n(1.1 / s)}" stroke-opacity=".85"/><path d="${fr(46.7 + tt)}" fill="none" style="stroke:${R("edge1")}" stroke-width="${n(0.8 / s)}" stroke-opacity=".8"/>`;
    }
    const at = sym.tf ? ` transform="${sym.tf}"` : "";
    const body =
      band +
      pane({ d: rim, bbox: [0, 0, 161.68, 93.39], frostO: 0.62, lit: [0.7, 0.4], bevel: [8, 0.14], glow: 0.32 }) +
      `<path d="${faceD}" class="fld" opacity=".3"/><path d="${faceD}" fill="url(#${g})"/>` +
      pane({ d: faceD, bbox: [16.4, 12.2, 145.3, 81.2], frostO: 0, stroke: { c: "white", w: 1.1 }, lit: [0.85, 0.9], bevel: [16, 0.2], glow: 0.1 }) +
      `<g${at}><path d="${sym.d}" transform="translate(0 1.2)" class="ink ovl" opacity=".3"/><path d="${sym.d}" class="wht"/></g>`;
    return `<g transform="${tf}">${body}</g>`;
  }

  /**
   * A glass disc layer on the sample's iso ellipse (ry = 0.577 rx unless given): its outline (top face and side) as
   * the sample's body glass, and the lit edges the sample draws on its layers (a white arc along the top face's front,
   * a blue arc along the bottom). top: the top face's centre y; t: thickness; box: the screen area its frost blurs.
   */
  function disc({ cx, top, rx, ry = rx * 0.5774, t, box, frost = 11, edge = "white" }) {
    const x0 = cx - rx;
    const x1 = cx + rx;
    const d = `M${n(x0)} ${n(top)}V${n(top + t)}A${n(rx)} ${n(ry)} 0 0 0 ${n(x1)} ${n(top + t)}V${n(top)}A${n(rx)} ${n(ry)} 0 0 0 ${n(x0)} ${n(top)}Z`;
    const style = edge === "cyan" ? { stroke: { c: "cyan", w: 0.52 }, inner: { dy: 2.08, r: 6.25, a: 0.52 } } : { stroke: { c: "white", w: 0.363 }, inner: tileInner };
    const front = (y) => `M${n(x0 + 1)} ${n(y)}A${n(rx - 1)} ${n(ry - 1)} 0 0 0 ${n(x1 - 1)} ${n(y)}`;
    push(glass({ d, bbox: [x0, top - ry, x1, top + t + ry], box, frost, ...style }) + `<path d="${front(top)}" fill="none" class="wl" stroke-width="1.1" stroke-opacity=".85"/><path d="${front(top + t)}" fill="none" style="stroke:${R("edge1")}" stroke-width=".8" stroke-opacity=".8"/>`);
    return { d, x0, x1, top, t, rx, ry, cx };
  }

  /**
   * The approved stack (Figma 634:138, as signed off in lucid.mjs), placed at (ox, oy) from the sample's own frame:
   * the light inside it, the ring, the lower edges, the shafts and the white disc under the face, the frosted coin
   * (rim, face, $ with its overlay shadow), the body's five glass bands. Every scene that shows the stack draws it from
   * here, so it can never drift from the approved one. `between` is drawn after the coin and before the body (the
   * sample's beam). Returns the shapes and transforms a scene needs to place things against it.
   */
  function stack({ ox = 0, oy = 0, between = "" } = {}) {
    const t = (x, y) => `translate(${n(x + ox)} ${n(y + oy)})`;
    push(vec("602e2", 153.6 + ox, 94.01 + oy), { backdrop: true });
    const RING = GROUND(63.41 + ox, 210.49 + oy);
    push(glass({ d: PARTS.circle, tf: RING, bbox: [0, 0, 197.37, 197.37], stroke: { c: "cyan", w: 0.41 }, inner: { dy: 1.84, r: 13.87, spread: 4.15, a: 1 }, light: false }), { backdrop: true });
    push(vec("6a009", 154.37 + ox, 168.37 + oy) + vec("974be", 152.29 + ox, 127.11 + oy), { backdrop: true });
    push(vec("5e9ec", 286.91 + ox, 69.53 + oy) + vec("8189d", 169.43 + ox, 75.39 + oy) + vec("2a37f", 235.65 + ox, 73.71 + oy), { backdrop: true });
    const COIN = t(154.1, 38.14);
    const BODY = t(154.1, 88.79);
    coin({ tf: COIN, box: [150 + ox, 34 + oy, 320 + ox, 136 + oy], faceBox: [40 + ox, -60 + oy, 430 + ox, 230 + oy] });
    if (between) push(between, { backdrop: true });
    const bodyStyle = [
      { frost: 11, stroke: { c: "white", w: 0.363 }, inner: tileInner },
      { frost: 11, stroke: { c: "white", w: 0.363 }, inner: tileInner },
      { frost: 5.72, stroke: { c: "cyan", w: 0.52 }, inner: { dy: 2.08, r: 6.25, a: 0.52 } },
      { frost: 5.72, stroke: { c: "cyan", w: 0.52 }, inner: { dy: 2.08, r: 6.25, a: 0.52 } },
      { frost: 5.72, stroke: { c: "white", w: 0.52 }, inner: { dy: 2.08, r: 6.25, a: 0.52 } },
    ];
    PARTS.body.bands.forEach((d, i) => push(glass({ d, tf: BODY, bbox: [0, 0, 162, 157], box: [150 + ox, 85 + oy, 320 + ox, 250 + oy], ...bodyStyle[i] })));
    return { COIN, BODY, RING };
  }

  /** The SVG: defs, the backdrop B (and any extra backdrops), the scene, the overlays. */
  function finish({ meta, extraBack = "", css = "" }) {
    const sheet = themeCss(CLS, { field, extra: `.add{mix-blend-mode:plus-lighter}.ovl{mix-blend-mode:overlay}\n${css}\n${rules.join("\n")}\n${tracks.join("\n")}` });
    const body = `<defs>${defs.join("")}<g id="${CLS}-B">${back.join("")}</g>${extraBacks.join("")}${extraBack}</defs>${draw.join("")}${over.join("")}`;
    return svgDoc(CLS, meta.name, sheet, `${k.defs()}\n${k.frame(body, 0)}`, { w: W, h: H, desc: meta.alt });
  }

  return { k, R, defs, draw, back, over, id, push, add, vec, glass, pane, litGrad, field: fieldLayer, stack, coin, coinPane, disc, finish };
}

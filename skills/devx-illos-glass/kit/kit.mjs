// devx Glass: the devx illustration style, after the branding frame xAIc5lMUT8WPvYoYZGeLYm 717:2075 (a white glass
// puck carrying the devx mark over a grainy brand-colour field, light shafts under it, white ribbons out to frosted
// cards that dissolve into soft pixel blocks at the edge, a green status dot and a short white label, a logo chip and
// a cursor). Its own kit, written for devx: it shares only the Illos checker's conventions (THEME, roles, the loop
// rule, keyframes), so `node ~/.claude/skills/illos-check/check.mjs <scene> --kit illos/devx/kit.mjs` checks it.
//
// Screen coordinates throughout (no isometric world): the canvas is `w` x `h`, 786 x 300 like the reference frame
// unless a scene asks for another size. Every colour goes through a role, so a page can recolour a drawing with
// --illos-<role> and the palette check holds.

export const n = (v) => String(Math.round(v * 100) / 100);
export const EASE_IN_OUT = "cubic-bezier(0.77,0,0.175,1)"; // a part travelling on screen
export const EASE_OUT = "cubic-bezier(0.23,1,0.32,1)"; // fades, flashes, landings
export const SHEET = "cubic-bezier(0.32,0.72,0,1)"; // settling into place, no overshoot

/** @keyframes from [seconds, css, easing-after] stops; throws if the times go backwards or past the cycle. */
export function keyframes(name, stops, total) {
  let last = -1;
  const body = stops
    .map(([t, css, ease]) => {
      if (t > total + 1e-9) throw new Error(`${name}: the stop at ${t} s is past the cycle (${total} s)`);
      const pct = Math.round((t / total) * 100000) / 1000;
      if (pct <= last) throw new Error(`${name}: keyframes out of order at ${t}s`);
      last = pct;
      return `${pct}%{${css}${ease ? `;animation-timing-function:${ease}` : ""}}`;
    })
    .join("");
  return `@keyframes ${name}{${body}}`;
}

// ---------------------------------------------------------------- colour
// One field per devx colour. `field` is the ground, `top` the band that washes in from the top edge, `fringe` the
// warm edge the lens leaves on the pixel blocks. The reference frame is coral (Corvane's client colour); cyan, mint,
// pink and blue are the What we build panels' colours (Figma 564:19913, sampled from assets/v29/pieces).
export const FIELDS = {
  coral: { field: "#f58a6b", top: "#fc88ab", fringe: "#ffe27a" },
  cyan: { field: "#6ac7dc", top: "#9b8cf7", fringe: "#ffe27a" },
  mint: { field: "#61cd9c", top: "#92e588", fringe: "#ffe27a" },
  pink: { field: "#fc88ab", top: "#ffc041", fringe: "#ffe27a" },
  blue: { field: "#658ff8", top: "#9b8cf7", fringe: "#ffe27a" },
  green: { field: "#4fb57a", top: "#92e588", fringe: "#ffe27a" },
  orange: { field: "#ff7342", top: "#ffc041", fringe: "#ffe27a" },
};
// The rest is the same on every field. The drawing carries its own ground, so light and dark are the same values.
// Roles are named dx-<role> (--illos-dx-field, ...): a page's Illos roles for the other styles never reach these.
const FIXED = { white: "#ffffff", paper: "#f7f6f3", ink: "#14162e", live: "#0bf789", alert: "#ff381c", chip: "#f1f1f1", glow: "#4b9efe",
  // the lucid style (Figma 634:138): cyan glow edges and beams, blue under-edges, the peach streak in the field
  cyan: "#82ffff", beam: "#9affff", beam2: "#b0ffff", beam3: "#a3f9ff", edge1: "#607bff", edge2: "#6b87ff", edge3: "#446dff", peach: "#fbac73",
  // tinted glass for things the story sorts (Lucid FinOps: the three models and their three lanes)
  tcoral: "#ff9b7d", tmint: "#4ff0d0", tlilac: "#a48bff" };
const roleSet = (f) => Object.fromEntries(Object.entries({ ...FIELDS[f], ...FIXED }).map(([r, v]) => [`dx-${r}`, { light: v, dark: v }]));
const ROLE_NAMES = Object.keys(roleSet("coral"));
const ref = (r) => `var(--illos-dx-${r},var(--_dx-${r}))`;

/** What the checker needs to know about this style. */
export const THEME = {
  id: "devx-glass",
  name: "devx Glass",
  prefix: "dx",
  palette: [...new Set([...Object.values(FIELDS).flatMap(Object.values), ...Object.values(FIXED)].map((c) => c.toLowerCase()))],
  roles: ROLE_NAMES,
  maxLabels: 4,
  darkOnly: false,
};

const LOOP = "*{animation-iteration-count:infinite!important;animation-play-state:var(--illos-play,running)!important}";

/** The style block: role fallbacks for the chosen field, every shared class, the scene's own CSS, the loop rule and
 * the reduced-motion rule. */
export function themeCss(cls, { field = "coral", extra = "" } = {}) {
  const decl = (mode) => Object.entries(roleSet(field)).map(([r, v]) => `--_${r}:${v[mode]}`).join(";");
  return `
@scope (svg.${cls}) {
:scope{stroke:none;${decl("light")}}
@media (prefers-color-scheme: dark){:scope{${decl("dark")}}}
.fld{fill:${ref("field")}}
.st-top{stop-color:${ref("top")}}.st-fld{stop-color:${ref("field")}}.st-w{stop-color:${ref("white")}}.st-fr{stop-color:${ref("fringe")}}
.pap{fill:${ref("paper")}}.tp{fill:${ref("top")}}.frn{fill:${ref("fringe")}}.wht{fill:${ref("white")}}.ink{fill:${ref("ink")}}
.wl{fill:none;stroke:${ref("white")}}.fld-s{stroke:${ref("field")}}
.chp{fill:${ref("chip")}}.chs{fill:${ref("glow")}}
.liv{fill:${ref("live")}}.alr{fill:${ref("alert")}}
.cur{fill:${ref("ink")};stroke:${ref("white")};stroke-width:1.6px;stroke-linejoin:round}
.txt{fill:${ref("white")};font-family:"Inter Display",Inter,system-ui,sans-serif;font-size:10.26px;letter-spacing:-.2px}
.gr{fill:${ref("white")}}
${extra}
${LOOP}
@media (prefers-reduced-motion: reduce){*{animation:none!important}}
}`;
}

/** The final <svg>. `desc` is the scene's meta.alt. The root stroke is the fallback a browser without @scope shows. */
export function svgDoc(cls, title, css, body, { w = 786, h = 300, desc } = {}) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const aria = desc ? ` aria-describedby="${cls}-d"` : "";
  return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" stroke="#14162e" role="img" aria-labelledby="${cls}-t"${aria}>
<title id="${cls}-t">${esc(title)}</title>${desc ? `\n<desc id="${cls}-d">${esc(desc)}</desc>` : ""}
<style>${css}
</style>
${body}
</svg>`;
}

// The pillar's columns, from the frame (puck rx 101): [x from the puck's left edge, top below the face centre, width,
// height, how much lower the column's left top corner sits, its wash centre (x, y) from the column's top left, and
// the wash's radii (down, across)].
const PILLAR = [
  [0.8, 17.3, 65.35, 160.15, 4.21, 28.75, 0.85, 125.18, 211.89],
  [66.1, 14.7, 39.47, 162.73, 2.59, 8.04, 23.69, 125.15, 211.84],
  [105.6, 9.5, 77, 167.91, 5.18, 33.81, 0.89, 132.13, 223.65],
  [182.6, 8.2, 19.74, 169.21, 1.29, 6.68, 35.2, 129.18, 218.66],
];

// ---------------------------------------------------------------- parts
// kit(cls, { w, h }) binds the parts to one drawing: every id is prefixed with the class so two drawings on one page
// never share a gradient or a filter.
export function kit(cls, { w = 786, h = 300 } = {}) {
  const id = (s) => `${cls}-${s}`;
  const defs = new Map(); // shared <defs>, written once by ground()
  const def = (key, svg) => (defs.has(key) ? null : defs.set(key, svg), `url(#${id(key)})`);

  // A white vertical wash, strong at the top and gone at the bottom: ribbons, the puck's face, the shafts.
  // It spans the canvas (userSpaceOnUse), not each shape's own box: a straight ribbon has no height, and a gradient
  // sized to its box would paint nothing.
  def("wash", `<linearGradient id="${id("wash")}" x1="0" y1="0" x2="0" y2="${h}" gradientUnits="userSpaceOnUse"><stop class="st-w" offset="0" stop-opacity=".66"/><stop class="st-w" offset="1" stop-opacity=".33"/></linearGradient>`);

  // The glass face every object shares: a translucent white wash with a brighter centre, softened slightly.
  def("face", `<radialGradient id="${id("face")}" cx=".5" cy=".62" r=".62"><stop class="st-w" offset="0" stop-opacity=".62"/><stop class="st-w" offset="1" stop-opacity=".3"/></radialGradient>`);
  def("soft", `<filter id="${id("soft")}" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter>`);

  /** A rounded orthogonal path through `pts` ([x, y] corners), each corner rounded by up to `r`. */
  function rounded(pts, r = 28) {
    let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i - 1];
      const [bx, by] = pts[i];
      const [cx, cy] = pts[i + 1];
      const l1 = Math.hypot(bx - ax, by - ay);
      const l2 = Math.hypot(cx - bx, cy - by);
      const rr = Math.min(r, l1 / 2, l2 / 2);
      const p1 = [bx - ((bx - ax) / l1) * rr, by - ((by - ay) / l1) * rr];
      const p2 = [bx + ((cx - bx) / l2) * rr, by + ((cy - by) / l2) * rr];
      d += `L${n(p1[0])} ${n(p1[1])}Q${n(bx)} ${n(by)} ${n(p2[0])} ${n(p2[1])}`;
    }
    const [ex, ey] = pts.at(-1);
    return `${d}L${n(ex)} ${n(ey)}`;
  }
  /** The length of the rounded path, for dash timing. */
  function length(pts, r = 28) {
    let L = 0;
    for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const corners = Math.max(0, pts.length - 2);
    return L - corners * r * (2 - Math.PI / 2);
  }

  /**
   * The ground: the flat field, a band of `top` colour washing down from the top edge, soft off-white pixel blocks
   * bleeding in from the right edge with a warm fringe on their inner side (the lens' aberration), and a fine white
   * grain over all of it. `blocks` is [[y, height], ...] in canvas units; `seed` varies the grain.
   */
  function ground({ blocks = [[-63, 61], [61, 56], [212, 77]], band = 0.12, grainSeed = 9721, edge = 90 } = {}) {
    // `edge`: how far the blocks reach in from the right edge (the frame's 90 on 786; about 50 on a narrow panel).
    const e = edge / 90;
    def("band", `<linearGradient id="${id("band")}" x1="0" y1="0" x2="0" y2="1"><stop class="st-top" offset="0" stop-opacity="${band}"/><stop class="st-top" offset=".65" stop-opacity="0"/></linearGradient>`);
    def("blur", `<filter id="${id("blur")}" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="5"/></filter>`);
    def("blurw", `<filter id="${id("blurw")}" x="-40%" y="-80%" width="180%" height="260%"><feGaussianBlur stdDeviation="8"/></filter>`);
    def(
      "grain",
      `<filter id="${id("grain")}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".78" numOctaves="3" seed="${grainSeed}" stitchTiles="stitch" result="n"/><feColorMatrix in="n" type="luminanceToAlpha" result="a"/><feComponentTransfer in="a"><feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"/></feComponentTransfer></filter>`,
    );
    let px = "";
    for (const [y, bh] of blocks) {
      // the warm fringe sits a little inside and below the block, the block itself runs off the right edge
      px += `<rect class="tp" x="${n(w - 96 * e)}" y="${n(y + bh * 0.45)}" width="${n(70 * e)}" height="${n(Math.max(8, bh * 0.5))}" opacity=".55" filter="url(#${id("blurw")})"/>`;
      px += `<rect class="frn" x="${n(w - 108 * e)}" y="${n(y + 4)}" width="${n(72 * e)}" height="${n(Math.max(8, bh - 10))}" filter="url(#${id("blurw")})"/>`;
      px += `<rect class="pap" x="${n(w - edge)}" y="${n(y)}" width="${n(edge + 56)}" height="${n(bh)}" filter="url(#${id("blur")})"/>`;
    }
    return {
      back: `<g class="dx-ground"><rect class="fld" width="${w}" height="${h}"/><rect width="${w}" height="${n(h * 0.38)}" fill="url(#${id("band")})"/></g>`,
      blocks: `<g class="dx-blocks">${px}</g>`,
      // drawn straight after the back, before the blocks: the grain sits on the field (and shows through the glass), never on white
      grain: `<g opacity=".065"><rect class="gr" width="${w}" height="${h}" filter="url(#${id("grain")})"/></g>`,
    };
  }

  /**
   * The puck: a thick white disk seen from above, its top face a translucent white wash with a brighter centre, a
   * white rim band under it, light shafts falling from its underside, and the devx mark on its face. (cx, cy) is the
   * centre of the top face; `rx`, `ry` its radii; `depth` the rim band. `markCls` lets a scene light the mark.
   */
  function puck({ cx, cy, rx = 98, ry = 55, depth = 18, markCls = "", faceCls = "", pillar = true, withMark = true, soft = true }) {
    // The pillar under the puck: the frame's four columns, edge to edge across the puck's width. Each starts behind
    // the puck (its slanted top is hidden by the rim, so the light seems to come out of the rim's curved edge) and
    // fades on its own wide radial wash centred at its top; the second and fourth are centred lower, so they stay
    // bright further down and the columns read as the facets of a translucent pillar base, not as lines.
    // [x from the puck's left, top below the face centre, width, height, slant, wash centre x, y, wash radii y, x]
    const sh = pillar ? pillarUnder(cx - rx, cy, (rx * 2) / 202) : "";
    const rim = `<path class="wht" d="M${n(cx - rx)} ${n(cy)}A${n(rx)} ${n(ry)} 0 0 0 ${n(cx + rx)} ${n(cy)}V${n(cy + depth)}A${n(rx)} ${n(ry)} 0 0 1 ${n(cx - rx)} ${n(cy + depth)}Z"/>`;
    const face = `<g${faceCls ? ` class="${faceCls}"` : ""}><ellipse class="fld" cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}"/><ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(ry)}" fill="url(#${id("face")})"${soft ? ` filter="url(#${id("soft")})"` : ""}/></g>`;
    const edge = `<ellipse class="wl" cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx - 0.6)}" ry="${n(ry - 0.6)}" stroke-width="1.2" stroke-opacity=".95"/>`;
    return `<g class="dx-puck">${sh}${rim}${face}${edge}${withMark ? mark(cx, cy + 3 * (rx / 101), rx / 98, markCls) : ""}</g>`;
  }

  /** The pillar of light (the frame's four columns) under a glass object whose left edge is at x0, its face centre
   * at y0, scaled by s (1 = the frame's 202-wide puck). Draw it before the object: the object's rim hides its tops. */
  function pillarUnder(x0, y0, s) {
    let sh = "";
    PILLAR.forEach(([px, py, pw, ph, slant, gx, gy, sy, sx], i) => {
      const X = x0 + px * s;
      const Y = y0 + py * s;
      const gid = `shaft${i}-${n(x0)}-${n(y0)}`.replace(/\./g, "_");
      def(gid, `<radialGradient id="${id(gid)}" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${n(X + gx * s)} ${n(Y + gy * s)}) rotate(90) scale(${n(sy * s)} ${n(sx * s)})"><stop class="st-w" offset="0"/><stop class="st-w" offset=".9749" stop-opacity="0"/></radialGradient>`);
      sh += `<path d="M${n(X)} ${n(Y + slant * s)}L${n(X + pw * s)} ${n(Y)}V${n(Y + ph * s)}H${n(X)}Z" fill="url(#${id(gid)})" opacity=".5"/>`;
    });
    return sh;
  }

  /**
   * A glass slab or tile in the puck's view: a rounded rectangle lying flat (its depth squashed to 0.54, like the
   * puck), a translucent white face, the solid white rim band under its near edge, a white top edge. (x, y) is the
   * top left of the face; `sw` its width, `sd` its on-screen depth; `r` the corner. `pillar` adds the light under it;
   * `soft` blurs the face's wash slightly (static parts only: never on anything that moves).
   */
  function slab({ x, y, sw, sd, depth = 14, r = 14, pillar = false, soft = true, faceCls = "" }) {
    const ry = r * 0.54;
    const face = `<rect x="${n(x)}" y="${n(y)}" width="${n(sw)}" height="${n(sd)}" rx="${n(r)}" ry="${n(ry)}"`;
    return `<g class="dx-slab">${pillar ? pillarUnder(x, y + sd / 2, sw / 202) : ""}<rect class="wht" x="${n(x)}" y="${n(y + depth)}" width="${n(sw)}" height="${n(sd)}" rx="${n(r)}" ry="${n(ry)}"/><rect class="wht" x="${n(x)}" y="${n(y + sd / 2)}" width="${n(sw)}" height="${n(depth)}"/><g${faceCls ? ` class="${faceCls}"` : ""}>${face} class="fld"/>${face} fill="url(#${id("face")})"${soft ? ` filter="url(#${id("soft")})"` : ""}/></g>${face} class="wl" stroke-width="1.2" stroke-opacity=".95"/></g>`;
  }

  /**
   * An upright glass hoop that things pass through (a stage, a gate's frame): an ellipse standing on its edge, seen
   * slightly from the side. Returns { back, front }: draw `back` before whatever passes through and `front` after, so
   * it reads as going through the hoop. (cx, cy) its centre, `rx` its half width (thin: it is seen nearly edge on),
   * `ry` its half height, `t` the band's thickness.
   */
  function hoop({ cx, cy, rx = 16, ry = 46, t = 6 }) {
    const half = (sweep) => `M${n(cx)} ${n(cy - ry)}A${n(rx)} ${n(ry)} 0 0 ${sweep} ${n(cx)} ${n(cy + ry)}`;
    const band = (d, o) => `<path d="${d}" class="wl" stroke-width="${n(t)}" stroke-opacity="${o}" stroke-linecap="round"/><path d="${d}" class="wl" stroke-width="1.2" stroke-opacity=".95"/>`;
    return { back: `<g class="dx-hoop-b">${band(half(0), 0.45)}</g>`, front: `<g class="dx-hoop-f">${band(half(1), 0.9)}</g>` };
  }

  /** The devx mark (the frame's 60 x 41 glyph), centred on (x, y), scaled by `s`. */
  function mark(x, y, s = 1, cls = "") {
    const t = `translate(${n(x - 30.19 * s)} ${n(y - 20.51 * s)}) scale(${n(s)})`;
    return `<g transform="${t}"><g class="wht${cls ? ` ${cls}` : ""}"><path d="M17.73 27.31c.89-.12 1.34-.17 1.67-.08.29.08.52.23.65.42.15.22.09.52-.04 1.14l-1.7 9.78c-.18.87-.27 1.3-.57 1.63-.27.29-.66.52-1.12.66-.52.16-1.17.16-2.46.16H4.19c-1.47 0-2.2 0-2.76-.19-.49-.17-.89-.44-1.14-.78C0 39.67 0 39.17 0 38.17v-6.15c0-.84 0-1.25.22-1.6.2-.3.51-.56.91-.75.45-.21 1.06-.29 2.27-.45l14.33-1.91Z"/><path d="M57.77 0c1.44 0 2.62.8 2.62 1.78v37.46c0 .98-1.17 1.78-2.62 1.78H37.26c-1.94 0-3.38-1.23-2.94-2.51L45.83 10.5c.17-.49-.48-.93-1.2-.82L3.7 17.71C1.81 18 0 17.03 0 15.71V1.78C0 .8 1.17 0 2.62 0h55.15Z"/></g></g>`;
  }

  /**
   * A ribbon from the puck to a card: an orthogonal path with rounded corners. `solid` is the bright band of the
   * frame's upper link (5 wide, a white wash); otherwise it is the quiet one, two thin white edges with a faint fill.
   */
  function ribbon(pts, { r = 28, solid = true } = {}) {
    const d = rounded(pts, r);
    if (solid) return `<path d="${d}" stroke="url(#${id("wash")})" stroke-width="5" fill="none" stroke-linejoin="round"/>`;
    return `<path class="wl" d="${d}" stroke-width="6.4" stroke-opacity=".6"/><path d="${d}" class="fld-s" stroke-width="3.8" fill="none"/><path d="${d}" stroke="url(#${id("wash")})" stroke-width="3.8" fill="none" stroke-opacity=".25"/>`;
  }

  /**
   * A pulse that runs along a ribbon: a short bright dash moved by stroke-dashoffset. `cls` carries its animation;
   * the scene's keyframes go from `dashFrom(pts)` (dash before the start) to `dashTo(pts)` (past the end).
   */
  function pulse(pts, cls, { r = 28, len = 34 } = {}) {
    const L = length(pts, r);
    const d = rounded(pts, r);
    const dash = `stroke-dasharray="${n(len)} ${n(L + len * 2)}"`;
    return `<g class="${cls}"><path class="wl" d="${d}" stroke-width="12" stroke-opacity=".22" stroke-linecap="round" ${dash}/><path class="wl" d="${d}" stroke-width="5" stroke-linecap="round" ${dash}/></g>`;
  }
  const dashFrom = (pts, { len = 34 } = {}) => `stroke-dashoffset:${n(len)}`;
  const dashTo = (pts, { r = 28, len = 34 } = {}) => `stroke-dashoffset:${n(-length(pts, r) - len)}`;

  /**
   * A frosted card that runs off the right edge: a translucent white panel, a white frame inset in it, and a white
   * streak that dissolves its far end into the pixel blocks. (x, y) top left; `cw`, `ch` the panel; `r` its corner.
   */
  function card({ x, y, cw, ch, r = 12.8, inset = 8, frame = true }) {
    def("cardfade", `<linearGradient id="${id("cardfade")}" x1="0" y1="0" x2="1" y2="0"><stop class="st-w" offset="0" stop-opacity=".36"/><stop class="st-w" offset=".55" stop-opacity=".42"/><stop class="st-w" offset="1" stop-opacity=".9"/></linearGradient>`);
    const fx = Math.max(x + cw * 0.52, w - 210);
    return `<g class="dx-card"><rect x="${n(x)}" y="${n(y)}" width="${n(cw)}" height="${n(ch)}" rx="${n(r)}" fill="url(#${id("cardfade")})"/>${
      frame ? `<rect class="wl" x="${n(x + inset)}" y="${n(y + inset)}" width="${n(cw - inset * 2)}" height="${n(ch - inset * 2)}" rx="${n(Math.max(2, r - 2.6))}" stroke-width="1.92"/>` : ""
    }<rect class="frn" x="${n(fx + 4)}" y="${n(y + ch * 0.46)}" width="${n(w - fx)}" height="${n(ch * 0.4)}" opacity=".9" filter="url(#${id("blurw")})"/><rect class="tp" x="${n(fx + 40)}" y="${n(y + ch * 0.1)}" width="${n(w - fx)}" height="${n(ch * 0.36)}" opacity=".5" filter="url(#${id("blurw")})"/><rect class="pap" x="${n(fx)}" y="${n(y + 4)}" width="${n(w - fx + 30)}" height="${n(ch - 8)}" opacity=".85" filter="url(#${id("blurw")})"/></g>`;
  }

  /** A round chip on a card (a logo or a glyph inside): off-white, with the small blue lift shadow of the frame. */
  function chip(cx, cy, r = 19.3, inner = "") {
    return `<g class="dx-chip"><circle class="chs" cx="${n(cx)}" cy="${n(cy + 1.3)}" r="${n(r)}" opacity=".35"/><circle class="chp" cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}"/>${inner}</g>`;
  }

  /**
   * A status: a dot (live green, or alert red) and a short white label beside it, the frame's Inter 10.26. `dotCls`
   * and `textCls` let a scene switch or fade them; the dot's soft glow is a radial gradient, so it may animate.
   */
  function status(text, x, y, { state = "live", dotCls = "", textCls = "" } = {}) {
    return `<g class="lab dx-status"><circle class="${state === "live" ? "liv" : "alr"}${dotCls ? ` ${dotCls}` : ""}" cx="${n(x)}" cy="${n(y)}" r="3.85"/><text class="txt${textCls ? ` ${textCls}` : ""}" x="${n(x + 11)}" y="${n(y + 3.6)}">${text}</text></g>`;
  }

  /** The frame's cursor arrow (black with a white edge), its tip at (x, y), tilted like the frame's by `rot` degrees. */
  function cursor(x, y, { rot = -12.89, cls = "" } = {}) {
    // the animated group sits between the placement and the tilt, so a scene's translate runs in screen directions
    return `<g transform="translate(${n(x)} ${n(y)})"><g${cls ? ` class="${cls}"` : ""}><g transform="rotate(${n(rot)})"><path class="cur" d="M0 0V25.73L7.82 18.81H18.76Z"/></g></g></g>`;
  }

  /** The frame's rounded corners (12): wrap the whole body in it. */
  function frame(body, r = 12) {
    def("clip", `<clipPath id="${id("clip")}"><rect width="${w}" height="${h}" rx="${r}"/></clipPath>`);
    return `<g clip-path="url(#${id("clip")})">${body}</g>`;
  }

  /** All the <defs> the parts asked for; put it first in the body. */
  const defsSvg = () => `<defs>${[...defs.values()].join("")}</defs>`;

  return { w, h, id, rounded, length, ground, puck, pillarUnder, slab, hoop, mark, ribbon, pulse, dashFrom, dashTo, card, chip, status, cursor, frame, defs: defsSvg };
}

// devx surfaces: the art the devx pages draw around their content, as functions that return SVG or HTML strings.
// Ported from the devx site's Python builders (_src/v37/page.py card_art, systems(); _src/v37/base.py after_art) so the
// same seed gives the same drawing, byte for byte: the random numbers come from a copy of Python's own generator.
// Works in a browser (import it) and in Node (import it, or run it: `node surfaces.mjs --help`).

// ---------------------------------------------------------------- palette
/** The four colours of numbers and icons on the capability pages. */
export const NUMBER = { blue: "#658ff8", pink: "#fc88ab", orange: "#fbac73", green: "#96cf70" };
/** Card art fields: [colour, accent at the top of the flare], sampled from the capability bento's panels. */
export const CARD_FIELD = [
  ["#6a95f9", "#b7a6f5"], // blue
  ["#f48e6e", "#fc88ab"], // coral
  ["#67d09f", "#7fd3ea"], // green
  ["#70cce2", "#9db8f7"], // teal
  ["#ff94b5", "#fbac73"], // pink
];
/** The devx blue of a diagram panel (the Fits panel), with its flare accent. */
export const PANEL = ["#436bf6", "#b7a6f5"];
export const INK = "#14162e";
/** The yellow fringe on every flare block, and the light that runs along ribbons. */
export const FRINGE = "#ffe27a";

// ---------------------------------------------------------------- Python's random, so seeds match the Python builders
/** random.Random(seed) from CPython: MT19937 seeded by init_by_array, randint by rejection on getrandbits. */
export function pyRandom(seed) {
  const N = 624, M = 397, mt = new Uint32Array(N);
  let mti = N + 1;
  const mul = (a, b) => Math.imul(a, b) >>> 0;
  const initGenrand = (s) => {
    mt[0] = s >>> 0;
    for (mti = 1; mti < N; mti++) mt[mti] = (mul(1812433253, mt[mti - 1] ^ (mt[mti - 1] >>> 30)) + mti) >>> 0;
  };
  // the key: |seed| as 32-bit words, least significant first (CPython's random_seed for an int)
  let v = BigInt(Math.abs(Math.trunc(seed)));
  const key = [];
  do { key.push(Number(v & 0xffffffffn)); v >>= 32n; } while (v > 0n);
  initGenrand(19650218);
  let i = 1, j = 0;
  for (let k = Math.max(N, key.length); k; k--) {
    mt[i] = ((mt[i] ^ mul(mt[i - 1] ^ (mt[i - 1] >>> 30), 1664525)) + key[j] + j) >>> 0;
    i++; j++;
    if (i >= N) { mt[0] = mt[N - 1]; i = 1; }
    if (j >= key.length) j = 0;
  }
  for (let k = N - 1; k; k--) {
    mt[i] = ((mt[i] ^ mul(mt[i - 1] ^ (mt[i - 1] >>> 30), 1566083941)) - i) >>> 0;
    i++;
    if (i >= N) { mt[0] = mt[N - 1]; i = 1; }
  }
  mt[0] = 0x80000000;
  const next = () => {
    if (mti >= N) {
      let kk = 0, y;
      for (; kk < N - M; kk++) { y = (mt[kk] & 0x80000000) | (mt[kk + 1] & 0x7fffffff); mt[kk] = mt[kk + M] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0); }
      for (; kk < N - 1; kk++) { y = (mt[kk] & 0x80000000) | (mt[kk + 1] & 0x7fffffff); mt[kk] = mt[kk + (M - N)] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0); }
      y = (mt[N - 1] & 0x80000000) | (mt[0] & 0x7fffffff);
      mt[N - 1] = mt[M - 1] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0);
      mti = 0;
    }
    let y = mt[mti++];
    y ^= y >>> 11; y ^= (y << 7) & 0x9d2c5680; y ^= (y << 15) & 0xefc60000; y ^= y >>> 18;
    return y >>> 0;
  };
  const getrandbits = (k) => next() >>> (32 - k);
  const randbelow = (n) => {
    const k = Math.floor(Math.log2(n)) + 1;
    let r = getrandbits(k);
    while (r >= n) r = getrandbits(k);
    return r;
  };
  return { randint: (a, b) => a + randbelow(b - a + 1) };
}

/** Python's f"{v:.0f}": round half to even, and "-0" for a negative that rounds to zero. */
export function f0(v) {
  const fl = Math.floor(v), d = v - fl;
  const r = d > 0.5 ? fl + 1 : d < 0.5 ? fl : fl % 2 === 0 ? fl : fl + 1;
  return r === 0 && (v < 0 || Object.is(v, -0)) ? "-0" : String(r);
}

/** The fine white grain every devx colour field carries (feTurbulence, a band of its values, white at 10%). */
export const grainFilter = (id) =>
  `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".78" numOctaves="3" seed="9721" stitchTiles="stitch" result="n"/><feColorMatrix in="n" type="luminanceToAlpha" result="a"/><feComponentTransfer in="a" result="s"><feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"/></feComponentTransfer><feFlood flood-color="#fff" flood-opacity=".1"/><feComposite operator="in" in2="s"/></filter>`;

// ---------------------------------------------------------------- card art: a flat colour, grain, a flare rising from the foot
/**
 * The art at the top of a devx card (and, larger, behind a diagram panel): one flat colour with grain, dissolving at its
 * foot into the card below. A stepped skyline of soft blocks is cut out of the colour, so the card's own white flows up
 * into it with no line between them; each block carries a yellow and an accent fringe along its top.
 * k: a unique id suffix (a number or a short word). col, acc: a CARD_FIELD pair. W, H: the art's size. rise: how far the
 * blocks climb (1 for a card, 1.1 for a panel). seed: the drawing (default 61 + k * 13 for a numeric k). wide: block
 * widths. blur: how soft the blocks are. foot: the height of the final fade into white.
 * Same output as the Python card_art(k, col, acc, ...) for the same arguments.
 */
export function cardArt({ k = 0, col = CARD_FIELD[0][0], acc = CARD_FIELD[0][1], W = 586, H = 280, rise = 1, seed = null, wide = [64, 132], blur = 9, foot = 34 } = {}) {
  const r = pyRandom(seed === null ? 61 + k * 13 : seed);
  let holes = "", fringe = "", x = -20;
  while (x < W + 20) {
    const w = r.randint(wide[0], wide[1]);
    const edge = Math.abs((x + w / 2) / W - 0.5) * 2; // 0 at the middle, 1 at the sides: taller at the sides, so a panel on it stays clear
    const a = r.randint(22, 42);
    const b = r.randint(16, 44);
    const h = (a + edge ** 1.6 * b) * rise;
    holes += `<rect x="${x}" y="${f0(H - h)}" width="${w + 3}" height="${f0(h + 24)}"/>`;
    fringe += `<rect x="${x + 6}" y="${f0(H - h - 15)}" width="${w - 12}" height="22" fill="#ffe27a"/><rect x="${f0(x + w * 0.5)}" y="${f0(H - h - 20)}" width="${f0(w * 0.45)}" height="16" fill="${acc}"/>`;
    x += w;
  }
  return `<svg class="sx-art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs>
      <filter id="cb${k}" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="${blur}"/></filter><filter id="cf${k}" x="-30%" y="-120%" width="160%" height="340%"><feGaussianBlur stdDeviation="10"/></filter>
      ${grainFilter(`cn${k}`)}
      <linearGradient id="cg${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000"/></linearGradient>
      <mask id="cm${k}" maskUnits="userSpaceOnUse" x="-40" y="-40" width="${W + 80}" height="${H + 80}"><rect x="-40" y="-40" width="${W + 80}" height="${H + 80}" fill="#fff"/><g fill="#000" filter="url(#cb${k})">${holes}</g><rect x="-40" y="${H - foot}" width="${W + 80}" height="${foot}" fill="url(#cg${k})"/><rect x="-40" y="${H}" width="${W + 80}" height="40" fill="#000"/></mask></defs>
      <g mask="url(#cm${k})"><rect x="-40" y="-40" width="${W + 80}" height="${H + 80}" fill="${col}"/><g filter="url(#cf${k})">${fringe}</g><rect width="${W}" height="${H}" filter="url(#cn${k})"/></g></svg>`;
}

/**
 * The "After" card art (Figma 589:1679): a flat colour with grain, and a column of soft off-white blocks bleeding in
 * from the right edge, each with a yellow fringe on its inner side, under a band running from the accent at the top
 * into the card colour. Text sits on the left; the blocks stay in the last ~11% of the width.
 * Same output as the Python after_art(k, col, acc, seed).
 */
export function afterArt({ k = 0, col = CARD_FIELD[0][0], acc = CARD_FIELD[0][1], seed = 31 } = {}) {
  const r = pyRandom(seed), W = 586, H = 300;
  let blocks = "", y = -14;
  while (y < H) {
    const h = r.randint(26, 62), w = r.randint(40, 66);
    const x = Math.max(524, W - w + r.randint(0, 12));
    blocks += `<rect x="${x - 12}" y="${y + 5}" width="${w}" height="${Math.max(8, h - 10)}" fill="#ffe27a" filter="url(#sxf${k})"/>` +
      `<rect x="${x}" y="${y}" width="${w + 20}" height="${h}" fill="#f7f6f3" filter="url(#sxb${k})"/>`;
    y += h + r.randint(10, 46);
  }
  return `<svg class="sx-art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
      <defs><linearGradient id="sxg${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${acc}"/><stop offset=".62" stop-color="${col}" stop-opacity="0"/></linearGradient>
        <filter id="sxb${k}" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="5"/></filter>
        <filter id="sxf${k}" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>
        <filter id="sxn${k}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency=".78" numOctaves="3" seed="9721" stitchTiles="stitch" result="n"/>
          <feColorMatrix in="n" type="luminanceToAlpha" result="a"/>
          <feComponentTransfer in="a" result="s"><feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"/></feComponentTransfer>
          <feFlood flood-color="#fff" flood-opacity=".1"/><feComposite operator="in" in2="s"/></filter></defs>
      <rect width="${W}" height="${H}" fill="${col}"/>
      <rect x="${W - 120}" y="0" width="120" height="${H}" fill="url(#sxg${k})" filter="url(#sxf${k})"/>
      ${blocks}
      <rect width="${W}" height="${H}" filter="url(#sxn${k})"/></svg>`;
}

// ---------------------------------------------------------------- diagram parts: the glass puck and the ribbons
/** The devx mark, 28.74 units square, in currentColor. */
export const MARK_PATHS = `<path d="M8.43847 19.1381C8.86383 19.0563 9.07654 19.0154 9.23281 19.0778C9.36959 19.1323 9.48018 19.2374 9.54181 19.3711C9.6122 19.5239 9.58246 19.7385 9.52296 20.1675L8.71632 27.0199C8.63182 27.6291 8.58957 27.9338 8.44338 28.163C8.31456 28.365 8.13021 28.5255 7.91244 28.6254C7.66529 28.7387 7.35775 28.7387 6.74268 28.7387H1.99256C1.29511 28.7387 0.94639 28.7387 0.679999 28.603C0.445673 28.4836 0.255163 28.2931 0.135768 28.0588C3.51571e-05 27.7924 2.65067e-05 27.4436 2.65067e-05 26.7462V22.4337C2.65067e-05 21.8477 2.19781e-05 21.5547 0.105364 21.3152C0.198251 21.1039 0.348032 20.9226 0.537942 20.7916C0.753319 20.6429 1.04105 20.5876 1.61649 20.477L8.43847 19.1381Z" fill="currentColor"/><path d="M27.4934 0C28.1812 0 28.7387 0.55756 28.7387 1.24534V27.4934C28.7387 28.1812 28.1812 28.7387 27.4934 28.7387H17.7316C16.8078 28.7387 16.124 27.8795 16.3313 26.9793L21.8133 7.35602C21.8927 7.01126 21.5838 6.70235 21.239 6.78176L1.75948 12.4074C0.859226 12.6148 2.65067e-05 11.931 2.65067e-05 11.0072V1.24534C2.66402e-05 0.55756 0.557586 5.20481e-09 1.24537 0H27.4934Z" fill="currentColor"/>`;

/** The puck at the centre of a diagram: a white disc with a blue face, four light pillars under it, the devx mark on top. */
export function puck({ id = "dxp" } = {}) {
  const pillars = [[14, 44], [84, 36], [140, 36], [202, 44]].map(([x, w]) => `<rect x="${x}" y="66" width="${w}" height="84" fill="url(#${id}g)"/>`).join("");
  return `<svg class="dx-puck" viewBox="0 0 260 150" aria-hidden="true"><defs>
      <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <radialGradient id="${id}f" cx=".5" cy=".5" r=".62"><stop offset="0" stop-color="#7f9cfa"/><stop offset=".62" stop-color="#9db4fb"/><stop offset="1" stop-color="#dbe4fe"/></radialGradient></defs>
      ${pillars}<ellipse cx="130" cy="72" rx="122" ry="56" fill="#fff"/><ellipse cx="130" cy="60" rx="122" ry="56" fill="url(#${id}f)"/>
      <svg x="104" y="36" width="52" height="48" viewBox="0 0 28.74 28.74" color="#fff">${MARK_PATHS}</svg></svg>`;
}

/**
 * Ribbons that gather many sources into one point below them (fanIn) or spread one point out to several below it
 * (fanOut): straight runs joined by rounded corners of radius r, as on the Fits panel. Returns the path data, one per
 * ribbon; draw each with ribbon().
 */
export function fanIn({ xs, mid, y0, bus, y1, r = 16 }) {
  return xs.map((x) => {
    if (Math.abs(x - mid) < 1) return `M${f0(x)} ${y0} V${y1}`;
    const s = x < mid ? 1 : -1;
    return `M${f0(x)} ${y0} V${bus - r} Q${f0(x)} ${bus} ${f0(x + s * r)} ${bus} H${f0(mid - s * r)} Q${f0(mid)} ${bus} ${f0(mid)} ${bus + r} V${y1}`;
  });
}
export function fanOut({ mid, xs, y0, bus, y1, r = 16 }) {
  return xs.map((x) => {
    if (Math.abs(x - mid) < 1) return `M${f0(mid)} ${y0} V${y1}`;
    const s = x < mid ? -1 : 1;
    return `M${f0(mid)} ${y0} V${bus - r} Q${f0(mid)} ${bus} ${f0(mid + s * r)} ${bus} H${f0(x - s * r)} Q${f0(x)} ${bus} ${f0(x)} ${bus + r} V${y1}`;
  });
}
/** One ribbon: a soft white band, a white line on it, and a light that runs along it (CSS class dx-ribbons animates it). */
export const ribbon = (d, k = 0) => `<path class="rb" d="${d}"/><path class="rl" d="${d}"/><path class="rp" pathLength="1" style="--k:${k}" d="${d}"/>`;

// ---------------------------------------------------------------- charts and clips
/**
 * A bar chart whose bars are windows onto one devx field (surfaces.css .dx-bars). values: bar heights in % (0-100).
 * Change a bar's height with style.height; the field stays put, so colour flows through the chart.
 */
export const fieldBars = (values, { label = "" } = {}) =>
  `<div class="dx-bars" style="--n:${values.length}"${label ? ` role="img" aria-label="${label}"` : ` aria-hidden="true"`}>${values.map((h, k) => `<i style="--k:${k};height:${h}%"></i>`).join("")}</div>`;

/** A progress clip in one flat devx colour with grain; --f (0-1) fills it, and the class live shows the flare on its edge. */
export const clip = (text, { color = NUMBER.blue, f = 0, live = false } = {}) =>
  `<div class="dx-clip${live ? " live" : ""}" style="--cc:${color};--f:${f}"><i class="dx-clip-fill"></i><span>${text}</span></div>`;

// ---------------------------------------------------------------- command line
const HELP = `devx surfaces: print one drawing as SVG.

  node surfaces.mjs card  [--k 0] [--color 0..4 | --col #hex --acc #hex] [--w 586] [--h 280] [--rise 1] [--seed n] [--blur 9] [--foot 34] [--wide 64,132]
  node surfaces.mjs panel [--w 1200] [--h 760] [--seed 29]      the Fits panel background (devx blue, rise 1.1, wide 170,300, blur 18, foot 70)
  node surfaces.mjs after [--k 0] [--color 0..4] [--seed 31]
  node surfaces.mjs puck
Writes to stdout; add --out file.svg to write a file. A standalone file gets the SVG namespace.`;

const isMain = typeof process !== "undefined" && process.argv?.[1] && import.meta.url === (await import("node:url")).pathToFileURL((await import("node:fs")).realpathSync(process.argv[1])).href;
if (isMain) {
  const argv = process.argv.slice(2);
  const opt = (name, d) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : d);
  const num = (name, d) => (opt(name) === undefined ? d : Number(opt(name)));
  const pair = CARD_FIELD[num("color", 0)] ?? CARD_FIELD[0];
  const what = argv[0];
  const k = opt("k", "0"), numericK = /^\d+$/.test(k);
  const seed = opt("seed") === undefined ? null : num("seed");
  if (what === "card" && !numericK && seed === null) { console.error("a word for --k needs a --seed"); process.exit(1); }
  let svg;
  if (what === "card") svg = cardArt({ k: numericK ? Number(k) : k, col: opt("col", pair[0]), acc: opt("acc", pair[1]), W: num("w", 586), H: num("h", 280), rise: num("rise", 1), seed, blur: num("blur", 9), foot: num("foot", 34), wide: opt("wide", "64,132").split(",").map(Number) });
  else if (what === "panel") svg = cardArt({ k: "panel", col: PANEL[0], acc: PANEL[1], W: num("w", 1200), H: num("h", 760), rise: 1.1, seed: seed ?? 29, wide: [170, 300], blur: 18, foot: 70 });
  else if (what === "after") svg = afterArt({ k: numericK ? Number(k) : k, col: pair[0], acc: pair[1], seed: seed ?? 31 });
  else if (what === "puck") svg = puck();
  else { console.log(HELP); process.exit(what && what !== "--help" ? 1 : 0); }
  svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
  const out = opt("out");
  if (out) (await import("node:fs")).writeFileSync(out, svg + "\n");
  else process.stdout.write(svg + "\n");
}

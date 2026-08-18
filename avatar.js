// mascot-avatars — procedural avatars following the "IP as Logo" rules:
// one silhouette of 6–10 rounded shapes, max two colors + solid background,
// features die-cut in the background color, subtle 8–12% internal shading,
// character emerging from a lower corner filling 75–85% of the canvas.
// Works in Node (module.exports) and the browser (window.MascotAvatar).

(function () {
  "use strict";

  // ---------- deterministic RNG ----------

  function seedHash(str) { // xmur3
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

  // ---------- palettes: [background, primary, secondary] ----------

  const PALETTES = [
    { name: "Navy Cream",  bg: "#223154", p: "#f2e8d5", s: "#e2795b" },
    { name: "Coral Pop",   bg: "#e8564a", p: "#ffe8d1", s: "#37415e" },
    { name: "Forest",      bg: "#1f3a2d", p: "#b7dba8", s: "#f0c75e" },
    { name: "Grape",       bg: "#3b2a56", p: "#cbb1f0", s: "#ffb45c" },
    { name: "Ocean",       bg: "#14405c", p: "#7fd1e0", s: "#f2f7f5" },
    { name: "Sunny",       bg: "#f5c542", p: "#33302b", s: "#fdf3dd" },
    { name: "Rose",        bg: "#8c2f4f", p: "#ffd9e0", s: "#f7a072" },
    { name: "Slate",       bg: "#2b2e33", p: "#e6e8ea", s: "#9aa3ad" },
    { name: "Emerald",     bg: "#0f7a5a", p: "#d8f3e6", s: "#ffd166" },
    { name: "Tangerine",   bg: "#f57b3d", p: "#3a2e39", s: "#ffedd8" },
  ];

  // ---------- shape helpers ----------

  const F = (n) => Math.round(n * 10) / 10;

  function circle(cx, cy, r, fill) {
    return `<circle cx="${F(cx)}" cy="${F(cy)}" r="${F(r)}" fill="${fill}"/>`;
  }
  function ellipse(cx, cy, rx, ry, fill, rot) {
    const t = rot ? ` transform="rotate(${rot} ${F(cx)} ${F(cy)})"` : "";
    return `<ellipse cx="${F(cx)}" cy="${F(cy)}" rx="${F(rx)}" ry="${F(ry)}" fill="${fill}"${t}/>`;
  }
  function rrect(x, y, w, h, r, fill) {
    return `<rect x="${F(x)}" y="${F(y)}" width="${F(w)}" height="${F(h)}" rx="${F(r)}" fill="${fill}"/>`;
  }
  // Triangle with a visibly blunt, rounded tip (no sharp points allowed).
  function bluntTri(bx1, by1, bx2, by2, tx, ty, tipR, fill) {
    const d1 = Math.hypot(tx - bx1, ty - by1);
    const d2 = Math.hypot(tx - bx2, ty - by2);
    const ax = tx + ((bx1 - tx) * tipR) / d1, ay = ty + ((by1 - ty) * tipR) / d1;
    const cx = tx + ((bx2 - tx) * tipR) / d2, cy = ty + ((by2 - ty) * tipR) / d2;
    return `<path d="M ${F(bx1)} ${F(by1)} L ${F(ax)} ${F(ay)} Q ${F(tx)} ${F(ty)} ${F(cx)} ${F(cy)} L ${F(bx2)} ${F(by2)} Z" fill="${fill}"/>`;
  }

  // ---------- species ----------
  // Each draws in local coords with the head centered near (0,0) and the torso
  // extending down past y=400 (cropped by the canvas bottom). Returns:
  //   body: primary/secondary silhouette shapes (also used as the shading clip)
  //   face: eyes + mouth, die-cut in the background color
  //   topY: highest local point, used to size the 75–85% fill

  const SPECIES = {
    ghost(rng, C) {
      const eyeY = -30 + rng() * 14;
      return {
        topY: -150,
        body: [
          circle(0, 0, 150, C.p),
          rrect(-150, 0, 300, 420, 0, C.p),
          ellipse(-178, 85, 46, 68, C.p, 16),
          ellipse(178, 85, 46, 68, C.p, -16),
          ellipse(0, 260, 92, 145, C.s),
        ],
        face: [
          ellipse(-52, eyeY, 19, 28, C.bg),
          ellipse(52, eyeY, 19, 28, C.bg),
          ellipse(0, 48, 24, 18, C.bg),
        ],
      };
    },

    cat(rng, C) {
      const eyeY = -12 + rng() * 12;
      return {
        topY: -218,
        body: [
          circle(0, 20, 150, C.p),
          bluntTri(-138, -25, -35, -118, -142, -218, 32, C.p),
          bluntTri(138, -25, 35, -118, 142, -218, 32, C.p),
          bluntTri(-112, -58, -55, -110, -112, -168, 18, C.s),
          bluntTri(112, -58, 55, -110, 112, -168, 18, C.s),
          ellipse(0, 340, 195, 210, C.p),
        ],
        face: [
          ellipse(-58, eyeY, 16, 25, C.bg),
          ellipse(58, eyeY, 16, 25, C.bg),
          bluntTri(-22, 52, 22, 52, 0, 84, 9, C.bg),
        ],
      };
    },

    bear(rng, C) {
      const eyeY = -18 + rng() * 12;
      return {
        topY: -163,
        body: [
          circle(-100, -105, 58, C.p),
          circle(100, -105, 58, C.p),
          circle(0, 20, 150, C.p),
          circle(-100, -105, 30, C.s),
          circle(100, -105, 30, C.s),
          ellipse(0, 330, 200, 205, C.p),
          ellipse(0, 78, 78, 56, C.s),
        ],
        face: [
          circle(-62, eyeY, 15, C.bg),
          circle(62, eyeY, 15, C.bg),
          ellipse(0, 62, 25, 17, C.bg),
        ],
      };
    },

    bunny(rng, C) {
      const tilt = 8 + rng() * 6;
      return {
        topY: -268,
        body: [
          ellipse(-60, -145, 41, 125, C.p, -tilt),
          ellipse(60, -145, 41, 125, C.p, tilt),
          ellipse(-60, -140, 20, 82, C.s, -tilt),
          ellipse(60, -140, 20, 82, C.s, tilt),
          circle(0, 50, 142, C.p),
          ellipse(0, 350, 190, 210, C.p),
        ],
        face: [
          ellipse(-55, 25, 15, 21, C.bg),
          ellipse(55, 25, 15, 21, C.bg),
          ellipse(0, 96, 20, 14, C.bg),
        ],
      };
    },

    robot(rng, C) {
      const mouthW = 70 + rng() * 30;
      return {
        topY: -222,
        body: [
          rrect(-9, -190, 18, 85, 9, C.p),
          circle(0, -196, 26, C.p),
          rrect(-178, -45, 36, 90, 16, C.p),
          rrect(142, -45, 36, 90, 16, C.p),
          rrect(-140, -125, 280, 240, 52, C.p),
          rrect(-112, 115, 224, 300, 42, C.p),
          rrect(-95, -78, 190, 76, 34, C.s),
        ],
        face: [
          circle(-45, -40, 15, C.bg),
          circle(45, -40, 15, C.bg),
          rrect(-mouthW / 2, 32, mouthW, 26, 13, C.bg),
        ],
      };
    },

    blob(rng, C) {
      const tuftTilt = 8 + rng() * 12;
      return {
        topY: -200,
        body: [
          ellipse(0, -158, 25, 44, C.p, tuftTilt),
          ellipse(0, 15, 166, 156, C.p),
          ellipse(0, 320, 185, 210, C.p),
          circle(-98, 58, 26, C.s),
          circle(98, 58, 26, C.s),
        ],
        face: [
          ellipse(-52, -18, 17, 25, C.bg),
          ellipse(52, -18, 17, 25, C.bg),
          ellipse(0, 62, 29, 19, C.bg),
        ],
      };
    },

    bird(rng, C) {
      const eyeY = -35 + rng() * 12;
      return {
        topY: -192,
        body: [
          ellipse(28, -152, 22, 40, C.p, 20),
          circle(0, 0, 142, C.p),
          ellipse(-146, 170, 54, 95, C.p, 12),
          ellipse(146, 170, 54, 95, C.p, -12),
          ellipse(0, 290, 200, 215, C.p),
          bluntTri(-36, 38, 36, 38, 0, 112, 15, C.s),
        ],
        face: [
          circle(-55, eyeY, 16, C.bg),
          circle(55, eyeY, 16, C.bg),
        ],
      };
    },
  };

  const SPECIES_NAMES = Object.keys(SPECIES);
  const SIZE = 512;

  // ---------- rendering ----------

  /**
   * Render an avatar as an SVG string.
   * @param {object} opts
   * @param {string} opts.seed     any string; same seed → same avatar
   * @param {string} [opts.species="auto"]  one of SPECIES_NAMES or "auto"
   * @param {string} [opts.palette="auto"]  a PALETTES name or "auto"
   * @param {string} [opts.mode="two"]      "two" or "mono"
   * @param {string} [opts.corner="auto"]   "left", "right", or "auto"
   * @returns {string} SVG markup (512×512 viewBox)
   */
  function renderAvatar(opts) {
    opts = opts || {};
    const rng = mulberry32(seedHash(opts.seed || "avatar"));

    const speciesName = opts.species && opts.species !== "auto"
      ? opts.species : pick(rng, SPECIES_NAMES);
    const palette = opts.palette && opts.palette !== "auto"
      ? PALETTES.find((x) => x.name === opts.palette)
      : pick(rng, PALETTES);
    if (!SPECIES[speciesName]) throw new Error(`unknown species: ${speciesName}`);
    if (!palette) throw new Error(`unknown palette: ${opts.palette}`);
    const corner = opts.corner && opts.corner !== "auto"
      ? opts.corner : (rng() < 0.5 ? "left" : "right");

    const C = { bg: palette.bg, p: palette.p, s: palette.s };
    if (opts.mode === "mono") C.s = C.p;

    const m = SPECIES[speciesName](rng, C);

    // Scale so the visible character (top of head to bottom crop) fills 75–85%
    // of the canvas, anchored in a lower corner. Crop lands mid-torso (~y=330).
    const fill = 0.75 + rng() * 0.10;
    const s = (fill * SIZE) / (330 - m.topY);
    const tx = SIZE * (corner === "left" ? 0.37 : 0.63) + (rng() - 0.5) * 16;
    const ty = SIZE * (1 - fill) - s * m.topY;

    const body = m.body.join("");
    // SVG ids are document-global, so inlining several avatars on one page
    // needs per-avatar ids; identical content sharing an id is harmless.
    const uid = seedHash(body).toString(36);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
<defs>
  <clipPath id="sil-${uid}">${body}</clipPath>
  <filter id="soft-${uid}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="30"/></filter>
</defs>
<rect width="${SIZE}" height="${SIZE}" fill="${C.bg}"/>
<g transform="translate(${F(tx)} ${F(ty)}) scale(${F(s * 1000) / 1000})">
  ${body}
  <g clip-path="url(#sil-${uid})">
    <ellipse cx="-65" cy="-75" rx="150" ry="120" fill="#ffffff" opacity="0.11" filter="url(#soft-${uid})"/>
    <ellipse cx="90" cy="240" rx="200" ry="185" fill="#000000" opacity="0.10" filter="url(#soft-${uid})"/>
  </g>
  ${m.face.join("")}
</g>
</svg>`;
  }

  const MascotAvatar = { renderAvatar, PALETTES, SPECIES_NAMES, SIZE };
  if (typeof module !== "undefined" && module.exports) module.exports = MascotAvatar;
  if (typeof window !== "undefined") window.MascotAvatar = MascotAvatar;
})();

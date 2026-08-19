// Generates the README showcase images in assets/:
//   wall.svg     — 8×5 hero grid
//   species.svg  — all 12 species, labeled
//   palettes.svg — one character across all 10 palettes, labeled
//   tiny.svg     — a 32px row proving small-size legibility
//   mono.svg     — monochrome mode examples
// Run: node tools/showcase.js
const fs = require("fs");
const path = require("path");
const { renderAvatar, SPECIES_NAMES, PALETTES } = require("../avatar.js");

const LABEL = (x, y, text) =>
  `<text x="${x}" y="${y}" font-family="-apple-system,'Segoe UI',Helvetica,sans-serif" font-size="14" fill="#8b949e" text-anchor="middle">${text}</text>`;

function cell(opts, x, y, size) {
  return renderAvatar(opts).replace(
    `width="512" height="512"`,
    `x="${x}" y="${y}" width="${size}" height="${size}"`
  );
}

function grid({ cols, size, pad, labelH = 0, items }) {
  const rows = Math.ceil(items.length / cols);
  const W = cols * size + (cols + 1) * pad;
  const H = rows * (size + labelH) + (rows + 1) * pad;
  let out = "";
  items.forEach((item, i) => {
    const x = pad + (i % cols) * (size + pad);
    const y = pad + Math.floor(i / cols) * (size + labelH + pad);
    out += cell(item.opts, x, y, size);
    if (item.label) out += LABEL(x + size / 2, y + size + 18, item.label);
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">\n${out}\n</svg>`;
}

const files = {
  "wall.svg": grid({
    cols: 8, size: 160, pad: 10,
    items: Array.from({ length: 40 }, (_, i) => ({
      opts: {
        seed: `wall-${i}`,
        species: SPECIES_NAMES[i % SPECIES_NAMES.length],
        // diagonal round-robin so no palette clumps in the grid
        palette: PALETTES[(i + Math.floor(i / 8) * 3) % PALETTES.length].name,
      },
    })),
  }),

  "species.svg": grid({
    cols: 6, size: 150, pad: 12, labelH: 26,
    items: SPECIES_NAMES.map((sp, i) => ({
      opts: { seed: `roster-${sp}`, species: sp, palette: PALETTES[(i * 3) % PALETTES.length].name },
      label: sp,
    })),
  }),

  "palettes.svg": grid({
    cols: 5, size: 150, pad: 12, labelH: 26,
    items: PALETTES.map((pal) => ({
      opts: { seed: "palette-demo", species: "ghost", palette: pal.name },
      label: pal.name,
    })),
  }),

  "tiny.svg": grid({
    cols: 12, size: 32, pad: 6,
    items: SPECIES_NAMES.map((sp, i) => ({
      opts: { seed: `roster-${sp}`, species: sp, palette: PALETTES[(i * 3) % PALETTES.length].name },
    })),
  }),

  "mono.svg": grid({
    cols: 6, size: 120, pad: 10,
    items: ["ghost", "cat", "robot", "penguin", "frog", "alien"].map((sp, i) => ({
      opts: { seed: `mono-${sp}`, species: sp, mode: "mono", palette: PALETTES[(i * 2 + 1) % PALETTES.length].name },
    })),
  }),
};

const dir = path.join(__dirname, "..", "assets");
fs.mkdirSync(dir, { recursive: true });
for (const [name, svg] of Object.entries(files)) {
  fs.writeFileSync(path.join(dir, name), svg);
  console.log(`wrote assets/${name} (${(svg.length / 1024).toFixed(1)} kB)`);
}

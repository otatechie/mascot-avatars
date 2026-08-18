// Smoke tests for mascot-avatars. Run: npm test
const assert = require("assert");
const { renderAvatar, PALETTES, SPECIES_NAMES } = require("./avatar.js");

// deterministic: same seed → same output
assert.strictEqual(renderAvatar({ seed: "ada" }), renderAvatar({ seed: "ada" }));
assert.notStrictEqual(renderAvatar({ seed: "ada" }), renderAvatar({ seed: "bob" }));

// every species × every palette renders valid-looking SVG
for (const species of SPECIES_NAMES) {
  for (const { name } of PALETTES) {
    const svg = renderAvatar({ seed: "t", species, palette: name });
    assert.ok(svg.startsWith("<svg"), `${species}/${name} not SVG`);
    assert.ok(svg.includes("</svg>"), `${species}/${name} unterminated`);
  }
}

// mono mode and explicit corners render
renderAvatar({ seed: "t", mode: "mono" });
renderAvatar({ seed: "t", corner: "left" });
renderAvatar({ seed: "t", corner: "right" });

// bad options throw
assert.throws(() => renderAvatar({ seed: "t", species: "dragon" }));
assert.throws(() => renderAvatar({ seed: "t", palette: "Nope" }));

// different avatars use different internal SVG ids (safe to inline together)
const idOf = (svg) => svg.match(/clipPath id="([^"]+)"/)[1];
assert.notStrictEqual(idOf(renderAvatar({ seed: "ada" })), idOf(renderAvatar({ seed: "bob" })));
assert.notStrictEqual(
  idOf(renderAvatar({ seed: "ada", species: "cat" })),
  idOf(renderAvatar({ seed: "ada", species: "ghost" }))
);

// ESM entry exposes the same API
import("./avatar.mjs").then((esm) => {
  assert.strictEqual(esm.renderAvatar({ seed: "ada" }), renderAvatar({ seed: "ada" }));
  console.log("ok:", SPECIES_NAMES.length, "species ×", PALETTES.length, "palettes; ids unique; esm ok");
});

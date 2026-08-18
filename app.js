// Demo UI for mascot-avatars (avatar.js). Loaded after avatar.js in index.html.

(function () {
  "use strict";

  const { renderAvatar, PALETTES, SPECIES_NAMES } = window.MascotAvatar;

  const els = {
    seed: document.getElementById("seed"),
    species: document.getElementById("species"),
    palette: document.getElementById("palette"),
    mode: document.getElementById("mode"),
    corner: document.getElementById("corner"),
    preview: document.getElementById("preview"),
    p64: document.getElementById("preview-64"),
    p32: document.getElementById("preview-32"),
  };

  for (const name of SPECIES_NAMES) {
    els.species.add(new Option(name[0].toUpperCase() + name.slice(1), name));
  }
  for (const pal of PALETTES) {
    els.palette.add(new Option(pal.name, pal.name));
  }

  let currentSVG = "";

  function render() {
    currentSVG = renderAvatar({
      seed: els.seed.value,
      species: els.species.value,
      palette: els.palette.value,
      mode: els.mode.value,
      corner: els.corner.value,
    });
    els.preview.innerHTML = currentSVG;
    els.p64.innerHTML = currentSVG;
    els.p32.innerHTML = currentSVG;
  }

  for (const el of [els.seed, els.species, els.palette, els.mode, els.corner]) {
    el.addEventListener("input", render);
  }

  const WORDS = ["comet", "pixel", "mango", "nimbus", "taro", "biscuit", "juno",
    "waffle", "orbit", "clover", "poppy", "ziggy", "mochi", "dune", "fable"];
  document.getElementById("randomize").addEventListener("click", () => {
    els.seed.value = WORDS[Math.floor(Math.random() * WORDS.length)] +
      "-" + Math.floor(Math.random() * 1000);
    render();
  });

  function download(blob, filename) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  document.getElementById("dl-svg").addEventListener("click", () => {
    download(new Blob([currentSVG], { type: "image/svg+xml" }), `avatar-${els.seed.value}.svg`);
  });

  document.getElementById("dl-png").addEventListener("click", () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1536;
      canvas.getContext("2d").drawImage(img, 0, 0, 1536, 1536);
      canvas.toBlob((blob) => download(blob, `avatar-${els.seed.value}.png`), "image/png");
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(currentSVG);
  });

  render();
})();

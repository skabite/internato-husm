// Sprites estilo Doom: desenhados pixel a pixel em canvas de 32x64
const SPRITES = (() => {
  const C = {
    skin: '#d9a77c', skinD: '#b07e58', hair: '#b8b6b0', hairD: '#8a8882',
    coat: '#ecebe4', coatD: '#b9b8b0', shirt: '#4f6f9a', pants: '#3a3c44', shoe: '#1b1b1d',
    glass: '#1c1c1c', lens: '#9fc3d6', mouth: '#5a1e1e', steth: '#2a2a2e', lantern: '#ffcf5a', lanternD: '#7a5a20',
  };

  function professor(frame) { // 0 = parado, 1 = boca aberta, 2 = gesticulando
    const c = document.createElement('canvas'); c.width = 32; c.height = 64;
    const g = c.getContext('2d');
    const p = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(x, y, w, h); };

    // pernas e sapatos
    p(C.pants, 10, 46, 5, 14); p(C.pants, 17, 46, 5, 14);
    p(C.shoe, 9, 60, 6, 3); p(C.shoe, 17, 60, 6, 3);
    // jaleco
    p(C.coat, 7, 22, 18, 26); p(C.coatD, 7, 22, 1, 26); p(C.coatD, 24, 22, 1, 26);
    p(C.coatD, 7, 47, 18, 1);
    p(C.shirt, 14, 22, 4, 20);                     // camisa aparecendo
    p('#7a2a2a', 15, 23, 2, 12);                   // gravata torta
    p(C.coatD, 13, 22, 1, 25); p(C.coatD, 18, 22, 1, 25);
    p(C.coatD, 9, 30, 4, 4); p('#2a4ac0', 10, 28, 1, 3); p('#c02a2a', 11, 28, 1, 3); p('#222', 12, 29, 1, 2); // bolso c/ canetas
    p(C.coatD, 19, 38, 4, 4);
    // estetoscópio
    p(C.steth, 12, 21, 1, 6); p(C.steth, 19, 21, 1, 6); p(C.steth, 12, 27, 2, 1); p(C.steth, 18, 27, 2, 1);
    p('#9aa', 19, 28, 2, 2);
    // braço esquerdo com lanterna
    p(C.coat, 4, 23, 4, 18); p(C.coatD, 4, 23, 1, 18);
    p(C.skin, 4, 41, 4, 3);
    p(C.lanternD, 3, 44, 6, 1); p(C.lantern, 3, 45, 6, 5); p(C.lanternD, 3, 50, 6, 1); p('#fff6c0', 5, 46, 2, 3);
    // braço direito
    if (frame === 2) {
      p(C.coat, 24, 12, 4, 13); p(C.coatD, 27, 12, 1, 13);
      p(C.skin, 24, 8, 4, 4); p(C.skin, 23, 7, 1, 2); p(C.skin, 28, 6, 1, 3); // mão aberta no alto
    } else {
      p(C.coat, 24, 23, 4, 18); p(C.coatD, 27, 23, 1, 18);
      p(C.skin, 24, 41, 4, 3);
    }
    // pescoço e cabeça
    p(C.skin, 14, 18, 4, 4);
    p(C.skin, 11, 6, 10, 13); p(C.skinD, 11, 17, 10, 2); p(C.skinD, 10, 10, 1, 4); p(C.skinD, 21, 10, 1, 4);
    // cabelo grisalho bagunçado
    p(C.hair, 10, 3, 12, 4); p(C.hair, 10, 6, 1, 5); p(C.hair, 21, 6, 1, 5);
    [[9, 2], [12, 1], [15, 2], [18, 0], [21, 2], [22, 4], [8, 5], [23, 7]].forEach(([x, y]) => p(C.hairD, x, y, 2, 2));
    // óculos
    p(C.glass, 11, 10, 10, 1); p(C.glass, 11, 10, 4, 4); p(C.glass, 17, 10, 4, 4);
    p(C.lens, 12, 11, 2, 2); p(C.lens, 18, 11, 2, 2);
    p('#000', 13, 12, 1, 1); p('#000', 19, 12, 1, 1);  // pupilas arregaladas
    // sobrancelhas (sempre levantadas)
    p(C.hairD, 11, 8, 4, 1); p(C.hairD, 17, 8, 4, 1);
    // boca
    if (frame === 0) p(C.mouth, 14, 15, 4, 1);
    else { p(C.mouth, 13, 14, 6, 3); p('#eee', 14, 14, 4, 1); }
    return c;
  }

  function texFrom(canvas) {
    const t = new THREE.CanvasTexture(canvas);
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
    return t;
  }

  return {
    professorFrames: [0, 1, 2].map(professor),
    professorTextures() { return this.professorFrames.map(texFrom); },
    drawPortrait(canvas, frame) {
      const g = canvas.getContext('2d'); g.imageSmoothingEnabled = false;
      g.fillStyle = '#1a1206'; g.fillRect(0, 0, canvas.width, canvas.height);
      const grd = g.createRadialGradient(48, 70, 4, 48, 70, 70); grd.addColorStop(0, '#5a3a10'); grd.addColorStop(1, '#1a1206');
      g.fillStyle = grd; g.fillRect(0, 0, canvas.width, canvas.height);
      // recorta a cabeça (x 6..26, y 0..24) e amplia 4x
      g.drawImage(this.professorFrames[frame], 6, 0, 24, 24, 0, 0, 96, 96);
    },
  };
})();

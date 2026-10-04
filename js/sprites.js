// Personagens: sprite de corpo (32x64, estilo Doom) + retrato de diálogo (48x48), ambos em pixel art gerada por código.
// Cada personagem é descrito por um "spec" (cabelo, óculos, barba, roupa...).
const SPRITES = (() => {
  const CHARS = {
    // o professor do saguão (pressão de fala)
    prof1: {
      nome: 'PROFESSOR', skin: '#e2b48e', skinD: '#b98a66',
      hair: 'bald', hairC: '#9a958c', hairD: '#6e6a64',
      glasses: 'thick', glassC: '#141414', beard: 'stubble', beardC: '#8f8a84',
      coat: '#ecebe4', coatD: '#b9b8b0', shirt: '#f2f2f0', shirtD: '#c9cfd8', tie: null,
      faceRx: 10, faceRy: 13, brows: '#6e6a64', mouth: 'neutral', lantern: true,
    },
    // gastroenterologia
    prof2: {
      nome: 'PROFESSOR2', skin: '#dcaa84', skinD: '#b07e5a',
      hair: 'short', hairC: '#2e2620', hairD: '#1a1512',
      glasses: null, beard: null,
      coat: '#ecebe4', coatD: '#b9b8b0', shirt: '#cfc8e6', shirtD: '#a59dc4', tie: null,
      faceRx: 11.5, faceRy: 13.5, brows: '#2a221c', mouth: 'smile',
    },
    prof3: {
      nome: 'PROFESSOR3', skin: '#d6a47c', skinD: '#a97a56',
      hair: 'sidepart', hairC: '#3a3836', hairD: '#8d8a86',
      glasses: 'thin', glassC: '#3a3a3a', beard: null,
      coat: '#ecebe4', coatD: '#b9b8b0', shirt: '#9fd8c8', shirtD: '#6fb0a0', tie: null,
      faceRx: 10.5, faceRy: 13.5, brows: '#2a2826', mouth: 'smile',
    },
    prof4: {
      nome: 'PROFESSOR4', skin: '#ecc3a6', skinD: '#c49a7e',
      hair: 'slicked', hairC: '#c9c2ae', hairD: '#9a927e',
      glasses: 'rimless', glassC: '#c8ccd0', beard: null,
      coat: '#f4f4f0', coatD: '#c4c4bc', shirt: '#d9cfee', shirtD: '#b3a6d6', tie: null,
      faceRx: 10.5, faceRy: 14, brows: '#a89a80', mouth: 'neutral', tall: true,
    },
    chefao: {
      nome: 'CHEFÃO', skin: '#dcaa86', skinD: '#b07e5e',
      hair: 'messy', hairC: '#4a3426', hairD: '#8a8078',
      glasses: 'thick', glassC: '#141414', beard: null,
      coat: '#b88a3e', coatD: '#8a6428', shirt: '#aac6e6', shirtD: '#7f9fc4', tie: null, lanyard: '#c0202a',
      faceRx: 11, faceRy: 13.5, brows: '#2e2018', mouth: 'smile',
    },
  };

  // ======================= CORPO (32x64) =======================
  function body(s, frame) { // frame: 0 parado, 1 boca aberta, 2 gesticulando
    const c = document.createElement('canvas'); c.width = 32; c.height = 64;
    const g = c.getContext('2d');
    const p = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(x, y, w, h); };

    p('#3a3c44', 10, 46, 5, 14); p('#3a3c44', 17, 46, 5, 14);   // calça
    p('#1b1b1d', 9, 60, 6, 3); p('#1b1b1d', 17, 60, 6, 3);       // sapatos
    // jaleco / blazer
    p(s.coat, 7, 22, 18, s.coat === '#b88a3e' ? 22 : 26);
    p(s.coatD, 7, 22, 1, 26); p(s.coatD, 24, 22, 1, 26); p(s.coatD, 7, 47, 18, 1);
    p(s.shirt, 14, 22, 4, 20); p(s.shirtD, 15, 22, 2, 1);
    p(s.coatD, 13, 22, 1, 25); p(s.coatD, 18, 22, 1, 25);
    if (s.coat === '#b88a3e') p('#3a3c44', 7, 44, 18, 3);        // blazer é mais curto
    p(s.coatD, 9, 30, 4, 4); p('#2a4ac0', 10, 28, 1, 3); p('#c02a2a', 11, 28, 1, 3);
    if (s.lanyard) { p(s.lanyard, 13, 21, 1, 9); p(s.lanyard, 18, 21, 1, 9); p('#eee', 14, 30, 4, 4); }
    else { p('#2a2a2e', 12, 21, 1, 6); p('#2a2a2e', 19, 21, 1, 6); p('#9aa', 19, 27, 2, 2); } // estetoscópio
    // braço esquerdo
    p(s.coat, 4, 23, 4, 18); p(s.coatD, 4, 23, 1, 18); p(s.skin, 4, 41, 4, 3);
    if (s.lantern) { p('#7a5a20', 3, 44, 6, 1); p('#ffcf5a', 3, 45, 6, 5); p('#7a5a20', 3, 50, 6, 1); p('#fff6c0', 5, 46, 2, 3); }
    // braço direito
    if (frame === 2) { p(s.coat, 24, 12, 4, 13); p(s.coatD, 27, 12, 1, 13); p(s.skin, 24, 8, 4, 4); p(s.skin, 23, 7, 1, 2); p(s.skin, 28, 6, 1, 3); }
    else { p(s.coat, 24, 23, 4, 18); p(s.coatD, 27, 23, 1, 18); p(s.skin, 24, 41, 4, 3); }
    // pescoço e cabeça
    p(s.skin, 14, 18, 4, 4);
    p(s.skin, 11, 6, 10, 13); p(s.skinD, 11, 17, 10, 2); p(s.skinD, 10, 10, 1, 4); p(s.skinD, 21, 10, 1, 4);
    // cabelo
    switch (s.hair) {
      case 'bald':
        p('#f2cfae', 13, 6, 4, 1);                                 // brilho da careca
        p(s.hairC, 11, 8, 1, 4); p(s.hairC, 20, 8, 1, 4); break;
      case 'short':
        p(s.hairC, 11, 4, 10, 3); p(s.hairC, 11, 7, 1, 3); p(s.hairC, 20, 7, 1, 3);
        p(s.skin, 12, 6, 1, 1); p(s.skin, 19, 6, 1, 1); break;        // entradas
      case 'sidepart':
        p(s.hairC, 10, 3, 12, 4); p(s.hairC, 10, 7, 2, 5); p(s.hairC, 20, 7, 2, 5);
        p(s.hairD, 10, 9, 1, 3); p(s.hairD, 21, 9, 1, 3); p(s.hairD, 13, 3, 1, 1); break;
      case 'slicked':
        p(s.hairC, 11, 3, 10, 3); p(s.hairD, 12, 4, 8, 1); p(s.hairC, 10, 6, 2, 6); p(s.hairC, 20, 6, 2, 6); break;
      case 'messy':
        p(s.hairC, 10, 3, 12, 4); p(s.hairC, 10, 7, 2, 4); p(s.hairC, 20, 7, 2, 4);
        [[10, 2], [13, 1], [16, 2], [19, 1]].forEach(([x, y]) => p(s.hairC, x, y, 2, 1));
        p(s.hairD, 10, 9, 1, 2); p(s.hairD, 21, 9, 1, 2); break;
    }
    if (s.beard) { g.globalAlpha = 0.75; p(s.beardC, 12, 15, 8, 3); p(s.beardC, 11, 13, 1, 3); p(s.beardC, 20, 13, 1, 3); g.globalAlpha = 1; }
    // olhos e óculos
    p('#fff', 12, 11, 2, 2); p('#fff', 18, 11, 2, 2); p('#000', 13, 12, 1, 1); p('#000', 19, 12, 1, 1);
    if (s.glasses === 'thick') { p(s.glassC, 11, 10, 10, 1); p(s.glassC, 11, 10, 4, 1); p(s.glassC, 11, 13, 4, 1); p(s.glassC, 17, 13, 4, 1); p(s.glassC, 11, 10, 1, 4); p(s.glassC, 14, 10, 1, 4); p(s.glassC, 17, 10, 1, 4); p(s.glassC, 20, 10, 1, 4); }
    if (s.glasses === 'thin') { p(s.glassC, 11, 10, 4, 1); p(s.glassC, 17, 10, 4, 1); p(s.glassC, 15, 11, 2, 1); p(s.glassC, 11, 13, 4, 1); p(s.glassC, 17, 13, 4, 1); }
    if (s.glasses === 'rimless') { p(s.glassC, 11, 13, 4, 1); p(s.glassC, 17, 13, 4, 1); p(s.glassC, 15, 11, 2, 1); }
    p(s.brows, 11, 9, 4, 1); p(s.brows, 17, 9, 4, 1);
    // boca
    if (frame === 0) p('#6a2a2a', 14, 16, 4, 1);
    else { p('#5a1e1e', 13, 15, 6, 2); p('#eee', 14, 15, 4, 1); }
    return c;
  }

  // ======================= RETRATO (48x48) =======================
  function portrait(s, frame) {
    const N = 48, c = document.createElement('canvas'); c.width = N; c.height = N;
    const g = c.getContext('2d');
    const p = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    const cx = 24, cy = 21, rx = s.faceRx, ry = s.faceRy;
    const inEll = (x, y, ax, ay, ox = cx, oy = cy) => ((x + 0.5 - ox) / ax) ** 2 + ((y + 0.5 - oy) / ay) ** 2 <= 1;

    // fundo
    for (let y = 0; y < N; y++) { const t = y / N; p(`rgb(${26 + 40 * t | 0},${18 + 22 * t | 0},${6 + 8 * t | 0})`, 0, y, N, 1); }
    // ombros, roupa
    for (let y = 36; y < N; y++) { const w = 14 + (y - 36) * 1.6; p(s.coat, Math.round(cx - w), y, Math.round(w * 2), 1); }
    for (let y = 36; y < N; y++) { const w = Math.max(1, 7 - (y - 36) * 0.6); p(s.shirt, Math.round(cx - w), y, Math.round(w * 2), 1); }
    p(s.shirtD, cx - 7, 36, 4, 2); p(s.shirtD, cx + 3, 36, 4, 2);               // gola
    for (let y = 38; y < N; y++) { const w = Math.max(0, 7 - (y - 36) * 0.6); p(s.coatD, Math.round(cx - w) - 1, y, 1, 1); p(s.coatD, Math.round(cx + w), y, 1, 1); }
    if (s.lanyard) for (let y = 37; y < N; y++) { p(s.lanyard, cx - 5 + ((y - 37) * 0.3 | 0), y); p(s.lanyard, cx + 4 - ((y - 37) * 0.3 | 0), y); }
    else if (s.coat !== '#b88a3e') { p('#2a2a2e', cx - 9, 37, 1, 8); p('#2a2a2e', cx + 9, 37, 1, 8); } // estetoscópio
    // pescoço
    p(s.skinD, cx - 5, 31, 10, 6); p(s.skin, cx - 4, 31, 8, 4);
    // orelhas
    p(s.skin, Math.round(cx - rx) - 1, cy - 2, 2, 6); p(s.skin, Math.round(cx + rx) - 1, cy - 2, 2, 6);
    p(s.skinD, Math.round(cx - rx) - 1, cy, 1, 3); p(s.skinD, Math.round(cx + rx), cy, 1, 3);
    // rosto
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (!inEll(x, y, rx, ry)) continue;
      const shade = (x - cx) / rx > 0.55 || (y - cy) / ry > 0.78;
      p(shade ? s.skinD : s.skin, x, y);
    }
    // barba (dither)
    if (s.beard) for (let y = cy + 3; y < cy + ry; y++) for (let x = cx - rx; x < cx + rx; x++) {
      if (!inEll(x, y, rx, ry)) continue;
      const jaw = (y - cy) > 6 || Math.abs(x - cx) > rx - 3 || (y >= cy + 5 && Math.abs(x - cx) < 5);
      if (jaw && (x + y) % 2 === 0) p(s.beardC, x, y);
      if (jaw && (y - cy) > 8 && (x + y) % 2 === 1) p(s.beardC, x, y);
    }
    // cabelo
    const hairPix = (fn) => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const col = fn(x, y); if (col) p(col, x, y); } };
    switch (s.hair) {
      case 'bald':
        hairPix((x, y) => {
          const side = Math.abs(x + 0.5 - cx) > rx - 2.5 && y > cy - 7 && y < cy + 4 && inEll(x, y, rx + 0.6, ry + 0.6);
          return side ? ((x + y) % 2 ? s.hairC : s.hairD) : null;
        });
        p('#f6dcc0', cx - 4, cy - ry + 2, 5, 1); p('#f6dcc0', cx - 5, cy - ry + 3, 2, 1);   // brilho
        break;
      case 'short':
        hairPix((x, y) => {
          if (!inEll(x, y, rx + 1, ry + 1.5)) return null;
          const dx = Math.abs(x + 0.5 - cx);
          const line = cy - 8 - (dx < 4 ? 1 : 0) + (dx > 5 && dx < 8 ? 2 : 0); // entradas
          if (y < line || (dx > rx - 1 && y < cy - 4)) return (x * 7 + y * 3) % 5 ? s.hairC : s.hairD;
          return null;
        });
        break;
      case 'sidepart':
        hairPix((x, y) => {
          if (!inEll(x, y, rx + 2.5, ry + 2.5)) return null;
          const dx = x + 0.5 - cx;
          const line = cy - 7 + (dx < -2 ? 0 : 1) - (dx > 4 ? 1 : 0);
          if (y < line || (Math.abs(dx) > rx - 1.5 && y < cy + 1)) {
            if (Math.abs(dx) > rx - 1.5 && y > cy - 6) return (x + y) % 3 ? s.hairD : s.hairC; // grisalho nas têmporas
            if (Math.round(dx) === -4 && y < cy - 9) return s.hairD;                       // risca
            return (x * 5 + y * 3) % 11 ? s.hairC : s.hairD;
          }
          return null;
        });
        break;
      case 'slicked':
        hairPix((x, y) => {
          if (!inEll(x, y, rx + 1.5, ry + 2)) return null;
          const dx = x + 0.5 - cx;
          if (y < cy - 10 || (Math.abs(dx) > rx - 1.5 && y < cy + 1)) return (y + Math.round(dx / 3)) % 3 ? s.hairC : s.hairD; // penteado pra trás
          return null;
        });
        break;
      case 'messy':
        hairPix((x, y) => {
          const dx = x + 0.5 - cx;
          const tuft = y >= cy - ry - 3 && y < cy - ry + 1 && Math.abs(dx) < rx && ((x * 13) % 7 < 4);
          if (!(inEll(x, y, rx + 2.5, ry + 3) || tuft)) return null;
          const line = cy - 7 + (Math.abs(dx) < 3 ? 1 : 0);
          if (y < line || (Math.abs(dx) > rx - 1.5 && y < cy + 1)) {
            if (Math.abs(dx) > rx - 3 && y > cy - 6) return (x + y) % 2 ? s.hairD : s.hairC;
            return (x * 3 + y * 5) % 6 ? s.hairC : s.hairD;
          }
          return null;
        });
        break;
    }
    // sobrancelhas
    p(s.brows, cx - 8, cy - 4, 5, 1); p(s.brows, cx + 3, cy - 4, 5, 1);
    if (s === CHARS.prof1) { p(s.brows, cx - 8, cy - 5, 2, 1); p(s.brows, cx + 6, cy - 5, 2, 1); } // sempre levantadas
    // olhos
    for (const ex of [cx - 6, cx + 4]) { p('#f4f0ea', ex, cy - 2, 3, 2); p('#3a2a20', ex + 1, cy - 2, 1, 2); p('#000', ex + 1, cy - 2, 1, 1); }
    // óculos
    const lens = (x, y, col, thick) => {
      p(col, x, y, 7, thick); p(col, x, y + 4, 7, 1); p(col, x, y, 1, 5); p(col, x + 6, y, 1, 5);
    };
    if (s.glasses === 'thick') {
      lens(cx - 8, cy - 4, s.glassC, 2); lens(cx + 2, cy - 4, s.glassC, 2);
      p(s.glassC, cx - 1, cy - 3, 3, 1);
      p(s.glassC, Math.round(cx - rx), cy - 3, cx - 8 - Math.round(cx - rx), 1); p(s.glassC, cx + 9, cy - 3, Math.round(cx + rx) - cx - 9, 1);
      g.globalAlpha = 0.25; p('#bcd8ff', cx - 7, cy - 2, 2, 1); p('#bcd8ff', cx + 3, cy - 2, 2, 1); g.globalAlpha = 1;
    } else if (s.glasses === 'thin') {
      lens(cx - 8, cy - 4, s.glassC, 1); lens(cx + 2, cy - 4, s.glassC, 1); p(s.glassC, cx - 1, cy - 3, 3, 1);
    } else if (s.glasses === 'rimless') {
      g.globalAlpha = 0.7;
      p(s.glassC, cx - 8, cy, 7, 1); p(s.glassC, cx + 2, cy, 7, 1); p(s.glassC, cx - 1, cy - 3, 3, 1);
      p(s.glassC, Math.round(cx - rx), cy - 3, cx - 8 - Math.round(cx - rx), 1); p(s.glassC, cx + 9, cy - 3, Math.round(cx + rx) - cx - 9, 1);
      g.globalAlpha = 0.18; p('#ffffff', cx - 8, cy - 4, 7, 4); p('#ffffff', cx + 2, cy - 4, 7, 4); g.globalAlpha = 1;
    }
    // nariz
    p(s.skinD, cx, cy + 1, 1, 3); p(s.skinD, cx - 1, cy + 4, 3, 1);
    // boca
    const my = cy + 7;
    if (frame === 1) { p('#4a1414', cx - 3, my - 1, 7, 3); p('#f0ece4', cx - 2, my - 1, 5, 1); }
    else if (s.mouth === 'smile') { p('#8a3e34', cx - 3, my, 7, 1); p('#8a3e34', cx - 4, my - 1, 1, 1); p('#8a3e34', cx + 4, my - 1, 1, 1); }
    else p('#8a3e34', cx - 2, my, 5, 1);
    if (s.beard) { g.globalAlpha = 0.8; p(s.beardC, cx - 3, my - 2, 7, 1); g.globalAlpha = 1; } // bigode ralo
    // mão gesticulando
    if (frame === 2) { p(s.skin, 38, 26, 6, 7); p(s.skin, 38, 23, 1, 3); p(s.skin, 40, 22, 1, 4); p(s.skin, 42, 22, 1, 4); p(s.coat, 38, 33, 7, 15); }
    return c;
  }

  function texFrom(canvas) {
    const t = new THREE.CanvasTexture(canvas);
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
    return t;
  }

  const cache = {};
  function get(id) {
    if (!cache[id]) {
      const s = CHARS[id];
      cache[id] = { body: [0, 1, 2].map(f => body(s, f)), face: [0, 1, 2].map(f => portrait(s, f)) };
    }
    return cache[id];
  }

  return {
    CHARS,
    get,
    textures(id) { return get(id).body.map(texFrom); },
    drawPortrait(canvas, id, frame) {
      const g = canvas.getContext('2d'); g.imageSmoothingEnabled = false;
      g.drawImage(get(id).face[frame], 0, 0, canvas.width, canvas.height);
    },
  };
})();

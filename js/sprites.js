// Personagens: sprite de corpo (32x64, estilo Doom) + retrato de diálogo (48x48), ambos em pixel art gerada por código.
// Cada personagem é descrito por um "spec" (cabelo, óculos, barba, roupa...).
const SPRITES = (() => {
  const CHARS = {
    // o professor do saguão (pressão de fala)
    prof1: {
      nome: 'PROFESSOR MONTEIRO', skin: '#e2b48e', skinD: '#b98a66',
      hair: 'bald', hairC: '#9a958c', hairD: '#6e6a64',
      glasses: 'thick', glassC: '#141414', beard: 'stubble', beardC: '#8f8a84',
      coat: '#ecebe4', coatD: '#b9b8b0', shirt: '#f2f2f0', shirtD: '#c9cfd8', tie: null,
      faceRx: 10, faceRy: 13, brows: '#6e6a64', mouth: 'neutral', lantern: true,
    },
    // gastroenterologia
    prof2: {
      nome: 'PROFESSOR LIBERATO', skin: '#dcaa84', skinD: '#b07e5a', short: true,
      hair: 'short', hairC: '#2e2620', hairD: '#1a1512',
      glasses: null, beard: null,
      coat: '#ecebe4', coatD: '#b9b8b0', shirt: '#cfc8e6', shirtD: '#a59dc4', tie: null,
      faceRx: 11.5, faceRy: 13.5, brows: '#2a221c', mouth: 'smile',
    },
    prof3: {
      nome: 'JAVALI', skin: '#d6a47c', skinD: '#a97a56',
      hair: 'sidepart', hairC: '#3a3836', hairD: '#8d8a86',
      glasses: 'thin', glassC: '#3a3a3a', beard: null,
      coat: '#ecebe4', coatD: '#b9b8b0', shirt: '#9fd8c8', shirtD: '#6fb0a0', tie: null,
      faceRx: 10.5, faceRy: 13.5, brows: '#2a2826', mouth: 'smile',
    },
    prof4: {
      nome: 'PROFESSOR DE BARROS', skin: '#ecc3a6', skinD: '#c49a7e',
      hair: 'slicked', hairC: '#c9c2ae', hairD: '#9a927e',
      glasses: 'rimless', glassC: '#c8ccd0', beard: null,
      coat: '#f4f4f0', coatD: '#c4c4bc', shirt: '#d9cfee', shirtD: '#b3a6d6', tie: null,
      faceRx: 10.5, faceRy: 14, brows: '#a89a80', mouth: 'neutral', tall: true,
    },
    // chefe do PS — PROVISÓRIO até chegar a foto de referência: pijama cirúrgico verde, cabelo bagunçado grisalho, barba por fazer
    prof5: {
      nome: 'PROFESSOR FALASTRÃO', skin: '#e0b088', skinD: '#b48660',
      hair: 'messy', hairC: '#8a8478', hairD: '#5a564e',
      glasses: null, beard: 'stubble', beardC: '#6a645a',
      coat: '#4f9a86', coatD: '#3a7666', shirt: '#4f9a86', shirtD: '#3a7666', tie: null,
      faceRx: 12, faceRy: 13.5, brows: '#4a463e', mouth: 'smile', sax: true,
    },
    chefao: {
      nome: 'PROFESSOR SCHWARZENEGGER', skin: '#dcaa86', skinD: '#b07e5e',
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
    if (s.sax) {                                                    // sax tenor pendurado no pescoço
      p('#2a2a2e', 15, 21, 1, 4);
      for (let y = 25; y < 40; y++) { const x = 13 + Math.floor((y - 25) * 0.2); p('#d8a830', x, y, 2, 1); p('#a87818', x + 1, y, 1, 1); }
      p('#d8a830', 15, 39, 4, 3); p('#d8a830', 18, 36, 2, 5); p('#f0d070', 18, 36, 2, 1); p('#a87818', 15, 41, 4, 1);
      for (const y of [28, 31, 34]) p('#5a4010', 14 + Math.floor((y - 25) * 0.2), y, 1, 1);
    }
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

  // ======================= JAVALI =======================
  // cada quadro tem { map, emi } — emi só tem os olhos (brilham no escuro)
  const BC = { body: '#3a2a1e', shade: '#251a12', light: '#5a4430', mane: '#16100b', snout: '#8a5a4a', nos: '#2a1410', tusk: '#efe8d8', eye: '#ff2a1a', mouth: '#5a1010' };
  function boarCanvas(w, h, draw) {
    const a = document.createElement('canvas'); a.width = w; a.height = h;
    const e = document.createElement('canvas'); e.width = w; e.height = h;
    const g = a.getContext('2d'), ge = e.getContext('2d');
    ge.fillStyle = '#000'; ge.fillRect(0, 0, w, h);
    const p = (col, x, y, ww = 1, hh = 1) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); };
    const eye = (x, y, ww = 2, hh = 1) => { p(BC.eye, x, y, ww, hh); ge.fillStyle = '#ff3020'; ge.fillRect(x, y, ww, hh); };
    const ell = (cx, cy, rx, ry, col) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1) p(col, x, y); };
    draw(p, eye, ell);
    return { map: a, emi: e };
  }
  function boarFront(frame) { // 0/1 andando, 2 atacando
    return boarCanvas(32, 24, (p, eye, ell) => {
      const dy = frame === 2 ? 1 : 0;
      // pernas
      const lo = frame === 1 ? 1 : 0;
      [[8, lo], [12, 1 - lo], [18, lo], [22, 1 - lo]].forEach(([x, o]) => p(BC.shade, x, 19 + o, 2, 5 - o));
      ell(16, 12, 14, 8, BC.body); ell(16, 14, 12, 6, BC.shade);
      ell(16, 10 + dy, 9, 7, BC.body);                                   // cabeça
      for (let x = 6; x < 26; x += 2) p(BC.mane, x, 3 + (x % 4 ? 0 : 1), 1, 3); // crina
      p(BC.mane, 7, 3, 3, 4); p(BC.mane, 22, 3, 3, 4); p(BC.light, 8, 4, 1, 2); p(BC.light, 23, 4, 1, 2); // orelhas
      p(BC.snout, 12, 12 + dy, 8, 6); p(BC.light, 12, 12 + dy, 8, 1);    // focinho
      p(BC.nos, 14, 15 + dy, 1, 2); p(BC.nos, 17, 15 + dy, 1, 2);
      if (frame === 2) { p(BC.mouth, 12, 18 + dy, 8, 2); p(BC.tusk, 10, 12, 2, 1); p(BC.tusk, 20, 12, 2, 1); }
      p(BC.tusk, 11, 14 + dy, 1, 3); p(BC.tusk, 20, 14 + dy, 1, 3); p(BC.tusk, 10, 13 + dy, 1, 1); p(BC.tusk, 21, 13 + dy, 1, 1);
      eye(11, 8 + dy); eye(19, 8 + dy);
    });
  }
  function boarSide(frame) {
    return boarCanvas(40, 24, (p, eye, ell) => {
      const lo = frame === 1 ? 2 : 0;
      [[9, lo], [13, 2 - lo], [27, 2 - lo], [31, lo]].forEach(([x, o]) => { p(BC.shade, x + (o ? 1 : 0), 18, 2, 6); });
      ell(21, 12, 15, 8, BC.body); ell(22, 15, 13, 5, BC.shade);
      for (let x = 8; x < 32; x += 2) p(BC.mane, x, 3 + (x % 4 ? 1 : 0), 1, 3);
      // cabeça (esquerda)
      ell(9, 12, 7, 6, BC.body);
      p(BC.body, 3, 11, 6, 5); p(BC.snout, 1, 12, 3, 4); p(BC.nos, 1, 13, 1, 1);
      p(BC.tusk, 5, 14, 1, 2); p(BC.tusk, 4, 13, 1, 1);
      p(BC.mane, 10, 4, 3, 4); p(BC.light, 11, 5, 1, 2);
      if (frame === 2) p(BC.mouth, 2, 16, 5, 2);
      eye(7, 9, 2, 1);
      p(BC.mane, 36, 9, 1, 3); p(BC.mane, 37, 11, 1, 1);                // rabo
    });
  }
  function boarDead() {
    return boarCanvas(40, 24, (p, eye, ell) => {
      ell(20, 23, 16, 3, '#2a0808');                                     // poça
      ell(21, 18, 15, 5, BC.body); ell(21, 20, 13, 3, BC.shade);
      ell(8, 18, 6, 4, BC.body); p(BC.snout, 1, 17, 3, 3); p(BC.tusk, 4, 15, 1, 2);
      [[11, 0], [15, 1], [26, 1], [30, 0]].forEach(([x, o]) => p(BC.shade, x, 7 + o, 2, 7 - o)); // patas pra cima
      p('#111', 6, 16, 1, 1); p('#111', 8, 16, 1, 1); p('#111', 7, 17, 1, 1); p('#111', 6, 18, 1, 1); p('#111', 8, 18, 1, 1); // olho X
    });
  }

  // ======================= ARMAS (vista em 1ª pessoa, 96x72) =======================
  function weaponCanvas(draw) {
    const c = document.createElement('canvas'); c.width = 96; c.height = 72;
    const g = c.getContext('2d');
    draw((col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); }, g);
    return c;
  }
  function revolver(fire) {
    return weaponCanvas((p, g) => {
      const o = fire ? 4 : 0;
      if (fire) {
        g.fillStyle = '#fff6b0'; g.beginPath(); g.arc(48, 6, 9, 0, 7); g.fill();
        g.fillStyle = '#ffd040'; [[36, 4], [60, 4], [48, -6], [42, 14], [54, 14]].forEach(([x, y]) => { g.fillRect(x - 2, y - 2, 5, 5); });
        g.fillStyle = '#ffffff'; g.fillRect(45, 3, 7, 6);
      }
      p('#ecebe4', 30, 62 + o, 36, 10); p('#b9b8b0', 30, 62 + o, 36, 1);       // punho do jaleco
      p('#d9a77c', 37, 48 + o, 22, 15); p('#b07e58', 37, 48 + o, 2, 15);      // mão
      p('#5a3a22', 42, 40 + o, 12, 14); p('#3e2816', 42, 40 + o, 1, 14);      // cabo
      p('#3a3c40', 40, 30 + o, 16, 12);                                        // armação
      p('#5a5c62', 38, 24 + o, 20, 10); p('#2a2c30', 38, 27 + o, 20, 1); p('#2a2c30', 38, 30 + o, 20, 1); p('#7a7c82', 39, 25 + o, 18, 1); // tambor
      p('#2a2c30', 45, 8 + o, 7, 18); p('#7a7c82', 47, 8 + o, 2, 17);          // cano
      p('#1a1a1c', 47, 6 + o, 3, 3);                                           // massa de mira
      p('#2a2c30', 46, 36 + o, 4, 5);                                          // cão
      p('#d9a77c', 52, 38 + o, 6, 8);                                          // polegar
    });
  }
  function scalpel(stab) {
    return weaponCanvas((p) => {
      const dx = stab ? -14 : 0, dy = stab ? -16 : 0;
      p('#ecebe4', 62 + dx, 62 + dy, 34, 14); p('#b9b8b0', 62 + dx, 62 + dy, 34, 1);
      p('#d9a77c', 62 + dx, 46 + dy, 20, 17); p('#b07e58', 62 + dx, 46 + dy, 2, 17);
      for (let i = 0; i < 26; i++) { p('#c8ccd0', 66 + dx - i * 0.55, 48 + dy - i, 3, 1); p('#8a8e94', 68 + dx - i * 0.55, 48 + dy - i, 1, 1); } // cabo
      for (let i = 0; i < 7; i++) p('#eef4fa', 51 + dx - i * 0.6, 22 + dy - i, 2 + (i < 4 ? 1 : 0), 1); // lâmina
      p('#d9a77c', 60 + dx, 44 + dy, 6, 5);                                    // dedos
    });
  }

  // seringa contaminada (24x8)
  function syringe() {
    const c = document.createElement('canvas'); c.width = 24; c.height = 8;
    const g = c.getContext('2d');
    const p = (col, x, y, w = 1, h = 1) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    p('#8a8e94', 0, 1, 2, 6); p('#b8bcc2', 2, 3, 3, 2);                 // êmbolo
    p('#e8eef2', 5, 1, 12, 6); p('#ffffff', 5, 1, 12, 1);               // corpo
    p('#6ad040', 9, 2, 8, 4); p('#a8ff70', 10, 2, 3, 1);              // líquido verde
    p('#3a3a3a', 8, 1, 1, 6); p('#c8ccd0', 17, 3, 2, 2);
    p('#d8dce0', 19, 3, 5, 1); p('#9aa0a6', 19, 4, 5, 1);              // agulha
    return c;
  }

  const BOAR = { front: [0, 1, 2].map(boarFront), side: [0, 1, 2].map(boarSide), dead: boarDead() };
  // carabina de ipê do De Barros: cano longo subindo pro centro, coronha de ipê-amarelo com florzinhas gravadas
  function carabina(fire) {
    return weaponCanvas((p, g) => {
      const o = fire ? 5 : 0;
      if (fire) {
        g.fillStyle = '#fff6b0'; g.beginPath(); g.arc(47, 4, 10, 0, 7); g.fill();
        g.fillStyle = '#ffd040'; [[34, 2], [60, 2], [47, -8], [40, 13], [55, 13]].forEach(([x, y]) => g.fillRect(x - 2, y - 2, 5, 5));
      }
      for (let i = 0; i < 30; i++) p(i % 6 < 3 ? '#a8742a' : '#94621e', 50 + i * 0.75, 44 + i + o, 16, 1);   // coronha de ipê (veios)
      p('#d8b030', 58, 56 + o, 2, 2); p('#d8b030', 64, 62 + o, 2, 2); p('#e8c840', 61, 59 + o, 1, 1);       // florzinhas de ipê
      p('#c8a040', 52, 46 + o, 4, 3);                                                                      // plaquinha "D.B."
      p('#ecebe4', 34, 62 + o, 30, 10); p('#b9b8b0', 34, 62 + o, 30, 1);                                   // punho do jaleco
      p('#d9a77c', 38, 46 + o, 18, 16); p('#b07e58', 38, 46 + o, 2, 16);                                   // mão
      p('#3a3c40', 42, 30 + o, 12, 18); p('#5a5c62', 43, 31 + o, 2, 16);                                   // ferrolho
      p('#a8742a', 41, 34 + o, 3, 12);                                                                     // guarda-mão de madeira
      p('#2a2c30', 45, 6 + o, 6, 26); p('#6a6c72', 47, 6 + o, 2, 25);                                      // cano longo
      p('#1a1a1c', 46, 3 + o, 4, 4);                                                                       // massa de mira
    });
  }
  const WEAPONS = { revolver: [revolver(false), revolver(true)], scalpel: [scalpel(false), scalpel(true)], carabina: [carabina(false), carabina(true)] };

  const SYRINGE = syringe();

  return {
    CHARS, BOAR, WEAPONS, SYRINGE, texFrom,
    get,
    textures(id) { return get(id).body.map(texFrom); },
    drawPortrait(canvas, id, frame) {
      const g = canvas.getContext('2d'); g.imageSmoothingEnabled = false;
      g.drawImage(get(id).face[frame], 0, 0, canvas.width, canvas.height);
    },
  };
})();

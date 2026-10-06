// Texturas pixeladas geradas por código (nada de arquivo de imagem por enquanto)
const TEX = (() => {
  function make(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    draw(g, w, h);
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.canvas = c;
    return t;
  }
  const rgb = (r, g, b) => `rgb(${r | 0},${g | 0},${b | 0})`;
  function speckle(g, w, h, base, vari, seed, x0 = 0, y0 = 0) {
    const r = U.rng(seed);
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      const v = (r() - 0.5) * vari;
      g.fillStyle = rgb(base[0] + v, base[1] + v, base[2] + v); g.fillRect(x, y, 1, 1);
    }
  }

  const T = {};

  T.concrete = make(64, 64, (g, w, h) => {
    speckle(g, w, h, [112, 110, 104], 18, 1);
    const r = U.rng(2);
    for (let i = 0; i < 9; i++) { // escorridos de umidade
      const x = Math.floor(r() * w), len = 10 + r() * 40;
      g.fillStyle = 'rgba(40,38,30,0.25)'; g.fillRect(x, 0, 1 + Math.floor(r() * 2), len);
    }
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 31, w, 1); // junta de forma
  });

  // ---------- FACHADA DO BLOCO D (ref.: fotos da entrada, out/2026) ----------
  // creme, pilares verde-claros, borda de laje esverdeada com limo, janelas com persianas projetadas (toldos brancos)
  // uma "baia" = 4 m de largura x 1 pavimento (3,6 m)
  function moss(g, x0, y0, w, h, n, seed) {
    const r = U.rng(seed);
    for (let i = 0; i < n; i++) {
      g.fillStyle = `rgba(${50 + r() * 20},${62 + r() * 20},${40 + r() * 10},${0.15 + r() * 0.3})`;
      g.fillRect(x0 + Math.floor(r() * w), y0 + Math.floor(r() * h), 1 + Math.floor(r() * 4), 1 + Math.floor(r() * 2));
    }
  }
  function drips(g, x0, y0, w, n, len, seed, col = 'rgba(70,74,60,0.22)') {
    const r = U.rng(seed); g.fillStyle = col;
    for (let i = 0; i < n; i++) g.fillRect(x0 + Math.floor(r() * w), y0, 1, 2 + Math.floor(r() * len));
  }
  function acUnit(g, x, y) {                                       // ar-condicionado de janela/split
    g.fillStyle = '#c9c9c2'; g.fillRect(x, y, 6, 4);
    g.fillStyle = '#7d7f7c'; g.fillRect(x + 1, y + 1, 3, 2);
    g.fillStyle = '#5e605d'; g.fillRect(x, y + 4, 6, 1);
  }
  T.facade = make(64, 58, (g, w, h) => {
    const r = U.rng(4);
    speckle(g, w, h, [214, 208, 186], 8, 3);
    speckle(g, w, 4, [150, 160, 140], 12, 31);                     // borda da laje (verde-acinzentada)
    moss(g, 0, 0, w, 4, 30, 32);
    g.fillStyle = '#6f7466'; g.fillRect(0, 4, w, 1);               // sombra sob a laje
    // faixa de janelas: vidro escuro + caixilho branco + persiana (toldo) em alturas variadas
    for (let x = 4; x < w; x += 15) {
      g.fillStyle = '#1a2128'; g.fillRect(x, 6, 14, 22);
      for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(110,130,150,${0.1 + r() * 0.2})`; g.fillRect(x + 1 + Math.floor(r() * 12), 8 + Math.floor(r() * 18), 1 + Math.floor(r() * 2), 1); }
      g.fillStyle = '#e4e2d8'; g.fillRect(x, 6, 14, 1); g.fillRect(x, 27, 14, 1); g.fillRect(x, 6, 1, 22); g.fillRect(x + 13, 6, 1, 22); g.fillRect(x + 7, 16, 1, 12);
      const down = 4 + Math.floor(r() * 14);                       // quanto a persiana desceu
      for (let y = 7; y < 7 + down; y++) { g.fillStyle = (y % 2) ? '#ece8da' : '#cfcab6'; g.fillRect(x + 1, y, 12, 1); }
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x + 1, 7 + down, 12, 2); // sombra do toldo
      if (r() < 0.3) acUnit(g, x + 4 + Math.floor(r() * 4), 22);
    }
    g.fillStyle = '#b4c2a6'; g.fillRect(0, 0, 4, h);               // pilar verde-claro
    g.fillStyle = '#93a287'; g.fillRect(3, 0, 1, h);
    g.fillStyle = '#c9c2a6'; g.fillRect(4, 28, w - 4, 2);          // peitoril
    drips(g, 4, 30, w - 4, 7, 14, 33);
    if (r() < 0.6) acUnit(g, 20 + Math.floor(r() * 30), 40);      // split pendurado no peitoril
  });
  // 1º pavimento (logo acima da faixa verde): janelões de vidro com caixilho branco, sem toldos
  T.facade1 = make(64, 58, (g, w, h) => {
    const r = U.rng(34);
    speckle(g, w, h, [214, 208, 186], 8, 35);
    speckle(g, w, 4, [150, 160, 140], 12, 36);
    g.fillStyle = '#6f7466'; g.fillRect(0, 4, w, 1);
    for (let x = 4; x < w; x += 15) {
      g.fillStyle = '#202830'; g.fillRect(x, 8, 14, 26);
      for (let i = 0; i < 10; i++) { g.fillStyle = `rgba(${90 + r() * 40},${110 + r() * 40},${100 + r() * 30},${0.12 + r() * 0.2})`; g.fillRect(x + 1 + Math.floor(r() * 12), 9 + Math.floor(r() * 24), 2, 1); } // reflexo das árvores
      g.fillStyle = '#e8e6dc'; g.fillRect(x, 8, 14, 1); g.fillRect(x, 33, 14, 1); g.fillRect(x, 8, 1, 26); g.fillRect(x + 13, 8, 1, 26); g.fillRect(x, 18, 14, 1); g.fillRect(x + 7, 18, 1, 16);
      if (r() < 0.25) { g.fillStyle = '#d8d2bc'; g.fillRect(x + 8, 19, 5, 14); }        // uma folha com papel colado por dentro
    }
    g.fillStyle = '#b4c2a6'; g.fillRect(0, 0, 4, h);
    g.fillStyle = '#93a287'; g.fillRect(3, 0, 1, h);
    g.fillStyle = '#c9c2a6'; g.fillRect(4, 34, w - 4, 2);
    drips(g, 4, 36, w - 4, 6, 12, 37);
    if (r() < 0.7) acUnit(g, 30, 44);
  });
  // faixa verde (marquise de concreto entre o térreo e o 1º andar) e platibanda: concreto esverdeado com limo
  T.fascia = make(64, 32, (g, w, h) => {
    speckle(g, w, h, [138, 150, 128], 12, 38);
    moss(g, 0, 0, w, h, 120, 39);
    drips(g, 0, 0, w, 16, 22, 40, 'rgba(48,56,40,0.3)');
    g.fillStyle = 'rgba(210,214,196,0.35)'; g.fillRect(0, 0, w, 1);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(31, 0, 1, h);      // junta
  });
  // mural do térreo: formas orgânicas pretas em relevo sobre o reboco creme (pássaros, peixes, "olhos", plumas)
  // 24 m x 3,4 m por repetição (16 px/m)
  T.mural = make(384, 54, (g, w, h) => {
    const r = U.rng(41);
    const INK = '#1f1e1b', BG = '#e6dec6';
    g.fillStyle = BG; g.fillRect(0, 0, w, h);
    const blob = (x, y, rx, ry, rot) => { g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); };
    const feather = (x, y, len, ang, wid) => {                     // pluma / gota alongada
      const c = Math.cos(ang), s = Math.sin(ang);
      g.beginPath(); g.moveTo(x, y);
      g.quadraticCurveTo(x + c * len * 0.5 - s * wid, y + s * len * 0.5 + c * wid, x + c * len, y + s * len);
      g.quadraticCurveTo(x + c * len * 0.5 + s * wid * 0.4, y + s * len * 0.5 - c * wid * 0.4, x, y);
      g.fill();
    };
    for (let k = 0; k < 15; k++) {                                 // grupos espalhados ao longo do muro
      const cx = 12 + k * 25 + (r() - 0.5) * 8, cy = 8 + r() * 30;
      const kind = Math.floor(r() * 5);
      g.fillStyle = INK;
      if (kind === 0) {                                            // "pássaro": corpo com furos e olho
        blob(cx, cy + 6, 12, 7, r() - 0.5);
        g.fillStyle = BG; for (let i = 0; i < 4; i++) blob(cx - 7 + i * 4, cy + 7, 1.2, 1.2, 0);
        g.fillStyle = INK; blob(cx + 9, cy - 2, 6, 5, 0);
        g.fillStyle = BG; blob(cx + 10, cy - 3, 2.5, 1.6, 0); g.fillStyle = INK; blob(cx + 10, cy - 3, 1, 1, 0);
      } else if (kind === 1) {                                     // leque de plumas
        const n = 4 + Math.floor(r() * 3), a0 = -1.2 + r() * 0.6;
        for (let i = 0; i < n; i++) feather(cx, cy + 10, 14 + r() * 8, a0 + i * 0.32, 3 + r() * 2);
      } else if (kind === 2) {                                     // lua crescente
        blob(cx, cy + 4, 10, 8, r());
        g.fillStyle = BG; blob(cx + 4, cy + 1, 9, 7, r());
      } else if (kind === 3) {                                     // cardume de gotas
        for (let i = 0; i < 6; i++) feather(cx - 10 + r() * 20, cy + r() * 18, 6 + r() * 6, r() * 6.28, 2 + r() * 1.5);
      } else {                                                     // "olho" grande
        blob(cx, cy + 6, 11, 8, 0.3);
        g.fillStyle = BG; blob(cx, cy + 6, 6, 4, 0.3);
        g.fillStyle = INK; blob(cx + 1, cy + 6, 2.5, 2.5, 0);
      }
    }
    // pixela: cada pixel vira tinta ou reboco (sem serrilhado do canvas)
    const img = g.getImageData(0, 0, w, h), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const ink = d[i] < 128;
      const v = (r() - 0.5) * (ink ? 14 : 10);
      const base = ink ? [31, 30, 27] : [230, 222, 198];
      d[i] = base[0] + v; d[i + 1] = base[1] + v; d[i + 2] = base[2] + v; d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    g.fillStyle = 'rgba(80,76,60,0.18)'; for (let i = 0; i < 30; i++) g.fillRect(Math.floor(r() * w), 0, 1, 3 + Math.floor(r() * 10)); // escorridos
    g.fillStyle = '#8f8a7a'; g.fillRect(0, h - 3, w, 3);           // rodapé
    g.fillStyle = '#4a463e'; for (let i = 0; i < 9; i++) g.fillRect(w - 40 + i * 2, 6 + (i % 3), 2, 1); // assinatura (ilegível)
  });
  // janelas altas (basculantes) entre o mural e a faixa verde, com aparelhos de ar
  T.clerestory = make(48, 16, (g, w, h) => {
    const r = U.rng(42);
    g.fillStyle = '#171d22'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 12; i++) { g.fillStyle = `rgba(110,125,140,${0.1 + r() * 0.15})`; g.fillRect(Math.floor(r() * w), 2 + Math.floor(r() * 12), 2, 1); }
    g.fillStyle = '#d8d4c4';
    for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 1, h);
    g.fillRect(0, 0, w, 1); g.fillRect(0, 8, w, 1); g.fillRect(0, h - 1, w, 1);
    for (let x = 1; x < w; x += 8) if (r() < 0.35) { g.fillStyle = '#d6d6cf'; g.fillRect(x, 6, 7, 7); g.fillStyle = '#4c4e4c'; g.beginPath(); g.arc(x + 3.5, 9.5, 2.5, 0, 7); g.fill(); }
  });
  T.blank = make(64, 64, (g, w, h) => {
    speckle(g, w, h, [202, 200, 192], 8, 40);
    g.fillStyle = "rgba(0,0,0,0.08)"; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, h);
    const r = U.rng(41); g.fillStyle = "rgba(70,68,60,0.12)";
    for (let i = 0; i < 5; i++) g.fillRect(Math.floor(r() * w), 0, 1, 10 + r() * 30);
  });
  // logo: círculo azul cortado por uma cruz branca, com anel branco
  T.logo = make(64, 64, (g) => {
    g.clearRect(0, 0, 64, 64);
    g.fillStyle = "#e8e8e8"; g.beginPath(); g.arc(32, 32, 30, 0, 7); g.fill();
    g.fillStyle = "#2a5aa8"; g.beginPath(); g.arc(32, 32, 27, 0, 7); g.fill();
    g.fillStyle = "#4a7ac4"; g.beginPath(); g.arc(28, 28, 18, 0, 7); g.fill();
    g.fillStyle = "#e8e8e8"; g.fillRect(29, 2, 6, 60); g.fillRect(2, 29, 60, 6);
  });

  T.granilite = make(64, 64, (g, w, h) => {
    speckle(g, w, h, [168, 160, 142], 10, 5);
    const r = U.rng(6), cols = ['#5b5650', '#e8e2d0', '#8a7d68', '#2f2c28', '#a59a85'];
    for (let i = 0; i < 260; i++) { g.fillStyle = U.pick(cols, r); g.fillRect(Math.floor(r() * w), Math.floor(r() * h), 1, 1); }
    g.fillStyle = 'rgba(30,30,30,0.35)'; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, h); // juntas de dilatação
    g.fillStyle = 'rgba(60,50,30,0.12)'; g.fillRect(20, 30, 18, 9); // mancha
  });

  // piso vinílico claro (placas de 50 cm), gasto e com marcas de roda — igual ao dos corredores das fotos
  T.vinyl = make(64, 64, (g, w, h) => {
    speckle(g, w, h, [202, 198, 186], 7, 7);
    g.fillStyle = 'rgba(90,86,74,0.28)'; for (let i = 0; i < w; i += 16) { g.fillRect(i, 0, 1, h); g.fillRect(0, i, w, 1); }
    const r = U.rng(8); g.fillStyle = 'rgba(60,55,45,0.13)';
    for (let i = 0; i < 14; i++) g.fillRect(Math.floor(r() * w), Math.floor(r() * h), 3 + Math.floor(r() * 6), 1);
    g.fillStyle = 'rgba(255,255,255,0.18)'; for (let i = 0; i < 6; i++) g.fillRect(Math.floor(r() * w), Math.floor(r() * h), 5, 1); // brilho da cera
  });
  T.ceiling = make(64, 64, (g, w, h) => {
    speckle(g, w, h, [190, 188, 180], 10, 9);
    g.fillStyle = '#77756e'; for (let i = 0; i < w; i += 16) { g.fillRect(i, 0, 1, h); g.fillRect(0, i, w, 1); } // placas de 62,5 cm
    g.fillStyle = 'rgba(120,90,40,0.35)'; g.beginPath(); g.arc(46, 14, 5, 0, 7); g.fill(); // infiltração
    g.fillStyle = '#0a0a0a'; g.fillRect(17, 49, 15, 15); // placa faltando
  });

  // parede interna (corredores): tinta cinza brilhante em cima, barra de granilite branca salpicada embaixo (0,1–1,1 m)
  T.wall = make(64, 64, (g, w, h) => {
    speckle(g, w, h, [170, 174, 180], 6, 10);
    const r = U.rng(12);
    g.fillStyle = 'rgba(255,255,255,0.10)'; for (let i = 0; i < 5; i++) g.fillRect(Math.floor(r() * w), 0, 3, 40); // brilho da tinta
    speckle(g, w, 20, [214, 212, 206], 6, 11, 0, 42);
    for (let i = 0; i < 110; i++) { g.fillStyle = U.pick(['#2b2a28', '#6a6862', '#8c8a84'], r); g.fillRect(Math.floor(r() * w), 42 + Math.floor(r() * 20), 1, 1); }
    g.fillStyle = '#e4e3de'; g.fillRect(0, 40, w, 2);                // arremate
    g.fillStyle = '#9a9a96'; g.fillRect(0, 41, w, 1);
    g.fillStyle = '#e8e8e4'; g.fillRect(0, 62, w, 2);                // rodapé
    g.fillStyle = 'rgba(40,40,40,0.2)';
    for (let i = 0; i < 5; i++) g.fillRect(Math.floor(r() * w), 46 + Math.floor(r() * 10), 8, 1); // marcas de maca
  });
  // parede do saguão: branca, com faixa azul-acinzentada na altura da maca
  T.lobbyWall = make(64, 64, (g, w, h) => {
    speckle(g, w, h, [222, 222, 216], 6, 43);
    g.fillStyle = '#5d7d8c'; g.fillRect(0, 45, w, 4);
    g.fillStyle = '#486472'; g.fillRect(0, 48, w, 1);
    g.fillStyle = '#9a9c98'; g.fillRect(0, 62, w, 2);
    const r = U.rng(44); g.fillStyle = 'rgba(60,60,60,0.12)';
    for (let i = 0; i < 6; i++) g.fillRect(Math.floor(r() * w), 50 + Math.floor(r() * 10), 6, 1);
  });
  // forro de PVC em réguas (corredores)
  T.pvc = make(64, 64, (g, w, h) => {
    speckle(g, w, h, [214, 214, 208], 5, 45);
    g.fillStyle = 'rgba(80,80,76,0.35)'; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1);
    g.fillStyle = 'rgba(255,255,255,0.25)'; for (let y = 1; y < h; y += 4) g.fillRect(0, y, w, 1);
  });
  // forro de gesso do saguão, com spot redondo
  T.plaster = make(48, 48, (g, w, h) => {
    speckle(g, w, h, [212, 212, 206], 5, 46);
    g.fillStyle = '#6e7070'; g.beginPath(); g.arc(24, 24, 5, 0, 7); g.fill();
    g.fillStyle = '#c4c8cc'; g.beginPath(); g.arc(24, 24, 3.5, 0, 7); g.fill();
  });
  // azulejo branco 15 cm (banheiros) e piso cerâmico 30 cm
  T.tile = make(64, 64, (g, w, h) => {
    speckle(g, w, h, [226, 230, 228], 4, 47);
    g.fillStyle = '#a9aeae'; for (let i = 0; i < w; i += 8) { g.fillRect(i, 0, 1, h); g.fillRect(0, i, w, 1); }
    const r = U.rng(48); g.fillStyle = 'rgba(120,110,80,0.18)';
    for (let i = 0; i < 4; i++) g.fillRect(Math.floor(r() * 8) * 8 + 1, Math.floor(r() * 8) * 8 + 1, 7, 7);
  });
  T.tileFloor = make(64, 64, (g, w, h) => {
    speckle(g, w, h, [212, 216, 214], 5, 49);
    g.fillStyle = '#56595a'; for (let i = 0; i < w; i += 16) { g.fillRect(i, 0, 1, h); g.fillRect(0, i, w, 1); }
    const r = U.rng(50); g.fillStyle = 'rgba(40,40,40,0.25)';
    for (let i = 0; i < 6; i++) g.fillRect(Math.floor(r() * w), Math.floor(r() * h), 1, 1);
  });
  // calçamento sextavado (bloquete) da praça e do retorno
  T.hex = make(64, 64, (g, w, h) => {
    const r = U.rng(51), cells = [];
    for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++)
      cells.push({ x: col * 8 + (row % 2 ? 4 : 0), y: row * 8, v: (r() - 0.5) * 16 });
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let d1 = 1e9, d2 = 1e9, best = null;
      for (const c of cells) for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) {
        const dx = x + 0.5 - (c.x + ox + 0.5), dy = (y + 0.5 - (c.y + oy + 0.5)) * 1.12, d = Math.hypot(dx, dy);
        if (d < d1) { d2 = d1; d1 = d; best = c; } else if (d < d2) d2 = d;
      }
      const v = best.v + (r() - 0.5) * 10;
      g.fillStyle = d2 - d1 < 1.1 ? rgb(70, 66, 60) : rgb(128 + v, 122 + v, 112 + v);
      g.fillRect(x, y, 1, 1);
    }
  });
  T.asphalt = make(64, 64, (g, w, h) => {
    speckle(g, w, h, [46, 47, 50], 16, 13);
    const r = U.rng(14); g.fillStyle = '#1c1c1e';
    for (let i = 0; i < 3; i++) { let x = r() * w, y = r() * h; for (let k = 0; k < 20; k++) { g.fillRect(x | 0, y | 0, 1, 1); x += r() * 2 - 0.5; y += r() * 2 - 1; } }
  });
  T.sidewalk = make(64, 64, (g, w, h) => {
    speckle(g, w, h, [120, 116, 108], 14, 15);
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, h);
  });
  T.grass = make(64, 64, (g, w, h) => {
    speckle(g, w, h, [40, 62, 34], 22, 16);
    const r = U.rng(17); g.fillStyle = '#5a7a3a';
    for (let i = 0; i < 90; i++) g.fillRect(Math.floor(r() * w), Math.floor(r() * h), 1, 2);
  });
  T.leaves = make(32, 32, (g, w, h) => {
    speckle(g, w, h, [32, 54, 30], 30, 18);
    const r = U.rng(19); g.fillStyle = '#0c140b';
    for (let i = 0; i < 60; i++) g.fillRect(Math.floor(r() * w), Math.floor(r() * h), 1, 1);
  });
  T.bark = make(16, 32, (g, w, h) => { speckle(g, w, h, [70, 54, 40], 20, 20); });
  T.metal = make(32, 32, (g, w, h) => { speckle(g, w, h, [150, 154, 158], 10, 21); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(15, 0, 2, h); });
  T.wood = make(32, 32, (g, w, h) => {
    speckle(g, w, h, [120, 84, 52], 10, 22);
    g.fillStyle = 'rgba(60,35,20,0.4)'; for (let y = 3; y < h; y += 5) g.fillRect(0, y, w, 1);
  });
  T.mattress = make(32, 32, (g, w, h) => {
    speckle(g, w, h, [70, 110, 140], 8, 23);
    g.fillStyle = '#d8dad6'; g.fillRect(0, 0, w, 20); // lençol
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, 10, w, 1);
  });
  T.seat = make(32, 32, (g, w, h) => { speckle(g, w, h, [34, 58, 150], 12, 24); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(4, 4, 10, 2); }); // estofado azul royal
  T.carGlass = make(32, 16, (g, w, h) => { speckle(g, w, h, [14, 18, 24], 8, 25); g.fillStyle = 'rgba(120,140,170,0.25)'; g.fillRect(4, 3, 10, 1); });
  T.elevator = make(32, 64, (g, w, h) => {
    speckle(g, w, h, [138, 140, 142], 10, 26);
    g.fillStyle = '#222'; g.fillRect(15, 0, 2, h);
    g.fillStyle = '#e8e4d0'; g.fillRect(4, 22, 22, 12); // papel colado
    g.fillStyle = '#b02020'; g.fillRect(6, 25, 18, 2); g.fillRect(6, 29, 14, 2);
  });
  T.door = make(32, 64, (g, w, h) => {
    speckle(g, w, h, [150, 126, 92], 8, 27);
    g.fillStyle = '#5a5246'; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h); g.fillRect(w - 2, 0, 2, h);
    g.fillStyle = '#1a2026'; g.fillRect(9, 10, 14, 14); // visor
    g.fillStyle = '#ccc'; g.fillRect(24, 34, 5, 2);
  });
  T.board = make(64, 48, (g, w, h) => {
    speckle(g, w, h, [130, 96, 60], 14, 28);
    const r = U.rng(29);
    for (let i = 0; i < 9; i++) {
      g.fillStyle = U.pick(['#eee8d0', '#f4ef9a', '#d6e6f4', '#f0c8c8'], r);
      const x = 3 + Math.floor(r() * 46), y = 3 + Math.floor(r() * 30);
      g.fillRect(x, y, 12, 13);
      g.fillStyle = '#666'; for (let k = 0; k < 4; k++) g.fillRect(x + 2, y + 3 + k * 2, 6 + Math.floor(r() * 3), 1);
      g.fillStyle = '#c22'; g.fillRect(x + 5, y, 2, 2);
    }
  });

  // quadro a óleo do cavalo do Clóvis
  T.horse = make(48, 32, (g, w, h) => {
    speckle(g, w, h, [34, 52, 38], 14, 50);
    g.fillStyle = "#6a4a2a"; g.fillRect(14, 12, 18, 8); g.fillRect(30, 7, 4, 8); g.fillRect(32, 6, 7, 4);  // corpo, pescoço, cabeça
    g.fillStyle = "#3a2410"; g.fillRect(29, 6, 3, 6); g.fillRect(12, 13, 3, 5);                            // crina, rabo
    g.fillStyle = "#5a3a1e"; [15, 18, 27, 30].forEach(x => g.fillRect(x, 20, 2, 7));                        // patas
    g.fillStyle = "#c8a060"; g.fillRect(0, 0, w, 2); g.fillRect(0, h - 2, w, 2); g.fillRect(0, 0, 2, h); g.fillRect(w - 2, 0, 2, h);
    g.fillStyle = "#8a6a30"; g.fillRect(2, 2, w - 4, 1);
  });

  // ---------- PLACAS E OBJETOS DA ENTRADA (ref.: fotos) ----------
  const txt = (g, s, x, y, size, col, align = 'left', weight = 'bold', fam = 'sans-serif') => {
    g.font = `${weight} ${size}px ${fam}`; g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, x, y);
  };
  // letreiro da marquise: HUSM / HOSPITAL / brasão / SUS + EBSERH
  T.husmSign = make(512, 56, (g, w, h) => {
    const split = 360;
    const grd = g.createLinearGradient(0, 0, split, 0); grd.addColorStop(0, '#eef0f0'); grd.addColorStop(1, '#d6d9da');
    g.fillStyle = grd; g.fillRect(0, 0, split, h);
    g.fillStyle = '#4a4d4f'; g.fillRect(split, 0, w - split, h);
    g.fillStyle = '#2a6ab0'; g.beginPath(); g.moveTo(14, 12); g.lineTo(26, 6); g.lineTo(38, 12); g.lineTo(26, 30); g.closePath(); g.fill(); // logo HUSM
    g.fillStyle = '#7fb0e0'; g.fillRect(24, 10, 4, 12);
    txt(g, 'HUSM', 26, 40, 11, '#2a6ab0', 'center');
    txt(g, 'HOSPITAL', 50, 19, 22, '#3a3c3e');
    txt(g, 'HOSPITAL UNIVERSITÁRIO DE SANTA MARIA', 50, 40, 11, '#3a3c3e');
    g.fillStyle = '#f4f4f0'; g.beginPath(); g.arc(328, 28, 18, 0, 7); g.fill();          // brasão
    g.strokeStyle = '#9a9c98'; g.lineWidth = 2; g.beginPath(); g.arc(328, 28, 16, 0, 7); g.stroke();
    g.fillStyle = '#2a4f9a'; g.fillRect(321, 20, 14, 14); g.fillStyle = '#d8b030'; g.fillRect(321, 20, 14, 4);
    txt(g, 'SUS', 392, 18, 17, '#ffffff');
    g.fillStyle = '#ffffff'; g.fillRect(446, 9, 6, 20); g.fillRect(439, 16, 20, 6);    // cruz
    txt(g, 'EBSER', 384, 38, 17, '#ffffff'); txt(g, 'H', 445, 38, 17, '#6ac83c');
    txt(g, 'HOSPITAIS UNIVERSITÁRIOS FEDERAIS', 384, 51, 6, '#e0e0e0');
  });
  // totem "Bloco D"
  T.totem = make(96, 240, (g, w, h) => {
    g.fillStyle = '#e4e5e2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#9a9c98'; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h); g.fillRect(w - 2, 0, 2, h);
    txt(g, 'Bloco', w - 10, 14, 11, '#2a2c2e', 'right', 'normal');
    g.fillStyle = '#1e2022'; g.fillRect(8, 24, w - 16, 62);
    txt(g, 'D', w / 2, 57, 52, '#e8e8e4', 'center');
    ['Portaria Central', 'Agendamentos', 'Acesso Visitantes', 'Ambulatórios', 'Internações', 'Exames de Imagem', 'Hemodinâmica', 'Superintendência']
      .forEach((s, i) => txt(g, s, w - 8, 104 + i * 16, 9, '#3a3c3e', 'right', 'italic bold'));
  });
  // "PROIBIDO FUMAR NESTE LOCAL — Lei Federal nº 9.294/96"
  T.noSmoke = make(64, 96, (g, w, h) => {
    g.fillStyle = '#f2f2ee'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c8202a'; g.fillRect(0, 0, w, 3); g.fillRect(0, h - 3, w, 3); g.fillRect(0, 0, 3, h); g.fillRect(w - 3, 0, 3, h);
    txt(g, 'PROIBIDO', w / 2, 13, 11, '#c8202a', 'center');
    g.fillStyle = '#3a3a3a'; g.fillRect(16, 41, 30, 6); g.fillStyle = '#e88a30'; g.fillRect(42, 41, 4, 6); // cigarro
    g.strokeStyle = '#c8202a'; g.lineWidth = 4; g.beginPath(); g.arc(w / 2, 44, 17, 0, 7); g.stroke();
    g.beginPath(); g.moveTo(20, 32); g.lineTo(44, 56); g.stroke();
    txt(g, 'FUMAR NESTE', w / 2, 70, 8, '#1a1a1a', 'center'); txt(g, 'LOCAL', w / 2, 79, 8, '#1a1a1a', 'center');
    g.fillStyle = '#d8d040'; g.fillRect(3, 85, w - 6, 8); txt(g, 'Lei Federal 9.294/96', w / 2, 89, 5, '#1a1a1a', 'center', 'normal');
  });
  // plaquinha preta dos guichês 21–24
  T.guiche = n => make(40, 32, (g, w, h) => {
    g.fillStyle = '#1c1c20'; g.fillRect(0, 0, w, h);
    txt(g, 'Guichê', w / 2, 7, 7, '#e8e8e8', 'center', 'normal');
    txt(g, String(n), w / 2, 21, 16, '#ffffff', 'center');
  });
  // mural de nuvens azuis do saguão
  T.clouds = make(128, 48, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, '#4f86b8'); grd.addColorStop(1, '#a9cbe6');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    const r = U.rng(52);
    for (let i = 0; i < 26; i++) {
      g.fillStyle = `rgba(240,246,252,${0.35 + r() * 0.5})`;
      const x = r() * w, y = 8 + r() * 34;
      for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(x + k * 4 - 6, y + (r() - 0.5) * 4, 5 + r() * 6, 3 + r() * 3, 0, 0, 7); g.fill(); }
    }
  });
  // quadro do galpãozinho: a ponte sobre o rio
  T.bridge = make(96, 48, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, '#c8b040'); grd.addColorStop(0.55, '#7a9a4a'); grd.addColorStop(1, '#3a6a7a');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a4a2a'; for (let x = 0; x < w; x += 5) g.fillRect(x, 22 + ((x * 7) % 5), 4, 6); // mata ciliar
    g.fillStyle = '#3c2c22'; g.fillRect(4, 18, w - 8, 2);                                      // tabuleiro da ponte
    for (let x = 6; x < w - 6; x += 8) { g.fillRect(x, 10, 1, 9); g.fillRect(x, 10, 8, 1); g.beginPath(); g.moveTo(x, 18); g.lineTo(x + 8, 10); g.lineTo(x + 9, 10); g.lineTo(x + 1, 18); g.fill(); }
    g.fillRect(14, 20, 3, 18); g.fillRect(46, 20, 3, 18); g.fillRect(78, 20, 3, 18);          // pilares
    g.fillStyle = 'rgba(220,230,220,0.35)'; for (let i = 0; i < 10; i++) g.fillRect((i * 37) % w, 40 + (i % 5), 6, 1); // reflexos
    g.fillStyle = '#111'; g.fillRect(50, 13, 1, 5);                                            // um vulto na ponte (caneta Bic)
    g.fillStyle = '#7a5a2a'; g.fillRect(0, 0, w, 2); g.fillRect(0, h - 2, w, 2); g.fillRect(0, 0, 2, h); g.fillRect(w - 2, 0, 2, h);
  });
  // relógio de parede parado em 18h47
  T.clock = make(32, 32, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#2a2a2a'; g.beginPath(); g.arc(16, 16, 15.5, 0, 7); g.fill();
    g.fillStyle = '#f2f2ee'; g.beginPath(); g.arc(16, 16, 13.5, 0, 7); g.fill();
    g.fillStyle = '#333'; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.fillRect(16 + Math.sin(a) * 11 - 0.5, 16 - Math.cos(a) * 11 - 0.5, 1.5, 1.5); }
    const hand = (a, len, wd) => { g.strokeStyle = '#111'; g.lineWidth = wd; g.beginPath(); g.moveTo(16, 16); g.lineTo(16 + Math.sin(a) * len, 16 - Math.cos(a) * len); g.stroke(); };
    hand((6 + 47 / 60) / 12 * Math.PI * 2, 7, 2); hand(47 / 60 * Math.PI * 2, 11, 1.4);
    g.strokeStyle = '#c22'; g.lineWidth = 1; g.beginPath(); g.moveTo(16, 16); g.lineTo(16, 5); g.stroke();
  });
  // painel de senhas (no nobreak)
  T.senha = make(64, 32, (g, w, h) => {
    g.fillStyle = '#0c1a3a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#16306a'; g.fillRect(2, 2, w - 4, 9);
    txt(g, 'SENHA      GUICHÊ', w / 2, 7, 6, '#b8c8f0', 'center', 'normal', 'monospace');
    txt(g, 'PC0696', 24, 21, 12, '#ff4060', 'center', 'bold', 'monospace');
    txt(g, '24', 54, 21, 12, '#ff4060', 'center', 'bold', 'monospace');
  });
  // quadro "INFORMAÇÕES" da coluna verde-petróleo
  T.info = make(48, 64, (g, w, h) => {
    g.fillStyle = '#f0eee8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#5a1a2a'; g.fillRect(0, 0, w, 10); txt(g, 'INFORMAÇÕES', w / 2, 5, 6, '#fff', 'center');
    const r = U.rng(53); g.fillStyle = '#5a5a5a';
    for (let y = 15; y < h - 4; y += 4) { if (y === 31 || y === 47) continue; g.fillRect(3, y, 20 + Math.floor(r() * 22), 1); }
  });
  // placa fotoluminescente de saída (verde, brilha no escuro)
  T.exitSign = make(48, 24, (g, w, h) => {
    g.fillStyle = '#1f9a4a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e8f8e0'; g.fillRect(2, 2, w - 4, 1); g.fillRect(2, h - 3, w - 4, 1);
    g.fillRect(6, 11, 10, 2); g.beginPath(); g.moveTo(5, 12); g.lineTo(10, 7); g.lineTo(10, 17); g.fill(); // seta
    g.fillRect(28, 4, 3, 3); g.fillRect(27, 8, 4, 7); g.fillRect(24, 9, 3, 2); g.fillRect(31, 10, 4, 2);    // homenzinho correndo
    g.fillRect(26, 15, 2, 5); g.fillRect(30, 15, 2, 3); g.fillRect(32, 17, 3, 2);
    g.fillStyle = '#e8f8e0'; g.fillRect(37, 4, 6, 16); g.fillStyle = '#1f9a4a'; g.fillRect(39, 6, 4, 14);   // porta
  });
  // janela interna (caixilho branco, vidro escuro com luar)
  T.window = make(32, 32, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h); grd.addColorStop(0, '#2a3a52'); grd.addColorStop(1, '#141c26');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.fillStyle = '#dcdcd6'; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h); g.fillRect(w - 2, 0, 2, h); g.fillRect(0, h - 2, w, 2); g.fillRect(15, 0, 2, h); g.fillRect(0, 12, w, 2);
  });
  // prédio do outro lado do estacionamento (faixas azuis)
  T.farBlock = make(64, 32, (g, w, h) => {
    speckle(g, w, h, [196, 192, 178], 8, 54);
    for (const y of [4, 15, 26]) {
      g.fillStyle = '#2f6aa8'; g.fillRect(0, y, w, 4);
      g.fillStyle = '#16202a'; for (let x = 1; x < w; x += 6) g.fillRect(x, y + 4, 4, 4);
    }
  });
  // jacarandá: sprite pixelado (tronco, galhos e folhagem rala de primavera), 3 variações
  T.tree = [0, 1, 2].map(v => make(96, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const r = U.rng(60 + v * 7), tips = [];
    const branch = (x, y, ang, len, wd, depth) => {
      const x2 = x + Math.cos(ang) * len, y2 = y - Math.sin(ang) * len;
      g.strokeStyle = depth > 2 ? '#3e3530' : '#4c423a'; g.lineWidth = wd; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
      if (depth >= 5 || len < 5) { tips.push([x2, y2]); return; }
      const n = depth < 2 ? 2 : 2 + (r() < 0.4 ? 1 : 0);
      for (let i = 0; i < n; i++) branch(x2, y2, ang + (i - (n - 1) / 2) * (0.5 + r() * 0.35) + (r() - 0.5) * 0.3, len * (0.68 + r() * 0.15), Math.max(1, wd * 0.62), depth + 1);
    };
    branch(w / 2 + (r() - 0.5) * 6, h, Math.PI / 2 + (r() - 0.5) * 0.15, 44 + r() * 10, 7, 0);
    for (const [x, y] of tips) for (let k = 0; k < 34; k++) {                 // folhinhas plumosas (copa rala de primavera)
      g.fillStyle = U.pick(['#5a7e34', '#6b923e', '#46642c', '#88aa52', '#3a5426'], r);
      const a = r() * 6.28, d = Math.pow(r(), 0.7) * 12;
      g.fillRect(Math.round(x + Math.cos(a) * d * 1.3), Math.round(y + Math.sin(a) * d - 2), 2 + Math.floor(r() * 3), 1 + Math.floor(r() * 2));
    }
    const img = g.getImageData(0, 0, w, h), d = img.data;                  // alfa duro (sem serrilhado)
    for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0;
    g.putImageData(img, 0, 0);
  }));

  // placas com texto
  T.text = function (text, opt = {}) {
    const w = opt.w || 256, h = opt.h || 32;
    return make(w, h, (g) => {
      g.fillStyle = opt.bg || 'transparent';
      if (opt.bg) g.fillRect(0, 0, w, h); else g.clearRect(0, 0, w, h);
      g.font = `bold ${opt.size || 20}px monospace`;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      if (opt.shadow) { g.fillStyle = opt.shadow; g.fillText(text, w / 2 + 1, h / 2 + 2); }
      g.fillStyle = opt.fg || '#fff';
      g.fillText(text, w / 2, h / 2 + 1);
      if (opt.border) { g.strokeStyle = opt.fg || '#fff'; g.lineWidth = 2; g.strokeRect(2, 2, w - 4, h - 4); }
    });
  };

  return T;
})();

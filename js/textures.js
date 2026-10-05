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

  // fachada (ref.: foto da fachada): concreto claro, faixa contínua de janelas recuadas, laje-brise e toldos
  // uma "baia" = 4 m de largura x 1 pavimento
  T.facade = make(64, 58, (g, w, h) => {
    speckle(g, w, h, [196, 194, 186], 10, 3);
    const r = U.rng(4);
    g.fillStyle = "#a9a69c"; g.fillRect(0, 0, w, 4);              // laje / brise (topo)
    g.fillStyle = "#6c6a64"; g.fillRect(0, 4, w, 2);              // sombra sob a laje
    g.fillStyle = "#151a20"; g.fillRect(0, 6, w, 30);             // janelas (recuadas)
    for (let i = 0; i < 24; i++) { g.fillStyle = "rgba(90,110,140," + (0.12 + r() * 0.2) + ")"; g.fillRect(Math.floor(r() * w), 8 + Math.floor(r() * 26), 1 + Math.floor(r() * 3), 1); }
    for (let x = 0; x < w; x += 16) {
      g.fillStyle = "#8a8880"; g.fillRect(x, 6, 2, 30);           // montantes
      if (r() < 0.55) {                                            // toldo inclinado
        g.fillStyle = "#cfccc2"; g.fillRect(x + 3, 7, 11, 3);
        g.fillStyle = "#7d7a72"; g.fillRect(x + 3, 10, 11, 1);
        g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(x + 3, 11, 11, 3);
      }
      if (r() < 0.35) { g.fillStyle = "#8b8e90"; g.fillRect(x + 9, 26, 5, 4); g.fillStyle = "#5c5f62"; g.fillRect(x + 9, 30, 5, 1); } // ar-condicionado
    }
    g.fillStyle = "#b9b6ac"; g.fillRect(0, 36, w, 3);              // peitoril
    g.fillStyle = "rgba(60,58,50,0.25)";
    for (let i = 0; i < 6; i++) { const x = Math.floor(r() * w); g.fillRect(x, 39, 1, 6 + r() * 12); }
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

  T.vinyl = make(64, 64, (g, w, h) => { // piso do corredor
    speckle(g, w, h, [128, 140, 132], 8, 7);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 0, w, 1); g.fillRect(0, 0, 1, h); g.fillRect(32, 0, 1, h); g.fillRect(0, 32, w, 1);
    const r = U.rng(8); g.fillStyle = 'rgba(30,25,20,0.15)';
    for (let i = 0; i < 12; i++) g.fillRect(Math.floor(r() * w), Math.floor(r() * h), 4, 2);
  });

  T.ceiling = make(64, 64, (g, w, h) => {
    speckle(g, w, h, [190, 188, 180], 10, 9);
    g.fillStyle = '#77756e'; for (let i = 0; i < w; i += 16) { g.fillRect(i, 0, 1, h); g.fillRect(0, i, w, 1); } // placas de 62,5 cm
    g.fillStyle = 'rgba(120,90,40,0.35)'; g.beginPath(); g.arc(46, 14, 5, 0, 7); g.fill(); // infiltração
    g.fillStyle = '#0a0a0a'; g.fillRect(17, 49, 15, 15); // placa faltando
  });

  // parede interna: parte de cima clara, barra verde-hospital embaixo
  T.wall = make(64, 64, (g, w, h) => {
    speckle(g, w, h, [196, 194, 182], 8, 10);
    speckle(g, w, 22, [120, 160, 140], 8, 11, 0, 42);
    g.fillStyle = '#4f7062'; g.fillRect(0, 41, w, 2);
    g.fillStyle = '#6a6458'; g.fillRect(0, 62, w, 2); // rodapé
    const r = U.rng(12); g.fillStyle = 'rgba(40,40,40,0.18)';
    for (let i = 0; i < 5; i++) g.fillRect(Math.floor(r() * w), 46 + Math.floor(r() * 10), 8, 1); // marcas de maca na parede
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
  T.seat = make(32, 32, (g, w, h) => { speckle(g, w, h, [40, 60, 92], 12, 24); });
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

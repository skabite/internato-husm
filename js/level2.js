// CAPÍTULO 2 — Cirurgia Vascular (De Barros) e CCIH (arena do chefe).
// LAYOUT PROVISÓRIO em ASCII: 1 caractere = 1 m.   #  parede   .  piso   c  café
// Coluna 0 = x -30, linha 0 = z -106 (encosta na porta dos fundos da sala do Javali).
const LEVEL2 = (() => {
  const MAP = [
    '#############################..#############################',
    '#############################..#############################',
    '############################....############################',
    '#########..................#....#................###########',
    '#########..................#....#................###########',
    '#########..................#....#................###########',
    '#########..................#....#................###########',
    '#########........................................###########',
    '#########........................................###########',
    '#########........................................###########',
    '#########..................#....#................###########',
    '#########..................#....#................###########',
    '#########..................#....#................###########',
    '#########..................#....#................###########',
    '####....................................................####',
    '####.c..................................................####',
    '####..................................................c.####',
    '####....................................................####',
    '############################....############################',
    '############################....############################',
    '############################....############################',
    '#####..................................................#####',
    '#####.c..............................................c.#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####.......##........##............##........##.......#####',
    '#####.......##........##............##........##.......#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####........................##........................#####',
    '#####........................##........................#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####.......##........##............##........##.......#####',
    '#####.......##........##............##........##.......#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####............##......................##............#####',
    '#####............##......................##............#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####..................................................#####',
    '#####.c..............................................c.#####',
    '#####..................................................#####',
    '############################################################',
    '############################################################',
    '############################################################',
  ];
  const X0 = -30, Z0 = -106, WALL_H = 3;
  const cx = c => X0 + c + 0.5, cz = r => Z0 - r - 0.5;

  function build(scene, hooks) {
    const M = hooks.M, box = WORLD.box, panel = WORLD.panel, sign = WORLD.sign;
    const colliders = WORLD.colliders;
    const out = { cafes: [], doors: {}, gels: [], lights: [] };

    // ---------- PAREDES ----------
    const runs = [];
    MAP.forEach((row, r) => {
      let c = 0;
      while (c < row.length) {
        if (row[c] !== '#') { c++; continue; }
        let e = c; while (e + 1 < row.length && row[e + 1] === '#') e++;
        const prev = runs.find(q => q.c1 === c && q.c2 === e && q.r2 === r - 1);
        if (prev) prev.r2 = r; else runs.push({ c1: c, c2: e, r1: r, r2: r });
        c = e + 1;
      }
    });
    for (const q of runs) box(X0 + q.c1, 0, Z0 - q.r2 - 1, X0 + q.c2 + 1, WALL_H, Z0 - q.r1, M.wallLow, { collide: true });
    const xw = MAP[0].length, zh = MAP.length;
    box(X0, -0.02, Z0 - zh, X0 + xw, 0.02, Z0, M.granilite);
    box(X0, WALL_H - 0.05, Z0 - zh, X0 + xw, WALL_H, Z0, M.ceiling);
    box(X0, WALL_H, Z0 - zh, X0 + xw, hooks.TOP, Z0, M.concrete);
    colliders.push({ x1: -200, x2: 200, z1: -300, z2: Z0 - zh });

    MAP.forEach((row, r) => [...row].forEach((ch, c) => {
      if (ch === 'c') out.cafes.push(hooks.cafe(cx(c), cz(r)));
    }));

    // ---------- PORTAS ----------
    function door(name, x1, z1, x2, z2, slide, o = {}) {
      const mesh = box(x1, 0, z1, x2, 2.4, z2, M.door, { su: o.su || 1, sv: 2.1 });
      const col = { x1, x2, z1, z2 }; colliders.push(col);
      const d = { name, mesh, col, locked: !!o.locked, lockedMsg: o.lockedMsg || 'Trancada.', open: false, t: 0,
        slide: new THREE.Vector3(...slide), base: mesh.position.clone(), partner: null };
      d.tryOpen = () => {
        if (d.open) return;
        if (d.locked) { hooks.toast(d.lockedMsg, 4); AUDIO.sfx('dry'); return; }
        for (const k of [d, d.partner]) { if (!k) continue; k.open = true; const i = colliders.indexOf(k.col); if (i >= 0) colliders.splice(i, 1); }
        AUDIO.sfx('door');
      };
      d.close = () => {
        for (const k of [d, d.partner]) {
          if (!k) continue;
          k.open = false; k.t = 0; k.mesh.position.copy(k.base);
          if (!colliders.includes(k.col)) colliders.push(k.col);
        }
      };
      mesh.userData.verb = 'abrir';
      mesh.userData.onUse = () => d.tryOpen();
      out.doors[name] = d;
      return d;
    }
    box(-2, 2.4, -124.2, 2, WALL_H, -124, M.wallLow);
    const ccL = door('ccih', -2, -124.15, 0, -124.05, [-2, 0, 0], { su: 2, locked: true,
      lockedMsg: 'CCIH. Um aviso: "ATENDIMENTO SOMENTE COM AGENDAMENTO. PRÓXIMA VAGA: MARÇO."' });
    const ccR = door('ccih2', 0, -124.15, 2, -124.05, [2, 0, 0], { su: 2, locked: true });
    ccL.partner = ccR; ccR.partner = ccL; ccR.mesh.userData.onUse = () => ccL.tryOpen();

    // ---------- PLACAS ----------
    sign('CIRURGIA VASCULAR — PROF. DE BARROS', -1.99, 2.62, -114.5, 2.6, 0.3, 'x+', { w: 320, h: 24, size: 14, fg: '#fff', bg: '#5a1a2a', border: true });
    sign('ECODOPPLER', 1.99, 2.62, -114.5, 1.8, 0.3, 'x-', { w: 128, h: 20, size: 13, fg: '#fff', bg: '#1d4a7a' });
    sign('CCIH — COMISSÃO DE CONTROLE DE INFECÇÃO HOSPITALAR', 0, 2.72, -123.98, 3.8, 0.35, 'z+', { w: 512, h: 24, size: 15, fg: '#fff', bg: '#1a5a3a', border: true });
    sign('LAVE AS MÃOS', 0, 1.7, -123.97, 1.4, 0.3, 'z+', { w: 96, h: 20, size: 13, fg: '#1a5a3a', bg: '#e8f4ec' });

    // ---------- SALA DO DE BARROS ----------
    box(-14, 0, -111.6, -9, 0.78, -110.6, M.wood, { collide: true, msg: 'A mesa do De Barros. Duas canetas tinteiro, uma de cada lado. Duas evoluções sendo escritas ao mesmo tempo.' });
    box(-12.2, 0.78, -111.4, -11.8, 0.82, -110.9, M.dark);
    panel(-12, 1.8, -109.02, 2.2, 1.4, 'z-', new THREE.MeshPhongMaterial({ map: TEX.horse }), { msg: 'Quadro a óleo: um cavalo. O cavalo do De Barros. Provavelmente o cavalo tem um quadro do De Barros na baia.' });
    box(-20.9, 0, -113, -19.6, 1.2, -111, M.wood, { collide: true, msg: 'Maquete de lancha, escala 1:20. Na proa: "DE BARROS III". Ninguém sabe o que houve com a I e a II.' });
    box(-4.2, 0, -110, -3.2, 1.0, -109.2, M.metal, { collide: true, msg: 'Dois tacos de golfe: um canhoto, um destro. Ambidestro até no golfe.' });
    box(-20.9, 0, -119.8, -17, 1.9, -119.2, M.wood, { collide: true, msg: 'Estante. Livros de vascular, um guia de vinhos de Bordeaux e um extrato bancário emoldurado.' });
    sign('"A EXCELÊNCIA NÃO É UM ATO, É UM PATRIMÔNIO." — D.B.', -12, 2.4, -119.97, 3.2, 0.3, 'z+', { w: 384, h: 24, size: 12, fg: '#d8c060', bg: '#2a1a10' });
    out.clovisPos = new THREE.Vector3(-12, 0, -109.9);
    out.zoneClovis = { x1: -21, x2: -3, z1: -120, z2: -109 };

    // ---------- ECODOPPLER ----------
    box(8, 0, -111, 9.2, 1.5, -110, M.dark, { collide: true, msg: 'Aparelho de ecodoppler. Desligado. Na tela, um adesivo: "PROPRIEDADE DO DE BARROS. SIM, ESSE TAMBÉM."' });
    hooks.stretcher(12, -113, Math.PI / 2);

    // ---------- CCIH (arena) ----------
    // mesa do chefe e o armário da cefalexina
    box(-3, 0, -159.6, 3, 0.78, -158.6, M.wood, { collide: true, msg: 'Mesa da CCIH. Pilhas de pareceres. Todos com a palavra "NÃO" carimbada.' });
    box(19, 0, -162.9, 23, 2.0, -162.3, M.metal, { collide: true, msg: 'Armário de vidro: CEFALEXINA 500 mg. Etiqueta: "USO NÃO AUTORIZADO PELA CCIH". O comprimido parece te olhar com pena.' });
    sign('CEFALEXINA — NÃO AUTORIZADA', 21, 2.25, -162.28, 2.6, 0.3, 'z+', { w: 256, h: 20, size: 13, fg: '#fff', bg: '#8a1a1a' });
    sign('INFECÇÃO HOSPITALAR SE COMBATE COM PARECER', -12, 2.3, -127.02, 4, 0.3, 'z-', { w: 384, h: 20, size: 13, fg: '#1a5a3a', bg: '#e8f4ec' });
    // álcool gel nos pilares (cura um pouco, uma vez cada)
    for (const [c, r] of [[12, 27], [46, 27], [22, 38], [36, 38]]) {
      const x = cx(c) + 0.5, z = cz(r) + 0.51;
      const m = box(x - 0.15, 1.1, z - 0.01, x + 0.15, 1.5, z + 0.12, new THREE.MeshPhongMaterial({ color: 0xe8f4ec, emissive: 0x204030 }));
      const g = { mesh: m, used: false };
      m.userData.verb = 'usar álcool gel';
      m.userData.onUse = () => hooks.onGel(g);
      out.gels.push(g);
    }
    for (const [x, z] of [[-18, -135], [18, -135], [-18, -155], [18, -155]]) {
      const l = new THREE.PointLight(0x40ff90, 0.8, 13, 2); l.position.set(x, 2.7, z); scene.add(l);
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0x60ffa0 }));
      b.position.copy(l.position); scene.add(b); l.userData.bulb = b; out.lights.push(l);
    }
    // pontos por onde o chefe se move
    out.waypoints = [[29, 50], [15, 44], [44, 44], [29, 25], [9, 32], [50, 32], [20, 53], [39, 53], [29, 43], [8, 50], [51, 50]]
      .map(([c, r]) => new THREE.Vector3(cx(c), 0, cz(r)));
    out.bossPos = new THREE.Vector3(0, 0, -157.5);
    out.zoneArena = { x1: -25, x2: 25, z1: -163, z2: -128.5 };
    out.checkpoint = new THREE.Vector3(0, 0, -122.5);
    out.arenaGate = { x1: -2, x2: 2, z1: -127.3, z2: -127 };   // fecha a entrada durante a luta

    return out;
  }

  return { build, MAP };
})();

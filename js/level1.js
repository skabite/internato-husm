// CAPÍTULO 1 — ala de trás do térreo: Endoscopia, Cirurgia Torácica, Copa, Prescrição e Ala C.
// LAYOUT PROVISÓRIO desenhado em ASCII: 1 caractere = 1 m. Trocar pelo desenho real quando houver planta.
//   #  parede (3 m)      .  piso      J  javali      c  café (cura)
// Coluna 0 = x -30, linha 0 = z -46 (encosta no fim do corredor dos ambulatórios).
const LEVEL1 = (() => {
  const MAP = [
    '############################....############################',
    '############################....############################',
    '##.......##................#....#................##.......##',
    '##.......##................#....#................##.......##',
    '##.......##................#....#................##.......##',
    '##..c....##................#....#................##.......##',
    '##.......##......................................##.......##',
    '##.......##......................................##.......##',
    '##.......##......................................##.......##',
    '##.......##................#....#................##.......##',
    '##.....c.##................#....#................##.......##',
    '##.......##................#....#................##.......##',
    '##.......##................#....#................##.......##',
    '####..######################....#####################..#####',
    '####..######################....#####################..#####',
    '##........................................................##',
    '##........................................................##',
    '##........................................................##',
    '##........................................................##',
    '############################....############################',
    '############################....############################',
    '############################....############################',
    '####....................................................####',
    '####.c..................................................####',
    '####....................................................####',
    '####............##........................##............####',
    '####............##........................##............####',
    '####........J.................................J.........####',
    '####....................................................####',
    '####....................................................####',
    '####......#############..............#############......####',
    '####......#############..............#############......####',
    '####....................................................####',
    '####..........................J.........................####',
    '####....................................................####',
    '####.........................##...................J.....####',
    '####....J....................##.........................####',
    '####....................................................####',
    '####....................................................####',
    '####....................................................####',
    '###############.........############.........###############',
    '###############.........############.........###############',
    '####....................................................####',
    '####..........................c.........................####',
    '####................J...................................####',
    '####..............##....................##..............####',
    '####..............##....................##..........J...####',
    '####..................................J.................####',
    '####.......................J............................####',
    '####..................................................c.####',
    '####....................................................####',
    '#############################..#############################',
    '#############################..#############################',
    '######################................######################',
    '######################................######################',
    '######################................######################',
    '######################................######################',
    '######################................######################',
    '######################................######################',
    '#############################..#############################',
  ];
  const X0 = -30, Z0 = -46, WALL_H = 3;
  const cx = c => X0 + c + 0.5, cz = r => Z0 - r - 0.5;

  function build(scene, hooks) {
    const M = hooks.M, box = WORLD.box, panel = WORLD.panel, sign = WORLD.sign;
    const colliders = WORLD.colliders;
    const out = { boars: [], cafes: [], doors: {}, searchables: [], lights: [] };

    // ---------- PAREDES (trechos horizontais, fundidos verticalmente) ----------
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

    // piso, forro e o volume do prédio acima
    const xw = MAP[0].length, zh = MAP.length;
    box(X0, -0.02, Z0 - zh, X0 + xw, 0.02, Z0, M.vinyl);
    box(X0, WALL_H - 0.05, Z0 - zh, X0 + xw, WALL_H, Z0, M.ceiling);
    box(X0, WALL_H, Z0 - zh, X0 + xw, hooks.TOP, Z0, M.concrete);
    // ninguém sai do prédio pelos fundos
    colliders.push({ x1: -200, x2: X0, z1: -300, z2: Z0 }, { x1: X0 + xw, x2: 200, z1: -300, z2: Z0 });

    // ---------- ENTIDADES DO MAPA ----------
    MAP.forEach((row, r) => [...row].forEach((ch, c) => {
      if (ch === 'J') out.boars.push({ x: cx(c), z: cz(r) });
      if (ch === 'c') out.cafes.push(cafe(cx(c), cz(r)));
    }));
    function cafe(x, z) {
      const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.14, 8), new THREE.MeshPhongMaterial({ color: 0xf2efe6, emissive: 0x333333 }));
      cup.position.y = 0.8; g.add(cup);
      const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.01, 8), new THREE.MeshBasicMaterial({ color: 0x3a2010 }));
      coffee.position.y = 0.87; g.add(coffee);
      const stool = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.72, 0.35), M.metal); stool.position.y = 0.36; g.add(stool);
      return { x, z, group: g, cup, taken: false };
    }

    out.makeCafe = cafe;

    // ---------- PORTAS ----------
    function door(name, x1, z1, x2, z2, slide, o = {}) {
      const mesh = box(x1, 0, z1, x2, 2.4, z2, M.door, { su: o.su || 1, sv: 2.1 });
      const col = { x1, x2, z1, z2 }; colliders.push(col);
      const d = { name, mesh, col, locked: !!o.locked, lockedMsg: o.lockedMsg || 'Trancada.', open: false, t: 0,
        slide: new THREE.Vector3(...slide), base: mesh.position.clone(), partner: null };
      d.tryOpen = () => {
        if (d.open) return;
        if (d.locked) { hooks.toast(d.lockedMsg, 4); AUDIO.sfx('dry'); return; }
        for (const k of [d, d.partner]) {
          if (!k) continue;
          k.open = true;
          const i = colliders.indexOf(k.col); if (i >= 0) colliders.splice(i, 1);
        }
        AUDIO.sfx('door');
      };
      mesh.userData.verb = 'abrir';
      mesh.userData.onUse = () => d.tryOpen();
      out.doors[name] = d;
      return d;
    }
    // lintéis sobre as portas
    box(2, 2.4, -55, 3, WALL_H, -52, M.wallLow);
    box(-2, 2.4, -65.2, 2, WALL_H, -65, M.wallLow);
    box(-1, 2.4, -97.2, 1, WALL_H, -97, M.wallLow);

    door('torax', 2.45, -55, 2.55, -52, [0, 0, -3], { su: 1.5, locked: true,
      lockedMsg: 'CIRURGIA TORÁCICA — "Não entre sem bater. Nem batendo." Você não tem motivo pra entrar aí. Ainda.' });
    const alaL = door('alaC', -2, -65.15, 0, -65.05, [-2, 0, 0], { su: 2, locked: true,
      lockedMsg: 'ALA C. Trancada. Do outro lado... grunhidos? Não. Não pode ser.' });
    const alaR = door('alaC2', 0, -65.15, 2, -65.05, [2, 0, 0], { su: 2, locked: true });
    alaL.partner = alaR; alaR.partner = alaL;
    alaR.mesh.userData.onUse = () => alaL.tryOpen();
    door('prof3', -1, -97.15, 1, -97.05, [-2, 0, 0], { su: 2, locked: true,
      lockedMsg: 'Uma voz lá de dentro: "SÓ ABRO QUANDO ESSES BICHOS PARAREM DE GRUNHIR!"' });
    box(-1, 2.4, -105.55, 1, WALL_H, -105.45, M.wallLow);
    door('prof3back', -1, -105.55, 1, -105.45, [-2, 0, 0], { su: 2, locked: true, lockedMsg: 'Porta dos fundos. Trancada. O Professor3 está com a chave... e te observando.' });
    sign('VASCULAR · CCIH ↓', 0, 2.62, -105.44, 1.8, 0.3, 'z+', { w: 128, h: 20, size: 12, fg: '#fff', bg: '#2a5a3a' });

    // ---------- PLACAS ----------
    sign('ENDOSCOPIA DIGESTIVA', -1.99, 2.62, -53.5, 2.4, 0.3, 'x+', { w: 256, h: 24, size: 15, fg: '#fff', bg: '#7a3a5a', border: true });
    sign('CIRURGIA TORÁCICA', 1.99, 2.62, -53.5, 2.4, 0.3, 'x-', { w: 256, h: 24, size: 15, fg: '#fff', bg: '#1d4a7a', border: true });
    sign('COPA', -25, 2.5, -61.01, 1.2, 0.3, 'z-', { w: 64, h: 16, size: 11, fg: '#222', bg: '#ddd' });
    sign('PRESCRIÇÃO', 24, 2.5, -61.01, 1.6, 0.3, 'z-', { w: 96, h: 18, size: 12, fg: '#222', bg: '#ddd' });
    sign('ALA C', 0, 2.72, -64.98, 1.6, 0.4, 'z+', { w: 64, h: 18, size: 14, fg: '#fff', bg: '#8a1a1a', border: true });
    sign('NÃO ALIMENTE OS ANIMAIS', 0, 1.6, -64.97, 1.6, 0.25, 'z+', { w: 192, h: 20, size: 12, fg: '#111', bg: '#f0e060' });
    sign('PROFESSOR3', 0, 2.62, -96.98, 1.6, 0.3, 'z+', { w: 96, h: 18, size: 12, fg: '#222', bg: '#ddd' });

    // ---------- ENDOSCOPIA (Dudu) ----------
    box(-14, 0, -49.2, -13, 1.6, -48.4, M.dark, { collide: true, msg: 'Torre de vídeo da endoscopia. Ligada no nobreak. A tela mostra... você prefere não saber.' });
    panel(-13.5, 1.25, -49.21, 0.7, 0.5, 'z+', new THREE.MeshBasicMaterial({ color: 0xd87a8a }));
    const scrLight = new THREE.PointLight(0xff9aaa, 0.9, 7, 2); scrLight.position.set(-13.5, 1.4, -50); scene.add(scrLight);
    hooks.stretcher(-8, -50.5, Math.PI / 2);
    box(-18.9, 0, -58.9, -16, 0.9, -57.4, M.metal, { collide: true, msg: 'Pia de lavagem dos endoscópios. Impecável. Tem uma etiqueta: "LIMPO 19h02 — D."' });
    box(-6, 0, -58.9, -3.2, 1.9, -58.3, M.wood, { collide: true, msg: 'Armário de aparelhos. Cada colonoscópio pendurado à mesma distância exata do outro. Você mede com o dedo. 15 cm. Todos.' });
    WORLD.sign('SILÊNCIO — EXAME EM ANDAMENTO', -11, 2.3, -58.98, 2.4, 0.3, 'z+', { w: 256, h: 24, size: 13, fg: '#fff', bg: '#5a2a4a' });
    out.duduPos = new THREE.Vector3(-11.5, 0, -51.8);
    out.zoneEndo = { x1: -19, x2: -3, z1: -59, z2: -48 };

    // ---------- CIRURGIA TORÁCICA (o revólver) ----------
    box(8, 0, -51, 12, 0.78, -49.6, M.wood, { collide: true });
    box(10, 0.78, -50.4, 10.6, 1.1, -50.2, M.dark);
    const spots = [
      { at: [8.9, 0.5, -51.01, 1.0, 0.3, 'z-'], name: 'Gaveta de cima da mesa', msg: 'Post-its: "NÃO MEXA NA MINHA GAVETA". Você mexeu.' },
      { at: [11.1, 0.25, -51.01, 1.0, 0.3, 'z-'], name: 'Gaveta de baixo da mesa', msg: 'Um Sabiston, três canetas sem tampa e uma foto autografada de um pneumotórax hipertensivo.' },
      { at: [18.39, 1.0, -50.5, 1.2, 2.0, 'x-'], name: 'Armário de aço', msg: 'Catorze caixas de fio de sutura, organizadas por cor. O Dudu aprovaria.' },
      { at: [18.39, 1.0, -54.5, 1.2, 2.0, 'x-'], name: 'Armário de madeira', msg: 'Dois drenos de tórax, um jaleco de 1998 e um cheiro forte de naftalina.' },
      { at: [3.61, 0.6, -57.5, 1.4, 1.2, 'x+'], name: 'Arquivo', msg: 'Prontuários antigos. Um deles tem só uma palavra escrita: "JAVALI?". Data de ontem.' },
    ];
    const gunAt = Math.floor(Math.random() * spots.length);
    spots.forEach((sp, i) => {
      const [x, y, z, w, h, f] = sp.at;
      const mat = i === 2 || i === 4 ? M.metal : M.wood;
      if (f === 'x-') box(x + 0.01, 0, z - w / 2, x + 0.61, h, z + w / 2, mat, { collide: true });
      if (f === 'x+') box(x - 0.61, 0, z - w / 2, x - 0.01, h, z + w / 2, mat, { collide: true });
      const m = panel(x, y, z, w, h, f, mat);
      m.userData.verb = 'revistar';
      m.userData.onUse = () => {
        if (i === gunAt && !out.gunTaken) { out.gunTaken = true; hooks.onGun(sp.name); return; }
        hooks.toast(sp.name + ': ' + sp.msg, 5);
      };
      out.searchables.push(m);
    });
    sign('"QUEM MEXER NAS MINHAS COISAS VAI SER DRENADO"', 11, 2.3, -47.02, 3.4, 0.3, 'z-', { w: 384, h: 24, size: 13, fg: '#111', bg: '#e8e2cc' });

    // ---------- COPA ----------
    box(-27, 0, -55, -25.5, 0.75, -53.5, M.wood, { collide: true, msg: 'Mesa da copa. Tem um bolo pela metade com a vela "6". Ninguém sabe de quem é.' });
    box(-27.95, 0, -50.5, -27.3, 1.8, -49.5, M.metal, { collide: true, msg: 'Geladeira. Sem luz, mas ainda gelada. Uma marmita etiquetada: "DUDU — NÃO TOCAR — SÉRIO".' });
    box(-23.6, 0.9, -48.6, -23, 1.2, -48.1, M.dark, { msg: 'O micro-ondas. Cheiro de peixe. Ninguém assume.' });
    box(-24, 0, -48.6, -22.4, 0.9, -48.05, M.wood, { collide: true });

    // ---------- PRESCRIÇÃO ----------
    for (const [z, msg] of [[-50, 'Computadores desligados. Um post-it: "SENHA DO SISTEMA: a de sempre".'], [-54, 'Uma prescrição pela metade: "Dipirona 1 g EV se dor ou se javali".']]) {
      box(21.5, 0, z - 0.6, 27.5, 0.75, z + 0.6, M.wood, { collide: true, msg });
      for (const x of [22.5, 24.5, 26.5]) box(x - 0.3, 0.75, z - 0.25, x + 0.3, 1.15, z - 0.2, M.dark);
    }

    // ---------- ALA C ----------
    for (let x = -24; x <= 24; x += 4.5) hooks.stretcher(x, -69.6, 0);
    for (const x of [-18, -13, 13, 18]) hooks.stretcher(x, -79.2, 0);
    for (const x of [-22, -6, 6, 20]) hooks.stretcher(x, -90.2, x > 0 ? 0.25 : -0.25);
    for (const [x, z] of [[-20, -70], [20, -94], [0, -94]]) {
      const l = new THREE.PointLight(0xff2a1a, 1.0, 11, 2); l.position.set(x, 2.7, z); scene.add(l);
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.12), new THREE.MeshBasicMaterial({ color: 0xff3020 }));
      b.position.copy(l.position); scene.add(b); l.userData.bulb = b; out.lights.push(l);
    }
    out.zoneWard = { x1: -26, x2: 26, z1: -97, z2: -65 };
    out.checkpoint = new THREE.Vector3(0, 0, -63.2);

    // ---------- SALA DO PROFESSOR3 ----------
    box(-2, 0, -103.6, 2, 0.78, -102.6, M.wood, { collide: true, msg: 'A mesa do Professor3. Uma pilha de laudos, todos fora de ordem. O Dudu teria um infarto.' });
    const lamp = new THREE.PointLight(0xffc070, 1.6, 9, 2); lamp.position.set(1.4, 1.3, -103); scene.add(lamp);
    box(1.2, 0.78, -103.2, 1.6, 1.15, -102.9, M.metal);
    sign('MELHOR PROFESSOR 2019', -5, 1.7, -104.98, 1.6, 0.6, 'z+', { w: 128, h: 48, size: 12, fg: '#5a4a10', bg: '#d8c060', border: true });
    out.prof3Pos = new THREE.Vector3(0, 0, -104.2);
    out.zoneProf3 = { x1: -8, x2: 8, z1: -105, z2: -99.3 };

    return out;
  }

  return { build, MAP };
})();

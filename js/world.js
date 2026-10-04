// Construção do mapa. Escala: 1 unidade = 1 metro.
// ATENÇÃO: layout PROVISÓRIO — será substituído pelas plantas/fotos reais do HUSM.
// Eixos: x = ao longo da fachada, z = profundidade (fachada principal em z = 0, rua em +z), y = altura.
const WORLD = (() => {
  const FLOOR_H = 4.5;   // pé-direito do térreo (provisório)
  const UP_H = 3.6;      // altura dos pavimentos superiores (provisória)
  const FLOORS = 8;      // térreo + 7 (estimado pela foto da fachada — confirmar)
  const TOP = FLOOR_H + UP_H * (FLOORS - 1);

  let scene, colliders, interactables;

  function mat(tex, su = 2, sv = 2, extra = {}) {
    const m = new THREE.MeshPhongMaterial(Object.assign({ map: tex, shininess: 4, specular: 0x111111 }, extra));
    m.userData.su = su; m.userData.sv = sv;
    return m;
  }

  // ajusta UVs para a textura repetir em metros (su x sv metros por repetição)
  function scaleUV(geo, w, h, d, su, sv) {
    const uv = geo.attributes.uv;
    const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) {
      const i = f * 4 + k;
      uv.setXY(i, uv.getX(i) * dims[f][0] / su, uv.getY(i) * dims[f][1] / sv);
    }
    uv.needsUpdate = true;
  }

  function box(x1, y1, z1, x2, y2, z2, m, o = {}) {
    const w = x2 - x1, h = y2 - y1, d = z2 - z1;
    const geo = new THREE.BoxGeometry(w, h, d);
    scaleUV(geo, w, h, d, o.su || m.userData.su || 2, o.sv || m.userData.sv || 2);
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
    (o.parent || scene).add(mesh);
    if (o.collide) colliders.push({ x1, x2, z1, z2 });
    if (o.msg) { mesh.userData.msg = o.msg; interactables.push(mesh); }
    return mesh;
  }

  // plano vertical voltado para uma direção: 'z+', 'z-', 'x+', 'x-'
  function panel(cx, cy, cz, w, h, facing, m, o = {}) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    mesh.position.set(cx, cy, cz);
    mesh.rotation.y = { 'z+': 0, 'z-': Math.PI, 'x+': Math.PI / 2, 'x-': -Math.PI / 2 }[facing];
    (o.parent || scene).add(mesh);
    if (o.msg) { mesh.userData.msg = o.msg; interactables.push(mesh); }
    return mesh;
  }

  function sign(text, cx, cy, cz, w, h, facing, opt = {}) {
    const tex = TEX.text(text, opt);
    const m = opt.glow
      ? new THREE.MeshBasicMaterial({ map: tex, transparent: !opt.bg })
      : new THREE.MeshPhongMaterial({ map: tex, transparent: !opt.bg, alphaTest: opt.bg ? 0 : 0.3, emissive: opt.emissive || 0x333333, emissiveMap: tex });
    return panel(cx, cy, cz, w, h, facing, m, opt);
  }

  function build(sc) {
    scene = sc; colliders = []; interactables = [];
    const M = {
      concrete: mat(TEX.concrete, 4, 4),
      facade: mat(TEX.facade, 4, UP_H),
      facadeGround: mat(TEX.facade, 4, FLOOR_H),
      blank: mat(TEX.blank, 6, 6),
      granilite: mat(TEX.granilite, 2, 2),
      vinyl: mat(TEX.vinyl, 2, 2),
      ceiling: mat(TEX.ceiling, 2.5, 2.5),
      wall: mat(TEX.wall, 3, FLOOR_H),
      wallLow: mat(TEX.wall, 3, 3),
      asphalt: mat(TEX.asphalt, 4, 4),
      sidewalk: mat(TEX.sidewalk, 1.5, 1.5),
      grass: mat(TEX.grass, 3, 3),
      leaves: mat(TEX.leaves, 1.5, 1.5),
      bark: mat(TEX.bark, 0.5, 1),
      metal: mat(TEX.metal, 1, 1, { shininess: 40, specular: 0x666666 }),
      dark: new THREE.MeshPhongMaterial({ color: 0x1a1c20 }),
      wood: mat(TEX.wood, 1, 1),
      mattress: mat(TEX.mattress, 2, 0.7),
      seat: mat(TEX.seat, 0.5, 0.5),
      elevator: mat(TEX.elevator, 1.2, 2.2),
      door: mat(TEX.door, 1.0, 2.1),
      board: mat(TEX.board, 1.6, 1.2),
      glass: new THREE.MeshPhongMaterial({ color: 0x1d2a38, transparent: true, opacity: 0.32, shininess: 90, specular: 0x8899aa, depthWrite: false }),
      carGlass: mat(TEX.carGlass, 1, 1),
    };

    // ---------- LUZES GERAIS ----------
    scene.add(new THREE.AmbientLight(0x1a2030, 0.8));
    const moon = new THREE.DirectionalLight(0x8090c0, 0.6);
    moon.position.set(-30, 60, 50); scene.add(moon);

    // ---------- CHÃO EXTERNO ----------
    box(-140, -0.1, -140, 140, 0, 140, M.asphalt);
    box(-70, 0, 0, 70, 0.03, 9, M.sidewalk);
    box(-70, 0, 9, -12, 0.05, 13, M.grass);
    box(12, 0, 9, 70, 0.05, 13, M.grass);
    const lineM = new THREE.MeshPhongMaterial({ color: 0xb8b4a0 });
    for (let x = -40; x <= 40; x += 2.6) {
      if (Math.abs(x) < 4) continue;
      box(x - 0.05, 0, 16, x + 0.05, 0.02, 21, lineM);
      box(x - 0.05, 0, 29, x + 0.05, 0.02, 34, lineM);
    }

    // ---------- PRÉDIO (casca externa) ----------
    for (const [a, b] of [[-70, -14.2], [14.2, 70]]) {                  // alas esquerda e direita
      box(a, 0, -46, b, FLOOR_H, 0, M.facadeGround, { collide: true });
      box(a, FLOOR_H, -46, b, TOP, 0, M.facade);
    }
    // empenas cegas nas pontas (como na foto: concreto liso, logo e letreiro no alto)
    box(-70.3, 0, -46, -70, TOP + 0.6, 0.1, M.blank, { collide: true });
    box(70, 0, -46, 70.3, TOP + 0.6, 0.1, M.blank, { collide: true });
    box(-70.3, TOP, -46, 70.3, TOP + 0.6, 0.1, M.blank);                // platibanda
    for (const [x, f] of [[-70.31, "x-"], [70.31, "x+"]]) {
      panel(x, TOP - 3.2, -9, 5, 5, f, new THREE.MeshPhongMaterial({ map: TEX.logo, transparent: true, alphaTest: 0.4, emissive: 0x202020, emissiveMap: TEX.logo }));
      sign("HUSM", x, TOP - 7.6, -10, 13, 3.6, f, { w: 80, h: 22, size: 22, fg: "#3e3c38", shadow: "#8a877e", emissive: 0x111111 });
    }
    box(30, TOP + 0.6, -20, 30.3, TOP + 9, -19.7, M.metal);               // antena
    box(-14.2, FLOOR_H, -22.2, 14.2, TOP, 0, M.facade);                     // pavimentos sobre o saguão
    box(-14.2, 0, -46, -1.8, TOP, -22.2, M.concrete, { collide: true }); // bloco de trás (esq.)
    box(1.8, 0, -46, 14.2, TOP, -22.2, M.concrete, { collide: true });   // bloco de trás (dir.)
    box(-1.8, 3, -46, 1.8, TOP, -22.2, M.concrete);                      // sobre o corredor
    box(-1.8, 0, -46, 1.8, 3, -44.2, M.concrete, { collide: true });     // fundo do corredor

    // marquise da entrada
    box(-9, 4.3, 0, 9, 4.7, 7, M.concrete);
    box(-8.7, 0, 6.3, -8.3, 4.3, 6.7, M.concrete, { collide: true });
    box(8.3, 0, 6.3, 8.7, 4.3, 6.7, M.concrete, { collide: true });
    sign('HOSPITAL UNIVERSITÁRIO DE SANTA MARIA', 0, 5.6, 0.03, 22, 1.4, 'z+',
      { w: 512, h: 32, size: 22, fg: "#d8d4c4", shadow: "#000", emissive: 0x8a8a8a });
    // totem
    box(13, 0, 15, 17, 1.4, 15.6, M.concrete, { collide: true });
    sign('HUSM', 15, 0.8, 15.62, 3.6, 0.9, 'z+', { w: 128, h: 32, size: 26, fg: '#e8e2cc', shadow: '#000' });

    // ---------- FACHADA DE VIDRO DO SAGUÃO ----------
    box(-14, 0, -0.12, -2, FLOOR_H, -0.04, M.glass, { collide: true });
    box(2, 0, -0.12, 14, FLOOR_H, -0.04, M.glass, { collide: true });
    box(-2, 2.7, -0.12, 2, FLOOR_H, -0.04, M.glass);
    for (let x = -14; x <= 14; x += 2) box(x - 0.05, 0, -0.16, x + 0.05, FLOOR_H, 0, M.dark);
    box(-14, 2.66, -0.16, 14, 2.74, 0, M.dark);
    // portas automáticas travadas meio abertas (sem energia!)
    for (const s of [-1, 1]) {
      const a = s * 1.1, b = s * 3.1;
      box(Math.min(a, b), 0.02, -0.34, Math.max(a, b), 2.62, -0.26, M.glass, { collide: true,
        msg: 'Porta automática. Travada no meio do caminho, como tudo aqui.' });
      box(a - 0.04, 0, -0.36, a + 0.04, 2.64, -0.24, M.dark);
    }

    // ---------- SAGUÃO ----------
    box(-14, -0.02, -22, 14, 0.02, 0, M.granilite);
    box(-14, FLOOR_H - 0.05, -22, 14, FLOOR_H, 0, M.ceiling);
    box(-14.2, 0, -22, -14, FLOOR_H, 0, M.wall, { collide: true });
    box(14, 0, -22, 14.2, FLOOR_H, 0, M.wall, { collide: true });
    box(-14, 0, -22.2, -1.8, FLOOR_H, -22, M.wall, { collide: true });
    box(1.8, 0, -22.2, 14, FLOOR_H, -22, M.wall, { collide: true });
    box(-1.8, 3, -22.2, 1.8, FLOOR_H, -22, M.wall);
    // pilares
    for (const x of [-7, 7]) for (const z of [-8, -15]) box(x - 0.35, 0, z - 0.35, x + 0.35, FLOOR_H, z + 0.35, M.concrete, { collide: true, su: 1 });

    // recepção
    box(-9.5, 0, -7.2, -3, 1.05, -6.4, M.wood, { collide: true, msg: 'Balcão da recepção. O telefone está mudo. A tela do computador reflete o seu rosto.' });
    box(-9.6, 1.05, -7.3, -2.9, 1.12, -6.3, M.granilite);
    box(-7.1, 1.12, -6.95, -6.5, 1.5, -6.85, M.dark, { msg: 'Monitor desligado. Tem um post-it: "SENHA: senha123 — NÃO ESQUECER".' });
    sign('RECEPÇÃO', -6.25, 3.4, -6.6, 3, 0.5, 'z+', { w: 128, h: 24, size: 16, fg: '#1d3a2f', bg: '#d8e0d4', border: true });

    // longarinas (cadeiras de espera)
    for (const z of [-5.5, -7.5, -9.5]) {
      box(2.5, 0.42, z - 0.25, 6.5, 0.48, z + 0.25, M.seat, { collide: true, msg: 'Cadeiras de espera. Todas vazias. Uma ainda está morna... não, é impressão sua.' });
      box(2.5, 0.48, z + 0.22, 6.5, 0.95, z + 0.3, M.seat);
      for (const x of [2.7, 6.3]) box(x - 0.03, 0, z - 0.2, x + 0.03, 0.42, z + 0.2, M.metal);
    }

    // macas vazias
    stretcher(-12.3, -15.5, 0, M);
    stretcher(10.5, -18.5, 0.35, M);
    const endStretcher = stretcher(0, -40, 0, M, true);

    // cadeira de rodas
    wheelchair(9, -14, M);
    // suporte de soro caído
    const iv = box(-11.2, 0.05, -18, -9.4, 0.1, -17.95, M.metal);
    iv.rotation.y = 0.4;

    // elevadores
    for (const x of [-11, -8]) {
      box(x - 0.8, 0, -21.98, x + 0.8, 2.5, -21.9, M.dark);
      panel(x, 1.1, -21.88, 1.2, 2.2, 'z+', M.elevator, { msg: 'Elevador. Um papel colado: "FORA DE SERVIÇO". Escrito à mão por baixo: "desde 2019".' });
    }
    sign('ELEVADORES', -9.5, 2.9, -21.88, 2.4, 0.35, 'z+', { w: 128, h: 20, size: 14, fg: '#ddd', bg: '#223' });

    // escada (trancada)
    panel(13.98, 1.05, -15, 1.0, 2.1, 'x-', M.door, { msg: 'Porta da escada. Trancada. Alguém do outro lado... não. Deve ser o vento.' });
    sign('ESCADA', 13.97, 2.5, -15, 1.2, 0.3, 'x-', { w: 64, h: 16, size: 11, fg: '#fff', bg: '#355' });

    // bebedouro e quadro de avisos
    box(-13.98, 0, -12.2, -13.55, 1.0, -11.8, M.metal, { collide: true, msg: 'Bebedouro. A água sai morna. Pelo menos sai.' });
    box(-13.98, 1.0, -12.2, -13.5, 1.08, -11.8, M.dark);
    panel(-13.97, 1.8, -4, 1.6, 1.2, 'x+', M.board, {
      msg: 'Quadro de avisos: "REUNIÃO DO COLEGIADO ADIADA PARA DATA A DEFINIR (a definir)". Outro: "QUEM PEGOU O CARREGADOR DA COPA, DEVOLVA".' });

    // placas
    sign('AMBULATÓRIOS  ·  BLOCO CIRÚRGICO', 0, 3.7, -21.88, 4.2, 0.45, 'z+', { w: 512, h: 32, size: 20, fg: '#f2f2f2', bg: '#1d4a7a', border: true });
    sign('SAÍDA', 0, 3.2, -0.45, 1.2, 0.35, 'z-', { w: 64, h: 20, size: 14, fg: '#fff', bg: '#0a8a3a', glow: true });
    sign('SAÍDA', 0, 2.7, -22.3, 1.2, 0.35, 'z+', { w: 64, h: 20, size: 14, fg: '#fff', bg: '#0a8a3a', glow: true });

    // ---------- CORREDOR DOS AMBULATÓRIOS ----------
    box(-1.6, -0.02, -44.2, 1.6, 0.02, -22, M.vinyl);
    box(-1.6, 2.95, -44.2, 1.6, 3, -22, M.ceiling);
    box(-1.8, 0, -44.2, -1.6, 3, -22.2, M.wallLow, { collide: true });
    box(1.6, 0, -44.2, 1.8, 3, -22.2, M.wallLow, { collide: true });
    let n = 1;
    for (let z = -26; z > -42; z -= 4.5) {
      for (const s of [-1, 1]) {
        const x = s * 1.59;
        panel(x, 1.05, z, 1.0, 2.1, s < 0 ? 'x+' : 'x-', M.door, { msg: `Consultório ${n}. Trancado. Pela fresta, só escuridão.` });
        sign(`CONSULTÓRIO ${n}`, x - s * 0.001, 2.35, z, 0.9, 0.2, s < 0 ? 'x+' : 'x-', { w: 96, h: 20, size: 11, fg: '#222', bg: '#ddd' });
        n++;
      }
    }
    panel(0, 1.05, -44.18, 1.4, 2.1, 'z+', M.door);
    sign('MANUTENÇÃO — ACESSO RESTRITO', 0, 2.4, -44.17, 2.2, 0.28, 'z+', { w: 256, h: 24, size: 14, fg: '#fff', bg: '#8a1a1a' });

    // ---------- LUZES DE EMERGÊNCIA ----------
    const redA = new THREE.PointLight(0xff2a1a, 0.9, 10, 2); redA.position.set(-9.5, 3.8, -21); scene.add(redA);
    const redB = new THREE.PointLight(0xff2a1a, 1.0, 9, 2); redB.position.set(0, 2.7, -33); scene.add(redB);
    for (const l of [redA, redB]) {
      const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.12), new THREE.MeshBasicMaterial({ color: 0xff3020 }));
      bulb.position.copy(l.position); scene.add(bulb); l.userData.bulb = bulb;
    }

    // ---------- ESTACIONAMENTO / ENTORNO ----------
    const carCols = [0x2b2f36, 0x5a1d1d, 0x6b6b66, 0x1d2b40, 0x3a3a30];
    const rr = U.rng(77);
    for (let x = -38.7; x <= 38; x += 2.6) {
      if (Math.abs(x) < 5) continue;
      if (rr() < 0.45) car(x + 1.3, 18.5, M, carCols[Math.floor(rr() * carCols.length)]);
      if (rr() < 0.3) car(x + 1.3, 31.5, M, carCols[Math.floor(rr() * carCols.length)]);
    }
    for (const x of [-60, -48, -36, -24, 24, 36, 48, 60]) tree(x, 11, M);
    for (const x of [-30, -10, 10, 30]) lamppost(x, 25, M);

    return {
      colliders, interactables,
      spawn: new THREE.Vector3(0, 0, 40),
      profStart: new THREE.Vector3(0.5, 0, -10.5),
      fountain: new THREE.Vector3(-13.0, 0, -12),
      endStretcher, red: [redA, redB],
    };
  }

  // ---------- OBJETOS ----------
  function stretcher(x, z, rot, M, movable = false) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
    const P = { parent: g };
    box(-0.35, 0.78, -1, 0.35, 0.92, 1, M.mattress, P);        // colchão (comprimento em z)
    box(-0.3, 0.92, -0.95, 0.3, 1.0, -0.6, M.mattress, P);      // travesseiro
    box(-0.36, 0.72, -1, 0.36, 0.78, 1, M.metal, P);
    for (const s of [-1, 1]) box(s * 0.38 - 0.02, 0.85, -0.7, s * 0.38 + 0.02, 1.1, 0.7, M.metal, P); // grades
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      box(sx * 0.3 - 0.025, 0.1, sz * 0.9 - 0.025, sx * 0.3 + 0.025, 0.72, sz * 0.9 + 0.025, M.metal, P);
      box(sx * 0.3 - 0.04, 0, sz * 0.9 - 0.06, sx * 0.3 + 0.04, 0.1, sz * 0.9 + 0.06, M.dark, P);
    }
    const msg = U.pick([
      'Maca vazia. O lençol está perfeitamente dobrado. Perfeitamente demais.',
      'Maca vazia. A pulseira de identificação ainda está presa na grade. Em branco.',
      'Maca vazia. As rodas estão destravadas.',
    ]);
    const hit = box(-0.4, 0, -1.05, 0.4, 1.1, 1.05, new THREE.MeshBasicMaterial({ visible: false }), Object.assign({ msg }, P));
    hit.userData.msg = msg;
    // colisor aproximado (caixa alinhada aos eixos)
    const c = Math.abs(Math.cos(rot)), s = Math.abs(Math.sin(rot));
    const hx = 0.4 * c + 1.05 * s, hz = 0.4 * s + 1.05 * c;
    const col = { x1: x - hx, x2: x + hx, z1: z - hz, z2: z + hz };
    colliders.push(col);
    g.userData.col = col; g.userData.h = [hx, hz];
    return g;
  }

  function wheelchair(x, z, M) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = -0.6; scene.add(g);
    const P = { parent: g };
    box(-0.25, 0.45, -0.25, 0.25, 0.5, 0.25, M.seat, P);
    box(-0.25, 0.5, 0.22, 0.25, 0.95, 0.27, M.seat, P);
    for (const s of [-1, 1]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 10), M.dark);
      wheel.rotation.z = Math.PI / 2; wheel.position.set(s * 0.3, 0.3, 0.05); g.add(wheel);
    }
    colliders.push({ x1: x - 0.4, x2: x + 0.4, z1: z - 0.4, z2: z + 0.4 });
    const hit = box(-0.35, 0, -0.35, 0.35, 1, 0.35, new THREE.MeshBasicMaterial({ visible: false }), Object.assign({ msg: 'Cadeira de rodas. Virada para a parede, como se estivesse de castigo.' }, P));
  }

  function car(x, z, M, color) {
    const body = new THREE.MeshPhongMaterial({ color, shininess: 60, specular: 0x333333 });
    box(x - 0.9, 0.25, z - 2.1, x + 0.9, 0.95, z + 2.1, body, { collide: true });
    box(x - 0.8, 0.95, z - 1.1, x + 0.8, 1.45, z + 0.9, M.carGlass);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(x + sx * 0.92 - 0.1, 0, z + sz * 1.3 - 0.3, x + sx * 0.92 + 0.1, 0.5, z + sz * 1.3 + 0.3, M.dark);
  }

  function tree(x, z, M) {
    box(x - 0.2, 0, z - 0.2, x + 0.2, 3, z + 0.2, M.bark, { collide: true });
    box(x - 1.6, 2.6, z - 1.6, x + 1.6, 4.6, z + 1.6, M.leaves);
    box(x - 1, 4.6, z - 1, x + 1, 5.6, z + 1, M.leaves);
  }

  function lamppost(x, z, M) {
    box(x - 0.1, 0, z - 0.1, x + 0.1, 7, z + 0.1, M.metal, { collide: true, msg: 'Poste. Apagado. O campus inteiro parece apagado.' });
    box(x - 0.15, 6.9, z - 0.9, x + 0.15, 7.1, z + 0.1, M.metal);
    box(x - 0.25, 6.8, z - 1.1, x + 0.25, 6.95, z - 0.6, M.dark);
  }

  return { build, FLOOR_H, UP_H, FLOORS };
})();

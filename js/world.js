// Construção do mapa. Escala: 1 unidade = 1 metro.
// Entrada principal do HUSM (Bloco D) refeita a partir das fotos de referência (out/2026):
// fachada, marquise, praça, saguão da recepção, hall da escada helicoidal e corredor dos ambulatórios.
// O que ainda é PROVISÓRIO: a planta (posição exata das salas) — trocar quando houver o mapa do hospital.
// Eixos: x = ao longo da fachada, z = profundidade (fachada principal em z = 0, praça em +z), y = altura.
const WORLD = (() => {
  const FLOOR_H = 5.5;   // térreo até o topo da faixa verde (mural + basculantes + faixa)
  const UP_H = 3.6;      // pavimentos de cima
  const FLOORS = 6;      // térreo + 5 (contado nas fotos: 5 fileiras de janelas acima da faixa verde)
  const TOP = FLOOR_H + UP_H * (FLOORS - 1);
  const MURAL_H = 3.4, CLER_H = 4.3;            // topo do mural / topo das basculantes (começo da faixa verde)
  const LOBBY_H = 4.0, HALL_H = 3.6, CORR_H = 3.0;

  let scene, colliders, interactables, MAT;
  const anim = {};                               // coisas que o update() mexe (porta do banheiro, painel, luz)

  function mat(tex, su = 2, sv = 2, extra = {}) {
    const m = new THREE.MeshPhongMaterial(Object.assign({ map: tex, shininess: 4, specular: 0x111111 }, extra));
    m.userData.su = su; m.userData.sv = sv;
    return m;
  }
  const col = (c, extra = {}) => new THREE.MeshPhongMaterial(Object.assign({ color: c, shininess: 8, specular: 0x222222 }, extra));

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
  const FACING = { 'z+': 0, 'z-': Math.PI, 'x+': Math.PI / 2, 'x-': -Math.PI / 2 };
  function panel(cx, cy, cz, w, h, facing, m, o = {}) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    mesh.position.set(cx, cy, cz);
    mesh.rotation.y = FACING[facing];
    (o.parent || scene).add(mesh);
    if (o.msg) { mesh.userData.msg = o.msg; interactables.push(mesh); }
    return mesh;
  }

  // revestimento de parede com UV contínuo em metros (o mural "anda" junto com a fachada)
  //   z±: a1..a2 = x, c = z      x±: a1..a2 = z, c = x
  function wallPanel(a1, a2, y1, y2, c, facing, m, o = {}) {
    const w = a2 - a1, h = y2 - y1, su = o.su || m.userData.su || 2, sv = o.sv || m.userData.sv || 2;
    const geo = new THREE.PlaneGeometry(w, h), uv = geo.attributes.uv;
    const flip = facing === 'z-' || facing === 'x+';           // nessas faces o "u" anda ao contrário
    for (let i = 0; i < uv.count; i++) {
      const a = flip ? a2 - uv.getX(i) * w : a1 + uv.getX(i) * w;
      uv.setXY(i, a / su, (y1 + uv.getY(i) * h) / sv);
    }
    const mesh = new THREE.Mesh(geo, m);
    const mid = (a1 + a2) / 2;
    if (facing[0] === 'z') mesh.position.set(mid, (y1 + y2) / 2, c); else mesh.position.set(c, (y1 + y2) / 2, mid);
    mesh.rotation.y = FACING[facing];
    scene.add(mesh);
    if (o.msg) { mesh.userData.msg = o.msg; interactables.push(mesh); }
    return mesh;
  }

  // caixa orientada entre dois pontos do chão (balcão curvo, guarda-corpos, portas abertas)
  function seg(x1, z1, x2, z2, y1, y2, th, m, o = {}) {
    const dx = x2 - x1, dz = z2 - z1, L = Math.hypot(dx, dz);
    const geo = new THREE.BoxGeometry(L, y2 - y1, th);
    scaleUV(geo, L, y2 - y1, th, o.su || m.userData.su || 2, o.sv || m.userData.sv || 2);
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set((x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2);
    mesh.rotation.y = -Math.atan2(dz, dx);
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
  const glowMat = tex => new THREE.MeshBasicMaterial({ map: tex });
  const signMat = (tex, em = 0x444444) => new THREE.MeshPhongMaterial({ map: tex, emissive: em, emissiveMap: tex, transparent: true, alphaTest: 0.3 });

  function build(sc) {
    scene = sc; colliders = []; interactables = [];
    const M = {
      concrete: mat(TEX.concrete, 4, 4),
      facade: mat(TEX.facade, 4, UP_H),
      facade1: mat(TEX.facade1, 4, UP_H),
      fascia: mat(TEX.fascia, 4, 2),
      mural: mat(TEX.mural, 24, MURAL_H),
      clerestory: mat(TEX.clerestory, 3, CLER_H - MURAL_H),
      blank: mat(TEX.blank, 6, 6),
      granilite: mat(TEX.granilite, 2, 2),
      vinyl: mat(TEX.vinyl, 2, 2),
      ceiling: mat(TEX.ceiling, 2.5, 2.5),
      wall: mat(TEX.wall, 3, 3),
      wallLow: mat(TEX.wall, 3, 3),
      lobbyWall: mat(TEX.lobbyWall, 3, LOBBY_H),
      pvc: mat(TEX.pvc, 2, 2),
      plaster: mat(TEX.plaster, 3, 3),
      tile: mat(TEX.tile, 1.2, 1.2, { shininess: 30, specular: 0x444444 }),
      tileFloor: mat(TEX.tileFloor, 1.2, 1.2),
      hex: mat(TEX.hex, 2, 2),
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
      window: mat(TEX.window, 1.2, 1.2),
      farBlock: mat(TEX.farBlock, 20, 11),
      glass: new THREE.MeshPhongMaterial({ color: 0x1d2a38, transparent: true, opacity: 0.32, shininess: 90, specular: 0x8899aa, depthWrite: false }),
      carGlass: mat(TEX.carGlass, 1, 1),
      white: col(0xcacac4),
      teal: col(0x1f6e66),
      orange: col(0xc8582e, { shininess: 30 }),
      greenBench: col(0x9db3a0),
      red: col(0xa82820),
      yellow: col(0xd0a830),
      black: col(0x18191b),
      blueTile: col(0x4f7d92),
      step: col(0x4a4a4e),
    };
    MAT = M;

    // ---------- LUZES GERAIS ----------
    scene.add(new THREE.AmbientLight(0x1a2030, 0.8));
    const moon = new THREE.DirectionalLight(0x8090c0, 0.6);
    moon.position.set(-30, 60, 50); scene.add(moon);

    buildOutside(M);
    buildFacade(M);
    buildLobby(M);
    buildHall(M);
    buildCorridor(M);

    // ---------- LUZES DE EMERGÊNCIA ----------
    const redA = new THREE.PointLight(0xff2a1a, 0.9, 10, 2); redA.position.set(12.4, 3.3, -14); scene.add(redA);
    const redB = new THREE.PointLight(0xff2a1a, 1.0, 9, 2); redB.position.set(0, 2.7, -33); scene.add(redB);
    for (const l of [redA, redB]) {
      const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.12), new THREE.MeshBasicMaterial({ color: 0xff3020 }));
      bulb.position.copy(l.position); scene.add(bulb); l.userData.bulb = bulb;
    }

    const pickups = buildPickups(M);

    return {
      colliders, interactables, update, pickups,
      spawn: new THREE.Vector3(0, 0, 44),
      profStart: new THREE.Vector3(0.5, 0, -7.5),
      profIdle: new THREE.Vector3(-10.35, 0, -9.4),      // ao lado do bebedouro, conversando com ele
      endStretcher: anim.endStretcher, red: [redA, redB], M, TOP,
    };
  }

  // =====================================================================
  // EXTERIOR: praça em bloquete sextavado, retorno com barreiras laranja,
  // canteiro com jacarandás, estacionamento e o prédio de faixas azuis ao fundo
  // =====================================================================
  function buildOutside(M) {
    box(-140, -0.1, -140, 140, 0, 140, M.asphalt);
    box(-70, 0, 0, 70, 0.03, 4.5, M.sidewalk);                         // calçada junto ao mural
    box(-40, 0, 4.5, 40, 0.025, 34, M.hex);                             // retorno e praça
    box(-70, 0, 4.5, -40, 0.05, 34, M.grass);
    box(40, 0, 4.5, 70, 0.05, 34, M.grass);
    box(-70, 0, 58, 70, 0.05, 64, M.grass);

    // canteiro central com meio-fio pintado de amarelo
    box(-24, 0, 13, 24, 0.14, 29, M.hex);
    for (const [x1, z1, x2, z2] of [[-24.15, 12.85, 24.15, 13], [-24.15, 29, 24.15, 29.15], [-24.15, 13, -24, 29], [24, 13, 24.15, 29]])
      box(x1, 0, z1, x2, 0.2, z2, M.yellow);

    // barreiras de plástico laranja (cheias d'água) marcando o retorno
    const bmsg = 'Barreira de plástico laranja, cheia d\'água. Alguém escreveu com o dedo na poeira: "NÃO ENTRA".';
    const barrierRow = (x1, x2, z) => {
      for (let x = x1; x < x2 - 0.6; x += 1.25) barrier(x + 0.6, z, 0, M, bmsg);
      colliders.push({ x1, x2, z1: z - 0.28, z2: z + 0.28 });
    };
    barrierRow(-22.2, -3, 12.4); barrierRow(3, 22.2, 12.4);
    barrierRow(-17.5, -10, 5.1); barrierRow(10.5, 18, 5.1);

    // jacarandás: na calçada, colados no mural, e no canteiro
    let v = 0;
    for (const x of [-64, -54, -44, -34, -24, -16, 16, 24, 34, 44, 54, 64]) jacaranda(x, 2.4, v++ % 3, 1);
    jacaranda(-10.6, 5.9, 1, 1.05); jacaranda(10.4, 6.1, 2, 1.1);
    for (const [x, z] of [[-19, 17], [-9, 25], [1, 20.5], [11, 25.5], [19, 16.5]]) jacaranda(x, z, v++ % 3, 1.15);

    // bancos de concreto verde-claro, lixeiras e canteiros com borda de "dentinhos" brancos
    for (const [x, z] of [[-13, 19], [-4, 22.5], [7, 17.5], [15, 22], [-17, 25.5]]) concreteBench(x, z, M);
    for (const [x, z] of [[-7, 15.2], [11.5, 21.2]]) trashBin(x, z, 0xe8e8e2, M);
    gardenBed(-14, 14.2, -9.5, 16, M); gardenBed(4, 25, 9, 26.8, M);
    box(-21.55, 0, 13.95, -21.45, 1.3, 14.05, M.metal);
    sign('NÃO SUJE NOSSO JARDIM', -21.5, 1.15, 14.06, 0.9, 0.3, 'z+', { w: 128, h: 40, size: 11, fg: '#fff', bg: '#2a6a3a', border: true,
      msg: 'Placa: "EDUCAÇÃO — NÃO SUJE NOSSO JARDIM". Alguém riscou "JARDIM" e escreveu "HOSPITAL".' });

    // poste alto de metal no meio do retorno
    lamppost(3.5, 12.9, M, 8.5);

    // ambulância estacionada perto da ala baixa
    ambulance(-27, 7.6, M);

    // estacionamento (onde você chega)
    const lineM = new THREE.MeshPhongMaterial({ color: 0xb8b4a0 });
    for (let x = -40; x <= 40; x += 2.6) {
      if (Math.abs(x) < 4) continue;
      box(x - 0.05, 0, 36, x + 0.05, 0.02, 41, lineM);
      box(x - 0.05, 0, 49, x + 0.05, 0.02, 54, lineM);
    }
    const carCols = [0x2b2f36, 0x5a1d1d, 0x6b6b66, 0x1d2b40, 0x3a3a30, 0x8a9098];
    const rr = U.rng(77);
    for (let x = -38.7; x <= 38; x += 2.6) {
      if (Math.abs(x) < 5) continue;
      if (rr() < 0.45) car(x + 1.3, 38.5, M, carCols[Math.floor(rr() * carCols.length)]);
      if (rr() < 0.3) car(x + 1.3, 51.5, M, carCols[Math.floor(rr() * carCols.length)]);
    }
    for (const x of [-30, -10, 10, 30]) lamppost(x, 45.5, M);

    // o prédio comprido de faixas azuis, do outro lado do gramado
    box(-75, 0, 66, 25, 11, 74, M.farBlock);
  }

  // =====================================================================
  // FACHADA DO BLOCO D: térreo com mural, basculantes e faixa verde;
  // 5 pavimentos de janelas com toldos; marquise branca com o letreiro
  // =====================================================================
  function buildFacade(M) {
    // térreo (volumes fechados dos dois lados do saguão)
    box(-70, 0, -46, -14.2, CLER_H, 0, M.concrete, { collide: true });
    box(14.2, 0, -46, 70, CLER_H, 0, M.concrete, { collide: true });
    // mural contínuo (some só na porta de vidro)
    for (const [a, b] of [[-70, -4], [4, 70]]) wallPanel(a, b, 0, MURAL_H, 0.012, 'z+', M.mural);
    wallPanel(-70, 70, MURAL_H, CLER_H, 0.012, 'z+', M.clerestory);
    // faixa verde de concreto (projeta 1,2 m) — também é o telhado da ala baixa da esquerda
    box(-70, CLER_H, -46, 70, FLOOR_H, 1.2, M.fascia, { su: 4, sv: 1.2 });

    // torre: 1º pavimento com janelões, 2º–5º com persianas projetadas
    box(-34, FLOOR_H, -46, 70, FLOOR_H + UP_H, -0.4, M.facade1);
    box(-34, FLOOR_H + UP_H, -46, 70, TOP, -0.4, M.facade);
    box(-34.3, TOP, -46, 70.3, TOP + 1.3, -0.2, M.fascia, { su: 4, sv: 1.3 });   // platibanda com limo
    // empenas cegas nas pontas da torre, com logo e letreiro
    box(-34.3, FLOOR_H, -46, -34, TOP + 1.3, -0.2, M.blank);
    box(70, 0, -46, 70.3, TOP + 1.3, 0.1, M.blank, { collide: true });
    for (const [x, f] of [[-34.31, 'x-'], [70.31, 'x+']]) {
      panel(x, TOP - 3.2, -9, 5, 5, f, new THREE.MeshPhongMaterial({ map: TEX.logo, transparent: true, alphaTest: 0.4, emissive: 0x202020, emissiveMap: TEX.logo }));
      sign('HUSM', x, TOP - 7.6, -10, 13, 3.6, f, { w: 80, h: 22, size: 22, fg: '#3e3c38', shadow: '#8a877e', emissive: 0x111111 });
    }
    box(30, TOP + 1.3, -20, 30.3, TOP + 9, -19.7, M.metal);                       // antena

    // porta de vidro da entrada (portas automáticas travadas meio abertas — sem energia!)
    box(-4, 0, -0.12, -3.1, MURAL_H, -0.04, M.glass, { collide: true });
    box(3.1, 0, -0.12, 4, MURAL_H, -0.04, M.glass, { collide: true });
    box(-3.1, 2.7, -0.12, 3.1, MURAL_H, -0.04, M.glass);
    for (const x of [-4, -3.1, 3.1, 4]) box(x - 0.05, 0, -0.16, x + 0.05, MURAL_H, 0, M.dark);
    box(-4, 2.66, -0.16, 4, 2.74, 0, M.dark);
    for (const s of [-1, 1]) {
      const a = s * 1.1, b = s * 3.1;
      box(Math.min(a, b), 0.02, -0.34, Math.max(a, b), 2.62, -0.26, M.glass, { collide: true,
        msg: 'Porta automática. Travada no meio do caminho, como tudo aqui.' });
      box(a - 0.04, 0, -0.36, a + 0.04, 2.64, -0.24, M.dark);
    }
    sign('MAPA DO HOSPITAL', -3.55, 2.25, 0.02, 0.8, 0.14, 'z+', { w: 96, h: 16, size: 9, fg: '#fff', bg: '#2a4a6a' });
    panel(-3.55, 1.55, 0.02, 0.8, 1.2, 'z+', col(0xd8dcd0, { emissive: 0x111111 }), {
      msg: 'Mapa do hospital. Uma bolinha vermelha: "VOCÊ ESTÁ AQUI". O resto do mapa foi arrancado. Com força.' });

    // marquise branca com o letreiro HUSM / SUS / EBSERH
    box(-6, 3.5, -0.4, 6, 3.72, 7.5, M.white);
    box(-6.05, 3.0, 7.3, 6.05, 4.35, 7.6, M.white);
    panel(0, 3.675, 7.61, 12, 1.31, 'z+', signMat(TEX.husmSign, 0x5a5a5a), {
      msg: 'HOSPITAL UNIVERSITÁRIO DE SANTA MARIA. SUS. EBSERH. Por baixo do letreiro, um ninho de joão-de-barro. Vazio.' });
    for (const x of [-4.5, 4.5]) box(x - 0.25, 0, 6.75, x + 0.25, 3.5, 7.25, M.white, { collide: true });
    box(-6, 0.03, -0.4, 6, 0.05, 7.5, M.tileFloor);
    panel(4.5, 1.75, 7.26, 0.5, 0.75, 'z+', signMat(TEX.noSmoke, 0x333333), {
      msg: 'PROIBIDO FUMAR NESTE LOCAL — Lei Federal nº 9.294/96. Embaixo, uma bituca ainda acesa. Quem?' });
    trashBin(5.6, 6.3, 0x18191b, M);

    // bancos de espera debaixo da marquise
    for (const z of [1.2, 3.6]) for (const [a, b] of [[-5.6, -2.4], [2.4, 5.6]]) woodBench(a, b, z, M);

    // guarda-corpos brancos
    railing([[-6.6, 0.3], [-6.6, 5.2]], M);
    railing([[6.6, 0.3], [6.6, 7.4], [9.8, 7.4]], M);

    // totem "Bloco D"
    box(-8.85, 0, 3.45, -7.55, 3.2, 3.75, M.white, { collide: true });
    panel(-8.2, 1.6, 3.76, 1.28, 3.2, 'z+', signMat(TEX.totem, 0x3a3a3a), {
      msg: 'BLOCO D — Portaria Central · Agendamentos · Acesso Visitantes · Ambulatórios · Internações · Exames de Imagem... Nenhum diz "SAÍDA".' });
  }

  // =====================================================================
  // SAGUÃO DA RECEPÇÃO: balcão curvo (guichês 21–24), painel de senha,
  // coluna verde-petróleo, filas de cadeiras azuis, catracas
  // =====================================================================
  function buildLobby(M) {
    box(-14, -0.02, -11, 14, 0.02, 0, M.vinyl);
    box(-14, LOBBY_H - 0.05, -11, 14, LOBBY_H, 0, M.plaster);
    box(-14.2, 0, -26, -14, LOBBY_H, 0, M.lobbyWall, { collide: true });
    box(14, 0, -26, 14.2, LOBBY_H, 0, M.lobbyWall, { collide: true });
    box(-14.2, 0, -0.3, -4, LOBBY_H, 0, M.lobbyWall, { collide: true });
    box(4, 0, -0.3, 14.2, LOBBY_H, 0, M.lobbyWall, { collide: true });
    box(-4, MURAL_H, -0.3, 4, LOBBY_H, -0.02, M.lobbyWall);
    sign('SAÍDA', 0, 3.1, -0.45, 1.2, 0.35, 'z-', { w: 64, h: 20, size: 14, fg: '#fff', bg: '#0a8a3a', glow: true });

    // faixas azuis no piso (da porta até as catracas)
    floorFrame(-2.8, -10.6, 2.8, -1.0, 0.22, M.blueTile);
    for (const z of [-2.6, -4.6, -6.6, -8.6]) box(-0.22, 0.02, z - 0.22, 0.22, 0.026, z + 0.22, M.blueTile);

    // ---- balcão curvo dos guichês ----
    const C = { x: -16.5, z: -5.5 }, R = 6.6, A = 45.4 * Math.PI / 180, N = 8;
    const at = (r, t) => [C.x + r * Math.cos(t), C.z + r * Math.sin(t)];
    const counterMat = mat(TEX.lobbyWall, 1.5, 4);
    for (let i = 0; i < N; i++) {
      const ta = -A + 2 * A * i / N, tb = -A + 2 * A * (i + 1) / N;
      const P = (r, y1, y2, th, m, o) => { const [x1, z1] = at(r, ta), [x2, z2] = at(r, tb); return seg(x1, z1, x2, z2, y1, y2, th, m, o); };
      P(R - 0.25, 0, 1.1, 0.5, counterMat, { msg: 'Balcão da recepção. Tem uma campainha de mesa. Você aperta. Ninguém vem. Algo lá dentro aperta de volta.' });
      P(R - 0.22, 1.1, 1.16, 0.62, M.granilite);
      P(R - 0.42, 1.16, 2.5, 0.04, M.glass);
      P(R - 0.3, 2.5, LOBBY_H, 0.3, M.white);
    }
    box(-14, 0, -0.95, -11.87, LOBBY_H, -0.65, M.lobbyWall, { collide: true });
    box(-14, 0, -10.35, -11.87, LOBBY_H, -10.05, M.lobbyWall, { collide: true });
    colliders.push({ x1: -14, x2: -11.6, z1: -10.4, z2: -0.6 }, { x1: -11.6, x2: -10.5, z1: -8.3, z2: -2.7 }, { x1: -10.5, x2: -9.9, z1: -7.0, z2: -4.0 });
    [21, 22, 23, 24].forEach((n, i) => {
      const t = [30, 10, -10, -30][i] * Math.PI / 180, [x, z] = at(R + 0.02, t);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.4), signMat(TEX.guiche(n), 0x555555));
      m.position.set(x, 2.8, z); m.rotation.y = Math.PI / 2 - t; scene.add(m);
    });
    // lá dentro: mesa, monitor no nobreak (luz azul) e a parede amarelada
    panel(-13.99, 1.6, -5.5, 9, 3.2, 'x+', col(0xb8ac70));
    box(-13.8, 0, -7, -12.8, 0.75, -4, M.wood);
    panel(-13.25, 1.0, -5.5, 0.5, 0.32, 'x+', new THREE.MeshBasicMaterial({ color: 0x3858b0 }));
    const mon = new THREE.PointLight(0x4060c0, 0.6, 4, 2); mon.position.set(-12.9, 1.1, -5.5); scene.add(mon);

    // painel de senha pendurado no fim do balcão
    box(-10.5, 2.45, -10.5, -9.5, 3.02, -10.42, M.dark);
    anim.senha = panel(-10.0, 2.735, -10.41, 0.92, 0.5, 'z+', glowMat(TEX.senha), {
      msg: 'Painel de senhas, no nobreak. Chamando "PC0696" no guichê 24 desde as 18h47. Ninguém atende. Ninguém levanta.' });
    box(-10.03, 3.02, -10.48, -9.97, LOBBY_H, -10.44, M.metal);

    // ---- linha das catracas (z = -11) ----
    box(-14, 0, -11.2, -8.6, LOBBY_H, -10.8, M.lobbyWall, { collide: true });
    box(-8.6, 0, -11.4, -7.6, LOBBY_H, -10.6, M.teal, { collide: true });
    panel(-8.1, 1.65, -10.59, 0.72, 0.96, 'z+', mat(TEX.info, 0.72, 0.96), {
      msg: 'INFORMAÇÕES: "Apresentação de documento oficial com foto (RG, CNH, etc.) é obrigatória para acesso ao hospital. Somente um acompanhante por paciente. Troca de acompanhante na portaria." Alguém acrescentou à caneta: "e javali não entra".' });
    trashBin(-9.15, -10.25, 0x18191b, M);
    box(-10.6, 0, -10.8, -10.1, 1.0, -10.4, M.metal, { collide: true, msg: 'Bebedouro. A água sai morna. Pelo menos sai.' });
    box(-10.6, 1.0, -10.8, -10.1, 1.08, -10.38, M.dark);
    box(-7.6, 0, -11.04, -5.0, 3.0, -10.96, M.glass, { collide: true });
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x2a6aff });
    const cmsg = 'Catraca. Sem energia, gira solta. Pela primeira vez na história, ninguém pediu o seu crachá.';
    [-4.85, -3.45, -2.05, -0.65].forEach((c, i) => {
      box(c - 0.15, 0, -11.45, c + 0.15, 1.0, -10.55, M.metal, { collide: true, msg: cmsg });
      box(c - 0.05, 1.0, -11.1, c + 0.05, 1.03, -10.9, ledMat);
      if (i < 3) box(c + 0.15, 0.86, -11.02, c + 0.6, 0.9, -10.98, M.metal);              // braço da catraca
    });
    seg(-0.5, -11.0, -0.1, -11.85, 0.1, 1.0, 0.04, M.glass);                             // portinhola PCD, aberta
    box(0.6, 0, -11.04, 14, 3.0, -10.96, M.glass, { collide: true });
    for (let x = 0.6; x <= 14; x += 2.7) box(x - 0.04, 0, -11.06, x + 0.04, 3.0, -10.94, M.metal);
    box(-8.6, 3.0, -11.2, 14, LOBBY_H, -10.8, M.lobbyWall);
    panel(-2.2, 3.45, -10.78, 0.55, 0.55, 'z+', new THREE.MeshPhongMaterial({ map: TEX.clock, transparent: true, alphaTest: 0.5, emissive: 0x222222, emissiveMap: TEX.clock }), {
      msg: 'Relógio de parede. Parado em 18h47, a hora do apagão. O ponteiro dos segundos treme... mas não anda.' });

    // fila: postes amarelos com corrente
    const posts = [-1.4, -3.2, -5.0, -6.8];
    for (const z of posts) {
      box(-8.34, 0, z - 0.04, -8.26, 0.95, z + 0.04, M.yellow);
      box(-8.45, 0, z - 0.11, -8.15, 0.04, z + 0.11, M.black);
    }
    box(-8.31, 0.82, posts[3], -8.29, 0.85, posts[0], M.black);
    colliders.push({ x1: -8.38, x2: -8.22, z1: -6.85, z2: -1.35 });

    // cadeiras azuis viradas pro balcão
    const smsg = 'Cadeiras de espera. Todas vazias. Uma ainda está morna... não, é impressão sua.';
    for (const x of [6.0, 8.6, 11.2]) { chairRow(-4.6, -1.6, x, 'z', -1, M.seat, smsg); chairRow(-8.4, -5.4, x, 'z', -1, M.seat, smsg); }

    // parede da direita: mural de nuvens e ventilador
    panel(13.98, 2.45, -4.6, 8, 2.6, 'x-', mat(TEX.clouds, 8, 2.6), { msg: 'Um mural de nuvens. Pintado pra acalmar quem espera. Funciona menos no escuro.' });
    wallFan(13.86, 3.2, -9.3, 'x-', M);
  }

  // =====================================================================
  // HALL DA ESCADA: escada helicoidal (verde, vermelho e amarelo no miolo),
  // elevadores, galpãozinho de madeira com o quadro da ponte, janelas
  // =====================================================================
  function buildHall(M) {
    box(-14, -0.02, -26, 14, 0.02, -11, M.vinyl);
    const SX1 = 2.0, SX2 = 7.0, SZ1 = -18, SZ2 = -13;                         // furo da escada no forro
    box(-14, HALL_H - 0.05, -26, SX1, HALL_H, -11, M.pvc);
    box(SX2, HALL_H - 0.05, -26, 14, HALL_H, -11, M.pvc);
    box(SX1, HALL_H - 0.05, SZ2, SX2, HALL_H, -11, M.pvc);
    box(SX1, HALL_H - 0.05, -26, SX2, HALL_H, SZ1, M.pvc);
    box(SX1, HALL_H - 0.06, SZ1, SX2, 9, SZ2, new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide }));
    // eletrocalha e luminárias apagadas
    box(9.5, 3.38, -26, 9.9, 3.46, -11.2, M.metal);
    for (let z = -13; z > -26; z -= 3) box(-6.6, 3.5, z - 0.6, -6.3, 3.55, z + 0.6, M.white);

    // parede do fundo, com a passagem pro corredor
    box(-14, 0, -26.2, -1.8, HALL_H, -26, M.lobbyWall, { collide: true });
    box(1.8, 0, -26.2, 14, HALL_H, -26, M.lobbyWall, { collide: true });
    box(-1.8, CORR_H, -26.2, 1.8, HALL_H, -26, M.lobbyWall);
    sign('AMBULATÓRIOS  ·  BLOCO CIRÚRGICO', 0, 3.3, -25.98, 4.2, 0.45, 'z+', { w: 512, h: 32, size: 20, fg: '#f2f2f2', bg: '#1d4a7a', border: true });
    panel(-8, 1.6, -25.98, 1.6, 1.2, 'z+', M.board, {
      msg: 'Quadro de avisos: "REUNIÃO DO COLEGIADO ADIADA PARA DATA A DEFINIR (a definir)". Outro: "QUEM PEGOU O CARREGADOR DA COPA, DEVOLVA".' });

    // ---- escada helicoidal ----
    const SC = { x: 4.5, z: -15.5 }, RIN = 0.35, ROUT = 2.3, D = Math.PI / 8;
    const helix = new THREE.MeshPhongMaterial({ color: 0x1f7a6c, side: THREE.DoubleSide, shininess: 20 });
    for (let i = 0; i < 26; i++) {
      const a = i * D, y = 0.2 + i * 0.2, rm = (RIN + ROUT) / 2;
      const st = new THREE.Mesh(new THREE.BoxGeometry(ROUT - RIN, 0.2, 0.62), M.step);
      st.position.set(SC.x + Math.cos(a + D / 2) * rm, y - 0.1, SC.z + Math.sin(a + D / 2) * rm);
      st.rotation.y = -(a + D / 2); scene.add(st);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(ROUT, ROUT, 0.55, 3, 1, true, Math.PI / 2 - a - D, D), helix);
      band.position.set(SC.x, y - 0.12, SC.z); scene.add(band);
      const under = new THREE.Mesh(new THREE.CylinderGeometry(ROUT - 0.02, ROUT - 0.02, 0.22, 3, 1, true, Math.PI / 2 - a - D, D), M.white);
      under.position.set(SC.x, y - 0.5, SC.z); scene.add(under);                // borda branca por baixo da faixa
      if (i % 2 === 0) box(SC.x + Math.cos(a) * (ROUT - 0.08) - 0.02, y, SC.z + Math.sin(a) * (ROUT - 0.08) - 0.02,
        SC.x + Math.cos(a) * (ROUT - 0.08) + 0.02, y + 0.95, SC.z + Math.sin(a) * (ROUT - 0.08) + 0.02, M.metal);
    }
    [0xb02a24, 0xd8b030, 0x2a8a3a].forEach((c, k) => {                      // miolo: as cores do Rio Grande
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 9, 6), col(c, { emissive: 0x111111 }));
      t.position.set(SC.x + Math.cos(k * 2.1) * 0.16, 4.5, SC.z + Math.sin(k * 2.1) * 0.16); scene.add(t);
    });
    const hit = new THREE.Mesh(new THREE.CylinderGeometry(ROUT, ROUT, 3.4, 8), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(SC.x, 1.7, SC.z); scene.add(hit);
    hit.userData.msg = 'Escada helicoidal. No miolo, faixas verde, vermelha e amarela — as cores do Rio Grande. Lá em cima, escuridão total. Um degrau rangeu sozinho.';
    interactables.push(hit);
    colliders.push({ x1: SC.x - ROUT + 0.1, x2: SC.x + ROUT - 0.1, z1: SC.z - ROUT + 0.1, z2: SC.z + ROUT - 0.1 });
    for (const x of [3.0, 3.95, 4.9, 5.85]) wheelchair(x, -18.75, M, Math.PI,
      'Cadeiras de rodas enfileiradas embaixo da escada. Contou quatro. Na volta, vai contar cinco.');

    // ---- elevadores (parede da direita) ----
    for (const z of [-12.9, -15.3]) {
      box(13.88, 0, z - 0.85, 14, 2.6, z + 0.85, M.teal);
      panel(13.87, 1.1, z, 1.2, 2.2, 'x-', M.elevator, { msg: 'Elevador. Um papel colado: "FORA DE SERVIÇO". Escrito à mão por baixo: "desde 2019".' });
    }
    sign('ELEVADORES', 13.97, 2.85, -14.1, 2.0, 0.3, 'x-', { w: 128, h: 20, size: 14, fg: '#ddd', bg: '#1f4a46' });
    sign('HUSM  ·  EBSERH', 13.97, 3.3, -14.1, 2.6, 0.32, 'x-', { w: 160, h: 20, size: 14, fg: '#1f6e9a', bg: '#e8eaea' });

    // ---- galpãozinho de madeira (com o quadro da ponte e o banco vermelho) ----
    const gmsg = 'Um galpãozinho de madeira no meio do hospital. O cantinho mais gaúcho do HUSM. Cheiro de erva-mate.';
    for (const [x, z] of [[8.8, -19.8], [13.5, -19.8], [8.8, -24.0], [13.5, -24.0]])
      box(x - 0.14, 0, z - 0.14, x + 0.14, 2.5, z + 0.14, M.concrete, { collide: true, msg: gmsg, su: 0.6 });
    const roof = new THREE.Group(); roof.position.set(11.15, 0, -21.9); scene.add(roof);
    for (const s of [1, -1]) {
      const r = box(-2.55, -0.03, -1.22, 2.55, 0.03, 1.22, M.wood, { parent: roof, msg: gmsg });
      r.position.set(0, 2.9, s * 1.15); r.rotation.x = s * 0.335;
    }
    box(8.5, 2.5, -22.9, 8.6, 3.05, -20.9, M.wood, { msg: gmsg });                 // frontão
    for (const dz of [-0.6, 0, 0.6]) box(8.46, 2.62, -21.9 + dz - 0.05, 8.5, 2.85, -21.9 + dz + 0.05, M.dark); // entalhes
    panel(13.98, 1.65, -21.9, 3.2, 1.6, 'x-', mat(TEX.bridge, 3.2, 1.6, { emissive: 0x111111 }), {
      msg: 'Quadro: uma ponte de ferro sobre o rio. Bonito. Alguém desenhou um vulto no meio da ponte com caneta Bic.' });
    box(12.95, 0.4, -23.5, 13.75, 0.5, -20.3, M.red, { collide: true, msg: 'Banco vermelho. Alguém saiu correndo e deixou o chimarrão. A erva ainda está úmida.' });
    box(13.6, 0.5, -23.5, 13.75, 0.95, -20.3, M.red);
    for (const z of [-19.2, -24.6]) plant(9.2, z, M);

    // ---- parede da esquerda: janelas, ventilador, saída de emergência ----
    for (const z of [-12.6, -15.6, -18.6, -21.6]) wallPanel(z - 1.2, z + 1.2, 1.4, 3.2, -13.98, 'x+', M.window);
    wallFan(-13.86, 3.2, -17.1, 'x+', M);
    panel(-13.98, 1.05, -24.9, 1.0, 2.1, 'x+', M.door, {
      msg: 'Escada de emergência. Trancada. Pelo visor: redes de pesca amarradas nos corrimãos, andar por andar. Pra segurar o quê?' });
    sign('ESCADA', -13.97, 2.45, -24.9, 1.2, 0.3, 'x+', { w: 64, h: 16, size: 11, fg: '#fff', bg: '#355' });
    panel(-13.97, 2.85, -24.9, 0.6, 0.3, 'x+', glowMat(TEX.exitSign));

    // cadeiras azuis do hall
    const smsg = 'Cadeiras azuis. O estofado de uma está rasgado em três riscos paralelos. Garras? Não. Não pode ser.';
    for (const z of [-18.2, -21.2]) { chairRow(-11.4, -8.4, z, 'x', 1, M.seat, smsg); chairRow(-7.6, -4.6, z, 'x', 1, M.seat, smsg); }

    // macas largadas e o suporte de soro caído
    stretcher(-12.0, -23.4, 1.4, M);
    stretcher(10.8, -13.0, 0.2, M);
    const iv = box(-9.6, 0.05, -24.6, -7.8, 0.1, -24.55, M.metal); iv.rotation.y = 0.4;
  }

  // =====================================================================
  // CORREDOR DOS AMBULATÓRIOS: paredes cinza, barra de granilite, forro de PVC,
  // extintor no quadrado vermelho e amarelo, hidrante, sanitários
  // =====================================================================
  function buildCorridor(M) {
    const Z1 = -46, Z2 = -26.2, MZ1 = -31.1, MZ2 = -29.5;           // MZ: boca do sanitário masculino
    box(-1.6, -0.02, Z1, 1.6, 0.02, Z2, M.vinyl);
    box(-1.6, CORR_H - 0.05, Z1, 1.6, CORR_H, Z2, M.pvc);
    box(-1.8, 0, Z1, -1.6, CORR_H, MZ1, M.wallLow, { collide: true });
    box(-1.8, 0, MZ2, -1.6, CORR_H, Z2, M.wallLow, { collide: true });
    box(-1.8, 2.4, MZ1, -1.6, CORR_H, MZ2, M.wallLow);
    box(1.6, 0, Z1, 1.8, CORR_H, Z2, M.wallLow, { collide: true });
    box(-1.8, CORR_H, Z1, 1.8, FLOOR_H, Z2, M.concrete);

    // bloco da direita (fechado) e bloco da esquerda com o sanitário masculino escavado
    box(1.8, 0, Z1, 14.2, FLOOR_H, Z2, M.concrete, { collide: true });
    const RX1 = -12.5, RX2 = -6, RZ1 = -34, RZ2 = -27;               // sala do sanitário
    box(-14.2, 0, Z1, -1.8, FLOOR_H, RZ1, M.concrete, { collide: true });
    box(-14.2, 0, RZ2, -1.8, FLOOR_H, Z2, M.concrete, { collide: true });
    box(-14.2, 0, RZ1, RX1, FLOOR_H, RZ2, M.concrete, { collide: true });
    box(RX2, 0, RZ1, -1.8, FLOOR_H, MZ1, M.concrete, { collide: true });
    box(RX2, 0, MZ2, -1.8, FLOOR_H, RZ2, M.concrete, { collide: true });
    box(RX1, 3.0, RZ1, RX2, FLOOR_H, RZ2, M.concrete);
    box(RX2, 2.6, MZ1, -1.8, FLOOR_H, MZ2, M.concrete);

    // portas dos consultórios
    const doorAt = (n, s, z) => {
      const x = s * 1.59, f = s < 0 ? 'x+' : 'x-';
      panel(x, 1.05, z, 1.0, 2.1, f, M.door, { msg: `Consultório ${n}. Trancado. Pela fresta, só escuridão.` });
      sign(`CONSULTÓRIO ${n}`, x - s * 0.001, 2.35, z, 0.9, 0.2, f, { w: 96, h: 20, size: 11, fg: '#222', bg: '#ddd' });
    };
    doorAt(1, -1, -34.5); doorAt(3, -1, -39); doorAt(5, -1, -43.6);
    doorAt(2, 1, -28.4); doorAt(4, 1, -33.0); doorAt(6, 1, -43.6);

    // sanitário feminino (emperrado)
    panel(1.59, 1.05, -38.6, 1.0, 2.1, 'x-', M.door, {
      msg: 'Sanitário Feminino. A porta emperrou. Lá dentro, uma torneira pinga... no ritmo da 5ª de Beethoven. Tã-tã-tã-TÃÃ.' });
    sign('Sanitário Feminino', 1.585, 2.4, -38.6, 1.2, 0.26, 'x-', { w: 128, h: 24, size: 12, fg: '#eee', bg: '#2a2c30' });

    // cadeiras encostadas na parede
    chairRow(-33.5, -31.7, -1.33, 'z', 1, M.black, 'Cadeiras pretas. Uma está quente. Agora é sério: está quente.');
    // (o trecho z -38,6…-36,4 fica livre dos dois lados: é onde a maca do susto para)
    chairRow(-42.4, -40.0, -1.33, 'z', 1, M.seat, 'Cadeiras azuis. Alguém deixou uma senha de papel: "PC0696".');
    chairRow(-35.9, -34.1, 1.33, 'z', -1, mat(TEX.concrete, 0.6, 0.6, { color: 0xd8d8d8 }), 'Cadeiras cinzas, de vinil rachado. Daqui dá pra ouvir a torneira do banheiro.');

    // piso: quadradinhos azuis no meio; quadrado vermelho e amarelo embaixo do extintor
    for (let z = -27.4; z > -45.5; z -= 2.2) box(-0.25, 0.02, z - 0.25, 0.25, 0.026, z + 0.25, M.blueTile);
    box(-1.6, 0.02, -28.1, -0.7, 0.026, -27.2, M.yellow);
    box(-1.5, 0.026, -28.0, -0.8, 0.03, -27.3, M.red);
    const ext = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.55, 8), col(0xc01818, { shininess: 50 }));
    ext.position.set(-1.47, 1.25, -27.65); scene.add(ext);
    ext.userData.msg = 'Extintor de incêndio. Validade: 2019. Claro.'; interactables.push(ext);
    box(-1.5, 1.52, -27.7, -1.42, 1.62, -27.6, M.black);
    sign('E', -1.59, 2.0, -27.65, 0.28, 0.28, 'x+', { w: 16, h: 16, size: 12, fg: '#fff', bg: '#c01818' });
    box(1.5, 0.9, -31.3, 1.6, 2.1, -30.5, M.red, { msg: 'Hidrante. A mangueira foi enrolada por alguém muito, muito caprichoso. O Dudu?' });
    box(1.5, 1.05, -42.05, 1.6, 1.35, -41.85, M.white, { msg: 'Dispenser de álcool gel. Vazio, claro.' });
    box(-1.6, 1.05, -38.05, -1.5, 1.35, -37.85, M.white, { msg: 'Dispenser de álcool gel. Vazio também.' });

    // eletrocalha, luminárias apagadas, ventiladores e placas que brilham no escuro
    box(1.25, 2.72, Z1, 1.6, 2.8, Z2, M.metal);
    for (let z = Z2 - 2; z > Z1; z -= 2) box(1.5, 2.6, z - 0.03, 1.6, 2.72, z + 0.03, M.metal);
    for (let z = -28; z > -46; z -= 4) box(-0.15, 2.92, z - 0.6, 0.15, 2.95, z + 0.6, M.white);
    wallFan(1.48, 2.55, -36.0, 'x-', M); wallFan(-1.48, 2.55, -41.0, 'x+', M);
    panel(1.59, 2.4, -36.9, 0.6, 0.3, 'x-', glowMat(TEX.exitSign), { msg: 'Placa de saída fotoluminescente. É a única coisa que brilha aqui. E aponta pra trás.' });
    panel(0, 2.62, Z2 - 0.06, 0.6, 0.3, 'z-', glowMat(TEX.exitSign));

    // a maca do fim do corredor (o susto)
    anim.endStretcher = stretcher(0, -40, 0, M, true);

    // ---- sanitário masculino ----
    sign('Sanitário Masculino', -1.585, 2.7, (MZ1 + MZ2) / 2, 1.4, 0.28, 'x+', { w: 128, h: 24, size: 12, fg: '#eee', bg: '#2a2c30' });
    box(RX1, -0.02, RZ1, RX2, 0.025, RZ2, M.tileFloor);
    box(RX2, -0.02, MZ1, -1.6, 0.025, MZ2, M.tileFloor);
    box(RX1, 2.95, RZ1, RX2, 3.0, RZ2, M.plaster);
    box(RX2, 2.55, MZ1, -1.8, 2.6, MZ2, M.plaster);
    wallPanel(RZ1, RZ2, 0, 3, RX1 + 0.01, 'x+', M.tile);
    wallPanel(RX1, RX2, 0, 3, RZ1 + 0.01, 'z+', M.tile);
    wallPanel(RX1, RX2, 0, 3, RZ2 - 0.01, 'z-', M.tile);
    wallPanel(RZ1, MZ1, 0, 3, RX2 - 0.01, 'x-', M.tile);
    wallPanel(MZ2, RZ2, 0, 3, RX2 - 0.01, 'x-', M.tile);
    wallPanel(MZ1, MZ2, 2.4, 3, RX2 - 0.01, 'x-', M.tile);
    wallPanel(RX2, -1.8, 0, 2.6, MZ1 + 0.01, 'z+', M.tile);
    wallPanel(RX2, -1.8, 0, 2.6, MZ2 - 0.01, 'z-', M.tile);
    box(RX2 - 0.02, 2.35, MZ1, RX2 + 0.02, 2.4, MZ2, M.metal);                       // batente

    // a porta do fundo, entreaberta... que abre sozinha
    const hinge = new THREE.Group(); hinge.position.set(RX2, 0, MZ2 - 0.05); hinge.rotation.y = 0.12; scene.add(hinge);
    const dm = box(-0.025, 0, -1.5, 0.025, 2.33, 0, M.white, { parent: hinge, su: 1, sv: 2.3,
      msg: 'Porta do banheiro. Um bilhete: "NÃO JOGUE LIXO NO CHÃO!!!". Três exclamações. Alguém estava bravo.' });
    const note = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.3), new THREE.MeshPhongMaterial({ map: TEX.text('NÃO JOGUE LIXO NO CHÃO!!!', { w: 128, h: 48, size: 9, fg: '#111', bg: '#f2f2ec' }) }));
    note.position.set(0.03, 1.5, -0.75); note.rotation.y = Math.PI / 2; hinge.add(note);
    const doorCol = { x1: RX2 - 0.06, x2: RX2 + 0.06, z1: MZ1, z2: MZ2 }; colliders.push(doorCol);
    anim.wcDoor = { hinge, col: doorCol, t: -1, zone: { x1: -5.4, x2: -2.4, z1: MZ1, z2: MZ2 } };

    // luminária de emergência piscando no corredorzinho de azulejo
    const fl = new THREE.PointLight(0xd8ecff, 0.8, 7, 2); fl.position.set(-4, 2.3, (MZ1 + MZ2) / 2); scene.add(fl);
    const tube = box(-4.6, 2.5, -30.4, -3.4, 2.55, -30.2, new THREE.MeshBasicMaterial({ color: 0xeef6ff }));
    anim.flicker = { light: fl, tube, t: 0 };

    // cabines: a do meio, bem na frente da porta, está trancada
    colliders.push({ x1: RX1, x2: -10.95, z1: -33.8, z2: -28.2 });
    for (const z of [-32.4, -31.0, -29.6, -28.2]) box(RX1, 0.15, z - 0.03, -11.0, 2.1, z + 0.03, M.white);
    for (const [z1, z2] of [[-33.8, -32.4], [-32.4, -31.0], [-31.0, -29.6], [-29.6, -28.2]]) {
      const zc = (z1 + z2) / 2;
      box(RX1 + 0.05, 0, zc - 0.2, RX1 + 0.55, 0.42, zc + 0.2, M.white);              // vaso
      box(RX1 + 0.02, 0.42, zc - 0.22, RX1 + 0.22, 0.85, zc + 0.22, M.white);           // caixa acoplada
      trashBin(RX1 + 0.35, z1 + 0.25, 0x18191b, M, 0.32, 0.45);
    }
    box(-11.03, 0.15, -30.95, -10.97, 2.0, -29.65, M.white, {
      msg: 'Cabine trancada. OCUPADO. Você bate. Silêncio. Embaixo da porta... dois cascos. Pretos. Peludos.' });
    for (const [z, a] of [[-33.75, 1.15], [-32.35, 1.3], [-28.25, 1.0]])                 // portas abertas
      seg(-11.0, z, -11.0 + Math.sin(a) * 1.25, z + Math.cos(a) * 1.25, 0.15, 2.0, 0.04, M.white);
    // pias e espelho
    box(-9.6, 0, RZ2 - 0.55, -6.4, 0.85, RZ2, M.granilite, { collide: true, msg: 'Pia. A torneira faz um barulho de garganta. Não sai nada.' });
    for (const x of [-8.8, -7.2]) box(x - 0.25, 0.85, RZ2 - 0.45, x + 0.25, 0.9, RZ2 - 0.1, M.white);
    panel(-8, 1.75, RZ2 - 0.02, 3, 1.0, 'z-', new THREE.MeshPhongMaterial({ color: 0x3a4448, shininess: 120, specular: 0xaabbcc }), {
      msg: 'Espelho. Você parece cansado. Atrás de você, a porta... não. Nada.' });
    sign('NÃO JOGUE LIXO NO CHÃO!!!', RX2 - 0.02, 1.9, -32.4, 0.9, 0.3, 'x-', { w: 160, h: 40, size: 12, fg: '#111', bg: '#f2f2ec' });
  }

  // =====================================================================
  // ITENS DE CURA (além do café da copa): pegam sozinhos ao passar perto, se você estiver ferido.
  // A ORDEM IMPORTA: o save guarda o índice de cada item pego — só acrescente no fim.
  // =====================================================================
  const KINDS = {
    chimarrao: { heal: 40, cure: false, msgs: ['Chimarrão do galpãozinho. Amargo, quente, gaúcho. Ninguém vai sentir falta. Vão sim. (+40)'],
      full: 'Uma cuia de chimarrão no banco vermelho. Guarda pra quando precisar. Ninguém toma chimarrão sem precisar.' },
    bolacha: { heal: 15, cure: false, msgs: ['Pacote de bolacha Maria. Ou Maizena. Ninguém sabe a diferença. (+15)', 'Bolacha Maria pela metade. A outra metade, só Deus sabe. (+15)'],
      full: 'Um pacote de bolacha Maria. Você não está com fome... ainda.' },
    dipirona: { heal: 20, cure: false, msgs: ['Dipirona 1 g, dose única. "Se dor ou se javali." (+20)'],
      full: 'Uma cartela de dipirona. Sem dor, sem dipirona. Protocolo.' },
    soro: { heal: 25, cure: true, msgs: ['Soro fisiológico 0,9%, direto do bolso. Hidratou e lavou a infecção. (+25, cura a infecção)'],
      full: 'Um frasco de soro fisiológico. Melhor guardar pra quando a CCIH te pegar.' },
  };
  function buildPickups(M) {
    const list = [];
    const add = (kind, x, z, make, onStool = true) => {
      const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
      if (onStool) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.72, 0.35), M.metal); st.position.y = 0.36; g.add(st); }
      const item = new THREE.Group(); item.position.y = onStool ? 0.8 : 0.5; g.add(item); make(item);
      list.push(Object.assign({ x, z, group: g, cup: item, taken: false, kind }, KINDS[kind]));
    };
    const m = (geo, c, extra = {}) => new THREE.Mesh(geo, new THREE.MeshPhongMaterial(Object.assign({ color: c, emissive: 0x222222 }, extra)));
    const cuia = it => {
      const c = m(new THREE.CylinderGeometry(0.075, 0.05, 0.12, 8), 0x5a4426); c.position.y = 0.06; it.add(c);
      const e = m(new THREE.CylinderGeometry(0.068, 0.068, 0.01, 8), 0x5f8a2a); e.position.y = 0.12; it.add(e);
      const b = m(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 4), 0xc8c8c8, { shininess: 60 }); b.position.set(0.02, 0.17, 0); b.rotation.z = -0.3; it.add(b);
    };
    const pack = it => {
      const a = m(new THREE.BoxGeometry(0.22, 0.06, 0.12), 0xd8b040); a.position.y = 0.03; it.add(a);
      const b = m(new THREE.BoxGeometry(0.06, 0.062, 0.122), 0xb02a20); b.position.y = 0.03; it.add(b);
    };
    const pills = it => {
      const a = m(new THREE.BoxGeometry(0.14, 0.05, 0.08), 0xeeeeea); a.position.y = 0.025; it.add(a);
      const b = m(new THREE.BoxGeometry(0.142, 0.052, 0.025), 0x2a5aa8); b.position.y = 0.025; it.add(b);
    };
    const bag = it => {
      const a = m(new THREE.BoxGeometry(0.14, 0.22, 0.045), 0x9ad0f0, { transparent: true, opacity: 0.8, emissive: 0x204060 }); a.position.y = 0.11; it.add(a);
      const b = m(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 6), 0x2a8a3a); b.position.y = 0.245; it.add(b);
    };
    add('chimarrao', 13.25, -21.9, cuia, false);   // banco vermelho do galpãozinho
    add('bolacha', 24.5, -57, pack);               // Prescrição (Cap. 1)
    add('dipirona', -14, -82, pills);              // Ala C
    add('bolacha', -18, -118, pack);               // Vascular (Cap. 2)
    add('soro', -20, -150, bag);                   // arena da CCIH
    add('soro', 20, -138, bag);
    return list;
  }

  // anima o que é do mapa: porta do banheiro, luminária de emergência, painel de senha
  function update(dt, pos, playing) {
    const d = anim.wcDoor;
    if (d && playing && d.t < 0 && pos.x > d.zone.x1 && pos.x < d.zone.x2 && pos.z > d.zone.z1 && pos.z < d.zone.z2) {
      d.t = 0; AUDIO.sfx('creak');
      const i = colliders.indexOf(d.col); if (i >= 0) colliders.splice(i, 1);
    }
    if (d && d.t >= 0 && d.t < 1) {
      d.t = Math.min(1, d.t + dt / 3.2);
      d.hinge.rotation.y = 0.12 + 1.5 * (1 - Math.pow(1 - d.t, 3));
    }
    const f = anim.flicker;
    if (f) {
      f.t -= dt;
      if (f.t <= 0) {
        const on = Math.random() < 0.7;
        f.light.intensity = on ? 0.6 + Math.random() * 0.4 : 0; f.tube.visible = on;
        f.t = on ? 0.05 + Math.random() * 0.9 : 0.03 + Math.random() * 0.25;
      }
    }
    if (anim.senha) anim.senha.visible = Math.random() > 0.01;
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
    const cl = { x1: x - hx, x2: x + hx, z1: z - hz, z2: z + hz };
    colliders.push(cl);
    g.userData.col = cl; g.userData.h = [hx, hz];
    return g;
  }

  function wheelchair(x, z, M, rot = -0.6, msg = 'Cadeira de rodas. Virada para a parede, como se estivesse de castigo.') {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
    const P = { parent: g };
    box(-0.25, 0.45, -0.25, 0.25, 0.5, 0.25, M.seat, P);
    box(-0.25, 0.5, 0.22, 0.25, 0.95, 0.27, M.seat, P);
    for (const s of [-1, 1]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 10), M.dark);
      wheel.rotation.z = Math.PI / 2; wheel.position.set(s * 0.3, 0.3, 0.05); g.add(wheel);
    }
    colliders.push({ x1: x - 0.4, x2: x + 0.4, z1: z - 0.4, z2: z + 0.4 });
    box(-0.35, 0, -0.35, 0.35, 1, 0.35, new THREE.MeshBasicMaterial({ visible: false }), Object.assign({ msg }, P));
  }

  // fileira de cadeiras de espera (longarina): ao longo de 'x' ou 'z', de a1 a a2, na linha c; face = +1/-1 (pra onde olham)
  function chairRow(a1, a2, c, axis, face, seatM, msg) {
    const n = Math.max(1, Math.round((a2 - a1) / 0.6)), D = 0.24;
    const B = (p1, p2, y1, y2, q1, q2, m, o) => axis === 'x' ? box(p1, y1, q1, p2, y2, q2, m, o) : box(q1, y1, p1, q2, y2, p2, m, o);
    B(a1, a2, 0.42, 0.5, c - D, c + D, seatM, { msg });
    B(a1, a2, 0.55, 0.95, c - face * D - 0.04, c - face * D + 0.04, seatM);
    for (let i = 0; i <= n; i++) { const p = a1 + (a2 - a1) * i / n; B(p - 0.02, p + 0.02, 0.5, 0.68, c - D, c + D * 0.6, MAT.black); }
    for (const p of [a1 + 0.3, a2 - 0.3]) B(p - 0.03, p + 0.03, 0, 0.42, c - D, c + D, MAT.black);
    B(a1, a2, 0.05, 0.09, c - 0.03, c + 0.03, MAT.black);
    if (axis === 'x') colliders.push({ x1: a1, x2: a2, z1: c - D - 0.05, z2: c + D + 0.05 });
    else colliders.push({ x1: c - D - 0.05, x2: c + D + 0.05, z1: a1, z2: a2 });
  }

  function woodBench(x1, x2, z, M) {
    const m = mat(TEX.wood, 1, 1, { color: 0x8a7a6a });
    box(x1, 0.42, z - 0.22, x2, 0.47, z + 0.22, m, { collide: true, msg: 'Banco de espera. Num canto, uma pulseira de identificação cortada. Sem nome.' });
    box(x1, 0.5, z - 0.26, x2, 0.9, z - 0.22, m);
    for (const x of [x1 + 0.2, x2 - 0.2]) box(x - 0.03, 0, z - 0.22, x + 0.03, 0.9, z + 0.2, M.black);
  }

  function concreteBench(x, z, M) {
    box(x - 0.9, 0.35, z - 0.25, x + 0.9, 0.45, z + 0.25, M.greenBench, { collide: true, msg: 'Banco de concreto. Gelado. Alguém deixou uma garrafa térmica com água quente pela metade.' });
    for (const s of [-1, 1]) box(x + s * 0.6 - 0.12, 0, z - 0.18, x + s * 0.6 + 0.12, 0.35, z + 0.18, M.greenBench);
  }

  function trashBin(x, z, color, M, w = 0.5, h = 0.9) {
    const m = col(color);
    box(x - w / 2, 0, z - w / 2, x + w / 2, h, z + w / 2, m, { collide: true });
    box(x - w / 2 - 0.02, h, z - w / 2 - 0.02, x + w / 2 + 0.02, h + 0.05, z + w / 2 + 0.02, m);
  }

  function gardenBed(x1, z1, x2, z2, M) {
    box(x1, 0, z1, x2, 0.32, z2, M.leaves, { collide: true });
    const wm = MAT.white;
    for (let x = x1; x < x2; x += 0.3) for (const z of [z1, z2]) box(x, 0, z - 0.06, x + 0.18, 0.22, z + 0.06, wm);
    for (let z = z1; z < z2; z += 0.3) for (const x of [x1, x2]) box(x - 0.06, 0, z, x + 0.06, 0.22, z + 0.18, wm);
  }

  function plant(x, z, M) {
    box(x - 0.22, 0, z - 0.22, x + 0.22, 0.4, z + 0.22, MAT.white, { collide: true });
    box(x - 0.35, 0.4, z - 0.35, x + 0.35, 1.0, z + 0.35, M.leaves);
  }

  function wallFan(x, y, z, facing, M) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = FACING[facing]; scene.add(g);
    box(-0.05, -0.05, -0.12, 0.05, 0.05, 0, M.black, { parent: g });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.015, 4, 12), M.black); ring.position.z = 0.16; g.add(ring);
    for (let i = 0; i < 3; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.01), M.black);
      b.position.z = 0.15; b.rotation.z = i * 2.09; b.position.x = Math.sin(i * 2.09) * 0.1; b.position.y = Math.cos(i * 2.09) * 0.1; g.add(b);
    }
  }

  function railing(pts, M) {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, z1] = pts[i], [x2, z2] = pts[i + 1];
      seg(x1, z1, x2, z2, 1.0, 1.05, 0.05, MAT.white);
      seg(x1, z1, x2, z2, 0.55, 0.58, 0.03, MAT.white);
      seg(x1, z1, x2, z2, 0.12, 0.15, 0.03, MAT.white);
      const L = Math.hypot(x2 - x1, z2 - z1), n = Math.ceil(L / 1.2);
      for (let k = 0; k <= n; k++) {
        const x = x1 + (x2 - x1) * k / n, z = z1 + (z2 - z1) * k / n;
        box(x - 0.025, 0, z - 0.025, x + 0.025, 1.0, z + 0.025, MAT.white);
      }
      colliders.push({ x1: Math.min(x1, x2) - 0.06, x2: Math.max(x1, x2) + 0.06, z1: Math.min(z1, z2) - 0.06, z2: Math.max(z1, z2) + 0.06 });
    }
  }

  function floorFrame(x1, z1, x2, z2, w, m) {
    box(x1, 0.02, z1, x2, 0.026, z1 + w, m); box(x1, 0.02, z2 - w, x2, 0.026, z2, m);
    box(x1, 0.02, z1, x1 + w, 0.026, z2, m); box(x2 - w, 0.02, z1, x2, 0.026, z2, m);
  }

  function barrier(x, z, rot, M, msg) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
    box(-0.6, 0, -0.27, 0.6, 0.3, 0.27, M.orange, { parent: g, msg });
    box(-0.58, 0.3, -0.17, 0.58, 0.76, 0.17, M.orange, { parent: g, msg });
    box(-0.5, 0.76, -0.1, 0.5, 0.82, 0.1, M.orange, { parent: g });
  }

  // jacarandá: 3 planos cruzados com o sprite pixelado (estilo Doom); o tronco é o colisor
  function jacaranda(x, z, v, s) {
    const m = new THREE.MeshLambertMaterial({ map: TEX.tree[v], alphaTest: 0.5, side: THREE.DoubleSide });
    const W = 9 * s, H = 12 * s;
    for (let k = 0; k < 3; k++) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(W, H), m);
      p.position.set(x, H / 2, z); p.rotation.y = k * Math.PI / 3 + v * 0.4;
      p.raycast = () => {};                            // as folhas não bloqueiam o [E]
      scene.add(p);
    }
    colliders.push({ x1: x - 0.25, x2: x + 0.25, z1: z - 0.25, z2: z + 0.25 });
  }

  function ambulance(x, z, M) {
    const L = 6, W = 2.2, x1 = x - L / 2, x2 = x + L / 2;
    const msg = 'Ambulância. A porta de trás está entreaberta. Dentro: uma maca vazia, um cobertor dobrado e uma garrafa térmica ainda morna. Ninguém.';
    box(x1, 0.35, z - W / 2, x2 - 1.1, 2.7, z + W / 2, MAT.white, { collide: true, msg });
    box(x2 - 1.1, 0.35, z - W / 2, x2, 1.9, z + W / 2, MAT.white, { collide: true, msg });
    box(x2 - 1.0, 1.15, z - W / 2 + 0.05, x2 + 0.01, 1.8, z + W / 2 - 0.05, M.carGlass);
    box(x1, 1.2, z - W / 2 - 0.01, x2, 1.42, z + W / 2 + 0.01, MAT.red);
    sign('AMBULÂNCIA', x - 0.8, 1.9, z + W / 2 + 0.02, 3.0, 0.45, 'z+', { w: 128, h: 20, size: 15, fg: '#c02020', emissive: 0x220000 });
    box(x2 - 1.6, 2.7, z - 0.7, x2 - 1.15, 2.85, z + 0.7, new THREE.MeshBasicMaterial({ color: 0x601010 }));
    for (const sx of [x1 + 1, x2 - 1]) for (const sz of [-1, 1]) {
      const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.25, 10), M.dark);
      wh.rotation.x = Math.PI / 2; wh.position.set(sx, 0.38, z + sz * (W / 2 - 0.1)); scene.add(wh);
    }
  }

  function car(x, z, M, color) {
    const body = new THREE.MeshPhongMaterial({ color, shininess: 60, specular: 0x333333 });
    box(x - 0.9, 0.25, z - 2.1, x + 0.9, 0.95, z + 2.1, body, { collide: true });
    box(x - 0.8, 0.95, z - 1.1, x + 0.8, 1.45, z + 0.9, M.carGlass);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(x + sx * 0.92 - 0.1, 0, z + sz * 1.3 - 0.3, x + sx * 0.92 + 0.1, 0.5, z + sz * 1.3 + 0.3, M.dark);
  }

  function lamppost(x, z, M, h = 7) {
    box(x - 0.1, 0, z - 0.1, x + 0.1, h, z + 0.1, M.metal, { collide: true, msg: 'Poste. Apagado. O campus inteiro parece apagado.' });
    box(x - 0.15, h - 0.1, z - 0.9, x + 0.15, h + 0.1, z + 0.1, M.metal);
    box(x - 0.25, h - 0.2, z - 1.1, x + 0.25, h - 0.05, z - 0.6, M.dark);
  }

  return { build, box, panel, sign, mat, stretcher: (x, z, rot) => stretcher(x, z, rot, MAT), FLOOR_H, UP_H, FLOORS, get colliders() { return colliders; }, get interactables() { return interactables; } };
})();

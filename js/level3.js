// CAPÍTULO 3 — o Pronto-Socorro, no subsolo (desce pela escada caracol do hall).
// LAYOUT PROVISÓRIO em ASCII: 1 caractere = 1 m — trocar quando chegarem as fotos do PS.
//   A escada (chegada) · B Acolhimento/Classificação de risco · C Sala Verde (espera)
//   corredor com as faixas coloridas da classificação de risco
//   D Sala Vermelha · E Sala Amarela · F Chefia do PS (Professor Falastrão)
// Coluna 0 = x -22, linha 0 = z -320 (fica longe do resto do mapa: só se chega pela escada).
const LEVEL3 = (() => {
  const MAP = [
    '############################################',
    '#.........#..........#.....................#',
    '#.........#..........#.....................#',
    '#.........#..........#.....................#',
    '#.........#..........#.....................#',
    '#.........#..........#.....................#',
    '#.........#..........#.....................#',
    '#.........#..........#.....................#',
    '####...#######...#############....##########',
    '#..........................................#',
    '#..........................................#',
    '#..........................................#',
    '#..........................................#',
    '######...###########...############...######',
    '#.............#..............#.............#',
    '#.............#..............#.............#',
    '#.............#..............#.............#',
    '#.............#..............#.............#',
    '#.............#..............#.............#',
    '#.............#..............#.............#',
    '#.............#..............#.............#',
    '#.............#..............#.............#',
    '#.............#..............#.............#',
    '#.............#..............#.............#',
    '#.............#..............#.............#',
    '############################################',
  ];
  const X0 = -22, Z0 = -320, WALL_H = 3;

  function build(scene, hooks) {
    const M = hooks.M, box = WORLD.box, panel = WORLD.panel, sign = WORLD.sign;
    const colliders = WORLD.colliders;
    const out = { lights: [] };

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
    box(X0, -0.02, Z0 - zh, X0 + xw, 0.02, Z0, M.vinyl);
    box(X0, WALL_H - 0.05, Z0 - zh, X0 + xw, WALL_H, Z0, M.pvc);
    const col = c => new THREE.MeshPhongMaterial({ color: c, emissive: 0x111111 });
    const glow = c => new THREE.MeshBasicMaterial({ color: c });

    // ---------- A: pé da escada caracol (pra voltar ao hall) ----------
    const SX = -16.5, SZ = -324;
    [0xb02a24, 0xd8b030, 0x2a8a3a].forEach((c, k) => {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, WALL_H, 6), col(c));
      t.position.set(SX + Math.cos(k * 2.1) * 0.16, WALL_H / 2, SZ + Math.sin(k * 2.1) * 0.16); scene.add(t);
    });
    const helix = new THREE.MeshPhongMaterial({ color: 0x1f7a6c, side: THREE.DoubleSide });
    for (let i = 0; i < 13; i++) {
      const a = i * Math.PI / 8, y = 0.2 + i * 0.2;
      const st = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.2, 0.62), M.dark);
      st.position.set(SX + Math.cos(a) * 1.3, y - 0.1, SZ + Math.sin(a) * 1.3); st.rotation.y = -a; st.raycast = () => {}; scene.add(st);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.55, 3, 1, true, Math.PI / 2 - a - Math.PI / 8, Math.PI / 8), helix);
      band.position.set(SX, y - 0.12, SZ); band.raycast = () => {}; scene.add(band);
    }
    colliders.push({ x1: SX - 2.2, x2: SX + 2.2, z1: SZ - 2.2, z2: SZ + 2.2 });
    const hit = new THREE.Mesh(new THREE.CylinderGeometry(2.45, 2.45, 2.8, 8), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.set(SX, 1.4, SZ); scene.add(hit);
    hit.userData.verb = 'subir pro hall'; hit.userData.onUse = () => hooks.onUp();
    WORLD.interactables.push(hit);
    sign('PS · SUBSOLO', -16.5, 2.45, -320.98, 2.2, 0.35, 'z+', { w: 128, h: 20, size: 13, fg: '#fff', bg: '#7a1a1a' });
    out.arrive = new THREE.Vector3(-16.5, 0, -327.0); out.arriveYaw = 0;

    // ---------- placas das salas ----------
    sign('ACOLHIMENTO · CLASSIFICAÇÃO DE RISCO', -6.5, 2.6, -328.02, 3.4, 0.32, 'z-', { w: 384, h: 24, size: 14, fg: '#fff', bg: '#2a7a3a' });
    sign('SALA VERDE · ESPERA', 10, 2.6, -328.02, 2.6, 0.32, 'z-', { w: 256, h: 24, size: 15, fg: '#fff', bg: '#2a8a4a' });
    sign('SALA VERMELHA', -14.5, 2.6, -332.98, 2.4, 0.32, 'z+', { w: 192, h: 24, size: 15, fg: '#fff', bg: '#b01818', border: true });
    sign('SALA AMARELA', -0.5, 2.6, -332.98, 2.4, 0.32, 'z+', { w: 192, h: 24, size: 15, fg: '#222', bg: '#e0c030', border: true });
    sign('CHEFIA DO PS', 14.5, 2.6, -332.98, 2.2, 0.32, 'z+', { w: 160, h: 24, size: 15, fg: '#fff', bg: '#3a3c40', border: true });

    // ---------- corredor: faixas no chão (classificação de risco de Manchester) ----------
    [0xc01818, 0xe07020, 0xe0c030, 0x2a9a3a, 0x2a5ab0].forEach((c, k) => {
      box(-21, 0.02, -330.4 - k * 0.45, 21, 0.026, -330.25 - k * 0.45, col(c));
    });
    for (let x = -18; x <= 18; x += 9) {
      const l = new THREE.PointLight(0xff2a1a, 0.9, 10, 2); l.position.set(x, 2.7, -331); scene.add(l);
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.12), glow(0xff3020)); b.position.copy(l.position); scene.add(b);
      l.userData.bulb = b; out.lights.push(l);
    }
    panel(-21 + 0.01, 1.6, -331, 1.4, 1.0, 'x+', M.board, {
      msg: 'Mural do PS: "ESCALA DE PLANTÃO — OUTUBRO". Seu nome aparece em todos os dias. Até nos que ainda não existem.' });

    // ---------- B: acolhimento / classificação de risco ----------
    box(-9, 0, -324.5, -4, 0.85, -323.7, M.wood, { collide: true, msg: 'Mesa da classificação de risco. Um carimbo "AZUL — NÃO URGENTE" gasto de tanto uso.' });
    box(-6.8, 0.85, -324.2, -6.2, 1.25, -324.1, M.dark);
    const mt = document.createElement('canvas'); mt.width = 40; mt.height = 56;
    const mg = mt.getContext('2d'); mg.fillStyle = '#eee'; mg.fillRect(0, 0, 40, 56);
    ['#c01818', '#e07020', '#e0c030', '#2a9a3a', '#2a5ab0'].forEach((c, k) => { mg.fillStyle = c; mg.fillRect(3, 4 + k * 10, 34, 8); });
    const mtex = new THREE.CanvasTexture(mt); mtex.magFilter = THREE.NearestFilter;
    panel(-6.5, 1.7, -320.99, 1.0, 1.4, 'z-', new THREE.MeshPhongMaterial({ map: mtex, emissive: 0x222222, emissiveMap: mtex }), {
      msg: 'Classificação de risco: vermelho, laranja, amarelo, verde, azul. Alguém acrescentou uma sexta cor à caneta: "JAVALI — PASSA NA FRENTE".' });

    // ---------- C: sala verde (espera) ----------
    for (const z of [-323, -325.5]) for (const [a, b] of [[2, 8], [11, 17]]) {
      box(a, 0.42, z - 0.24, b, 0.5, z + 0.24, M.seat, { collide: true, msg: 'Cadeiras da espera do PS. Ninguém esperando. Pela primeira vez na história.' });
      box(a, 0.55, z + 0.2, b, 0.95, z + 0.28, M.seat);
    }
    const tv = panel(10.5, 2.1, -320.99, 1.3, 0.75, 'z-', glow(0x9aa4b0), { msg: 'A TV da espera, no nobreak. Chiado. Às vezes, no chiado, dá pra ver o Schwarzenegger dando entrevista.' });
    const tvl = new THREE.PointLight(0xb8c8ff, 0.7, 7, 2); tvl.position.set(10.5, 2, -322); scene.add(tvl);
    sign('AGUARDE SER CHAMADO', 18, 2.2, -320.99, 2.2, 0.35, 'z-', { w: 192, h: 24, size: 14, fg: '#ff4060', bg: '#0c1a3a', glow: true });

    // ---------- D: sala vermelha ----------
    for (const x of [-18, -14, -10]) {
      hooks.stretcher(x, -341, 0);
      box(x - 0.3, 1.3, -343.4, x + 0.3, 1.7, -343.3, M.dark);
      panel(x, 1.5, -343.29, 0.5, 0.3, 'z+', glow(0x2a8a3a), { msg: 'Monitor multiparamétrico. Linha reta. Mas é porque não tem ninguém ligado nele. Né?' });
    }
    box(-20.8, 0, -337, -20.1, 1.0, -335.6, col(0xb01818), { collide: true, msg: 'Carrinho de parada. Lacrado. O lacre diz "conferido por: Liberato". Claro.' });
    for (const z of [-344, -343.4]) { const o2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.4, 8), col(0x2a7a3a)); o2.position.set(-20.6, 0.7, z); scene.add(o2); }

    // ---------- E: sala amarela ----------
    for (const x of [-5, -1, 3]) {
      box(x - 0.45, 0, -339.5, x + 0.45, 0.5, -338.6, col(0x6a8aa8), { collide: true, msg: 'Poltrona da observação. Ainda afundada no formato de alguém. Alguém grande.' });
      box(x - 0.45, 0.5, -339.6, x + 0.45, 1.1, -339.4, col(0x6a8aa8));
    }
    hooks.stretcher(-3, -343.5, Math.PI / 2);
    hooks.stretcher(3, -343.5, Math.PI / 2);

    // ---------- F: chefia do PS (Falastrão) ----------
    box(12, 0, -343.2, 17, 0.8, -342.2, M.wood, { collide: true, msg: 'A mesa do chefe do PS. Um megafone, três celulares e uma pilha de entrevistas impressas. Todas dele.' });
    box(9, 0, -344.9, 20.5, 1.8, -344.5, M.wood, { collide: true });
    for (let x = 9.4; x < 20.4; x += 0.7) box(x, 1.8, -344.85, x + 0.3, 2.2 + (x * 7 % 3) * 0.1, -344.6, col(0xd8b030));
    panel(14.5, 2.5, -344.49, 4, 0.35, 'z+', M.board, { msg: 'Troféus "MELHOR PLANTONISTA" de 2003 a 2026. Todos assinados por ele mesmo. O de 2027 já está pronto.' });
    panel(20.99, 1.6, -339, 1.6, 1.1, 'x-', M.board, { msg: 'Recortes de jornal emoldurados. Em todos ele aparece. Em um deles, só o cotovelo. Emoldurado igual.' });
    // a sala conta a vida dele (dá pra fuçar antes de chegar perto da mesa)
    const ink = { fg: '#1a1a1a', bg: '#efe8d4', border: true };
    const rod = (x, z, len, tilt, m, msg) => {
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, len, 5), m);
      r.position.set(x, len / 2 * Math.cos(tilt), z); r.rotation.z = tilt; scene.add(r);
      if (msg) { r.userData.msg = msg; WORLD.interactables.push(r); }
      return r;
    };
    // parede oeste: o slide eterno, diplomas, mergulho, vassoura
    box(8, 2.4, -338.8, 8.1, 2.5, -336.2, M.dark);
    sign('SUPORTE BÁSICO · 1/214', 8.03, 1.75, -337.5, 2.4, 1.3, 'x+', { w: 224, h: 120, size: 14, fg: '#1a2a5a', bg: '#f4f4f0', border: true,
      msg: 'Projetor travado no slide 1 de 214: "SUPORTE BÁSICO — POR QUE SÓ EU POSSO ENSINAR". Ninguém nunca viu o slide 2. Nem ele.' });
    sign('USP · RIBEIRÃO PRETO', 8.03, 1.9, -340.6, 1.3, 0.8, 'x+', { w: 128, h: 80, size: 11, ...ink,
      msg: 'Diplomas: mestrado e doutorado em Ribeirão Preto. Professor, doutor, endoscopista, CIRURGIÃO (assim, em caixa alta), plantonista e pesquisador. Há 42 anos.' });
    box(8, 1.25, -343.1, 8.12, 1.55, -342.5, col(0x1a1a1e), { msg: 'Máscara de mergulho e nadadeiras. Plaquinha: "15 km de natação por dia. Antes do plantão. É aquecimento."' });
    box(8, 0.3, -343.0, 8.08, 1.1, -342.85, col(0xd8c020)); box(8, 0.3, -342.75, 8.08, 1.1, -342.6, col(0xd8c020));
    rod(8.35, -344.6, 1.4, 0.12, col(0x8a6a3a), 'Uma vassoura. Ele mesmo varre a sala, "porque interno preguiçoso não varre". Ela parece estar te julgando.');
    box(8.2, 0, -344.75, 8.55, 0.25, -344.45, col(0xc8a040));
    // parede norte (da porta): pôster de congresso e certificado
    sign('CÉLULAS-TRONCO', 10.5, 1.8, -334.03, 1.6, 1.1, 'z-', { w: 160, h: 110, size: 15, fg: '#fff', bg: '#2a5a8a',
      msg: 'Pôster de congresso: "CÉLULAS-TRONCO NA EMERGÊNCIA — resultados preliminares". Preliminares desde 1998. Ele diz que os resultados "falam por si". Ele fala por eles.' });
    sign('ABCDE · 25.000', 19.2, 1.8, -334.03, 1.4, 0.9, 'z-', { w: 144, h: 90, size: 15, ...ink,
      msg: 'Certificado: "PRIMEIRO CURSO DE ABCDE DO BRASIL". Embaixo, à caneta: "25.000 alunos. Nenhum faz direito."' });
    // canto da porta: coletes e o kit de pesca/camping
    box(19.3, 0, -335.9, 20.8, 0.9, -334.6, col(0xe86a10), { collide: true,
      msg: 'Uma pilha de coletes salva-vidas. Etiqueta: "PRA DOAR NAS PRAIAS SELVAGENS". Ele doa. Depois conta. Muitas vezes.' });
    box(8.4, 0, -335.9, 9.3, 0.55, -335.1, col(0xe8e8f0), { collide: true,
      msg: 'Um isopor com adesivo "CAMPING BEVERLY HILLS". Dentro: iscas e um laringoscópio. "Nunca se sabe."' });
    rod(8.6, -334.6, 2.4, -0.18, col(0x3a3a40), 'Vara de pesca. "Pesquei um dourado de 20 kg. Sozinho. Com uma mão. A outra fazendo massagem cardíaca num pescador."');
    // parede leste: Nobel, Mediterrâneo, a pelada de domingo
    sign('MEDITERRÂNEO', 20.98, 1.75, -336.6, 1.6, 1.0, 'x-', { w: 160, h: 100, size: 15, fg: '#fff', bg: '#2a6ab0',
      msg: 'Mapa do Mediterrâneo cheio de rotas à caneta. "Conheço cada ilha. Mergulhei em todas. Em algumas, duas vezes."' });
    panel(20.98, 1.8, -341.3, 0.8, 0.6, 'x-', M.board, {
      msg: 'Foto dele com um ganhador do Nobel. O ganhador do Nobel está cortado pela metade. Ele, inteiro e no centro.' });
    sign('COSTELAS: 40', 20.98, 1.6, -343.6, 1.2, 0.6, 'x-', { w: 128, h: 64, size: 16, fg: '#fff', bg: '#2a7a3a', border: true,
      msg: 'Luvas de goleiro e um placar: "COSTELAS QUEBRADAS NA PELADA DE DOMINGO: 40". Três por domingo. Todas dele. Ele chama isso de "defesa".' });
    // chão: estante de partitura e o pote do pastor-alemão
    rod(10.2, -339.4, 1.1, 0, col(0x2a2a2e));
    box(9.85, 1.05, -339.5, 10.55, 1.5, -339.4, col(0xf0ece0), { msg: 'Estante de partitura: "CONCERTO PARA SAX E DESFIBRILADOR" — composição dele. "Ritmo chocável é jazz, interno."' });
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.14, 10), col(0x8a1a1a)); bowl.position.set(19.6, 0.07, -340.2); scene.add(bowl);
    bowl.userData.msg = 'Um pote de ração enorme escrito "REX VII". Ele cria pastor-alemão. "Os cachorros fazem o ABCDE melhor que vocês."'; WORLD.interactables.push(bowl);
    // em cima da mesa
    box(12.3, 0.8, -343.0, 12.9, 0.92, -342.6, col(0xa01818), { msg: 'Um Guyton todo rabiscado de vermelho. Na margem do capítulo de choque: "ERRADO. Puxou toda a brasa pro seu assado." Assinado: F.' });
    const pens = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.18, 8), col(0x2a4ab0)); pens.position.set(16.4, 0.89, -342.75); scene.add(pens);
    pens.userData.msg = 'Um pote cheio de canetas BIC. Etiqueta: "VIA AÉREA CIRÚRGICA — KIT DE ESTRADA". Nenhuma tem tampa.'; WORLD.interactables.push(pens);
    box(13.4, 0.8, -343.1, 14.1, 0.88, -342.7, col(0xd8cca0), { msg: 'Uma pasta grossa: "AVALIAÇÕES PSICOLÓGICAS — POLÍTICOS (CONFIDENCIAL)". Ele não pode comentar. Ele já comentou três.' });
    out.falastraoPos = new THREE.Vector3(14.5, 0, -341.2);
    out.chefiaR = 2.4;                        // a conversa só começa perto dele: dá pra fuçar a sala antes
    const lamp = new THREE.PointLight(0xffc070, 1.2, 8, 2); lamp.position.set(16, 1.3, -342.7); scene.add(lamp);

    out.update = dt => {                                        // chiado da TV
      tvl.intensity = 0.4 + Math.random() * 0.5;
      tv.material.color.setScalar(0.45 + Math.random() * 0.3);
    };
    return out;
  }

  return { build, MAP };
})();

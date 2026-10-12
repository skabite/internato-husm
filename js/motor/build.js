// Caixa de ferramentas pra montar áreas do mapa (usada por js/mapa/*.js).
// O que é registrado aqui o motor cuida sozinho: portas deslizam, luzes de emergência piscam,
// itens de cura curam ao passar perto e o save lembra quais foram pegos (pelo id).
const BUILD = (() => {
  const doors = {};          // nome → porta (ex.: BUILD.doors.alaC)
  const lights = [];         // luzes de emergência que piscam
  const pickups = [];        // itens de cura; cada um tem um id estável: 'ÁREA:n' (ex.: 'L1:0')
  const count = {};          // quantos itens cada área já registrou (pra gerar o id)

  // ---------- MAPA EM TEXTO (1 caractere = 1 m) ----------
  // Coluna c → x = x0 + c; linha r → z = z0 − r. '#' vira parede (trechos fundidos pra gerar poucas caixas).
  //   o: { x0, z0, wallH = 3, wall, floor, ceiling, top }  top = altura do volume de concreto acima do forro (opcional)
  function walls(MAP, o) {
    const M = WORLD.M, H = o.wallH || 3, xw = MAP[0].length, zh = MAP.length, runs = [];
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
    for (const q of runs) WORLD.box(o.x0 + q.c1, 0, o.z0 - q.r2 - 1, o.x0 + q.c2 + 1, H, o.z0 - q.r1, o.wall || M.wallLow, { collide: true });
    WORLD.box(o.x0, -0.02, o.z0 - zh, o.x0 + xw, 0.02, o.z0, o.floor || M.vinyl);
    WORLD.box(o.x0, H - 0.05, o.z0 - zh, o.x0 + xw, H, o.z0, o.ceiling || M.ceiling);
    if (o.top) WORLD.box(o.x0, H, o.z0 - zh, o.x0 + xw, o.top, o.z0, M.concrete);
    return { xw, zh };
  }
  // chama each[letra](x, z) no centro de cada célula que tiver essa letra (ex.: { J: javali, c: café })
  function scan(MAP, o, each) {
    MAP.forEach((row, r) => [...row].forEach((ch, c) => { if (each[ch]) each[ch](o.x0 + c + 0.5, o.z0 - r - 0.5); }));
  }

  // ---------- PORTAS ----------
  // Porta de correr entre (x1,z1) e (x2,z2). slide = [dx, dy, dz]: pra onde ela anda ao abrir.
  //   o: { locked, lockedMsg, su }  — trancada mostra lockedMsg; destranque com BUILD.doors.nome.locked = false
  function door(name, x1, z1, x2, z2, slide, o = {}) {
    const mesh = WORLD.box(x1, 0, z1, x2, 2.4, z2, WORLD.M.door, { su: o.su || 1, sv: 2.1 });
    const col = { x1, x2, z1, z2 }; WORLD.colliders.push(col);
    const d = { name, mesh, col, locked: !!o.locked, lockedMsg: o.lockedMsg || 'Trancada.', open: false, t: 0,
      slide: new THREE.Vector3(...slide), base: mesh.position.clone(), partner: null };
    d.tryOpen = () => {
      if (d.open) return;
      if (d.locked) { BUILD.toast(d.lockedMsg, 4); AUDIO.sfx('dry'); return; }
      for (const k of [d, d.partner]) {
        if (!k) continue;
        k.open = true;
        const i = WORLD.colliders.indexOf(k.col); if (i >= 0) WORLD.colliders.splice(i, 1);
      }
      AUDIO.sfx('door');
    };
    d.close = () => {
      for (const k of [d, d.partner]) {
        if (!k) continue;
        k.open = false; k.t = 0; k.mesh.position.copy(k.base);
        if (!WORLD.colliders.includes(k.col)) WORLD.colliders.push(k.col);
      }
    };
    mesh.userData.verb = 'abrir';
    mesh.userData.onUse = () => d.tryOpen();
    doors[name] = d;
    return d;
  }
  // porta dupla: usar qualquer uma das folhas abre as duas (a trava e o aviso são da primeira)
  function pair(a, b) {
    a.partner = b; b.partner = a;
    b.mesh.userData.onUse = () => a.tryOpen();
  }

  // ---------- LUZ DE EMERGÊNCIA (pisca sozinha) ----------
  //   o: { color, bulbColor, dist, peak (intensidade quando acesa), bulb: [largura, altura, fundo] }
  function light(x, y, z, o = {}) {
    const l = new THREE.PointLight(o.color || 0xff2a1a, o.peak || 1, o.dist || 10, 2); l.position.set(x, y, z); WORLD.scene.add(l);
    const [bw, bh, bd] = o.bulb || [0.3, 0.12, 0.12];
    const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), new THREE.MeshBasicMaterial({ color: o.bulbColor || 0xff3020 }));
    b.position.copy(l.position); WORLD.scene.add(b);
    l.userData.bulb = b; l.userData.peak = o.peak || 1;
    lights.push(l);
    return l;
  }

  // ---------- ITENS DE CURA ----------
  // item: { x, z, cup (o que some quando pega), heal = 30, cure (tira a infecção; padrão sim), msgs, full }
  function pickup(area, item) {
    count[area] = (count[area] || 0) + 1;
    item.id = area + ':' + (count[area] - 1);
    item.taken = false;
    pickups.push(item);
    return item;
  }
  // café da copa num banquinho (cura 30 e a infecção)
  function cafe(area, x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); WORLD.scene.add(g);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.14, 8), new THREE.MeshPhongMaterial({ color: 0xf2efe6, emissive: 0x333333 }));
    cup.position.y = 0.8; g.add(cup);
    const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.01, 8), new THREE.MeshBasicMaterial({ color: 0x3a2010 }));
    coffee.position.y = 0.87; g.add(coffee);
    const stool = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.72, 0.35), WORLD.M.metal); stool.position.y = 0.36; g.add(stool);
    return pickup(area, { x, z, group: g, cup });
  }

  // ---------- ANIMAÇÃO (o main.js chama todo quadro) ----------
  function update(dt, time) {
    for (const d of Object.values(doors)) {
      if (!d.open || d.t >= 1) continue;
      d.t = Math.min(1, d.t + dt * 1.4);
      d.mesh.position.copy(d.base).addScaledVector(d.slide, d.t);
    }
    lights.forEach((l, i) => {
      const on = Math.sin(time * (1.3 + i * 0.4) + i * 2) > -0.4 ? 1 : 0.1;
      l.intensity = on * l.userData.peak; l.userData.bulb.visible = on > 0.5;
    });
  }

  return { walls, scan, door, pair, light, pickup, cafe, update, doors, lights, pickups, toast: () => {} };
})();

// CHEFE: Alexandre "Bélgica" Schwartzboldt (CCIH).
// Ataques: OLHAR PENETRANTE (raio psíquico — quebre a linha de visão atrás dos pilares)
//          e SERINGAS CONTAMINADAS (dá pra destruir no ar com tiro).
// Ponto fraco: está sempre atrasado pra uma entrevista. Quando o telefone toca, ele para —
// corra até ele e aperte [E] para ele assinar a liberação da cefalexina. 3 assinaturas = vitória.
// Também dá pra vencer na força: 60 de vida (revólver tira 2, bisturi 1). Zerou, ele se rende e assina tudo.
const BOSS = (() => {
  let scene, camera, hooks, npc, eyes, beam, syrTex;
  const S = {
    state: 'off', sig: 0, hp: 60, maxHp: 60, flashT: 0, t: 0, atkCd: 3, phoneT: 14, phoneLeft: 0, stareT: 0, stareMode: null,
    target: null, tpT: 10, throwAnim: 0, hurtMsgT: 0,
  };
  const syringes = [];
  const DOCS = ['PARECER', 'JUSTIFICATIVA', 'TERMO DE RESPONSABILIDADE'];
  const CALLS = [
    '📞 "Alô? Rádio? Sim, sim, entro AO VIVO em um minuto!"',
    '📞 "Diário? A coluna de amanhã? Mando até as seis, prometo!"',
    '📞 "TV? Agora? Já tô descendo, já tô descendo!"',
    '📞 "Podcast? Quarenta minutos? Eu tenho dois. Tá, vamos."',
  ];
  const SIGN_LINES = [
    '"Tá, tá, assino o PARECER, é só isso? Tô atrasado!"',
    '"JUSTIFICATIVA? Assino, assino, a rádio tá esperando!"',
    '"TERMO DE RESPONSABILIDADE?! Assino TUDO! Estou AO VIVO!"',
  ];

  const lvl = () => Math.min(S.sig, 2);
  const pp = () => hooks.pos();

  function init(sc, cam, h, bossNPC) {
    scene = sc; camera = cam; hooks = h; npc = bossNPC;
    // olhos brilhando
    eyes = new THREE.Group();
    for (const s of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.035), new THREE.MeshBasicMaterial({ color: 0xc040ff }));
      e.position.set(s * 0.085, 0, 0); eyes.add(e);
    }
    eyes.visible = false; scene.add(eyes);
    // raio
    beam = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.09, 1, 6, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xb040ff, transparent: true, opacity: 0.55, depthWrite: false }));
    beam.visible = false; scene.add(beam);
    syrTex = SPRITES.texFrom(SPRITES.SYRINGE);
  }

  function start() {
    Object.assign(S, { state: 'fight', sig: 0, hp: S.maxHp, flashT: 0, t: 0, atkCd: 2.5, phoneT: 13, phoneLeft: 0, stareT: 0, stareMode: null, tpT: 9, throwAnim: 0 });
    pickTarget();
    hooks.bar(S);
  }
  function reset(pos) {
    S.state = 'off'; S.sig = 0; S.hp = S.maxHp; S.stareMode = null; npc.mat.color.setRGB(1, 1, 1);
    eyes.visible = beam.visible = false;
    npc.mesh.position.set(pos.x, npc.h / 2, pos.z);
    clearSyringes();
    hooks.bar(null);
  }
  function clearSyringes() { for (const s of syringes) scene.remove(s.mesh); syringes.length = 0; }

  function pickTarget() {
    const wp = hooks.waypoints;
    let t; do { t = wp[Math.floor(Math.random() * wp.length)]; } while (S.target === t && wp.length > 1);
    S.target = t;
  }
  function teleport() {
    AUDIO.sfx('teleport'); hooks.flash('#a040ff');
    pickTarget();
    npc.mesh.position.x = S.target.x; npc.mesh.position.z = S.target.z;
    pickTarget();
  }

  // ---------- ATAQUES ----------
  function throwSyringes() {
    const n = [1, 3, 5][lvl()], speed = 9 + lvl() * 2.2;
    const bx = npc.mesh.position.x, bz = npc.mesh.position.z, p = pp();
    const base = Math.atan2(p.x - bx, p.z - bz);
    for (let i = 0; i < n; i++) {
      const a = base + (i - (n - 1) / 2) * 0.16;
      const mat = new THREE.MeshBasicMaterial({ map: syrTex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.2), mat);
      mesh.position.set(bx, 1.35, bz); scene.add(mesh);
      syringes.push({ x: bx, z: bz, vx: Math.sin(a) * speed, vz: Math.cos(a) * speed, mesh, life: 6, spin: Math.random() * 6 });
    }
    S.throwAnim = 0.4;
    AUDIO.sfx('throw');
  }
  function startStare() {
    S.stareMode = 'charge'; S.stareT = 0.95 - lvl() * 0.12;
    AUDIO.sfx('stare');
    hooks.subtitle(U.pick(['*O olhar dele atravessa você. Seu currículo Lattes encolhe.*', '*Ele te encara. Você sente vontade de pedir desculpas por algo que não fez.*', '*OLHAR PENETRANTE. Esconda-se!*']), 2.5);
  }

  function update(dt) {
    if (S.state === 'off' || S.state === 'done') return;
    S.t += dt;
    const m = npc.mesh, p = pp();
    const dx = p.x - m.position.x, dz = p.z - m.position.z, d = Math.hypot(dx, dz);
    if (S.hurtMsgT > 0) S.hurtMsgT -= dt;
    if (S.flashT > 0) { S.flashT -= dt; const f = S.flashT > 0 ? 3 : 1; npc.mat.color.setRGB(f, f, f); }

    // seringas voam mesmo durante o telefone
    for (let i = syringes.length - 1; i >= 0; i--) {
      const s = syringes[i];
      s.x += s.vx * dt; s.z += s.vz * dt; s.life -= dt; s.spin += dt * 14;
      s.mesh.position.set(s.x, 1.35, s.z);
      s.mesh.rotation.set(0, Math.atan2(camera.position.x - s.x, camera.position.z - s.z), s.spin);
      let dead = s.life <= 0;
      if (!dead && hooks.wallAt(s.x, s.z)) { dead = true; AUDIO.sfx('shatter'); }
      if (!dead && Math.hypot(s.x - p.x, s.z - p.z) < 0.45) { dead = true; hooks.hit(9, true); AUDIO.sfx('shatter'); }
      if (dead) { scene.remove(s.mesh); syringes.splice(i, 1); }
    }

    if (S.state === 'phone') {
      S.phoneLeft -= dt;
      npc.setFrame(Math.floor(S.t * 6) % 2);             // falando ao telefone
      hooks.prompt(d < 2.2 ? '[E] ENTREGAR O ' + DOCS[S.sig] + ' PARA ASSINAR' : '');
      if (S.phoneLeft <= 0) {
        hooks.prompt('');
        hooks.subtitle('"...tá, tá, me dá dois minutos!" *Ele desliga. E lembra de você.*', 3);
        S.state = 'fight'; S.atkCd = 1; S.phoneT = [13, 11, 9][lvl()];
      }
      eyes.visible = beam.visible = false;
      return;
    }

    // ---------- LUTA ----------
    // movimento até o ponto escolhido
    if (S.stareMode !== 'beam') {
      const tx = S.target.x - m.position.x, tz = S.target.z - m.position.z, td = Math.hypot(tx, tz);
      const sp = 2.0 + lvl() * 0.6;
      if (td < 0.3) pickTarget();
      else { m.position.x += tx / td * sp * dt; m.position.z += tz / td * sp * dt; }
    }
    S.tpT -= dt;
    if (S.tpT <= 0 && !S.stareMode) { S.tpT = 10 - lvl() * 2 + Math.random() * 3; teleport(); }

    // telefone (ponto fraco)
    S.phoneT -= dt;
    if (S.phoneT <= 0 && !S.stareMode) {
      S.state = 'phone'; S.phoneLeft = [6.5, 5.5, 4.5][lvl()];
      AUDIO.sfx('phone'); hooks.subtitle(U.pick(CALLS), S.phoneLeft);
      return;
    }

    // ataques
    S.throwAnim -= dt;
    if (S.stareMode === 'charge') {
      S.stareT -= dt;
      if (S.stareT <= 0) { S.stareMode = 'beam'; S.stareT = 2.4 + lvl() * 0.5; }
    } else if (S.stareMode === 'beam') {
      S.stareT -= dt;
      if (hooks.los(m.position.x, m.position.z, p.x, p.z)) hooks.hit(16 * dt, false, true);
      if (S.stareT <= 0) { S.stareMode = null; S.atkCd = 1.6 - lvl() * 0.3; }
    } else {
      S.atkCd -= dt;
      if (S.atkCd <= 0) {
        const canSee = hooks.los(m.position.x, m.position.z, p.x, p.z);
        if (canSee && Math.random() < 0.4 + lvl() * 0.1) startStare();
        else throwSyringes();
        S.atkCd = (2.3 - lvl() * 0.5) + Math.random();
      }
    }

    // visual: olhos e raio
    const headY = npc.h - 0.27;
    eyes.visible = !!S.stareMode;
    if (eyes.visible) {
      eyes.position.set(m.position.x, headY, m.position.z);
      eyes.rotation.y = m.rotation.y;
      eyes.translateZ(0.03);
    }
    beam.visible = S.stareMode === 'beam';
    if (beam.visible) {
      const from = new THREE.Vector3(m.position.x, headY, m.position.z);
      const wall = hooks.rayLen(from.x, from.z, dx / d, dz / d, d);
      const to = new THREE.Vector3(m.position.x + dx / d * wall, 1.45, m.position.z + dz / d * wall);
      const dir = to.clone().sub(from), len = dir.length();
      beam.scale.set(1, len, 1);
      beam.position.copy(from).addScaledVector(dir, 0.5);
      beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      beam.material.opacity = 0.4 + Math.sin(S.t * 40) * 0.15;
    }
    npc.setFrame(S.throwAnim > 0 ? 2 : (S.stareMode ? 1 : 0));
  }

  function trySign() {
    if (S.state !== 'phone') return false;
    const m = npc.mesh, p = pp();
    if (Math.hypot(p.x - m.position.x, p.z - m.position.z) > 2.2) return false;
    AUDIO.sfx('scribble');
    hooks.subtitle(SIGN_LINES[S.sig], 3.5);
    S.sig++;
    hooks.prompt('');
    hooks.bar(S);
    if (S.sig >= 3) { S.state = 'done'; clearSyringes(); eyes.visible = beam.visible = false; hooks.onDefeat(); return true; }
    S.state = 'fight'; S.atkCd = 1.2; S.phoneT = [13, 11, 9][lvl()];
    setTimeout(() => { if (S.state === 'fight') teleport(); }, 600);
    return true;
  }

  return {
    S, DOCS, init, start, reset, update, trySign,
    get active() { return S.state === 'fight' || S.state === 'phone'; },
    // alvos para o COMBAT (tiro e bisturi)
    targets() {
      if (!this.active) return [];
      const list = syringes.map(s => ({ x: s.x, z: s.z, r: 0.4, hit: () => {
        const i = syringes.indexOf(s); if (i >= 0) { scene.remove(s.mesh); syringes.splice(i, 1); AUDIO.sfx('shatter'); }
      } }));
      const m = npc.mesh;
      list.push({ x: m.position.x, z: m.position.z, r: 0.45, hit: (dmg = 1) => {
        if (S.state !== 'fight' && S.state !== 'phone') return;
        S.hp = Math.max(0, S.hp - dmg); S.flashT = 0.12;
        AUDIO.sfx('bad');
        hooks.bar(S);
        if (S.hurtMsgT <= 0) {
          S.hurtMsgT = 5;
          hooks.subtitle(U.pick([
            '"AI! Isso vai pra ata!"',
            '"Você sabe com quem está falando? Eu tenho uma COLUNA!"',
            '"Interno armado na CCIH! Isso é uma não-conformidade!"',
            '"Eu vou mencionar isso na entrevista!"',
          ]), 2.5);
        }
        if (S.hp <= 0) {
          S.state = 'done'; clearSyringes(); eyes.visible = beam.visible = false; npc.mat.color.setRGB(1, 1, 1);
          hooks.prompt('');
          hooks.subtitle('"CHEGA! CHEGA! Eu assino! Eu assino TUDO!"', 3);
          hooks.onDefeat();
        }
      } });
      return list;
    },
  };
})();

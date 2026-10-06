// Loop principal: estados, controles, câmera, gatilhos de eventos.
(() => {
  const $ = id => document.getElementById(id);
  const canvas = $('game');

  // ---------- RENDER (baixa resolução, ampliada com pixels "duros") ----------
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  renderer.setPixelRatio(1);
  const scene = new THREE.Scene();
  const SKY = 0x06080d;
  scene.background = new THREE.Color(SKY);
  scene.fog = new THREE.FogExp2(SKY, 0.022);
  const camera = new THREE.PerspectiveCamera(72, 1, 0.05, 250);
  camera.rotation.order = 'YXZ';
  scene.add(camera);

  const RES = [180, 270, 400];
  let resIdx = 1;
  function resize() {
    const ih = RES[resIdx], iw = Math.round(ih * innerWidth / innerHeight);
    renderer.setSize(iw, ih, false);
    camera.aspect = iw / ih; camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();

  // ---------- HUD ----------
  let toastT = 0, subT = 0, notifyT = 0;
  function toast(text, secs = 3.5) { $('toast').textContent = text; $('toast').classList.add('show'); toastT = secs; }
  function subtitle(text, secs = 4.5) { $('subtitle').textContent = text; $('subtitle').classList.add('show'); subT = secs; }
  function notify(text, title = '📱 Instagram') { $('notify').innerHTML = `<b>${title}</b><br>${text}`; $('notify').classList.add('show'); notifyT = 3.2; AUDIO.sfx('notify'); }
  function setObjective(t) { $('objective').textContent = t; }
  function show(id, on = true) { $(id).classList.toggle('hidden', !on); }

  // ---------- MUNDO ----------
  const W = WORLD.build(scene);
  W.colliders.push({ x1: -200, x2: 200, z1: 75, z2: 200 }, { x1: -200, x2: -85, z1: -200, z2: 200 }, { x1: 85, x2: 200, z1: -200, z2: 200 });
  const L = LEVEL1.build(scene, { M: W.M, TOP: W.TOP, toast, stretcher: WORLD.stretcher, onGun: where => onGun(where) });
  const L2 = LEVEL2.build(scene, { M: W.M, TOP: W.TOP, toast, stretcher: WORLD.stretcher, cafe: (x, z) => L.makeCafe(x, z), onGel: g => onGel(g) });
  const allCafes = () => L.cafes.concat(L2.cafes);
  const allDoors = () => Object.values(L.doors).concat(Object.values(L2.doors));
  const allLights = () => L.lights.concat(L2.lights);

  // ---------- LANTERNA ----------
  const flashlight = new THREE.SpotLight(0xfff0d0, 2.4, 26, 0.5, 0.55, 1.5);
  flashlight.position.set(0.15, -0.15, 0);
  flashlight.target.position.set(0, -0.05, -1);
  camera.add(flashlight); camera.add(flashlight.target);
  const eyeLight = new THREE.PointLight(0x5a6478, 0.35, 6, 2);
  camera.add(eyeLight);

  // ---------- PERSONAGENS (sprites) ----------
  function makeNPC(id, pos, w, h) {
    const tex = SPRITES.textures(id);
    const mat = new THREE.MeshPhongMaterial({ map: tex[0], transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, emissive: 0x1a1812 });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(pos.x, h / 2, pos.z); scene.add(mesh);
    const col = { x1: pos.x - 0.3, x2: pos.x + 0.3, z1: pos.z - 0.3, z2: pos.z + 0.3 };
    return { id, mesh, mat, tex, h, col, setFrame(f) { if (mat.map !== tex[f]) { mat.map = tex[f]; mat.needsUpdate = true; } },
      face() { mesh.rotation.y = Math.atan2(camera.position.x - mesh.position.x, camera.position.z - mesh.position.z); } };
  }
  const profNPC = makeNPC('prof1', W.profStart, 0.9, 1.8);
  const prof = profNPC.mesh, profMat = profNPC.mat, profTex = profNPC.tex;
  const lantern = new THREE.PointLight(0xffb060, 1.5, 10, 2);
  scene.add(lantern);
  const profCol = { x1: 0, x2: 0, z1: 0, z2: 0 };
  const dudu = makeNPC('prof2', L.duduPos, 0.78, 1.56);        // baixinho
  const prof3 = makeNPC('prof3', L.prof3Pos, 0.9, 1.8);
  const clovis = makeNPC('prof4', L2.clovisPos, 0.92, 1.9);      // alto
  const belgica = makeNPC('chefao', L2.bossPos, 0.9, 1.8);
  W.colliders.push(dudu.col, prof3.col, clovis.col);
  const npcs = [dudu, prof3, clovis, belgica];

  // ---------- ESTADO ----------
  const G = {
    state: 'boot', paused: false, met: false, objective: false, scare: 0, ended: false,
    profTarget: null, mutterT: 3, time: 0,
    duduDone: false, hasGun: false, kills: 0, prof3Done: false, clovisDone: false, bossStarted: false, bossDone: false, psyT: 0, flashT: 0, achievement: false, musicMode: 'explore', convoTarget: null, wardGruntT: 3,
  };
  const P = { pos: W.spawn.clone(), yaw: 0, pitch: 0, bob: 0, stepAcc: 0, moving: false };

  // ---------- COLISÃO ----------
  const R = 0.3;
  function wallBlocked(x, z, r = R) {
    for (const b of W.colliders) if (x + r > b.x1 && x - r < b.x2 && z + r > b.z1 && z - r < b.z2) return true;
    return false;
  }
  function blocked(x, z) { return wallBlocked(x, z) || COMBAT.blocks(x, z, R); }
  function move(dx, dz) {
    if (!blocked(P.pos.x + dx, P.pos.z)) P.pos.x += dx;
    if (!blocked(P.pos.x, P.pos.z + dz)) P.pos.z += dz;
  }

  // ---------- COMBATE ----------
  COMBAT.init(scene, camera, {
    colliders: W.colliders, blocked: wallBlocked, pos: () => P.pos, yaw: () => P.yaw,
    push: (dx, dz) => { move(dx * 0.5, dz * 0.5); move(dx * 0.5, dz * 0.5); },
    onDeath, onKill: () => { G.kills++; }, targets: () => BOSS.targets(),
  });
  const gate = L2.arenaGate;
  BOSS.init(scene, camera, {
    pos: () => P.pos, waypoints: L2.waypoints, los: COMBAT.los, rayLen: COMBAT.rayWall,
    wallAt: (x, z) => wallBlocked(x, z, 0.05),
    hit: (dmg, infect, psychic) => {
      if (COMBAT.P.dead) return;
      if (psychic) {
        G.psyT = 0.25; COMBAT.P.hp -= dmg;
        if (COMBAT.P.hp <= 0) { COMBAT.P.hp = 0; COMBAT.P.dead = true; onDeath(); }
        return;
      }
      COMBAT.damage(dmg);
      if (infect) { COMBAT.P.infectT = 5; toast('Seringa contaminada! INFECTADO. (café ou álcool gel ajudam)', 2.5); }
    },
    subtitle, prompt: t => { $('prompt').textContent = t; },
    bar: S => renderBossBar(S), flash: col => { $('flash').style.background = col; G.flashT = 0.25; },
    onDefeat: () => onBossDefeat(),
  }, belgica);
  function renderBossBar(S) {
    if (!S) { show('bossbar', false); return; }
    show('bossbar');
    $('bossbar').innerHTML = '<div class="bname">ALEXANDRE "BÉLGICA" SCHWARTZBOLDT — CCIH</div><div class="docs">' +
      BOSS.DOCS.map((d, i) => '<span class="' + (i < S.sig ? 'ok' : '') + '">' + (i < S.sig ? '☑ ' : '☐ ') + d + '</span>').join('') + '</div>' +
      '<div class="bhp"><div style="width:' + (100 * S.hp / S.maxHp) + '%"></div></div>';
  }
  for (const s of L.boars) COMBAT.spawn(s.x, s.z);

  // ---------- ENTRADA ----------
  const keys = {};
  addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyP') { resIdx = (resIdx + 1) % RES.length; resize(); toast(`Resolução interna: ${RES[resIdx]} linhas`, 1.5); }
    if (e.code === 'KeyM') toast(AUDIO.toggleMusic() ? 'Música: ligada' : 'Música: desligada', 1.5);
    if (G.state !== 'play' || G.paused) return;
    if (e.code === 'KeyF') { flashlight.visible = !flashlight.visible; AUDIO.sfx('click'); }
    if (e.code === 'KeyE' && BOSS.active && BOSS.trySign()) return;
    if (e.code === 'KeyE' && lookTarget) {
      if (lookTarget.userData.onUse) lookTarget.userData.onUse();
      else toast(lookTarget.userData.msg, 5);
    }
    if (e.code === 'Digit1') COMBAT.select('scalpel');
    if (e.code === 'Digit2') COMBAT.select('revolver');
    if (e.code === 'KeyR') COMBAT.startReload();
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  document.addEventListener('mousemove', e => {
    if (document.pointerLockElement !== canvas || G.state !== 'play') return;
    P.yaw -= e.movementX * 0.0022;
    P.pitch = U.clamp(P.pitch - e.movementY * 0.0022, -1.35, 1.35);
  });
  document.addEventListener('mousedown', e => {
    if (e.button === 0 && document.pointerLockElement === canvas && G.state === 'play' && !G.paused) COMBAT.fire();
  });
  const lock = () => { if (TOUCH.on) return; const p = canvas.requestPointerLock && canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); };
  document.addEventListener('pointerlockchange', () => {
    if (TOUCH.on) return;
    const locked = document.pointerLockElement === canvas;
    if (G.state === 'play') { G.paused = !locked; show('pause', !locked); }
  });
  function relockOrPause() { if (G.dev || TOUCH.on) return; if (document.pointerLockElement !== canvas) { G.paused = true; show('pause'); } }

  // ---------- SAVE (localStorage do navegador) ----------
  const SAVE_KEY = 'internato-husm-save-v1';
  function readSave() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; } }
  function save(quiet = false) {
    if (G.ended || !G.met || G.state !== 'play' || BOSS.active) return;
    const data = {
      pos: [P.pos.x, P.pos.z], yaw: P.yaw, met: G.objective, scare: G.scare > 0,
      duduDone: G.duduDone, hasGun: G.hasGun, following: CONVO.following,
      prof3Done: G.prof3Done, clovisDone: G.clovisDone, achievement: G.achievement,
      hp: COMBAT.P.hp, maxHp: COMBAT.P.maxHp, kills: G.kills,
      dead: COMBAT.boars.map((b, i) => (b.state === 'dead' && i < L.boars.length ? i : -1)).filter(i => i >= 0),
      cafes: allCafes().map((c, i) => (c.taken ? i : -1)).filter(i => i >= 0),
      date: Date.now(),
    };
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) { return; }
    if (!quiet && toastT <= 0) toast('💾 Jogo salvo', 1.5);
  }
  function wardLeft() { return COMBAT.boars.filter((b, i) => i < L.boars.length && b.state !== 'dead').length; }
  function objectiveText() {
    if (G.clovisDone) return 'OBJETIVO: Resolver a CCIH com o "BÉLGICA" — 3 assinaturas ou na bala\n• Fuja do olhar (pilares) · atire nele e nas seringas · telefone tocou: [E]';
    if (G.prof3Done) return 'OBJETIVO: Falar com o CLÓVIS DA VASCULAR (porta dos fundos do Professor3)';
    if (G.hasGun) {
      const n = wardLeft();
      return n > 0 ? 'OBJETIVO: Limpar a ALA C — javalis restantes: ' + n + '\n[CLIQUE] atirar · [R] recarregar · [1] bisturi · [2] revólver'
        : 'OBJETIVO: Entregar os laudos ao PROFESSOR3 (fim da Ala C)';
    }
    if (G.hasGun) return 'OBJETIVO: Atravessar a ALA C e entregar os laudos ao PROFESSOR3\n[CLIQUE] atirar · [R] recarregar · [1] bisturi · [2] revólver';
    if (G.duduDone) return 'OBJETIVO: Pegar o revólver na sala da CIRURGIA TORÁCICA\n• Entregar os laudos ao PROFESSOR3 (fim da Ala C)';
    if (G.objective) return 'OBJETIVO: Encontrar o DUDU DA GASTRO (Endoscopia)';
    return 'OBJETIVO: Entrar no HUSM';
  }
  function applySave(s) {
    if (s.met) {
      G.met = G.objective = true;
      G.profTarget = W.profIdle.clone();
      prof.position.x = G.profTarget.x; prof.position.z = G.profTarget.z;
    }
    if (s.scare) {
      G.scare = 99; G.banged = true;
      const st = W.endStretcher, [, hz] = st.userData.h;
      st.position.z = -37.5; st.userData.col.z1 = -37.5 - hz; st.userData.col.z2 = -37.5 + hz;
    }
    if (s.duduDone) {
      G.duduStarted = G.duduDone = true;
      COMBAT.give('scalpel'); CONVO.setFollowing(s.following);
      for (const k of ['torax', 'alaC', 'alaC2']) L.doors[k].locked = false;
    }
    if (s.hasGun) { G.hasGun = true; L.gunTaken = true; COMBAT.give('revolver'); }
    if (s.prof3Done) { G.prof3Started = G.prof3Done = true; L.doors.prof3.locked = false; L.doors.prof3back.locked = false; moveProf3Aside(); }
    if (s.clovisDone) { G.clovisStarted = G.clovisDone = true; L2.doors.ccih.locked = false; L2.doors.ccih2.locked = false; }
    G.achievement = !!s.achievement;
    COMBAT.P.maxHp = s.maxHp || 100; COMBAT.P.hp = s.hp || COMBAT.P.maxHp;
    G.kills = s.kills || 0;
    (s.dead || []).forEach(i => COMBAT.killSilently(i));
    (s.cafes || []).forEach(i => { const c = allCafes()[i]; if (c) { c.taken = true; c.cup.visible = false; } });
    P.pos.set(s.pos[0], 0, s.pos[1]); P.yaw = s.yaw || 0; P.pitch = 0;
    setObjective(objectiveText());
  }
  function continueGame() {
    const s = readSave(); if (!s) return startNew();
    show('title', false);
    AUDIO.stop(0.8);
    lock();
    applySave(s);
    G.state = 'play';
    show('hud');
    AUDIO.play('moonlight', { fade: 2 });
    toast('Jogo carregado.', 2);
    relockOrPause();
  }

  // ---------- TELAS ----------
  $('boot').onclick = () => {
    AUDIO.init();
    AUDIO.play('toccata', { fade: 0.1 });
    show('boot', false); show('title');
    const s = readSave();
    show('title-save', !!s); show('title-new', !s);
    if (s) $('save-info').textContent = `salvo em ${new Date(s.date).toLocaleString('pt-BR')} · ${s.clovisDone ? 'a caminho da CCIH' : s.prof3Done ? 'depois do Javali' : s.hasGun ? 'com revólver' : s.duduDone ? 'depois do Dudu' : 'depois do saguão'}`;
    G.state = 'title';
  };
  $('title').onclick = () => { if (!readSave()) startNew(); };
  $('btn-continue').onclick = e => { e.stopPropagation(); continueGame(); };
  $('btn-new').onclick = e => {
    e.stopPropagation();
    if (!confirm('Começar um jogo novo? O save atual será apagado.')) return;
    try { localStorage.removeItem(SAVE_KEY); } catch (err) { /* sem storage */ }
    startNew();
  };
  function startNew() {
    show('title', false);
    AUDIO.stop(1.5);
    lock();
    G.state = 'intro';
    const intro = $('intro');
    intro.textContent = 'Santa Maria, RS — Campus da UFSM, Camobi.\nPrimeiro dia de internato. 18h47.\n\nO Hospital Universitário está estranhamente escuro.';
    show('intro'); intro.style.opacity = 1;
    setTimeout(() => { intro.style.opacity = 0; }, 4800);
    setTimeout(() => {
      show('intro', false);
      G.state = 'play';
      show('hud');
      setObjective('OBJETIVO: Entrar no HUSM');
      AUDIO.play('moonlight', { fade: 3 });
      relockOrPause();
    }, 6000);
  };
  $('pause').onclick = () => { if (TOUCH.on) { G.paused = false; show('pause', false); } else lock(); };
  $('end').onclick = () => location.reload();
  $('dead').onclick = () => respawn();

  // ---------- EXAMINAR ----------
  const ray = new THREE.Raycaster(); ray.far = 2.6;
  let lookTarget = null, rayFrame = 0;
  const skipRay = new Set([prof, dudu.mesh, prof3.mesh, clovis.mesh, belgica.mesh]);
  function updateLook() {
    if (++rayFrame % 4) return;
    ray.setFromCamera({ x: 0, y: 0 }, camera);
    lookTarget = null;
    for (const h of ray.intersectObjects(scene.children, true)) {
      if (skipRay.has(h.object) || COMBAT.boars.some(b => b.mesh === h.object)) continue;
      if (h.object.userData.msg || h.object.userData.onUse) lookTarget = h.object;
      break;
    }
    const verb = lookTarget && lookTarget.userData.verb;
    $('hint').textContent = lookTarget ? `${TOUCH.on ? '' : '[E] '}${verb || 'examinar'}` : '';
  }

  // ---------- CONVERSA COM O PROFESSOR (saguão) ----------
  function startTalk() {
    G.met = true; G.state = 'dialogue';
    $('hint').textContent = '';
    document.body.classList.add('talking');
    DIALOGUE.start(onTalkEnd);
  }
  function onTalkEnd(kind) {
    G.state = 'play';
    G.objective = true;
    document.body.classList.remove('talking');
    setObjective('OBJETIVO: Encontrar o DUDU DA GASTRO (Endoscopia)');
    if (kind === 'desmaio') toast('Você "desmaia". Quando abre os olhos, ele está explicando os tomates para o bebedouro.', 6);
    else toast('Você sai andando rápido. Ele não percebe. Continua falando... com o bebedouro.', 6);
    G.profTarget = W.profIdle.clone();
    setTimeout(() => { if (!G.ended) AUDIO.play('moonlight', { fade: 4 }); }, 2500);
    relockOrPause();
    save();
  }

  // ---------- CONVERSAS ROTEIRIZADAS ----------
  async function runConvo(script, opts = {}) {
    G.state = 'convo'; G.convoTarget = opts.target || null;
    $('hint').textContent = '';
    document.body.classList.add('talking');
    let res;
    try { res = await CONVO.run(script, opts); }
    finally {
      document.body.classList.remove('talking');
      G.state = 'play'; G.convoTarget = null;
      relockOrPause();
    }
    return res;
  }

  async function startDudu() {
    G.duduStarted = true;
    AUDIO.play('prelude', { fade: 1 });
    let following = true;
    await runConvo(async c => {
      following = await STORY1.dudu(c, { giveScalpel: () => { COMBAT.give('scalpel'); AUDIO.sfx('pickup'); }, following: () => CONVO.following });
      if (following) {
        COMBAT.P.maxHp = 125; COMBAT.P.hp = 125;
        await c.say('narr', '*O Dudu ainda te segue no Instagram. Você se sente estranhamente protegido. (+25 de saúde máxima)*');
      } else {
        await c.say('narr', '*O Dudu não te segue mais no Instagram. Você vai ter que se virar sozinho.*');
      }
      await STORY1.thought(c);
    }, { instagram: true, target: dudu });
    G.duduDone = true;
    L.doors.torax.locked = false;
    L.doors.alaC.locked = false; L.doors.alaC2.locked = false;
    L.doors.torax.lockedMsg = '';
    setObjective('OBJETIVO: Pegar o revólver na sala da CIRURGIA TORÁCICA\n• Entregar os laudos ao PROFESSOR3 (fim da Ala C)');
    AUDIO.play('moonlight', { fade: 3 });
    save();
  }

  async function onGun(where) {
    AUDIO.sfx('pickup');
    await runConvo(c => STORY1.gunFound(c, where));
    COMBAT.give('revolver'); G.hasGun = true;
    save();
    setObjective('OBJETIVO: Atravessar a ALA C e entregar os laudos ao PROFESSOR3\n[CLIQUE] atirar · [R] recarregar · [1] bisturi · [2] revólver');
    // emboscada: um javali invade o corredor transversal
    setTimeout(() => {
      AUDIO.sfx('bang');
      const b = COMBAT.spawn(26, -63, { alert: true });
      b.sx = 26; b.sz = -63;
      toast('!!!', 1.5);
    }, 1800);
  }

  async function startProf3() {
    G.prof3Started = true;
    AUDIO.stop(1);
    await runConvo(c => STORY2.prof3(c, { kills: G.kills }), { target: prof3 });
    G.prof3Done = true;
    L.doors.prof3back.locked = false;
    moveProf3Aside();
    titleCard('CAPÍTULO 2\n\nA INFECÇÃO NO AR');
    setObjective(objectiveText());
    AUDIO.play('moonlight', { fade: 3 });
    save();
  }
  function moveProf3Aside() {
    prof3.mesh.position.x = -4.5; Object.assign(prof3.col, { x1: -4.8, x2: -4.2 });
  }
  function titleCard(text) {
    const el = $('intro'); el.textContent = text; el.style.opacity = 1; el.style.background = '#000c'; show('intro');
    setTimeout(() => { el.style.opacity = 0; }, 2600);
    setTimeout(() => { show('intro', false); el.style.background = ''; }, 3800);
  }

  async function startClovis() {
    G.clovisStarted = true;
    AUDIO.play('nacht', { fade: 1 });
    await runConvo(c => STORY2.clovis(c, { achievement: () => {
      G.achievement = true; AUDIO.sfx('achievement');
      notify('Você recebeu um ELOGIO do Clóvis. Isso acontece com 0,3% dos internos.', '🏆 CONQUISTA RARA');
    } }), { meter: true, target: clovis });
    G.clovisDone = true;
    L2.doors.ccih.locked = false; L2.doors.ccih2.locked = false;
    setObjective(objectiveText());
    AUDIO.play('moonlight', { fade: 3 });
    save();
  }

  async function startBoss() {
    G.bossStarted = true;
    L2.doors.ccih.close();
    if (!W.colliders.includes(gate)) W.colliders.push(gate);
    AUDIO.stop(0.5);
    await runConvo(c => STORY2.belgicaIntro(c), { target: belgica });
    AUDIO.play('fifth', { fade: 0.2 });
    toast('Fuja do OLHAR atrás dos pilares · atire nele e nas SERINGAS · ou, quando o TELEFONE tocar, corra até ele e aperte [E]', 7);
    BOSS.start();
  }
  async function onBossDefeat() {
    G.bossDone = true;
    $('prompt').textContent = '';
    AUDIO.stop(0.4);
    await runConvo(c => STORY2.belgicaDefeat(c), { target: belgica });
    belgica.mesh.visible = false; show('bossbar', false);
    chapterEnd(2);
  }
  function onGel(g) {
    if (g.used) { toast('Dispenser de álcool gel. Vazio. Alguém usou tudo. Provavelmente o Dudu.', 3); return; }
    g.used = true; COMBAT.heal(10); COMBAT.P.infectT = 0; AUDIO.sfx('pickup');
    toast('Álcool gel. Mãos limpas, infecção controlada. (+10, cura a infecção)', 3);
  }

  // ---------- MORTE / CHECKPOINT ----------
  function onDeath() {
    G.state = 'dead';
    document.exitPointerLock && document.exitPointerLock();
    $('dead-msg').textContent = U.pick([
      'Um javali passou por cima de você.\nEm pleno HUSM. Ninguém vai acreditar.',
      'Causa da síncope: javali.\nO Dudu vai querer isso em ordem crescente.',
      'Você virou estatística.\nO residente da noite vai ter que preencher a notificação.',
    ]);
    if (BOSS.active) $('dead-msg').textContent = U.pick([
      'O olhar do Bélgica atravessou sua alma.\nE o seu Lattes.',
      'Seringa contaminada.\nA CCIH vai abrir uma investigação. Sobre você.',
      'Ele nem precisou encostar em você.\nTambém não precisou chegar no horário.',
    ]);
    show('dead'); show('hud', false);
    AUDIO.stop(0.5);
  }
  function respawn() {
    show('dead', false); show('hud');
    COMBAT.resetAfterDeath();
    if (G.bossStarted && !G.bossDone) {
      G.bossStarted = false; BOSS.reset(L2.bossPos);
      const i = W.colliders.indexOf(gate); if (i >= 0) W.colliders.splice(i, 1);
      $('prompt').textContent = '';
    }
    P.pos.copy(G.prof3Done ? L2.checkpoint : (G.hasGun || G.duduDone ? L.checkpoint : W.spawn)); P.yaw = 0; P.pitch = 0;
    G.state = 'play'; G.musicMode = 'explore';
    AUDIO.play('moonlight', { fade: 2 });
    lock(); relockOrPause();
  }

  // ---------- FIM DO CAPÍTULO ----------
  function chapterEnd(n = 1) {
    G.ended = true; G.state = 'end';
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* sem storage */ }
    AUDIO.play('toccata', { fade: 0.2, loop: false });
    document.exitPointerLock && document.exitPointerLock();
    show('hud', false); show('pause', false);
    $('end').innerHTML =
      `<div class="title-sub2">FIM DO CAPÍTULO ${n}</div>` +
      `<div>CEFALEXINA LIBERADA. Registrado em ata.\nJavalis abatidos: ${G.kills}\nDudu ${CONVO.following ? 'ainda te segue' : 'não te segue mais'} no Instagram.\n${G.achievement ? '🏆 Você recebeu um elogio do Clóvis.' : 'O Clóvis não te elogiou. Quase ninguém recebe.'}\n\nA infecção continua no ar...\nCONTINUA</div>` +
      '<div class="small">clique para recomeçar</div>';
    show('end');
  }

  // ---------- SUSTO DO CORREDOR ----------
  function updateScare(dt) {
    if (!G.objective) return;
    if (!G.scare && P.pos.z < -27) { G.scare = 0.0001; AUDIO.sfx('squeak'); }
    if (G.scare > 0 && G.scare < 99) {
      G.scare += dt;
      const s = W.endStretcher;
      const t = U.clamp(G.scare / 2.6, 0, 1);
      s.position.z = -40 + 2.5 * (1 - Math.pow(1 - t, 2));
      const [hx, hz] = s.userData.h, col = s.userData.col;
      col.z1 = s.position.z - hz; col.z2 = s.position.z + hz;
      if (G.scare > 3.6 && !G.banged) { G.banged = true; AUDIO.sfx('bang'); toast('...', 2); }
      if (G.scare > 6) G.scare = 99;
    }
  }

  // ---------- GATILHOS DO CAPÍTULO 1 ----------
  const inZone = (z, p = P.pos) => p.x > z.x1 && p.x < z.x2 && p.z > z.z1 && p.z < z.z2;
  function updateChapter(dt) {
    if (G.objective && !G.duduStarted && inZone(L.zoneEndo)) startDudu();
    if (G.duduDone && !G.prof3Started && inZone(L.zoneProf3)) startProf3();
    if (G.prof3Done && !G.clovisStarted && inZone(L2.zoneClovis)) startClovis();
    if (G.clovisDone && !G.bossStarted && !G.bossDone && inZone(L2.zoneArena)) startBoss();
    // Ala C: a porta do Professor3 só abre sem nenhum javali vivo
    if (G.hasGun || G.duduDone) {
      const n = wardLeft();
      if (n !== G.wardLeft) {
        G.wardLeft = n;
        if (G.hasGun && !G.prof3Done) setObjective(objectiveText());
        if (n === 0 && L.doors.prof3.locked) {
          L.doors.prof3.locked = false;
          toast('Silêncio na Ala C. Lá do fundo, uma porta destranca.', 4);
          AUDIO.sfx('door');
        }
      }
    }
    // café
    for (const c of allCafes()) {
      if (c.taken) continue;
      c.cup.rotation.y += dt;
      if (Math.hypot(c.x - P.pos.x, c.z - P.pos.z) < 0.9) {
        if (COMBAT.P.hp >= COMBAT.P.maxHp && COMBAT.P.infectT <= 0) { if (!c.warned) { toast('Café da copa. Você está bem por enquanto. Guarda pra depois.', 2.5); c.warned = true; } continue; }
        c.taken = true; c.cup.visible = false; COMBAT.heal(30); COMBAT.P.infectT = 0; AUDIO.sfx('pickup'); save(true);
        toast(U.pick(['Café da copa. Frio. Amargo. Perfeito. (+30)', 'Café passado às 6h da manhã. Ainda funciona. (+30)', 'Café com um gosto leve de micro-ondas de peixe. (+30)']), 3);
      }
    }
    // grunhidos atrás da porta da Ala C
    if (!L.doors.alaC.open && P.pos.z < -55) {
      G.wardGruntT -= dt;
      if (G.wardGruntT <= 0) { G.wardGruntT = 3 + Math.random() * 5; AUDIO.sfx('grunt', U.clamp(1 - Math.abs(P.pos.z + 65) / 20, 0.1, 0.7)); }
    }
  }

  function updateDoors(dt) {
    for (const d of allDoors()) {
      if (!d.open || d.t >= 1) continue;
      d.t = Math.min(1, d.t + dt * 1.4);
      d.mesh.position.copy(d.base).addScaledVector(d.slide, d.t);
    }
  }

  function updateMusic() {
    if (G.state !== 'play' || !G.duduDone || BOSS.active || G.bossDone) return;
    if (COMBAT.alerted && G.musicMode !== 'combat') { G.musicMode = 'combat'; AUDIO.play('summer', { fade: 0.3 }); }
    else if (!COMBAT.alerted && G.musicMode === 'combat' && COMBAT.sinceAlert > 6) { G.musicMode = 'explore'; AUDIO.play('moonlight', { fade: 3 }); }
  }

  // ---------- PROFESSOR DO SAGUÃO ----------
  function updateProf(dt) {
    if (G.state === 'dialogue') {
      const dx = P.pos.x - prof.position.x, dz = P.pos.z - prof.position.z, d = Math.hypot(dx, dz);
      if (d > 1.9) { prof.position.x += dx / d * 2.2 * dt; prof.position.z += dz / d * 2.2 * dt; }
    } else if (G.profTarget) {
      const dx = G.profTarget.x - prof.position.x, dz = G.profTarget.z - prof.position.z, d = Math.hypot(dx, dz);
      if (d > 0.1) { prof.position.x += dx / d * 1.1 * dt; prof.position.z += dz / d * 1.1 * dt; }
    }
    profNPC.face();

    let frame = 0;
    const tt = G.time;
    if (DIALOGUE.talking) frame = Math.floor(tt * 9) % 2 ? 1 : (Math.floor(tt * 1.7) % 3 === 0 ? 2 : 0);
    else if (G.objective) frame = Math.floor(tt * 4) % 3 === 0 ? 1 : (Math.floor(tt * 0.8) % 2 ? 2 : 0);
    profNPC.setFrame(frame);
    prof.position.y = 0.9 + (DIALOGUE.talking ? Math.abs(Math.sin(tt * 14)) * 0.03 : 0);

    const th = prof.rotation.y;
    lantern.position.set(
      prof.position.x - Math.cos(th) * 0.33 + Math.sin(th) * 0.2,
      0.5,
      prof.position.z + Math.sin(th) * 0.33 + Math.cos(th) * 0.2);
    lantern.intensity = 1.35 + Math.sin(tt * 23) * 0.08 + (Math.random() < 0.03 ? -0.5 : 0);

    const idx = W.colliders.indexOf(profCol);
    const still = G.state !== 'dialogue' && (!G.profTarget || Math.hypot(G.profTarget.x - prof.position.x, G.profTarget.z - prof.position.z) <= 0.1);
    const far = Math.hypot(P.pos.x - prof.position.x, P.pos.z - prof.position.z) > 0.8;
    if (still && far) {
      Object.assign(profCol, { x1: prof.position.x - 0.3, x2: prof.position.x + 0.3, z1: prof.position.z - 0.3, z2: prof.position.z + 0.3 });
      if (idx < 0) W.colliders.push(profCol);
    } else if (idx >= 0) W.colliders.splice(idx, 1);

    if (G.objective && G.state === 'play') {
      G.mutterT -= dt;
      const d = Math.hypot(P.pos.x - prof.position.x, P.pos.z - prof.position.z);
      if (G.mutterT <= 0 && d < 9) { subtitle('PROFESSOR (para o bebedouro): ' + U.pick(DIALOGUE.MUTTER)); G.mutterT = 6; }
    }

    // Dudu, Professor3, Clóvis e o Bélgica (na luta, o BOSS controla os quadros dele)
    for (const n of npcs) {
      n.face();
      if (n === belgica && BOSS.active) continue;
      const speaking = CONVO.talking && CONVO.speakerChar === n.id;
      n.setFrame(speaking ? Math.floor(tt * 7) % 2 : 0);
    }
  }

  // ---------- LUZES DE EMERGÊNCIA ----------
  function updateLights(dt) {
    const [a, b] = W.red;
    const blink = (Math.sin(G.time * 2.2) > -0.2) ? 1 : 0.15;
    a.intensity = 0.9 * blink; a.userData.bulb.visible = blink > 0.5;
    let bi = 1.0 * ((Math.sin(G.time * 1.7 + 1) > -0.3) ? 1 : 0.2);
    if (G.scare > 0 && G.scare < 99) bi = G.scare < 1.5 ? (Math.random() < 0.5 ? 1 : 0) : (G.scare < 4.5 ? 0 : bi);
    b.intensity = bi; b.userData.bulb.visible = bi > 0.5;
    allLights().forEach((l, i) => {
      const on = Math.sin(G.time * (1.3 + i * 0.4) + i * 2) > -0.4 ? 1 : 0.1;
      l.intensity = on * (i >= L.lights.length ? 0.8 : 1); l.userData.bulb.visible = on > 0.5;
    });
  }

  // ---------- LOOP ----------
  let last = performance.now();
  function frame(now) {
    const dt = U.clamp((now - last) / 1000, 0, 0.05); last = now;
    G.time += dt;
    P.moving = false;

    if (G.state === 'play' && !G.paused) {
      let fx = 0, fz = 0;
      if (keys.KeyW || keys.ArrowUp) fz -= 1;
      if (keys.KeyS || keys.ArrowDown) fz += 1;
      if (keys.KeyA || keys.ArrowLeft) fx -= 1;
      if (keys.KeyD || keys.ArrowRight) fx += 1;
      const run = keys.ShiftLeft || keys.ShiftRight;
      const len = Math.hypot(fx, fz);
      if (len > 0) {
        const sp = (run ? 5.2 : 3.0) * dt / len;
        const s = Math.sin(P.yaw), c = Math.cos(P.yaw);
        move((fx * c + fz * s) * sp, (-fx * s + fz * c) * sp);
        P.bob += dt * (run ? 13 : 9); P.moving = true;
        P.stepAcc += dt * (run ? 5.2 : 3.0);
        if (P.stepAcc > (run ? 0.85 : 0.7)) { P.stepAcc = 0; AUDIO.sfx('step', run); }
      }
      if (!G.met && P.pos.z < -1.2) startTalk();
      updateScare(dt);
      updateChapter(dt);
      updateMusic();
      updateLook();
      if ((G.saveT = (G.saveT || 20) - dt) <= 0) { G.saveT = 20; if (!COMBAT.alerted && !BOSS.active) save(true); }
    }

    // câmera puxada para quem está falando
    const target = G.state === 'dialogue' ? prof : (G.state === 'convo' && G.convoTarget ? G.convoTarget.mesh : null);
    if (target) {
      const dx = target.position.x - P.pos.x, dz = target.position.z - P.pos.z;
      const headY = target === prof ? 1.55 : (G.convoTarget.h - 0.25);
      P.yaw = U.angleLerp(P.yaw, Math.atan2(-dx, -dz), Math.min(1, dt * 4));
      P.pitch = U.lerp(P.pitch, Math.atan2(headY - 1.62, Math.hypot(dx, dz)), Math.min(1, dt * 4));
    }

    if (G.state === 'title' || G.state === 'boot' || G.state === 'intro') {
      P.yaw = Math.sin(G.time * 0.1) * 0.15; P.pitch = 0.12;
    }

    DIALOGUE.update(dt, G.time);
    CONVO.update(dt, G.time);
    COMBAT.update(dt, G.state === 'play' && !G.paused, P.bob, P.moving);
    if (G.state === 'play' && !G.paused) BOSS.update(dt);
    // efeitos de tela: olhar psíquico, clarão do teletransporte, infecção
    if (G.psyT > 0) G.psyT -= dt;
    if (G.flashT > 0) G.flashT -= dt;
    $('psy').style.opacity = G.psyT > 0 ? 0.55 + Math.sin(G.time * 30) * 0.15 : 0;
    $('flash').style.opacity = G.flashT > 0 ? G.flashT * 2.4 : 0;
    $('infect').style.opacity = COMBAT.P.infectT > 0 ? 0.35 + Math.sin(G.time * 5) * 0.1 : 0;
    updateProf(dt);
    updateDoors(dt);
    W.update(dt, P.pos, G.state === 'play' && !G.paused);
    updateLights(dt);
    TOUCH.update();

    camera.position.set(P.pos.x, 1.62 + Math.sin(P.bob) * 0.035, P.pos.z);
    camera.rotation.set(P.pitch, P.yaw, 0);

    if (toastT > 0 && (toastT -= dt) <= 0) $('toast').classList.remove('show');
    if (subT > 0 && (subT -= dt) <= 0) $('subtitle').classList.remove('show');
    if (notifyT > 0 && (notifyT -= dt) <= 0) $('notify').classList.remove('show');

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  DIALOGUE.init();
  CONVO.init(notify);
  TOUCH.init({
    state: () => G.state, paused: () => G.paused,
    look: (dx, dy) => { if (G.state !== 'play' || G.paused) return; P.yaw -= dx * 0.0055; P.pitch = U.clamp(P.pitch - dy * 0.0055, -1.35, 1.35); },
    fire: () => { if (G.state === 'play' && !G.paused) COMBAT.fire(); },
    pause: () => { if (G.state === 'play') { G.paused = true; show('pause'); } },
  });

  // modo de desenvolvimento: index.html#dev=x,z,yaw[,pPITCH][,estágio] pula as telas (sem áudio)
  //   talk = abre a conversa do saguão · met = depois do saguão · dudu = depois do Dudu (bisturi) · gun = com revólver
  //   prof3 = depois do Javali (Ala C limpa) · clovis = depois do Clóvis (CCIH liberada)
  const dev = location.hash.match(/^#dev=([-\d.]+),([-\d.]+),([-\d.]+)(?:,p([-\d.]+))?(,talk|,met|,dudu|,gun|,prof3|,clovis)?/);
  if (dev) {
    G.dev = true;
    window.__game = { P, G, BOSS, COMBAT, CONVO, bossMesh: belgica.mesh };   // só no modo dev, para testes automáticos
    ['boot', 'title'].forEach(id => show(id, false));
    show('hud'); G.state = 'play';
    P.pos.set(+dev[1], 0, +dev[2]); P.yaw = +dev[3]; P.pitch = +(dev[4] || 0);
    setObjective('[DEV]');
    const stage = dev[5];
    if (stage === ',talk') startTalk();
    if (stage && stage !== ',talk') { G.met = G.objective = true; G.profTarget = W.profIdle.clone(); }
    const later = [',prof3', ',clovis'].includes(stage);
    if (stage === ',dudu' || stage === ',gun' || later) {
      G.duduStarted = G.duduDone = true; COMBAT.give('scalpel');
      for (const k in L.doors) L.doors[k].locked = false;
    }
    if (stage === ',gun' || later) { G.hasGun = true; L.gunTaken = true; COMBAT.give('revolver'); }
    if (later) {
      G.prof3Started = G.prof3Done = true; moveProf3Aside();
      COMBAT.boars.forEach((b, i) => COMBAT.killSilently(i));
    }
    if (stage === ',clovis') { G.clovisStarted = G.clovisDone = true; for (const k in L2.doors) L2.doors[k].locked = false; }
  }
  requestAnimationFrame(frame);
})();

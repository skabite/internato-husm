// MOTOR: desenho, controles, câmera, telas (título, pausa, morte, fim), conversas, itens de cura e o laço principal.
// Não sabe nada da história: quem decide o que acontece são os capítulos (js/capitulos/), pelos ganchos do GAME.
(() => {
  const $ = id => document.getElementById(id);
  const canvas = $('game');
  const G = GAME.G;

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
  GAME.scene = scene; GAME.camera = camera;

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
  function show(id, on = true) { $(id).classList.toggle('hidden', !on); }
  function setTalking(on) { document.body.classList.toggle('talking', on); if (on) $('hint').textContent = ''; }
  const refreshObjective = () => { $('objective').textContent = GAME.ask('objective') || ''; };
  Object.assign(GAME, { toast, subtitle, notify, setTalking, refreshObjective, prompt: t => { $('prompt').textContent = t; } });
  BUILD.toast = toast;

  // ---------- MAPA: monta as áreas registradas (js/mapa/), na ordem do index.html ----------
  const ctx = { scene, toast, emit: GAME.emit, stretcher: WORLD.stretcher, get M() { return WORLD.M; }, get TOP() { return GAME.W.TOP; } };
  for (const a of GAME.areas) GAME[a.id] = a.build(scene, ctx);
  const W = GAME.W;

  // ---------- LANTERNA ----------
  const flashlight = new THREE.SpotLight(0xfff0d0, 2.4, 26, 0.5, 0.55, 1.5);
  flashlight.position.set(0.15, -0.15, 0);
  flashlight.target.position.set(0, -0.05, -1);
  camera.add(flashlight); camera.add(flashlight.target);
  const eyeLight = new THREE.PointLight(0x5a6478, 0.35, 6, 2);
  camera.add(eyeLight);

  // ---------- JOGADOR E COLISÃO ----------
  const P = { pos: W.spawn.clone(), yaw: 0, pitch: 0, bob: 0, stepAcc: 0, moving: false };
  GAME.P = P;
  const R = 0.3;
  function wallBlocked(x, z, r = R) {
    for (const b of WORLD.colliders) if (x + r > b.x1 && x - r < b.x2 && z + r > b.z1 && z - r < b.z2) return true;
    return false;
  }
  function blocked(x, z) { return wallBlocked(x, z) || COMBAT.blocks(x, z, R); }
  function move(dx, dz) {
    if (!blocked(P.pos.x + dx, P.pos.z)) P.pos.x += dx;
    if (!blocked(P.pos.x, P.pos.z + dz)) P.pos.z += dz;
  }
  GAME.wallBlocked = wallBlocked;

  // ---------- COMBATE ----------
  COMBAT.init(scene, camera, {
    colliders: WORLD.colliders, blocked: wallBlocked, pos: () => P.pos, yaw: () => P.yaw,
    push: (dx, dz) => { move(dx * 0.5, dz * 0.5); move(dx * 0.5, dz * 0.5); },
    onDeath: () => die(), onKill: () => { G.kills++; }, targets: () => GAME.collect('targets'),
    onDodge: () => toast('Esquivou! ⚡', 0.9),
  });
  // efeitos de tela que os capítulos usam
  let psyT = 0, flashT = 0;
  GAME.fx = { psychic: () => { psyT = 0.25; }, flash: col => { $('flash').style.background = col; flashT = 0.25; } };

  // ---------- AURAS (itens de cura e objetos de usar; personagens ganham a sua no GAME.npc) ----------
  AURA.init(scene);
  for (const c of BUILD.pickups) AURA.add({ at: c.cup.getWorldPosition(new THREE.Vector3()).setY(c.cup.position.y + 0.1), color: 0x5cff8a, w: 1.1, opacity: 0.9, ring: 0.45, visible: () => !c.taken });
  for (const m of WORLD.interactables) {
    if (!m.userData.onUse || m.userData.verb === 'abrir') continue;          // portas não brilham (seriam muitas)
    AURA.addObject(m, { color: 0xffc050, opacity: 0.45, visible: m.userData.auraVisible });
  }

  // ---------- CAPÍTULOS ----------
  GAME.each('init');

  // ---------- ENTRADA ----------
  const keys = {};
  addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyP') { resIdx = (resIdx + 1) % RES.length; resize(); toast(`Resolução interna: ${RES[resIdx]} linhas`, 1.5); }
    if (e.code === 'KeyM') toast(AUDIO.toggleMusic() ? 'Música: ligada' : 'Música: desligada', 1.5);
    if (G.state !== 'play' || G.paused) return;
    if (e.code === 'KeyF') { flashlight.visible = !flashlight.visible; AUDIO.sfx('click'); }
    if (e.code === 'KeyE' && GAME.any('interceptUse')) return;
    if (e.code === 'KeyE' && lookTarget) {
      if (lookTarget.userData.onUse) lookTarget.userData.onUse();
      else toast(lookTarget.userData.msg, 5);
    }
    if (e.code === 'Digit1') COMBAT.select('scalpel');
    if (e.code === 'Digit2') COMBAT.select('revolver');
    if (e.code === 'Digit3') COMBAT.select('carabina');
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
  GAME.relockOrPause = relockOrPause;

  // ---------- SAVE ----------
  GAME.save = (quiet = false) => { if (SAVE.write() && !quiet && toastT <= 0) toast('💾 Jogo salvo', 1.5); };
  function continueGame() {
    const s = SAVE.read(); if (!s) return startNew();
    show('title', false);
    AUDIO.stop(0.8);
    lock();
    SAVE.apply(s);
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
    const s = SAVE.read();
    show('title-save', !!s); show('title-new', !s);
    if (s) $('save-info').textContent = `salvo em ${new Date(s.date).toLocaleString('pt-BR')} · ${SAVE.label(s)}`;
    G.state = 'title';
  };
  $('title').onclick = () => { if (!SAVE.read()) startNew(); };
  $('btn-continue').onclick = e => { e.stopPropagation(); continueGame(); };
  $('btn-new').onclick = e => {
    e.stopPropagation();
    if (!confirm('Começar um jogo novo? O save atual será apagado.')) return;
    SAVE.clear();
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
      refreshObjective();
      AUDIO.play('moonlight', { fade: 3 });
      relockOrPause();
    }, 6000);
  }
  $('pause').onclick = () => { if (TOUCH.on) { G.paused = false; show('pause', false); } else lock(); };
  $('end').onclick = () => location.reload();
  $('dead').onclick = () => respawn();

  // letreiro de capítulo (devolve uma promise que acaba quando ele some). secs: tempo no ar, contando o 1,2 s do esmaecer
  GAME.titleCard = (text, secs = 3.8) => {
    const el = $('intro'); el.textContent = text; el.style.opacity = 1; el.style.background = '#000c'; show('intro');
    el.classList.toggle('long', text.split('\n').length > 6);          // resumo comprido: letra menor, senão sai da tela
    setTimeout(() => { el.style.opacity = 0; }, (secs - 1.2) * 1000);
    return new Promise(res => setTimeout(() => { show('intro', false); el.style.background = ''; el.classList.remove('long'); res(); }, secs * 1000));
  };
  // viagem com a tela preta (escadas): texto, passos, e o jogador aparece em `to`, olhando pra `yaw`
  GAME.travel = (text, to, yaw) => {
    if (G.state !== 'play') return;
    G.state = 'travel';
    const el = $('intro'); el.textContent = text; el.style.opacity = 1; el.style.background = '#000'; show('intro');
    for (let k = 0; k < 6; k++) setTimeout(() => AUDIO.sfx('step', false), 200 + k * 260);
    setTimeout(() => { P.pos.copy(to); P.yaw = yaw; P.pitch = 0; }, 900);
    setTimeout(() => { el.style.opacity = 0; }, 1900);
    setTimeout(() => { show('intro', false); el.style.background = ''; G.state = 'play'; relockOrPause(); GAME.save(true); }, 2900);
  };
  // fim de capítulo: apaga o save e mostra o resumo (o texto é do capítulo)
  GAME.end = (n, text) => {
    G.ended = true; G.state = 'end';
    SAVE.clear();
    AUDIO.play('toccata', { fade: 0.2, loop: false });
    document.exitPointerLock && document.exitPointerLock();
    show('hud', false); show('pause', false);
    $('end').innerHTML = `<div class="title-sub2">FIM DO CAPÍTULO ${n}</div><div>${text}</div><div class="small">clique para recomeçar</div>`;
    $('end').classList.toggle('long', text.split('\n').length > 7);    // resumo comprido: letra menor, senão sai da tela
    show('end');
  };

  // ---------- EXAMINAR ([E] no que está na mira) ----------
  const ray = new THREE.Raycaster(); ray.far = 2.6;
  let lookTarget = null, rayFrame = 0;
  function updateLook() {
    if (++rayFrame % 4) return;
    ray.setFromCamera({ x: 0, y: 0 }, camera);
    lookTarget = null;
    for (const h of ray.intersectObjects(scene.children, true)) {
      if (GAME.skipRay.has(h.object) || COMBAT.boars.some(b => b.mesh === h.object)) continue;
      if (h.object.userData.msg || h.object.userData.onUse) lookTarget = h.object;
      break;
    }
    AURA.setFocus(lookTarget);
    const verb = lookTarget && lookTarget.userData.verb;
    $('hint').textContent = lookTarget ? `${TOUCH.on ? '' : '[E] '}${verb || 'examinar'}` : '';
  }

  // ---------- CONVERSAS ROTEIRIZADAS ----------
  // GAME.runConvo(c => STORY.x(c), { target: npc, instagram, meter, chain }) — chain: emenda em outra cena sem pausar no meio
  GAME.runConvo = async (script, opts = {}) => {
    G.state = 'convo'; G.convoTarget = opts.target || null;
    setTalking(true);
    try { await CONVO.run(script, opts); }
    finally {
      setTalking(false);
      G.state = 'play'; G.convoTarget = null;
      if (!opts.chain) relockOrPause();
    }
  };

  // ---------- MORTE ----------
  const DEATH_DEFAULT = ['Você desmaiou.\nO residente da noite vai ter que preencher a notificação.'];
  function die() {
    G.state = 'dead';
    document.exitPointerLock && document.exitPointerLock();
    $('dead-msg').textContent = U.pick(GAME.ask('deathLines') || DEATH_DEFAULT);
    show('dead'); show('hud', false);
    AUDIO.stop(0.5);
  }
  GAME.die = die;
  function respawn() {
    show('dead', false); show('hud');
    COMBAT.resetAfterDeath();
    $('prompt').textContent = '';
    GAME.each('onRespawn');
    P.pos.copy(GAME.ask('checkpoint') || W.spawn); P.yaw = 0; P.pitch = 0;
    G.state = 'play'; G.musicMode = 'explore';
    AUDIO.play('moonlight', { fade: 2 });
    lock(); relockOrPause();
  }

  // ---------- ITENS DE CURA: pega sozinho ao passar perto, se estiver ferido (ou infectado) ----------
  function updatePickups(dt) {
    for (const c of BUILD.pickups) {
      if (c.taken) continue;
      c.cup.rotation.y += dt;
      if (Math.hypot(c.x - P.pos.x, c.z - P.pos.z) >= 0.9) continue;
      const needCure = c.cure !== false && COMBAT.P.infectT > 0;
      if (COMBAT.P.hp >= COMBAT.P.maxHp && !needCure) { if (!c.warned) { toast(c.full || 'Café da copa. Você está bem por enquanto. Guarda pra depois.', 2.5); c.warned = true; } continue; }
      c.taken = true; c.cup.visible = false; COMBAT.heal(c.heal || 30); if (c.cure !== false) COMBAT.P.infectT = 0; AUDIO.sfx('pickup'); GAME.save(true);
      toast(U.pick(c.msgs || ['Café da copa. Frio. Amargo. Perfeito. (+30)', 'Café passado às 6h da manhã. Ainda funciona. (+30)', 'Café com um gosto leve de micro-ondas de peixe. (+30)']), 3);
    }
  }

  // ---------- LAÇO ----------
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
      GAME.each('update', dt);
      updatePickups(dt);
      updateLook();
      if ((G.saveT = (G.saveT || 20) - dt) <= 0) { G.saveT = 20; if (!COMBAT.alerted) GAME.save(true); }
    }

    // câmera puxada para quem está falando
    const target = (G.state === 'dialogue' || G.state === 'convo') && G.convoTarget;
    if (target) {
      const dx = target.mesh.position.x - P.pos.x, dz = target.mesh.position.z - P.pos.z;
      P.yaw = U.angleLerp(P.yaw, Math.atan2(-dx, -dz), Math.min(1, dt * 4));
      P.pitch = U.lerp(P.pitch, Math.atan2(target.head - 1.62, Math.hypot(dx, dz)), Math.min(1, dt * 4));
    }
    if (G.state === 'title' || G.state === 'boot' || G.state === 'intro') {
      P.yaw = Math.sin(G.time * 0.1) * 0.15; P.pitch = 0.12;
    }

    DIALOGUE.update(dt * (G.textSpeed || 1), G.time);      // textSpeed: só os testes aceleram o texto
    CONVO.update(dt * (G.textSpeed || 1), G.time);
    COMBAT.update(dt, G.state === 'play' && !G.paused, P.bob, P.moving);
    // efeitos de tela: olhar psíquico, clarão, infecção
    if (psyT > 0) psyT -= dt;
    if (flashT > 0) flashT -= dt;
    $('psy').style.opacity = psyT > 0 ? 0.55 + Math.sin(G.time * 30) * 0.15 : 0;
    $('flash').style.opacity = flashT > 0 ? flashT * 2.4 : 0;
    $('infect').style.opacity = COMBAT.P.infectT > 0 ? 0.35 + Math.sin(G.time * 5) * 0.1 : 0;
    GAME.updateNpcs(G.time);
    GAME.each('frame', dt, G.time);
    BUILD.update(dt, G.time);
    for (const a of GAME.areas) { const area = GAME[a.id]; if (area.update) area.update(dt, P.pos, G.state === 'play' && !G.paused); }
    TOUCH.update(dt);
    if (G.state !== 'play') AURA.setFocus(null);
    AURA.update(G.time, camera);

    camera.position.set(P.pos.x, 1.62 + Math.sin(P.bob) * 0.035, P.pos.z);
    camera.rotation.set(P.pitch, P.yaw, 0);

    if (toastT > 0 && (toastT -= dt) <= 0) $('toast').classList.remove('show');
    if (subT > 0 && (subT -= dt) <= 0) $('subtitle').classList.remove('show');
    if (notifyT > 0 && (notifyT -= dt) <= 0) $('notify').classList.remove('show');

    if (G.noRender) scene.updateMatrixWorld(); else renderer.render(scene, camera);   // noRender: testes automáticos
    requestAnimationFrame(frame);
  }

  DIALOGUE.init();
  CONVO.init(notify);
  TOUCH.init({
    state: () => G.state, paused: () => G.paused,
    look: (dx, dy) => { if (G.state !== 'play' || G.paused) return; P.yaw -= dx * 0.0055; P.pitch = U.clamp(P.pitch - dy * 0.0055, -1.35, 1.35); },
    fire: () => { if (G.state === 'play' && !G.paused) COMBAT.fire(); },
    pause: () => { if (G.state === 'play') { G.paused = true; show('pause'); } },
    player: () => P, toast,
  });

  // ---------- MODO DEV: index.html#dev=x,z,yaw[,pPITCH][,estágio][,touch] ----------
  // Pula as telas (sem áudio), põe o jogador em (x, z) olhando pra yaw e aplica o estágio. Cada capítulo declara os seus
  // em dev: { nome: { save: {...}, then() } }; o estágio vale junto com todos os anteriores (um save parcial acumulado).
  // Estágios hoje: talk · met · liberato · gun · javali · debarros · ch3 · leito · rx · ps (ver README).
  const dev = location.hash.match(/^#dev=([-\d.]+),([-\d.]+),([-\d.]+)(?:,p([-\d.]+))?(?:,([a-z0-9]+))?/);
  if (dev) {
    G.dev = true;
    window.__game = { GAME, P, G, BOSS, COMBAT, CONVO, SAVE, BUILD, W, L1: GAME.L1, L2: GAME.L2, L3: GAME.L3, pickups: BUILD.pickups, doors: BUILD.doors };   // só no modo dev (testes)
    ['boot', 'title'].forEach(id => show(id, false));
    show('hud'); G.state = 'play';
    const stages = GAME.chapters.flatMap(c => Object.entries(c.dev || {}).map(([name, st]) => ({ name, ...st })));
    const k = dev[5] && dev[5] !== 'touch' ? stages.findIndex(st => st.name === dev[5]) : -1;
    if (dev[5] && dev[5] !== 'touch' && k < 0) console.warn('estágio dev desconhecido: ' + dev[5] + ' (existem: ' + stages.map(s => s.name).join(', ') + ')');
    if (k >= 0) SAVE.apply(Object.assign({}, ...stages.slice(0, k + 1).map(st => st.save || {})));
    P.pos.set(+dev[1], 0, +dev[2]); P.yaw = +dev[3]; P.pitch = +(dev[4] || 0);
    refreshObjective();
    if (k >= 0 && stages[k].then) stages[k].then();
  }
  requestAnimationFrame(frame);
})();

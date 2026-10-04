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

  const W = WORLD.build(scene);
  // limites do mapa
  W.colliders.push({ x1: -200, x2: 200, z1: 75, z2: 200 }, { x1: -200, x2: -85, z1: -200, z2: 200 }, { x1: 85, x2: 200, z1: -200, z2: 200 });

  // ---------- LANTERNA ----------
  const flashlight = new THREE.SpotLight(0xfff0d0, 2.4, 26, 0.5, 0.55, 1.5);
  flashlight.position.set(0.15, -0.15, 0);
  flashlight.target.position.set(0, -0.05, -1);
  camera.add(flashlight); camera.add(flashlight.target);
  const eyeLight = new THREE.PointLight(0x5a6478, 0.35, 6, 2);
  camera.add(eyeLight);

  // ---------- PROFESSOR ----------
  const profTex = SPRITES.professorTextures();
  const profMat = new THREE.MeshPhongMaterial({ map: profTex[0], transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, emissive: 0x1a1812 });
  const prof = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.8), profMat);
  prof.position.set(W.profStart.x, 0.9, W.profStart.z);
  scene.add(prof);
  const lantern = new THREE.PointLight(0xffb060, 1.5, 10, 2);
  scene.add(lantern);
  const profCol = { x1: 0, x2: 0, z1: 0, z2: 0 };

  // ---------- ESTADO ----------
  const G = {
    state: 'boot', paused: false, met: false, objective: false, scare: 0, ended: false,
    profTarget: null, mutterT: 3, time: 0,
  };
  const P = { pos: W.spawn.clone(), yaw: 0, pitch: 0, bob: 0, stepAcc: 0 };

  // ---------- HUD ----------
  let toastT = 0, subT = 0;
  function toast(text, secs = 3.5) { $('toast').textContent = text; $('toast').classList.add('show'); toastT = secs; }
  function subtitle(text, secs = 4.5) { $('subtitle').textContent = text; $('subtitle').classList.add('show'); subT = secs; }
  function setObjective(t) { $('objective').textContent = t; }
  function show(id, on = true) { $(id).classList.toggle('hidden', !on); }

  // ---------- ENTRADA ----------
  const keys = {};
  addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyP') { resIdx = (resIdx + 1) % RES.length; resize(); toast(`Resolução interna: ${RES[resIdx]} linhas`, 1.5); }
    if (e.code === 'KeyM') toast(AUDIO.toggleMusic() ? 'Música: ligada' : 'Música: desligada', 1.5);
    if (G.state !== 'play' || G.paused) return;
    if (e.code === 'KeyF') { flashlight.visible = !flashlight.visible; AUDIO.sfx('click'); }
    if (e.code === 'KeyE' && lookTarget) toast(lookTarget.userData.msg, 5);
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  document.addEventListener('mousemove', e => {
    if (document.pointerLockElement !== canvas || G.state !== 'play') return;
    P.yaw -= e.movementX * 0.0022;
    P.pitch = U.clamp(P.pitch - e.movementY * 0.0022, -1.35, 1.35);
  });
  const lock = () => canvas.requestPointerLock && canvas.requestPointerLock();
  document.addEventListener('pointerlockchange', () => {
    const locked = document.pointerLockElement === canvas;
    if (G.state === 'play') { G.paused = !locked; show('pause', !locked); }
  });

  // ---------- TELAS ----------
  $('boot').onclick = () => {
    AUDIO.init();
    AUDIO.play('toccata', { fade: 0.1 });
    show('boot', false); show('title');
    G.state = 'title';
  };
  $('title').onclick = () => {
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
      if (document.pointerLockElement !== canvas) { G.paused = true; show('pause'); }
    }, 6000);
  };
  $('pause').onclick = () => lock();
  $('end').onclick = () => location.reload();

  // ---------- COLISÃO ----------
  const R = 0.3;
  function blocked(x, z) {
    for (const b of W.colliders) if (x + R > b.x1 && x - R < b.x2 && z + R > b.z1 && z - R < b.z2) return true;
    return false;
  }
  function move(dx, dz) {
    if (!blocked(P.pos.x + dx, P.pos.z)) P.pos.x += dx;
    if (!blocked(P.pos.x, P.pos.z + dz)) P.pos.z += dz;
  }

  // ---------- EXAMINAR ----------
  const ray = new THREE.Raycaster(); ray.far = 2.6;
  let lookTarget = null, rayFrame = 0;
  function updateLook() {
    if (++rayFrame % 4) return;
    ray.setFromCamera({ x: 0, y: 0 }, camera);
    lookTarget = null;
    for (const h of ray.intersectObjects(scene.children, true)) {
      if (h.object === prof) continue;
      if (h.object.userData.msg) lookTarget = h.object;
      break;
    }
    $('hint').textContent = lookTarget ? '[E] examinar' : '';
  }

  // ---------- CONVERSA ----------
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
    setObjective('OBJETIVO: Encontrar o PROFESSOR2 (Gastroenterologia)');
    if (kind === 'desmaio') toast('Você "desmaia". Quando abre os olhos, ele está explicando os tomates para o bebedouro.', 6);
    else toast('Você sai andando rápido. Ele não percebe. Continua falando... com o bebedouro.', 6);
    G.profTarget = W.fountain.clone().add(new THREE.Vector3(1.0, 0, 0));
    setTimeout(() => { if (!G.ended) AUDIO.play('moonlight', { fade: 4 }); }, 2500);
    if (document.pointerLockElement !== canvas) { G.paused = true; show('pause'); }
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
    if (P.pos.z < -42.3 && !G.ended) endGame();
  }

  function endGame() {
    G.ended = true; G.state = 'end';
    AUDIO.play('toccata', { fade: 0.2, loop: false });
    document.exitPointerLock && document.exitPointerLock();
    show('hud', false); show('pause', false);
    $('end').innerHTML =
      '<div class="title-sub2">FIM DO PROTÓTIPO</div>' +
      '<div>A porta da manutenção está trancada.\nA chave está com o Professor2.\n\nPróximo: CAPÍTULO 1 — "Procurando o Professor2"</div>' +
      '<div class="small">clique para recomeçar</div>';
    show('end');
  }

  // ---------- PROFESSOR (update) ----------
  function updateProf(dt) {
    // na conversa ele vem até você
    if (G.state === 'dialogue') {
      const dx = P.pos.x - prof.position.x, dz = P.pos.z - prof.position.z, d = Math.hypot(dx, dz);
      if (d > 1.9) { prof.position.x += dx / d * 2.2 * dt; prof.position.z += dz / d * 2.2 * dt; }
    } else if (G.profTarget) {
      const dx = G.profTarget.x - prof.position.x, dz = G.profTarget.z - prof.position.z, d = Math.hypot(dx, dz);
      if (d > 0.1) { prof.position.x += dx / d * 1.1 * dt; prof.position.z += dz / d * 1.1 * dt; }
    }
    prof.rotation.y = Math.atan2(camera.position.x - prof.position.x, camera.position.z - prof.position.z);

    // quadro de animação
    let frame = 0;
    const tt = G.time;
    if (DIALOGUE.talking) frame = Math.floor(tt * 9) % 2 ? 1 : (Math.floor(tt * 1.7) % 3 === 0 ? 2 : 0);
    else if (G.objective) frame = Math.floor(tt * 4) % 3 === 0 ? 1 : (Math.floor(tt * 0.8) % 2 ? 2 : 0);
    if (profMat.map !== profTex[frame]) { profMat.map = profTex[frame]; profMat.needsUpdate = true; }
    prof.position.y = 0.9 + (DIALOGUE.talking ? Math.abs(Math.sin(tt * 14)) * 0.03 : 0);

    // lanterna na mão esquerda
    const th = prof.rotation.y;
    lantern.position.set(
      prof.position.x - Math.cos(th) * 0.33 + Math.sin(th) * 0.2,
      0.5,
      prof.position.z + Math.sin(th) * 0.33 + Math.cos(th) * 0.2);
    lantern.intensity = 1.35 + Math.sin(tt * 23) * 0.08 + (Math.random() < 0.03 ? -0.5 : 0);

    // colisor só quando ele está parado e longe de você
    const idx = W.colliders.indexOf(profCol);
    const still = G.state !== 'dialogue' && (!G.profTarget || Math.hypot(G.profTarget.x - prof.position.x, G.profTarget.z - prof.position.z) <= 0.1);
    const far = Math.hypot(P.pos.x - prof.position.x, P.pos.z - prof.position.z) > 0.8;
    if (still && far) {
      Object.assign(profCol, { x1: prof.position.x - 0.3, x2: prof.position.x + 0.3, z1: prof.position.z - 0.3, z2: prof.position.z + 0.3 });
      if (idx < 0) W.colliders.push(profCol);
    } else if (idx >= 0) W.colliders.splice(idx, 1);

    // depois da conversa ele continua falando sozinho
    if (G.objective && G.state === 'play') {
      G.mutterT -= dt;
      const d = Math.hypot(P.pos.x - prof.position.x, P.pos.z - prof.position.z);
      if (G.mutterT <= 0 && d < 9) { subtitle('PROFESSOR (para o bebedouro): ' + U.pick(DIALOGUE.MUTTER)); G.mutterT = 6; }
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
  }

  // ---------- LOOP ----------
  let last = performance.now();
  function frame(now) {
    const dt = U.clamp((now - last) / 1000, 0, 0.05); last = now;
    G.time += dt;

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
        P.bob += dt * (run ? 13 : 9);
        P.stepAcc += dt * (run ? 5.2 : 3.0);
        if (P.stepAcc > (run ? 0.85 : 0.7)) { P.stepAcc = 0; AUDIO.sfx('step', run); }
      }
      if (!G.met && P.pos.z < -1.2) startTalk();
      updateScare(dt);
      updateLook();
    }

    if (G.state === 'dialogue') {
      // a câmera é puxada para olhar pra ele
      const dx = prof.position.x - P.pos.x, dz = prof.position.z - P.pos.z;
      P.yaw = U.angleLerp(P.yaw, Math.atan2(-dx, -dz), Math.min(1, dt * 4));
      P.pitch = U.lerp(P.pitch, Math.atan2(1.55 - 1.62, Math.hypot(dx, dz)), Math.min(1, dt * 4));
    }

    if (G.state === 'title' || G.state === 'boot' || G.state === 'intro') {
      // câmera de "título": olhando a fachada lá do estacionamento
      P.yaw = Math.sin(G.time * 0.1) * 0.15; P.pitch = 0.12;
    }

    DIALOGUE.update(dt, G.time);
    updateProf(dt);
    updateLights(dt);

    camera.position.set(P.pos.x, 1.62 + Math.sin(P.bob) * 0.035, P.pos.z);
    camera.rotation.set(P.pitch, P.yaw, 0);

    if (toastT > 0 && (toastT -= dt) <= 0) $('toast').classList.remove('show');
    if (subT > 0 && (subT -= dt) <= 0) $('subtitle').classList.remove('show');

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  DIALOGUE.init();

  // modo de desenvolvimento: index.html#dev=x,z,yaw[,talk] pula as telas (sem áudio)
  const dev = location.hash.match(/^#dev=([-\d.]+),([-\d.]+),([-\d.]+)(,talk|,met)?/);
  if (dev) {
    ['boot', 'title'].forEach(id => show(id, false));
    show('hud'); G.state = 'play';
    P.pos.set(+dev[1], 0, +dev[2]); P.yaw = +dev[3];
    setObjective('[DEV]');
    if (dev[4] === ",talk") startTalk();
    if (dev[4] === ",met") { G.met = G.objective = true; G.profTarget = W.fountain.clone().add(new THREE.Vector3(1, 0, 0)); }
  }
  requestAnimationFrame(frame);
})();

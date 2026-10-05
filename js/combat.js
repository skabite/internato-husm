// Combate estilo Doom: bisturi (corpo a corpo), revólver (6 tiros, recarga), javalis com IA simples, café que cura.
// Mira vertical automática, como no Doom original: só a direção horizontal importa.
const COMBAT = (() => {
  let scene, camera, hooks, colliders;
  let tex = null;
  const boars = [];
  const P = { hp: 100, maxHp: 100, weapon: null, has: { scalpel: false, revolver: false }, ammo: 6,
    reload: 0, cd: 0, anim: 0, hurtT: 0, dead: false };
  let muzzle, wcan, wctx, hudEl, hpEl, ammoEl, dmgEl, lastAlert = -99, time = 0;

  // ---------- RAIO 2D contra as caixas de colisão ----------
  function rayWall(x, z, dx, dz, max) {
    let best = max;
    for (const b of colliders) {
      let t0 = 0, t1 = best;
      if (Math.abs(dx) < 1e-9) { if (x < b.x1 || x > b.x2) continue; }
      else { let a = (b.x1 - x) / dx, c = (b.x2 - x) / dx; if (a > c) [a, c] = [c, a]; t0 = Math.max(t0, a); t1 = Math.min(t1, c); }
      if (Math.abs(dz) < 1e-9) { if (z < b.z1 || z > b.z2) continue; }
      else { let a = (b.z1 - z) / dz, c = (b.z2 - z) / dz; if (a > c) [a, c] = [c, a]; t0 = Math.max(t0, a); t1 = Math.min(t1, c); }
      if (t0 <= t1 && t0 < best && t0 > 0) best = t0;
    }
    return best;
  }
  function los(ax, az, bx, bz) {
    const d = Math.hypot(bx - ax, bz - az);
    return rayWall(ax, az, (bx - ax) / d, (bz - az) / d, d) >= d - 0.05;
  }

  // ---------- JAVALIS ----------
  function makeTextures() {
    const T = c => SPRITES.texFrom(c);
    const conv = f => ({ map: T(f.map), emi: T(f.emi) });
    tex = { front: SPRITES.BOAR.front.map(conv), side: SPRITES.BOAR.side.map(conv), dead: conv(SPRITES.BOAR.dead) };
  }
  function spawn(x, z, o = {}) {
    const mat = new THREE.MeshPhongMaterial({ map: tex.front[0].map, emissiveMap: tex.front[0].emi, emissive: 0xffffff,
      transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, shininess: 0 });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    scene.add(mesh);
    const b = { x, z, sx: x, sz: z, hp: 3, state: o.alert ? 'chase' : 'idle', mesh, mat, vx: 0, vz: 0,
      wanderT: Math.random() * 2, atkCd: 0, chargeT: 0, chargeCd: 1, gruntT: 1 + Math.random() * 4, flashT: 0, dirX: 0, dirZ: 1, side: 0, sideT: 0 };
    boars.push(b);
    place(b);
    return b;
  }
  function place(b) {
    const dead = b.state === 'dead';
    // escolher vista: de frente (vindo em sua direção) ou de lado
    const toCam = Math.atan2(camera.position.x - b.x, camera.position.z - b.z);
    b.mesh.rotation.y = toCam;
    const sp = Math.hypot(b.vx, b.vz);
    const fx = sp > 0.05 ? b.vx / sp : b.dirX, fz = sp > 0.05 ? b.vz / sp : b.dirZ;
    const cx = Math.sin(toCam), cz = Math.cos(toCam);
    const facing = fx * cx + fz * cz;              // 1 = vindo direto pra câmera
    const right = fx * Math.cos(toCam) - fz * Math.sin(toCam);
    let set, w, h;
    const step = Math.abs(Math.floor(time * (b.state === 'idle' ? 4 : 9) + b.sx)) % 2;
    if (dead) { set = tex.dead; w = 1.5; h = 0.9; }
    else if (facing > 0.55 || b.state === 'idle' && sp < 0.05) { set = tex.front[b.chargeT > 0 || b.atkFlash > 0 ? 2 : step]; w = 1.1; h = 0.83; }
    else { set = tex.side[b.chargeT > 0 ? 2 : step]; w = 1.5 * (right > 0 ? -1 : 1); h = 0.9; }
    if (b.mat.map !== set.map) { b.mat.map = set.map; b.mat.emissiveMap = set.emi; b.mat.needsUpdate = true; }
    b.mesh.scale.set(w, h, 1);
    b.mesh.position.set(b.x, h / 2 - (dead ? 0.05 : 0), b.z);
    const fl = b.flashT > 0 ? 3 : 1;
    b.mat.color.setRGB(fl, fl, fl);
  }

  function hurtBoar(b, dmg) {
    if (b.state === 'dead') return;
    b.hp -= dmg; b.flashT = 0.1;
    b.state = 'chase';
    const vol = falloff(b);
    if (b.hp <= 0) { b.state = 'dead'; b.vx = b.vz = 0; AUDIO.sfx('squeal', vol); hooks.onKill && hooks.onKill(b); }
    else AUDIO.sfx('grunt', vol);
  }
  function falloff(b) { return U.clamp(1 - Math.hypot(b.x - hooks.pos().x, b.z - hooks.pos().z) / 26, 0.05, 1); }

  function moveBoar(b, dx, dz) {
    const r = 0.42;
    const free = (x, z) => !hooks.blocked(x, z, r, true) && Math.hypot(x - hooks.pos().x, z - hooks.pos().z) > 0.85;
    let moved = false;
    if (free(b.x + dx, b.z)) { b.x += dx; moved = true; }
    if (free(b.x, b.z + dz)) { b.z += dz; moved = true; }
    return moved;
  }

  function updateBoar(b, dt) {
    if (b.flashT > 0) b.flashT -= dt;
    if (b.atkFlash > 0) b.atkFlash -= dt;
    if (b.state === 'dead') { place(b); return; }
    const pp = hooks.pos();
    const dx = pp.x - b.x, dz = pp.z - b.z, d = Math.hypot(dx, dz);
    b.atkCd -= dt; b.chargeCd -= dt;

    // grunhidos
    b.gruntT -= dt;
    if (b.gruntT <= 0) { b.gruntT = (b.state === 'idle' ? 3 : 1.4) + Math.random() * 3; if (d < 26) AUDIO.sfx('grunt', falloff(b) * 0.8); }

    if (b.state === 'idle') {
      if ((d < 14 && los(b.x, b.z, pp.x, pp.z)) || d < 4) { b.state = 'chase'; AUDIO.sfx('grunt', falloff(b)); }
      b.wanderT -= dt;
      if (b.wanderT <= 0) {
        b.wanderT = 1.5 + Math.random() * 3;
        const a = Math.random() * Math.PI * 2, go = Math.random() < 0.6;
        b.vx = go ? Math.sin(a) * 0.8 : 0; b.vz = go ? Math.cos(a) * 0.8 : 0;
      }
      if (!moveBoar(b, b.vx * dt, b.vz * dt)) { b.vx = -b.vx; b.vz = -b.vz; }
    } else {
      // perseguição + investida
      let spd = 3.3, tx = dx / d, tz = dz / d;
      if (b.chargeT > 0) { b.chargeT -= dt; spd = 7; tx = b.dirX; tz = b.dirZ; }
      else if (d < 6 && b.chargeCd <= 0 && los(b.x, b.z, pp.x, pp.z)) {
        b.chargeT = 0.55; b.chargeCd = 2 + Math.random(); b.dirX = tx; b.dirZ = tz; AUDIO.sfx('grunt', falloff(b));
      }
      if (b.sideT > 0) { b.sideT -= dt; const s = b.side; const ox = -tz * s, oz = tx * s; tx = tx * 0.3 + ox; tz = tz * 0.3 + oz; }
      // separação entre javalis
      for (const o of boars) {
        if (o === b || o.state === 'dead') continue;
        const ex = b.x - o.x, ez = b.z - o.z, e = Math.hypot(ex, ez);
        if (e < 1.1 && e > 0.01) { tx += ex / e * 0.8; tz += ez / e * 0.8; }
      }
      const tl = Math.hypot(tx, tz) || 1;
      b.vx = tx / tl * spd; b.vz = tz / tl * spd;
      if (b.chargeT <= 0) { b.dirX = b.vx / spd; b.dirZ = b.vz / spd; }
      if (!moveBoar(b, b.vx * dt, b.vz * dt) && b.sideT <= 0 && d > 1.3) { b.side = Math.random() < 0.5 ? -1 : 1; b.sideT = 0.6; b.chargeT = 0; }
      // ataque
      if (d < 1.25 && b.atkCd <= 0) {
        const dmg = b.chargeT > 0 ? 18 : 11;
        b.atkCd = 1.0; b.chargeT = 0; b.atkFlash = 0.3;
        hooks.push(dx / d * 0.7, dz / d * 0.7);
        damagePlayer(dmg);
      }
      lastAlert = time;
    }
    place(b);
  }

  function damagePlayer(n) {
    if (P.dead) return;
    P.hp = Math.max(0, P.hp - n); P.hurtT = 0.35;
    AUDIO.sfx('hurt');
    if (P.hp <= 0) { P.dead = true; hooks.onDeath(); }
  }

  // ---------- ARMAS ----------
  function fire() {
    if (P.dead || !P.weapon || P.cd > 0 || P.reload > 0) return;
    const pp = hooks.pos(), yaw = hooks.yaw();
    const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
    if (P.weapon === 'scalpel') {
      P.cd = 0.45; P.anim = 0.2;
      let hit = null, best = 2.0;
      for (const b of boars) {
        if (b.state === 'dead') continue;
        const dx = b.x - pp.x, dz = b.z - pp.z, d = Math.hypot(dx, dz);
        if (d < best && (dx * fx + dz * fz) / d > 0.75) { best = d; hit = b; }
      }
      if (hit) { AUDIO.sfx('stab'); hurtBoar(hit, 1); } else AUDIO.sfx('swish');
      return;
    }
    // revólver
    if (P.ammo <= 0) { AUDIO.sfx('dry'); startReload(); return; }
    P.ammo--; P.cd = 0.38; P.anim = 0.12;
    AUDIO.sfx('shot');
    muzzle.intensity = 4;
    const wall = rayWall(pp.x, pp.z, fx, fz, 60);
    let hit = null, best = wall;
    for (const b of boars) {
      if (b.state === 'dead') continue;
      const dx = b.x - pp.x, dz = b.z - pp.z;
      const along = dx * fx + dz * fz;
      if (along <= 0 || along >= best) continue;
      const perp = Math.abs(dx * fz - dz * fx);
      if (perp < 0.55 + along * 0.015) { best = along; hit = b; }
    }
    if (hit) hurtBoar(hit, 2);
    // o barulho acorda os javalis por perto
    for (const b of boars) if (b.state === 'idle' && Math.hypot(b.x - pp.x, b.z - pp.z) < 22) b.state = 'chase';
    if (P.ammo === 0) setTimeout(startReload, 350);
  }
  function startReload() {
    if (P.weapon !== 'revolver' || P.reload > 0 || P.ammo === 6) return;
    P.reload = 1.6; AUDIO.sfx('reload');
  }
  function select(w) {
    if (!P.has[w] || P.weapon === w) return;
    P.weapon = w; P.cd = 0.3; AUDIO.sfx('click');
  }

  // ---------- HUD ----------
  function drawWeapon(bob, moving) {
    wctx.clearRect(0, 0, 96, 72);
    if (!P.weapon || hudEl.classList.contains('hidden')) { wcan.style.display = 'none'; return; }
    wcan.style.display = 'block';
    const frames = SPRITES.WEAPONS[P.weapon];
    const img = frames[P.anim > 0 ? 1 : 0];
    let ox = moving ? Math.sin(bob) * 3 : 0, oy = moving ? Math.abs(Math.cos(bob)) * 3 : 0;
    if (P.reload > 0) oy += 40 * Math.sin(Math.PI * (1 - P.reload / 1.6));
    if (P.weapon === 'revolver' && P.anim > 0) oy += 3;
    wctx.drawImage(img, Math.round(ox), Math.round(oy));
  }
  function drawStats() {
    hpEl.parentElement.style.display = P.has.scalpel ? 'block' : 'none';
    hpEl.textContent = `SAÚDE ${Math.ceil(P.hp)}`;
    hpEl.style.color = P.hp > 60 ? '#e8e2cc' : P.hp > 30 ? '#ffcf5a' : '#ff6a5a';
    ammoEl.textContent = P.weapon === 'revolver' ? `BALAS ${P.ammo}/6${P.reload > 0 ? ' · recarregando' : ''}`
      : P.weapon === 'scalpel' ? 'BISTURI Nº 22' : '';
    dmgEl.style.opacity = P.hurtT > 0 ? P.hurtT * 1.6 : (P.hp < 25 ? 0.15 + Math.sin(time * 4) * 0.08 : 0);
  }

  return {
    P, boars,
    init(sc, cam, h) {
      scene = sc; camera = cam; hooks = h; colliders = h.colliders;
      makeTextures();
      muzzle = new THREE.PointLight(0xffd080, 0, 12, 2); camera.add(muzzle); muzzle.position.set(0, 0, -0.5);
      wcan = document.getElementById('weapon'); hudEl = document.getElementById('hud'); wctx = wcan.getContext('2d');
      hpEl = document.getElementById('hp'); ammoEl = document.getElementById('ammo'); dmgEl = document.getElementById('dmg');
    },
    spawn, fire, select, startReload, rayWall, los,
    give(w) { P.has[w] = true; P.weapon = w; },
    heal(n) { P.hp = Math.min(P.maxHp, P.hp + n); },
    get alerted() { return boars.some(b => b.state !== 'idle' && b.state !== 'dead'); },
    get sinceAlert() { return time - lastAlert; },
    // colisão do jogador com javalis vivos
    blocks(x, z, r) { return boars.some(b => b.state !== 'dead' && Math.hypot(b.x - x, b.z - z) < r + 0.45); },
    resetAfterDeath() {
      P.hp = P.maxHp; P.dead = false; P.hurtT = 0; P.reload = 0; P.ammo = 6;
      for (const b of boars) if (b.state !== 'dead') { b.x = b.sx; b.z = b.sz; b.state = 'idle'; b.vx = b.vz = 0; b.chargeT = 0; b.hp = 3; place(b); }
    },
    update(dt, active, bob, moving) {
      time += dt;
      if (P.cd > 0) P.cd -= dt;
      if (P.anim > 0) P.anim -= dt;
      if (P.hurtT > 0) P.hurtT -= dt;
      if (P.reload > 0) { P.reload -= dt; if (P.reload <= 0) { P.reload = 0; P.ammo = 6; } }
      muzzle.intensity = Math.max(0, muzzle.intensity - dt * 40);
      for (const b of boars) active ? updateBoar(b, dt) : place(b);
      drawWeapon(bob, moving);
      drawStats();
    },
  };
})();

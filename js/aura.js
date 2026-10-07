// Auras: brilho suave (sprites aditivos, sem luz de verdade — barato até no celular).
//  - itens de cura (verde), personagens (cor de cada um), objetos de usar (dourado)
//  - personagens e itens de cura ganham também um anel no chão (aparece em qualquer luz)
//  - um destaque pulsando no objeto que você está olhando ([E] / USAR)
const AURA = (() => {
  let scene = null, tex = null, ringTex = null, focus = null, focusObj = null;
  const items = [];
  const box = new THREE.Box3(), v = new THREE.Vector3(), size = new THREE.Vector3();

  function glowTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.4, 'rgba(255,255,255,0.7)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  function ringTexture() {                                   // anel pixelado (combina com o resto do jogo)
    const c = document.createElement('canvas'); c.width = c.height = 32;
    const g = c.getContext('2d');
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
      const d = Math.hypot(x - 15.5, y - 15.5);
      const a = d > 11 && d < 15 ? 1 : d <= 11 ? 0.18 * (d / 11) : 0;
      if (a) { g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect(x, y, 1, 1); }
    }
    const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
    return t;
  }
  function ring(color, r) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: ringTex, color, transparent: true, opacity: 0.7, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.raycast = () => {};
    scene.add(m);
    return m;
  }
  function sprite(color, opacity) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity,
      blending: THREE.AdditiveBlending, depthWrite: false }));
    s.raycast = () => {};                                    // o brilho não bloqueia o [E]
    scene.add(s);
    return s;
  }
  // centro e tamanho do objeto no mundo; painéis (placas, gavetas) ganham um empurrãozinho pra frente
  function measure(obj) {
    obj.updateWorldMatrix(true, false);
    box.setFromObject(obj); box.getCenter(v); box.getSize(size);
    if (obj.geometry && obj.geometry.type === 'PlaneGeometry') {
      const n = new THREE.Vector3(0, 0, 1).transformDirection(obj.matrixWorld); v.addScaledVector(n, 0.12);
    }
    return { pos: v.clone(), size: Math.max(size.x, size.y, size.z) };
  }

  return {
    init(sc) {
      scene = sc; tex = glowTexture(); ringTex = ringTexture();
      focus = sprite(0xfff0b8, 0); focus.visible = false;
    },
    // o: { at: Vector3 | follow: () => Vector3, color, w, h, opacity, visible: () => bool, behind: metros atrás (personagens), ring: raio do anel no chão }
    add(o) { items.push(Object.assign({ s: sprite(o.color, o.opacity), r: o.ring ? ring(o.color, o.ring) : null, ph: Math.random() * 6, h: o.h || o.w }, o)); },
    addObject(obj, o) { const m = measure(obj); this.add(Object.assign({ at: m.pos, w: U.clamp(m.size * 1.2, 0.8, 2.4) }, o)); },
    setFocus(obj) {
      if (obj === focusObj) return;
      focusObj = obj;
      if (!obj) { focus.visible = false; return; }
      const m = measure(obj);
      focus.position.copy(m.pos); focus.userData.w = U.clamp(m.size * 0.9, 0.6, 1.8); focus.visible = true;
    },
    update(t, camera) {
      for (const a of items) {
        const vis = a.visible ? a.visible() : true;
        a.s.visible = vis; if (a.r) a.r.visible = vis; if (!vis) continue;
        a.s.position.copy(a.follow ? a.follow() : a.at);
        if (a.r) { a.r.position.set(a.s.position.x, 0.04, a.s.position.z); a.r.material.opacity = 0.55 + 0.25 * Math.sin(t * 2.2 + a.ph); }
        if (a.behind) a.s.position.add(v.subVectors(a.s.position, camera.position).setY(0).normalize().multiplyScalar(a.behind));
        const k = 1 + Math.sin(t * 2.2 + a.ph) * 0.1;
        a.s.scale.set(a.w * k, a.h * k, 1);
        a.s.material.opacity = a.opacity * (0.75 + 0.25 * Math.sin(t * 2.2 + a.ph));
      }
      if (focus.visible) {
        const k = 1 + Math.sin(t * 6) * 0.15;
        focus.scale.set(focus.userData.w * k, focus.userData.w * k, 1);
        focus.material.opacity = 0.45 + Math.sin(t * 6) * 0.12;
      }
    },
  };
})();

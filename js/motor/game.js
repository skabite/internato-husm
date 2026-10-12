// GAME: o "hub" que liga o motor (js/main.js) aos capítulos (js/capitulos/).
//
// Cada capítulo é um arquivo que chama GAME.chapter({...}) com os ganchos que quiser (todos opcionais):
//   id                    nome curto (aparece em erros)
//   init()                criar personagens (GAME.npc), ligar coisas do mapa. Roda uma vez, com o mundo pronto.
//   update(dt)            gatilhos. Só roda com o jogo andando (state 'play', sem pausa).
//   frame(dt, t)          animação que roda sempre (luzes, personagem andando...).
//   save(s) / load(s)     escrever/ler os campos deste capítulo no save (js/motor/save.js). load roda na ordem do index.html.
//   objective()           texto do objetivo se este capítulo é o atual; null se não. Vale o ÚLTIMO capítulo que responder.
//   checkpoint()          onde renascer depois de morrer (idem: vale o último)
//   deathLines()          frases da tela de morte (idem)
//   saveLabel(s)          "depois do Javali" na tela de título (idem)
//   blockSave()           true = não salvar agora (ex.: no meio da luta)
//   interceptUse()        true = o [E] foi usado aqui (ex.: entregar documento pro chefe)
//   targets()             alvos extras do tiro além dos javalis (ex.: o chefe e as seringas)
//   onRespawn()           depois de morrer
//   on: { evento(...) }   eventos do mapa ou de outro capítulo: GAME.emit('evento', ...)
//   dev: { estágio: { save: {...}, then() } }   atalhos do modo dev (index.html#dev=x,z,yaw,estágio); ver main.js
//
// Estado compartilhado: GAME.G (o progresso de cada capítulo fica aqui; cada arquivo diz no topo quais campos são dele).
// Serviços (o main.js preenche ao iniciar): GAME.toast, subtitle, notify, runConvo, titleCard, travel, save, end, refreshObjective...
const GAME = (() => {
  const chapters = [];
  const areas = [];           // áreas do mapa: GAME.area('L1', LEVEL1.build) — o main.js monta na ordem do index.html
  const npcs = [];            // personagens no mapa (GAME.npc)
  const skipRay = new Set();  // sprites que o [E] atravessa (personagens sem conversa)

  const G = {
    state: 'boot',            // boot · title · intro · play · dialogue (Monteiro) · convo · travel · dead · end
    paused: false, ended: false, dev: false, time: 0,
    convoTarget: null,        // personagem pra quem a câmera olha na conversa
    kills: 0, musicMode: 'explore',
  };

  const call = (c, name, args) => {
    try { return c[name](...args); }
    catch (e) { console.error(`capítulo ${c.id || '?'}: ${name}`, e); throw e; }
  };

  return {
    G, chapters, areas, npcs, skipRay,
    N: {},                    // personagens por id: GAME.N.liberato
    chapter(def) { chapters.push(def); return def; },
    area(id, build) { areas.push({ id, build }); },

    // chama o gancho em todos os capítulos que tiverem
    each(name, ...args) { for (const c of chapters) if (c[name]) call(c, name, args); },
    // resposta do último capítulo que tiver uma (de trás pra frente): objetivo, checkpoint, rótulo do save...
    ask(name, ...args) {
      for (let i = chapters.length - 1; i >= 0; i--) {
        const c = chapters[i];
        if (!c[name]) continue;
        const r = call(c, name, args);
        if (r != null) return r;
      }
      return null;
    },
    any(name, ...args) { return chapters.some(c => c[name] && call(c, name, args)); },
    collect(name, ...args) { return chapters.flatMap(c => (c[name] && call(c, name, args)) || []); },
    // evento: GAME.emit('gun', 'Gaveta de cima') chama on.gun('Gaveta de cima') de quem escuta
    emit(event, ...args) { for (const c of chapters) if (c.on && c.on[event]) c.on[event](...args); },

    inZone(z, p = GAME.P.pos) { return p.x > z.x1 && p.x < z.x2 && p.z > z.z1 && p.z < z.z2; },
    dist(n, p = GAME.P.pos) { return Math.hypot(p.x - n.mesh.position.x, p.z - n.mesh.position.z); },

    // ---------- PERSONAGENS NO MAPA ----------
    // GAME.npc('liberato', { at, ... }) põe o personagem (ficha em js/dados/personagens.js) em pé no chão, virado pra câmera.
    //   at: Vector3 (x, z) · w, h: tamanho do sprite em metros (padrão 0,9 × 1,8) · y: altura do centro (quem está sentado)
    //   head: altura dos olhos pra câmera mirar na conversa (padrão h − 0,25) · collide (padrão true) · visible (padrão true)
    //   dim: 0–1, escurece o material (jaleco branco estoura na lanterna) · aura: { color, w, h, opacity, ring } ou false
    //   use: { verb, fn } conversa com [E] · anim(n, t, falando): animação própria (padrão: falando alterna 0/1)
    npc(id, o) {
      const w = o.w || 0.9, h = o.h || 1.8;
      const tex = SPRITES.textures(id);
      const mat = new THREE.MeshPhongMaterial({ map: tex[0], transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, emissive: 0x1a1812 });
      if (o.dim) { mat.color.setScalar(o.dim); mat.emissive.setHex(0x2e2824); if (o.dim < 0.5) mat.specular.setHex(0); }
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      mesh.position.set(o.at.x, o.y != null ? o.y : h / 2, o.at.z);
      if (o.visible === false) mesh.visible = false;
      GAME.scene.add(mesh);
      const col = { x1: o.at.x - 0.3, x2: o.at.x + 0.3, z1: o.at.z - 0.3, z2: o.at.z + 0.3 };
      const n = {
        id, mesh, mat, tex, col, h, head: o.head || h - 0.25, anim: o.anim,   // h: altura do sprite (o chefe usa)
        setFrame(f) { if (mat.map !== tex[f]) { mat.map = tex[f]; mat.needsUpdate = true; } },
        face() { const c = GAME.camera.position; mesh.rotation.y = Math.atan2(c.x - mesh.position.x, c.z - mesh.position.z); },
        place(x, z) {                                         // muda de lugar (o colisor vai junto)
          mesh.position.x = x; mesh.position.z = z;
          Object.assign(col, { x1: x - 0.3, x2: x + 0.3, z1: z - 0.3, z2: z + 0.3 });
        },
      };
      if (o.collide !== false) WORLD.colliders.push(col);
      if (o.use) { mesh.userData.verb = o.use.verb; mesh.userData.onUse = () => setTimeout(o.use.fn); }   // setTimeout: o mesmo [E] não pula a 1ª fala
      else skipRay.add(mesh);
      if (o.aura !== false) {
        const a = o.aura || {};
        AURA.add({ follow: () => mesh.position, color: a.color || 0xffffff, w: a.w || 1.8, h: a.h || 2.7, opacity: a.opacity || 0.6,
          ring: a.ring === undefined ? 0.65 : a.ring, behind: 0.08, visible: () => mesh.visible });
      }
      npcs.push(n); GAME.N[id] = n;
      return n;
    },
    // todo quadro: vira pra câmera e anima (quem está falando mexe a boca; 'muriel2' conta como 'muriel')
    updateNpcs(t) {
      for (const n of npcs) {
        n.face();
        const talking = CONVO.talking && !!CONVO.speakerChar && CONVO.speakerChar.startsWith(n.id);
        if (n.anim) n.anim(n, t, talking); else n.setFrame(talking ? Math.floor(t * 7) % 2 : 0);
      }
    },
  };
})();

// PRÓLOGO — a entrada do HUSM.
//   O Professor Monteiro no saguão: cutscene (STORY1.monteiro) e a conversa de interromper (js/mecanicas/dialogue.js).
//   Depois ele fica falando com o bebedouro. No corredor dos ambulatórios, o susto da maca que rola sozinha.
// Mapa: js/mapa/world.js · Falas: js/roteiros/story1.js
// Progresso (GAME.G): monteiroStarted (a conversa começou) · monteiroDone (acabou: o objetivo vira o Liberato) · scare (susto)
GAME.chapter((() => {
  const G = GAME.G;
  let prof, lantern, profTarget = null, mutterT = 3, banged = false;
  const profCol = { x1: 0, x2: 0, z1: 0, z2: 0 };     // só colide parado (senão ele te empurra andando)

  async function startTalk() {
    G.monteiroStarted = true;
    await GAME.runConvo(c => STORY1.monteiro(c), { target: prof, meter: true, chain: true });   // o aviso dos veteranos + como interromper
    G.state = 'dialogue'; G.convoTarget = prof;
    GAME.setTalking(true);
    DIALOGUE.start(onTalkEnd);
  }
  function onTalkEnd(kind, snack) {
    G.state = 'play'; G.convoTarget = null;
    G.monteiroDone = true;
    GAME.setTalking(false);
    GAME.refreshObjective();
    if (kind === 'desmaio') GAME.toast('Você "desmaia". Quando abre os olhos, ele está explicando os tomates para o bebedouro.', 6);
    else GAME.toast('Você sai andando rápido. Ele não percebe. Continua falando... com o bebedouro.', 6);
    if (snack) {
      COMBAT.P.maxHp += 10; COMBAT.P.hp = COMBAT.P.maxHp;
      setTimeout(() => GAME.toast('O café e o biscoito do professor fizeram efeito: +10 de saúde máxima.', 4), 6300);
    }
    profTarget = GAME.W.profIdle.clone();
    setTimeout(() => { if (!G.ended) AUDIO.play('moonlight', { fade: 4 }); }, 2500);
    GAME.relockOrPause();
    GAME.save();
  }

  // a maca do fim do corredor rola sozinha na primeira vez que você passa
  function updateScare(dt) {
    if (!G.monteiroDone) return;
    if (!G.scare && GAME.P.pos.z < -27) { G.scare = 0.0001; AUDIO.sfx('squeak'); }
    if (G.scare > 0 && G.scare < 99) {
      G.scare += dt;
      const s = GAME.W.endStretcher;
      const t = U.clamp(G.scare / 2.6, 0, 1);
      s.position.z = -40 + 2.5 * (1 - Math.pow(1 - t, 2));
      const [, hz] = s.userData.h, col = s.userData.col;
      col.z1 = s.position.z - hz; col.z2 = s.position.z + hz;
      if (G.scare > 3.6 && !banged) { banged = true; AUDIO.sfx('bang'); GAME.toast('...', 2); }
      if (G.scare > 6) G.scare = 99;
    }
  }

  return {
    id: 'prologo',
    init() {
      const W = GAME.W;
      prof = GAME.npc('monteiro', {
        at: W.profStart, collide: false, aura: { color: 0xffd27a },
        anim(n, t) {                                        // fala o tempo todo; na cutscene grava um áudio
          const talking = DIALOGUE.talking || (CONVO.talking && CONVO.speakerChar === 'monteiro');
          let f = 0;
          if (talking) f = Math.floor(t * 9) % 2 ? 1 : (Math.floor(t * 1.7) % 3 === 0 ? 2 : 0);
          else if (G.monteiroDone) f = Math.floor(t * 4) % 3 === 0 ? 1 : (Math.floor(t * 0.8) % 2 ? 2 : 0);
          n.setFrame(f);
          n.mesh.position.y = 0.9 + (talking ? Math.abs(Math.sin(t * 14)) * 0.03 : 0);
        },
      });
      lantern = new THREE.PointLight(0xffb060, 1.5, 10, 2);
      GAME.scene.add(lantern);
    },
    update(dt) {
      if (!G.monteiroStarted && GAME.P.pos.z < -1.2) startTalk();     // passou das catracas
      updateScare(dt);
    },
    frame(dt, t) {
      const P = GAME.P, m = prof.mesh;
      // na conversa ele vem atrás de você; depois vai pro bebedouro
      if (G.state === 'dialogue') {
        const dx = P.pos.x - m.position.x, dz = P.pos.z - m.position.z, d = Math.hypot(dx, dz);
        if (d > 1.9) { m.position.x += dx / d * 2.2 * dt; m.position.z += dz / d * 2.2 * dt; }
      } else if (profTarget) {
        const dx = profTarget.x - m.position.x, dz = profTarget.z - m.position.z, d = Math.hypot(dx, dz);
        if (d > 0.1) { m.position.x += dx / d * 1.1 * dt; m.position.z += dz / d * 1.1 * dt; }
      }
      // a lanterna na mão dele
      const th = m.rotation.y;
      lantern.position.set(m.position.x - Math.cos(th) * 0.33 + Math.sin(th) * 0.2, 0.5, m.position.z + Math.sin(th) * 0.33 + Math.cos(th) * 0.2);
      lantern.intensity = 1.35 + Math.sin(t * 23) * 0.08 + (Math.random() < 0.03 ? -0.5 : 0);
      // colide só parado e com você longe
      const idx = WORLD.colliders.indexOf(profCol);
      const still = G.state !== 'dialogue' && (!profTarget || Math.hypot(profTarget.x - m.position.x, profTarget.z - m.position.z) <= 0.1);
      if (still && GAME.dist(prof) > 0.8) {
        Object.assign(profCol, { x1: m.position.x - 0.3, x2: m.position.x + 0.3, z1: m.position.z - 0.3, z2: m.position.z + 0.3 });
        if (idx < 0) WORLD.colliders.push(profCol);
      } else if (idx >= 0) WORLD.colliders.splice(idx, 1);
      // e continua falando... com o bebedouro
      if (G.monteiroDone && G.state === 'play') {
        mutterT -= dt;
        if (mutterT <= 0 && GAME.dist(prof) < 9) { GAME.subtitle('PROF. MONTEIRO (para o bebedouro): ' + U.pick(DIALOGUE.MUTTER)); mutterT = 6; }
      }
      // luzes vermelhas do saguão e do corredor (a do corredor enlouquece no susto)
      const [a, b] = GAME.W.red;
      const blink = (Math.sin(t * 2.2) > -0.2) ? 1 : 0.15;
      a.intensity = 0.9 * blink; a.userData.bulb.visible = blink > 0.5;
      let bi = (Math.sin(t * 1.7 + 1) > -0.3) ? 1 : 0.2;
      if (G.scare > 0 && G.scare < 99) bi = G.scare < 1.5 ? (Math.random() < 0.5 ? 1 : 0) : (G.scare < 4.5 ? 0 : bi);
      b.intensity = bi; b.userData.bulb.visible = bi > 0.5;
    },
    save(s) { s.monteiroDone = !!G.monteiroDone; s.scare = G.scare > 0; },
    load(s) {
      if (s.monteiroDone) {
        G.monteiroStarted = G.monteiroDone = true;
        profTarget = GAME.W.profIdle.clone();
        prof.place(profTarget.x, profTarget.z);
      }
      if (s.scare) {
        G.scare = 99; banged = true;
        const st = GAME.W.endStretcher, [, hz] = st.userData.h;
        st.position.z = -37.5; st.userData.col.z1 = -37.5 - hz; st.userData.col.z2 = -37.5 + hz;
      }
    },
    blockSave: () => !G.monteiroDone,
    objective: () => (G.monteiroDone ? 'OBJETIVO: Encontrar o PROFESSOR LIBERATO (Endoscopia)' : 'OBJETIVO: Entrar no HUSM'),
    saveLabel: s => (s.monteiroDone ? 'depois do saguão' : null),
    dev: {
      talk: { then: () => startTalk() },             // abre a conversa do saguão
      met: { save: { monteiroDone: true } },          // depois do saguão
    },
  };
})());

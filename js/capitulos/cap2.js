// CAPÍTULO 2 — A INFECÇÃO NO AR: o Javali (fim da Ala C), a cutscene pensando no De Barros (treino do nó),
// o Professor De Barros (Vascular: nó cirúrgico, aprovação, carabina de ipê) e o chefe, Professor Schwarzenegger (CCIH).
// Mapa: js/mapa/level1.js (sala do Javali) e js/mapa/level2.js · Falas: js/roteiros/story2.js · Luta: js/mecanicas/boss.js
// Progresso (GAME.G): javaliStarted/javaliDone · knotPracticed · deBarrosStarted/deBarrosDone · elogioDeBarros · carabina
//                     bossStarted/bossDone
GAME.chapter((() => {
  const G = GAME.G;
  let javali, deBarros, chefe;
  const $ = id => document.getElementById(id);

  async function startJavali() {
    G.javaliStarted = true;
    AUDIO.stop(1);
    await GAME.runConvo(c => STORY2.javali(c, { kills: G.kills }), { target: javali, chain: true });
    G.javaliDone = true;
    BUILD.doors.javaliFundos.locked = false;
    moveJavaliAside();
    GAME.refreshObjective();
    G.state = 'travel';                                          // parado durante o letreiro
    await GAME.titleCard('CAPÍTULO 2\n\nA INFECÇÃO NO AR');
    await GAME.runConvo(async c => { G.knotPracticed = await STORY2.pensandoNoDeBarros(c); });   // cutscene (e treino do nó)
    AUDIO.play('moonlight', { fade: 3 });
    GAME.save();
  }
  function moveJavaliAside() { javali.place(-4.5, javali.mesh.position.z); }

  async function startDeBarros() {
    G.deBarrosStarted = true;
    AUDIO.play('nacht', { fade: 1 });
    await GAME.runConvo(c => STORY2.deBarros(c, {
      treinou: G.knotPracticed,
      carabina: () => {
        COMBAT.give('carabina'); G.carabina = true; AUDIO.sfx('achievement');
        GAME.notify('Você ganhou a CARABINA DE IPÊ do De Barros. [3] pra usar. Aprovação máxima: 9,9%.', '🏆 APROVAÇÃO MÁXIMA');
      },
      achievement: () => {
        G.elogioDeBarros = true; AUDIO.sfx('achievement');
        GAME.notify('Você recebeu um ELOGIO do De Barros. Isso acontece com 0,3% dos internos.', '🏆 CONQUISTA RARA');
      },
    }), { meter: true, target: deBarros });
    G.deBarrosDone = true;
    BUILD.doors.ccih.locked = false; BUILD.doors.ccih2.locked = false;
    GAME.refreshObjective();
    AUDIO.play('moonlight', { fade: 3 });
    GAME.save();
  }

  // ---------- O CHEFE ----------
  async function startBoss() {
    G.bossStarted = true;
    BUILD.doors.ccih.close();
    const gate = GAME.L2.arenaGate;
    if (!WORLD.colliders.includes(gate)) WORLD.colliders.push(gate);
    AUDIO.stop(0.5);
    await GAME.runConvo(c => STORY2.chefeIntro(c), { target: chefe });
    AUDIO.play('fifth', { fade: 0.2 });
    GAME.toast('Fuja do OLHAR atrás dos pilares · atire nele e nas SERINGAS · ou, quando o TELEFONE tocar, corra até ele e aperte [E]', 7);
    BOSS.start();
  }
  async function onBossDefeat() {
    G.bossDone = true;
    GAME.prompt('');
    AUDIO.stop(0.4);
    await GAME.runConvo(c => STORY2.chefeDerrota(c), { target: chefe });
    afterBoss();
    GAME.emit('bossDefeated');                                   // o Capítulo 3 começa (js/capitulos/cap3.js)
    AUDIO.play('moonlight', { fade: 3 });
    GAME.save();
  }
  // depois da luta: ele some, a arena reabre
  function afterBoss() {
    G.bossStarted = G.bossDone = true;
    chefe.mesh.visible = false; renderBossBar(null);
    const i = WORLD.colliders.indexOf(GAME.L2.arenaGate); if (i >= 0) WORLD.colliders.splice(i, 1);
    BUILD.doors.ccih.locked = false; BUILD.doors.ccih.tryOpen();
  }
  function renderBossBar(S) {
    $('bossbar').classList.toggle('hidden', !S);
    if (!S) return;
    $('bossbar').innerHTML = '<div class="bname">PROFESSOR SCHWARZENEGGER — CCIH</div><div class="docs">' +
      BOSS.DOCS.map((d, i) => '<span class="' + (i < S.sig ? 'ok' : '') + '">' + (i < S.sig ? '☑ ' : '☐ ') + d + '</span>').join('') + '</div>' +
      '<div class="bhp"><div style="width:' + (100 * S.hp / S.maxHp) + '%"></div></div>';
  }

  return {
    id: 'cap2',
    init() {
      const L1 = GAME.L1, L2 = GAME.L2;
      javali = GAME.npc('javali', { at: L1.javaliPos, aura: { color: 0xffa060 } });
      deBarros = GAME.npc('debarros', { at: L2.deBarrosPos, w: 0.92, h: 1.9, aura: { color: 0xc8a8ff } });   // alto
      chefe = GAME.npc('schwarzenegger', {
        at: L2.bossPos, collide: false, aura: { color: 0xb050ff },
        anim(n, t, talking) { if (!BOSS.active) n.setFrame(talking ? Math.floor(t * 7) % 2 : 0); },   // na luta, o BOSS anima
      });
      BOSS.init(GAME.scene, GAME.camera, {
        pos: () => GAME.P.pos, waypoints: L2.waypoints, los: COMBAT.los, rayLen: COMBAT.rayWall,
        wallAt: (x, z) => GAME.wallBlocked(x, z, 0.05),
        hit: (dmg, infect, psychic) => {
          if (COMBAT.P.dead) return;
          if (psychic) {                                           // o olhar não dá pra esquivar
            GAME.fx.psychic(); COMBAT.P.hp -= dmg;
            if (COMBAT.P.hp <= 0) { COMBAT.P.hp = 0; COMBAT.P.dead = true; GAME.die(); }
            return;
          }
          if (COMBAT.damage(dmg) && infect) { COMBAT.P.infectT = 5; GAME.toast('Seringa contaminada! INFECTADO. (café ou álcool gel ajudam)', 2.5); }
        },
        subtitle: GAME.subtitle, prompt: GAME.prompt, bar: renderBossBar, flash: GAME.fx.flash,
        onDefeat: () => onBossDefeat(),
      }, chefe);
    },
    update(dt) {
      const L1 = GAME.L1, L2 = GAME.L2;
      if (G.liberatoDone && !G.javaliStarted && GAME.inZone(L1.zoneJavali)) startJavali();
      if (G.javaliDone && !G.deBarrosStarted && GAME.inZone(L2.zoneDeBarros)) startDeBarros();
      if (G.deBarrosDone && !G.bossStarted && !G.bossDone && GAME.inZone(L2.zoneArena)) startBoss();
      BOSS.update(dt);
    },
    on: {
      gel(g) {                                                     // álcool gel nos pilares da CCIH
        if (g.used) { GAME.toast('Dispenser de álcool gel. Vazio. Alguém usou tudo. Provavelmente o Liberato.', 3); return; }
        g.used = true; COMBAT.heal(10); COMBAT.P.infectT = 0; AUDIO.sfx('pickup');
        GAME.toast('Álcool gel. Mãos limpas, infecção controlada. (+10, cura a infecção)', 3);
      },
    },
    interceptUse: () => BOSS.active && BOSS.trySign(),            // telefone tocou: [E] entrega o documento
    blockSave: () => BOSS.active,
    targets: () => BOSS.targets(),
    onRespawn() {
      if (!G.bossStarted || G.bossDone) return;
      G.bossStarted = false; BOSS.reset(GAME.L2.bossPos);
      const i = WORLD.colliders.indexOf(GAME.L2.arenaGate); if (i >= 0) WORLD.colliders.splice(i, 1);
    },
    save(s) {
      Object.assign(s, { javaliDone: !!G.javaliDone, knotPracticed: !!G.knotPracticed, deBarrosDone: !!G.deBarrosDone,
        elogioDeBarros: !!G.elogioDeBarros, carabina: COMBAT.P.has.carabina || !!G.carabina, bossDone: !!G.bossDone });
    },
    load(s) {
      if (s.javaliDone) {
        G.javaliStarted = G.javaliDone = true;
        BUILD.doors.javali.locked = false; BUILD.doors.javaliFundos.locked = false;
        moveJavaliAside();
        COMBAT.boars.forEach((b, i) => { if (b.id && b.id.startsWith('L1:')) COMBAT.killSilently(i); });   // a Ala C já está limpa
      }
      G.knotPracticed = !!s.knotPracticed;
      if (s.deBarrosDone) { G.deBarrosStarted = G.deBarrosDone = true; BUILD.doors.ccih.locked = false; BUILD.doors.ccih2.locked = false; }
      G.elogioDeBarros = !!s.elogioDeBarros;
      if (s.carabina) { G.carabina = true; COMBAT.give('carabina'); }
      if (s.bossDone) afterBoss();
    },
    objective() {
      if (G.deBarrosDone) return 'OBJETIVO: Resolver a CCIH com o SCHWARZENEGGER — 3 assinaturas ou na bala\n• Fuja do olhar (pilares) · atire nele e nas seringas · telefone tocou: [E]';
      if (G.javaliDone) return 'OBJETIVO: Falar com o PROFESSOR DE BARROS (porta dos fundos do Javali)';
      return null;
    },
    checkpoint: () => (G.javaliDone ? GAME.L2.checkpoint : null),
    deathLines: () => (BOSS.active ? [
      'O olhar do Schwarzenegger atravessou sua alma.\nE o seu Lattes.',
      'Seringa contaminada.\nA CCIH vai abrir uma investigação. Sobre você.',
      'Ele nem precisou encostar em você.\nTambém não precisou chegar no horário.',
      ...(COMBAT.P.has.carabina ? ['Nem a carabina de ipê resolveu.\nO De Barros vai querer ela de volta. Encerada.'] : []),
    ] : null),
    saveLabel: s => (s.bossDone ? 'depois do Schwarzenegger' : s.deBarrosDone ? 'a caminho da CCIH' : s.javaliDone ? 'depois do Javali' : null),
    dev: {
      javali: { save: { javaliDone: true } },                     // depois do Javali (Ala C limpa)
      debarros: { save: { deBarrosDone: true } },                 // depois do De Barros (CCIH liberada)
    },
  };
})());

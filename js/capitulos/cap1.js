// CAPÍTULO 1 — o Professor Liberato na Endoscopia (Instagram, laudos em ordem crescente, bisturi),
// o revólver escondido na sala da Cirurgia Torácica, a emboscada e a Ala C cheia de javalis. A marmita na copa.
// Mapa: js/mapa/level1.js · Falas: js/roteiros/story1.js
// Progresso (GAME.G): liberatoStarted/liberatoDone · hasGun · marmita
GAME.chapter((() => {
  const G = GAME.G;
  let liberato, wardLeftLast = -1, wardGruntT = 3;

  // javalis da Ala C ainda vivos (o da emboscada não conta: ele não tem id)
  const wardLeft = () => COMBAT.boars.filter(b => b.id && b.id.startsWith('L1:') && b.state !== 'dead').length;

  async function startLiberato() {
    G.liberatoStarted = true;
    AUDIO.play('prelude', { fade: 1 });
    let following = true;
    await GAME.runConvo(async c => {
      following = await STORY1.liberato(c, { giveScalpel: () => { COMBAT.give('scalpel'); AUDIO.sfx('pickup'); }, following: () => CONVO.following });
      if (following) {
        COMBAT.P.maxHp += 25; COMBAT.P.hp = COMBAT.P.maxHp;
        await c.say('narr', '*O Liberato ainda te segue no Instagram. Você se sente estranhamente protegido. (+25 de saúde máxima)*');
      } else {
        await c.say('narr', '*O Liberato não te segue mais no Instagram. Você vai ter que se virar sozinho.*');
      }
      await STORY1.thought(c);
    }, { instagram: true, target: liberato });
    G.liberatoDone = true;
    for (const k of ['torax', 'alaC', 'alaC2']) BUILD.doors[k].locked = false;
    BUILD.doors.torax.lockedMsg = '';
    GAME.refreshObjective();
    AUDIO.play('moonlight', { fade: 3 });
    GAME.save();
  }

  return {
    id: 'cap1',
    init() {
      const L1 = GAME.L1;
      liberato = GAME.npc('liberato', { at: L1.liberatoPos, w: 0.78, h: 1.56, aura: { color: 0x8ac8ff } });   // baixinho
      L1.boars.forEach((s, i) => COMBAT.spawn(s.x, s.z, { id: 'L1:' + i }));
    },
    update(dt) {
      const L1 = GAME.L1;
      if (G.monteiroDone && !G.liberatoStarted && GAME.inZone(L1.zoneEndo)) startLiberato();
      // Ala C: a porta do Javali só abre sem nenhum javali vivo
      if (G.liberatoDone) {
        const n = wardLeft();
        if (n !== wardLeftLast) {
          wardLeftLast = n;
          if (G.hasGun && !G.javaliDone) GAME.refreshObjective();
          if (n === 0 && BUILD.doors.javali.locked) {
            BUILD.doors.javali.locked = false;
            GAME.toast('Silêncio na Ala C. Lá do fundo, uma porta destranca.', 4);
            AUDIO.sfx('door');
          }
        }
      }
      // grunhidos atrás da porta fechada da Ala C
      if (!BUILD.doors.alaC.open && GAME.P.pos.z < -55) {
        wardGruntT -= dt;
        if (wardGruntT <= 0) { wardGruntT = 3 + Math.random() * 5; AUDIO.sfx('grunt', U.clamp(1 - Math.abs(GAME.P.pos.z + 65) / 20, 0.1, 0.7)); }
      }
      // música de combate enquanto algum javali estiver te caçando
      if (G.liberatoDone && !BOSS.active && !G.bossDone) {
        if (COMBAT.alerted && G.musicMode !== 'combat') { G.musicMode = 'combat'; AUDIO.play('summer', { fade: 0.3 }); }
        else if (!COMBAT.alerted && G.musicMode === 'combat' && COMBAT.sinceAlert > 6) { G.musicMode = 'explore'; AUDIO.play('moonlight', { fade: 3 }); }
      }
    },
    on: {
      // achou o revólver num dos móveis do torácico (js/mapa/level1.js sorteia qual)
      async gun(where) {
        AUDIO.sfx('pickup');
        await GAME.runConvo(c => STORY1.gunFound(c, where));
        COMBAT.give('revolver'); G.hasGun = true;
        GAME.save();
        GAME.refreshObjective();
        setTimeout(() => {                                  // emboscada: um javali invade o corredor transversal
          AUDIO.sfx('bang');
          const b = COMBAT.spawn(26, -63, { alert: true });
          b.sx = 26; b.sz = -63;
          GAME.toast('!!!', 1.5);
        }, 1800);
      },
      // a marmita do Liberato, na geladeira da copa: cura 50, mas se ele te seguia, deixa de seguir (e leva o bônus junto)
      marmita() {
        if (G.marmita) { GAME.toast('Geladeira. Só sobrou o pote vazio da marmita do Liberato. E a culpa.', 3); return; }
        G.marmita = true; COMBAT.heal(50); AUDIO.sfx('pickup');
        GAME.toast('Marmita "LIBERATO — NÃO TOCAR — SÉRIO". Você comeu. Arroz, feijão e frango em porções geometricamente iguais. (+50)', 5);
        if (G.liberatoDone && CONVO.following) {
          CONVO.setFollowing(false);
          COMBAT.P.maxHp = Math.max(100, COMBAT.P.maxHp - 25); COMBAT.P.hp = Math.min(COMBAT.P.hp, COMBAT.P.maxHp);
          setTimeout(() => GAME.notify('prof.liberato deixou de seguir você. (ele sabe.) −25 de saúde máxima'), 1800);
        }
        GAME.save(true);
      },
    },
    save(s) { Object.assign(s, { liberatoDone: !!G.liberatoDone, hasGun: !!G.hasGun, following: CONVO.following, marmita: !!G.marmita }); },
    load(s) {
      if (s.liberatoDone) {
        G.liberatoStarted = G.liberatoDone = true;
        COMBAT.give('scalpel'); CONVO.setFollowing(s.following);
        for (const k of ['torax', 'alaC', 'alaC2']) BUILD.doors[k].locked = false;
      }
      if (s.hasGun) { G.hasGun = true; GAME.L1.gunTaken = true; COMBAT.give('revolver'); }
      G.marmita = !!s.marmita;
    },
    objective() {
      if (!G.liberatoDone) return null;
      if (!G.hasGun) return 'OBJETIVO: Pegar o revólver na sala da CIRURGIA TORÁCICA\n• Está em 1 de 5 lugares: 2 gavetas da mesa, 2 armários ou o arquivo\n• Entregar os laudos ao JAVALI (fim da Ala C)';
      const n = wardLeft();
      return n > 0 ? 'OBJETIVO: Limpar a ALA C — javalis restantes: ' + n + '\n[CLIQUE] atirar · [R] recarregar · [1] bisturi · [2] revólver'
        : 'OBJETIVO: Entregar os laudos ao JAVALI (fim da Ala C)';
    },
    checkpoint: () => (G.liberatoDone ? GAME.L1.checkpoint : null),
    deathLines: () => [
      'Um javali passou por cima de você.\nEm pleno HUSM. Ninguém vai acreditar.',
      'Causa da síncope: javali.\nO Liberato vai querer isso em ordem crescente.',
      'Você virou estatística.\nO residente da noite vai ter que preencher a notificação.',
    ],
    saveLabel: s => (s.hasGun ? 'com revólver' : s.liberatoDone ? 'depois do Liberato' : null),
    dev: {
      liberato: { save: { liberatoDone: true, following: true } },   // depois do Liberato (com bisturi)
      gun: { save: { hasGun: true } },                                // com revólver
    },
  };
})());

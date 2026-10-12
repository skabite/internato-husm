// CAPÍTULO 3 — PLANTÃO: o Liberato te barra no corredor, recolhe as armas e te põe de plantão;
// a Professora Muriel no Leito 12 (avaliação, TC no negatoscópio, prescrição com o Professor Máscara na cabeça);
// o PS no subsolo (escada caracol do hall) e o Professor Falastrão, que fecha o PS. Fim do capítulo.
// Mapa: js/mapa/level1.js (Leito 12, Ala C) e js/mapa/level3.js (PS) · Falas: js/roteiros/story3.js
// Progresso (GAME.G): plantaoStarted · muriel (1 avaliar · 2 ver a TC · 3 prescrever · 4 voltar no Liberato · 5 PS;
//                     .5 = cena em andamento) · rxPerfect · plantaoDone · psStarted
GAME.chapter((() => {
  const G = GAME.G;
  let muriel, falastrao;
  const liberato = () => GAME.N.liberato;

  // a arena reabre e o Liberato fica de tocaia no corredor, na frente da Endoscopia
  function setupChapter3() {
    liberato().place(-0.8, -54.5);
    GAME.refreshObjective();
  }
  async function startPlantao() {
    G.plantaoStarted = true;
    AUDIO.play('prelude', { fade: 1 });
    await GAME.runConvo(c => STORY3.liberato(c, {
      armas: () => ['scalpel', 'revolver', 'carabina'].filter(w => COMBAT.P.has[w]),
      devolver: w => { COMBAT.take(w); AUDIO.sfx('click'); },
    }), { target: liberato() });
    disarm();
    setupLeito(1);
    AUDIO.play('moonlight', { fade: 3 });
    GAME.save();
  }
  // o Liberato recolhe tudo: plantão com paciente não é lugar de arma
  // (algum javali que sobrou por aí some junto: sem arma, ninguém deveria morrer pra um)
  function disarm() {
    for (const w of ['scalpel', 'revolver', 'carabina']) COMBAT.take(w);
    COMBAT.boars.forEach((b, i) => { if (b.state !== 'dead') COMBAT.killSilently(i); });
  }
  function setupLeito(stage) {
    G.plantaoStarted = true; G.muriel = Math.max(G.muriel || 0, stage);
    liberato().place(-1.7, liberato().mesh.position.z);           // libera o corredor
    muriel.mesh.visible = true; GAME.L1.ctFilm.visible = true;
    if (G.muriel >= 4) GAME.L1.murielBetter();
    GAME.refreshObjective();
  }
  async function startMuriel1() {
    G.muriel = 1.5;
    await GAME.runConvo(c => STORY3.muriel1(c), { target: muriel });
    G.muriel = 2; GAME.refreshObjective(); GAME.save();
  }
  async function onCT() {
    if (!G.bossDone || G.muriel < 1) { GAME.toast('Negatoscópio. Ligado no nobreak, iluminando... nada. Ninguém pendurou exame nenhum.', 4); return; }
    if (G.muriel < 2) { GAME.toast('Negatoscópio: uma TC de abdome. Etiqueta: "LEITO 12 — M.". Melhor ver a paciente primeiro.', 4); return; }
    if (G.muriel >= 3) { GAME.toast('A TC do Leito 12: pancreatite edematosa intersticial. Sem necrose, sem coleção, sem gás. Sem infecção local.', 5); return; }
    if (G.muriel !== 2) return;
    G.muriel = 2.5;
    await GAME.runConvo(c => STORY3.tc(c));
    G.muriel = 3; GAME.refreshObjective(); GAME.save();
  }
  async function startMuriel2() {
    G.muriel = 3.5;
    const flash = on => document.body.classList.toggle('flashback', on);
    try {
      await GAME.runConvo(c => STORY3.muriel2(c, {
        flash,
        better: () => { GAME.L1.murielBetter(); AUDIO.sfx('pickup'); },
        perfect: () => {
          G.rxPerfect = true; AUDIO.sfx('achievement');
          GAME.notify('Prescrição perfeita: sem antibiótico, sem jejum, sem medo. A CCIH aprovaria.', '🏆 PRESCRIÇÃO PERFEITA');
        },
      }), { target: muriel, meter: true });
    } finally { flash(false); }
    G.muriel = 4; GAME.refreshObjective(); GAME.save();
  }
  async function startLiberato2() {
    G.muriel = 4.5;
    AUDIO.play('prelude', { fade: 1 });
    await GAME.runConvo(c => STORY3.liberato2(c, { perfect: G.rxPerfect }), { target: liberato() });
    setupPlantao();
    AUDIO.play('moonlight', { fade: 3 });
    GAME.save();
  }
  // a escada caracol do hall passa a descer pro PS
  function setupPlantao() {
    setupLeito(5);
    G.plantaoStarted = G.plantaoDone = true;
    const W = GAME.W, L3 = GAME.L3;
    W.stairHit.userData.verb = 'descer pro PS';
    W.stairHit.userData.onUse = () => GAME.travel('Você desce a escada caracol.\nUm andar. Dois.\nO cheiro de álcool 70% aumenta.', L3.arrive, L3.arriveYaw);
    GAME.refreshObjective();
  }
  async function startFalastrao() {
    G.psStarted = true;
    AUDIO.play('toccata', { fade: 0.5 });
    await GAME.runConvo(c => STORY3.falastrao(c), { target: falastrao });
    falastrao.mesh.visible = false;
    const i = WORLD.colliders.indexOf(falastrao.col); if (i >= 0) WORLD.colliders.splice(i, 1);
    GAME.end(3, endText());
  }
  function endText() {
    return 'PS FECHADO. Por decisão dele. Anotado: decisão DELE.\nPlantão encerrado... por enquanto.' +
      '\n' + (G.rxPerfect ? '💊 Prescrição perfeita pra Professora Muriel. A CCIH aprovaria.' : '💊 A Professora Muriel melhorou. O Máscara ainda acha que era caso de meropenem.') +
      '\nJavalis abatidos: ' + G.kills +
      (G.carabina ? (COMBAT.P.has.carabina ? '\n🪵 Carabina de ipê na mochila. Encerada.' : '\n🪵 A carabina de ipê voltou pro De Barros. Pelas mãos do Liberato. Com recibo.') : '') +
      (G.adc === 'ok' ? '\n⚡ Reflexos de Lesch-Nyhan.' : '') +
      '\nLiberato ' + (CONVO.following ? 'ainda te segue' : 'não te segue mais') + ' no Instagram.' +
      '\n' + (G.elogioDeBarros ? '🏆 Você recebeu um elogio do De Barros.' : 'O De Barros não te elogiou. Quase ninguém recebe.') +
      '\n\nO Falastrão está dando entrevista na rádio...\nCONTINUA';
  }

  return {
    id: 'cap3',
    init() {
      muriel = GAME.npc('muriel', {                                 // sentada na maca do Leito 12 (a maca é que colide)
        at: GAME.L1.murielPos, w: 0.7, h: 1.4, y: 1.18, head: 1.62, collide: false, visible: false, dim: 0.62,
        aura: { color: 0xff9ac0, w: 1.3, h: 1.7, opacity: 0.55, ring: 0 },
      });
      falastrao = GAME.npc('falastrao', { at: GAME.L3.falastraoPos, w: 0.95, h: 1.85, aura: { color: 0xff8a5a } });   // provisório
    },
    update() {
      const L1 = GAME.L1, L3 = GAME.L3, P = GAME.P;
      const dLib = GAME.dist(liberato()), atBed = GAME.inZone(L1.zoneLeito);
      if (G.bossDone && !G.plantaoStarted && dLib < 3.2) startPlantao();
      if (G.muriel === 1 && atBed) startMuriel1();
      if (G.muriel === 3 && atBed) startMuriel2();
      if (G.muriel === 4 && dLib < 4) startLiberato2();            // ele está encostado na parede: pega o corredor inteiro
      if (G.plantaoDone && !G.psStarted && Math.hypot(P.pos.x - L3.falastraoPos.x, P.pos.z - L3.falastraoPos.z) < L3.chefiaR) startFalastrao();
    },
    on: {
      bossDefeated() { setupChapter3(); GAME.titleCard('CAPÍTULO 3\n\nPLANTÃO'); },
      ct: () => onCT(),
      stairsUp: () => GAME.travel('Você sobe a escada caracol.\nO hall continua escuro.', new THREE.Vector3(1.4, 0, -15.5), -Math.PI / 2),
    },
    save(s) { Object.assign(s, { muriel: Math.floor(G.muriel || 0), rxPerfect: !!G.rxPerfect, plantaoDone: !!G.plantaoDone }); },
    load(s) {
      G.rxPerfect = !!s.rxPerfect;
      if (s.bossDone) setupChapter3();
      if (s.muriel && !s.plantaoDone) setupLeito(s.muriel);
      if (s.plantaoDone) setupPlantao();
      if (G.muriel >= 1) disarm();                                 // o Liberato já recolheu as armas
    },
    objective() {
      if (G.plantaoDone) return 'OBJETIVO: Descer a ESCADA CARACOL (hall da recepção) até o PS\n• Convencer o PROFESSOR FALASTRÃO (Chefia do PS) a fechar o PS';
      if (G.muriel >= 4) return 'OBJETIVO: Voltar ao PROFESSOR LIBERATO (corredor da Endoscopia)';
      if (G.muriel >= 3) return 'OBJETIVO: Prescrever pra PROFESSORA MURIEL (Leito 12, Ala C)';
      if (G.muriel >= 2) return 'OBJETIVO: Ver a TC no NEGATOSCÓPIO (parede da direita da Ala C)';
      if (G.muriel >= 1) return 'OBJETIVO: Avaliar a paciente do LEITO 12 (Ala C, atrás da cortina)';
      if (G.bossDone) return 'OBJETIVO: Ir embora pra casa (saída pela recepção)';
      return null;
    },
    saveLabel: s => (s.plantaoDone ? 'de plantão (PS)' : s.muriel ? 'de plantão (Leito 12)' : null),
    dev: {
      ch3: { save: { bossDone: true } },                           // depois do Schwarzenegger (Liberato te esperando)
      leito: { save: { muriel: 1 } },                             // Liberato já mandou ver o Leito 12 (sem armas)
      rx: { save: { muriel: 3 } },                                 // falta só prescrever pra Professora Muriel
      ps: { save: { muriel: 5, plantaoDone: true } },              // liberado pro PS (a escada caracol desce)
    },
  };
})());

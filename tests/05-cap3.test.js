// Capítulo 3: o Liberato recolhe as armas, a Professora Muriel (avaliação, TC, prescrição), o PS e o Falastrão.
const { assert, eq, sleep } = require('./lib');

module.exports = [
  {
    name: 'plantão inteiro até o fim do capítulo',
    async run(g) {
      await g.open('-0.8,-50,3.14,ch3');
      await g.eval(() => { COMBAT.give('carabina'); __game.G.carabina = true; });
      await g.goTo(-0.8, -52.6);
      await g.until(() => CONVO.active, null, { what: 'Liberato' });
      let opts = await g.talk();
      while (opts && !opts.some(o => o.includes('Entregar'))) { await g.pick(1); opts = await g.talk(); }
      await g.pick('Esconder'); opts = await g.talk();
      await g.pick('revólver'); opts = await g.talk();
      assert(g.lines.some(l => l.includes('Isso eu não pedi')), 'Liberato não reclamou do revólver');
      await g.pick('carabina'); opts = await g.talk();
      await g.pick('bisturi');
      await g.talkThrough(['Pra casa', 'Entreguei', 'nem tem luz', 'ninguém internado', 'Quem é a paciente']);
      eq(await g.eval(() => [COMBAT.P.weapon, COMBAT.P.has]), [null, { scalpel: false, revolver: false, carabina: false }], 'desarmado');
      eq(await g.flag('muriel'), 1, 'Leito 12 liberado');
      // Leito 12: avaliação
      await g.goTo(21.2, -70.6, 0);
      await g.until(() => CONVO.active, null, { what: 'Muriel' });
      await g.talkThrough(['O que a senhora', 'Perguntar sobre a dor', 'pedra na vesícula', 'Examinar', 'Ler o prontuário', 'Pancreatite aguda']);
      eq(await g.flag('muriel'), 2, 'avaliação feita');
      // TC no negatoscópio (sai de perto do leito antes: senão a prescrição começa colada na TC)
      await g.goTo(24, -74, -1.57);
      await g.eval(() => { __game.L1.negatoscopio.userData.onUse(); });   // sem return: a promise só acaba com a conversa
      await g.until(() => CONVO.active, null, { what: 'TC' });
      await g.talkThrough(['edematosa intersticial']);
      eq(await g.flag('muriel'), 3, 'TC vista');
      // prescrição perfeita
      await g.goTo(21.2, -70.6, 0);
      await g.until(() => CONVO.active, null, { what: 'prescrição' });
      await g.talkThrough(['Ringer lactato', 'Analgesia de verdade', 'Dieta oral precoce', 'Sem antibiótico', 'Colecistectomia nesta', 'Amamos']);
      assert(await g.flag('rxPerfect'), 'prescrição não saiu perfeita');
      eq(await g.flag('muriel'), 4, 'prescrição feita');
      // Liberato manda pro PS
      await g.goTo(-1.7, -57, 3.14);
      await g.until(() => CONVO.active, null, { what: 'Liberato de novo' });
      await g.talkThrough();
      assert(await g.flag('plantaoDone'), 'PS não liberado');
      // escada caracol desce pro PS
      await g.eval(() => { __game.W.stairHit.userData.onUse(); });
      await g.until(() => __game.G.state === 'play' && __game.P.pos.z < -300, null, { what: 'chegar no PS', timeout: 6000 });
      // Falastrão: o argumento certo é a entrevista do Schwarzenegger
      await g.goTo(14.5, -339.2, 3.14);
      await g.until(() => CONVO.active, null, { what: 'Falastrão' });
      await g.talkThrough(['Schwarzenegger']);
      await g.until(() => !document.getElementById('end').classList.contains('hidden'), null, { what: 'tela de fim' });
      const end = await g.eval(() => document.getElementById('end').textContent);
      assert(end.includes('FIM DO CAPÍTULO 3') && end.includes('Prescrição perfeita'), 'fim errado: ' + end.slice(0, 120));
      assert(end.includes('voltou pro De Barros'), 'fim não fala da carabina devolvida');
      eq(await g.eval(() => localStorage.getItem('internato-husm-save-v1') || localStorage.getItem('internato-husm-save')), null, 'save apagado no fim');
    },
  },
];

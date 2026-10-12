// Capítulo 2: Javali, a cutscene do De Barros com treino do nó, o De Barros (carabina) e o Schwarzenegger.
const { assert, eq, sleep } = require('./lib');

module.exports = [
  {
    name: 'Javali, treino do nó, De Barros com aprovação máxima e o chefe',
    async run(g) {
      await g.open('0,-98,3.14,gun');
      await g.eval(() => COMBAT.boars.forEach((b, i) => COMBAT.killSilently(i)));
      await g.goTo(0, -100.5);
      await g.until(() => CONVO.active, null, { what: 'Javali' });
      await g.talkThrough();
      eq(await g.eval(() => __game.G.state), 'travel', 'letreiro do capítulo segura o jogador');
      await g.until(() => CONVO.active, null, { what: 'cutscene do De Barros', timeout: 6000 });
      let opts = await g.talk();
      assert(g.lines.some(l => l.includes('suturar')), 'cutscene não fala da sutura');
      await g.pick('Treinar o nó');
      await g.knot(); await g.knot();                          // mão esquerda e direita, sem errar
      opts = await g.talk();
      assert(g.lines.some(l => l.includes('Perfeito nas duas mãos')), 'treino perfeito não reconhecido');
      await g.pick('Chega');
      await g.talk();
      assert(await g.flag('knotPracticed'), 'treino não marcado');
      // De Barros: elogiar a sala, perguntar dos cavalos, nó perfeito, "Perfeitamente"
      await g.goTo(-12, -113);
      await g.until(() => CONVO.active, null, { what: 'De Barros' });
      opts = await g.talk();
      await g.pick('sala muito bonita');
      opts = await g.talk(); await g.pick('três cavalos');
      await g.knot(); await g.knot();                          // esquerda e direita
      opts = await g.talk(); await g.pick('Perfeitamente');
      await g.talkThrough();
      assert(g.lines.some(l => l.includes('andou treinando')), 'De Barros não reparou no treino');
      assert(await g.eval(() => COMBAT.P.has.carabina && __game.G.achievement), 'sem carabina/elogio');
      // chefe: entra na arena, derruba na força
      await g.goTo(0, -131);
      await g.until(() => CONVO.active, null, { what: 'Schwarzenegger' });
      await g.talkThrough();
      await g.until(() => BOSS.active, null, { what: 'luta começar' });
      await g.eval(() => BOSS.targets().pop().hit(60));
      await g.until(() => CONVO.active, null, { what: 'derrota do chefe' });
      await g.talkThrough();
      assert(await g.flag('bossDone'), 'chefe não foi marcado como vencido');
      await g.until(() => __game.G.state === 'play', null, { what: 'voltar a jogar' });
      eq(await g.eval(() => __game.doors.ccih.open), true, 'CCIH reabriu');
    },
  },
  {
    name: 'nó no celular (arrasto) funciona pelas setas',
    async run(g) {
      await g.open('0,-98,3.14,gun,touch');
      await g.eval(() => COMBAT.boars.forEach((b, i) => COMBAT.killSilently(i)));
      await g.goTo(0, -100.5);
      await g.until(() => CONVO.active, null, { what: 'Javali' });
      await g.talkThrough();
      await g.until(() => CONVO.active, null, { what: 'cutscene', timeout: 6000 });
      await g.talk(); await g.pick('Treinar');
      await g.knot(); await g.knot();
      await g.talk();
      assert(g.lines.some(l => l.includes('Perfeito nas duas mãos')), 'nó por arrasto não saiu perfeito');
    },
  },
];

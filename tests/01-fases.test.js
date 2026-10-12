// Todos os estágios do modo dev abrem sem erro e com o progresso certo.
const { assert, eq } = require('./lib');

const STAGES = [
  ['met', g => g.flag('monteiroDone')],
  ['liberato', g => g.eval(() => COMBAT.P.has.scalpel && !COMBAT.P.has.revolver)],
  ['gun', g => g.eval(() => COMBAT.P.has.revolver)],
  ['javali', g => g.eval(() => __game.G.javaliDone && COMBAT.boars.every(b => b.state === 'dead'))],
  ['debarros', g => g.eval(() => __game.G.deBarrosDone && !__game.doors.ccih.locked)],
  ['ch3', g => g.eval(() => __game.G.bossDone && COMBAT.P.has.scalpel)],
  ['leito', g => g.eval(() => __game.G.muriel === 1 && !COMBAT.P.weapon && !COMBAT.P.has.revolver)],
  ['rx', g => g.eval(() => __game.G.muriel === 3)],
  ['ps', g => g.eval(() => __game.G.plantaoDone && __game.W.stairHit.userData.verb === 'descer pro PS')],
];

module.exports = STAGES.map(([stage, check]) => ({
  name: 'estágio ' + stage,
  async run(g) {
    await g.open('0,-24,0,' + stage);
    eq(await g.eval(() => __game.G.state), 'play', 'estado');
    assert(await check(g), 'progresso errado no estágio ' + stage);
    const obj = await g.eval(() => document.getElementById('objective').textContent);
    assert(obj.length > 0, 'sem objetivo na tela');
  },
}));

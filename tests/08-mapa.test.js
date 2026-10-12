// Mapa: porta do Centro Obstétrico, portas trancadas e itens de cura.
const { assert, eq, sleep } = require('./lib');

module.exports = [
  {
    name: 'porta do Centro Obstétrico avisa e não abre',
    async run(g) {
      await g.open('19.6,-331,-1.5708,ps');
      await g.until(() => document.getElementById('hint').textContent.includes('abrir'), null, { what: 'mirar a porta' });
      await g.key('KeyE');
      const t = await g.eval(() => document.getElementById('toast').textContent);
      assert(t.includes('CENTRO OBSTÉTRICO'), 'toast: ' + t);
    },
  },
  {
    name: 'porta trancada avisa; café cura quando ferido',
    async run(g) {
      await g.open('0,-60,0,met');
      await g.eval(() => __game.doors.alaC.tryOpen());
      assert((await g.eval(() => document.getElementById('toast').textContent)).includes('ALA C'), 'aviso da porta da Ala C');
      eq(await g.eval(() => __game.doors.alaC.open), false, 'continua fechada');
      const c = await g.eval(() => { const i = __game.pickups.findIndex(p => !p.kind); const c = __game.pickups[i]; return { i, x: c.x, z: c.z }; });
      await g.eval(() => { COMBAT.P.hp = 50; });
      await g.goTo(c.x, c.z);
      await g.until(i => __game.pickups[i].taken, c.i, { what: 'pegar o café' });
      eq(await g.eval(() => COMBAT.P.hp), 80, 'café cura 30');
    },
  },
];

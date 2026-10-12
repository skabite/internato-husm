// Capítulo 1: Liberato (laudos em ordem), o revólver escondido, a emboscada e a Ala C.
const { assert, eq, sleep } = require('./lib');

module.exports = [
  {
    name: 'Liberato, laudos, revólver e Ala C',
    async run(g) {
      await g.open('-10,-50,0,met');                             // dentro da Endoscopia
      await g.until(() => CONVO.active, null, { what: 'Liberato' });
      for (let k = 0; k < 30; k++) {
        const opts = await g.talk();
        if (!opts) break;
        if (opts.length && opts[0].includes('Laudo de colonoscopia')) {         // minijogo: do menor pro maior
          const nums = opts.map(o => +o.match(/Pront\. ([\d.]+)/)[1].replace('.', ''));
          const order = nums.map((n, i) => [n, i]).sort((a, b) => a[0] - b[0]);
          for (const [, i] of order) await g.key('Digit' + (i + 1));
          await sleep(700);
          continue;
        }
        await g.pick(1);
      }
      assert(await g.flag('liberatoDone'), 'Liberato não terminou');
      assert(await g.eval(() => COMBAT.P.has.scalpel), 'sem bisturi');
      assert(g.lines.some(l => l.includes('Perfeito') || l.includes('aceitável')), 'laudos não saíram perfeitos');
      eq(await g.eval(() => __game.doors.alaC.locked), false, 'Ala C destrancada');
      // revólver: revista os móveis até achar
      const n = await g.eval(() => __game.L1.searchables.length);
      for (let i = 0; i < n && !(await g.eval(() => CONVO.active)); i++) {
        await g.eval(i => { __game.L1.searchables[i].userData.onUse(); }, i);
        await sleep(100);
      }
      await g.talkThrough();
      assert(await g.eval(() => COMBAT.P.has.revolver && __game.G.hasGun), 'sem revólver');
      const before = await g.eval(() => COMBAT.boars.length);
      await g.until(n => COMBAT.boars.length > n, before, { what: 'emboscada', timeout: 4000 });
      eq(await g.eval(() => __game.doors.javali.locked), true, 'porta do Javali trancada com javali vivo');
      await g.eval(() => COMBAT.boars.forEach((b, i) => COMBAT.killSilently(i)));
      await g.until(() => !__game.doors.javali.locked, null, { what: 'porta do Javali destrancar' });
      // marmita: cura 50, mas o Liberato deixa de seguir (e leva os +25)
      await g.eval(() => { COMBAT.P.maxHp = 125; COMBAT.P.hp = 40; CONVO.setFollowing(true); });
      await g.eval(() => __game.W.interactables.find(m => m.userData.verb === 'abrir a geladeira').userData.onUse());
      eq(await g.eval(() => [COMBAT.P.hp, COMBAT.P.maxHp, CONVO.following, __game.G.marmita]), [90, 100, false, true], 'marmita');
    },
  },
];

// Telas de verdade (sem o modo dev): título → novo jogo → intro → jogando. E o 3D desenhando sem erro.
const { assert, eq, sleep } = require('./lib');

module.exports = [
  {
    name: 'novo jogo pela tela de título',
    async run(g) {
      g.page.on('pageerror', e => g.errors.push(e.message));
      await g.page.goto(g.base + 'index.html');
      await g.page.evaluate(() => localStorage.clear());
      await g.page.reload();
      await g.page.click('#boot');
      await sleep(300);
      eq(await g.page.evaluate(() => GAME.G.state), 'title', 'tela de título');
      eq(await g.page.evaluate(() => document.getElementById('title-save').classList.contains('hidden')), true, 'sem save, sem CONTINUAR');
      await g.page.click('#title');
      await g.page.waitForFunction(() => GAME.G.state === 'play', null, { timeout: 9000 });
      const obj = await g.page.evaluate(() => document.getElementById('objective').textContent);
      assert(obj.includes('Entrar no HUSM'), 'objetivo inicial: ' + obj);
    },
  },
  {
    name: 'o 3D desenha sem erro (saguão, Ala C, consultório e PS)',
    async run(g) {
      for (const at of ['0,10,0,met', '0,-75,3.14,gun', '3,-33,-1.57,met', '-10,-331,-1.57,ps']) {
        await g.open(at, { render: true });
        await sleep(1200);
        const frames = await g.eval(() => new Promise(r => { const t0 = GAME.G.time; setTimeout(() => r(GAME.G.time - t0), 600); }));
        assert(frames > 0, 'o laço parou em ' + at);
      }
    },
  },
];

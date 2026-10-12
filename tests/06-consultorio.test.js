// Consultório 4: MAAA, ADC (Lesch-Nyhan dá reflexos; errar não dá) e a música da sala.
const { assert, eq, sleep } = require('./lib');

async function useAt(g, x, z, yaw, pitch, verb) {
  await g.goTo(x, z, yaw, pitch);
  await g.until(v => document.getElementById('hint').textContent.includes(v), verb, { what: 'mirar: ' + verb });
  await g.key('KeyE');
  await g.until(() => CONVO.active, null, { what: 'conversa: ' + verb });
}

module.exports = [
  {
    name: 'MAAA e ADC com a resposta certa',
    async run(g) {
      await g.open('3,-33,-1.57,met');
      await useAt(g, 4.6, -34.6, -1.5708, -0.05, 'MAAA');
      await g.talkThrough(['livro', 'por que você', 'também sou']);
      assert(g.lines.some(l => l.includes('nem gosto de medicina')) && g.lines.some(l => l.includes('ajudar as pessoas')), 'MAAA sem a fala principal');
      assert(await g.flag('maaa'), 'MAAA não marcado');
      await useAt(g, 4.9, -32.6, 3.14, -0.15, 'ADC');
      const opts = await g.talk();
      eq(opts.length, 5, 'cinco erros inatos');
      await g.pick('Lesch-Nyhan');
      await g.talkThrough();
      assert(g.lines.some(l => l.includes('Você se sente mais ágil')), 'sem "Você se sente mais ágil"');
      eq(await g.eval(() => COMBAT.P.dodge), 0.2, 'esquiva');
      const rate = await g.eval(() => { const P = COMBAT.P; let miss = 0; for (let i = 0; i < 3000; i++) { P.hp = 100; P.dead = false; if (!COMBAT.damage(1)) miss++; } P.hp = 100; return miss / 3000; });
      assert(rate > 0.16 && rate < 0.24, 'esquiva fora dos 20%: ' + rate);
    },
  },
  {
    name: 'ADC com a resposta errada (uma chance só)',
    async run(g) {
      await g.open('3,-33,-1.57,met');
      await useAt(g, 4.9, -32.6, 3.14, -0.15, 'ADC');
      await g.talk(); await g.pick('G6PD'); await g.talkThrough();
      eq(await g.flag('adc'), 'erro', 'resposta errada registrada');
      eq(await g.eval(() => COMBAT.P.dodge), 0, 'sem esquiva');
      await sleep(200); await g.key('KeyE');
      await g.until(() => CONVO.active, null, { what: 'fala repetida' });
      const c = await g.convo();
      assert(!c.text.includes('erro inato'), 'ADC perguntou de novo');
    },
  },
  {
    name: 'Mahler na sala, volta a música ao sair',
    async run(g) {
      await g.open('0,-33,-1.57,met');
      await g.eval(() => { AUDIO.init(); AUDIO.play('moonlight'); });
      await g.goTo(3.5, -33); await g.until(() => AUDIO.playing === 'erde', null, { what: 'tocar Mahler' });
      await g.goTo(0, -33); await g.until(() => AUDIO.playing === 'moonlight', null, { what: 'voltar a música' });
    },
  },
];

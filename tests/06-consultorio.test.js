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
  {
    name: 'Retrato do Eça na parede do fundo',
    async run(g) {
      await g.open('3,-33,-1.57,met');
      const info = await g.eval(() => {
        const c = SPRITES.paintingTex('eca').image;   // o canvas que vai pra parede, no tamanho dele
        const dados = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        const rgb = hex => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
        const [hr, hg, hb] = rgb(PERSONAGENS.eca.visual.hairC);
        const [sr, sg, sb] = rgb(PERSONAGENS.eca.visual.skin);
        let hair = 0, skin = 0;
        for (let i = 0; i < dados.length; i += 4) {
          if (dados[i] === hr && dados[i + 1] === hg && dados[i + 2] === hb) hair++;
          if (dados[i] === sr && dados[i + 1] === sg && dados[i + 2] === sb) skin++;
        }
        return { ok: c.width * 4 === c.height * 3 && hair > 20 && skin > 20, hair, skin };
      });
      assert(info.ok, `pintura do Eça com proporção errada, cabelo (${info.hair}) ou pele (${info.skin}) de menos`);
      await g.goTo(6.7, -31.9, -1.5708, 0.15);
      await g.until(() => document.getElementById('hint').textContent.includes('examinar'), null, { what: 'mirar o retrato' });
      await g.key('KeyE');
      await g.until(() => document.getElementById('toast').textContent.includes('INTERNO DO SÉCULO'), null, { what: 'ler a placa' });
    },
  },
];

// Prólogo: a cutscene do Monteiro, a conversa de interromper e o objetivo seguinte.
const { assert, eq, sleep } = require('./lib');

module.exports = [
  {
    name: 'cutscene do Monteiro e conversa até o fim',
    async run(g) {
      await g.open('0.5,1.5,0');
      eq(!!(await g.flag('monteiroStarted')), false, 'ainda não encontrou o Monteiro');
      await g.goTo(0.5, -1.3);                                   // cruza a linha das catracas
      await g.until(() => CONVO.active, null, { what: 'cutscene começar' });
      let opts = await g.talk();
      assert(g.lines.some(l => l.includes('veteranos')), 'cutscene sem o aviso dos veteranos');
      assert(await g.eval(() => !!document.querySelector('#ig .cue')) || g.lines.some(l => l.includes('COMO FUNCIONA')), 'cutscene sem a explicação');
      await g.pick(2);
      assert((await g.talk()) === null, 'cutscene não terminou');
      await g.until(() => DIALOGUE.active, null, { what: 'conversa do Monteiro começar' });
      // joga a conversa: interrompe quando ele respira, puxa pro assunto, aceita o café, sai andando no fim
      const REDIRECT = ['e a energia', 'apagão', 'O que eu preciso', 'gerador', 'Continuar', 'Entendi', 'SAIR ANDANDO'];
      const t0 = Date.now();
      while (await g.eval(() => DIALOGUE.active)) {
        if (Date.now() - t0 > 90000) throw new Error('a conversa do Monteiro não termina');
        const st = await g.eval(() => ({ breath: document.getElementById('breath').classList.contains('on'),
          opts: [...document.querySelectorAll('#dlg-options .opt')].map(o => o.textContent) }));
        if (st.breath) { await g.key('Space'); continue; }
        if (st.opts.length) {
          let i = st.opts.findIndex(o => REDIRECT.some(r => o.includes(r)));
          if (i < 0) i = st.opts.findIndex(o => o.includes('café'));
          await g.key('Digit' + ((i < 0 ? 0 : i) + 1));
        }
        await sleep(30);
      }
      assert(await g.flag('monteiroDone'), 'conversa terminou sem objetivo');
      assert((await g.eval(() => document.getElementById('objective').textContent)).includes('LIBERATO'), 'objetivo não manda pro Liberato');
      const save = await g.eval(() => JSON.parse(localStorage.getItem('internato-husm-save-v1') || localStorage.getItem('internato-husm-save')));
      assert(save && save.monteiroDone, 'não salvou depois do saguão');
    },
  },
  {
    name: 'no celular o aviso fala INTERROMPER',
    async run(g) {
      await g.open('0.5,-1.5,0,talk,touch');
      for (let k = 0; k < 40 && !(await g.eval(() => !!document.querySelector('#ig .cue'))); k++) await g.key('Space');
      const cue = await g.eval(() => document.getElementById('ig').textContent);
      assert(cue.includes('INTERROMPER'), 'aviso sem INTERROMPER: ' + cue);
    },
  },
];

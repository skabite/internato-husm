// Capítulo 4: o Centro Obstétrico, o consentimento, o cardiotocógrafo e a leitura da fita.
const { assert, eq, sleep } = require('./lib');
const tecla = (g, code) => g.key2(code);   // tecla direto no handler do CONVO

module.exports = [
  {
    name: 'cap4 · consentimento, Leopold, o toco, a fita e a leitura (perfeito)',
    async run(g) {
      await g.open('27.0,-330.0,-1.9,co');
      // a porta do CO já está destrancada e a equipe está na sala
      eq(await g.eval(() => BUILD.doors.co.locked), false, 'porta do CO');
      eq(await g.eval(() => ['tcheco', 'jaque', 'sandro', 'rosane'].every(id => !!GAME.N[id])), true, 'os quatro personagens');
      await g.until(() => CONVO.active, null, { what: 'a cena começar' });
      const opts = await g.talk();
      assert(opts.some(o => o.includes('posso ligar o aparelho')), 'a 1ª escolha é pedir licença: ' + JSON.stringify(opts));
      await g.pick(1);                    // pede licença
      await g.talkThrough();              // Leopold, o toco, o minijogo e a leitura — até o fim
      const ctg = await g.eval(() => __game.G.ctg);
      assert(ctg && ctg.fixou, 'não fixou a cinta: ' + JSON.stringify(ctg));
      eq(ctg.perfeito, true, 'jogando certo, o traçado sai perfeito');
      await g.until(() => !document.getElementById('end').classList.contains('hidden'), null, { what: 'tela de fim' });
      const fim = await g.eval(() => document.getElementById('end').textContent);
      assert(fim.includes('FIM DO CAPÍTULO 4') && fim.includes('SINTONIA FINA'), 'fim errado: ' + fim.slice(0, 140));
      eq(await g.flag('coDone'), true, 'capítulo não fechou');
      g.noErrors();
    },
  },
  {
    name: 'cap4 · sem pedir licença o Sandro corta, e fixar em cima da mãe é armadilha',
    async run(g) {
      await g.open('27.0,-330.0,-1.9,co');
      await g.until(() => CONVO.active, null, { what: 'a cena começar' });
      await g.talk();
      await g.pick(3);                    // [Já vai encostando o transdutor na barriga dela]
      g.lines = [];                       // o Sandro corta na hora: a fala tem que aparecer
      await g.talk();
      assert(g.lines.some(l => l.includes('OPA')), 'o Sandro devia cortar sem licença: ' + JSON.stringify(g.lines));
      await g.pick(1);
      await g.talkThrough([], 60, { pararNoJogo: true });
      // fixa em cima do ponto materno: batimento limpo, mas é o coração dela
      await g.eval(() => { const s = CONVO.minigameState; s.p.u = s.M.u; s.p.v = s.M.v; s.dial = s.dstar; });
      await g.until(() => CONVO.minigameState.sinal > 0.6 && CONVO.minigameState.contato > 0.5, null, { what: 'sinal limpo em cima da mãe' });
      await tecla(g, 'Enter');
      await sleep(200);
      const st = await g.eval(() => {
        const s = CONVO.minigameState;
        return { materna: s.armadilhas.materna, erros: s.erros, bpm: s.mostraBpm, fase: s.fase };
      });
      eq(st.materna, true, 'a armadilha da mãe não foi registrada');
      eq(st.erros, 1, 'fixar na mãe conta um erro');
      eq(st.fase, 'sintonizar', 'não imprime em cima da mãe');
      assert(st.bpm >= 83 && st.bpm <= 85, 'em cima da mãe o visor mostra o pulso dela (~84), veio ' + st.bpm);
      // agora sim, no foco do bebê
      await g.ctg();
      await g.talkThrough();
      const ctg = await g.eval(() => __game.G.ctg);
      eq(ctg.materna, true, 'a armadilha foi pro resultado');
      eq(ctg.fixou, true, 'depois de errar, dá pra acertar');
      // sem pedir licença não tem troféu, por mais limpa que saia a fita
      eq(ctg.broncas, 1, 'a bronca da licença tem que contar');
      eq(ctg.perfeito, false, 'não pode sair SINTONIA FINA sem ter pedido licença');
      g.noErrors();
    },
  },
  {
    name: 'cap4 · fora de sintonia o visor mostra 280 (contagem dobrada, não taquicardia)',
    async run(g) {
      await g.open('27.0,-330.0,-1.9,co');
      await g.until(() => CONVO.active, null, { what: 'a cena começar' });
      await g.talkThrough([], 60, { pararNoJogo: true });
      // no foco do bebê, com o dial fora: o número aparece sem sinal que o sustente
      await g.eval(() => {
        const s = CONVO.minigameState;
        s.dstar = 0.5; s.dial = 0.77; s.p.u = s.F.u; s.p.v = s.F.v; s.contato = 1; s.quedaProx = 99;
      });
      await sleep(250);
      const st = await g.eval(() => ({ visor: CONVO.minigameState.mostraBpm, sinal: CONVO.minigameState.sinal, dobra: CONVO.minigameState.armadilhas.dobra }));
      eq(st.visor, 280, 'fora de sintonia o visor mostra 280');
      assert(st.sinal < 0.2, 'e a barra de SINAL está no chão: ' + st.sinal);
      eq(st.dobra, true, 'a armadilha da contagem dobrada foi registrada');
      // com o dial certo, o visor volta a ser o do bebê
      await g.eval(() => { const s = CONVO.minigameState; s.dial = s.dstar; });
      await sleep(250);
      const bom = await g.eval(() => CONVO.minigameState.mostraBpm);
      assert(bom >= 137 && bom <= 143, 'com o dial certo o visor volta pro bebê (~140): ' + bom);
      g.noErrors();
    },
  },
  {
    name: 'cap4 · sair no meio da cena e CONTINUAR não deixa o capítulo sem gatilho',
    async run(g) {
      await g.open('27.0,-330.0,-1.9,co');
      await g.until(() => CONVO.active, null, { what: 'a cena começar' });
      // a cena salva assim que começa: este é o save de quem sai no meio dela
      const salvo = await g.eval(() => localStorage.getItem('internato-husm-save'));
      assert(salvo, 'a cena não salvou');
      const s0 = JSON.parse(salvo);
      eq(s0.coDone, false, 'coDone no save');
      assert(!s0.coStarted, 'coStarted não pode ir pro save: o load o restauraria e o capítulo ficaria sem gatilho nenhum — ' + JSON.stringify(s0.coStarted));
      // CONTINUAR a partir dele
      await g.page.goto(g.base + 'index.html');
      await g.page.evaluate(v => { localStorage.clear(); localStorage.setItem('internato-husm-save', v); }, salvo);
      await g.page.reload();
      await g.page.click('#boot');
      await sleep(300);
      await g.page.evaluate(() => document.getElementById('btn-continue').click());
      await sleep(700);
      // como 'coStarted' não vai pro save, a cena recomeça sozinha — em vez de o capítulo ficar sem gatilho
      await g.until(() => CONVO.active, null, { what: 'a cena recomeçar sozinha no CONTINUAR' });
      assert(await g.eval(() => document.getElementById('dlg-text').textContent.length > 0), 'a conversa tem que estar no ar');
      // e dá pra jogar o capítulo até o fim daqui mesmo
      await g.talkThrough();
      const ctg = await g.eval(() => GAME.G.ctg);
      assert(ctg && ctg.fixou, 'não deu pra terminar o capítulo depois do CONTINUAR: ' + JSON.stringify(ctg));
      await g.until(() => !document.getElementById('end').classList.contains('hidden'), null, { what: 'chegar ao fim' });
      g.noErrors();
    },
  },
];

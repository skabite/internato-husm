// CAPÍTULO 4 — SINTONIA: o Falastrão fecha o PS, a porta do Centro Obstétrico destranca sozinha e o
// cardiotocógrafo com mau contato espera alguém que saiba sintonizar.
// Mapa: js/mapa/level3.js (a sala do CO) · Falas: js/roteiros/story4.js · Minijogo: js/mecanicas/ctg.js
// Progresso (GAME.G): psDone · coWarned · coStarted · ctg · coDone
GAME.chapter((() => {
  const G = GAME.G;
  let tcheco, jaque, sandro, rosane, equipe = false;

  // a equipe só aparece quando o capítulo começa (antes disso a porta está trancada e a sala, vazia)
  function soltaEquipe() {
    if (equipe) return;
    equipe = true;
    const L3 = GAME.L3;
    // jaleco e uniforme brancos estouram na lanterna (CLAUDE.md): 'dim' mais leve que o do Consultório 4, porque o CO é claro
    tcheco = GAME.npc('tcheco', { at: L3.coChefePos, w: 0.92, h: 1.86, dim: 0.6, aura: { color: 0x8ab4ff } });
    jaque = GAME.npc('jaque', {                                          // deitada no leito PPP (a cama é que colide)
      at: L3.coBedPos, w: 0.7, h: 1.4, y: 1.18, head: 1.62, collide: false, dim: 0.7,
      aura: { color: 0xff9ac0, w: 1.3, h: 1.7, opacity: 0.55, ring: 0 },
    });
    sandro = GAME.npc('sandro', { at: L3.coMatePos, w: 0.88, h: 1.78, aura: { color: 0x9ad0e8 } });
    rosane = GAME.npc('rosane', { at: L3.coNursePos, w: 0.88, h: 1.72, dim: 0.6, aura: { color: 0xd8e8a0 } });
  }
  // o Falastrão fechou o PS: a porta do CO destranca sozinha (o cap3 avisa por evento)
  async function abreCO() {
    soltaEquipe();
    BUILD.doors.co.locked = false;
    AUDIO.sfx('creak');
    GAME.titleCard('CAPÍTULO 4\n\nSINTONIA');
    GAME.toast('No fundo do corredor, uma trava abre. A porta do CENTRO OBSTÉTRICO ficou destrancada.', 6);
    GAME.refreshObjective();
  }

  async function startCena() {
    G.coStarted = true;
    BUILD.doors.co.close();                              // "a porta fecha e o chiado do corredor fica do lado de fora"
    GAME.refreshObjective(); GAME.save();
    AUDIO.play('moonlight', { fade: 2 });
    await GAME.runConvo(async c => {
      const o = await STORY4.tcheco1(c);                 // consentimento, Leopold e o toco: devolve onde procurar
      const r = await c.ctg({ lado: o.lado, nivel: o.nivel, broncas: o.broncas }); // o minijogo (js/mecanicas/ctg.js)
      if (r.timeout) await STORY4.pinard(c);             // o tempo acabou: a Rosane resolve com o Pinard e prende a cinta
      // SINTONIA FINA pede tudo certo: a conversa (licença, Leopold, toco), o aparelho e a leitura da fita de primeira
      const semErro = r.perfeito && !o.erradas;
      const leituraErrada = await STORY4.leitura(c, r, semErro);
      const perfeito = semErro && !leituraErrada;
      G.ctg = { erros: r.erros, broncas: r.broncas, erradas: o.erradas + leituraErrada, fixou: r.fixou, perfeito,
        materna: r.armadilhas.materna, dobra: r.armadilhas.dobra, timeout: r.timeout, tempo: Math.round(r.tempo) };
      if (perfeito) {
        AUDIO.sfx('achievement');
        GAME.notify('Consentimento, Leopold certo, fita limpa e leitura de primeira. O Tcheco vai lembrar do teu nome.', '🏆 SINTONIA FINA');
      }
      await STORY4.fim(c);
    }, { target: tcheco, meter: true });
    G.coDone = true;
    GAME.refreshObjective(); GAME.save();
    GAME.end(4, endText());
  }
  function endText() {
    const c = G.ctg || {};
    return 'FITA IMPRESSA. Vinte minutos de coração de bebê, em papel quadriculado.\nJaqueline e o bebê: bem. Os dois.' +
      (c.perfeito ? '\n🏆 SINTONIA FINA. Sem um erro.' : '') +
      (c.materna ? '\n💗 Você quase fixou a cinta no coração dela: 84 era a mãe. Sempre confira o pulso materno.' : '') +
      (c.dobra ? '\n📻 O visor chegou a mostrar 280 ou 70. Era contagem dobrada ou pela metade. Você não acreditou. Certo você.' : '') +
      (c.timeout ? '\n⏱ O tempo acabou. A Rosane ouviu com o Pinard em quatro segundos e prendeu a cinta pra você.' : '') +
      (c.broncas ? '\nNa conversa você escorregou ' + c.broncas + (c.broncas > 1 ? ' vezes' : ' vez') + ' (licença, gel).' : '') +
      (c.erradas ? '\nRespostas erradas (Leopold, toco, leitura): ' + c.erradas + '.' : '') +
      (c.erros ? '\nErros no manuseio: ' + c.erros + '.' : '') +
      '\n\nJavalis abatidos: ' + G.kills +
      '\nO Falastrão continua dando entrevista na rádio.\nCONTINUA';
  }

  return {
    id: 'cap4',
    update() {
      if (!G.psDone) return;
      // o aviso de conteúdo, uma linha antes de entrar (docs/etica-pacientes.md)
      if (!G.coWarned && GAME.inZone(GAME.L3.coAviso)) {
        G.coWarned = true;
        GAME.subtitle('Esta parte se passa num centro obstétrico. Ninguém se machuca aqui — e o bebê está bem o tempo todo.', 6);
      }
      // começa ao lado do leito ou chegando perto do Tcheco (quem entra pela porta vai direto nele, e o [E] nele não faz nada)
      if (!G.coStarted && (GAME.inZone(GAME.L3.coZone) || GAME.dist(tcheco) < 1.8)) startCena();
    },
    on: {
      // o cap3 chama isto no fim do Falastrão, em vez de encerrar o jogo
      psFechado() { G.psDone = true; abreCO(); },
    },
    // 'coStarted' NÃO vai pro save de propósito: se o jogador sair no meio da cena, ela recomeça do zero
    // (como o Leito 12, que salva o estágio arredondado). Guardá-lo deixaria o capítulo sem gatilho nenhum.
    save(s) { Object.assign(s, { psDone: !!G.psDone, coWarned: !!G.coWarned, coDone: !!G.coDone }); },
    load(s) {
      G.psDone = !!s.psDone; G.coWarned = !!s.coWarned;
      if (G.psDone) { soltaEquipe(); BUILD.doors.co.locked = false; }   // sem repetir o letreiro e o barulho
      if (s.coDone) G.coStarted = G.coDone = true;
    },
    objective() {
      if (G.coDone || !G.psDone) return null;
      if (G.coStarted) return 'OBJETIVO: Imprimir vinte minutos de traçado limpo (a fita do CTG)';
      return 'OBJETIVO: O CENTRO OBSTÉTRICO (fundo leste do corredor do PS)\n• Alguém vai ter que sintonizar aquilo';
    },
    saveLabel: s => (s.coDone ? 'depois da fita' : s.psDone ? 'com o PS fechado (PS)' : null),
    dev: {
      co: { save: { psDone: true } },                                 // porta do CO destrancada, sala com a equipe dentro
      fita: { save: { psDone: true, coStarted: true, coDone: true } }, // depois da fita (fim do capítulo)
    },
  };
})());

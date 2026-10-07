// Roteiros do Capítulo 3: o plantão — Liberato não deixa você ir embora; Professor Falastrão (chefe do PS).
// (o Falastrão é provisório: falta a referência visual e os detalhes da personalidade)
const STORY3 = {
  // ---------------- LIBERATO TE BARRA NO CORREDOR ----------------
  async liberato(c) {
    await c.say('narr', '*O Liberato está parado no meio do corredor. Braços cruzados. Ele estava te esperando. Há 4 minutos e 12 segundos.*');
    await c.say('dudu', 'Aonde você pensa que vai?');
    let i = await c.choose(['Pra casa, professor. Acabou.', 'Resolvi a CCIH! Cefalexina liberada.', '[Tentar passar pelo lado]']);
    if (i === 0) await c.say('dudu', 'Pra casa. Às 23h14. Interessante.');
    if (i === 1) await c.say('dudu', 'Parabéns. Anotado. Isso não muda nada.');
    if (i === 2) await c.say('narr', '*Ele dá um passo pro lado. Exatamente o mesmo lado. Ao mesmo tempo. Ele treinou isso.*');
    await c.say('dudu', 'Você não pode sair. Você está de plantão.');

    const ditas = [];
    const linhas = ['Professor, nem tem luz.', 'Mas não tem ninguém internado nos leitos.'];
    while (ditas.length < 2) {
      const resto = linhas.filter(l => !ditas.includes(l));
      i = await c.choose(resto);
      const l = resto[i]; ditas.push(l);
      if (l === linhas[0]) await c.say('dudu', 'Luz é um detalhe. Eu já fiz trinta endoscopias com a lanterna do celular. Em ordem.');
      else await c.say('dudu', 'Os leitos estão vazios. Eu conferi. Leito por leito. Em ordem crescente de número.');
    }
    await c.say('dudu', 'Não importa.');
    await c.say('dudu', 'Tem o PS.');
    await c.say('dudu', 'O pronto-socorro não fecha. Nunca fechou. Enquanto o PS estiver aberto, o plantão está aberto. E você está de plantão.');
    i = await c.choose(['E como eu fecho o PS?', 'Quem manda no PS?']);
    await c.say('dudu', i === 0 ? 'Você não fecha nada. Quem fecha é o chefe do PS.' : 'O chefe do PS. Só ele.');
    await c.say('dudu', 'O Professor Falastrão. Desce a escada caracol do hall. O PS fica lá embaixo.');
    await c.say('dudu', 'Ele vai te explicar. Ele vai te explicar muitas coisas. Durante muito tempo.');
    await c.say('dudu', 'E arruma esse jaleco. Tá torto. Dois graus.');
    await c.say('narr', '*Ele se afasta. Dois passos exatos. O corredor está livre.*');
  },

  // ---------------- PROFESSOR FALASTRÃO (CHEFE DO PS) ----------------
  async falastrao(c) {
    await c.say('narr', '*Uma sala pequena demais pra quantidade de troféus. "MELHOR PLANTONISTA" 2003, 2004, 2005... até 2026.*');
    await c.say('falastrao', 'ENTRA, ENTRA! Você deve ser o interno. Já ouvi falar de você. Na verdade não ouvi. Mas vou ouvir, porque agora você me conheceu.');
    await c.say('falastrao', 'Sabe quantos pacientes eu atendi num plantão só? Trezentos. Sozinho. Com uma mão. A outra segurando o café.');
    let i = await c.choose(['Professor, precisamos fechar o PS.', 'O senhor é uma lenda, professor.', 'Não tem ninguém aqui embaixo.']);
    if (i === 0) await c.say('falastrao', 'FECHAR? Esse PS nunca fechou. Nem em dia de Gre-Nal. Nem quando faltou luz em 2009: eu iluminei a Sala Vermelha com a lanterninha de um Nokia.');
    if (i === 1) await c.say('falastrao', 'Lenda é pouco. Mas pode continuar. ...Continua. ...Acabou? Tudo bem, eu continuo: eu sou uma lenda.');
    if (i === 2) await c.say('falastrao', 'Ninguém AINDA. Plantão é potencial, interno. É a física quântica da emergência. Eu inventei isso.');

    // ele só fecha o PS se isso der manchete pra ele
    let tries = 0;
    while (true) {
      i = await c.choose(['Sem luz ninguém consegue atender ninguém.', 'O Liberato me mandou aqui.', 'O Schwarzenegger tá dando entrevista sobre o apagão.']);
      if (i === 2) break;
      if (i === 0) await c.say('falastrao', 'Eu atendo de olho fechado. Já atendi. Duas vezes. Uma sem querer.');
      if (i === 1) await c.say('falastrao', 'O Liberato! Ótimo rapaz. Uma vez ele organizou meus troféus em ordem alfabética. Eu desorganizei. Por princípio.');
      if (++tries === 2) await c.say('narr', '*O celular dele vibra em cima da mesa: "SCHWARZENEGGER AO VIVO NA RÁDIO — AGORA". Ele finge que não viu. Ele viu.*');
    }
    await c.say('falastrao', 'ENTREVISTA? O Schwarzenegger? Dando entrevista sobre o MEU apagão?');
    await c.say('falastrao', 'Interno. Escuta bem. Quem fecha esse PS sou EU. Fechamento histórico. Primeira vez em trinta anos. Isso é capa de jornal.');
    await c.say('falastrao', 'PS FECHADO! Por decisão minha. Anota aí: decisão MINHA.');
    await c.say('narr', '*Ele tira um megafone da gaveta. Por que ele tem um megafone? Sai correndo escada acima, já ensaiando a entrevista.*');
    await c.say('falastrao', 'E você tá liberado do plantão! ...Por enquanto. Plantão nunca acaba de verdade, interno. Ele só espera.');
  },
};

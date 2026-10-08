// Roteiros do Capítulo 3: o plantão — Liberato não deixa você ir embora; Professor Falastrão (chefe do PS).
// (o visual do Falastrão e o layout do PS ainda são provisórios: faltam as fotos)
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
    await c.say('narr', '*Uma sala pequena demais pra quantidade de troféus. Ele levanta antes de você abrir a boca. Com um sax pendurado no pescoço.*');
    await c.say('narr', '*E te abraça. Crec. Uma costela sua. Quarta ou quinta, à esquerda.*');
    await c.say('falastrao', 'ENTRA, ENTRA, INTERNO! Eu chego e abraço. Sempre fui assim. Uma vez quebrei quatro costelas numa massagem. Reanimei catorze vezes. Saiu andando.');
    await c.say('narr', '*Ele aperta sua mão. Os ossos do seu carpo trocam de lugar. Dois deles não voltam.*');
    await c.say('falastrao', 'Professor. Doutor. Endoscopista. CIRURGIÃO. Plantonista. Pesquisador. Há quarenta e dois anos. Pode me chamar de qualquer um. Eu prefiro todos.');
    let i = await c.choose(['Professor, precisamos fechar o PS.', 'O senhor é uma lenda, professor.', 'Não tem ninguém aqui embaixo.']);
    if (i === 0) {
      await c.say('falastrao', 'FECHAR? O PS que EU idealizei? Que EU construí? Esse PS nunca fechou. Nem em dia de Gre-Nal.');
      await c.say('falastrao', 'Em 2009 faltou luz e eu abri um tórax com a lanterninha de um Nokia. Quinze segundos. Clampeei a aorta em mais quinze. Tempo é HEMÁCIA, interno.');
    }
    if (i === 1) {
      await c.say('falastrao', 'Lenda é pouco. Comecei a trabalhar com treze anos. Com dezessete eu já operava sozinho. Quando me formei, eu já sabia fazer todas as cirurgias.');
      await c.say('falastrao', 'Todas. Inclusive umas que ainda não inventaram. Tô esperando inventarem pra ensinar.');
    }
    if (i === 2) {
      await c.say('falastrao', 'Ninguém AINDA. Plantão é potencial, interno. E quando chegar, eu entubo. Eu entubo todo mundo.');
      await c.say('falastrao', 'Semana passada entubei um rapaz que só tinha vindo trocar uma receita. Saiu ótimo. Saiu com a receita, inclusive.');
    }
    await c.say('narr', '*Ele começa a narrar você como um jogo de futebol: "O interno recebe... olha pros lados... vai tentar o argumento..."*');

    // ele só fecha o PS se isso der manchete pra ele
    const SEM_LUZ = [
      'Eu atendo de olho fechado. Já atendi. Duas vezes. Uma sem querer.',
      'Já fiz traqueostomia com caneta BIC no acostamento da BR. De noite. Chovendo. A caneta escreve até hoje.',
      'Picada de cobra no meio do mato, sem soro, sem luz. Aprendi na prática. A cobra também aprendeu.',
      'No Rio eu fazia plantão de setenta e duas horas. Eu chamava de fim de semana.',
    ];
    const LIBERATO = [
      'O Liberato! Ótimo rapaz. Uma vez ele organizou meus troféus em ordem alfabética. Eu desorganizei. Por princípio.',
      'Fui eu que ensinei Suporte Básico pro Liberato. Pra ele, pra você, pra vinte e cinco mil pessoas. Primeiro curso de ABCDE do Brasil.',
      'Haja consciência de que eu sou o único professor pra lecionar Suporte Básico pra vocês. O ÚNICO. Ninguém gosta de vocês, sabia? Eu fiquei mesmo assim.',
      'Eu escolho as minhas brigas, interno. O Liberato não é uma delas. Ainda.',
    ];
    const DOLAR = [
      'Me convidaram pra sair do Brasil depois que eu clampeei uma aorta em quinze segundos. Eu podia estar ganhando em dólar. Fiquei. Por vocês.',
      'Eu sou um homem de bom senso. Frio e calculista. Uso uma luva por plantão: a esquerda. A direita eu guardo pra emergência.',
      'Já corrigi o Guyton, sabia? O capítulo de choque. Ele puxou toda a brasa pro assado dele. Eu devolvi.',
    ];
    let tries = 0, a = 0, b = 0, d = 0;
    while (true) {
      i = await c.choose(['Sem luz ninguém consegue atender ninguém.', 'O Liberato me mandou aqui.', 'Por que o senhor nunca saiu daqui?', 'O Schwarzenegger tá dando entrevista sobre o apagão.']);
      if (i === 3) break;
      if (i === 0) await c.say('falastrao', SEM_LUZ[a++ % SEM_LUZ.length]);
      if (i === 1) await c.say('falastrao', LIBERATO[b++ % LIBERATO.length]);
      if (i === 2) await c.say('falastrao', DOLAR[d++ % DOLAR.length]);
      tries++;
      if (tries === 2) await c.say('narr', '*O celular dele vibra em cima da mesa: "SCHWARZENEGGER AO VIVO NA RÁDIO — AGORA". Ele finge que não viu. Ele viu.*');
      if (tries === 4) await c.say('narr', '*O celular vibra de novo. E de novo. Ele olha pro megafone na mesa. Depois pra você. Depois pro megafone.*');
    }
    await c.say('falastrao', 'ENTREVISTA? O Schwarzenegger? Dando entrevista sobre o MEU apagão? Do MEU PS?');
    await c.say('narr', '*"...E O INTERNO MARCA! GOLAÇO!" — ele comemora o próprio susto.*');
    await c.say('falastrao', 'Eu tô com sessenta e cinco anos e tô aprendendo coisa, interno. Hoje eu aprendi que esse PS fecha. Quando EU fecho.');
    await c.say('falastrao', 'Fechamento histórico. Primeira vez em trinta anos. Isso é capa de jornal. Vou dar a entrevista em alemão. A rádio é em português, mas começa em alemão. Pra impressionar.');
    await c.say('falastrao', 'PS FECHADO! Por decisão minha. Anota aí: decisão MINHA.');
    await c.say('narr', '*Ele pega o megafone da mesa e sai correndo escada acima, já ensaiando. O sax vai batendo em cada degrau.*');
    await c.say('falastrao', 'E VARRE ESSA SALA ANTES DE SAIR! Interno preguiçoso não varre! ...E tá liberado do plantão. Por enquanto. Plantão nunca acaba, interno. Ele só espera.');
    await c.say('narr', '*Você olha pra vassoura. A vassoura olha pra você.*');
  },
};

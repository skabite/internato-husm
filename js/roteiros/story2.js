// Roteiros do Capítulo 2: Javali → Professor De Barros → Professor Schwarzenegger (CCIH).
const STORY2 = {
  // ---------------- JAVALI (O JAVALI) ----------------
  async prof3(c, game) {
    await c.say('javali', '...');
    await c.say('javali', 'Ah. Os laudos do Liberato.');
    await c.say('narr', '*Ele folheia. Devagar. Muito devagar.*');
    await c.say('javali', 'Em ordem crescente de prontuário. Claro que estão.');
    await c.say('javali', `Você atravessou a Ala C? Com esse barulho todo? ${game.kills > 0 ? `E esses ${game.kills} javalis lá fora?` : ''}`);
    await c.say('javali', 'Eu não ouvi nada.');
    await c.say('narr', '*Ele funga. Um grunhido baixo escapa de algum lugar da sala. Talvez dele.*');
    const i = await c.choose(['Professor... o senhor ouviu isso?', 'Por que chamam o senhor de "O Javali"?', '[Deixar os laudos na mesa em silêncio]']);
    if (i === 0) await c.say('javali', 'Ouvi o quê?');
    if (i === 1) await c.say('javali', 'Quem chama?  ...Quem te contou isso?');
    if (i === 2) await c.say('javali', 'Bom. Pelo menos alguém da sua turma sabe ficar quieto.');
    await c.say('javali', 'Agora escuta. Os javalis não são o problema. Os javalis são sintoma.');
    await c.say('javali', 'Tem alguma coisa nesse hospital. No ar. O De Barros, da Vascular, percebeu antes de todo mundo. Vai falar com ele.');
    await c.say('narr', '*Ele joga uma chave pra você. O chaveiro é um javalizinho de borracha. Ele aperta o chaveiro antes. O chaveiro grunhe.*');
    await c.say('javali', 'Porta dos fundos. E não conta pro Liberato que eu baguncei os laudos. Ainda não baguncei. Mas vou.');
  },

  // ---------------- CUTSCENE: O INTERNO PENSA NO DE BARROS (e pode treinar o nó) ----------------
  // Apresenta o minijogo do nó antes de valer nota. Devolve true se treinou (o De Barros repara).
  async deBarros(c) {
    await c.say('eu', 'De Barros. Cirurgia Vascular. Logo depois da porta dos fundos.');
    await c.say('eu', 'Ambidestro. Escreve duas evoluções ao mesmo tempo, uma com cada mão. Os veteranos juram que é verdade.');
    await c.say('eu', 'E ele não conversa com interno nenhum antes de ver as mãos do interno.');
    await c.say('eu', 'Ele vai mandar suturar. Ou, no mínimo, dar um nó cirúrgico. Na frente dele. Com a esquerda E com a direita.');
    await c.say('eu', 'Dizem que uma vez ele disse "razoável" pra um interno. O interno chorou. De alegria. Acho.');
    await c.say('narr', TOUCH.on
      ? '*NÓ CIRÚRGICO: aparece uma seta. ARRASTE o dedo na direção dela, uma laçada de cada vez. Mão esquerda no lado ESQUERDO da tela; mão direita no lado DIREITO, e ela tem diagonais. Demorou, o fio afrouxa (conta erro).*'
      : '*NÓ CIRÚRGICO: aparece uma sequência de teclas. Mão ESQUERDA = W A S D; mão DIREITA = SETAS. Digite na ordem antes de a barrinha vermelha encher (6 s por mão). Tecla errada = hesitação.*');
    await c.say('narr', '*Nó PERFEITO: nenhum erro e rápido, nas duas mãos. É o único jeito de impressionar o De Barros.*');
    await c.say('eu', 'Tenho um fio de sutura no bolso do jaleco. Dá pra treinar aqui mesmo, no pé da mesa do Javali.');
    let treinou = false;
    let i = await c.choose(['[Treinar o nó]', '[Não precisa. Vamos logo.]']);
    while (i === 0) {
      if (!treinou) await c.say('narr', '*Você amarra o fio no pé da mesa. O Javali olha. Não diz nada.*');
      treinou = true;
      await c.say('eu', 'Mão esquerda primeiro.');
      const e = await c.knot('esquerda');
      await c.say('eu', 'Agora a direita.');
      const d = await c.knot('direita');
      const n = e.errors + d.errors;
      if (e.perfect && d.perfect) await c.say('eu', 'Perfeito nas duas mãos. Se eu fizer isso na frente dele... talvez eu ouça um "razoável".');
      else if (e.timeout || d.timeout) await c.say('eu', 'O fio soltou. Tem que ser mais rápido. Ele não vai esperar.');
      else if (n === 0) await c.say('eu', 'Sem erro, mas devagar. Pro De Barros, devagar é um tipo de erro.');
      else await c.say('eu', `${n} ${n === 1 ? 'hesitação' : 'hesitações'}. Ele vai contar cada uma.`);
      AUDIO.sfx('grunt', 0.6);
      await c.say('narr', '*O Javali grunhe. Aprovação? Desaprovação? Impossível saber.*');
      i = await c.choose(['[Treinar de novo]', '[Chega. Vou falar com ele.]']);
    }
    await c.say('eu', 'Porta dos fundos. Vamos.');
    return treinou;
  },

  // ---------------- PROFESSOR DE BARROS ----------------
  async clovis(c, game) {
    let ap = 0.2;
    const best = { sala: false, cavalos: false, no: false, perfeitamente: false };   // aprovação máxima = tudo certo
    const meter = () => c.meter(`🏛️ <b>APROVAÇÃO DO DE BARROS</b> · ${ap.toFixed(1).replace('.', ',')}%`);
    const up = v => { ap = Math.max(0, ap + v); meter(); };
    meter();

    await c.say('narr', '*Ele está escrevendo duas evoluções ao mesmo tempo. Uma com cada mão. As duas com letra melhor que a sua.*');
    await c.say('debarros', 'Ah. O interno do Javali.');
    await c.say('debarros', 'Senta. Não aí. Ali. Essa cadeira é italiana, eu prefiro que ninguém sente nela.  ...Mas tudo bem. Senta onde quiser.');

    await c.say('debarros', 'Você veio pela Ala C?');
    let i = await c.choose(['Vim. Matei uns javalis no caminho.', 'Vim correndo, professor.', 'O senhor tem uma sala muito bonita.', 'Vim pela porta dos fundos do Javali.']);
    if (i === 0) { up(0.1); await c.say('debarros', 'Matou. Interessante. Eu teria desviado. Mas cada um tem o seu estilo. O seu é... um estilo.'); }
    if (i === 1) await c.say('debarros', 'Correr é uma escolha. Não seria a minha. Mas é uma escolha.');
    if (i === 2) { up(0.3); best.sala = true; await c.say('debarros', 'Obrigado. É a menor das minhas salas. A de casa tem vista pro mar. A de Gramado tem vista pra outra sala minha.'); }
    if (i === 3) await c.say('debarros', 'Eu imaginei. Você tem cara de quem entra pela porta dos fundos. Não é uma crítica. É uma observação. Que por acaso é uma crítica.');

    await c.say('debarros', 'Bom. Vamos ao que interessa. Tem uma infecção nesse hospital. No ar. Eu sinto.');
    await c.say('debarros', 'Literalmente: eu sinto o cheiro. Fiz um curso de vinhos em Bordeaux. Essa aqui é uma Klebsiella. Safra 2026. Notas de corredor úmido e prescrição atrasada.');
    await c.say('debarros', 'E a CCIH não autoriza CEFALEXINA. Cefalexina! Eu dou cefalexina pro meu cavalo. Eu tenho três cavalos. O do meio é alérgico, mas os outros dois tomam.');
    i = await c.choose(['Mas por que a CCIH não autoriza?', 'O senhor tem três cavalos?', 'Cefalexina pra infecção hospitalar não é meio...?']);
    if (i === 0) await c.say('debarros', 'Porque o Schwarzenegger não assina. Ele não assina porque não tem tempo. Ele não tem tempo porque está sempre dando entrevista.');
    if (i === 1) { up(0.2); best.cavalos = true; await c.say('debarros', 'Três. E uma lancha. Chama "Meropenem". Era pra ser "Cefalexina", mas a CCIH também não autorizou o nome.'); }
    if (i === 2) { up(-0.1); await c.say('debarros', 'Meio o quê? Termine as frases, interno. Frases pela metade são como pontes de safena pela metade.  ...Eu sei, eu sei. Mas eu tenho razão.'); }

    await c.say('debarros', 'Antes de eu te mandar resolver isso, me mostra uma coisa. Dá um nó cirúrgico.');
    if (game.treinou) await c.say('debarros', 'Você andou treinando. Dá pra sentir: cheiro de fio de sutura e de mesa do Javali. Bom. Treinar é admitir que precisa. Eu nunca precisei.');
    await c.say('debarros', 'Com a mão ESQUERDA primeiro. Eu sou ambidestro. Espero que você seja pelo menos destro.');
    await c.say('narr', TOUCH.on
      ? '*Siga as setas: arraste o fio na direção certa, uma laçada de cada vez. Se demorar, o fio afrouxa. Mão esquerda do lado esquerdo, mão direita do lado direito, que vem com diagonais. O De Barros cantarola junto, meio tom acima.*'
      : '*Mão esquerda: W A S D, na ordem que aparecer, antes de a barrinha encher. Depois a direita, com as setas. O De Barros cantarola junto, meio tom acima.*');
    const e = await c.knot('esquerda');
    if (e.timeout) await c.say('debarros', 'Demorou. O fio... soltou. Interessante. Os pacientes também soltam, sabia? Da gente. Pela confiança.');
    else if (e.errors === 0) { up(0.4); await c.say('debarros', 'Hm.'); }
    else await c.say('debarros', `${e.errors} ${e.errors === 1 ? 'hesitação' : 'hesitações'}. Na minha época isso era reprovação. Mas a época é outra. Infelizmente.`);

    await c.say('debarros', 'Agora a DIREITA.');
    const d = await c.knot('direita');
    if (d.timeout) await c.say('debarros', 'Hm. Bom, ninguém nasce sabendo. Alguns nascem sabendo. Eu nasci.');
    else if (d.errors === 0) { up(0.4); await c.say('debarros', 'Hm. Hm.'); }
    else await c.say('debarros', 'Dá pra melhorar. Tudo dá pra melhorar. Até isso aqui. Principalmente isso aqui.');

    const perfect = !e.timeout && !d.timeout && e.perfect && d.perfect;
    if (perfect) {
      best.no = true;
      await c.say('narr', '*Ele olha pro nó. Olha pra você. Olha pro nó de novo. Ajusta os óculos sem aro.*');
      ap = 7.3; meter();
      await c.say('debarros', '...Razoável.');
      await c.say('narr', '*Silêncio. Ele parece surpreso consigo mesmo. Em algum lugar, um anjo ganha asas. Ou um residente ganha folga.*');
      game.achievement();
    } else {
      await c.say('debarros', 'Bom. Vai ter que servir.');
    }

    await c.say('debarros', 'Então. Você vai resolver o problema da CCIH. Vai lá e fala com o Schwarzenegger.');
    i = await c.choose(['Ele é parente do Arnold?', 'E se ele não quiser assinar?', 'Certo, professor.', 'Perfeitamente, professor.']);
    if (i === 0) await c.say('debarros', 'Ninguém sabe. Ele também não. Perguntaram numa entrevista. Ele deu uma resposta de quarenta minutos e ninguém entendeu.');
    if (i === 1) await c.say('debarros', 'Ele nunca quer. Mas ele está SEMPRE atrasado pra alguma entrevista. Quando o telefone dele tocar, ele assina qualquer coisa pra se livrar de você. Use isso.');
    if (i === 2) await c.say('debarros', '"Certo, professor." Curto. Objetivo. Eu teria dito "Perfeitamente". Mas tudo bem.');
    if (i === 3) { up(0.6); best.perfeitamente = true; await c.say('debarros', '"Perfeitamente." ...Era exatamente o que eu teria dito. Exatamente. Não sei se gosto disso.'); }
    await c.say('debarros', 'São três documentos: PARECER, JUSTIFICATIVA e TERMO DE RESPONSABILIDADE. Três assinaturas.');
    await c.say('debarros', 'E cuidado com o olhar dele. Não é força de expressão. Esconda-se atrás dos pilares. E ele arremessa seringas. Contaminadas. Ele diz que é "didático".');
    await c.say('narr', '*Ele te entrega uma caneta Montblanc.*');
    await c.say('debarros', 'Pra ele assinar. Não perde. Ela custa mais que o seu carro.  ...Você tem carro? Não responde. Eu já sei.');

    // APROVAÇÃO MÁXIMA: sala elogiada, cavalos, nó perfeito nas duas mãos e "Perfeitamente"
    if (best.sala && best.cavalos && best.no && best.perfeitamente) {
      ap = 9.9; meter();
      await c.say('narr', '*O medidor de aprovação trava em 9,9%. Ninguém nunca viu esse número. Os outros 90,1% são dos cavalos.*');
      await c.say('debarros', 'Interno. Espera.');
      await c.say('narr', '*Ele abre um armário de madeira escura. Lá dentro, uma carabina. Coronha de ipê-amarelo, envernizada, com as iniciais D.B. gravadas em latão.*');
      await c.say('debarros', 'Carabina de ipê. Eu mesmo escolhi a árvore. Ela já tinha caído. Eu acho.');
      await c.say('debarros', 'Na CCIH você vai precisar de argumentos melhores que o revólver do torácico. Oito tiros. Mais pesada. Mais elegante. Como tudo que é meu.');
      game.carabina();
      await c.say('debarros', 'Devolve depois. Encerada. Com óleo de peroba, não com qualquer coisa.');
    }
  },

  // ---------------- O CHEFE ----------------
  async belgicaIntro(c) {
    await c.say('schwarzenegger', 'Interno. Eu tenho exatamente dois minutos. Tenho uma entrevista. Na verdade tenho três.');
    await c.say('schwarzenegger', 'Cefalexina? Não. A CCIH não autoriza cefalexina sem PARECER, sem JUSTIFICATIVA e sem TERMO DE RESPONSABILIDADE.');
    const i = await c.choose(['Eu trouxe os três, professor. Só falta assinar.', 'O De Barros mandou eu resolver isso.', 'O senhor é parente do Arnold?']);
    if (i === 0) await c.say('schwarzenegger', 'E você acha que eu vou assinar? Assim? Sem uma reunião? Sem uma ata? Sem uma entrevista sobre o assunto?');
    if (i === 1) await c.say('schwarzenegger', 'O De Barros. Claro. O De Barros resolve tudo mandando alguém resolver. Ele tem três cavalos, sabia? Ele te contou dos cavalos.');
    if (i === 2) await c.say('schwarzenegger', 'Essa é uma ótima pergunta. Tenho uma resposta de quarenta minutos. Mas não agora, tenho uma entrevista. Sobre isso, inclusive.');
    await c.say('schwarzenegger', 'Agora, se me dá licença...');
    await c.say('narr', '*Os olhos dele começam a brilhar. Roxo. Isso não é normal. Nada aqui é normal.*');
  },

  async belgicaDefeat(c) {
    await c.say('schwarzenegger', '...Está bem. ESTÁ BEM.');
    await c.say('schwarzenegger', 'CEFALEXINA LIBERADA.');
    await c.say('schwarzenegger', 'Mas que fique registrado em ata. E que ninguém saiba que eu fui convencido por um interno. Com uma Montblanc do De Barros.');
    await c.say('schwarzenegger', 'Agora, se me dá licença, eu estou quarenta minutos atrasado pra uma entrevista. Pela terceira vez hoje.');
    await c.say('narr', '*Ele sai correndo pelo corredor, já ajeitando o cabelo, já falando ao telefone. Os olhos ainda brilham um pouco.*');
    await c.say('eu', 'A cefalexina está liberada. Mas o cheiro de Klebsiella... continua no ar.');
  },
};

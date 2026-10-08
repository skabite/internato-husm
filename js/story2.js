// Roteiros do Capítulo 2: Javali → Professor De Barros → Professor Schwarzenegger (CCIH).
const STORY2 = {
  // ---------------- JAVALI (O JAVALI) ----------------
  async prof3(c, game) {
    await c.say('prof3', '...');
    await c.say('prof3', 'Ah. Os laudos do Liberato.');
    await c.say('narr', '*Ele folheia. Devagar. Muito devagar.*');
    await c.say('prof3', 'Em ordem crescente de prontuário. Claro que estão.');
    await c.say('prof3', `Você atravessou a Ala C? Com esse barulho todo? ${game.kills > 0 ? `E esses ${game.kills} javalis lá fora?` : ''}`);
    await c.say('prof3', 'Eu não ouvi nada.');
    await c.say('narr', '*Ele funga. Um grunhido baixo escapa de algum lugar da sala. Talvez dele.*');
    const i = await c.choose(['Professor... o senhor ouviu isso?', 'Por que chamam o senhor de "O Javali"?', '[Deixar os laudos na mesa em silêncio]']);
    if (i === 0) await c.say('prof3', 'Ouvi o quê?');
    if (i === 1) await c.say('prof3', 'Quem chama?  ...Quem te contou isso?');
    if (i === 2) await c.say('prof3', 'Bom. Pelo menos alguém da sua turma sabe ficar quieto.');
    await c.say('prof3', 'Agora escuta. Os javalis não são o problema. Os javalis são sintoma.');
    await c.say('prof3', 'Tem alguma coisa nesse hospital. No ar. O De Barros, da Vascular, percebeu antes de todo mundo. Vai falar com ele.');
    await c.say('narr', '*Ele joga uma chave pra você. O chaveiro é um javalizinho de borracha. Ele aperta o chaveiro antes. O chaveiro grunhe.*');
    await c.say('prof3', 'Porta dos fundos. E não conta pro Liberato que eu baguncei os laudos. Ainda não baguncei. Mas vou.');
  },

  // ---------------- PROFESSOR DE BARROS ----------------
  async clovis(c, game) {
    let ap = 0.2;
    const best = { sala: false, cavalos: false, no: false, perfeitamente: false };   // aprovação máxima = tudo certo
    const meter = () => c.meter(`🏛️ <b>APROVAÇÃO DO DE BARROS</b> · ${ap.toFixed(1).replace('.', ',')}%`);
    const up = v => { ap = Math.max(0, ap + v); meter(); };
    meter();

    await c.say('narr', '*Ele está escrevendo duas evoluções ao mesmo tempo. Uma com cada mão. As duas com letra melhor que a sua.*');
    await c.say('clovis', 'Ah. O interno do Javali.');
    await c.say('clovis', 'Senta. Não aí. Ali. Essa cadeira é italiana, eu prefiro que ninguém sente nela.  ...Mas tudo bem. Senta onde quiser.');

    await c.say('clovis', 'Você veio pela Ala C?');
    let i = await c.choose(['Vim. Matei uns javalis no caminho.', 'Vim correndo, professor.', 'O senhor tem uma sala muito bonita.', 'Vim pela porta dos fundos do Javali.']);
    if (i === 0) { up(0.1); await c.say('clovis', 'Matou. Interessante. Eu teria desviado. Mas cada um tem o seu estilo. O seu é... um estilo.'); }
    if (i === 1) await c.say('clovis', 'Correr é uma escolha. Não seria a minha. Mas é uma escolha.');
    if (i === 2) { up(0.3); best.sala = true; await c.say('clovis', 'Obrigado. É a menor das minhas salas. A de casa tem vista pro mar. A de Gramado tem vista pra outra sala minha.'); }
    if (i === 3) await c.say('clovis', 'Eu imaginei. Você tem cara de quem entra pela porta dos fundos. Não é uma crítica. É uma observação. Que por acaso é uma crítica.');

    await c.say('clovis', 'Bom. Vamos ao que interessa. Tem uma infecção nesse hospital. No ar. Eu sinto.');
    await c.say('clovis', 'Literalmente: eu sinto o cheiro. Fiz um curso de vinhos em Bordeaux. Essa aqui é uma Klebsiella. Safra 2026. Notas de corredor úmido e prescrição atrasada.');
    await c.say('clovis', 'E a CCIH não autoriza CEFALEXINA. Cefalexina! Eu dou cefalexina pro meu cavalo. Eu tenho três cavalos. O do meio é alérgico, mas os outros dois tomam.');
    i = await c.choose(['Mas por que a CCIH não autoriza?', 'O senhor tem três cavalos?', 'Cefalexina pra infecção hospitalar não é meio...?']);
    if (i === 0) await c.say('clovis', 'Porque o Schwarzenegger não assina. Ele não assina porque não tem tempo. Ele não tem tempo porque está sempre dando entrevista.');
    if (i === 1) { up(0.2); best.cavalos = true; await c.say('clovis', 'Três. E uma lancha. Chama "Meropenem". Era pra ser "Cefalexina", mas a CCIH também não autorizou o nome.'); }
    if (i === 2) { up(-0.1); await c.say('clovis', 'Meio o quê? Termine as frases, interno. Frases pela metade são como pontes de safena pela metade.  ...Eu sei, eu sei. Mas eu tenho razão.'); }

    await c.say('clovis', 'Antes de eu te mandar resolver isso, me mostra uma coisa. Dá um nó cirúrgico.');
    await c.say('clovis', 'Com a mão ESQUERDA primeiro. Eu sou ambidestro. Espero que você seja pelo menos destro.');
    if (TOUCH.on) await c.say('narr', '*Siga as setas: arraste o fio na direção certa, uma laçada de cada vez. Se demorar, o fio afrouxa. Mão esquerda do lado esquerdo, mão direita do lado direito, que vem com diagonais. O De Barros cantarola junto, meio tom acima.*');
    const e = await c.knot('esquerda');
    if (e.timeout) await c.say('clovis', 'Demorou. O fio... soltou. Interessante. Os pacientes também soltam, sabia? Da gente. Pela confiança.');
    else if (e.errors === 0) { up(0.4); await c.say('clovis', 'Hm.'); }
    else await c.say('clovis', `${e.errors} ${e.errors === 1 ? 'hesitação' : 'hesitações'}. Na minha época isso era reprovação. Mas a época é outra. Infelizmente.`);

    await c.say('clovis', 'Agora a DIREITA.');
    const d = await c.knot('direita');
    if (d.timeout) await c.say('clovis', 'Hm. Bom, ninguém nasce sabendo. Alguns nascem sabendo. Eu nasci.');
    else if (d.errors === 0) { up(0.4); await c.say('clovis', 'Hm. Hm.'); }
    else await c.say('clovis', 'Dá pra melhorar. Tudo dá pra melhorar. Até isso aqui. Principalmente isso aqui.');

    const perfect = !e.timeout && !d.timeout && e.perfect && d.perfect;
    if (perfect) {
      best.no = true;
      await c.say('narr', '*Ele olha pro nó. Olha pra você. Olha pro nó de novo. Ajusta os óculos sem aro.*');
      ap = 7.3; meter();
      await c.say('clovis', '...Razoável.');
      await c.say('narr', '*Silêncio. Ele parece surpreso consigo mesmo. Em algum lugar, um anjo ganha asas. Ou um residente ganha folga.*');
      game.achievement();
    } else {
      await c.say('clovis', 'Bom. Vai ter que servir.');
    }

    await c.say('clovis', 'Então. Você vai resolver o problema da CCIH. Vai lá e fala com o Schwarzenegger.');
    i = await c.choose(['Ele é parente do Arnold?', 'E se ele não quiser assinar?', 'Certo, professor.', 'Perfeitamente, professor.']);
    if (i === 0) await c.say('clovis', 'Ninguém sabe. Ele também não. Perguntaram numa entrevista. Ele deu uma resposta de quarenta minutos e ninguém entendeu.');
    if (i === 1) await c.say('clovis', 'Ele nunca quer. Mas ele está SEMPRE atrasado pra alguma entrevista. Quando o telefone dele tocar, ele assina qualquer coisa pra se livrar de você. Use isso.');
    if (i === 2) await c.say('clovis', '"Certo, professor." Curto. Objetivo. Eu teria dito "Perfeitamente". Mas tudo bem.');
    if (i === 3) { up(0.6); best.perfeitamente = true; await c.say('clovis', '"Perfeitamente." ...Era exatamente o que eu teria dito. Exatamente. Não sei se gosto disso.'); }
    await c.say('clovis', 'São três documentos: PARECER, JUSTIFICATIVA e TERMO DE RESPONSABILIDADE. Três assinaturas.');
    await c.say('clovis', 'E cuidado com o olhar dele. Não é força de expressão. Esconda-se atrás dos pilares. E ele arremessa seringas. Contaminadas. Ele diz que é "didático".');
    await c.say('narr', '*Ele te entrega uma caneta Montblanc.*');
    await c.say('clovis', 'Pra ele assinar. Não perde. Ela custa mais que o seu carro.  ...Você tem carro? Não responde. Eu já sei.');

    // APROVAÇÃO MÁXIMA: sala elogiada, cavalos, nó perfeito nas duas mãos e "Perfeitamente"
    if (best.sala && best.cavalos && best.no && best.perfeitamente) {
      ap = 9.9; meter();
      await c.say('narr', '*O medidor de aprovação trava em 9,9%. Ninguém nunca viu esse número. Os outros 90,1% são dos cavalos.*');
      await c.say('clovis', 'Interno. Espera.');
      await c.say('narr', '*Ele abre um armário de madeira escura. Lá dentro, uma carabina. Coronha de ipê-amarelo, envernizada, com as iniciais D.B. gravadas em latão.*');
      await c.say('clovis', 'Carabina de ipê. Eu mesmo escolhi a árvore. Ela já tinha caído. Eu acho.');
      await c.say('clovis', 'Na CCIH você vai precisar de argumentos melhores que o revólver do torácico. Oito tiros. Mais pesada. Mais elegante. Como tudo que é meu.');
      game.carabina();
      await c.say('clovis', 'Devolve depois. Encerada. Com óleo de peroba, não com qualquer coisa.');
    }
  },

  // ---------------- O CHEFE ----------------
  async belgicaIntro(c) {
    await c.say('belgica', 'Interno. Eu tenho exatamente dois minutos. Tenho uma entrevista. Na verdade tenho três.');
    await c.say('belgica', 'Cefalexina? Não. A CCIH não autoriza cefalexina sem PARECER, sem JUSTIFICATIVA e sem TERMO DE RESPONSABILIDADE.');
    const i = await c.choose(['Eu trouxe os três, professor. Só falta assinar.', 'O De Barros mandou eu resolver isso.', 'O senhor é parente do Arnold?']);
    if (i === 0) await c.say('belgica', 'E você acha que eu vou assinar? Assim? Sem uma reunião? Sem uma ata? Sem uma entrevista sobre o assunto?');
    if (i === 1) await c.say('belgica', 'O De Barros. Claro. O De Barros resolve tudo mandando alguém resolver. Ele tem três cavalos, sabia? Ele te contou dos cavalos.');
    if (i === 2) await c.say('belgica', 'Essa é uma ótima pergunta. Tenho uma resposta de quarenta minutos. Mas não agora, tenho uma entrevista. Sobre isso, inclusive.');
    await c.say('belgica', 'Agora, se me dá licença...');
    await c.say('narr', '*Os olhos dele começam a brilhar. Roxo. Isso não é normal. Nada aqui é normal.*');
  },

  async belgicaDefeat(c) {
    await c.say('belgica', '...Está bem. ESTÁ BEM.');
    await c.say('belgica', 'CEFALEXINA LIBERADA.');
    await c.say('belgica', 'Mas que fique registrado em ata. E que ninguém saiba que eu fui convencido por um interno. Com uma Montblanc do De Barros.');
    await c.say('belgica', 'Agora, se me dá licença, eu estou quarenta minutos atrasado pra uma entrevista. Pela terceira vez hoje.');
    await c.say('narr', '*Ele sai correndo pelo corredor, já ajeitando o cabelo, já falando ao telefone. Os olhos ainda brilham um pouco.*');
    await c.say('eu', 'A cefalexina está liberada. Mas o cheiro de Klebsiella... continua no ar.');
  },
};

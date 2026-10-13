// Roteiros do Capítulo 4: o Centro Obstétrico — o cardiotocógrafo com mau contato e a fita que ninguém consegue imprimir.
// Revisão clínica: PENDENTE — conferir as manobras de Leopold, o toco e a leitura do traçado com a Obstetrícia.
// (A leitura fala em "Categoria I/III", que é do NICHD/ACOG 2008; a FIGO 2015 usa normal/suspeito/patológico. Escolher uma.)
// Regra da casa (docs/etica-pacientes.md): aqui NINGUÉM corre risco. O som esquisito é do aparelho, nunca do bebê.
// O bebê está bem o tempo todo, quem erra é o interno — o Tcheco corrige e a Rosane resolve com um Pinard em 4 segundos.
// o medidor da direita é a tranquilidade da gestante: som esquisito derruba, explicação sobe
function medidor(c, v) { c.meter('👶 <b>JAQUELINE</b> · ' + (v >= 3 ? '<span class="ok">CONFIANDO</span>' : v === 2 ? 'DESCONFIADA' : '<span class="no">APREENSIVA</span>')); }
const STORY4 = {

  // ---------------- A CHEGADA ----------------
  // devolve { lado, nivel, broncas, erradas } pro capítulo rodar o minijogo.
  // broncas = escorregões de conduta (sem licença, gel no toco) · erradas = respostas erradas (Leopold, onde procurar, toco)
  async tcheco1(c) {
    const med = v => medidor(c, v);
    let tr = 2, broncas = 0, erradas = 0;

    await c.say('narr', '*Dentro do Centro Obstétrico a luz é outra: fria, branca, sem apagão. A porta fecha e o chiado do corredor fica do lado de fora.*');
    await c.say('narr', '*No leito PPP, uma gestante de barriga alta, camisola do hospital, a mão espalmada no flanco. Ao lado, um homem de moletom em pé junto da cadeira do acompanhante, como quem já desistiu de sentar.*');
    await c.say('narr', '*Uma enfermeira de touca confere o soro. E, de jaleco, olhando pro cardiotocógrafo como quem olha pra um aluno que não fez a lição: o Professor Tcheco.*');
    await c.say('tcheco', 'Entrou. Fecha a porta, que o Falastrão ainda está dando entrevista lá fora.');
    await c.say('tcheco', 'Você é o interno do plantão. Eu sou o Tcheco, Obstetrícia. Essa é a Jaqueline, 38 semanas, em trabalho de parto inicial. Essa é a Rosane, enfermeira obstetra, e ela sabe mais de parto do que eu e você juntos.');
    await c.say('rosane', 'Fala assim na frente deles e eles ficam confiados, professor.');
    await c.say('sandro', 'Sandro. Marido, acompanhante, ansioso. Ela tá sentindo contração de cinco em cinco, e esse aparelho aí faz barulho de rádio velho desde que a gente chegou.');
    await c.say('tcheco', 'Faz. Por isso você está aqui.');
    await c.say('tcheco', 'O CTG imprimiu a noite inteira. Agora o cabo tem mau contato, e o que sai é canto de baleia em cima do traçado. Eu preciso de vinte minutos de batimento fetal legível pra decidir o que fazer. Vinte. Contínuos.');
    await c.say('tcheco', 'O aparelho tem um dial de sintonia porque o técnico do rádio da cidade o consertou em 1998. Não é piada. É o que tem.');
    med(tr);
    await c.say('jaque', 'Dói nas costas também, professor. Dói pra caramba.');
    await c.say('tcheco', 'Vai doer mais. E o interno aqui vai pôr o aparelho na sua barriga agora, se você deixar.');

    // ---------- 0. PEDIR LICENÇA (consentimento: é mecânica, não decoração) ----------
    let i = await c.choose([
      'Jaqueline, posso ligar o aparelho e pôr o transdutor na sua barriga?',
      'Vou começar por aqui.',
      '[Já vai encostando o transdutor na barriga dela]',
    ]);
    if (i === 0) {
      await c.say('jaque', 'Pode. Faz o que precisa. Só me avisa do que você vai fazer antes de fazer, tá?');
      await c.say('sandro', 'Obrigado por perguntar. Ninguém perguntou até agora.');
      tr++;
    } else {
      broncas++;
      await c.say('sandro', 'OPA. Pergunta antes! Ela não é o aparelho.');
      await c.say('jaque', 'Tá tudo bem. Só... avisa. Eu tô aqui, eu escuto.');
      await c.say('tcheco', 'Anotado, interno. Consentimento não é etapa: é a primeira coisa. De novo, com a boca.');
      tr--;
    }
    med(tr);

    // ---------- 1. MANOBRAS DE LEOPOLD ----------
    await c.say('narr', '*Você passa as mãos no abdome da Jaqueline, com a palma, sem apertar — as manobras de Leopold, na ordem.*');
    await c.say('narr', '*1. No fundo do útero, alto, logo abaixo do rebordo: uma massa grande, macia e irregular — são as nádegas. 2. Nos flancos: do lado DIREITO dela, uma superfície lisa, dura e contínua, feito uma tábua — o dorso; do outro, partes pequenas e irregulares. 3. Em cima do púbis, uma parte redonda e dura: é a cabeça. 4. Ela já desceu na pelve: está encaixada, quase não se mexe.*');
    await c.say('tcheco', 'Traduz. O que os achados te dizem?');

    while (true) {
      i = await c.choose(['Apresentação cefálica, dorso à direita.', 'Apresentação pélvica, dorso à direita.', 'Não dá pra saber a apresentação sem ecografia.']);
      if (i === 0) break;
      erradas++;
      if (i === 1) await c.say('tcheco', 'Pélvica? O que está lá embaixo, encaixado, é redondo e duro: é a cabeça. O macio e irregular lá no fundo são as nádegas. De novo.');
      else await c.say('tcheco', 'Leopold é exame de MÃO, interno. Você acabou de fazer. Repete.');
    }
    await c.say('tcheco', 'Cefálica, dorso à direita. Guarda isso, porque é isso que decide onde você vai procurar.');

    while (true) {
      i = await c.choose([
        'Abaixo do umbigo, do lado direito dela.',
        'Acima do umbigo, do lado direito dela.',
        'Bem em cima do umbigo, no meio.',
      ]);
      if (i === 0) break;
      erradas++;
      if (i === 1) await c.say('tcheco', 'A cabeça está embaixo, encaixada. Os BCF ficam onde estão as costas de quem está de cabeça pra baixo: embaixo. De novo.');
      else await c.say('tcheco', 'No meio você acha o cordão ou a placenta, embaixo do seu próprio transdutor. Perto do dorso é onde as costas do bebê estão coladas na parede do útero. De novo.');
    }
    await c.say('tcheco', 'Isso. Abaixo do umbigo, do lado do dorso. Anota no teu caderno mental e nunca mais esquece.');
    tr++;
    med(tr);

    // ---------- 2. O TOCO (e a armadilha do gel) ----------
    await c.say('rosane', 'Toco na mão. Onde vai o toco, interno?');
    while (true) {
      i = await c.choose([
        'No fundo do útero, em cima, sem gel.',
        'No fundo do útero, em cima, com gel.',
        'Em cima do umbigo, com gel.',
      ]);
      if (i === 0) break;
      if (i === 1) {
        await c.say('rosane', 'Com gel. O toco vai SECO, interno. Ele não precisa acoplar som nenhum: ele mede a dureza da parede do útero na contração, encostado. Gel é pra transdutor de ultrassom, que precisa acoplar. Você ia lubrificar a mãe inteira à toa.');
        await c.say('sandro', 'E eu ia perguntar por quê.');
        await c.say('tcheco', 'Ela ia perguntar por quê. De novo.');
        broncas++;
        continue;
      }
      erradas++;
      await c.say('rosane', 'No umbigo. O toco mede a CONTRAÇÃO. O útero é um músculo que vai do fundo até o púbis — a contração se lê melhor no fundo, que é onde a parede se move. De novo.');
    }
    await c.say('rosane', 'Fundo do útero, seco. Isso. Aperta ele no cinto e esquece.');
    await c.say('tcheco', 'Agora a parte que interessa. O transdutor de ultrassom vai com gel — esse sim. Acha o foco: procura com calma, escuta, e quando o batimento estiver limpo, fixa a cinta.');
    await c.say('tcheco', 'E se o cabo falhar — e ele VAI falhar — bate no aparelho. Não com raiva. Com a mão plana, quando a luzinha do transdutor acender. Fora de hora você derruba o sinal e começa tudo de novo.');
    await c.say('jaque', 'E se não achar, doutor?');
    await c.say('rosane', 'Se ele não achar em quinze minutos eu pego o Pinard ali, encosto aqui na sua barriga e ouço em quatro segundos. Não tem aparelho nenhum disputando comigo.');
    await c.say('sandro', 'E por que a gente não usa o de pau e pronto?');
    await c.say('tcheco', 'Porque o Pinard te dá o número de agora, e eu preciso da LINHA das últimas duas horas. A fita mostra o que o coração do teu filho fez enquanto você não estava olhando. Um número é uma foto; um traçado é um filme.');
    med(tr);

    return { lado: 'direita', nivel: broncas >= 2 ? 0 : 1, broncas, erradas };
  },

  // ---------------- 5b. O TEMPO ACABOU: a Rosane e o Pinard ----------------
  // Errar não machuca ninguém: ela ouve em quatro segundos, o bebê está bem e quem sai humilhado é o interno.
  async pinard(c) {
    await c.say('rosane', 'Deu, interno. Jaqueline, posso escutar com o Pinard? É rapidinho.');
    await c.say('jaque', 'Pode.');
    await c.say('narr', '*A Rosane tira o Pinard do gancho, encosta abaixo do umbigo, do lado direito dela, cola a orelha na madeira e olha pro relógio de parede.*');
    await c.say('rosane', 'Cento e quarenta. Tá ótimo, os dois.');
    await c.say('narr', '*Depois ela pega o transdutor da sua mão, acha o foco de primeira, dá um tapa seco no aparelho e prende a cinta. A fita começa a correr.*');
    await c.say('tcheco', 'Quatro segundos. Anota isso também, interno.');
  },

  // ---------------- 6. LER O TRAÇADO (pergunta de prova, como a da Muriel) ----------------
  // r: o resultado do minijogo · semErro: até aqui foi tudo certo (conversa e aparelho)
  // Devolve quantas vezes errou a leitura (a SINTONIA FINA pede a leitura certa de primeira).
  async leitura(c, r, semErro) {
    let erradas = 0;
    await c.say('narr', '*A fita sai do aparelho devagar, dobrada em sanfona, com a linha do batimento subindo e descendo. A grade de papel quadriculado marca 60 lá embaixo e 200 lá em cima.*');
    await c.say('tcheco', 'Lê pra mim. Não quero o número. Quero a frase.');
    while (true) {
      const i = await c.choose([
        'Linha de base 140, variabilidade moderada, acelerações presentes, sem desacelerações. Categoria I.',
        'Linha de base 140 com variabilidade ausente e desacelerações tardias. Categoria III. Preparar cesárea.',
        'Bradicardia de 84. Frequência abaixo de 110 é sofrimento fetal. Preparar cesárea agora.',
      ]);
      if (i === 0) break;
      erradas++;
      if (i === 1) await c.say('tcheco', 'Categoria III? Olha a fita, interno. A linha TRABALHA. Tem aceleração aí, com o movimento dele. Variabilidade ausente é uma linha de régua. Isso aqui não é uma régua.');
      else {
        await c.say('tcheco', 'Oitenta e quatro. Oitenta e quatro.');
        await c.say('rosane', 'Professor, deixa eu. *Ela levanta o oxímetro do dedo da Jaqueline* Oitenta e quatro. É ela, interno. ' +
          (r.armadilhas.materna ? 'Foi em cima desse batimento que você quis fixar a cinta.' : 'A fita está em 140. O 84 é o pulso da mãe, não o do bebê.'));
        await c.say('rosane', 'Acontece, interno. Por isso existe uma coisa chamada pulso materno: você conta o dela e compara com o do aparelho. Em dez segundos você não confunde os dois nunca mais.');
        await c.say('jaque', 'Eu tô aqui. É o MEU coração batendo. Que bom que ele tá bom, né?');
        await c.say('sandro', 'Tá bom. Os dois.');
      }
    }
    await c.say('tcheco', 'Categoria I. Linha de base 140, variabilidade moderada, acelerações presentes, sem desaceleração nenhuma. Isso é um bebê tranquilo num útero contraindo.');
    await c.say('tcheco', 'Vinte minutos de fita limpa. Era só isso que eu precisava pra não te mandar pra cesárea às três da manhã.');
    if (r.armadilhas.dobra) await c.say('tcheco', 'E se em algum momento o visor mostrou 280 ou 70: era o aparelho contando dobrado ou pela metade. Batimento não pula de 140 pra 280. Outra coisa que o técnico do rádio ia adorar saber.');
    if (semErro && !erradas) {
      await c.say('tcheco', 'Sem um erro. Com o consentimento, os Leopold certos, a mão firme na hora certa e a leitura de primeira.');
      await c.say('tcheco', 'Isso aqui é das coisas que quase ninguém faz na primeira vez. Eu vou lembrar do teu nome. É o que eu tenho pra te dar a essa hora.');
    } else if (r.timeout) {
      await c.say('tcheco', 'A fita é da Rosane. A leitura, pelo menos, foi tua.');
      await c.say('rosane', 'Na próxima ele acha, professor. Eu levei um plantão inteiro pra aprender a bater nesse aparelho.');
    }
    return erradas;
  },

  // ---------------- O FIM DO CAPÍTULO ----------------
  async fim(c) {
    await c.say('narr', '*A fita fica presa na grade do leito com um clipe. A Rosane escreve a hora em cima, à caneta.*');
    await c.say('jaque2', 'Dá pra ver o coração dele aqui?');
    await c.say('tcheco', 'Dá. Esse morrinho é ele se mexendo. Esse aqui foi você tossindo. Esse é ele aguentando a contração. Todo mundo aguenta.');
    await c.say('jaque2', 'Então ele tá bem.');
    await c.say('tcheco', 'Ele está ótimo. Você está ótima. E a partir de agora a fita fica ligada e ninguém mais precisa adivinhar nada.');
    await c.say('sandro', 'Interno. Você falou pro meu filho? Ainda não falou? ...Fala qualquer coisa. Ele reconhece voz.');
    await c.say('narr', '*A Rosane apaga a luz grande pra Jaqueline descansar. Você se abaixa, perto da barriga, no escuro do quarto onde a única luz agora é a verde do monitor.*');
    await c.say('eu', 'Oi. Aqui é quem vai te pegar quando você chegar. Eu já sei que você está de cabeça pra baixo, que seu dorso é do lado direito e que você tem cento e quarenta. A gente já se conhece.');
    await c.say('jaque2', 'Ele mexeu.');
    await c.say('tcheco', 'Mexeu porque você falou. Segura a lágrima, interno, que são três da manhã e ainda tem plantão.');
  },
};

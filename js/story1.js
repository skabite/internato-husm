// Roteiros do Capítulo 1. Cada um é uma função async que recebe a api do CONVO (say, choose, ig, laudos, wait).
const STORY1 = {
  // ---------------- CUTSCENE ANTES DO MONTEIRO ----------------
  // Os testers não entendiam que ele fala demais e que o jogo é interromper. Aqui o jogo avisa antes.
  async monteiro(c) {
    const cue = `<span class="cue">◆ ELE ESTÁ RESPIRANDO — ${TOUCH.on ? 'INTERROMPER' : '[ESPAÇO]'}! ◆</span>`;
    c.meter('');
    await c.say('narr', '*Na frente das catracas, à luz de uma lanterna, um homem de jaleco grava um áudio de WhatsApp. O contador marca 11:47.*');
    await c.say('monteiro', '...e por isso que o feijão de quinta é o de segunda apurado, tá, e isso me lembra o PROCX, que não é o PROCV... não, peraí. Peraí. Vou apagar. Vou começar esse áudio de novo.');
    await c.say('eu', 'Ah, não. O Professor Monteiro.');
    await c.say('eu', 'Os veteranos avisaram no grupo...');
    AUDIO.sfx('notify');
    await c.say('zap', 'Veterana: regra nº 1 do HUSM: se o MONTEIRO te pegar no saguão, ninguém vem te salvar 💀');
    AUDIO.sfx('notify');
    await c.say('zap', 'Veterano: ele NÃO PARA de falar. tomate, PROCV, podcast, Lei 8.080. já vi interno perder o plantão inteiro ali');
    AUDIO.sfx('notify');
    await c.say('zap', 'Veterana: o único jeito é INTERROMPER. mas SÓ quando ele respira. cortou no meio da frase, ele perde o fio e começa TUDO de novo');
    AUDIO.sfx('notify');
    await c.say('zap', 'Veterano: e não dá corda ("nossa, sério?") que ele se empolga. puxa pro assunto. mas também não fica calado: silêncio ele preenche com história');
    await c.say('eu', 'Interromper quando ele respira. Puxar pro assunto. Não dar corda. Não ficar calado.');
    c.meter(cue);
    await c.say('narr', TOUCH.on
      ? '*COMO FUNCIONA: quando esse aviso amarelo piscar, ele está respirando. Na conversa, o botão CONTINUAR vira INTERROMPER!: toque na hora. Fora da respiração, não toque.*'
      : '*COMO FUNCIONA: quando esse aviso amarelo piscar, ele está respirando. Aperte [ESPAÇO] na hora. Fora da respiração, não aperte.*');
    c.meter('');
    await c.say('narr', '*Cada interrupção certa e cada pergunta sobre o apagão enchem a barra FOCO DO PROFESSOR, em cima da caixa de conversa. Com 100%, ele finalmente diz o que você tem que fazer.*');
    const i = await c.choose(['[Tentar passar de fininho]', '[Respirar fundo e ir]']);
    if (i === 0) await c.say('narr', '*Seu tênis guincha no piso. No silêncio do apagão, é praticamente uma sirene.*');
    else await c.say('narr', '*Você respira fundo. Ele também. E aí você percebe: ele respira MUITO pouco.*');
    await c.say('narr', '*O áudio termina em 14:02. Ele guarda o celular. E te vê.*');
  },

  // ---------------- PROFESSOR LIBERATO ----------------
  async dudu(c, game) {
    await c.say('dudu', 'Você chegou atrasado.');
    await c.say('dudu', 'Dezenove horas e quatro minutos. O internato começa às dezenove horas. Não às dezenove e quatro. Às dezenove.');

    let i = await c.choose([
      'Desculpa, professor. A luz caiu e...',
      'O outro professor me segurou no saguão.',
      'Na verdade, no meu celular são 19h03.',
      '[Ficar em silêncio e olhar para o chão]',
    ]);
    if (i === 0) await c.say('dudu', 'A luz caiu às dezoito e doze. Você teve cinquenta e dois minutos para se adaptar. Eu me adaptei em quatro.');
    if (i === 1) await c.say('dudu', 'O do saguão. Sei. Ele te contou dos tomates? ...Ele contou dos tomates.');
    if (i === 2) { c.ig(-1); await c.say('dudu', 'São 19h04. Eu sincronizo meu relógio com o Observatório Nacional toda segunda-feira. Às 7h00.'); }
    if (i === 3) await c.say('dudu', 'Pelo menos você sabe olhar pro chão. Ótimo. Ele precisa ser limpo, aliás. Mas não agora.');

    await c.say('dudu', 'Você é de qual turma?');
    i = await c.choose([
      'Da turma que tá rodando com o senhor, professor. A sua turma.',
      'Sei lá, a que tá rodando agora.',
      'Da turma que vai te homenagear na formatura!',
      'Da turma do grupo do WhatsApp que o senhor não tá.',
    ]);
    if (i === 0) { c.ig(+1); await c.say('dudu', 'Minha turma. ...Minha turma.  *Ele quase sorri. Quase.*'); }
    if (i === 1) { c.ig(-1); await c.say('dudu', '"A que tá rodando agora." É assim que vocês me veem também? Alguém que "tá rodando agora"?'); }
    if (i === 2) {
      c.ig(+2);
      await c.say('dudu', '...Vocês vão?');
      await c.say('dudu', 'A turma passada homenageou o anestesista. O ANESTESISTA. Ele dormiu na própria homenagem. Eu estava acordado. Eu sempre estou acordado.');
    }
    if (i === 3) { c.ig(-2); await c.say('dudu', 'Que grupo.  ...Que grupo?  Eu não fui adicionado em grupo nenhum.  Anotado.'); }

    await c.say('dudu', 'Outra coisa. Quando é o meu aniversário?');
    i = await c.choose([
      'Doze de março!',
      'Hoje?!',
      'Eu mandei parabéns no grupo, professor!',
      '[Abrir o Instagram discretamente]',
    ]);
    if (i === 0) { c.ig(-1); await c.say('dudu', 'Doze de março é o aniversário do anestesista.'); }
    if (i === 1) { c.ig(+1); await c.say('dudu', 'Não. Mas obrigado pela intenção. Vou considerar. Parcialmente.'); }
    if (i === 2) { c.ig(+1); await c.say('dudu', 'Mandou. 14h37. Com emoji de bolo. Eu vi. Eu sempre vejo.'); }
    if (i === 3) { c.ig(-1); await c.say('dudu', 'Eu tô vendo você abrir o Instagram. Eu tô vendo você ver que eu deixei de te seguir em 2024. E voltei. E deixei de novo.'); }

    await c.say('dudu', 'Enfim. Como você chegou atrasado, você vai passar a noite no hospital. Plantão. Sem luz. É pedagógico.');
    await c.say('dudu', 'E, a propósito: leve esses laudos de colonoscopia para o Javali, lá no fim da Ala C.');
    await c.say('dudu', 'Mas não assim. Eles precisam estar em ordem crescente de prontuário. Crescente. Arrume.');
    const erros = await c.laudos();
    if (erros === 0) { c.ig(+1); await c.say('dudu', 'Perfeito. Quer dizer... aceitável. Não, perfeito. Não espalha que eu disse isso.'); }
    else if (erros < 3) await c.say('dudu', `${erros} ${erros === 1 ? 'erro' : 'erros'}. Vou anotar na sua avaliação. A lápis. Por enquanto.`);
    else { c.ig(-1); await c.say('dudu', `${erros} erros. ${erros}. Eu vou precisar lavar as mãos depois disso.`); }

    await c.say('dudu', 'Ah. Mais uma coisa. Eu ouvi uns sons de suínos vindo de lá. Grunhidos. Desde as dezoito e treze.');
    await c.say('dudu', 'Então leve isso.');
    game.giveScalpel();
    await c.say('narr', '*Ele te entrega um bisturi nº 22. Embalado. Estéril. Etiquetado com data, hora e as iniciais "D."*');
    i = await c.choose(['Um bisturi? Contra porcos?', '[Aceitar em silêncio]']);
    if (i === 0) await c.say('dudu', 'Javalis, provavelmente. Santa Maria tem javali. É um problema ambiental sério. Eu li um artigo. Dois, na verdade. Em ordem cronológica.');
    else await c.say('dudu', 'Bom. Silêncio é uma virtude que a sua turma ainda não tem.');

    await c.say('dudu', 'Pode ir. E... interno.');
    await c.say('dudu', 'A turma vai fazer churrasco sábado? Ninguém me chamou ainda. É só curiosidade. Estatística.');
    i = await c.choose(['Claro que o senhor vai ser chamado, professor!', 'Não sei de churrasco nenhum.', 'O senhor leva a picanha?']);
    if (i === 0) { c.ig(+1); await c.say('dudu', 'Ótimo. Eu levo o carvão. Separado por tamanho.'); }
    if (i === 1) { c.ig(-1); await c.say('dudu', 'Entendi. Entendi perfeitamente.  *Ele pega o celular.*'); }
    if (i === 2) await c.say('dudu', 'Eu levo a picanha se eu for convidado. Formalmente. Por escrito.');

    await c.wait(0.4);
    return game.following();
  },

  // ---------------- CONSULTÓRIO 4: MAAA, o veterano, lendo na maca ----------------
  async maaa(c) {
    await c.say('narr', '*Um interno sentado na beirada da maca, pernas balançando, lendo um livro de capa roxa: "As Portas da Percepção", Aldous Huxley. Ele é a única pessoa sem pressa no hospital inteiro.*');
    await c.say('maaa', 'Ô. Interno novo? Fica à vontade. A maca é minha, mas a sala é de todo mundo.');
    let i = await c.choose(['Você não tá de plantão?', 'Que livro é esse?', 'Você não tem medo desse escuro?']);
    if (i === 0) await c.say('maaa', 'Tô. O plantão é aqui. Se alguém precisar, me acha. Ninguém precisa de interno às sete da noite. Só às três da manhã.');
    if (i === 1) {
      await c.say('maaa', 'Huxley. Ele diz que o cérebro funciona como uma válvula: filtra quase tudo o que existe e deixa passar só o que serve pra gente sobreviver.');
      await c.say('maaa', 'A faculdade também ensina a filtrar. A gente aprende a deixar passar a doença e filtrar a pessoa. Eu leio isso aqui pra abrir um pouco a válvula.');
    }
    if (i === 2) await c.say('maaa', 'Do escuro, não. Do Monteiro, um pouco. Ele te pegou no saguão? ...Pegou. Dá pra ver na sua cara.');
    await c.say('maaa', 'Posso te contar uma coisa? Eu nem gosto de medicina.');
    i = await c.choose(['Como assim?', 'Então por que você tá aqui?', '[Ficar quieto e escutar]']);
    if (i === 0) await c.say('maaa', 'Não gosto da prova. Do jargão. Da hierarquia. De decorar via metabólica. Isso aí é com o ADC.');
    if (i === 2) await c.say('narr', '*Ele fecha o livro com o dedo marcando a página. Parece que pouca gente escuta ele até o fim.*');
    await c.say('maaa', 'Mas eu gosto de gente. De ajudar as pessoas. De ver alguém entrar mal e sair um pouco melhor por causa de alguma coisa que eu fiz. Nem que seja só ter escutado.');
    await c.say('maaa', 'A medicina foi o jeito que eu achei de fazer isso todo dia. Ela é a ferramenta, não o motivo. Às vezes eu esqueço. Aí eu leio.');
    i = await c.choose(['Faz sentido.', 'Acho que eu também sou assim.', 'Você devia falar isso pros professores.']);
    if (i === 0) await c.say('maaa', 'Faz. Guarda isso pra madrugada. É quando mais faz falta.');
    if (i === 1) await c.say('maaa', 'Então você vai ficar bem. Vai cansar, vai errar, vai chorar no banheiro do segundo andar. Mas vai ficar bem.');
    if (i === 2) await c.say('maaa', 'Eles sabem. Lá no fundo, uns três sabem. O Liberato sabe, mas anota com outro nome.');
    await c.say('maaa', 'Dica de veterano: se o Liberato te perguntar quando é o aniversário dele, NÃO chuta uma data.');
    await c.say('maaa', 'E fala com o ADC ali no computador. Ele vai te fazer uma pergunta, e ele leva a sério. Dá uma olhada na mesa dele antes. Ele não é discreto.');
    await c.say('narr', '*Ele volta pro livro. Vira a página como quem abre uma porta.*');
  },
  MAAA_DE_NOVO: [
    '"Se as portas da percepção fossem limpas, tudo apareceria como é: infinito." Isso é do Blake. O Huxley pegou emprestado. Que nem eu com essa maca.',
    'Ajudar dá trabalho. Mas é o único trabalho que eu não sinto como trabalho.',
    'Se precisar de alguém pra escutar, eu tô aqui. A maca é minha, mas a escuta é de graça.',
    'Vai lá. E se ficar difícil, lembra por que você entrou. Não o motivo da entrevista. O de verdade.',
  ],

  // ---------------- CONSULTÓRIO 4: ADC, no computador ----------------
  // o: { ok() } — só tem uma chance; devolve 'ok' ou 'erro'
  async adc(c, o) {
    await c.say('narr', '*No computador do consultório, ligado no nobreak, um interno passa tomografias e ressonâncias. Rola, rola, rola. A tela é a única coisa acesa na sala.*');
    await c.say('adc', 'Pera. ...Pera. Olha esse corte. Olha esse T2. Lindo.');
    await c.say('adc', 'Você é o interno novo. Não precisa se apresentar, eu vi seu reflexo no monitor.');
    await c.say('adc', 'Uma pergunta. Só uma. E eu levo isso muito a sério.');
    await c.say('adc', 'Qual é o seu erro inato do metabolismo favorito?');
    const OPS = ['Deficiência de G6PD', 'Fenilcetonúria', 'Síndrome de Lesch-Nyhan', 'Doença de Gaucher', 'Doença da urina do xarope de bordo'];
    const i = await c.choose(OPS);
    if (OPS[i] === 'Síndrome de Lesch-Nyhan') {
      await c.say('narr', '*Ele tira os olhos da tela. Pela primeira vez na noite.*');
      await c.say('adc', 'LESCH-NYHAN.');
      await c.say('adc', 'Deficiência de HGPRT. A via de salvamento das purinas para, o ácido úrico vai lá em cima. Ligada ao X. Uma enzima a menos e muda tudo.');
      await c.say('adc', 'Doença dura pra quem tem, hein. Favorita de estudar, não de ter. Mas ninguém responde isso. Todo mundo responde G6PD.');
      await c.say('narr', '*Ele levanta a mão pra um "toca aqui". É tão rápido que você nem vê. Agora você vê. Tudo parece um pouco mais devagar.*');
      o.ok();
      await c.say('narr', '*Você se sente mais ágil.*');
      await c.say('adc', 'Agora vai. E se um javali vier pra cima de você, desvia. Você consegue. Eu vi seu reflexo.');
      return 'ok';
    }
    if (i === 0) await c.say('adc', 'G6PD. Fava, sulfa, primaquina, hemólise. Clássico. É o favorito de todo mundo. Por isso não é o meu.');
    if (i === 1) await c.say('adc', 'Fenilcetonúria. Teste do pezinho, dieta sem fenilalanina. Respeito. Mas é famosa demais.');
    if (i === 3) await c.say('adc', 'Gaucher. Você escolheu pelo nome, né? Gaúcho. Não vale.');
    if (i === 4) await c.say('adc', 'Xarope de bordo. Cheiro de panqueca. Ótima escolha. Errada, mas ótima.');
    await c.say('adc', 'Tudo bem. Não existe resposta errada pra favorito.');
    await c.say('adc', '...Existe, sim. Mas tudo bem.');
    await c.say('narr', '*Ele volta pra tela. A conversa acabou. Pra ele, acabou faz tempo.*');
    return 'erro';
  },
  ADC_DE_NOVO: {
    ok: ['HGPRT. Fala comigo quando quiser. Sobre purina. Só sobre purina.', 'Olha esse corte. ...Não, olha mesmo.', 'Tá desviando bem? Eu sabia.'],
    erro: ['Eu ainda tô pensando na sua resposta. Não de um jeito bom.', 'Agora não. Tô no corte 23 de 40.', 'Lê a mesa. Sempre lê a mesa. Mas agora é tarde.'],
  },

  // ---------------- PENSAMENTO DO INTERNO ----------------
  async thought(c) {
    await c.say('eu', 'Um bisturi. Contra javalis.');
    await c.say('eu', '...');
    await c.say('eu', 'O cirurgião torácico guarda um revólver na sala dele. Todo mundo sabe. Ninguém fala.');
    await c.say('eu', 'A sala da Cirurgia Torácica fica bem do outro lado do corredor. Vou pegar o revólver.');
  },

  async gunFound(c, where) {
    await c.say('narr', `*${where}: embaixo de um Sabiston de 2004, um revólver .38. Carregado. Tem um bilhete preso com esparadrapo:*`);
    await c.say('narr', '"PARA JAVALIS. E RESIDENTES QUE MEXEM NA MINHA GAVETA."');
    await c.say('eu', 'Ok. Ok. Agora é só atravessar a Ala C.');
  },

  // ---------------- JAVALI ----------------
  async prof3(c, game) {
    await c.say('prof3', '...');
    await c.say('prof3', 'Ah. Os laudos do Liberato.');
    await c.say('narr', '*Ele folheia. Devagar. Muito devagar.*');
    await c.say('prof3', 'Em ordem crescente de prontuário. Claro que estão.');
    await c.say('prof3', `Você atravessou a Ala C? Com esse barulho todo? ${game.kills > 0 ? `E esses ${game.kills} javalis aí atrás de você no chão?` : ''}`);
    await c.say('prof3', 'Eu não ouvi nada.');
    await c.say('narr', '*Ele funga. Um grunhido baixo escapa de algum lugar da sala. Talvez dele.*');
    const i = await c.choose(['Professor... o senhor ouviu isso?', 'Por que chamam o senhor de "O Javali"?', '[Deixar os laudos e sair de costas]']);
    if (i === 0) await c.say('prof3', 'Ouvi o quê?');
    if (i === 1) await c.say('prof3', 'Quem chama?  ...Quem te contou isso?');
    if (i === 2) await c.say('prof3', 'Fecha a porta quando sair. Eles ficam agitados com a luz.');
    await c.say('prof3', 'Pode deixar os laudos aí. E, interno...');
    await c.say('prof3', 'A noite está só começando.');
  },
};

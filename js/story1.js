// Roteiros do Capítulo 1. Cada um é uma função async que recebe a api do CONVO (say, choose, ig, laudos, wait).
const STORY1 = {
  // ---------------- DUDU DA GASTRO ----------------
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
    await c.say('dudu', 'E, a propósito: leve esses laudos de colonoscopia para o Professor3, lá no fim da Ala C.');
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

  // ---------------- PROFESSOR3 ----------------
  async prof3(c, game) {
    await c.say('prof3', '...');
    await c.say('prof3', 'Ah. Os laudos do Dudu.');
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

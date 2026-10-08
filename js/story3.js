// Roteiros do Capítulo 3: o plantão — Liberato não deixa você ir embora; a Professora Muriel no Leito 12
// (pancreatite, com a voz do Professor Máscara na cabeça); Professor Falastrão (chefe do PS).
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
    await c.say('dudu', 'Antes. E as colonoscopias? Os laudos que eu te dei.');
    i = await c.choose(['Entreguei tudo pro Javali.', 'O Javali... grunhiu pra eles.', 'Tinha um javali em cada leito, professor.']);
    if (i === 0) await c.say('dudu', 'Em ordem crescente de prontuário? ...Não responde. Eu já sei.');
    if (i === 1) await c.say('dudu', 'Grunhiu. Em que tom? ...Esquece. Eu anoto como "recebido".');
    if (i === 2) await c.say('dudu', 'Javalis são pacientes difíceis. Mas pontuais.');
    await c.say('dudu', 'Enfim. Você não pode sair. Você está de plantão.');

    let resto = ['Professor, nem tem luz.', 'Mas não tem ninguém internado nos leitos.'];
    while (true) {
      i = await c.choose(resto);
      if (resto[i].startsWith('Professor')) {
        await c.say('dudu', 'Luz é um detalhe. Eu já fiz trinta endoscopias com a lanterna do celular. Em ordem.');
        resto = resto.filter(l => !l.startsWith('Professor'));
        continue;
      }
      break;
    }
    await c.say('dudu', 'Não tem ninguém internado.');
    await c.say('dudu', '...');
    await c.say('dudu', 'Na verdade, tem.');
    await c.say('dudu', 'Leito 12. Ala C. Atrás da cortina. Você passou do lado dela correndo atrás de javali.');
    await c.say('dudu', 'Pancreatite. Internou ontem à noite. Ninguém prescreveu nada: o sistema caiu às 18h47. Junto com a luz.');
    i = await c.choose(['Quem é a paciente?', 'Por que o senhor não prescreveu?']);
    if (i === 1) await c.say('dudu', 'Eu sou o professor. Você é o interno. Isso se chama ensino. ...E eu estava realinhando os colonoscópios.');
    await c.say('dudu', 'É a Professora Muriel. Ela dá aula pra vocês. Ela vai te reconhecer. Ela reconhece todo mundo.');
    await c.say('dudu', 'Conversa. Examina. Lê o prontuário. Depois prescreve. Nessa ordem.');
    await c.say('dudu', 'E volta aqui pra me contar. Eu vou estar aqui. Exatamente aqui.');
    await c.say('narr', '*Ele dá dois passos pro lado. Exatos. O corredor está livre. De volta pra Ala C.*');
  },

  // ---------------- LEITO 12: A PROFESSORA MURIEL (avaliação) ----------------
  async muriel1(c) {
    await c.say('narr', '*Leito 12. Atrás da cortina, só a luz verde do monitor. Uma senhora de cabelo branco curtinho, óculos na cabeça, encolhida de dor.*');
    await c.say('muriel', 'Ai... finalmente alguém. Você é o interno? Eu te conheço. Você senta no fundo da sala. ...Ai.');
    let i = await c.choose(['Boa noite, professora. O que a senhora tá sentindo?', 'A senhora dá aula pra gente!', 'Eu sento no meio, professora.']);
    if (i === 1) await c.say('muriel', 'Dou. E vocês me amam. ...Ai. Depois a gente fala disso.');
    if (i === 2) await c.say('muriel', 'No meio do fundo. Ai.');

    const itens = ['Perguntar sobre a dor', 'Examinar o abdome', 'Ler o prontuário'], feito = [];
    while (feito.length < itens.length) {
      const resto = itens.filter(x => !feito.includes(x));
      const k = resto[await c.choose(resto)]; feito.push(k);
      if (k === itens[0]) {
        await c.say('muriel', 'Começou ontem de noite, depois de uma janta... caprichada. Aqui em cima, no meio. E vai pras costas, assim, como uma faixa.');
        await c.say('muriel', 'Vomitei três vezes. Não passa com nada. Dor em faixa: anota aí. Cai na prova.');
        i = await c.choose(['A senhora já teve pedra na vesícula?', 'A senhora bebe?', 'Tomou algum remédio novo?']);
        if (i === 0) await c.say('muriel', 'Um médico falou de umas pedrinhas, uns anos atrás. Eu ia operar. Eu IA.');
        if (i === 1) await c.say('muriel', 'Socialmente. Socialmente MESMO: uma taça no Natal. Agora, as pedrinhas na vesícula... dessas ninguém me pergunta.');
        if (i === 2) await c.say('muriel', 'Nada novo. Só as pedrinhas na vesícula que eu ia operar e não operei.');
      }
      if (k === itens[1]) {
        await c.say('narr', '*Abdome distendido, doloroso no epigástrio. Sem defesa, sem sinais de peritonite. Ruídos diminuídos. Sem icterícia. Mucosas secas.*');
        await c.say('narr', '*Monitor: FC 112, PA 104/66, SatO2 95%, Tax 37,9 °C. Taquicárdica e desidratada.*');
        await c.say('muriel', 'Pode apertar. ...NÃO TANTO.');
      }
      if (k === itens[2]) {
        await c.say('narr', '*Prontuário do Leito 12, preso na grade da maca. A letra do Liberato, perfeitamente alinhada.*');
        await c.say('narr', '*Lipase 1.840 U/L (referência: até 60). Leucócitos 14.200. PCR 48. Hematócrito 47%. Ureia 46, creatinina 1,0.*');
        await c.say('narr', '*Triglicerídeos 160. Cálcio normal. Bilirrubinas e enzimas hepáticas normais.*');
        await c.say('narr', '*Ecografia de abdome (ontem): vesícula com vários cálculos, sem sinais de colecistite. Pâncreas mal visto (gás).*');
        await c.say('narr', '*E uma anotação sublinhada duas vezes: "TC de abdome com contraste feita hoje. Imagens no NEGATOSCÓPIO, parede da Ala C. — L."*');
      }
    }
    await c.say('muriel', 'E então? Diagnóstico. Pergunta de prova.');
    while (true) {
      i = await c.choose(['Pancreatite aguda: dor típica e lipase mais de 3 vezes o normal.', 'Ainda não dá pra saber: falta a TC.', 'Colecistite aguda.']);
      if (i === 0) break;
      if (i === 1) await c.say('muriel', 'Errado. Dor típica e lipase acima de três vezes o normal: dois critérios. Dois de três já fecha. A TC é pra ver complicação. De novo.');
      if (i === 2) await c.say('muriel', 'Colecistite? Cadê o Murphy? Cadê a vesícula inflamada na eco? A pedra é a CAUSA, não o diagnóstico. De novo.');
    }
    await c.say('muriel', 'Isso. Dois de três critérios de Atlanta. Nota dez. ...Nove. Você demorou.');
    await c.say('eu', 'Pancreatite aguda, provavelmente biliar. Agora eu quero ver essa TC: se tem necrose, coleção... ou infecção.');
    await c.say('muriel', 'Vai. Eu espero. Não é como se eu tivesse outro compromisso. ...Ai.');
  },

  // ---------------- O NEGATOSCÓPIO: A TC ----------------
  async tc(c) {
    await c.say('narr', '*O negatoscópio, ligado no nobreak, é a coisa mais iluminada da Ala C. TC de abdome com contraste. Etiqueta: "LEITO 12 — M."*');
    await c.say('narr', '*Pâncreas aumentado. A gordura em volta, borrada, densificada. O pâncreas realça por inteiro, por igual. Nenhuma área escura sem realce. Nenhuma coleção. Nenhuma bolha de gás.*');
    while (true) {
      const i = await c.choose(['Pancreatite edematosa intersticial: sem necrose, sem coleção, sem gás. Sem infecção local.', 'Necrose infectada: tem que começar antibiótico agora.', 'Massa na cabeça do pâncreas.']);
      if (i === 0) break;
      if (i === 1) await c.say('eu', 'Não... necrose seria uma área que não realça. Infecção, bolhas de gás dentro dela. Aqui o pâncreas realça inteiro e não tem gás. Olha de novo.');
      if (i === 2) await c.say('eu', 'Não tem massa nenhuma. É um pâncreas inchado e inflamado, por igual. Olha de novo.');
    }
    await c.say('eu', 'Pancreatite aguda biliar, edematosa intersticial. Sem infecção local.');
    await c.say('eu', 'Sem falência de órgão: leve, por enquanto. Mas tem SIRS. Vigiar de perto.');
    await c.say('narr', '*(Cá entre nós: com o diagnóstico já fechado, essa TC nas primeiras 72 horas nem era obrigatória. Mas já que fizeram...)*');
    await c.say('eu', 'Agora é prescrever.');
  },

  // ---------------- A PRESCRIÇÃO (e a voz do Professor Máscara) ----------------
  // o: { flash(on), better(), perfect() } — devolve o número de erros
  async muriel2(c, o) {
    const rx = [];
    const sheet = () => c.meter('<div class="rx"><b>📋 PRESCRIÇÃO — LEITO 12</b><br>' + (rx.length ? rx.map((r, k) => `${k + 1}. ${r}`).join('<br>') : '<i>(em branco)</i>') + '</div>');
    sheet();
    await c.say('narr', '*Você volta pro Leito 12 e puxa a folha de prescrição. Caneta na mão.*');
    await c.say('muriel', 'E aí? O que você vai me dar? Pensa bem. Eu vou corrigir.');
    await c.say('narr', '*E então, lá do fundo da memória, uma voz...*');
    o.flash(true);
    await c.say('mascara', 'E se fosse a sua mãe? Você não daria antibiótico?');
    await c.say('narr', '*O Professor Máscara. Óculos de aro fino, barba por fazer. A máscara no queixo, como sempre. Nunca no rosto.*');
    await c.say('mascara', 'Febre. Leucocitose. PCR alta. Tá na cara, interno. Meropenem. E se fosse a sua MÃE?');
    o.flash(false);
    await c.say('narr', '*Você pisca. A Ala C volta. A caneta continua na sua mão.*');

    let errors = 0;
    const step = async (titulo, opts, ok, wrong, curto) => {
      await c.say('eu', titulo);
      while (true) {
        const i = await c.choose(opts);
        if (i === ok) { rx.push(curto); sheet(); return; }
        errors++;
        for (const [who, text] of wrong[i]) {
          if (who === 'mascara') o.flash(true);
          await c.say(who, text);
          if (who === 'mascara') o.flash(false);
        }
      }
    };
    await step('1) Hidratação.', ['Ringer lactato, moderado e guiado por meta: FC, diurese, ureia.', 'Seis litros de soro em bolus. De uma vez.', 'Restringir líquido pra não inchar o pâncreas.'], 0, {
      1: [['muriel', 'Seis litros?! Eu sou professora, não piscina. Hidratação agressiva demais só dá sobrecarga, sem melhorar nada. Moderado e guiado por meta.']],
      2: [['muriel', 'Eu tô taquicárdica e seca que nem pão de ontem. Eu preciso de volume, interno.']],
    }, 'Ringer lactato, guiado por meta (FC, diurese, ureia)');
    await c.say('muriel', 'Ringer. Gosto. Nem tanto, nem tão pouco.');
    await step('2) Dor.', ['Analgesia de verdade: dipirona, e opioide se precisar.', 'Opioide não: mascara o abdome.', 'Ela aguenta. É professora.'], 0, {
      1: [['muriel', 'Mito! Analgesia adequada, com opioide se precisar, é segura. Não esconde nada que importe. Ai.']],
      2: [['muriel', 'EU OUVI ISSO.']],
    }, 'Dipirona + opioide se dor');
    await c.say('muriel', 'Ai, graças a Deus.');
    await step('3) Dieta.', ['Dieta oral precoce, assim que a dor e o vômito deixarem.', 'Jejum até a lipase normalizar.', 'Nutrição parenteral total.'], 0, {
      1: [['muriel', 'Lipase não guia dieta. Jejum prolongado só piora o intestino. Comer cedo, conforme tolerar.']],
      2: [['muriel', 'Parenteral? Eu tenho intestino, interno. Se eu não conseguir comer, é sonda: enteral. Parenteral é exceção.']],
    }, 'Dieta oral precoce, conforme tolerância');
    await c.say('muriel', 'Comida. Finalmente alguém fala a minha língua.');
    o.flash(true);
    await c.say('mascara', 'E SE FOSSE A SUA MÃE?');
    o.flash(false);
    await step('4) Antibiótico.', ['Meropenem. Por via das dúvidas.', 'Ceftriaxona. Só por causa da febre.', 'Sem antibiótico: não tem infecção.'], 2, {
      0: [['mascara', 'ISSO! Meropenem! Eu sabia que você tinha potencial.'],
        ['muriel', 'Meropenem pra quê? Cadê a infecção? A TC não tem necrose nem gás. Antibiótico profilático na pancreatite não reduz infecção nem mortalidade. Só traz resistência, C. difficile e fungo.'],
        ['narr', '*(Em algum lugar do hospital, o Schwarzenegger sente uma perturbação na CCIH.)*']],
      1: [['mascara', 'Pelo menos uma ceftriaxona, né? Pela febre.'],
        ['muriel', 'Essa febre das primeiras horas é inflamação, interno. SIRS. Não é infecção. Sem foco, sem antibiótico.']],
    }, 'SEM antibiótico (sem infecção)');
    await c.say('eu', 'Se fosse a minha mãe, eu ia querer que tratassem o que ela TEM. Não o medo de quem prescreve.');
    o.flash(true);
    await c.say('mascara', '...');
    await c.say('mascara', 'Hm.');
    await c.say('narr', '*Na sua lembrança, a máscara escorrega do queixo dele. Ele não pega.*');
    o.flash(false);
    await step('5) E a vesícula?', ['Colecistectomia nesta internação, quando ela melhorar.', 'CPRE de urgência agora.', 'Alta, e a vesícula a gente vê outro dia.'], 0, {
      1: [['muriel', 'CPRE de urgência é pra colangite ou obstrução que não cede. Minhas bilirrubinas estão normais. Pode guardar o duodenoscópio.']],
      2: [['muriel', '"Outro dia" foi como eu vim parar aqui. Pancreatite biliar leve: tira a vesícula na mesma internação, senão volta.']],
    }, 'Colecistectomia nesta internação');
    await c.say('muriel', 'Nesta internação. Tá bom. Mas quem opera é alguém com luz.');

    await c.say('narr', '*Você assina. Pendura o Ringer. A dipirona corre. Você puxa o banquinho e senta do lado do leito.*');
    await c.say('narr', '*Duas horas depois.*');
    o.better();
    await c.say('muriel2', 'Melhorou... melhorou muito. Ai, desculpa. Eu choro fácil.');
    await c.say('muriel2', 'É que... vocês me amam, né? Os alunos. Eu sei que amam.');
    const i = await c.choose(['Amamos, professora.', 'É a dipirona falando, professora.', '[Passar um lenço]']);
    if (i === 0) await c.say('muriel2', 'Eu sabia. Eu SEMPRE soube.');
    if (i === 1) await c.say('muriel2', 'É a dipirona E o amor. As duas coisas. Respeita.');
    if (i === 2) {
      await c.say('narr', '*Ela pega o lenço e assoa o nariz. Ruidosamente. Duas vezes. Você desvia o olhar, por educação.*');
      await c.say('muriel2', 'Obrigada. Você vai ser um ótimo médico. Senta mais pra frente na aula.');
    }
    if (errors === 0) o.perfect();
    await c.say('muriel2', 'Agora vai. Avisa o Liberato que eu tô bem. Ele vai querer anotar o horário.');
    return errors;
  },

  // ---------------- LIBERATO DE NOVO: O PS AINDA ESTÁ ABERTO ----------------
  async liberato2(c, o) {
    await c.say('dudu', 'E a paciente do 12?');
    const i = await c.choose(['Melhorou. Ringer, analgesia, dieta precoce. Sem antibiótico.', 'Tá ótima. Chorou um pouco.', 'Quase dei meropenem. Culpa do Máscara.']);
    if (i === 0) await c.say('dudu', 'Sem antibiótico. Anotado. O Schwarzenegger vai gostar. Ele não vai dizer. Mas vai gostar.');
    if (i === 1) await c.say('dudu', 'Ela sempre chora. De emoção. Anotado também. Horário: 23h41.');
    if (i === 2) await c.say('dudu', 'O Máscara. Claro. A máscara dele está no queixo desde 2020. Anotado.');
    if (!o.perfect) await c.say('dudu', 'E você errou na prescrição antes de acertar. Eu sei. Eu sempre sei.');
    await c.say('eu', 'Então... agora eu posso ir?');
    await c.say('dudu', 'Não.');
    await c.say('dudu', 'O PS ainda está aberto.');
    await c.say('dudu', 'O pronto-socorro não fecha. Nunca fechou. Enquanto o PS estiver aberto, o plantão está aberto. E você está de plantão.');
    const j = await c.choose(['E como eu fecho o PS?', 'Quem manda no PS?']);
    await c.say('dudu', j === 0 ? 'Você não fecha nada. Quem fecha é o chefe do PS.' : 'O chefe do PS. Só ele.');
    await c.say('dudu', 'O Professor Falastrão. Desce a escada caracol do hall. O PS fica lá embaixo.');
    await c.say('dudu', 'Ele vai te explicar. Ele vai te explicar muitas coisas. Durante muito tempo.');
    await c.say('dudu', 'E arruma esse jaleco. Tá torto. Dois graus.');
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

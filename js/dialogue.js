// Diálogo com o Professor — pressão de fala, fio associativo frouxo e um jogador tentando escapar.
//
// Mecânica:
//  - Ele fala rápido (e cada vez mais rápido). O texto tem pausas de respiração, marcadas com "|".
//  - Durante a respiração, [ESPAÇO] interrompe com sucesso (+foco). Fora dela, ele nem percebe (−foco, acelera).
//  - As opções são, em sua maioria, inúteis. Algumas alimentam a tangente (−foco), algumas puxam pro assunto (+foco).
//  - Silêncio demais também é ruim: ele preenche o vazio com outra história.
//  - Com o FOCO em 100%, ele finalmente explica a missão.
const DIALOGUE = (() => {
  // ---------------- TEXTO ----------------
  const OPENING =
    'EI! VOCÊ! É o interno novo? Claro que é, tá com cara de interno, essa cara de quem dormiu três horas e acha que foi muito. | ' +
    'Que bom que você chegou, a gente tá com um problema, um problemão, na verdade é um problema elétrico mas também é administrativo, que é o pior tipo, | ' +
    'sabia que "problema" vem do grego? Pro-ballein, jogar pra frente. Que nem a gente faz com os problemas aqui.';

  const TANGENTS = [
    'O gerador deveria ter ligado sozinho, né? Gerador a diesel, 500 kVA, ou 800, eu sempre confundo kVA com kW, | que nem confundo o cardiologista do terceiro andar com o irmão gêmeo dele, que nem é médico, é contador, | mas tem a mesma calvície, impressionante a genética.',
    'Falando em genética, eu plantei tomate-cereja na sacada. Cereja! | Dois tomates em três meses. Dois. Eu acho que é o pH do solo, ou o vizinho, | o vizinho tem um gato que eu acho que come tomate, você já viu gato comer tomate?',
    'Você já almoçou no RU? O feijão de quinta é o melhor, | tem uma teoria que é o mesmo feijão de segunda que vai ficando mais apurado, | eu fiz até uma planilha, depois te mando, a planilha tem macro.',
    'Aliás, você sabe fazer PROCV? Ninguém sabe fazer PROCV. | Agora é PROCX, mudaram, ninguém me avisou, eu descobri por um residente da nefro | que também não sabia, mas fingia muito bem, que é uma habilidade, anota aí.',
    'Tá ouvindo essa música? Não tem música nenhuma, ignora, | mas se tivesse seria Beethoven, que era surdo, e eu aqui sem conseguir ouvir o bipe do gerador, | isso é ironia ou coincidência? A Alanis nunca me respondeu.',
    'Santa Maria tem o clima mais injusto do Brasil, de manhã quatro graus, de tarde trinta e três, | e é o Coração do Rio Grande, né, coração, e eu sou cardio-curioso, | não sou cardiologista, mas eu leio, eu leio muito, leio até bula de xampu.',
    'Eu tomei sete cafés hoje. Oito com o de agora, que eu nem lembro onde deixei. | O café da copa da clínica é melhor que o da cirurgia, isso é científico, eu fiz um duplo-cego, | quer dizer, simples-cego, eu sabia qual era qual, mas fingi que não.',
    'Você toma chimarrão? Precisa tomar, é requisito do internato, tá no regimento, | não tá, mas devia, vou propor na próxima reunião de colegiado, | que foi adiada, sine die, que é latim pra "nunca".',
    'O elevador dois tava travado desde 2019, agora todos estão, finalmente igualdade, | eu sempre subo de escada, é cardio, dezoito lances, | uma vez eu contei os degraus e deu um número diferente na volta. Nunca entendi isso.',
    'Eu tô escrevendo um livro. Não é sobre medicina, é sobre pesca com analogias médicas, | o anzol é o diagnóstico, o peixe é o paciente, não, o peixe é a doença, | o paciente é o lago, ainda tô vendo, o editor também tá vendo, faz dois anos que ele tá vendo.',
    'Aliás, você reparou como tá quieto? Hospital nunca é quieto. | Eu tava ouvindo umas rodinhas de maca rolando lá pro fundo agora há pouco, | deve ser o vento, maca com vento, acontece, física, pressão, sei lá, não sou engenheiro.',
    'Na minha época de interno a gente fazia plantão de trinta e seis horas e gostava, | não gostava, mas dizia que gostava, que é o que importa pra banca, | você vai fazer residência em quê? Não responde, eu vou adivinhar depois.',
    'Eu tenho um podcast. Três ouvintes. Um é minha mãe, o outro sou eu no celular da minha esposa, | o terceiro é um mistério, alguém da Finlândia, | ou um bot, mas um bot finlandês, que eu respeito.',
    'Eu sei que eu falo muito, meu psiquiatra diz que é o TDAH, eu digo que é entusiasmo, | a gente concorda em discordar e ele me cobra por isso, | o metilfenidato eu tomei de manhã, ou foi ontem, os dias ficam iguais sem luz.',
    'Sabe o que falta nesse hospital? Um aquário. Aquário acalma. | Eu vi um estudo, ou um vídeo, um vídeo sobre um estudo, | que peixe-palhaço reduz ansiedade, ou era peixe-betta, enfim, era laranja.',
  ];

  const PREFIX_FEED = ['Né?! E olha só— ', 'EXATAMENTE. E isso me lembra que ', 'Pois é! Pois é! E ', 'Isso! Você entende! Aliás, '];
  const PREFIX_NEUTRAL = ['Então. ', 'Enfim. ', 'Mas aí, ', 'E outra coisa: '];
  const PREFIX_SILENCE = ['...Mas enfim! ', '...Silêncio, né? Silêncio me deixa nervoso. Enfim, ', '...Você tá aí? Tá. Então, '];

  const ON_TOPIC = [
    'A energia, sim! Caiu tudo, até o micro-ondas da copa, | que aliás tem um cheiro de peixe que ninguém assume, ',
    'Sim, sim, o apagão, foco, FOCO. O gerador não pegou, e quando gerador não pega | a gente fica tipo meu carro em julho, ',
    'Isso, o que você precisa fazer. Você precisa me escutar com atenção, | atenção é um recurso escasso, sabia? Igual tomate na minha sacada, ',
  ];
  const HIJACK = [
    'O gerador! O gerador é tipo um coração, né, bombeia energia, e falando em coração, ',
    'A energia! Energia potencial, energia cinética, energia que eu não tenho desde 2014, ',
  ];

  const OPTS = {
    feed: ['Nossa, sério?', 'E aí, o que aconteceu?', 'Que interessante, professor!', 'Me conta mais.', 'Hahaha, não acredito!', 'Eu também adoro isso!'],
    neutral: ['Uhum.', '...', 'Aham, aham.', '[Acenar com a cabeça]', '[Sorrir educadamente]', 'Entendi... eu acho.'],
    redirect: ['Professor, e a energia?', 'Voltando ao apagão...', 'O que eu preciso fazer?', 'Mas e o gerador?'],
    escape: [
      { t: 'Bom, vou indo então...', r: 'Vai, vai! Só deixa eu terminar esse raciocínio, que é rapidinho, | ' },
      { t: '[Dar um passo para trás]', r: '*Ele dá um passo para frente. A distância entre vocês diminui.* | ' },
      { t: '[Fingir que o celular tocou]', r: 'Pode atender! Pode atender, eu espero. ... ... Não tocou? Tocou sim, eu ouvi. Enfim, | ' },
      { t: '[Olhar o relógio de forma óbvia]', r: 'Também tô sem relógio, a bateria acabou quando acabou a luz, será que tá relacionado? | ' },
      { t: 'Preciso ir ao banheiro.', r: 'Banheiro sem luz? Coragem. O do segundo andar tem uma porta que abre sozinha, | ' },
      { t: '[Bocejar ostensivamente]', r: 'Sono? Eu não durmo desde o Revalida de 2016. Brincadeira. Não é brincadeira. | ' },
    ],
  };

  const MISSION = [
    '...O quê? A energia. A ENERGIA! Claro. Foco. Ok. Escuta bem, porque eu só vou falar uma vez. Duas no máximo. Sete se você deixar.',
    'Caiu tudo às 18h12. O gerador não assumiu. O quadro de transferência fica numa sala lá no fundo, depois da manutenção, e tá trancada. E a chave... a chave tá com o PROFESSOR2.',
    'O Professor2, da GASTROENTEROLOGIA. Você conhece? Alto. Ou baixo. Médio. Usa jaleco. Enfim, um gastro. Ele tava na endoscopia quando a luz caiu, deve tá lá em cima. Ou embaixo. A endoscopia mudou de lugar umas três vezes, eu não acompanho.',
    'Vai pelo corredor dos ambulatórios. Usa a lanterna. E se você ouvir alguma coisa lá no fundo... não. Nada. Deve ser o vento. Vai lá!',
  ];
  const TRAP = 'Ah! E só mais uma coisinha, antes que eu esqueça, sobre os tomates, é rapidinho, é que o gato do vizinho—';

  // ---------------- ESTADO ----------------
  let el = {}, active = false, onEnd = null;
  let mode = 'idle';             // typing | wait | choices | done
  let q = null;                  // fala atual
  let foco = 15, tangents = 0, speedBoost = 0;
  let deck = [], options = [], silence = 0, silenceMax = 8;
  let waitT = 0, flashT = 0, phase = 'chat', missionIdx = 0;
  let talkAnim = false;

  function $(id) { return document.getElementById(id); }

  function cps() { return Math.min(120, 34 * (1 + tangents * 0.07 + speedBoost)); }
  function breathWindow() { return Math.max(0.42, 0.85 - tangents * 0.035); }
  function tempo() { return Math.min(230, 96 + tangents * 9 + speedBoost * 40); }

  function say(text, onDone, interruptible = true) {
    q = { text, shown: '', i: 0, acc: 0, breath: 0, onDone, interruptible };
    mode = 'typing';
    el.options.innerHTML = '';
    el.silence.style.width = '0';
  }

  function nextTangent(prefix = '') {
    if (!deck.length) deck = U.shuffle(TANGENTS.slice());
    tangents++;
    AUDIO.setTempo(tempo());
    say(prefix + deck.pop(), () => showChoices());
  }

  function addFoco(v) {
    foco = U.clamp(foco + v, 0, 100);
    el.focoFill.style.width = foco + '%';
    el.focoFill.style.background = foco >= 70 ? '#9f9' : foco >= 35 ? '#9fd' : '#f99';
  }

  function flash(text, good = false) {
    el.flash.textContent = text; el.flash.style.color = good ? '#9f9' : '#ff8a8a';
    el.flash.classList.add('show'); flashT = 1.6;
  }

  function showChoices(forceRedirect) {
    mode = 'choices';
    silenceMax = Math.max(4.5, 8 - tangents * 0.25);
    silence = silenceMax;
    if (phase !== 'chat') return renderOptions();

    const pool = [];
    const nRed = forceRedirect != null ? forceRedirect : (Math.random() < 0.6 ? 1 : 0);
    U.shuffle(OPTS.redirect.slice()).slice(0, nRed).forEach(t => pool.push({ kind: 'redirect', t }));
    if (Math.random() < 0.75) { const e = U.pick(OPTS.escape); pool.push({ kind: 'escape', t: e.t, r: e.r }); }
    const fillers = U.shuffle([
      ...OPTS.feed.map(t => ({ kind: 'feed', t })),
      ...OPTS.neutral.map(t => ({ kind: 'neutral', t })),
    ]);
    while (pool.length < 4) pool.push(fillers.pop());
    options = U.shuffle(pool);
    renderOptions();
  }

  function renderOptions() {
    el.options.innerHTML = '';
    options.forEach((o, i) => {
      const d = document.createElement('div');
      d.className = 'opt';
      d.innerHTML = `<b>${i + 1}.</b> ${o.t}`;
      d.onclick = () => choose(i);
      el.options.appendChild(d);
    });
  }

  function choose(i) {
    if (mode !== 'choices' || !options[i]) return;
    const o = options[i];
    AUDIO.sfx('click');
    el.options.innerHTML = '';

    if (phase === 'mission') {
      missionIdx++;
      if (missionIdx < MISSION.length) return say(MISSION[missionIdx], () => { options = [{ t: missionIdx === MISSION.length - 1 ? '[Entendi. Professor2, gastro.]' : '[Continuar]' }]; showChoices(); }, false);
      phase = 'trap';
      AUDIO.play('mountain', { bpm: 240, fade: 0.1 });
      return say(TRAP, () => { options = [{ t: '[SAIR ANDANDO RÁPIDO]' }, { t: '[Fingir um desmaio leve]' }]; showChoices(); }, false);
    }
    if (phase === 'trap') return finish(i);

    switch (o.kind) {
      case 'feed':
        addFoco(-10); flash('Ele se empolgou. −FOCO');
        return nextTangent(U.pick(PREFIX_FEED));
      case 'neutral':
        addFoco(-3);
        return nextTangent(U.pick(PREFIX_NEUTRAL));
      case 'escape':
        addFoco(5);
        return nextTangent(o.r);
      case 'redirect':
        if (Math.random() < 0.28) {
          addFoco(5); flash('Ele sequestrou o assunto.');
          return nextTangent(U.pick(HIJACK));
        }
        addFoco(20); AUDIO.sfx('good'); flash('Ele piscou. +FOCO', true);
        if (foco >= 100) return startMission();
        return nextTangent(U.pick(ON_TOPIC));
    }
  }

  function startMission() {
    phase = 'mission'; missionIdx = 0;
    AUDIO.sfx('scratch'); AUDIO.stop(0.15);
    el.breath.classList.remove('on');
    say(MISSION[0], () => { options = [{ t: '[Continuar]' }]; showChoices(); }, false);
  }

  function finish(i) {
    active = false; mode = 'done';
    el.root.classList.add('hidden');
    AUDIO.stop(0.2);
    if (onEnd) onEnd(i === 1 ? 'desmaio' : 'saiu');
  }

  function interrupt() {
    if (mode !== 'typing' || !q.interruptible) return;
    if (q.breath > 0) {
      el.breath.classList.remove('on');
      addFoco(12); AUDIO.sfx('good'); flash('INTERRUPÇÃO PERFEITA! +FOCO', true);
      if (foco >= 100) return startMission();
      say('Hm? Ah. Sim. Pode falar, pode falar.', () => showChoices(2), false);
    } else {
      addFoco(-4); speedBoost += 0.12; AUDIO.setTempo(tempo()); AUDIO.sfx('bad');
      flash('Ele nem percebeu. E acelerou.');
    }
  }

  return {
    init() {
      el = {
        root: $('dialogue'), text: $('dlg-text'), options: $('dlg-options'), breath: $('breath'),
        focoFill: $('foco-fill'), silence: $('silence-fill'), flash: $('dlg-flash'), portrait: $('portrait'),
      };
      window.addEventListener('keydown', e => {
        if (!active) return;
        if (e.code === 'Space') { e.preventDefault(); interrupt(); }
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= 4) choose(n - 1);
      });
    },
    start(cb) {
      onEnd = cb; active = true; phase = 'chat';
      foco = 15; tangents = 0; speedBoost = 0; deck = [];
      addFoco(0);
      el.root.classList.remove('hidden');
      AUDIO.play('mountain', { bpm: tempo(), fade: 0.2 });
      say(OPENING, () => showChoices(0));
    },
    get active() { return active; },
    get talking() { return talkAnim; },
    update(dt, time) {
      if (!active) return;
      if (flashT > 0) { flashT -= dt; if (flashT <= 0) el.flash.classList.remove('show'); }
      talkAnim = false;

      if (mode === 'typing') {
        if (q.breath > 0) {
          q.breath -= dt;
          if (q.breath <= 0) el.breath.classList.remove('on');
        } else {
          talkAnim = true;
          q.acc += dt * cps();
          while (q.acc >= 1 && q.i < q.text.length) {
            q.acc -= 1;
            const ch = q.text[q.i++];
            if (ch === '|') {
              if (q.interruptible) {
                q.breath = breathWindow(); el.breath.classList.add('on'); AUDIO.sfx('breath');
                if (!this._hinted) { this._hinted = true; q.breath += 0.6; flash('DICA: aperte [ESPAÇO] agora!', true); }
              }
              q.acc = 0;
              break;
            }
            q.shown += ch;
            if (ch !== ' ' && q.i % 3 === 0) AUDIO.sfx('blip');
          }
          el.text.textContent = q.shown;
          if (q.i >= q.text.length && q.breath <= 0) { mode = 'wait'; waitT = 0.3; }
        }
      } else if (mode === 'wait') {
        waitT -= dt;
        if (waitT <= 0) { mode = 'idle'; q.onDone && q.onDone(); }
      } else if (mode === 'choices' && phase === 'chat') {
        silence -= dt;
        el.silence.style.width = (100 * (1 - silence / silenceMax)) + '%';
        if (silence <= 0) {
          addFoco(-5); flash('Silêncio constrangedor. Ele preencheu.');
          nextTangent(U.pick(PREFIX_SILENCE));
        }
      }
      // retrato animado
      const frame = talkAnim ? (Math.floor(time * 9) % 2 ? 1 : (Math.floor(time * 2) % 3 === 0 ? 2 : 0)) : 0;
      if (frame !== this._lastFrame) { SPRITES.drawPortrait(el.portrait, 'prof1', frame); this._lastFrame = frame; }
    },
    // falas soltas para depois da conversa (ele continua falando... com o bebedouro)
    MUTTER: [
      '...e aí o gato olhou pro tomate, e o tomate, assim, olhou de volta...',
      '...porque o PROCX, diferente do PROCV, ele procura pros dois lados, que nem eu...',
      '...você é um ótimo ouvinte, sabia? Muito melhor que o interno anterior...',
      '...o anzol é o diagnóstico, você entende? Você entende. Você é um bebedouro, mas entende...',
      '...dezoito lances. Na volta, dezenove. Quem colocou um degrau a mais?...',
    ],
  };
})();

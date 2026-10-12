// Conversas roteirizadas (async/await): c.say(quem, texto), c.choose([opções]), minijogos (c.laudos(), c.knot(mão)...).
// Usa a mesma caixa de diálogo do Monteiro, escondendo o medidor de foco. Quem fala: js/dados/personagens.js.
const CONVO = (() => {
  // quem fala: nome, voz e retrato vêm da ficha em js/dados/personagens.js
  function speakerOf(key) {
    const p = PERSONAGENS[key];
    if (!p || !p.fala) throw new Error('personagem sem fala em js/dados/personagens.js: ' + key);
    const f = p.fala;
    return { key, char: p.visual ? key : null, name: f.nome, cps: f.cps, blip: f.blip, italic: !!f.italico, pig: !!f.porco };
  }
  let el = {}, active = false, mode = 'idle', q = null, resolver = null, options = [], speaker = null;
  let talk = false, igScore = 1, onNotify = null, lastFrame = -1;

  const $ = id => document.getElementById(id);

  function setSpeaker(key) {
    speaker = speakerOf(key);
    el.name.textContent = speaker.name;
    el.portrait.style.display = speaker.char ? 'block' : 'none';
    el.text.style.fontStyle = speaker.italic ? 'italic' : 'normal';
    el.text.style.color = speaker.italic ? '#c9d6e6' : '#f2efe6';
    lastFrame = -1;
  }

  function say(key, text) {
    setSpeaker(key);
    el.options.innerHTML = '';
    return new Promise(res => { q = { text, shown: '', i: 0, acc: 0 }; mode = 'typing'; resolver = res; });
  }
  function choose(list) {
    mode = 'choices'; options = list;
    el.options.innerHTML = '';
    list.forEach((t, i) => {
      const d = document.createElement('div'); d.className = 'opt';
      d.innerHTML = `<b>${i + 1}.</b> ${t}`; d.onclick = () => pick(i);
      el.options.appendChild(d);
    });
    return new Promise(res => { resolver = res; });
  }
  function pick(i) {
    if (mode === 'game') return game.def.pick && game.def.pick(i);
    if (mode !== 'choices' || i >= options.length) return;
    AUDIO.sfx('click'); mode = 'idle'; el.options.innerHTML = '';
    const r = resolver; resolver = null; r(i);
  }
  function advance() {
    if (mode === 'typing') { q.shown = q.text; q.i = q.text.length; el.text.textContent = q.shown; mode = 'waiting'; showNext(); return; }
    if (mode === 'waiting') { mode = 'idle'; el.options.innerHTML = ''; const r = resolver; resolver = null; r(); }
  }
  function showNext() {
    el.options.innerHTML = `<div class="opt next">▼ ${TOUCH.on ? 'CONTINUAR' : '[ESPAÇO]'}</div>`;
    el.options.firstChild.onclick = () => advance();
  }

  // ---------- Instagram do Liberato ----------
  const IG_GOOD = [
    'prof.liberato curtiu uma foto sua de 2019.',
    'prof.liberato comentou: "👏👏"',
    'prof.liberato comentou: "organizado. gostei."',
    'prof.liberato comentou na sua foto de formatura: "jaleco bem passado."',
    'prof.liberato respondeu seu story: "✔️"',
    'prof.liberato comentou: "essa foto tá torta 2 graus. mas ok."',
    'prof.liberato curtiu seu comentário.',
    'prof.liberato comentou: "pontual 👌" (ironia? não dá pra saber)',
  ];
  const IG_BAD = [
    'prof.liberato visualizou seu story. Não reagiu.',
    'prof.liberato apagou o próprio comentário na sua foto.',
    'prof.liberato descurtiu uma foto sua de 2019.',
    'prof.liberato comentou: "."',
  ];
  const igDeck = new Map();
  function nextIg(list) {
    let d = igDeck.get(list);
    if (!d || !d.length) { d = U.shuffle(list.slice()); igDeck.set(list, d); }
    return d.pop();
  }
  function igRender() {
    const f = igScore > 0;
    el.ig.innerHTML = `📱 <b>@prof.liberato</b> · ${f ? '<span class="ok">SEGUE VOCÊ</span>' : '<span class="no">NÃO SEGUE VOCÊ</span>'}`;
  }
  function ig(delta) {
    const before = igScore > 0;
    igScore += delta;
    const after = igScore > 0;
    igRender();
    if (before && !after) onNotify && onNotify('prof.liberato deixou de seguir você.');
    if (!before && after) onNotify && onNotify('prof.liberato começou a seguir você de volta.');
    if (before === after) onNotify && onNotify(nextIg(delta > 0 ? IG_GOOD : IG_BAD));
  }

  // ---------- MINIJOGOS dentro da caixa de conversa ----------
  // Cada minijogo fica num arquivo em js/mecanicas/ e se registra com CONVO.minigame('nome', def).
  // No roteiro vira: const resultado = await c.nome(...args)   (ex.: await c.laudos(), await c.knot('esquerda'))
  //   def.start(ui, ...args)  monta a tela e devolve o estado do jogo (os testes leem em CONVO.minigameState)
  //   def.key(code)           tecla apertada (opcional; sem ele, as teclas 1-9 viram def.pick)
  //   def.pick(i)             opção escolhida (clique ou tecla 1-9; opcional)
  //   def.update(dt)          todo quadro (opcional)
  //   ui = { el: elementos da caixa (text, options, silence, silenceFill...), finish(resultado, atrasoMs) }
  const minigames = {};
  let game = null;                                                // { def, state } do minijogo em andamento
  function startGame(name, ...args) {
    const def = minigames[name];
    mode = 'game';
    return new Promise(res => {
      resolver = res;
      const ui = {
        el,
        finish(result, delayMs = 0) {
          if (!game || game.ui !== ui) return;
          game = null; mode = 'idle';
          const r = resolver; resolver = null;
          setTimeout(() => r(result), delayMs);
        },
      };
      game = { def, ui, state: null };
      game.state = def.start(ui, ...args);
    });
  }

  return {
    init(notify) {
      onNotify = notify;
      el = { root: $('dialogue'), text: $('dlg-text'), options: $('dlg-options'), name: $('dlg-name'), portrait: $('portrait'),
        ig: $('ig'), help: $('dlg-help'), focoWrap: $('foco-wrap'), breath: $('breath'), silence: $('silence'), silenceFill: $('silence-fill') };
      window.addEventListener('keydown', e => {
        if (!active) return;
        if (mode === 'game' && game.def.key) { e.preventDefault(); game.def.key(e.code); return; }
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') { e.preventDefault(); advance(); }
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= 9) pick(n - 1);
      });
    },
    get active() { return active; },
    minigame(name, def) { minigames[name] = def; },
    get minigameState() { return game && game.state; },   // usado pelos testes automáticos
    get talking() { return talk; },
    get speakerChar() { return speaker && speaker.char; },
    get following() { return igScore > 0; },
    setFollowing(f) { igScore = f ? 1 : 0; },
    // roda um roteiro: script(api) é uma função async
    async run(script, opts = {}) {
      active = true;
      el.root.classList.remove('hidden');
      el.focoWrap.style.visibility = 'hidden'; el.breath.style.display = 'none'; el.silence.style.display = 'none';
      el.ig.style.display = opts.instagram || opts.meter ? 'block' : 'none';
      el.help.textContent = '[ESPAÇO] continuar · [1-5] escolher';
      if (opts.instagram) { igScore = 1; igRender(); }
      const api = { say, choose, ig, meter: html => { el.ig.innerHTML = html; }, wait: s => new Promise(r => setTimeout(r, s * 1000)),
        clear: () => { el.text.textContent = ''; el.options.innerHTML = ''; } };
      for (const name in minigames) api[name] = (...args) => startGame(name, ...args);
      try { await script(api); }
      finally {
        active = false; mode = 'idle'; game = null;
        el.root.classList.add('hidden');
        el.focoWrap.style.visibility = ''; el.breath.style.display = ''; el.silence.style.display = ''; el.ig.style.display = 'none';
        el.portrait.style.display = 'block'; el.text.style.fontStyle = 'normal'; el.text.style.color = '';
        el.help.textContent = '[1-4] responder · [ESPAÇO] interromper (só quando ele respira)';
        el.name.textContent = 'PROFESSOR MONTEIRO';
      }
    },
    update(dt, time) {
      if (!active) return;
      talk = false;
      if (mode === 'game' && game.def.update) game.def.update(dt);
      if (mode === 'typing') {
        talk = true;
        q.acc += dt * speaker.cps;
        while (q.acc >= 1 && q.i < q.text.length) {
          q.acc -= 1;
          const ch = q.text[q.i++]; q.shown += ch;
          if (speaker.blip && ch !== ' ' && q.i % 3 === 0) AUDIO.sfx('blip', speaker.blip[0], speaker.blip[1]);
          if (speaker.pig && (ch === '.' || ch === '!' || ch === '?' || ch === ',') && Math.random() < 0.55) AUDIO.sfx(Math.random() < 0.65 ? 'oink' : 'grunt', 0.55);
          if (ch === '.' || ch === '?' || ch === '!') q.acc -= 4;   // pausa nas frases (o Liberato fala pausado)
        }
        el.text.textContent = q.shown;
        if (q.i >= q.text.length) { mode = 'waiting'; showNext(); }
      }
      if (speaker && speaker.char) {
        const frame = talk ? (Math.floor(time * 7) % 2) : 0;
        if (frame !== lastFrame) { SPRITES.drawPortrait(el.portrait, speaker.char, frame); lastFrame = frame; }
      }
    },
  };
})();

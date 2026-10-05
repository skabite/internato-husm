// Conversas roteirizadas (async/await): Dudu, Professor3, pensamentos do interno.
// Usa a mesma caixa de diálogo do Professor, escondendo o medidor de foco.
const CONVO = (() => {
  const SPEAKERS = {
    dudu: { char: 'prof2', name: 'DUDU DA GASTRO', cps: 36, blip: [125, 25] },
    prof3: { char: 'prof3', name: 'PROFESSOR3', cps: 30, blip: [100, 40] },
    eu: { char: null, name: 'VOCÊ (pensando)', cps: 48, blip: null, italic: true },
    narr: { char: null, name: '', cps: 60, blip: null, italic: true },
  };
  let el = {}, active = false, mode = 'idle', q = null, resolver = null, options = [], speaker = null;
  let talk = false, igScore = 1, onNotify = null, laudos = null, lastFrame = -1;

  const $ = id => document.getElementById(id);

  function setSpeaker(key) {
    speaker = SPEAKERS[key];
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
    if (mode === 'laudos') return laudoPick(i);
    if (mode !== 'choices' || i >= options.length) return;
    AUDIO.sfx('click'); mode = 'idle'; el.options.innerHTML = '';
    const r = resolver; resolver = null; r(i);
  }
  function advance() {
    if (mode === 'typing') { q.shown = q.text; q.i = q.text.length; el.text.textContent = q.shown; mode = 'waiting'; showNext(); return; }
    if (mode === 'waiting') { mode = 'idle'; el.options.innerHTML = ''; const r = resolver; resolver = null; r(); }
  }
  function showNext() { el.options.innerHTML = '<div class="opt next">▼ [ESPAÇO]</div>'; }

  // ---------- Instagram do Dudu ----------
  function igRender() {
    const f = igScore > 0;
    el.ig.innerHTML = `📱 <b>@dudu.gastro</b> · ${f ? '<span class="ok">SEGUE VOCÊ</span>' : '<span class="no">NÃO SEGUE VOCÊ</span>'}`;
  }
  function ig(delta) {
    const before = igScore > 0;
    igScore += delta;
    const after = igScore > 0;
    igRender();
    if (before && !after) onNotify && onNotify('dudu.gastro deixou de seguir você.');
    if (!before && after) onNotify && onNotify('dudu.gastro começou a seguir você de volta.');
    if (before === after && delta > 0) onNotify && onNotify('dudu.gastro curtiu uma foto sua de 2019.');
  }

  // ---------- Minijogo: laudos em ordem crescente de prontuário ----------
  function laudoStart() {
    const nums = new Set();
    while (nums.size < 5) nums.add(100000 + Math.floor(Math.random() * 900000));
    laudos = { items: U.shuffle([...nums]), done: [], errors: 0 };
    mode = 'laudos'; laudoRender();
    return new Promise(res => { resolver = res; });
  }
  function laudoRender() {
    el.options.innerHTML = '';
    laudos.items.forEach((n, i) => {
      const d = document.createElement('div'); d.className = 'opt' + (laudos.done.includes(n) ? ' done' : '');
      const f = String(n).replace(/(\d{3})(\d{3})/, '$1.$2');
      d.innerHTML = `<b>${i + 1}.</b> Laudo de colonoscopia · Pront. ${f}${laudos.done.includes(n) ? ' ✔' : ''}`;
      d.onclick = () => laudoPick(i);
      el.options.appendChild(d);
    });
  }
  function laudoPick(i) {
    const n = laudos.items[i];
    if (n === undefined || laudos.done.includes(n)) return;
    const next = Math.min(...laudos.items.filter(x => !laudos.done.includes(x)));
    if (n === next) {
      laudos.done.push(n); AUDIO.sfx('click');
      if (laudos.done.length === laudos.items.length) {
        laudoRender(); mode = 'idle';
        const r = resolver; resolver = null; setTimeout(() => r(laudos.errors), 500);
        return;
      }
    } else {
      laudos.errors++; AUDIO.sfx('bad');
      el.text.textContent = U.pick(['Não. Crescente. Do menor pro maior. De novo.', 'Você pulou um. De novo. Do começo.', 'Isso é decrescente em algum universo? Não neste. De novo.']);
      laudos.done = []; U.shuffle(laudos.items);
    }
    laudoRender();
  }

  return {
    SPEAKERS,
    init(notify) {
      onNotify = notify;
      el = { root: $('dialogue'), text: $('dlg-text'), options: $('dlg-options'), name: $('dlg-name'), portrait: $('portrait'),
        ig: $('ig'), help: $('dlg-help'), focoWrap: $('foco-wrap'), breath: $('breath'), silence: $('silence') };
      window.addEventListener('keydown', e => {
        if (!active) return;
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') { e.preventDefault(); advance(); }
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= 9) pick(n - 1);
      });
    },
    get active() { return active; },
    get talking() { return talk; },
    get speakerChar() { return speaker && speaker.char; },
    get following() { return igScore > 0; },
    setFollowing(f) { igScore = f ? 1 : 0; },
    // roda um roteiro: script(api) é uma função async
    async run(script, opts = {}) {
      active = true;
      el.root.classList.remove('hidden');
      el.focoWrap.style.visibility = 'hidden'; el.breath.style.display = 'none'; el.silence.style.display = 'none';
      el.ig.style.display = opts.instagram ? 'block' : 'none';
      el.help.textContent = '[ESPAÇO] continuar · [1-5] escolher';
      if (opts.instagram) { igScore = 1; igRender(); }
      const api = { say, choose, ig, laudos: laudoStart, wait: s => new Promise(r => setTimeout(r, s * 1000)),
        clear: () => { el.text.textContent = ''; el.options.innerHTML = ''; } };
      try { await script(api); }
      finally {
        active = false; mode = 'idle';
        el.root.classList.add('hidden');
        el.focoWrap.style.visibility = ''; el.breath.style.display = ''; el.silence.style.display = ''; el.ig.style.display = 'none';
        el.portrait.style.display = 'block'; el.text.style.fontStyle = 'normal'; el.text.style.color = '';
        el.help.textContent = '[1-4] responder · [ESPAÇO] interromper (só quando ele respira)';
        el.name.textContent = 'PROFESSOR';
      }
    },
    update(dt, time) {
      if (!active) return;
      talk = false;
      if (mode === 'typing') {
        talk = true;
        q.acc += dt * speaker.cps;
        while (q.acc >= 1 && q.i < q.text.length) {
          q.acc -= 1;
          const ch = q.text[q.i++]; q.shown += ch;
          if (speaker.blip && ch !== ' ' && q.i % 3 === 0) AUDIO.sfx('blip', speaker.blip[0], speaker.blip[1]);
          if (ch === '.' || ch === '?' || ch === '!') q.acc -= 4;   // pausa nas frases (o Dudu fala pausado)
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

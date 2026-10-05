// Conversas roteirizadas (async/await): Dudu, Professor3, pensamentos do interno.
// Usa a mesma caixa de diálogo do Professor, escondendo o medidor de foco.
const CONVO = (() => {
  const SPEAKERS = {
    dudu: { char: 'prof2', name: 'DUDU DA GASTRO', cps: 36, blip: [125, 25] },
    prof3: { char: 'prof3', name: 'PROFESSOR3', cps: 30, blip: [100, 40] },
    clovis: { char: 'prof4', name: 'CLÓVIS DA VASCULAR', cps: 33, blip: [150, 30] },
    belgica: { char: 'chefao', name: 'ALEXANDRE "BÉLGICA" SCHWARTZBOLDT', cps: 52, blip: [140, 80] },
    eu: { char: null, name: 'VOCÊ (pensando)', cps: 48, blip: null, italic: true },
    narr: { char: null, name: '', cps: 60, blip: null, italic: true },
  };
  let el = {}, active = false, mode = 'idle', q = null, resolver = null, options = [], speaker = null;
  let knot = null;
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

  // ---------- Minijogo: nó cirúrgico (uma mão de cada vez) ----------
  const KEYSETS = {
    esquerda: { codes: ['KeyW', 'KeyA', 'KeyS', 'KeyD'], label: { KeyW: 'W', KeyA: 'A', KeyS: 'S', KeyD: 'D' } },
    direita: { codes: ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'], label: { ArrowUp: '↑', ArrowLeft: '←', ArrowDown: '↓', ArrowRight: '→' } },
  };
  function knotStart(hand, len = 7, limit = 6) {
    const ks = KEYSETS[hand];
    knot = { hand, ks, seq: Array.from({ length: len }, () => U.pick(ks.codes)), i: 0, errors: 0, t: 0, limit };
    mode = 'knot'; knotRender();
    el.silence.style.display = '';
    return new Promise(res => { resolver = res; });
  }
  function knotRender() {
    const k = knot;
    el.options.innerHTML = '<div class="knot">' + k.seq.map((c, i) =>
      '<span class="' + (i < k.i ? 'ok' : i === k.i ? 'cur' : '') + '">' + k.ks.label[c] + '</span>').join('') +
      '</div><div class="knot-help">MÃO ' + k.hand.toUpperCase() + ' · ' + (k.hand === 'esquerda' ? 'W A S D' : 'setas') + ' · erros: ' + k.errors + '</div>';
  }
  function knotKey(code) {
    const k = knot;
    if (!k.ks.codes.includes(code)) return;
    if (code === k.seq[k.i]) { k.i++; AUDIO.sfx('click'); }
    else { k.errors++; AUDIO.sfx('bad'); }
    knotRender();
    if (k.i >= k.seq.length) knotEnd(false);
  }
  function knotEnd(timeout) {
    const k = knot; mode = 'idle'; knot = null;
    el.silence.style.display = 'none'; el.silenceFill.style.width = '0';
    const r = resolver; resolver = null;
    setTimeout(() => r({ errors: k.errors, time: k.t, timeout }), 300);
  }

  return {
    SPEAKERS,
    init(notify) {
      onNotify = notify;
      el = { root: $('dialogue'), text: $('dlg-text'), options: $('dlg-options'), name: $('dlg-name'), portrait: $('portrait'),
        ig: $('ig'), help: $('dlg-help'), focoWrap: $('foco-wrap'), breath: $('breath'), silence: $('silence'), silenceFill: $('silence-fill') };
      window.addEventListener('keydown', e => {
        if (!active) return;
        if (mode === 'knot') { e.preventDefault(); knotKey(e.code); return; }
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
      el.ig.style.display = opts.instagram || opts.meter ? 'block' : 'none';
      el.help.textContent = '[ESPAÇO] continuar · [1-5] escolher';
      if (opts.instagram) { igScore = 1; igRender(); }
      const api = { say, choose, ig, laudos: laudoStart, knot: knotStart, meter: html => { el.ig.innerHTML = html; }, wait: s => new Promise(r => setTimeout(r, s * 1000)),
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
      if (mode === 'knot') {
        knot.t += dt;
        el.silenceFill.style.width = Math.min(100, 100 * knot.t / knot.limit) + '%';
        if (knot.t >= knot.limit) knotEnd(true);
      }
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

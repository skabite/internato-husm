// Conversas roteirizadas (async/await): Liberato, Javali, pensamentos do interno.
// Usa a mesma caixa de diálogo do Professor, escondendo o medidor de foco.
const CONVO = (() => {
  const SPEAKERS = {
    dudu: { char: 'prof2', name: 'PROFESSOR LIBERATO', cps: 36, blip: [125, 25] },
    prof3: { char: 'prof3', name: 'JAVALI', cps: 30, blip: [70, 30], pig: true },   // "o Javali": fala grunhindo
    clovis: { char: 'prof4', name: 'PROFESSOR DE BARROS', cps: 33, blip: [150, 30] },
    belgica: { char: 'chefao', name: 'PROFESSOR SCHWARZENEGGER', cps: 52, blip: [140, 80] },
    falastrao: { char: 'prof5', name: 'PROFESSOR FALASTRÃO', cps: 46, blip: [115, 70] },   // provisório (falta foto)
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

  // ---------- Minijogo: nó cirúrgico por ARRASTO ----------
  // Aparece uma seta; arraste na direção dela (dedo no celular, mouse segurando o botão no computador, ou setas/WASD).
  // Cada acerto toca a próxima nota de Eine kleine Nachtmusik e aperta mais o nó.
  // Resultado: { errors, time, timeout, perfect } — perfeito = sem erro e rápido.
  const MELODY = [392, 293.7, 392, 293.7, 392, 293.7, 392, 493.9, 587.3, 523.3, 440, 523.3, 440, 523.3, 440, 370, 440, 293.7];
  const DIRS = ['L', 'R', 'U', 'D'], ARROW = { L: '←', R: '→', U: '↑', D: '↓' };
  const KNOT_N = 6, KNOT_LIMIT = 12, KNOT_FAST = 6;
  let kcan = null, kctx = null, mel = 0;
  function knotStart(hand) {
    const seq = [];
    while (seq.length < KNOT_N) { const d = U.pick(DIRS); if (d !== seq[seq.length - 1]) seq.push(d); }
    knot = { hand, seq, i: 0, errors: 0, t0: performance.now(), t: 0, fb: '', fbT: 0, drag: null, shake: 0 };
    mode = 'knot';
    if (!kcan) {
      kcan = document.createElement('canvas'); kcan.id = 'rhythm'; kcan.width = 120; kcan.height = 108;
      document.body.appendChild(kcan); kctx = kcan.getContext('2d');
    }
    kcan.style.display = 'block';
    el.options.innerHTML = '<div class="knot">NÓ · MÃO ' + hand.toUpperCase() + '</div><div class="knot-help">' + (TOUCH.on
      ? 'ARRASTE o dedo na direção da seta (em qualquer lugar da tela)'
      : 'segure o botão do mouse e ARRASTE na direção da seta · ou use as setas / WASD') + '</div>';
    for (const ev of ['touchstart', 'touchmove', 'touchend', 'mousedown', 'mousemove', 'mouseup']) document.addEventListener(ev, knotPointer, { passive: false });
    return new Promise(res => { resolver = res; });
  }
  function knotNow() { knot.t = (performance.now() - knot.t0) / 1000; return knot.t; }
  function knotFb(t, c) { knot.fb = t; knot.fbC = c; knot.fbT = 0.5; }
  function knotGesture(d) {
    const k = knot; knotNow();
    if (d === k.seq[k.i]) {
      k.i++; knotFb('BOA', '#8f8');
      AUDIO.sfx('note', MELODY[mel++ % MELODY.length], 0.16);
      if (k.i >= k.seq.length) knotEnd();
    } else { k.errors++; k.shake = 0.25; knotFb('ERROU', '#f77'); AUDIO.sfx('bad'); }
  }
  function knotKey(code) {
    const m = { KeyA: 'L', ArrowLeft: 'L', KeyD: 'R', ArrowRight: 'R', KeyW: 'U', ArrowUp: 'U', KeyS: 'D', ArrowDown: 'D' };
    if (m[code]) knotGesture(m[code]);
  }
  // um gesto por toque/clique: soma o movimento até passar de ~30 px e decide a direção dominante
  function knotPointer(e) {
    if (mode !== 'knot') return;
    const k = knot, touch = e.type.startsWith('touch');
    if (touch) e.preventDefault();
    if (e.type === 'touchstart' || (e.type === 'mousedown' && e.button === 0)) { k.drag = { x: 0, y: 0, done: false, lx: touch ? e.changedTouches[0].clientX : 0, ly: touch ? e.changedTouches[0].clientY : 0 }; return; }
    if (e.type === 'touchend' || e.type === 'mouseup') { k.drag = null; return; }
    if (!k.drag || k.drag.done) return;
    if (touch) { const t = e.changedTouches[0]; k.drag.x += t.clientX - k.drag.lx; k.drag.y += t.clientY - k.drag.ly; k.drag.lx = t.clientX; k.drag.ly = t.clientY; }
    else { k.drag.x += e.movementX || 0; k.drag.y += e.movementY || 0; }
    if (Math.hypot(k.drag.x, k.drag.y) > 30) {
      k.drag.done = true;
      knotGesture(Math.abs(k.drag.x) > Math.abs(k.drag.y) ? (k.drag.x < 0 ? 'L' : 'R') : (k.drag.y < 0 ? 'U' : 'D'));
    }
  }
  function knotDraw(dt) {
    const g = kctx, k = knot, W = 120, H = 108;
    g.fillStyle = '#0b0d12'; g.fillRect(0, 0, W, H);
    // o fio: cada acerto dá mais uma volta no nó
    g.fillStyle = '#d8d2bc'; g.fillRect(8, 86, 104, 2);
    for (let i = 0; i < k.i; i++) { g.strokeStyle = '#d8d2bc'; g.lineWidth = 2; g.beginPath(); g.ellipse(60, 80, 4 + i * 2.4, 4, 0, 0, 7); g.stroke(); }
    // seta atual (treme quando erra)
    const sx = k.shake > 0 ? Math.sin(k.t * 90) * 3 : 0;
    const cur = k.seq[k.i];
    if (cur) {
      g.font = 'bold 44px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#ffd84a'; g.fillText(ARROW[cur], 60 + sx, 40);
      g.font = '9px monospace'; g.fillStyle = '#6a6858';
      g.fillText(k.seq.slice(k.i + 1).map(d => ARROW[d]).join(' '), 60, 68);
    }
    // tempo
    const left = Math.max(0, 1 - k.t / KNOT_LIMIT);
    g.fillStyle = '#222'; g.fillRect(8, 100, 104, 4);
    g.fillStyle = k.t < KNOT_FAST ? '#8f8' : '#c55'; g.fillRect(8, 100, 104 * left, 4);
    if (k.fbT > 0) { g.font = 'bold 9px monospace'; g.fillStyle = k.fbC; g.textAlign = 'center'; g.fillText(k.fb, 60, 10); }
  }
  function knotEnd(timeout = false) {
    const k = knot; mode = 'idle'; knot = null;
    kcan.style.display = 'none';
    for (const ev of ['touchstart', 'touchmove', 'touchend', 'mousedown', 'mousemove', 'mouseup']) document.removeEventListener(ev, knotPointer);
    const res = { errors: k.errors, time: k.t, timeout, perfect: !timeout && k.errors === 0 && k.t <= KNOT_FAST };
    const r = resolver; resolver = null;
    setTimeout(() => r(res), 350);
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
    get knotState() { return knot; },   // usado pelos testes automáticos
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
        el.name.textContent = 'PROFESSOR MONTEIRO';
      }
    },
    update(dt, time) {
      if (!active) return;
      talk = false;
      if (mode === 'knot') {
        const k = knot;
        knotNow(); k.fbT -= dt; k.shake -= dt;
        knotDraw(dt);
        if (k.t >= KNOT_LIMIT) knotEnd(true);
      }
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

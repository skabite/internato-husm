// Conversas roteirizadas (async/await): Dudu, Professor3, pensamentos do interno.
// Usa a mesma caixa de diálogo do Professor, escondendo o medidor de foco.
const CONVO = (() => {
  const SPEAKERS = {
    dudu: { char: 'prof2', name: 'DUDU DA GASTRO', cps: 36, blip: [125, 25] },
    prof3: { char: 'prof3', name: 'PROFESSOR3', cps: 30, blip: [70, 30], pig: true },   // "o Javali": fala grunhindo
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
  function showNext() {
    el.options.innerHTML = `<div class="opt next">▼ ${TOUCH.on ? 'CONTINUAR' : '[ESPAÇO]'}</div>`;
    el.options.firstChild.onclick = () => advance();
  }

  // ---------- Instagram do Dudu ----------
  const IG_GOOD = [
    'dudu.gastro curtiu uma foto sua de 2019.',
    'dudu.gastro comentou: "👏👏"',
    'dudu.gastro comentou: "organizado. gostei."',
    'dudu.gastro comentou na sua foto de formatura: "jaleco bem passado."',
    'dudu.gastro respondeu seu story: "✔️"',
    'dudu.gastro comentou: "essa foto tá torta 2 graus. mas ok."',
    'dudu.gastro curtiu seu comentário.',
    'dudu.gastro comentou: "pontual 👌" (ironia? não dá pra saber)',
  ];
  const IG_BAD = [
    'dudu.gastro visualizou seu story. Não reagiu.',
    'dudu.gastro apagou o próprio comentário na sua foto.',
    'dudu.gastro descurtiu uma foto sua de 2019.',
    'dudu.gastro comentou: "."',
  ];
  const igDeck = new Map();
  function nextIg(list) {
    let d = igDeck.get(list);
    if (!d || !d.length) { d = U.shuffle(list.slice()); igDeck.set(list, d); }
    return d.pop();
  }
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

  // ---------- Minijogo: nó cirúrgico em ritmo (estilo Guitar Hero) ----------
  // Duas faixas: LAÇA com a mão esquerda / direita (toque) e APERTA (arrastar o dedo, ou W/↑/espaço).
  // As notas tocam Eine kleine Nachtmusik. Resultado: { errors, time, timeout, perfect }.
  const NOTE = { G4: 392, D4: 293.7, B4: 493.9, D5: 587.3, C5: 523.3, A4: 440, Fs4: 370, E5: 659.3 };
  const CHARTS = {
    esquerda: { gap: 0.5, notes: [['L', 'G4'], ['L', 'D4'], ['R', 'G4'], ['L', 'D4'], ['L', 'G4'], ['R', 'D4'], ['L', 'G4'], ['P', 'B4'], ['P', 'D5']] },
    direita: { gap: 0.44, notes: [['R', 'C5'], ['R', 'A4'], ['L', 'C5'], ['R', 'A4'], ['R', 'C5'], ['L', 'A4'], ['R', 'Fs4'], ['L', 'A4'], ['P', 'D4'], ['P', 'G4']] },
  };
  const FALL = 1.4, LEAD = 1.0, PERFECT = 0.11, OK = 0.22;
  let rcan = null, rctx = null;
  function knotStart(hand) {
    const ch = CHARTS[hand] || CHARTS.esquerda;
    const notes = ch.notes.map(([lane, n], i) => ({ lane, f: NOTE[n], t: LEAD + FALL + i * ch.gap, res: null }));
    knot = { hand, notes, t: 0, errors: 0, misses: 0, perfects: 0, fb: '', fbT: 0, end: notes[notes.length - 1].t + 0.6, touch: null };
    mode = 'knot';
    if (!rcan) {
      rcan = document.createElement('canvas'); rcan.id = 'rhythm'; rcan.width = 120; rcan.height = 108;
      document.body.appendChild(rcan); rctx = rcan.getContext('2d');
    }
    rcan.style.display = 'block';
    el.options.innerHTML = '<div class="knot">NÓ · MÃO ' + hand.toUpperCase() + '</div><div class="knot-help">' + (TOUCH.on
      ? 'toque na metade ESQUERDA ou DIREITA da tela quando a nota chegar na linha · ARRASTE o dedo nas notas ⇆ (aperta o nó)'
      : '[A]/[←] faixa esquerda · [D]/[→] faixa direita · [W]/[↑]/[ESPAÇO] nas notas ⇆ (aperta o nó)') + '</div>';
    document.addEventListener('touchstart', knotTouch, { passive: false });
    document.addEventListener('touchmove', knotTouch, { passive: false });
    document.addEventListener('touchend', knotTouch, { passive: false });
    return new Promise(res => { resolver = res; });
  }
  // nota mais próxima ainda não resolvida (da faixa pedida)
  function knotJudge(input) {
    const k = knot;
    let best = null;
    for (const n of k.notes) if (!n.res && Math.abs(n.t - k.t) <= OK && (!best || Math.abs(n.t - k.t) < Math.abs(best.t - k.t))) best = n;
    if (!best || best.lane !== input) { k.errors++; knotFb('ERROU', '#f77'); AUDIO.sfx('bad'); return; }
    const d = Math.abs(best.t - k.t);
    best.res = d <= PERFECT ? 'perfect' : 'ok';
    if (best.res === 'perfect') { k.perfects++; knotFb('PERFEITO', '#8f8'); } else knotFb('QUASE', '#ffd84a');
    AUDIO.sfx('note', best.f, best.lane === 'P' ? 0.22 : 0.13);
  }
  function knotFb(t, c) { knot.fb = t; knot.fbC = c; knot.fbT = 0.45; }
  function knotKey(code) {
    const m = { KeyA: 'L', ArrowLeft: 'L', KeyD: 'R', ArrowRight: 'R', KeyW: 'P', ArrowUp: 'P', Space: 'P' };
    if (m[code]) knotJudge(m[code]);
  }
  function knotTouch(e) {
    if (mode !== 'knot') return;
    e.preventDefault();
    const k = knot;
    if (e.type === 'touchstart') {
      const t = e.changedTouches[0];
      const next = k.notes.find(n => !n.res && n.t - k.t > -OK);
      // se a próxima nota é de arrastar, espera o movimento; senão o toque já conta
      if (next && next.lane === 'P' && next.t - k.t < OK * 2) { k.touch = { x: t.clientX, y: t.clientY, done: false }; return; }
      knotJudge(t.clientX < innerWidth / 2 ? 'L' : 'R');
    } else if (e.type === 'touchmove' && k.touch && !k.touch.done) {
      const t = e.changedTouches[0];
      if (Math.hypot(t.clientX - k.touch.x, t.clientY - k.touch.y) > 28) { k.touch.done = true; knotJudge('P'); }
    } else if (e.type === 'touchend') k.touch = null;
  }
  function knotDraw() {
    const g = rctx, k = knot, W = 120, H = 108, HIT = 92;
    g.fillStyle = '#0b0d12'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#151a22'; g.fillRect(14, 0, 44, H); g.fillRect(62, 0, 44, H);
    g.fillStyle = '#c9c2a8'; g.fillRect(10, HIT, 100, 2);
    g.font = '7px monospace'; g.textAlign = 'center'; g.fillStyle = '#8a8676';
    g.fillText('ESQ', 36, H - 3); g.fillText('DIR', 84, H - 3);
    for (const n of k.notes) {
      if (n.res) continue;
      const y = HIT - (n.t - k.t) / FALL * HIT;
      if (y < -8 || y > H + 4) continue;
      if (n.lane === 'P') { g.fillStyle = '#e8e2d0'; g.fillRect(18, y - 3, 84, 6); g.fillStyle = '#0b0d12'; g.fillText('⇆ APERTA', 60, y + 2); }
      else { g.fillStyle = n.lane === 'L' ? '#4fc0b0' : '#e0b040'; g.fillRect(n.lane === 'L' ? 22 : 70, y - 3, 28, 6); }
    }
    if (k.fbT > 0) { g.font = 'bold 9px monospace'; g.fillStyle = k.fbC; g.fillText(k.fb, 60, 40); }
  }
  function knotEnd() {
    const k = knot; mode = 'idle'; knot = null;
    rcan.style.display = 'none';
    for (const ev of ['touchstart', 'touchmove', 'touchend']) document.removeEventListener(ev, knotTouch);
    const n = k.notes.length;
    const res = { errors: k.errors + k.misses, time: k.end, timeout: k.misses >= Math.ceil(n / 2), perfect: k.perfects === n && k.errors === 0 };
    const r = resolver; resolver = null;
    setTimeout(() => r(res), 300);
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
        el.name.textContent = 'PROFESSOR';
      }
    },
    update(dt, time) {
      if (!active) return;
      talk = false;
      if (mode === 'knot') {
        const k = knot;
        k.t += dt; k.fbT -= dt;
        for (const n of k.notes) if (!n.res && k.t - n.t > OK) { n.res = 'miss'; k.misses++; knotFb('PERDEU', '#f77'); }
        knotDraw();
        if (k.t >= k.end) knotEnd();
      }
      if (mode === 'typing') {
        talk = true;
        q.acc += dt * speaker.cps;
        while (q.acc >= 1 && q.i < q.text.length) {
          q.acc -= 1;
          const ch = q.text[q.i++]; q.shown += ch;
          if (speaker.blip && ch !== ' ' && q.i % 3 === 0) AUDIO.sfx('blip', speaker.blip[0], speaker.blip[1]);
          if (speaker.pig && (ch === '.' || ch === '!' || ch === '?' || ch === ',') && Math.random() < 0.55) AUDIO.sfx(Math.random() < 0.65 ? 'oink' : 'grunt', 0.55);
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

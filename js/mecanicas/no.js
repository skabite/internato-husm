// Minijogo do De Barros: o NÓ CIRÚRGICO, uma mão de cada vez. No roteiro: const r = await c.knot('esquerda' | 'direita');
// Resultado: { errors, time, timeout, perfect } — perfeito = sem erro e rápido.
//  - Computador (nó clássico): aparece uma sequência de teclas; mão esquerda = W A S D, direita = setas. 6 s por mão.
//  - Celular (arrasto): aparece uma seta; arraste o dedo na direção dela, cada mão na sua metade da tela.
//    Cada seta tem ~1,4 s: demorou, o fio afrouxa (conta erro). A mão direita tem diagonais.
// Cada acerto toca a próxima nota de Eine kleine Nachtmusik.
CONVO.minigame('knot', (() => {
  const MELODY = [392, 293.7, 392, 293.7, 392, 293.7, 392, 493.9, 587.3, 523.3, 440, 523.3, 440, 523.3, 440, 370, 440, 293.7];
  // mão esquerda: 4 direções · mão direita: 8 (com diagonais). Cada seta tem ~1,4 s: demorou, o fio afrouxa (conta erro).
  const DIRS = ['L', 'R', 'U', 'D'], DIAG = ['UL', 'UR', 'DL', 'DR'];
  const ARROW = { L: '←', R: '→', U: '↑', D: '↓', UL: '↖', UR: '↗', DL: '↙', DR: '↘' };
  const SECTOR = ['R', 'DR', 'D', 'DL', 'L', 'UL', 'U', 'UR'];       // ângulo da tela (y pra baixo), de 45 em 45°
  const KNOT_N = 8, KNOT_LIMIT = 15, KNOT_FAST = 8, KNOT_STEP = 1.4;
  let kcan = null, kctx = null, kside = null, mel = 0;
  let ui = null, el = null, knot = null;            // knot: estado do nó em andamento (os testes leem seq/classic)

  // No computador fica o nó clássico: digitar a sequência (mão esquerda = WASD, direita = setas) antes do tempo acabar.
  const KEYSETS = {
    esquerda: { codes: ['KeyW', 'KeyA', 'KeyS', 'KeyD'], label: { KeyW: 'W', KeyA: 'A', KeyS: 'S', KeyD: 'D' } },
    direita: { codes: ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'], label: { ArrowUp: '↑', ArrowLeft: '←', ArrowDown: '↓', ArrowRight: '→' } },
  };
  const CLASSIC_N = 7, CLASSIC_LIMIT = 6, CLASSIC_FAST = 3.5;
  function knotClassicStart(hand) {
    const ks = KEYSETS[hand];
    knot = { classic: true, hand, ks, seq: Array.from({ length: CLASSIC_N }, () => U.pick(ks.codes)), i: 0, errors: 0, t: 0 };
    knotClassicRender();
    el.silence.style.display = '';
    return knot;
  }
  function knotClassicRender() {
    const k = knot;
    el.options.innerHTML = '<div class="knot classic">' + k.seq.map((c, i) =>
      '<span class="' + (i < k.i ? 'ok' : i === k.i ? 'cur' : '') + '">' + k.ks.label[c] + '</span>').join('') +
      '</div><div class="knot-help">MÃO ' + k.hand.toUpperCase() + ' · ' + (k.hand === 'esquerda' ? 'W A S D' : 'setas') + ' · erros: ' + k.errors + '</div>';
  }
  function knotClassicKey(code) {
    const k = knot;
    if (!k.ks.codes.includes(code)) return;
    if (code === k.seq[k.i]) { k.i++; AUDIO.sfx('note', MELODY[mel++ % MELODY.length], 0.16); }
    else { k.errors++; AUDIO.sfx('bad'); }
    knotClassicRender();
    if (k.i >= k.seq.length) knotEnd();
  }

  function knotStart(hand) {
    if (!TOUCH.on) return knotClassicStart(hand);
    const diag = hand === 'direita', pool = diag ? DIRS.concat(DIAG, DIAG) : DIRS;
    const seq = [];
    while (seq.length < KNOT_N) { const d = U.pick(pool); if (d !== seq[seq.length - 1]) seq.push(d); }
    knot = { hand, seq, diag, i: 0, errors: 0, t0: performance.now(), t: 0, step0: -0.6, fb: '', fbT: 0, drag: null, shake: 0 };
    if (!kcan) {
      kcan = document.createElement('canvas'); kcan.id = 'rhythm'; kcan.width = 120; kcan.height = 108;
      document.body.appendChild(kcan); kctx = kcan.getContext('2d');
    }
    kcan.style.display = 'block';
    el.options.innerHTML = '<div class="knot">NÓ · MÃO ' + hand.toUpperCase() + '</div><div class="knot-help">' + (TOUCH.on
      ? 'ARRASTE na direção da seta usando só o lado ' + (diag ? 'DIREITO' : 'ESQUERDO') + ' da tela (o lado aceso) · rápido: o fio afrouxa'
      : 'segure o botão do mouse e ARRASTE na direção da seta · ou setas / WASD' + (diag ? ' · diagonais: Q E Z C' : '')) + '</div>';
    for (const ev of ['touchstart', 'touchmove', 'touchend', 'mousedown', 'mousemove', 'mouseup']) document.addEventListener(ev, knotPointer, { passive: false });
    if (TOUCH.on) {                                                    // só no celular: metade da tela de cada mão
      if (!kside) { kside = document.createElement('div'); kside.id = 'knotside'; kside.innerHTML = '<div class="kon"></div><div class="koff"></div>'; document.body.appendChild(kside); }
      kside.className = hand === 'direita' ? 'right' : 'left';
      kside.firstChild.innerHTML = '<div>MÃO ' + hand.toUpperCase() + '</div><span>ARRASTE AQUI</span>';
      kside.style.display = 'block';
    }
    return knot;
  }
  function knotNow() { knot.t = (performance.now() - knot.t0) / 1000; return knot.t; }
  function knotFb(t, c) { knot.fb = t; knot.fbC = c; knot.fbT = 0.5; }
  function knotGesture(d) {
    const k = knot; knotNow();
    if (d === k.seq[k.i]) {
      k.i++; k.step0 = k.t; knotFb('BOA', '#8f8');
      AUDIO.sfx('note', MELODY[mel++ % MELODY.length], 0.16);
      if (k.i >= k.seq.length) knotEnd();
    } else { k.errors++; k.shake = 0.25; knotFb('ERROU', '#f77'); AUDIO.sfx('bad'); }
  }
  function knotKey(code) {
    if (knot.classic) return knotClassicKey(code);
    const m = { KeyA: 'L', ArrowLeft: 'L', KeyD: 'R', ArrowRight: 'R', KeyW: 'U', ArrowUp: 'U', KeyS: 'D', ArrowDown: 'D',
      KeyQ: 'UL', KeyE: 'UR', KeyZ: 'DL', KeyC: 'DR' };
    if (m[code]) knotGesture(m[code]);
  }
  // um gesto por toque/clique: soma o movimento até passar de ~30 px e decide a direção dominante
  function knotPointer(e) {
    if (!knot) return;
    const k = knot, touch = e.type.startsWith('touch');
    if (touch) e.preventDefault();
    if (e.type === 'touchstart' || (e.type === 'mousedown' && e.button === 0)) {
      const sx = touch ? e.changedTouches[0].clientX : 0;
      // no celular, cada mão tem a sua metade da tela; começou do lado errado = erro
      const wrongSide = touch && (k.hand === 'direita') !== (sx >= innerWidth / 2);
      k.drag = { x: 0, y: 0, done: false, wrongSide, lx: sx, ly: touch ? e.changedTouches[0].clientY : 0 }; return;
    }
    if (e.type === 'touchend' || e.type === 'mouseup') { k.drag = null; return; }
    if (!k.drag || k.drag.done) return;
    if (touch) { const t = e.changedTouches[0]; k.drag.x += t.clientX - k.drag.lx; k.drag.y += t.clientY - k.drag.ly; k.drag.lx = t.clientX; k.drag.ly = t.clientY; }
    else { k.drag.x += e.movementX || 0; k.drag.y += e.movementY || 0; }
    if (Math.hypot(k.drag.x, k.drag.y) > 30) {
      k.drag.done = true;
      if (k.drag.wrongSide) { k.errors++; k.shake = 0.25; knotFb('LADO ERRADO', '#f77'); AUDIO.sfx('bad'); return; }
      const { x, y } = k.drag;
      knotGesture(k.diag ? SECTOR[(Math.round(Math.atan2(y, x) / (Math.PI / 4)) + 8) % 8]
        : Math.abs(x) > Math.abs(y) ? (x < 0 ? 'L' : 'R') : (y < 0 ? 'U' : 'D'));
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
      const st = Math.max(0, 1 - (k.t - k.step0) / KNOT_STEP);          // tempo desta seta
      g.fillStyle = st > 0.35 ? '#ffd84a' : '#f77'; g.fillRect(40, 56, 40 * st, 2);
    }
    // tempo
    const left = Math.max(0, 1 - k.t / KNOT_LIMIT);
    g.fillStyle = '#222'; g.fillRect(8, 100, 104, 4);
    g.fillStyle = k.t < KNOT_FAST ? '#8f8' : '#c55'; g.fillRect(8, 100, 104 * left, 4);
    if (k.fbT > 0) { g.font = 'bold 9px monospace'; g.fillStyle = k.fbC; g.textAlign = 'center'; g.fillText(k.fb, 60, 10); }
  }
  function knotEnd(timeout = false) {
    const k = knot; knot = null;
    if (k.classic) { el.silence.style.display = 'none'; el.silenceFill.style.width = '0'; }
    else {
      kcan.style.display = 'none'; if (kside) kside.style.display = 'none';
      for (const ev of ['touchstart', 'touchmove', 'touchend', 'mousedown', 'mousemove', 'mouseup']) document.removeEventListener(ev, knotPointer);
    }
    const res = { errors: k.errors, time: k.t, timeout, perfect: !timeout && k.errors === 0 && k.t <= (k.classic ? CLASSIC_FAST : KNOT_FAST) };
    ui.finish(res, 350);
  }

  return {
    start(u, hand) { ui = u; el = u.el; return knotStart(hand); },
    key: code => knotKey(code),
    update(dt) {
      if (knot.classic) {
        knot.t += dt;
        el.silenceFill.style.width = Math.min(100, 100 * knot.t / CLASSIC_LIMIT) + '%';
        if (knot.t >= CLASSIC_LIMIT) knotEnd(true);
        return;
      }
      const k = knot;
      knotNow(); k.fbT -= dt; k.shake -= dt;
      if (k.t - k.step0 > KNOT_STEP) { k.errors++; k.step0 = k.t; k.shake = 0.25; knotFb('FROUXO', '#f77'); AUDIO.sfx('bad'); }
      knotDraw(dt);
      if (k.t >= KNOT_LIMIT) knotEnd(true);
    },
  };
})());

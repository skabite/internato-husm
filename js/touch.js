// Controles de toque (celular Android): joystick, arrastar pra olhar e botões.
// Os botões "apertam as teclas" do jogo (KeyboardEvent), então o resto do código não muda.
// Liga sozinho em tela de toque; pra testar no computador use index.html#touch.
const TOUCH = (() => {
  const on = matchMedia('(pointer: coarse)').matches || /[#&,]touch/.test(location.hash);
  let H = null;                                  // ganchos do main.js
  const held = new Set();
  const key = (code, down) => {
    if (down === held.has(code)) return;
    if (down) held.add(code); else held.delete(code);
    const k = code.startsWith('Digit') ? code.slice(5) : code === 'Space' ? ' ' : code;
    dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, key: k }));
  };
  const tap = code => { key(code, true); setTimeout(() => key(code, false), 60); };

  let root, stick, knob, pads, btn = {};
  const joy = { id: null, x0: 0, y0: 0 }, look = { id: null, x: 0, y: 0 };
  const JOY_R = 56;

  function el(tag, cls, parent, html) {
    const e = document.createElement(tag); e.className = cls; if (html) e.innerHTML = html; parent.appendChild(e); return e;
  }
  // botão: dispara no toque (não espera o "click"), aceita vários dedos ao mesmo tempo
  function button(cls, label, onDown, onUp) {
    const b = el('div', 'tbtn ' + cls, root, label);
    b.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); b.classList.add('down'); onDown(); }, { passive: false });
    const up = e => { e.preventDefault(); e.stopPropagation(); b.classList.remove('down'); onUp && onUp(); };
    b.addEventListener('touchend', up, { passive: false }); b.addEventListener('touchcancel', up, { passive: false });
    return b;
  }

  function setStick(dx, dy) {
    const d = Math.hypot(dx, dy), k = d > JOY_R ? JOY_R / d : 1;
    knob.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
    const nx = dx / JOY_R, ny = dy / JOY_R, T = 0.35;
    key('KeyW', ny < -T); key('KeyS', ny > T); key('KeyA', nx < -T); key('KeyD', nx > T);
    key('ShiftLeft', d > JOY_R * 1.15);          // empurrou até a borda = correr
  }
  function releaseStick() {
    joy.id = null; stick.style.display = 'none';
    for (const c of ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ShiftLeft']) key(c, false);
  }

  function onStart(e) {
    if (!H || H.state() !== 'play' || H.paused()) return;
    for (const t of Array.from(e.changedTouches)) {
      if (t.clientX < innerWidth * 0.42 && joy.id === null) {
        joy.id = t.identifier; joy.x0 = t.clientX; joy.y0 = t.clientY;
        stick.style.display = 'block'; stick.style.left = (t.clientX - JOY_R) + 'px'; stick.style.top = (t.clientY - JOY_R) + 'px';
        setStick(0, 0);
      } else if (look.id === null) { look.id = t.identifier; look.x = t.clientX; look.y = t.clientY; }
    }
    e.preventDefault();
  }
  function onMove(e) {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === joy.id) setStick(t.clientX - joy.x0, t.clientY - joy.y0);
      if (t.identifier === look.id) { H.look(t.clientX - look.x, t.clientY - look.y); look.x = t.clientX; look.y = t.clientY; }
    }
    if (joy.id !== null || look.id !== null) e.preventDefault();
  }
  function onEnd(e) {
    for (const t of Array.from(e.changedTouches)) {
      if (t.identifier === joy.id) releaseStick();
      if (t.identifier === look.id) look.id = null;
    }
  }

  // tela cheia + paisagem (Android): só funciona a partir de um toque do jogador
  function goFull() {
    const d = document.documentElement;
    try {
      const p = d.requestFullscreen && d.requestFullscreen({ navigationUI: 'hide' });
      if (p && p.then) p.then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {})).catch(() => {});
    } catch (err) { /* sem tela cheia */ }
  }

  function init(hooks) {
    if (!on) return;
    H = hooks;
    document.body.classList.add('touch');
    root = el('div', '', document.body); root.id = 'touch';
    stick = el('div', 'stick', root); knob = el('div', 'knob', stick);

    btn.fire = button('fire', 'ATACAR', () => H.fire());
    btn.use = button('use', 'USAR', () => tap('KeyE'));
    btn.weapon = button('small weapon', 'ARMA', () => tap(COMBAT.P.weapon === 'revolver' ? 'Digit1' : 'Digit2'));
    btn.reload = button('small reload', 'R', () => tap('KeyR'));
    btn.light = button('small light', '🔦', () => tap('KeyF'));
    btn.px = button('small px', 'PX', () => tap('KeyP'));
    btn.pause = button('small pause', 'II', () => H.pause());
    btn.talk = button('talk', 'CONTINUAR ▶', () => key('Space', true), () => key('Space', false));
    // minijogo do nó: dois direcionais, um pra cada polegar
    pads = el('div', 'pads', root);
    for (const [side, codes, labels] of [['left', ['KeyW', 'KeyA', 'KeyS', 'KeyD'], ['W', 'A', 'S', 'D']], ['right', ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'], ['↑', '←', '↓', '→']]]) {
      const pad = el('div', 'pad ' + side, pads);
      codes.forEach((c, i) => {
        const b = el('div', 'tbtn dir d' + i, pad, labels[i]);
        b.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); b.classList.add('down'); tap(c); }, { passive: false });
        b.addEventListener('touchend', e => { e.preventDefault(); b.classList.remove('down'); }, { passive: false });
      });
    }

    document.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd); document.addEventListener('touchcancel', onEnd);
    document.getElementById('boot').addEventListener('click', goFull);
    document.addEventListener('visibilitychange', () => { if (document.hidden && H.state() === 'play') H.pause(); });
  }

  // mostra só o que faz sentido em cada momento
  function update() {
    if (!H) return;
    const talking = DIALOGUE.active || CONVO.active;
    const playing = H.state() === 'play' && !H.paused() && !talking;
    const knot = !!document.querySelector('#dlg-options .knot');
    const show = (b, v) => { b.style.display = v ? '' : 'none'; };
    for (const k of ['use', 'light', 'px', 'pause']) show(btn[k], playing);
    show(btn.fire, playing && COMBAT.P.weapon);
    show(btn.weapon, playing && COMBAT.P.has.revolver);
    show(btn.reload, playing && COMBAT.P.weapon === 'revolver');
    show(btn.talk, talking && !knot);
    btn.talk.textContent = DIALOGUE.active ? 'INTERROMPER!' : 'CONTINUAR ▶';
    btn.talk.classList.toggle('hot', DIALOGUE.active && document.getElementById('breath').classList.contains('on'));
    btn.use.classList.toggle('hot', !!document.getElementById('hint').textContent || !!document.getElementById('prompt').textContent);
    pads.style.display = knot ? '' : 'none';
    if (!playing && joy.id !== null) releaseStick();
    if (!playing) look.id = null;
  }

  return { on, init, update };
})();

// Minijogo do Centro Obstétrico: SINTONIZAR O CARDIOTOCÓGRAFO. No roteiro: const r = await c.ctg(opções);
// Plano completo em docs/minijogo-cardiotocografia.md. Aqui é o laço 3–5: achar o foco, girar o dial, segurar
// o sinal (bater no aparelho quando o cabo falha) e fixar a cinta pra fita imprimir.
// Antes e depois disso é conversa (se apresentar, Leopold, toco, ler o traçado) — isso é do roteiro, não daqui.
//
// Resultado: { erros, tempo, timeout, fixou, bpm, armadilhas: { materna }, perfeito }
//   perfeito = fixou, sem erro, sem cair na materna e dentro do tempo-alvo.
//
// O que o jogo ensina (é a graça do minijogo):
//   · a barriga tem DOIS batimentos limpos: o do bebê (~140) e o da mãe (~84, no ponto M). O da mãe é armadilha:
//     batimento limpo e devagar demais. A enfermeira mostra o oxímetro se você fixar ali.
//   · perto do dial certo mas não nele, o visor mostra 280 ou 70: é artefato (contagem dobrada ou pela metade).
//   · quando o cabo falha, o visor pisca um número por meio segundo. Perda de sinal não é frequência cardíaca.
CONVO.minigame('ctg', (() => {
  const W = 200, H = 140;                    // canvas em pixel (o dobro do nó do De Barros); o CSS amplia
  // níveis: quanto menor o sigma/tau, mais fino o ponto certo; quanto menor a queda, mais o cabo falha
  const CFG = [
    { sigma: 0.200, tau: 0.130, quedaCada: 5.2, quedaVale: 1.5, alvo: 26 },
    { sigma: 0.155, tau: 0.100, quedaCada: 3.8, quedaVale: 2.2, alvo: 22 },
    { sigma: 0.120, tau: 0.078, quedaCada: 2.9, quedaVale: 2.6, alvo: 19 },
  ];
  const FCF = 140;                           // frequência cardíaca fetal (bpm)
  const MAMAE = 84;                          // a da mãe: limpinha e devagar demais
  const ESTACOES = [
    'RÁDIO AM: o Falastrão dando entrevista em alemão.',
    'CANTO DE BALEIA. "Isso é normal?", pergunta o Sandro.',
    'INTERNET DISCADA. "Meu filho tá baixando alguma coisa?"',
    'O MONTEIRO, pelo encanamento, falando de tomates.',
    'GRUNHIDOS. São os javalis da Ala C. Ninguém quer saber como.',
    'GRE-NAL narrado pelo Falastrão: "O INTERNO GIRA O DIAL..."',
  ];
  let can = null, g = null, ui = null, el = null, ctg = null;

  const clamp01 = x => U.clamp(x, 0, 1);
  const dist2 = (a, b) => (a.u - b.u) ** 2 + (a.v - b.v) ** 2;

  // ---------- abrir o minijogo ----------
  function ctgStart(u, o = {}) {
    ui = u; el = u.el;
    const nivel = U.clamp(Math.round(o.nivel != null ? o.nivel : 1), 0, 2);      // 0, 1 ou 2
    const broncas = o.broncas || 0;            // erros da conversa (sem licença, gel no toco): contam pro 'perfeito'
    // onde está o foco: vem das manobras de Leopold (o roteiro diz o lado do dorso). Cefálica = abaixo do umbigo.
    const lado = o.lado === 'esquerda' ? -1 : 1;
    const F = o.foco || { u: clamp01(0.5 + lado * (0.14 + Math.random() * 0.10)), v: 0.62 + Math.random() * 0.18 };
    // o ponto materno: em outro lugar qualquer da barriga, nunca colado no foco
    let M;
    do { M = { u: 0.2 + Math.random() * 0.6, v: 0.2 + Math.random() * 0.5 }; } while (dist2(M, F) < 0.05);
    ctg = {
      fase: 'sintonizar', p: { u: 0.5, v: 0.35 }, F, M,
      dial: Math.random(), dstar: 0.12 + Math.random() * 0.76, nivel,
      contato: 1, quedaT: 0, quedaProx: CFG[nivel].quedaCada, sinal: 0, posSinal: 0,
      luz: 0, t: 0, erros: 0, broncas, bpm: 0, bpmRuido: 0, estacao: -1, msg: '',
      imprimindo: 0, ruim: 0, fixou: false,
      armadilhas: { materna: false, dobra: false },
      hist: [], fb: '', fbC: '#fff', fbT: 0, shake: 0, dedo: null, mostraBpm: 0, mostraRuido: false,
    };
    if (!can) {
      can = document.createElement('canvas'); can.id = 'ctg'; can.width = W; can.height = H;
      document.body.appendChild(can); g = can.getContext('2d');
    }
    can.style.display = 'block';
    el.options.innerHTML = '';
    el.text.textContent = '';
    el.name.textContent = 'CARDIOTOCÓGRAFO — PATRIMÔNIO 000.001';   // aqui quem fala é o aparelho
    el.portrait.style.display = 'none';
    addOpts();
    for (const ev of ['mousemove', 'wheel']) document.addEventListener(ev, ctgMouse, { passive: false });
    for (const ev of ['touchstart', 'touchmove', 'touchend']) document.addEventListener(ev, ctgDedo, { passive: false });
    ctgDraw();
    return ctg;
  }

  // os botões ficam na própria caixa de conversa (.opt): funcionam no mouse e no toque, sem código novo.
  // O dial em botão é o que salva o celular (lá não tem roda do mouse nem Q/E).
  function addOpts() {
    const linha = (txt, i, cls) => `<div class="opt ctgbtn ${cls || ''}" data-i="${i}"><b>${i + 1}.</b> ${txt}</div>`;
    el.options.innerHTML = TOUCH.on
      ? linha('DIAL ◀', 0) + linha('DIAL ▶', 1) + linha('BATER NO APARELHO', 2) + linha('FIXAR A CINTA', 3)
      : linha('BATER NO APARELHO', 2) + linha('FIXAR A CINTA', 3);
    [...el.options.querySelectorAll('.ctgbtn')].forEach(d => { d.onclick = () => pick(+d.dataset.i); });
  }

  // ---------- contas do aparelho ----------
  // o que o transdutor está pegando: perto do foco OU perto da mãe dá batimento limpo (é a armadilha)
  function aoAlcance() {
    const cfg = CFG[ctg.nivel];
    const noFoco = Math.exp(-dist2(ctg.p, ctg.F) / (cfg.sigma * cfg.sigma));
    const naMae = Math.exp(-dist2(ctg.p, ctg.M) / (cfg.sigma * cfg.sigma));
    return { noFoco, naMae, perto: Math.max(noFoco, naMae) };
  }
  function ctgCalc(dt) {
    const cfg = CFG[ctg.nivel], k = ctg;
    k.t += dt; k.fbT -= dt; k.shake -= dt;
    const { noFoco, naMae, perto } = aoAlcance();
    // o dial: a estação certa é uma faixa. Longe dela, o que entra é a estação (rádio, baleia, modem...).
    const dd = Math.abs(k.dial - k.dstar);
    const sintonia = Math.exp(-(dd * dd) / (cfg.tau * cfg.tau));
    k.posSinal = perto * sintonia;
    k.sinal = k.contato * k.posSinal;

    // o mau contato: de tempo em tempo o cabo falha e a luzinha começa a piscar
    if (k.contato > 0.5) {
      k.quedaProx -= dt;
      if (k.quedaProx <= 0) {
        k.quedaProx = cfg.quedaCada + Math.random() * 1.6;
        k.contato = 0.12;
      }
    }
    // a luzinha do cabo: acende e apaga (bater só vale com ela acesa)
    if (k.contato < 0.5) k.luz = (k.luz + dt) % 0.72;
    else k.luz = 0;
    if (k.quedaT > 0) k.quedaT -= dt;

    // o visor: só mostra número quando está pegando alguma coisa de verdade
    k.bpmRuido = 0; k.ehMae = false;
    if (k.contato < 0.5) {
      k.bpm = 0;                                                               // perdeu o sinal: o número antigo NÃO vale mais
      if (Math.random() < 0.10) k.bpmRuido = Math.random() < 0.5 ? 180 : 60;   // pisca um número: é perda de sinal, não FCF
    } else if (perto > 0.30) {
      // as faixas do dial que contam dobrado ou pela metade vêm PRIMEIRO: nelas o sinal já caiu (o exp as apaga),
      // mas o visor insiste no número. É esse o susto — o número aparece sem sinal que o sustente.
      if (dd > cfg.tau * 2.0 && dd < cfg.tau * 3.4) { k.bpm = 280; k.armadilhas.dobra = true; }
      else if (dd > cfg.tau * 3.4 && dd < cfg.tau * 4.8) { k.bpm = 70; k.armadilhas.dobra = true; }
      else if (sintonia > 0.35) {
        k.ehMae = naMae > noFoco;
        k.bpm = k.ehMae ? MAMAE + Math.round((Math.random() - 0.5) * 2) : FCF + Math.round((Math.random() - 0.5) * 6);
      } else k.bpm = 0;
    } else { k.bpm = 0; }
    k.mostraBpm = k.bpm || k.bpmRuido;
    k.mostraRuido = !k.bpm && !!k.bpmRuido;

    // a legenda da estação: o que está tocando enquanto o bebê não aparece
    k.estacao = k.sinal > 0.55 ? -1 : Math.floor((1 - k.dial) * ESTACOES.length) % ESTACOES.length;
    k.msg = k.quedaT > 0 ? 'O cabo soltou de vez. Espera e tenta de novo.'
      : k.contato < 0.5 ? 'O CABO FALHOU. Bata no aparelho quando a luzinha acender.'
        : k.fase === 'imprimir' ? 'A fita correndo. Não deixe o cabo cair agora.'
          : k.sinal > 0.55 ? 'Tchuf-tchuf. É ele.'
            : perto > 0.22 ? 'Tem um batimento aqui embaixo, abafado. Falta o dial.'
              : ESTACOES[k.estacao];

    // a fita: um traçado por décimo de segundo
    if (k.fase === 'imprimir') {
      k.imprimindo = Math.min(1, k.imprimindo + dt / 9);
      if (k.sinal < 0.45) k.ruim += dt; else k.ruim = Math.max(0, k.ruim - dt * 0.4);
      if (k.ruim > 2.6) { k.fase = 'sintonizar'; k.imprimindo = 0; k.ruim = 0; k.erros++; ctgFb('PERDEU O SINAL', '#f77'); k.shake = 0.3; if (k.contato < 0.5) k.contato = 0.12; }
      else if (k.imprimindo >= 1) return ctgFim(false);
    }
    k.hist.push({ bpm: k.bpm || 0, ok: k.sinal >= 0.45, ruido: k.mostraRuido });
    if (k.hist.length > W - 40) k.hist.shift();
  }
  function ctgFb(texto, cor) { ctg.fb = texto; ctg.fbC = cor; ctg.fbT = 1.1; }

  // ---------- o que o jogador faz ----------
  function bater() {
    const k = ctg, cfg = CFG[k.nivel];
    if (k.quedaT > 0) return;
    if (k.luz > 0 && k.luz < 0.36) {                       // a luzinha está acesa: acertou a batida
      k.contato = 1; k.luz = 0; ctgFb('CONTATO OK', '#8f8'); AUDIO.sfx('click');
    } else if (k.contato < 0.5) {                          // bateu fora de hora: derruba o sinal de vez por 2 s
      k.quedaT = cfg.quedaVale; k.contato = 0; k.erros++; ctgFb('BATEU FORA DE HORA', '#f77'); k.shake = 0.3; AUDIO.sfx('bad');
    } else {                                               // bateu à toa, com tudo funcionando
      k.erros++; ctgFb('NÃO PRECISAVA', '#f77'); AUDIO.sfx('bad');
    }
  }
  function fixar() {
    const k = ctg;
    if (k.sinal < 0.55) { k.erros++; ctgFb('AINDA NÃO, O SINAL ESTÁ RUIM', '#f77'); AUDIO.sfx('bad'); return; }
    // armadilha: batimento limpo e devagar demais é o da MÃE. Fixar aqui não imprime nada.
    const { noFoco, naMae } = aoAlcance();
    if (naMae > noFoco) {
      k.armadilhas.materna = true; k.erros++;
      ctgFb('84 bpm. É A MÃE.', '#ffb43a'); k.shake = 0.3; AUDIO.sfx('bad'); return;
    }
    k.fase = 'imprimir'; k.imprimindo = 0; k.ruim = 0; k.hist = []; k.fixou = true;
    ctgFb('CINTA FIXADA', '#8f8'); AUDIO.sfx('note', 523.3, 0.18);
  }
  function pick(i) {
    if (!ctg) return;
    if (i === 0) girar(-1);
    else if (i === 1) girar(1);
    else if (i === 2) bater();
    else if (i === 3 && ctg.fase === 'sintonizar') fixar();
  }
  const girar = sinal => { if (ctg && ctg.fase === 'sintonizar') ctg.dial = clamp01(ctg.dial + sinal * 0.04); };
  function key(code) {
    if (!ctg) return;
    if (code === 'Space') bater();
    else if (code === 'Enter' || code === 'NumpadEnter') { if (ctg.fase === 'sintonizar') fixar(); }
    else if (code === 'KeyQ') girar(-1);                                // o dial: cada toque numa marcação
    else if (code === 'KeyE') girar(1);
    else if (code.startsWith('Digit')) { const n = +code.slice(5); if (n >= 1 && n <= 4) pick(n - 1); }   // os números que os botões mostram
  }
  // no celular o transdutor anda arrastando o dedo (o dial fica nos botões: dedo grosso não acerta roda de mouse)
  function ctgDedo(e) {
    if (!ctg || ctg.fase !== 'sintonizar') return;
    if (e.type === 'touchmove') e.preventDefault();          // só aqui: no touchstart o preventDefault mataria o clique dos botões
    const t = e.changedTouches[0], n = e.touches ? e.touches.length : 1;
    if (e.type === 'touchstart') { if (n === 1) ctg.dedo = { x: t.clientX, y: t.clientY }; return; }   // 2º dedo não rouba o arrasto
    if (e.type === 'touchend') { if (!n) ctg.dedo = null; return; }
    if (!ctg.dedo || n !== 1) return;
    ctg.p.u = clamp01(ctg.p.u + (t.clientX - ctg.dedo.x) * 0.003);
    ctg.p.v = clamp01(ctg.p.v + (t.clientY - ctg.dedo.y) * 0.003);
    ctg.dedo.x = t.clientX; ctg.dedo.y = t.clientY;
  }
  // mouse move o transdutor (mesmo esquema do nó por arrasto); Q/E e a rodinha giram o dial
  function ctgMouse(e) {
    if (!ctg || ctg.fase !== 'sintonizar') return;
    if (e.type === 'wheel') { e.preventDefault(); ctg.dial = clamp01(ctg.dial + Math.sign(e.deltaY) * 0.03); return; }
    if (!e.movementX && !e.movementY) return;
    ctg.p.u = clamp01(ctg.p.u + e.movementX * 0.0022);
    ctg.p.v = clamp01(ctg.p.v + e.movementY * 0.0022);
  }
  function ctgFim(timeout) {
    const k = ctg;
    const cfg = CFG[k.nivel];
    const res = { erros: k.erros, broncas: k.broncas, tempo: k.t, timeout: !!timeout, fixou: !!k.fixou, bpm: k.bpm || FCF,
      armadilhas: { materna: !!k.armadilhas.materna, dobra: !!k.armadilhas.dobra },
      perfeito: !timeout && k.fixou && k.erros === 0 && !k.broncas && !k.armadilhas.materna && k.t <= cfg.alvo };
    ctg = null;
    can.style.display = 'none';
    for (const ev of ['mousemove', 'wheel']) document.removeEventListener(ev, ctgMouse);
    for (const ev of ['touchstart', 'touchmove', 'touchend']) document.removeEventListener(ev, ctgDedo);
    ui.finish(res, 400);
  }

  // ---------- desenho ----------
  function elipse(c, cx, cy, rx, ry, cor, borda) {
    c.fillStyle = borda;
    for (let y = -ry - 1; y <= ry + 1; y++) { const w = rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2)); if (w > 0) c.fillRect(cx - w - 1, cy + y, w * 2 + 2, 1); }
    c.fillStyle = cor;
    for (let y = -ry; y <= ry; y++) { const w = (rx - 1) * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2)); if (w > 0) c.fillRect(cx - w, cy + y, w * 2, 1); }
  }
  function ctgDraw() {
    const c = g, k = ctg;
    c.fillStyle = '#0b0d12'; c.fillRect(0, 0, W, H);

    // ---- a barriga vista de cima ----
    const bx = 50, by = 54, brx = 40, bry = 44;
    elipse(c, bx, by, brx, bry, '#c99a76', '#7a5238');
    c.fillStyle = '#a87a58';                                   // a linha nigra e o umbigo
    for (let y = -10; y < 30; y++) c.fillRect(bx - 1, by + y, 2, 1);
    c.fillStyle = '#8a5c40'; c.fillRect(bx - 3, by - 12, 6, 4); c.fillRect(bx - 2, by - 13, 4, 6);
    c.fillStyle = '#b98a68';                                   // as costelas de leve
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) c.fillRect(bx + s * (12 + i * 7), by - 30 + i * 3, 5, 1);
    // o transdutor de ultrassom (segue o mouse)
    const px = bx + (k.p.u - 0.5) * 2 * (brx - 8), py = by + (k.p.v - 0.5) * 2 * (bry - 8);
    const trem = k.shake > 0 ? Math.sin(k.t * 90) * 2 : 0;
    c.fillStyle = '#2a2f3a'; c.fillRect(px - 7 + trem, py - 5, 14, 10);
    c.fillStyle = '#8a94a8'; c.fillRect(px - 6 + trem, py - 4, 12, 8);
    c.fillStyle = '#d8e8f0'; c.fillRect(px - 4 + trem, py - 2, 8, 4);
    if (k.contato < 0.5) c.fillStyle = '#f77';                 // o cabo desconectado
    else c.fillStyle = k.luz > 0 && k.luz < 0.36 ? '#ffe66a' : '#3a6a3a';
    c.fillRect(px - 2 + trem, py + 5, 4, 3);
    // o calorzinho do sinal: um anel que acende quando o transdutor chega perto
    const { perto } = aoAlcance();
    if (perto > 0.22 && k.contato > 0.5) {
      c.strokeStyle = 'rgba(255,216,74,' + (0.15 + 0.6 * k.sinal).toFixed(2) + ')'; c.lineWidth = 1;
      const r = 8 + 26 * (1 - perto);
      c.beginPath(); c.ellipse(px, py, r, r * 0.9, 0, 0, 7); c.stroke();
    }

    // ---- o monitor (o visor da FCF e a barra de SINAL) ----
    c.fillStyle = '#141a20'; c.fillRect(92, 8, 100, 44);
    c.strokeStyle = '#2a3a44'; c.strokeRect(92.5, 8.5, 99, 43);
    c.font = '5px monospace'; c.fillStyle = '#6a7a86'; c.textAlign = 'left'; c.fillText('FCF', 96, 15);
    c.font = 'bold 20px monospace'; c.textAlign = 'center';
    if (k.mostraBpm) {
      c.fillStyle = k.mostraRuido ? '#f77' : k.ehMae ? '#ffb43a' : k.bpm >= 200 || k.bpm <= 70 ? '#ff6ad0' : '#5cff8a';
      c.fillText(String(k.mostraBpm), 124, 32);
    } else { c.fillStyle = '#2a3a44'; c.fillText('---', 124, 32); }
    c.font = '5px monospace'; c.fillStyle = '#6a7a86'; c.textAlign = 'left'; c.fillText('bpm', 146, 32);
    c.fillText('SINAL', 96, 47);
    c.fillStyle = '#20262c'; c.fillRect(116, 41, 58, 6);
    c.fillStyle = k.sinal > 0.55 ? '#5cff8a' : k.sinal > 0.25 ? '#ffd84a' : '#c05030';
    c.fillRect(116, 41, 58 * clamp01(k.sinal), 6);
    // a luzinha do cabo (a mesma que está no transdutor, mas grande): bater só vale com ela acesa
    c.fillStyle = '#20262c'; c.beginPath(); c.arc(183, 44, 8, 0, 7); c.fill();
    if (k.quedaT > 0) { c.fillStyle = '#4a5560'; c.beginPath(); c.arc(183, 44, 6, 0, 7); c.fill(); }
    else if (k.contato < 0.5) {
      const on = k.luz < 0.36;
      c.fillStyle = on ? '#ffe66a' : '#5a4a20'; c.beginPath(); c.arc(183, 44, 6, 0, 7); c.fill();
      if (on) { c.font = 'bold 5px monospace'; c.fillStyle = '#ffe66a'; c.textAlign = 'center'; c.fillText('BATA!', 183, 57); }
    } else { c.fillStyle = '#2a5a3a'; c.beginPath(); c.arc(183, 44, 5, 0, 7); c.fill(); }
    if (k.fase === 'imprimir') {                               // a barra vira o progresso da impressão
      c.fillStyle = '#7ab8ff'; c.fillRect(92, 8, 100 * k.imprimindo, 2);
    }

    // ---- a legenda (o jogo inteiro dá pra jogar sem som) ----
    c.font = '5px monospace'; c.fillStyle = k.sinal > 0.55 ? '#8f8' : '#bfe3ff'; c.textAlign = 'left';
    const palavras = k.msg.split(' '); let linha = '', ly = 62;
    for (const p of palavras) {
      if (c.measureText(linha + p + ' ').width > 98) { c.fillText(linha, 94, ly); ly += 7; linha = ''; }
      linha += p + ' ';
    }
    c.fillText(linha, 94, ly);

    // ---- o dial de sintonia ----
    const dx = 148, dy = 100, dr = 17;
    c.fillStyle = '#20262c'; c.beginPath(); c.arc(dx, dy, dr + 2, 0, 7); c.fill();
    c.fillStyle = '#3a4450'; c.beginPath(); c.arc(dx, dy, dr, 0, 7); c.fill();
    for (let i = 0; i < 12; i++) {                             // as marcações
      const a = i / 12 * Math.PI * 2;
      c.fillStyle = '#6a7a86';
      c.fillRect(dx + Math.cos(a) * (dr - 3) - 0.5, dy + Math.sin(a) * (dr - 3) - 0.5, 1, 1);
    }
    const a = -Math.PI / 2 + k.dial * Math.PI * 2;
    c.strokeStyle = '#ffd84a'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(dx, dy); c.lineTo(dx + Math.cos(a) * (dr - 4), dy + Math.sin(a) * (dr - 4)); c.stroke();
    c.font = '5px monospace'; c.fillStyle = '#6a7a86'; c.textAlign = 'center';
    c.fillText('SINTONIA', dx, dy + dr + 8);

    // ---- a fita de papel ----
    const fy1 = 114, fy2 = 131;
    c.fillStyle = '#efe8d4'; c.fillRect(8, fy1, W - 16, fy2 - fy1);
    c.strokeStyle = '#c9c2a8'; c.strokeRect(8.5, fy1 + 0.5, W - 17, fy2 - fy1 - 1);
    for (let b = 60; b <= 200; b += 20) {                      // a grade da FCF (60 a 200)
      const y = fy2 - 2 - (b - 60) / 140 * (fy2 - fy1 - 4);
      c.fillStyle = b === 60 || b === 200 ? '#c9c2a8' : '#e0d8be'; c.fillRect(9, Math.round(y), W - 18, 1);
    }
    c.font = '4px monospace'; c.fillStyle = '#a09880'; c.textAlign = 'left'; c.fillText('60', 10, fy2 - 3); c.fillText('200', 10, fy1 + 5);
    const n = k.hist.length;
    for (let i = 0; i < n; i++) {
      const h = k.hist[i];
      const x = W - 10 - (n - i);
      if (!h.bpm || !h.ok) { c.fillStyle = h.ruido ? '#f77' : '#e0d8be'; c.fillRect(x, fy1 + 6 + ((i * 37) % 17) / 17 * (fy2 - fy1 - 12), 1, 1); continue; }
      const y = fy2 - 2 - (U.clamp(h.bpm, 60, 200) - 60) / 140 * (fy2 - fy1 - 4);
      c.fillStyle = '#1a1a1a'; c.fillRect(x, Math.round(y), 1, 1);
    }

    // ---- recado (acerto/erro) ----
    if (k.fbT > 0) {
      c.font = 'bold 7px monospace'; c.textAlign = 'center';
      c.fillStyle = '#0b0d12'; c.fillRect(W / 2 - 52, 2, 104, 10);
      c.fillStyle = k.fbC || '#fff'; c.fillText(k.fb, W / 2, 9);
    }
    // ---- ajuda ----
    c.font = '4px monospace'; c.fillStyle = '#4a5560'; c.textAlign = 'left';
    c.fillText(TOUCH.on ? 'ARRASTE o dedo pra mover o transdutor · botões DIAL, BATER e FIXAR aí embaixo'
      : 'MOUSE move o transdutor · Q/E giram o dial · ESPAÇO bate no aparelho · ENTER fixa a cinta', 10, H - 2);
  }

  return {
    start(u, o) { return ctgStart(u, o); },
    key,
    pick,
    update(dt) {
      if (!ctg) return;
      ctgCalc(dt);
      if (ctg && ctg.t > 75) return ctgFim(true);
      if (ctg) ctgDraw();
    },
  };
})());

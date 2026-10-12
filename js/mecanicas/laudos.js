// Minijogo do Liberato: entregar os laudos de colonoscopia em ordem CRESCENTE de prontuário.
// No roteiro: const erros = await c.laudos();   Errou a ordem = embaralha e começa de novo (conta 1 erro).
CONVO.minigame('laudos', (() => {
  let ui = null, L = null;          // L: { items (prontuários na ordem da tela), done (já entregues), errors }

  function render() {
    const el = ui.el;
    el.options.innerHTML = '';
    L.items.forEach((n, i) => {
      const d = document.createElement('div'); d.className = 'opt' + (L.done.includes(n) ? ' done' : '');
      const f = String(n).replace(/(\d{3})(\d{3})/, '$1.$2');
      d.innerHTML = `<b>${i + 1}.</b> Laudo de colonoscopia · Pront. ${f}${L.done.includes(n) ? ' ✔' : ''}`;
      d.onclick = () => pick(i);
      el.options.appendChild(d);
    });
  }
  function pick(i) {
    const n = L.items[i];
    if (L.finished || n === undefined || L.done.includes(n)) return;
    const next = Math.min(...L.items.filter(x => !L.done.includes(x)));
    if (n === next) {
      L.done.push(n); AUDIO.sfx('click');
      if (L.done.length === L.items.length) { L.finished = true; render(); ui.finish(L.errors, 500); return; }
    } else {
      L.errors++; AUDIO.sfx('bad');
      ui.el.text.textContent = U.pick(['Não. Crescente. Do menor pro maior. De novo.', 'Você pulou um. De novo. Do começo.', 'Isso é decrescente em algum universo? Não neste. De novo.']);
      L.done = []; U.shuffle(L.items);
    }
    render();
  }

  return {
    start(u) {
      ui = u;
      const nums = new Set();
      while (nums.size < 5) nums.add(100000 + Math.floor(Math.random() * 900000));
      L = { items: U.shuffle([...nums]), done: [], errors: 0, finished: false };
      render();
      return L;
    },
    pick,
  };
})());

// Ferramentas dos testes: servidor de arquivos, navegador e atalhos pra jogar sozinho.
// Os testes abrem o jogo no modo dev (index.html#dev=...), sem desenhar o 3D (noRender) e com o texto acelerado,
// então a lógica roda a 60 quadros por segundo mesmo num computador sem placa de vídeo.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- servidor estático (sem dependência) ----------
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };
function serve() {
  const server = http.createServer((req, res) => {
    const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0].split('#')[0]));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r({ url: `http://127.0.0.1:${server.address().port}/`, close: () => server.close() })));
}

// ---------- navegador ----------
function loadPlaywright() {
  try { return require('playwright'); } catch (e) { /* tenta a instalação global */ }
  return require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
}
async function launch() {
  const { chromium } = loadPlaywright();
  const args = ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'];
  try { return await chromium.launch({ args }); }
  catch (e) {                                                   // ambiente com o Chromium em outro lugar
    const exe = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
    return chromium.launch({ args, executablePath: exe });
  }
}

// ---------- o jogo, visto de fora ----------
// Acesso ao estado: window.__game (só existe no modo dev). Veja js/main.js, "modo de desenvolvimento".
class Game {
  constructor(page, base) { this.page = page; this.base = base; this.errors = []; }

  // abre o jogo num ponto: hash = 'x,z,yaw[,pPITCH][,estágio][,touch]'
  async open(hash, { render = false, textSpeed = 8 } = {}) {
    const page = this.page;
    page.on('pageerror', e => this.errors.push(e.message));
    await page.goto('about:blank');
    await page.goto(this.base + 'index.html#dev=' + hash);
    await page.waitForFunction(() => window.__game, null, { timeout: 15000 });
    await page.evaluate(([r, ts]) => { __game.G.noRender = !r; __game.G.textSpeed = ts; }, [render, textSpeed]);
    await sleep(150);
    return this;
  }
  eval(fn, arg) { return this.page.evaluate(fn, arg); }
  flag(name) { return this.eval(n => __game.G[n], name); }
  async until(fn, arg, { timeout = 10000, what = 'condição' } = {}) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) { if (await this.eval(fn, arg)) return; await sleep(50); }
    throw new Error('esperei demais por: ' + what);
  }
  async key(code) { await this.page.keyboard.press(code); await sleep(40); }
  async goTo(x, z, yaw, pitch = 0) {
    await this.eval(([x, z, yaw, pitch]) => { const P = __game.P; P.pos.x = x; P.pos.z = z; if (yaw != null) P.yaw = yaw; P.pitch = pitch; }, [x, z, yaw, pitch]);
    await sleep(120);
  }
  // estado da caixa de conversa
  convo() {
    return this.eval(() => ({
      active: CONVO.active, game: !!CONVO.minigameState, name: document.getElementById('dlg-name').textContent, text: document.getElementById('dlg-text').textContent,
      opts: [...document.querySelectorAll('#dlg-options .opt')].map(o => o.textContent).filter(t => !t.includes('▼')),
    }));
  }
  // avança a conversa até aparecer uma escolha (devolve as opções), um minijogo começar (devolve as opções dele, às vezes [])
  // ou ela acabar (devolve null). Guarda as falas em this.lines.
  async talk(max = 200) {
    this.lines = this.lines || [];
    for (let k = 0; k < max; k++) {
      const c = await this.convo();
      if (!c.active) return null;
      if (c.game || c.opts.length) return c.opts;
      const line = c.name + ': ' + c.text;
      if (c.text && this.lines[this.lines.length - 1] !== line) this.lines.push(line);
      await this.key('Space');
    }
    throw new Error('a conversa não andou');
  }
  // escolhe a opção que contém o texto (ou o número, 1 = primeira)
  async pick(which) {
    const c = await this.convo();
    const i = typeof which === 'number' ? which - 1 : c.opts.findIndex(o => o.includes(which));
    if (i < 0 || i >= c.opts.length) throw new Error(`opção "${which}" não existe: ${JSON.stringify(c.opts)}`);
    await this.key('Digit' + (i + 1));
    await sleep(60);
  }
  // conversa inteira: escolhe por uma lista de preferências (a primeira que existir), senão a opção 1. Nó: faz perfeito.
  async talkThrough(prefs = [], max = 60) {
    for (let k = 0; k < max; k++) {
      const opts = await this.talk();
      if (!opts) return;
      if (await this.eval(() => !!CONVO.minigameState)) { await this.knot(); continue; }
      const pref = prefs.find(p => opts.some(o => o.includes(p)));
      await this.pick(pref || 1);
    }
    throw new Error('conversa sem fim');
  }
  // minijogo do nó (teclado): digita a sequência certa
  async knot() {
    await this.talk();                                         // passa as falas até o nó começar
    await this.until(() => CONVO.minigameState && CONVO.minigameState.seq, null, { what: 'nó começar' });
    const st = await this.eval(() => ({ seq: CONVO.minigameState.seq, classic: !!CONVO.minigameState.classic }));
    const DRAG = { L: 'ArrowLeft', R: 'ArrowRight', U: 'ArrowUp', D: 'ArrowDown', UL: 'KeyQ', UR: 'KeyE', DL: 'KeyZ', DR: 'KeyC' };
    for (const s of st.seq) await this.key(st.classic ? s : DRAG[s]);
    await this.until(() => !CONVO.minigameState, null, { what: 'nó terminar' });
  }
  noErrors() { if (this.errors.length) throw new Error('erros na página: ' + this.errors.join(' | ')); }
}

function assert(ok, msg) { if (!ok) throw new Error(msg); }
function eq(a, b, msg) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg}: esperava ${JSON.stringify(b)}, veio ${JSON.stringify(a)}`); }

module.exports = { serve, launch, Game, assert, eq, sleep, ROOT };

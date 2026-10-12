// Roda os testes automáticos: node tests/run.js [filtro]
// Cada arquivo tests/*.test.js exporta uma lista de { name, run(game) }. Cada teste ganha uma página nova.
// Precisa do Playwright (npm install, ou instalado globalmente). Ver CLAUDE.md, "Testes".
const fs = require('fs');
const path = require('path');
const { serve, launch, Game } = require('./lib');

const TIMEOUT = 120000;

(async () => {
  const filter = process.argv[2] || '';
  const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js')).sort();
  const tests = files.flatMap(f => require(path.join(__dirname, f)).map(t => ({ ...t, file: f })))
    .filter(t => (t.file + ' ' + t.name).toLowerCase().includes(filter.toLowerCase()));
  const server = await serve();
  const browser = await launch();
  let failed = 0;
  const t0 = Date.now();
  for (const t of tests) {
    const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
    const game = new Game(page, server.url);
    const start = Date.now();
    try {
      await Promise.race([t.run(game), new Promise((_, rej) => setTimeout(() => rej(new Error('passou de ' + TIMEOUT / 1000 + ' s')), TIMEOUT))]);
      game.noErrors();
      console.log(`  ✔ ${t.file.replace('.test.js', '')} · ${t.name} (${((Date.now() - start) / 1000).toFixed(1)} s)`);
    } catch (e) {
      failed++;
      console.log(`  ✘ ${t.file.replace('.test.js', '')} · ${t.name}\n      ${e.message}`);
      if (game.lines && game.lines.length) console.log('      últimas falas: ' + game.lines.slice(-3).join(' / '));
      try { await page.screenshot({ path: path.join(__dirname, 'falhou-' + t.name.replace(/\W+/g, '_') + '.png') }); } catch (err) { /* sem print */ }
    }
    await page.close();
  }
  await browser.close(); server.close();
  console.log(`\n${tests.length - failed}/${tests.length} passaram em ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

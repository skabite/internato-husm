// SAVE: o progresso fica no navegador (localStorage), num objeto só.
//   - O motor guarda: versão, posição, saúde, javalis abatidos, javalis mortos (ids) e itens de cura pegos (ids).
//   - Cada capítulo escreve os seus campos em save(s) e lê em load(s) (ver js/motor/game.js).
//   - Mudou o formato? Suba VERSION e ensine migrate() a converter o anterior. Assim nenhum save antigo quebra.
const SAVE = (() => {
  const KEY = 'internato-husm-save', OLD_KEY = 'internato-husm-save-v1', VERSION = 2;

  // v1 → v2: nomes novos dos campos, javalis e itens por id em vez de posição na lista
  const RENAMED_V1 = { met: 'monteiroDone', duduDone: 'liberatoDone', prof3Done: 'javaliDone', clovisDone: 'deBarrosDone',
    achievement: 'elogioDeBarros', treino: 'knotPracticed' };
  function migrate(s) {
    if (!s.v) {
      for (const [a, b] of Object.entries(RENAMED_V1)) if (a in s) { s[b] = s[a]; delete s[a]; }
      s.dead = (s.dead || []).map(i => 'L1:' + i);                       // os javalis do v1 eram todos da Ala C
      const legacy = ['L1', 'L2', 'W'].flatMap(a => BUILD.pickups.filter(p => p.id.startsWith(a + ':')));   // ordem antiga
      s.pickups = (s.cafes || []).map(i => legacy[i] && legacy[i].id).filter(Boolean);
      delete s.cafes;
      s.v = 2;
    }
    return s;
  }

  function read() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || localStorage.getItem(OLD_KEY));
      return s ? migrate(s) : null;
    } catch (e) { return null; }
  }
  function clear() { try { localStorage.removeItem(KEY); localStorage.removeItem(OLD_KEY); } catch (e) { /* sem storage */ } }

  // devolve true se salvou
  function write() {
    const G = GAME.G, P = GAME.P;
    if (G.ended || G.state !== 'play' || GAME.any('blockSave')) return false;
    const s = {
      v: VERSION, date: Date.now(),
      pos: [P.pos.x, P.pos.z], yaw: P.yaw,
      hp: COMBAT.P.hp, maxHp: COMBAT.P.maxHp, kills: G.kills,
      dead: COMBAT.boars.filter(b => b.id && b.state === 'dead').map(b => b.id),
      pickups: BUILD.pickups.filter(p => p.taken).map(p => p.id),
    };
    GAME.each('save', s);
    try { localStorage.setItem(KEY, JSON.stringify(s)); localStorage.removeItem(OLD_KEY); } catch (e) { return false; }
    return true;
  }

  // aplica um save (ou um estágio do modo dev, que é um save parcial)
  function apply(s) {
    GAME.each('load', s);
    COMBAT.P.maxHp = s.maxHp || 100; COMBAT.P.hp = s.hp || COMBAT.P.maxHp;
    GAME.G.kills = s.kills || 0;
    for (const id of s.dead || []) { const i = COMBAT.boars.findIndex(b => b.id === id); if (i >= 0) COMBAT.killSilently(i); }
    for (const id of s.pickups || []) { const p = BUILD.pickups.find(q => q.id === id); if (p) { p.taken = true; p.cup.visible = false; } }
    if (s.pos) { GAME.P.pos.set(s.pos[0], 0, s.pos[1]); GAME.P.yaw = s.yaw || 0; GAME.P.pitch = 0; }
    GAME.refreshObjective();
  }

  const label = s => GAME.ask('saveLabel', s) || 'no começo';
  return { read, write, apply, clear, label, migrate, VERSION };
})();

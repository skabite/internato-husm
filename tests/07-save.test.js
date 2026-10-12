// Save: continuar um jogo salvo, inclusive saves antigos (formato v1, de antes da refatoração).
const { assert, eq, sleep } = require('./lib');

// save no formato v1 (chave 'internato-husm-save-v1'): Capítulo 3, depois do Liberato, com carabina e reflexos
const V1 = {
  pos: [-1.7, -56], yaw: 0, met: true, scare: true, duduDone: true, hasGun: true, following: true, prof3Done: true, treino: true,
  clovisDone: true, achievement: true, marmita: true, carabina: true, maaa: true, adc: 'ok',
  bossDone: true, plantaoDone: false, muriel: 1, rxPerfect: false, hp: 90, maxHp: 125, kills: 9,
  dead: [0, 1, 2], cafes: [0, 6], date: 1760000000000,
};

async function continueFrom(g, save, key = 'internato-husm-save-v1') {
  await g.page.goto(g.base + 'index.html');
  await g.page.evaluate(([k, s]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(s)); }, [key, save]);
  await g.page.reload();
  await g.page.click('#boot');
  await sleep(300);
  const info = await g.page.evaluate(() => document.getElementById('save-info').textContent);
  await g.page.evaluate(() => document.getElementById('btn-continue').click());
  await sleep(500);
  return info;
}

module.exports = [
  {
    name: 'continuar um save antigo (v1) do Capítulo 3',
    async run(g) {
      g.page.on('pageerror', e => g.errors.push(e.message));
      const info = await continueFrom(g, V1);
      assert(info.includes('Leito 12'), 'rótulo do save: ' + info);
      const st = await g.page.evaluate(() => ({ has: COMBAT.P.has, weapon: COMBAT.P.weapon, hud: COMBAT.P.hud, dodge: COMBAT.P.dodge, hp: COMBAT.P.hp, maxHp: COMBAT.P.maxHp,
        stats: getComputedStyle(document.getElementById('stats')).display, obj: document.getElementById('objective').textContent,
        dead: COMBAT.boars.filter(b => b.state === 'dead').length }));
      eq(st.has, { scalpel: false, revolver: false, carabina: false }, 'desarmado');
      eq([st.weapon, st.hud, st.dodge, st.hp, st.maxHp, st.stats], [null, true, 0.2, 90, 125, 'block'], 'estado do jogador');
      assert(st.obj.includes('LEITO 12'), 'objetivo: ' + st.obj);
      assert(st.dead >= 3, 'javalis mortos do save');
    },
  },
  {
    name: 'continuar um save antigo (v1) do Capítulo 1 com cafés e javalis',
    async run(g) {
      g.page.on('pageerror', e => g.errors.push(e.message));
      const s = { pos: [0, -63], yaw: 0, met: true, scare: false, duduDone: true, hasGun: true, following: false, hp: 50, maxHp: 100, kills: 3, dead: [0, 1, 2], cafes: [0, 6], date: 1 };
      const info = await continueFrom(g, s);
      assert(info.includes('revólver'), 'rótulo: ' + info);
      const st = await g.page.evaluate(() => ({ dead: COMBAT.boars.map(b => b.state === 'dead'), weapon: COMBAT.P.weapon, obj: document.getElementById('objective').textContent }));
      eq(st.dead.slice(0, 4), [true, true, true, false], 'javalis 0-2 mortos');
      eq(st.weapon, 'revolver', 'arma na mão');
      // cafés: o v1 guardava a posição numa lista [cafés da fase 1, cafés da fase 2, itens do saguão]; agora são ids
      const taken = await g.page.evaluate(() => BUILD.pickups.filter(p => p.taken).map(p => p.id));
      eq(taken.sort(), ['L1:0', 'L2:1'], 'cafés pegos no save antigo');
      assert(st.obj.includes('javalis restantes'), 'objetivo: ' + st.obj);
    },
  },
  {
    name: 'salvar e continuar devolve o mesmo progresso',
    async run(g) {
      await g.open('3,-33,-1.57,leito');
      await g.eval(() => { __game.G.adc = 'ok'; COMBAT.P.dodge = 0.2; __game.G.maaa = true; });
      await g.goTo(21, -66);
      await sleep(300);
      const saved = await g.eval(() => { __game.G.saveT = 0.01; return true; });
      await sleep(400);
      const raw = await g.eval(() => localStorage.getItem('internato-husm-save') || localStorage.getItem('internato-husm-save-v1'));
      assert(raw, 'não salvou');
      const s = JSON.parse(raw);
      await continueFrom(g, s, localStorage_key(raw, s));
      const st = await g.page.evaluate(() => ({ has: COMBAT.P.has, dodge: COMBAT.P.dodge, obj: document.getElementById('objective').textContent }));
      eq(st.has, { scalpel: false, revolver: false, carabina: false }, 'desarmado depois de continuar');
      eq(st.dodge, 0.2, 'reflexos');
      assert(st.obj.includes('LEITO 12'), 'objetivo: ' + st.obj);
    },
  },
];

function localStorage_key(raw, s) { return s.v ? 'internato-husm-save' : 'internato-husm-save-v1'; }

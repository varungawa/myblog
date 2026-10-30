// Engine checks for the Cargothustra game. Run: node tests/game.test.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const G = require('../stories/cargothustra/game-engine.js');
const D = G.data;
let fails = 0;
const ok = (n, c, d = '') => { console.log((c ? 'PASS ' : 'FAIL ') + n + (d ? ' — ' + d : '')); if (!c) fails++; };
const near = (a, b) => Math.abs(a - b) < 1e-9;

// data integrity
ok('10 levels S01..S10', D.levels.length === 10 && D.levels.every((l, i) => l.n === i + 1));
ok('13 meters, all with a start value', D.meters.length === 13 && D.meters.every(m => typeof D.start[m.id] === 'number'));
ok('every level has 3 calls; level tests reference real meters', D.levels.every(l => l.options.length === 3 && l.tests.every(t => D.start[t] !== undefined)));
ok('every fx key is a real meter', D.levels.every(l => l.options.every(o => Object.keys(o.fx).every(k => D.start[k] !== undefined))) && Object.values(D.approaches).every(a => Object.keys(a.fx).every(k => D.start[k] !== undefined)));
ok('regime rows sum to 1', Object.values(D.regimeMatrix).every(r => near(Object.values(r).reduce((s, x) => s + x, 0), 1)));
ok('weather rows sum to 1', Object.values(D.weatherMatrix).every(r => near(Object.values(r).reduce((s, x) => s + x, 0), 1)));

// tilted rows stay valid
for (const reg of Object.keys(D.regimes)) for (const w of [-0.2, -0.08, 0, 0.1, 0.2]) {
  const row = G.regimeRow(reg, { war: w, market: 0 });
  if (!near(Object.values(row).reduce((s, x) => s + x, 0), 1) || Object.values(row).some(x => x < 0)) { ok('tilted row valid', false, reg + ' ' + w); }
}
ok('war tilt raises war probability', (() => { const a = G.regimeRow('HP', { war: 0, market: 0 }), b = G.regimeRow('HP', { war: 0.1, market: 0 }); return b.HW + b.LW > a.HW + a.LW; })());

// preview probabilities
let sane = true;
for (let seed = 1; seed <= 40; seed++) {
  let st = G.newGame(seed);
  for (let t = 0; t < 12 && !st.ended; t++) {
    const lv = G.level(st);
    for (const a of Object.keys(D.approaches)) for (const o of lv.options) {
      const p = G.preview(st, a, o.id);
      if (!(p.up >= 0 && p.down >= 0 && p.stay >= -1e-9 && near(p.up + p.stay + p.down, 1))) sane = false;
      if (st.pos === 1 && p.down !== 0) sane = false;
    }
    st = G.takeTurn(st, 'saam', lv.options[0].id);
  }
}
ok('up/stay/down are valid probabilities that sum to 1', sane);

// determinism and purity
const a = G.newGame(42), b = G.newGame(42);
const run = s => { let x = s; for (let i = 0; i < 6 && !x.ended; i++) x = G.takeTurn(x, 'bhed', G.level(x).options[1].id); return JSON.stringify(x); };
ok('same seed and same choices give the same walk', run(a) === run(b));
const before = JSON.stringify(a); G.takeTurn(a, 'saam', G.level(a).options[0].id);
ok('takeTurn does not mutate its input', JSON.stringify(a) === before);
ok('different seeds diverge', run(G.newGame(1)) !== run(G.newGame(2)));

// game over states
const doomed = G.newGame(3); doomed.meters.c13 = 3;
ok('a meter at zero ends the walk with that collapse', (() => { const e = G.takeTurn(doomed, 'dand', G.level(doomed).options[0].id); return e.ended && e.ended.kind === 'fail'; })());
const deal = G.newGame(4); deal.pos = 9;
ok('accepting Gora’s deal ends with the deal', G.takeTurn(deal, 'saam', 'accept').ended.id === 'deal');
const fin = G.newGame(5); fin.pos = 10; fin.meters = Object.fromEntries(Object.keys(D.start).map(k => [k, 80]));
ok('a clean board lets Shiva hold the poison: Shakti rises', G.takeTurn(fin, 'saam', 'shiva').ended.id === 'shakti');
fin.meters.c13 = 20;
ok('a dirty board gives a darker ending', G.takeTurn(fin, 'saam', 'shiva').ended.id === 'blessed');
ok('passing the poison on is hollow', G.takeTurn(fin, 'saam', 'pass').ended.id === 'hollow');
const long = G.newGame(6); long.turn = D.maxTurns - 1; long.meters = Object.fromEntries(Object.keys(D.start).map(k => [k, 95]));
ok('running out of turns ends the long walk', (() => { const e = G.takeTurn(long, 'saam', G.level(long).options[1].id); return !!e.ended; })());

// balance: the walk should be hard but winnable, and thought should beat luck
const N = 2000, s0 = G.newGame(7);
const rnd = G.simulate(s0, N, 'random'), spd = G.simulate(s0, N, 'speed'), safe = G.simulate(s0, N, 'safe');
const pct = (r, k) => ((r.groups[k] / r.n) * 100).toFixed(1);
console.log(`random  win ${pct(rnd, 'win')}%  mixed ${pct(rnd, 'mixed')}%  fail ${pct(rnd, 'fail')}%  avg turns ${rnd.turns.toFixed(1)}`);
console.log(`speed   win ${pct(spd, 'win')}%  mixed ${pct(spd, 'mixed')}%  fail ${pct(spd, 'fail')}%  avg turns ${spd.turns.toFixed(1)}`);
console.log(`safe    win ${pct(safe, 'win')}%  mixed ${pct(safe, 'mixed')}%  fail ${pct(safe, 'fail')}%  avg turns ${safe.turns.toFixed(1)}`);
ok('random play wins sometimes but not usually (5-45%)', rnd.groups.win / N >= 0.05 && rnd.groups.win / N <= 0.45);
ok('careful play beats random play', safe.groups.win > rnd.groups.win);
ok('chasing speed carries more collapse risk than careful play', spd.groups.fail > safe.groups.fail);
ok('no policy is a guaranteed win (under 90%)', safe.groups.win / N < 0.9);
ok('every walk ends', [rnd, spd, safe].every(r => Object.values(r.endings).reduce((s, x) => s + x, 0) === N));

console.log(fails ? `\n${fails} FAILED` : '\nall engine checks passed');
process.exit(fails ? 1 : 0);

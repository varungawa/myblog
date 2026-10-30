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

// cards and ports
ok('every suit card key is a real level.option and suit', Object.entries(D.suitCards).every(([k, cs]) => { const [n, o] = k.split('.'); const lv = D.levels[n - 1]; return lv && lv.options.some(x => x.id === o) && cs.every(c => D.suits.some(s => s.id === c.suit)); }));
ok('every grant is a real call and a real one-time card', Object.entries(D.grants).every(([k, id]) => { const [n, o] = k.split('.'); return D.levels[n - 1].options.some(x => x.id === o) && D.oneTime[id]; }));
ok('every level has two known ports', D.levels.every(l => D.levelPorts[l.n].length === 2 && D.levelPorts[l.n].every(p => D.ports[p])));
ok('chapters 1..13 each map to exactly one level', (() => { const all = Object.values(D.levelChapters).flat().sort((a, b) => a - b); return all.length === 13 && all.every((c, i) => c === i + 1); })());
ok('one-time card fx only touch real meters', Object.values(D.oneTime).every(c => Object.keys(c.fx).every(k => D.start[k] !== undefined)));
{
  let st = G.newGame(11);
  st = G.takeTurn(st, 'saam', 'credit');
  ok('a call fills its suit slot in the bond hand', st.suits.commerce && st.suits.commerce.name === 'Letter of credit terms');
  ok('a call can earn a one-time card', st.hand.includes('credit'));
  const withCard = G.preview(st, 'saam', G.level(st).options[0].id, 'credit'), without = G.preview(st, 'saam', G.level(st).options[0].id, null);
  ok('playing a card changes the board and chances', withCard.meters.c8 > without.meters.c8 && withCard.up > without.up);
  const st2 = G.takeTurn(st, 'saam', G.level(st).options[0].id, 'credit');
  ok('a played card is spent and cannot be played twice', !st2.hand.includes('credit') && st2.spent.includes('credit'));
  ok('a card you do not hold is ignored', JSON.stringify(G.takeTurn(st2, 'saam', G.level(st2).options[0].id, 'credit').spent) === JSON.stringify(st2.spent));
  const bc = G.bondCheck(st, st.suits);
  ok('bond check is finite', ['cover', 'heat', 'palm', 'risk', 'margin'].every(k => Number.isFinite(bc[k])));
}
{
  const jump = G.startAt(6, 9);
  ok('startAt puts the walk at that level with earlier suits filled', jump.pos === 6 && jump.turn === 5 && D.suits.filter(s => s.level < 6).every(s => jump.suits[s.id]));
  ok('Morgiana is dealt face down from S06', jump.hand.includes('morgiana') && jump.morgiana === 'down');
  ok('a level before S06 has no Morgiana yet', !G.startAt(3, 9).hand.includes('morgiana'));
  const a = G.takeTurn(jump, 'saam', G.level(jump).options[0].id, 'morgiana');
  ok('auditing Morgiana keeps the card and reveals it', a.morgiana === 'audited' && a.hand.includes('morgiana'));
  const b = G.takeTurn(a, 'saam', G.level(a).options[0].id, 'morgiana');
  ok('warning Morgiana spends the card', b.morgiana === 'told' && !b.hand.includes('morgiana') && b.fates.morgiana === 'told');
  const s8 = (m) => { const s = G.startAt(8, 9); s.morgiana = m; if (m === 'told') s.hand = s.hand.filter(x => x !== 'morgiana'); return s; };
  const downSend = G.preview(s8('down'), 'saam', 'send'), toldSend = G.preview(s8('told'), 'saam', 'send'), downHold = G.preview(s8('down'), 'saam', 'hold');
  ok('face down at S08, sending the hull flips the card', downSend.notes.length === 1 && downSend.meters.c10 < toldSend.meters.c10);
  ok('face down at S08, holding the hull back does not', downHold.notes.length === 0);
  ok('having warned her halves the damage and hides the carrier', toldSend.notes.length === 1 && toldSend.meters.c10 > downSend.meters.c10 && toldSend.meters.c6 > downSend.meters.c6);
  const flipped = G.takeTurn(s8('down'), 'saam', 'send');
  ok('the flip is recorded for the epilogue', flipped.fates.morgiana === 'flipped' && !flipped.hand.includes('morgiana'));
}

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

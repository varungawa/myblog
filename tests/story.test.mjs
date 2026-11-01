// Checks for the interactive story. Run: node tests/story.test.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const parts = [1, 2, 3].map(n => require(`../stories/cargothustra/story-data-${n}.js`));
const S = require('../stories/cargothustra/story-engine.js').create(parts);
const N = S.nodes, M = S.meta;
let fails = 0;
const ok = (n, c, d = '') => { console.log((c ? 'PASS ' : 'FAIL ') + n + (d ? ' — ' + d : '')); if (!c) fails++; };

const ids = Object.keys(N);
const targets = n => [].concat(n.next || [], (n.choices || []).map(c => c.to), (n.route || []).map(r => r.to), (n.chance || []).map(c => c.to));

// graph integrity
const missing = []; ids.forEach(id => targets(N[id]).forEach(t => { if (!N[t]) missing.push(id + ' -> ' + t); }));
ok('every link points at a real node', !missing.length, missing.join(', '));
const dead = ids.filter(id => { const n = N[id]; const hasExit = n.next || (n.choices && n.choices.length) || n.route || n.chance; return n.end ? hasExit : !hasExit; });
ok('every node is either an ending or has a way on', !dead.length, dead.join(', '));
const seen = new Set([M.start]), q = [M.start];
while (q.length) { const id = q.shift(); targets(N[id]).forEach(t => { if (!seen.has(t)) { seen.add(t); q.push(t); } }); }
ok('every node is reachable from the start', seen.size === ids.length, ids.filter(i => !seen.has(i)).join(', '));
const ends = S.endings();
ok('at least 14 distinct endings', new Set(ends.map(e => e.id)).size >= 14 && new Set(ends.map(e => e.title)).size === ends.length, ends.length + ' endings');
ok('chance nodes have at least two outcomes with positive weight', ids.every(id => !N[id].chance || (N[id].chance.length >= 2 && N[id].chance.every(c => c.w > 0))));
ok('decision nodes offer 2 to 5 choices', ids.every(id => !N[id].choices || (N[id].choices.length >= 2 && N[id].choices.length <= 5)));
ok('every route ends in a fallback with no condition', ids.every(id => !N[id].route || !N[id].route[N[id].route.length - 1].if));

// flags: every condition refers to something that can be set
const setFlags = new Set(), condFlags = new Set(), itemsGiven = new Set(), itemsUsed = new Set();
const collectSet = fx => { if (!fx) return; (fx.set || []).forEach(f => setFlags.add(f)); (fx.give || []).forEach(i => itemsGiven.add(i)); };
ids.forEach(id => { const n = N[id]; collectSet(n.on); (n.choices || []).forEach(collectSet); (n.route || []).forEach(collectSet); });
const collectCond = c => { if (c === undefined) return; [].concat(c).forEach(s => { s = String(s).replace(/^!/, ''); if (s.startsWith('item:')) itemsUsed.add(s.slice(5)); else if (!['war', 'peace', 'high', 'low'].includes(s) && !/^\w+(>=|<=|>|<)\d+$/.test(s)) condFlags.add(s); }); };
ids.forEach(id => { const n = N[id]; (n.text || []).forEach(p => typeof p !== 'string' && collectCond(p.if)); (n.choices || []).forEach(c => collectCond(c.if)); (n.route || []).forEach(r => collectCond(r.if)); (n.chance || []).forEach(c => (c.mods || []).forEach(m => collectCond(m.if))); });
(M.epilogue || []).forEach(e => collectCond(e.if)); Object.values(M.jumpFlags).forEach(collectSet);
const unsettable = [...condFlags].filter(f => !setFlags.has(f));
ok('every flag that is tested can be set somewhere', !unsettable.length, unsettable.join(', '));
ok('every item that is tested or given has a name', [...itemsUsed, ...itemsGiven].every(i => M.items[i]), [...itemsUsed, ...itemsGiven].filter(i => !M.items[i]).join(', '));
ok('every item that is tested can be given', [...itemsUsed].every(i => itemsGiven.has(i)));

// the reader never sees the machinery
const allText = ids.flatMap(id => (N[id].text || []).map(p => typeof p === 'string' ? p : p.t));
ok('no level numbers, turns, seeds or meters in the prose', !allText.some(t => /\bS\d\d\b|\bturn \d|\bseed\b|\bmeter\b|\bscore\b/i.test(t)));
const words = allText.join(' ').split(/\s+/).length;
ok('a substantial story', words > 7000, words + ' words of prose across ' + ids.length + ' nodes');

// engine behaviour
const a = S.start(7), before = JSON.stringify(a);
const b = S.choose(a, 0);
ok('choose returns a new state and leaves the old one alone', JSON.stringify(a) === before && b !== a);
const play = (seed, picker) => { let st = S.start(seed), steps = 0; while (!st.ended && steps++ < 400) { const v = S.view(st); if (!v.choices.length) throw new Error('stuck at ' + st.node); st = S.choose(st, picker(v, steps)); } return st; };
const replay = seed => { let st = S.start(seed), k = 0; while (!st.ended && k++ < 400) st = S.choose(st, 0); return JSON.stringify([st.ended && st.ended.id, st.flags, st.items, st.world]); };
ok('same seed and same choices give the same story', replay(5) === replay(5));
ok('different seeds can differ', new Set([1, 2, 3, 4, 5, 6, 7, 8].map(replay)).size > 1);
ok('every chapter can be jumped to', Object.keys(M.chapters).every(c => S.jump(+c, 3).passages.length > 0));

// random readers: every walk ends, every ending can be reached, every passage can be seen
const RUNS = 30000, reached = {}, visited = new Set(), stepsStat = []; let maxSteps = 0, stuck = 0;
let rs = 99991; const rnd = () => { rs = (rs * 1664525 + 1013904223) >>> 0; return rs / 4294967296; };
for (let i = 0; i < RUNS; i++) {
  let st;
  try { st = play(i + 1, v => Math.floor(rnd() * v.choices.length)); } catch (e) { stuck++; continue; }
  reached[st.ended.id] = (reached[st.ended.id] || 0) + 1; st.passages.forEach(p => p.id && visited.add(p.id)); maxSteps = Math.max(maxSteps, st.steps); stepsStat.push(st.steps);
}
ok('no reader ever gets stuck', stuck === 0);
ok('every walk ends', Object.values(reached).reduce((s, x) => s + x, 0) === RUNS - stuck, 'longest walk ' + maxSteps + ' passages');
const unreached = ends.filter(e => !reached[e.id]).map(e => e.title);
ok('every ending is reachable by a random reader', !unreached.length, unreached.join(', '));
const unseen = ids.filter(id => (N[id].text || []).length && !visited.has(id));
ok('every passage is seen by some random reader', !unseen.length, unseen.join(', '));
const dist = ends.map(e => [e.title, ((reached[e.id] || 0) / RUNS * 100).toFixed(1) + '%']).sort((x, y) => parseFloat(y[1]) - parseFloat(x[1]));
console.log('endings by chance reader:'); dist.forEach(d => console.log('  ' + d[1].padStart(6) + '  ' + d[0]));
const goodShare = (reached.shakti || 0) + (reached.gora_follows || 0);
ok('the best endings are rare for a random reader (under 25%)', goodShare / RUNS < 0.25, (goodShare / RUNS * 100).toFixed(1) + '%');
ok('no single ending swallows more than half of the random readers', Math.max(...Object.values(reached)) / RUNS < 0.5);

console.log(fails ? `\n${fails} FAILED` : '\nall story checks passed');
process.exit(fails ? 1 : 0);

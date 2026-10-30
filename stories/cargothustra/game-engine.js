/* Thus Spake Cargothustra: the walk. Game engine (no DOM, runs in the browser and in node).
 *
 * Three Markov chains move every turn:
 *   position  S01..S10, a birth-death chain: up / stay / down, with probabilities computed from the 13C analytics
 *   regime    market high|low x war|peace, a 4-state chain; the player's approach tilts its rows
 *   weather   calm | storm, a 2-state chain
 * Cards: the player's calls fill a bond hand (one card per suit: Commerce, Commodity, Consignor, Consignee,
 * Carriage, Carrier). Its cover and heat are weighed against the port of loading and the port of discharge
 * (scrutiny, palm, heat), and the margin nudges the chances of moving forward. One-time cards can be played once,
 * and Morgiana's face-down card can be audited, warned, or left to flip at S08.
 * Everything is seeded, so the same seed and the same choices give the same walk. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./game-data.js'));
  else root.CargoGame = factory(root.CargoGameData);
})(typeof self !== 'undefined' ? self : this, function (D) {
  var clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };
  var LAST = D.levels.length;
  var MORG = 'morgiana';

  function rand(st) { // mulberry32, state kept on the game state
    st.rng = (st.rng + 0x6D2B79F5) >>> 0;
    var t = st.rng;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function sample(st, row) {
    var u = rand(st), acc = 0, keys = Object.keys(row);
    for (var i = 0; i < keys.length; i++) { acc += row[keys[i]]; if (u < acc) return keys[i]; }
    return keys[keys.length - 1];
  }

  function normalise(row) {
    var s = 0, k, out = {};
    for (k in row) s += row[k];
    for (k in row) out[k] = row[k] / s;
    return out;
  }

  function applyFx(meters, fx, scale) {
    for (var k in fx) meters[k] = clamp(meters[k] + fx[k] * (scale || 1), 0, 100);
  }
  function revert(meters) {
    for (var k in meters) meters[k] = clamp(meters[k] + D.reversion * (D.start[k] - meters[k]), 0, 100);
  }

  function newGame(seed) {
    seed = (seed >>> 0) || 1;
    var st = { seed: seed, rng: seed, pos: 1, turn: 0, meters: clone(D.start), fates: {}, log: [], ended: null, last: null, regime: 'HP', weather: 'calm', suits: {}, hand: [], spent: [], morgiana: null };
    D.suits.forEach(function (s) { st.suits[s.id] = null; });
    st.regime = sample(st, { HP: 0.35, LP: 0.35, HW: 0.15, LW: 0.15 });
    return st;
  }

  // Start part-way along the walk (used by the outline's "play this level" buttons). The hand is filled with plain cards.
  function startAt(n, seed) {
    var st = newGame(seed);
    n = clamp(n | 0, 1, LAST);
    st.pos = n; st.turn = n - 1;
    D.suits.forEach(function (s) { if (s.level < n) st.suits[s.id] = clone(D.defaultCards[s.id]); });
    if (n >= D.morgiana.dealtAt) { st.morgiana = 'down'; st.hand.push(MORG); }
    return st;
  }

  function level(st) { return D.levels[st.pos - 1]; }
  function findOption(lv, id) { return lv.options.filter(function (o) { return o.id === id; })[0]; }

  // The tilted next-regime row. tilt.war > 0 favours war columns, tilt.market > 0 favours the high-market columns.
  function regimeRow(regime, tilt) {
    var row = {}, base = D.regimeMatrix[regime];
    Object.keys(base).forEach(function (t) {
      var w = base[t], r = D.regimes[t];
      w *= Math.max(0.05, 1 + (r.war ? 4 : -4) * tilt.war);
      w *= Math.max(0.05, 1 + (r.market === 'high' ? 4 : -4) * tilt.market);
      row[t] = w;
    });
    return normalise(row);
  }

  function weatherRow(weather, n) {
    var row = clone(D.weatherMatrix[weather]);
    var boost = D.stormBoostAtLevel[n];
    if (boost && weather === 'calm') { row.storm = boost; row.calm = 1 - boost; }
    return row;
  }

  function tiltFor() {
    var t = { war: 0, market: 0 };
    for (var i = 0; i < arguments.length; i++) { var o = (arguments[i] && arguments[i].tilt) || {}; t.war += o.war || 0; t.market += o.market || 0; }
    return t;
  }

  // ---- cards ----
  function suitsAfter(st, lv, op) {
    var s = clone(st.suits);
    (D.suitCards[lv.n + '.' + op.id] || []).forEach(function (c) { s[c.suit] = { name: c.name, cover: c.cover, heat: c.heat }; });
    return s;
  }

  // Weigh the hand against the two ports of this level, as in the bond sketch: cover + palm - risk.
  function bondCheck(st, suits) {
    var pr = D.levelPorts[st.pos] || [], a = D.ports[pr[0]], b = D.ports[pr[1]];
    var cover = 0, heat = 0;
    D.suits.forEach(function (s) { var c = suits[s.id]; if (c) { cover += c.cover; heat += c.heat; } });
    if (!a || !b) return { from: pr[0], to: pr[1], cover: cover, heat: heat, palm: 0, scrutiny: 0, geo: 0, risk: 0, margin: 0 };
    var scrutiny = (a.scrutiny + b.scrutiny) / 2, palm = (a.palm + b.palm) / 2, geo = (a.heat + b.heat) / 2;
    var war = D.regimes[st.regime].war ? 0.3 : 0;
    var risk = heat * scrutiny * (1 + geo / 10 + war) / 2;
    return { from: pr[0], to: pr[1], cover: cover, heat: heat, palm: palm, scrutiny: scrutiny, geo: geo, risk: risk, margin: cover + palm - risk };
  }

  // What playing a card in hand does. Morgiana's card has two stages.
  function cardEffect(st, id) {
    if (st.hand.indexOf(id) < 0) return null;
    if (id === MORG) {
      var m = D.morgiana;
      return st.morgiana === 'down'
        ? { id: id, name: m.down.name, stage: 'audit', fx: m.audit.fx, up: m.audit.up, tilt: m.audit.tilt, label: m.audit.label, reveal: m.audit.reveal }
        : { id: id, name: m.audited.name, stage: 'tell', fx: m.tell.fx, up: m.tell.up, tilt: m.tell.tilt, label: m.tell.label, reveal: m.tell.reveal };
    }
    var c = D.oneTime[id];
    return { id: id, name: c.name, stage: 'play', fx: c.fx, up: c.up, tilt: c.tilt, label: 'Play it', reveal: c.text };
  }

  function handView(st) {
    return st.hand.map(function (id) {
      var e = cardEffect(st, id);
      if (id === MORG) {
        var down = st.morgiana === 'down';
        return { id: id, name: e.name, suit: 'Client', text: down ? D.morgiana.down.text : D.morgiana.audited.text, faceDown: down, label: e.label, fx: e.fx, up: e.up };
      }
      var c = D.oneTime[id];
      return { id: id, name: c.name, suit: c.suit, text: c.text, faceDown: false, label: e.label, fx: c.fx, up: c.up };
    });
  }

  // Morgiana at S08: face down and you send the hull -> it flips; warned -> the hull is half as exposed.
  function optionAdjust(st, lv, op) {
    var fx = clone(op.fx), notes = [], flip = false;
    if (lv.n === 8 && D.morgiana.sendOptions.indexOf(op.id) >= 0) {
      if (st.morgiana === 'told') {
        ['c10', 'c6'].forEach(function (k) { if (fx[k] < 0) fx[k] = fx[k] * 0.5; });
        fx.c12 = 0;
        notes.push('You warned Morgiana: the hull is half as exposed, and the drone carrier stays hidden.');
      } else if (st.morgiana === 'down') {
        flip = true;
        Object.keys(D.morgiana.flip.fx).forEach(function (k) { fx[k] = (fx[k] || 0) + D.morgiana.flip.fx[k]; });
        notes.push(D.morgiana.flip.text);
      }
    }
    return { fx: fx, notes: notes, flip: flip };
  }

  // What this approach, this call and (optionally) this card do to the board, and the exact up/stay/down probabilities.
  function preview(st, approachId, optionId, cardId) {
    var lv = level(st), ap = D.approaches[approachId], op = findOption(lv, optionId);
    var adj = optionAdjust(st, lv, op), ce = cardId ? cardEffect(st, cardId) : null;
    var m = clone(st.meters);
    applyFx(m, ap.fx); applyFx(m, adj.fx);
    if (ce) applyFx(m, ce.fx);
    var r = 0.5;
    if (lv.tests.length) r = lv.tests.reduce(function (s, id) { return s + m[id]; }, 0) / lv.tests.length / 100;
    var reg = D.regimes[st.regime], wx = D.weather[st.weather];
    var sa = suitsAfter(st, lv, op), bc = bondCheck(st, sa);
    var up = 0.40 + 0.9 * (r - 0.5) + ap.up + op.up + (ce ? ce.up : 0) + clamp(0.01 * bc.margin, -0.08, 0.08) +
      (reg.war ? -0.08 : 0) + (reg.market === 'high' ? 0.03 : -0.03) + wx.up;
    var down = 0.20 - 0.5 * (r - 0.5) + (reg.war ? 0.08 : 0) + wx.down;
    up = clamp(up, 0.05, 0.80);
    down = st.pos === 1 ? 0 : clamp(down, 0.04, 0.45);
    if (up + down > 0.95) { var k = 0.95 / (up + down); up *= k; down *= k; }
    return { up: up, stay: 1 - up - down, down: down, meters: m, tilt: tiltFor(ap, op, ce), readiness: r, bond: bc, suits: sa, notes: adj.notes, card: ce };
  }

  function derived(m) {
    var avg = function (ids) { return ids.reduce(function (s, id) { return s + m[id]; }, 0) / ids.length; };
    return {
      trust: Math.round(avg(['c3', 'c10', 'c13'])),
      risk: Math.round(100 - avg(['c9', 'c12', 'c7', 'c6'])),
      liquidity: Math.round(avg(['c1', 'c3', 'c4', 'c11'])),
      insurance: Math.round(avg(['c8', 'c10', 'c11'])),
      fraud: Math.round(100 - avg(['c13', 'c2', 'c10']))
    };
  }

  function epilogue(st) {
    var f = st.fates, out = [];
    if (f.vee && D.vee[f.vee]) out.push(['Vee', D.vee[f.vee]]);
    if (f.consignor && D.consignor[f.consignor]) out.push(['The consignor', D.consignor[f.consignor]]);
    if (f.consignee && D.consignee[f.consignee]) out.push(['The consignee', D.consignee[f.consignee]]);
    var mg = f.morgiana || st.morgiana; // still face down or audited if the walk ended before S08
    if (mg && D.morgiana.epilogue[mg]) out.push(['Morgiana', D.morgiana.epilogue[mg]]);
    return out;
  }

  function finish(st, id, kind, title, text) {
    st.ended = { id: id, kind: kind, title: title, text: text, pos: st.pos, turn: st.turn, epilogue: epilogue(st), derived: derived(st.meters) };
    st.log.push('End: ' + title + '.');
    return st;
  }

  function collapseCheck(st) {
    for (var i = 0; i < D.meters.length; i++) {
      var mt = D.meters[i];
      if (st.meters[mt.id] <= 0) { finish(st, 'collapse-' + mt.id, 'fail', mt.collapse[0], mt.collapse[1]); return true; }
    }
    return false;
  }

  function resolveFinal(st, opt) {
    var d = derived(st.meters), p = opt.fate.poison, e;
    if (p === 'shiva') e = (d.trust >= 55 && st.meters.c13 >= 50) ? 'shakti' : 'blessed';
    else if (p === 'shared') e = 'shared';
    else e = 'hollow';
    return finish(st, e, e === 'hollow' ? 'mixed' : 'win', D.endings[e][0], D.endings[e][1]);
  }

  function removeCard(st, id) { st.hand = st.hand.filter(function (x) { return x !== id; }); }

  // One turn. Returns a new state; the old one is untouched. cardId is optional.
  function takeTurn(prev, approachId, optionId, cardId) {
    if (prev.ended) return prev;
    var st = clone(prev), lv = level(st), ap = D.approaches[approachId], op = findOption(lv, optionId);
    if (cardId && st.hand.indexOf(cardId) < 0) cardId = null;
    var from = st.pos, regFrom = st.regime, wxFrom = st.weather, before = clone(st.meters), key = lv.n + '.' + op.id;
    var p = preview(st, approachId, optionId, cardId), adj = optionAdjust(st, lv, op), ce = p.card;
    st.meters = p.meters;
    if (op.fate) Object.keys(op.fate).forEach(function (k) { st.fates[k] = op.fate[k]; });
    st.turn += 1;
    st.log.push('S' + String(from).padStart(2, '0') + ': ' + ap.label + ' · ' + op.label + '.');

    // cards: put new cards in the bond hand, grant a one-time card, spend the card played
    st.suits = suitsAfter(st, lv, op);
    var g = D.grants[key]; if (g && st.hand.indexOf(g) < 0 && st.spent.indexOf(g) < 0) { st.hand.push(g); st.log.push('You gain a card: ' + D.oneTime[g].name + '.'); }
    if (ce) {
      st.log.push('Played ' + ce.name + (ce.stage === 'audit' ? ' (audit): ' : ce.stage === 'tell' ? ' (warning): ' : '.') + (ce.stage === 'play' ? '' : ce.reveal));
      if (ce.stage === 'audit') st.morgiana = 'audited';
      else if (ce.stage === 'tell') { st.morgiana = 'told'; st.fates.morgiana = 'told'; removeCard(st, MORG); }
      else { removeCard(st, ce.id); st.spent.push(ce.id); }
    }
    if (adj.flip) { st.morgiana = 'flipped'; st.log.push(D.morgiana.flip.text); }
    if (lv.n === 8 && st.hand.indexOf(MORG) >= 0) { st.fates.morgiana = st.morgiana; removeCard(st, MORG); }
    if (lv.n === 8 && st.morgiana === 'flipped') st.fates.morgiana = 'flipped';

    var last = { approach: approachId, option: optionId, card: cardId, probs: p, from: from, to: from, regFrom: regFrom, regTo: regFrom, wxFrom: wxFrom, wxTo: wxFrom, delta: {} };
    if (lv.final) { st.last = last; return resolveFinal(st, op); }
    if (op.ends) { st.last = last; return finish(st, op.ends, 'mixed', D.endings[op.ends][0], D.endings[op.ends][1]); }
    if (collapseCheck(st)) { st.last = last; return st; }

    // 1. position chain
    var u = rand(st), step = u < p.up ? 1 : (u < p.up + p.stay ? 0 : -1);
    st.pos = clamp(st.pos + step, 1, LAST);
    // 2. regime and weather chains
    st.regime = sample(st, regimeRow(regFrom, p.tilt));
    st.weather = sample(st, weatherRow(wxFrom, from));
    applyFx(st.meters, D.regimes[st.regime].fx, D.regimeScale);
    applyFx(st.meters, D.weather[st.weather].fx, D.regimeScale);
    revert(st.meters);
    // 3. Morgiana's card is dealt face down once the walk reaches S06
    if (st.pos >= D.morgiana.dealtAt && st.morgiana === null) { st.morgiana = 'down'; st.hand.push(MORG); st.log.push('A card is dealt face down: a Client card.'); }

    var delta = {};
    Object.keys(st.meters).forEach(function (k) { delta[k] = Math.round(st.meters[k] - before[k]); });
    last.step = step; last.to = st.pos; last.regTo = st.regime; last.wxTo = st.weather; last.delta = delta;
    st.last = last;
    st.log.push((step > 0 ? 'Up' : step < 0 ? 'Back' : 'Stalled') + ' to S' + String(st.pos).padStart(2, '0') + '. ' +
      D.regimes[st.regime].name + (st.weather === 'storm' ? ', storm.' : '.'));

    if (collapseCheck(st)) return st;
    if (st.turn >= D.maxTurns) return finish(st, 'longwalk', 'mixed', D.endings.longwalk[0], D.endings.longwalk[1]);
    return st;
  }

  function choose(st, policy, rs) {
    var lv = level(st), approaches = Object.keys(D.approaches), best = null, i, j, c;
    if (policy === 'random') {
      var cd = st.hand.length && rs.f() < 0.35 ? st.hand[Math.floor(rs.f() * st.hand.length)] : null;
      return { a: approaches[Math.floor(rs.f() * approaches.length)], o: lv.options[Math.floor(rs.f() * lv.options.length)].id, c: cd };
    }
    var cands = [null].concat(st.hand);
    for (i = 0; i < approaches.length; i++) for (j = 0; j < lv.options.length; j++) for (c = 0; c < cands.length; c++) {
      var pv = preview(st, approaches[i], lv.options[j].id, cands[c]), lo = Math.min.apply(null, Object.keys(pv.meters).map(function (k) { return pv.meters[k]; }));
      var score = policy === 'speed' ? pv.up - pv.down : (pv.up - pv.down) + 0.012 * lo + 0.004 * derived(pv.meters).trust;
      if (lv.options[j].ends) score = -9;
      if (!best || score > best.s) best = { s: score, a: approaches[i], o: lv.options[j].id, c: cands[c] };
    }
    return best;
  }

  // Monte Carlo: play n walks from this state with a fixed policy ('random', 'speed' or 'safe') and count where they end.
  function simulate(st, n, policy) {
    var out = { n: n, endings: {}, positions: {}, groups: { win: 0, mixed: 0, fail: 0 }, turns: 0 };
    for (var i = 0; i < n; i++) {
      var g = clone(st); g.rng = ((st.rng ^ Math.imul(i + 1, 0x9E3779B1)) >>> 0) || 1;
      var local = { s: g.rng ^ 0xA5A5A5A5 };
      var rs = { f: function () { local.s = (local.s + 0x6D2B79F5) >>> 0; var t = local.s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; } };
      var guard = 0;
      while (!g.ended && guard++ < 100) { var c = choose(g, policy, rs); g = takeTurn(g, c.a, c.o, c.c); }
      var e = g.ended || { id: 'longwalk', kind: 'mixed' };
      var key = e.id.indexOf('collapse') === 0 ? 'collapse' : e.id;
      out.endings[key] = (out.endings[key] || 0) + 1;
      out.groups[e.kind] += 1;
      out.positions[g.pos] = (out.positions[g.pos] || 0) + 1;
      out.turns += g.turn;
    }
    out.turns /= n;
    return out;
  }

  return { data: D, newGame: newGame, startAt: startAt, level: level, preview: preview, takeTurn: takeTurn, derived: derived, regimeRow: regimeRow, weatherRow: weatherRow, simulate: simulate, tiltFor: tiltFor, findOption: findOption, handView: handView, bondCheck: bondCheck, cardEffect: cardEffect };
});

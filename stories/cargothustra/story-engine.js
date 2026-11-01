/* Thus Spake Cargothustra: the walk, as an interactive story. Engine (no DOM; runs in the browser and in node).
 *
 * A story is a graph of nodes. Each node has prose, then either choices, a single "continue", a route
 * (conditions pick the next node), a chance (weighted dice pick it), or an ending. Your choices set flags
 * and carry items, and a hidden world (markets high or low, war or peace) drifts as a Markov chain between
 * chapters, tilted by how gentle or harsh you have been. None of it is shown as a number: you only read
 * what it does to the story. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CargoStory = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  function create(parts) {
    var nodes = {}, meta = { start: 'moon', items: {}, chapters: {}, jumpFlags: {}, epilogue: [] };
    (Array.isArray(parts) ? parts : [parts]).forEach(function (p) {
      Object.keys(p).forEach(function (k) { if (k === '_meta') meta = p[k]; else nodes[k] = p[k]; });
    });

    function rand(st) { // mulberry32, kept on the state so a story is replayable
      st.rng = (st.rng + 0x6D2B79F5) >>> 0;
      var t = st.rng;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    // ---- conditions: 'flag', '!flag', 'item:x', 'war', 'peace', 'high', 'low', 'harsh>=2'; arrays are AND ----
    function test(st, c) {
      if (c === undefined || c === null) return true;
      if (Array.isArray(c)) return c.every(function (x) { return test(st, x); });
      var neg = false, s = String(c);
      if (s.charAt(0) === '!') { neg = true; s = s.slice(1); }
      var r;
      if (s === 'war') r = st.world.war;
      else if (s === 'peace') r = !st.world.war;
      else if (s === 'high') r = st.world.market === 'high';
      else if (s === 'low') r = st.world.market === 'low';
      else if (s.indexOf('item:') === 0) r = st.items.indexOf(s.slice(5)) >= 0;
      else {
        var m = /^(\w+)(>=|<=|>|<)(\d+)$/.exec(s);
        if (m) { var v = st.n[m[1]] || 0, k = +m[3]; r = m[2] === '>=' ? v >= k : m[2] === '<=' ? v <= k : m[2] === '>' ? v > k : v < k; }
        else r = !!st.flags[s];
      }
      return neg ? !r : r;
    }

    // The hidden world: markets high or low, war or peace. Gentle choices make peace likelier, harsh ones war.
    function tick(st) {
      var w = st.world;
      w.market = rand(st) < (w.market === 'high' ? 0.30 : 0.35) ? (w.market === 'high' ? 'low' : 'high') : w.market;
      var harsh = st.n.harsh || 0, gentle = st.n.gentle || 0;
      if (w.war) { if (rand(st) < clamp(0.25 + 0.12 * gentle - 0.05 * harsh, 0.1, 0.7)) w.war = false; }
      else if (rand(st) < clamp(0.12 + 0.12 * harsh - 0.04 * gentle, 0.04, 0.6)) w.war = true;
    }

    function apply(st, fx) {
      if (!fx) return;
      (fx.set || []).forEach(function (f) { st.flags[f] = true; });
      (fx.unset || []).forEach(function (f) { delete st.flags[f]; });
      (fx.give || []).forEach(function (i) { if (st.items.indexOf(i) < 0) st.items.push(i); });
      (fx.take || []).forEach(function (i) { st.items = st.items.filter(function (x) { return x !== i; }); });
      if (fx.add) Object.keys(fx.add).forEach(function (k) { st.n[k] = (st.n[k] || 0) + fx.add[k]; });
      if (fx.war) st.world.war = true;
      if (fx.peace) st.world.war = false;
      if (fx.tick) tick(st);
    }

    function paras(st, node) {
      return (node.text || []).filter(function (p) { return typeof p === 'string' || test(st, p.if); })
        .map(function (p) { return typeof p === 'string' ? p : p.t; });
    }

    function epilogue(st) {
      return (meta.epilogue || []).filter(function (e) { return test(st, e.if); }).map(function (e) { return e.t; });
    }

    // Walk into a node: apply its effects, show its prose, then follow any route or chance until we reach a choice or an ending.
    function enter(st, id) {
      for (var guard = 0; guard < 60; guard++) {
        var node = nodes[id];
        if (!node) throw new Error('missing node ' + id);
        st.node = id; st.steps += 1;
        apply(st, node.on);
        var ps = paras(st, node);
        if (ps.length || node.title) st.passages.push({ id: id, ch: node.ch || null, myth: !!node.myth, title: node.title || null, paras: ps });
        if (node.end) {
          st.ended = { id: node.end.id, title: node.end.title, mood: node.end.mood, line: node.end.line, epilogue: node.end.epi ? epilogue(st) : [] };
          return st;
        }
        if (node.route) {
          var hit = node.route.filter(function (r) { return test(st, r.if); })[0];
          apply(st, hit); id = hit.to; continue;
        }
        if (node.chance) {
          var ws = node.chance.map(function (c) {
            var w = c.w; (c.mods || []).forEach(function (m) { if (test(st, m.if)) w += m.w; });
            return Math.max(0.02, w);
          });
          var tot = ws.reduce(function (a, b) { return a + b; }, 0), u = rand(st) * tot, pick = node.chance.length - 1;
          for (var i = 0; i < ws.length; i++) { if (u < ws[i]) { pick = i; break; } u -= ws[i]; }
          id = node.chance[pick].to; continue;
        }
        return st;
      }
      throw new Error('route/chance loop at ' + id);
    }

    function fresh(seed) {
      seed = (seed >>> 0) || 1;
      return { seed: seed, rng: seed, node: null, flags: {}, items: [], n: { harsh: 0, gentle: 0 }, world: { market: 'high', war: false }, passages: [], ended: null, steps: 0 };
    }

    function start(seed) { return enter(fresh(seed), meta.start); }

    // Start at the top of a chapter, as if you had read what came before.
    function jump(chapter, seed) {
      var id = meta.chapters[chapter]; if (!id) return start(seed);
      var st = fresh(seed);
      apply(st, meta.jumpFlags[id]);
      return enter(st, id);
    }

    function visibleChoices(st) {
      if (st.ended) return [];
      var node = nodes[st.node];
      if (node.next) return [{ t: 'Continue', to: node.next, cont: true }];
      return (node.choices || []).filter(function (c) { return test(st, c.if); });
    }

    function view(st) {
      return {
        passages: st.passages, ended: st.ended,
        choices: visibleChoices(st).map(function (c, i) { return { i: i, t: c.t, cont: !!c.cont }; }),
        items: st.items.map(function (i) { return meta.items[i] || i; })
      };
    }

    // Returns a new state; the old one is untouched, so "back" is just keeping the old one.
    function choose(prev, i) {
      var st = clone(prev), c = visibleChoices(st)[i];
      if (!c) return prev;
      if (!c.cont) st.passages.push({ choice: c.t });
      apply(st, c);
      return enter(st, c.to);
    }

    function endings() {
      return Object.keys(nodes).filter(function (k) { return nodes[k].end; }).map(function (k) { var e = nodes[k].end; return { id: e.id, title: e.title, mood: e.mood, node: k }; });
    }

    return { nodes: nodes, meta: meta, start: start, jump: jump, view: view, choose: choose, endings: endings, test: test, visibleChoices: visibleChoices, fresh: fresh, enter: enter, clone: clone };
  }

  return { create: create };
});

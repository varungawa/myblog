/* Thus Spake Cargothustra: the walk. Game UI. Renders into #game-app using CargoGame (game-engine.js). */
(function () {
  var G = window.CargoGame, D = G.data, root = document.getElementById('game-app');
  if (!root) return;
  var S = { game: null, approach: 'saam', option: null, card: null, picks: [], startLevel: 0, policy: 'safe', sim: null, shareMsg: '' };

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var pct = function (x) { return Math.round(x * 100) + '%'; };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var sgn = function (n) { return n > 0 ? '+' + n : String(n); };
  var f1 = function (x) { return (Math.round(x * 10) / 10).toFixed(1); };
  var randSeed = function () { return Math.floor(Math.random() * 999999) + 1; };

  function start(seed, picks, startLevel) {
    S.startLevel = startLevel || 0;
    S.game = S.startLevel > 1 ? G.startAt(S.startLevel, seed) : G.newGame(seed);
    S.picks = []; S.sim = null; S.shareMsg = ''; S.card = null;
    (picks || []).forEach(function (p) {
      if (S.game.ended) return;
      var lv = G.level(S.game);
      if (D.approaches[p[0]] && G.findOption(lv, p[1])) { S.game = G.takeTurn(S.game, p[0], p[1], p[2] || null); S.picks.push(p); }
    });
    S.approach = 'saam'; S.option = S.game.ended ? null : G.level(S.game).options[0].id;
    render();
  }

  function parseHash() {
    var m = /^#walk=(\d+)(?:@(\d+))?((?:~[a-z]+\.[a-z]+(?:\.[a-z]+)?)*)$/.exec(location.hash);
    if (!m) return null;
    return { seed: +m[1], level: m[2] ? +m[2] : 0, picks: m[3].split('~').filter(Boolean).map(function (x) { return x.split('.'); }) };
  }

  function shareLink() {
    return location.href.split('#')[0] + '#walk=' + S.game.seed + (S.startLevel > 1 ? '@' + S.startLevel : '') + S.picks.map(function (p) { return '~' + p.filter(Boolean).join('.'); }).join('');
  }

  function meterRows(g, pv) {
    var lv = g.ended ? null : G.level(g), last = g.last;
    return D.meters.map(function (mt) {
      var v = Math.round(g.meters[mt.id]), d = last && last.delta ? last.delta[mt.id] : 0;
      var pvv = pv ? Math.round(pv.meters[mt.id]) - v : 0;
      var tested = lv && lv.tests.indexOf(mt.id) >= 0;
      return '<li class="mt' + (tested ? ' tested' : '') + '"><span class="mn"><b>' + mt.short + '</b> ' + esc(mt.name) + (tested ? ' <i>(tested here)</i>' : '') + '</span>' +
        '<span class="bar" role="img" aria-label="' + esc(mt.name) + ' ' + v + ' of 100"><span style="width:' + v + '%"></span></span>' +
        '<span class="mv">' + v + '</span><span class="md">' + (d ? (d > 0 ? '▲' : '▼') + Math.abs(d) : '') + '</span>' +
        '<span class="mp" title="change if you walk this choice, before the world moves">' + (pvv ? sgn(pvv) : '') + '</span></li>';
    }).join('');
  }

  function derivedRows(m) {
    var d = G.derived(m), rows = [['Trust', d.trust, 'C3 + C10 + C13'], ['Risk', d.risk, 'inverse of C6 + C7 + C9 + C12'], ['Liquidity', d.liquidity, 'C1 + C3 + C4 + C11'], ['Insurance', d.insurance, 'C8 + C10 + C11'], ['Fraud probability', d.fraud, 'inverse of C2 + C10 + C13']];
    return rows.map(function (r) { return '<li class="mt"><span class="mn"><b>' + esc(r[0]) + '</b> <i>' + esc(r[2]) + '</i></span><span class="bar" role="img" aria-label="' + esc(r[0]) + ' ' + r[1] + ' of 100"><span style="width:' + r[1] + '%"></span></span><span class="mv">' + r[1] + '</span></li>'; }).join('');
  }

  function matrixHtml(g, pv) {
    var ids = Object.keys(D.regimes), cur = g.regime;
    var head = '<tr><th scope="col"><span class="sr">from \\ to</span></th>' + ids.map(function (id) { return '<th scope="col" title="' + esc(D.regimes[id].name) + '">' + id + '</th>'; }).join('') + '</tr>';
    var rows = ids.map(function (from) {
      var row = from === cur && pv ? G.regimeRow(from, pv.tilt) : D.regimeMatrix[from];
      return '<tr' + (from === cur ? ' class="cur"' : '') + '><th scope="row" title="' + esc(D.regimes[from].name) + '">' + from + '</th>' + ids.map(function (to) { return '<td>' + pct(row[to]) + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<table class="matrix"><caption>Regime chain: next-turn probabilities. The highlighted row is today’s, tilted by your choice.</caption><thead>' + head + '</thead><tbody>' + rows + '</tbody></table>' +
      '<p class="legend"><b>HP</b> markets high, peace · <b>HW</b> high, war · <b>LP</b> low, peace · <b>LW</b> low, war</p>';
  }

  function trackHtml(g) {
    return '<ol class="track" aria-label="Position on the walk">' + D.levels.map(function (lv) {
      var cls = lv.n === g.pos && !g.ended ? ' now' : (lv.n < g.pos ? ' done' : '');
      var chs = D.levelChapters[lv.n];
      return '<li class="stn' + cls + '"' + (lv.n === g.pos ? ' aria-current="step"' : '') + '><b>S' + pad(lv.n) + '</b><span>' + esc(lv.title) + '</span><i class="chs">Ch ' + chs.join(', ') + '</i>' + (lv.n === g.pos ? '<em class="tok" aria-hidden="true">◆</em>' : '') + '</li>';
    }).join('') + '</ol>';
  }

  function probBar(pv) {
    return '<div class="prob" role="img" aria-label="Chances: forward ' + pct(pv.up) + ', stall ' + pct(pv.stay) + ', back ' + pct(pv.down) + '">' +
      '<span class="pu" style="flex:' + pv.up + '">Forward ' + pct(pv.up) + '</span><span class="ps" style="flex:' + pv.stay + '">Stall ' + pct(pv.stay) + '</span>' +
      (pv.down > 0 ? '<span class="pd" style="flex:' + pv.down + '">Back ' + pct(pv.down) + '</span>' : '') + '</div>';
  }

  function portCard(label, name) {
    var p = D.ports[name];
    return '<div class="port"><span class="mono">' + label + '</span><b>' + esc(name) + '</b><small>scrutiny ' + p.scrutiny + ' · palm ' + p.palm + ' · heat ' + p.heat + '</small></div>';
  }

  function portsHtml(pv) {
    var b = pv.bond, adj = Math.max(-8, Math.min(8, b.margin));
    return '<div class="ports">' + portCard('Port of loading', b.from) + '<span class="arrow" aria-hidden="true">→</span>' + portCard('Port of discharge', b.to) + '</div>' +
      '<p class="bondline">Bond check: cover <b>' + b.cover + '</b> + palm <b>' + f1(b.palm) + '</b> − risk <b>' + f1(b.risk) + '</b> (heat ' + b.heat + ' × scrutiny ' + f1(b.scrutiny) + ') = <b>' + (b.margin >= 0 ? '+' : '') + f1(b.margin) + '</b>, which moves your chance of going forward by <b>' + (adj >= 0 ? '+' : '') + f1(adj) + ' points</b>.</p>';
  }

  function handHtml(g, pv) {
    var slots = D.suits.map(function (s) {
      var c = pv.suits[s.id], pending = c && JSON.stringify(c) !== JSON.stringify(g.suits[s.id]);
      return c ? '<li class="card-s' + (pending ? ' pending' : '') + '"><span class="mono">' + s.c + ' ' + esc(s.name) + '</span><b>' + esc(c.name) + '</b><small>cover ' + c.cover + ' · heat ' + c.heat + '</small></li>'
        : '<li class="card-s empty"><span class="mono">' + s.c + ' ' + esc(s.name) + '</span><b>empty</b><small>filled at S' + pad(s.level) + '</small></li>';
    }).join('');
    var hv = G.handView(g);
    var cards = hv.length ? hv.map(function (c) {
      var sel = S.card === c.id;
      return '<button type="button" class="pc' + (c.faceDown ? ' down' : '') + '" data-card="' + c.id + '" aria-pressed="' + sel + '"><span class="mono">' + esc(c.suit) + ' · one-time</span>' +
        '<b>' + (c.faceDown ? '❔ ' : '') + esc(c.name) + '</b><small>' + esc(c.text) + '</small><em>' + (sel ? '✓ Playing this turn: ' : 'Tap to play: ') + esc(c.label) + '</em></button>';
    }).join('') : '<p class="note">No one-time cards yet. Some calls earn them: a letter of credit, the Katta chit, Gora’s ledger page, Open Sesame, the forty jars.</p>';
    return '<div class="handbox"><div class="mono">Your bond hand · one card per suit</div><ul class="suits">' + slots + '</ul>' +
      '<div class="mono" style="margin-top:12px">Cards to play · one per turn, spent when played</div><div class="pcs">' + cards + '</div></div>';
  }

  function lastHtml(g) {
    var l = g.last; if (!l || l.step === undefined) return '';
    var lvFrom = D.levels[l.from - 1];
    var txt = l.step > 0 ? 'The walk moved forward to S' + pad(l.to) + '.' : l.step < 0 ? 'The walk was pushed back to S' + pad(l.to) + '.' : 'The walk stalled at S' + pad(l.to) + '.';
    var reg = l.regFrom !== l.regTo ? 'The regime changed: ' + D.regimes[l.regFrom].name + ' → <b>' + D.regimes[l.regTo].name + '</b>.' : 'The regime held: ' + D.regimes[l.regTo].name + '.';
    var wx = l.wxFrom !== l.wxTo ? (l.wxTo === 'storm' ? ' A storm rolled in.' : ' The storm passed.') : (l.wxTo === 'storm' ? ' The storm holds.' : '');
    var extra = '';
    if (l.card) { var ce = l.probs.card; if (ce) extra += ' You played <b>' + esc(ce.name) + '</b>.'; }
    if (l.probs && l.probs.notes && l.probs.notes.length) extra += ' ' + esc(l.probs.notes.join(' '));
    return '<div class="lastturn"><div class="mono">Last turn · S' + pad(l.from) + ' ' + esc(lvFrom.title) + '</div><p>' + txt + ' ' + reg + wx + extra + '</p></div>';
  }

  function simHtml() {
    var r = S.sim; if (!r) return '';
    var names = { shakti: 'Shakti rises', blessed: 'Blessed, and still dark', shared: 'The network carries it', hollow: 'Delivered, hollow', deal: 'The deal', longwalk: 'The long walk', collapse: 'A meter hit zero' };
    var ends = Object.keys(r.endings).sort(function (a, b) { return r.endings[b] - r.endings[a]; }).map(function (k) {
      return '<li><span class="sn">' + esc(names[k] || k) + '</span><span class="bar"><span style="width:' + (r.endings[k] / r.n * 100) + '%"></span></span><span class="mv">' + (r.endings[k] / r.n * 100).toFixed(1) + '%</span></li>';
    }).join('');
    var pos = D.levels.map(function (lv) {
      var c = r.positions[lv.n] || 0;
      return '<li><span class="sn">S' + pad(lv.n) + '</span><span class="bar"><span style="width:' + (c / r.n * 100) + '%"></span></span><span class="mv">' + (c / r.n * 100).toFixed(1) + '%</span></li>';
    }).join('');
    return '<div class="simres"><div class="mono">' + r.n.toLocaleString() + ' walks from here · average ' + r.turns.toFixed(1) + ' turns</div><div class="two"><div><h4>Where they end up</h4><ul class="mlist">' + ends + '</ul></div><div><h4>Last station reached</h4><ul class="mlist">' + pos + '</ul></div></div></div>';
  }

  function endingHtml(g) {
    var e = g.ended, d = e.derived;
    return '<div class="ending ' + e.kind + '"><div class="mono">The walk ends · S' + pad(e.pos) + ' · turn ' + e.turn + ' of ' + D.maxTurns + '</div><h3 id="game-scene" tabindex="-1">' + esc(e.title) + '</h3><p>' + esc(e.text) + '</p>' +
      (e.epilogue.length ? '<ul class="epi">' + e.epilogue.map(function (x) { return '<li><b>' + esc(x[0]) + '.</b> ' + esc(x[1]) + '</li>'; }).join('') + '</ul>' : '') +
      '<p class="scores">Trust ' + d.trust + ' · Risk ' + d.risk + ' · Liquidity ' + d.liquidity + ' · Insurance ' + d.insurance + ' · Fraud probability ' + d.fraud + '</p>' +
      '<div class="actions"><button type="button" data-act="again">Walk again, new seed</button><button type="button" data-act="replay">Replay this seed</button><button type="button" data-act="share">Copy a link to this walk</button></div>' +
      (S.shareMsg ? '<p class="note" role="status">' + esc(S.shareMsg) + '</p>' : '') + '</div>';
  }

  function render() {
    var g = S.game, lv = g.ended ? null : G.level(g);
    if (S.card && g.hand.indexOf(S.card) < 0) S.card = null;
    var pv = g.ended ? null : G.preview(g, S.approach, S.option, S.card);
    var reg = D.regimes[g.regime], wx = D.weather[g.weather];
    var html = '<div class="gamebar"><label>Seed <input id="seed" type="number" min="1" value="' + g.seed + '" aria-label="Seed"></label><button type="button" data-act="new">New walk</button>' +
      '<span class="turn">Turn <b>' + g.turn + '</b> of ' + D.maxTurns + '</span></div>' + trackHtml(g) + '<div class="gamegrid"><div class="gcol">';
    html += '<div class="world"><span class="chip">' + esc(reg.name) + '</span><span class="chip' + (g.weather === 'storm' ? ' storm' : '') + '">' + esc(wx.name) + '</span><span class="wb">' + esc(reg.blurb) + '</span></div>';
    if (g.ended) html += endingHtml(g);
    else {
      html += '<div class="scene"><div class="mono">S' + pad(lv.n) + ' · ' + esc(lv.c) + '</div><h3 id="game-scene" tabindex="-1">' + esc(lv.title) + '</h3><p>' + esc(lv.scene) + '</p>' +
        '<p class="inoutline">In the outline: ' + D.levelChapters[lv.n].map(function (n) { return '<button type="button" class="lnk" data-chapter="' + n + '">Chapter ' + n + ' ↗</button>'; }).join(' ') + '</p></div>';
      html += portsHtml(pv);
      html += '<fieldset class="choices"><legend>Your approach <span class="hint">(a move of Krishna’s)</span></legend><div class="opts four">' +
        Object.keys(D.approaches).map(function (k) { var a = D.approaches[k]; return '<button type="button" class="opt" data-approach="' + k + '" aria-pressed="' + (S.approach === k) + '"><b>' + a.label + '</b><span>' + a.verb + '</span><small>' + esc(a.desc) + '</small></button>'; }).join('') + '</div></fieldset>';
      html += '<fieldset class="choices"><legend>' + esc(lv.prompt) + '</legend><div class="opts three">' +
        lv.options.map(function (o) { var cs = (D.suitCards[lv.n + '.' + o.id] || []).map(function (c) { return esc(c.name) + ' (cover ' + c.cover + ', heat ' + c.heat + ')'; }).join(' + '); return '<button type="button" class="opt" data-option="' + o.id + '" aria-pressed="' + (S.option === o.id) + '"><b>' + esc(o.label) + '</b><small>' + esc(o.text) + '</small>' + (cs ? '<em class="gives">Adds: ' + cs + '</em>' : '') + (D.grants[lv.n + '.' + o.id] ? '<em class="gives">Earns the card ' + esc(D.oneTime[D.grants[lv.n + '.' + o.id]].name) + '</em>' : '') + '</button>'; }).join('') + '</div></fieldset>';
      html += handHtml(g, pv);
      if (pv.notes.length) html += '<p class="warn" role="status">' + esc(pv.notes.join(' ')) + '</p>';
      if (lv.final) html += '<p class="note">This is the last bond. The walk ends with your answer.</p>';
      else html += '<div class="preview"><div class="mono">Position chain · exact chances for this choice' + (S.card ? ' with ' + esc(pv.card.name) : '') + '</div>' + probBar(pv) + '</div>';
      html += '<div class="actions"><button type="button" class="go" data-act="walk">' + (lv.final ? 'Hold the poison' : 'Take the walk') + '</button></div>';
    }
    html += lastHtml(g);
    html += '<div class="simbox"><div class="mono">See where he ends up</div><p class="note">Run many random walks from the board as it stands. The same engine, the same chains, a thousand times.</p><div class="actions">' +
      '<label>Choices <select id="policy" aria-label="Choice policy"><option value="random"' + (S.policy === 'random' ? ' selected' : '') + '>at random</option><option value="speed"' + (S.policy === 'speed' ? ' selected' : '') + '>always chase speed</option><option value="safe"' + (S.policy === 'safe' ? ' selected' : '') + '>play it safe</option></select></label>' +
      '<button type="button" data-act="sim">Run 1,000 walks</button></div>' + simHtml() + '</div>';
    html += '<details class="log"><summary>Walk log (' + g.log.length + ')</summary><ol aria-live="polite">' + g.log.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></details>';
    html += '</div><aside class="gcol board" aria-label="13C analytics"><h3>13C analytics</h3><ul class="mlist" aria-label="The thirteen Cs">' + meterRows(g, pv) + '</ul><h3>Derived scores</h3><ul class="mlist derived">' + derivedRows(g.meters) + '</ul><h3>Markov chains</h3>' + matrixHtml(g, pv) + '</aside></div>';
    root.innerHTML = html;
  }

  root.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t || !root.contains(t)) return;
    if (t.dataset.approach) { S.approach = t.dataset.approach; render(); return; }
    if (t.dataset.option) { S.option = t.dataset.option; render(); return; }
    if (t.dataset.card) { S.card = S.card === t.dataset.card ? null : t.dataset.card; render(); return; }
    if (t.dataset.chapter) { if (window.CargoOutline) window.CargoOutline.open(+t.dataset.chapter); return; }
    var act = t.dataset.act;
    if (act === 'walk') {
      S.picks.push([S.approach, S.option, S.card].filter(function (x, i) { return i < 2 || x; })); S.game = G.takeTurn(S.game, S.approach, S.option, S.card); S.sim = null; S.card = null;
      if (!S.game.ended) { S.option = G.level(S.game).options[0].id; }
      render(); var sc = document.getElementById('game-scene'); if (sc) sc.focus({ preventScroll: true });
    } else if (act === 'new' || act === 'again') {
      var v = act === 'new' ? parseInt(document.getElementById('seed').value, 10) : 0;
      start(v > 0 ? v : randSeed(), [], act === 'new' ? 0 : S.startLevel); // "New walk" always begins at S01
    } else if (act === 'replay') start(S.game.seed, [], S.startLevel);
    else if (act === 'sim') {
      S.sim = G.simulate(S.game.ended ? G.newGame(S.game.seed) : S.game, 1000, S.policy); render();
    } else if (act === 'share') {
      var url = shareLink();
      (navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { S.shareMsg = 'Link copied.'; render(); }, function () { S.shareMsg = url; render(); });
    }
  });
  root.addEventListener('change', function (e) { if (e.target.id === 'policy') { S.policy = e.target.value; S.sim = null; render(); } });

  // The outline's "Play level" buttons call this.
  window.CargoGameUI = { jump: function (n) { start(randSeed(), [], n); } };

  var h = parseHash();
  if (h) start(h.seed, h.picks, h.level); else start(randSeed());
})();

/* Thus Spake Cargothustra: the walk, as an interactive story. UI. Renders into #story-app using CargoStory (story-engine.js). */
(function () {
  var root = document.getElementById('story-app');
  if (!root || !window.CargoStory || !window.CargoStoryParts) return;
  var story = window.CargoStory.create(window.CargoStoryParts);
  var ALL = story.endings();
  var KEY = 'cargo-endings';
  var S = { cur: null, back: [], found: [], showEnds: false, fromIndex: 0 };

  try { S.found = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { S.found = []; }
  var remember = function (id) {
    if (S.found.indexOf(id) < 0) { S.found.push(id); try { localStorage.setItem(KEY, JSON.stringify(S.found)); } catch (e) { /* private mode */ } }
  };

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var inline = function (s) { return esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>'); };
  var seed = function () { return Math.floor(Math.random() * 999999) + 1; };

  function begin(chapter) {
    S.cur = chapter ? story.jump(chapter, seed()) : story.start(seed());
    S.back = []; S.fromIndex = 0;
    if (S.cur.ended) remember(S.cur.ended.id);
    render(true);
  }

  function passageHtml(p, isNew) {
    if (p.choice) return '<p class="you">— ' + inline(p.choice) + '</p>';
    var head = '';
    if (p.ch) head += '<h3 class="chh"><span>Chapter ' + p.ch[0] + '</span> ' + esc(p.ch[1]) + ' <button type="button" class="lnk" data-chapter="' + p.ch[0] + '">In the outline ↗</button></h3>';
    if (p.title) head += '<h3 class="myth-t">' + esc(p.title) + '</h3>';
    return '<article class="pass' + (p.myth ? ' myth' : '') + (isNew ? ' new' : '') + '">' + head + p.paras.map(function (t) { return '<p>' + inline(t) + '</p>'; }).join('') + '</article>';
  }

  function endingsHtml() {
    var found = ALL.filter(function (e) { return S.found.indexOf(e.id) >= 0; }).length;
    var list = ALL.map(function (e) {
      var got = S.found.indexOf(e.id) >= 0;
      return '<li class="' + (got ? 'got' : '') + '">' + (got ? esc(e.title) : '<span aria-label="not found yet">? ? ?</span>') + '</li>';
    }).join('');
    return '<div class="ends"><button type="button" class="lnk" data-act="ends" aria-expanded="' + S.showEnds + '">Endings found: ' + found + ' of ' + ALL.length + '</button>' +
      (S.showEnds ? '<ul class="endlist">' + list + '</ul>' : '') + '</div>';
  }

  function render(scrollToStart) {
    var v = story.view(S.cur), firstNew = S.fromIndex;
    var html = '<div class="sbar"><button type="button" data-act="restart">Start again</button><button type="button" data-act="back"' + (S.back.length ? '' : ' disabled') + '>Go back one choice</button>' + endingsHtml() + '</div>';
    html += '<div class="book" aria-live="polite">' + v.passages.map(function (p, i) { return passageHtml(p, i >= firstNew && i > 0); }).join('') + '</div>';
    if (v.ended) {
      var e = v.ended;
      html += '<div class="ending ' + esc(e.mood) + '" id="the-end"><div class="mono">The end</div><h3 tabindex="-1" id="end-title">' + esc(e.title) + '</h3><p>' + inline(e.line) + '</p>' +
        (e.epilogue.length ? '<ul class="epi">' + e.epilogue.map(function (t) { return '<li>' + inline(t) + '</li>'; }).join('') + '</ul>' : '') +
        '<p class="note">There are other ways this could have gone. ' + (ALL.length - ALL.filter(function (x) { return S.found.indexOf(x.id) >= 0; }).length) + ' endings are still waiting.</p>' +
        '<div class="actions"><button type="button" class="go" data-act="restart">Walk again</button><button type="button" data-act="back"' + (S.back.length ? '' : ' disabled') + '>Go back one choice</button></div></div>';
    } else {
      html += '<div class="choices" role="group" aria-label="What do you do?">' + v.choices.map(function (c) {
        return '<button type="button" class="ch' + (c.cont ? ' cont' : '') + '" data-choice="' + c.i + '">' + inline(c.t) + '</button>';
      }).join('') + '</div>';
    }
    if (v.items.length && !v.ended) html += '<p class="pocket"><b>In my pocket:</b> ' + v.items.map(esc).join(' · ') + '</p>';
    root.innerHTML = html;
    S.fromIndex = v.passages.length;
    if (!scrollToStart) {
      var target = root.querySelector('.pass.new') || root.querySelector('#the-end');
      if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); var t2 = root.querySelector('#end-title'); if (t2 && target.id === 'the-end') t2.focus({ preventScroll: true }); }
    }
  }

  root.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t || !root.contains(t) || t.disabled) return;
    if (t.dataset.choice !== undefined) {
      S.back.push(S.cur); S.cur = story.choose(S.cur, +t.dataset.choice);
      if (S.cur.ended) remember(S.cur.ended.id);
      render(); return;
    }
    if (t.dataset.chapter) { if (window.CargoOutline) window.CargoOutline.open(+t.dataset.chapter); return; }
    var act = t.dataset.act;
    if (act === 'restart') begin();
    else if (act === 'back' && S.back.length) { S.cur = S.back.pop(); S.cur.rng = (S.cur.rng + 7919) >>> 0; S.fromIndex = S.cur.passages.length; render(true); }
    else if (act === 'ends') { S.showEnds = !S.showEnds; render(true); }
  });

  // The outline's "Read this chapter as a story" buttons call this.
  window.CargoGameUI = { jump: function (n) { begin(n); } };
  begin();
})();

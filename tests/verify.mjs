// Repeatable site verification. Usage:
//   node tests/verify.mjs                       # serves ./ at http://127.0.0.1:4173/myblog/
//   BASE=https://varungawa.github.io/myblog/ node tests/verify.mjs
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = process.env.SHOTS || path.join(root, 'tests', 'screenshots');
const MIME = { '.html': 'text/html; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.js': 'text/javascript', '.css': 'text/css' };
let server, BASE = process.env.BASE;
if (!BASE) {
  server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]); if (!p.startsWith('/myblog/')) { res.writeHead(404); return res.end(); }
    p = p.slice(7); if (p.endsWith('/')) p += 'index.html'; const f = path.join(root, p);
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('nf'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  }).listen(4173); BASE = 'http://127.0.0.1:4173/myblog/';
}
fs.mkdirSync(OUT, { recursive: true });
const results = []; const ok = (n, c, d = '') => { results.push({ n, c: !!c, d }); console.log((c ? 'PASS ' : 'FAIL ') + n + (d ? ' — ' + d : '')); };
const browser = await chromium.launch();
const sizes = [[390, 844, 'mobile'], [768, 1024, 'tablet'], [1440, 900, 'desktop'], [1920, 1080, 'wide']];
const imageAudit = (page) => page.evaluate(async () => {
  const out = [];
  for (const im of document.images) { if (im.id === 'lbi') continue;
    if (im.loading === 'lazy') im.loading = 'eager';
    try { await im.decode(); } catch (e) {}
    const r = { src: im.currentSrc, nw: im.naturalWidth, nh: im.naturalHeight, alt: im.alt, std: 0 };
    if (r.nw) { const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 64, 64);
      const d = x.getImageData(0, 0, 64, 64).data; let s = 0, s2 = 0, n = 0; for (let i = 0; i < d.length; i += 4) { const l = (d[i] + d[i + 1] + d[i + 2]) / 3; s += l; s2 += l * l; n++; }
      r.std = Math.sqrt(s2 / n - (s / n) ** 2); r.mean = s / n; }
    out.push(r);
  } return out; });
for (const [name, url] of [['home', BASE], ['history', BASE + 'history/'], ['mandi', BASE + 'history/mandi/'], ['millie', BASE + 'history/millie/']]) {
  for (const [w, h, label] of sizes) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 800 }); const page = await ctx.newPage();
    const errs = [], failed = [], bad = [];
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push(String(e)));
    page.on('requestfailed', r => failed.push(r.url())); page.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
    const resp = await page.goto(url, { waitUntil: 'load' }); const tag = `${name}@${w}`;
    ok(`${tag} loads 200`, resp.status() === 200);
    const imgs = await imageAudit(page); await page.waitForTimeout(300);
    ok(`${tag} images decode with real content`, imgs.length > 0 && imgs.every(i => i.nw > 0 && i.nh > 0 && i.std > 12 && i.alt), `${imgs.length} imgs; ` + imgs.filter(i => !(i.nw > 0 && i.std > 12 && i.alt)).map(i => i.src).join(','));
    ok(`${tag} no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    ok(`${tag} no console errors / failed / 4xx requests`, !errs.length && !failed.length && !bad.length, [...errs, ...failed, ...bad].join(' | '));
    ok(`${tag} no duplicate ids`, await page.evaluate(() => { const s = new Set(); for (const e of document.querySelectorAll('[id]')) { if (s.has(e.id)) return false; s.add(e.id); } return true; }));
    if (name === 'home' && w === 1440) {
      await page.waitForSelector('.rail button');
      ok('home: rail lists 13 chapters + 4 interludes', await page.locator('.rail button').count() === 17);
      ok('home: hero image has real content & not lazy', imgs[0].std > 20 && await page.$eval('.cover', e => e.loading !== 'lazy'), 'std=' + imgs[0].std.toFixed(1));
      // the interactive story
      await page.waitForSelector('#story-app .pass');
      ok('story: opens with the myth and a Continue', (await page.locator('#story-app .pass').first().innerText()).includes('twenty-seven wives') && await page.locator('#story-app [data-choice]').count() === 1);
      ok('story: no levels, turns, seeds, meters or scores on screen', !/\bS\d\d\b|\bTurn \d|\bSeed\b|\bscore\b|\bmeter\b|\bprobab/i.test(await page.locator('#story-app').innerText()));
      await page.click('[data-choice="0"]'); await page.click('[data-choice="0"]');
      ok('story: the first hurdle offers three decisions', await page.locator('#story-app .choices .ch').count() === 3);
      const nBefore = await page.locator('#story-app .pass').count();
      await page.locator('#story-app .ch').first().click(); await page.waitForTimeout(200);
      ok('story: a decision adds prose and records what you chose', await page.locator('#story-app .pass').count() > nBefore && await page.locator('#story-app .you').count() === 1);
      await page.locator('[data-act="back"]').first().click();
      ok('story: going back one choice undoes it', await page.locator('#story-app .you').count() === 0 && await page.locator('#story-app .choices .ch').count() === 3);
      let sc = 0; while (!(await page.locator('#the-end').count()) && sc < 90) { await page.locator('#story-app [data-choice]').first().click(); sc++; }
      const end1 = await page.locator('#end-title').innerText();
      ok('story: reading with the first choice each time reaches an ending', await page.locator('#the-end').count() === 1, sc + ' choices: ' + end1);
      ok('story: the endings tracker counts it', /Endings found: [1-9]\d? of 14/.test(await page.locator('[data-act="ends"]').innerText()));
      await page.locator('[data-act="restart"]').first().click();
      ok('story: start again returns to the beginning', (await page.locator('#story-app .pass').first().innerText()).includes('twenty-seven wives') && await page.locator('#the-end').count() === 0);
      sc = 0; while (!(await page.locator('#the-end').count()) && sc < 90) { const n = await page.locator('#story-app [data-choice]').count(); await page.locator('#story-app [data-choice]').nth(n - 1).click(); sc++; }
      const end2 = await page.locator('#end-title').innerText();
      ok('story: taking the last choice each time reaches a different ending', end2 !== end1, end1 + ' vs ' + end2);
      await page.click('[data-act="ends"]'); ok('story: the endings list shows found and hidden endings', await page.locator('.endlist li.got').count() >= 2 && await page.locator('.endlist li:not(.got)').count() >= 1);
      // outline -> story and back
      await page.waitForSelector('.rail button'); await page.click('.rail button[data-i="5"]'); await page.click('.lvl'); await page.waitForTimeout(300);
      ok('story: an outline chapter opens the story at that chapter', /chapter 5/i.test(await page.locator('#story-app .chh').first().innerText()));
      await page.click('#story-app [data-chapter]'); await page.waitForTimeout(300);
      ok('story: a chapter heading links back to the outline', /Legs, and the Cave/.test(await page.locator('.card2 h2').innerText()));
      await page.click('.rail button[data-i="0"]'); await page.click('#next'); ok('home: Next opens chapter 1', (await page.locator('.card2 h2').innerText()) === 'A Need Arises');
      await page.click('[data-view="all"]'); await page.waitForSelector('.all article');
      ok('home: whole outline has 17 entries', await page.locator('.all article').count() === 17);
      const wc = await page.$$eval('.all article .mono', els => els.map(e => (e.textContent.match(/^(\d+) words$/) || [])[1]).filter(Boolean).map(Number));
      ok('home: 13 chapter blurbs of 250-350 words', wc.length === 13 && wc.every(n => n >= 250 && n <= 350), wc.join(','));
      await page.click('[data-view="one"]'); await page.click('.rail button:nth-of-type(3)'); ok('home: rail selects a chapter', /act 1/i.test(await page.locator('.card2 .mono').first().innerText()));
      ok('home: previous stories cards link into history', await page.locator('#previous a.card[href="history/mandi/"]').count() === 1 && await page.locator('#previous a.card[href="history/millie/"]').count() === 1);
      await page.click('.nav a[href="history/"]'); await page.waitForURL('**/myblog/history/'); ok('home→history hub nav works', page.url().endsWith('/myblog/history/'));
    }
    if (name === 'history' && w === 1440) {
      ok('hub: pinned latest + 2 archive cards', await page.locator('a.card').count() === 3);
      ok('hub: card links', await page.locator('a.card[href="../"]').count() === 1 && await page.locator('a.card[href="mandi/"]').count() === 1 && await page.locator('a.card[href="millie/"]').count() === 1);
    }
    if (name === 'mandi' && w === 1440) {
      ok('mandi: 13 story sections + sequel', await page.locator('article section').count() === 13 && await page.locator('#next h2').innerText() === 'The Dorian Grays of Limelight');
      const hrefs = await page.$$eval('.toc a', a => a.map(x => x.getAttribute('href'))); let all = true; for (const hf of hrefs) all = all && await page.locator(hf).count() === 1; ok('mandi: every chapter nav link resolves', all && hrefs.length === 13);
      ok('mandi: hero image has real content & not lazy', imgs[0].std > 25 && await page.$eval('.cover', e => e.loading !== 'lazy'), 'std=' + imgs[0].std.toFixed(1));
      ok('mandi: archived pin bar links to the latest story', await page.locator('a[href="../../"]').count() >= 1);
      await page.click('.nav a[href="../../history/"]'); await page.waitForURL('**/myblog/history/'); ok('mandi→history hub nav works', page.url().endsWith('/myblog/history/'));
      await page.click('a.card[href="millie/"]'); await page.waitForURL('**/history/millie/'); ok('hub→millie card works', page.url().endsWith('/history/millie/'));
      await page.click('.back'); await page.waitForURL(u => u.pathname.endsWith('/myblog/')); ok('millie→latest story nav works', true);
    }
    if (name === 'millie') {
      const srcs = imgs.filter(i => i.src.includes('assets/history/') && /\/\d\d-/.test(i.src)).map(i => i.src);
      ok(`${tag} 18 distinct frame files`, new Set(srcs).size === 18 && await page.locator('figure.frame img').count() === 18);
      if (w === 1440 || w === 390) {
        await page.locator('.open').first().click(); const vis = await page.locator('#lb').isVisible(); ok(`${tag} lightbox opens`, vis);
        const cap1 = await page.locator('#lbc').innerText();
        if (w === 1440) {
          await page.keyboard.press('ArrowRight'); const cap2 = await page.locator('#lbc').innerText(); ok('lightbox → key advances', cap1 !== cap2, cap1 + ' → ' + cap2);
          await page.keyboard.press('ArrowLeft'); ok('lightbox ← key returns', (await page.locator('#lbc').innerText()) === cap1);
          await page.locator('.lb .p').click(); ok('lightbox prev wraps to 18', (await page.locator('#lbc').innerText()).startsWith('18'));
          await page.screenshot({ path: `${OUT}/history-lightbox-${w}.png` });
          for (let i = 0; i < 18; i++) { await page.locator('.lb .n').click(); const d = await page.$eval('#lbi', e => e.complete && e.naturalWidth > 0); if (!d) { ok('lightbox all frames render', false, 'frame ' + i); break; } if (i === 17) ok('lightbox all 18 frames render', true); }
        } else { const box = await page.locator('#lbi').boundingBox(); await page.touchscreen.tap(5, 5).catch(() => {});
          await page.evaluate(() => { const l = document.getElementById('lb'); const mk = (t, x) => { const e = new Event(t, { bubbles: true }); e.changedTouches = [{ clientX: x }]; l.dispatchEvent(e); }; mk('touchstart', 300); mk('touchend', 100); });
          ok('lightbox swipe advances', (await page.locator('#lbc').innerText()) !== cap1); }
        await page.keyboard.press('Escape'); ok(`${tag} lightbox Esc closes`, !(await page.locator('#lb').isVisible()));
      }
    }
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0);  });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/${name}-${label}-${w}x${h}.png`, fullPage: label !== 'wide' }); await ctx.close();
  }
}
await browser.close(); server?.close();
const fails = results.filter(r => !r.c); console.log(`\n${results.length - fails.length}/${results.length} passed`); process.exit(fails.length ? 1 : 0);

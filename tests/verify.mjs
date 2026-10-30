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
for (const [name, url] of [['home', BASE], ['history', BASE + 'history/']]) {
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
      ok('home: 13 story sections + sequel', await page.locator('article section').count() === 13 && await page.locator('#next h2').innerText() === 'The Dorian Grays of Limelight');
      const hrefs = await page.$$eval('.toc a', a => a.map(x => x.getAttribute('href'))); let all = true; for (const hf of hrefs) all = all && await page.locator(hf).count() === 1; ok('home: every chapter nav link resolves', all && hrefs.length === 13);
      ok('home: hero image has real content & not lazy', imgs[0].std > 25 && await page.$eval('.cover', e => e.loading !== 'lazy'), 'std=' + imgs[0].std.toFixed(1));
      await page.click('.nav a[href="history/"]'); await page.waitForURL('**/history/'); ok('home→history nav works', page.url().endsWith('/history/'));
      await page.click('.back'); await page.waitForURL(u => u.pathname.endsWith('/myblog/')); ok('history→story return nav works', true);
    }
    if (name === 'history') {
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

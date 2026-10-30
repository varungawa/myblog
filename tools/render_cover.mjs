// Render stories/<slug>/cover-art.html to assets/source/<slug>-cover.png; tools/build_site.py --covers converts it to assets/story/<slug>-cover.jpg.
// Usage: node tools/render_cover.mjs cargothustra
import path from 'node:path'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); const { chromium } = require('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const slug = process.argv[2]; if (!slug) { console.error('usage: node tools/render_cover.mjs <slug>'); process.exit(2); }
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1536, height: 1024 } });
await p.goto('file://' + path.join(root, 'stories', slug, 'cover-art.html'));
await p.locator('#c').screenshot({ path: path.join(root, 'assets', 'source', `${slug}-cover.png`) });
await b.close();

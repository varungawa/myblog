# Site verification

`node tests/verify.mjs` serves the repo at `http://127.0.0.1:4173/myblog/` (same base path as GitHub Pages) and checks both pages at 390, 768, 1440 and 1920 px:
loads, every image decodes with real pixel variance and alt text, no horizontal overflow, no console errors / failed / 4xx requests, no duplicate ids,
chapter navigation, history <-> story navigation, lightbox (click, arrow keys, wrap-around, swipe, Esc).

Run against production: `BASE=https://varungawa.github.io/myblog/ node tests/verify.mjs`
Screenshots go to `tests/screenshots/` (git-ignored). Needs the `playwright` package and a Chromium.
`python3 tools/build_assets.py` regenerates `assets/history/*` and `assets/story/*` from the untouched originals in `assets/source/`.

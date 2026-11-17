#!/usr/bin/env python3
"""Import the ODC.ai app build (prototypes/odc-ai/dist from varungawa/ODC-icargofinsure-design) into the blog.

    python3 tools/import_odc_ai.py /path/to/prototypes/odc-ai/dist

1. Copies the build to /odc-ai/ (the app's own home: assets, sealed data, roadmap.html, pitch.html, sw.js).
2. Writes stories/odc-ai/index.src.html from the build's index.html, pointing every asset at {{ROOT}}odc-ai/,
   adding the site strip and the previous-stories cards, so build_site.py can pin it as the main story
   (or archive it under /history/odc-ai/ later) like any other story.
Then run: python3 tools/build_site.py
"""
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
dist = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else sys.exit(__doc__)
if not (dist / "index.html").exists():
    sys.exit(f"{dist}: no index.html (run npm run build first)")
for leak in ("private-data", "PASSPHRASE"):
    if any(leak in str(p) for p in dist.rglob("*")):
        sys.exit(f"refusing: {leak} found in the build")

app = ROOT / "odc-ai"
if app.exists():
    shutil.rmtree(app)
shutil.copytree(dist, app)

src = (dist / "index.html").read_text(encoding="utf-8")
src = re.sub(r'(src|href)="\./', r'\1="{{ROOT}}odc-ai/', src)
STRIP = (
    '<div class="blog-strip"><a href="{{HOME}}">VARUN / STORIES</a><span>'
    '<a href="#previous">Previous stories</a><a href="{{ROOT}}history/">History</a><a href="{{ROOT}}3ps/">3Ps</a>'
    '<a href="{{ROOT}}sutras/">Sutras</a><a href="{{ROOT}}odc-ai/pitch.html">Pitch</a></span></div>'
)
CSS = (
    "<style>.blog-strip{max-width:520px;margin:0 auto;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;"
    "background:#0a1a26;color:#cfe6ee;font:700 11px/1.2 system-ui,sans-serif;letter-spacing:.08em;padding:9px 16px}"
    ".blog-strip a{color:#f1b544;text-decoration:none}.blog-strip span{display:flex;gap:12px;flex-wrap:wrap}"
    ".blog-more{max-width:520px;margin:0 auto;padding:18px 14px calc(96px + env(safe-area-inset-bottom,0px));background:#f3f7fa;font-family:system-ui,sans-serif;color:#193245}"
    ".blog-more .sec{color:#102c42!important;font-size:22px!important}.blog-more .note a{color:#007d81}"
    ".blog-more .cards{display:grid;gap:14px;margin-top:10px}.blog-more .card{display:block;background:#fff;border:1px solid #d8e5eb;border-radius:14px;overflow:hidden;text-decoration:none;color:inherit}"
    ".blog-more .card img{display:block;width:100%;height:170px;object-fit:cover}.blog-more .card div{padding:14px}"
    ".blog-more .card h3{margin:4px 0;color:#102c42}.blog-more .card p{margin:0 0 8px;color:#4e6575;font-size:14px;line-height:1.5}"
    ".blog-more .tag{font:800 11px system-ui,sans-serif;letter-spacing:.08em;color:#007d81}.blog-more .button{font:700 13px system-ui,sans-serif;color:#007d81}</style>"
)
src = src.replace("</head>", CSS + "</head>", 1)
src = re.sub(r"(<body[^>]*>)", r"\1" + STRIP, src, count=1)
src = src.replace('<div id="root"></div>', '<div id="root"></div><div class="blog-more"><!--HISTORY_SECTION--></div>', 1)
if not src.lower().startswith("<!doctype html>"):
    sys.exit("build index.html must start with <!doctype html>")
out = ROOT / "stories" / "odc-ai"
out.mkdir(parents=True, exist_ok=True)
(out / "index.src.html").write_text(src, encoding="utf-8")
print("copied build to odc-ai/ and wrote stories/odc-ai/index.src.html")

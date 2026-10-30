"""Slice the three 2x3 collage sheets into 18 individual frames, build site images.

Sources live in assets/source/ (untouched originals). Outputs are written to
assets/history/ (18 frames), assets/story/ (cover + detail crops).
Run:  python3 tools/build_assets.py
"""
import json, os
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "source"
HIST = ROOT / "assets" / "history"
STORY = ROOT / "assets" / "story"
for d in (HIST, STORY):
    d.mkdir(parents=True, exist_ok=True)

FRAMES = [
    ("guardian-universe", "Millie — Guardian Universe"),
    ("guardian-mode", "Guardian Mode"),
    ("guardian-echo", "Guardian Echo"),
    ("the-den", "The Den"),
    ("white-cat-arrives", "White Cat Arrives"),
    ("two-observers", "Two Observers"),
    ("cushion-throne", "Cushion Throne"),
    ("rap-jodi-wonderland", "Rap Jodi in Wonderland"),
    ("kaise-bani-multiverse", "Kaise Bani Multiverse"),
    ("shiv-cosmos", "Shiv Cosmos"),
    ("cargo-rabbit-hole", "Cargo Rabbit-Hole"),
    ("atlantis-dwarka", "Atlantis + Dwarka"),
    ("quiet-luxury-with-the-pack", "Quiet Luxury With the Pack"),
    ("truths-boundaries-chennai", "Truths, Boundaries, Chennai"),
    ("door-safe-till-i-am-here", "Door Safe Till I Am Here"),
    ("protects-me-sits-with-me", "Protects Me / Sits With Me"),
    ("guardian-echo-ii", "Guardian Echo II"),
    ("framed-memory", "Framed Memory"),
]
SHEETS = ["sheet-1-frames-01-06.png", "sheet-2-frames-07-12.png", "sheet-3-frames-13-18.png"]


# Seam positions measured per sheet (gutter rows/cols differ between the three sheets).
SEAMS = {  # sheet -> (x seam, first y seam, second y seam)
    "sheet-1-frames-01-06.png": (512, 506, 991),
    "sheet-2-frames-07-12.png": (511, 479, 999),
    "sheet-3-frames-13-18.png": (512, 482, 946),
}


def cut(sheet, name):
    w, h = sheet.size
    x, y1, y2 = SEAMS[name]
    xs, ys, m = [0, x, w], [0, y1, y2, h], 4  # m = trim of seam/border pixels
    for r in range(3):
        for c in range(2):
            yield (xs[c] + (m if c else 0), ys[r] + (m if r else 0),
                   xs[c + 1] - (m if c == 0 else 0), ys[r + 1] - (m if r < 2 else 0))


manifest = []
i = 0
for name in SHEETS:
    sheet = Image.open(SRC / name).convert("RGB")
    for box in cut(sheet, name):
        slug, title = FRAMES[i]
        tile = sheet.crop(box)
        out = HIST / f"{i+1:02d}-{slug}.jpg"
        tile.save(out, "JPEG", quality=95, subsampling=0, optimize=True)
        manifest.append({"n": i + 1, "slug": slug, "title": title, "file": f"assets/history/{out.name}",
                         "w": tile.width, "h": tile.height, "bytes": out.stat().st_size})
        i += 1
assert i == 18

def save(src, dst, q=94):
    im = Image.open(SRC / src).convert("RGB")
    out = (HIST if dst.startswith("h-") else STORY) / dst[2:] if dst.startswith(("h-", "s-")) else STORY / dst
    im.save(out, "JPEG", quality=q, subsampling=0, optimize=True)
    manifest.append({"slug": dst, "file": str(out.relative_to(ROOT)), "w": im.width, "h": im.height, "bytes": out.stat().st_size})

save("mandi-cover.png", "s-mandi-cover.jpg", 95)
save("window-hero.png", "h-hero-window.jpg", 95)
save("dream-guardian.png", "h-dream-guardian.jpg", 95)
save("pets-sleeping.png", "h-pets-sleeping.jpg", 95)
save("door-watch.png", "h-door-watch.jpg", 95)

# Native-resolution detail crops of the cover plate (never displayed above native size).
cover = Image.open(SRC / "mandi-cover.png").convert("RGB")
CROPS = {  # chapter id: (left, top, right, bottom)
    "rice": (20, 55, 270, 560), "sugar": (250, 300, 490, 620), "tomato": (430, 290, 665, 560),
    "noor": (680, 300, 900, 570), "football": (890, 310, 1110, 720), "cricket": (1090, 280, 1400, 730),
    "hands": (0, 700, 1536, 1024), "uncertainty": (1100, 60, 1536, 400), "price": (350, 440, 1030, 720),
    "kaal": (600, 0, 1020, 340), "paradox": (1000, 0, 1210, 270),
}
for k, box in CROPS.items():
    c = cover.crop(box)
    out = STORY / f"detail-{k}.jpg"
    c.save(out, "JPEG", quality=95, subsampling=0, optimize=True)
    manifest.append({"slug": f"detail-{k}", "file": f"assets/story/{out.name}", "w": c.width, "h": c.height, "bytes": out.stat().st_size})

(ROOT / "assets" / "manifest.json").write_text(json.dumps(manifest, indent=1, ensure_ascii=False))
print(len(manifest), "files")

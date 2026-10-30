#!/usr/bin/env python3
"""Publish a new story: it becomes the main page and every previous main moves into the history.

    python3 tools/publish_story.py SLUG --title "Title" --tag "NOVEL • 13 CHAPTERS" --blurb "One sentence." \\
        --cover assets/story/SLUG-cover.jpg --cover-alt "What the cover shows" [--subtitle "..."] [--lang en] \\
        [--src path/to/page.src.html]

The page source uses {{ROOT}} and {{HOME}} (see tools/build_site.py). With --src it is copied to
stories/SLUG/index.src.html; otherwise that file must already exist. The new story gets seq = highest + 1,
which is all it takes to pin it. Then the site is rebuilt.

    python3 tools/publish_story.py SLUG --repin     pin an existing story again (gives it a new highest seq)
"""
import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STORIES = ROOT / "stories"


def highest_seq():
    seqs = [json.loads(p.read_text(encoding="utf-8"))["seq"] for p in STORIES.glob("*/story.json")]
    return max(seqs, default=0)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slug")
    ap.add_argument("--title")
    ap.add_argument("--subtitle", default="")
    ap.add_argument("--tag")
    ap.add_argument("--blurb")
    ap.add_argument("--cover")
    ap.add_argument("--cover-alt")
    ap.add_argument("--lang", default="en")
    ap.add_argument("--src")
    ap.add_argument("--repin", action="store_true")
    a = ap.parse_args()

    folder = STORIES / a.slug
    meta_path = folder / "story.json"

    if a.repin:
        if not meta_path.exists():
            sys.exit(f"no such story: {a.slug}")
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        meta["seq"] = highest_seq() + 1
    else:
        if meta_path.exists():
            sys.exit(f"{a.slug} already exists. Use --repin to pin it again, or pick a new slug.")
        need = {"title": a.title, "tag": a.tag, "blurb": a.blurb, "cover": a.cover, "cover-alt": a.cover_alt}
        missing = [k for k, v in need.items() if not v]
        if missing:
            sys.exit("missing: " + ", ".join("--" + k for k in missing))
        folder.mkdir(parents=True, exist_ok=True)
        if a.src:
            shutil.copyfile(a.src, folder / "index.src.html")
        if not (folder / "index.src.html").exists():
            sys.exit(f"{folder / 'index.src.html'} is missing; pass --src")
        if not (ROOT / a.cover).exists():
            sys.exit(f"cover {a.cover} does not exist")
        meta = {"seq": highest_seq() + 1, "title": a.title, "subtitle": a.subtitle, "tag": a.tag, "lang": a.lang,
                "blurb": a.blurb, "cover": a.cover, "cover_alt": a.cover_alt}

    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    subprocess.run([sys.executable, str(ROOT / "tools" / "build_site.py")], check=True)


if __name__ == "__main__":
    main()

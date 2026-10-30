# Varun's Stories

Live at https://varungawa.github.io/myblog/

## How stories are organised

- **Main page (`/`)**: the newest story, pinned.
- **History (`/history/`)**: a hub of cards, newest first. Every earlier story lives whole at `/history/<slug>/`.
- Each story is a folder in `stories/<slug>/` with `story.json` (metadata and `seq`) and `index.src.html` (the page; it uses `{{ROOT}}` and `{{HOME}}` for paths).
- The story with the highest `seq` is main. `tools/build_site.py` writes `index.html`, `history/index.html` and `history/<slug>/index.html`. Those files are generated: edit the sources, not them.

## Publishing a new story

```
python3 tools/publish_story.py my-new-story \
  --title "Title" --tag "NOVEL • 5 CHAPTERS" --blurb "One sentence." \
  --cover assets/story/my-new-story-cover.jpg --cover-alt "What the cover shows" \
  --src path/to/page.src.html
```

That gives the story the next `seq`, pins it as the main page and moves the previous main into the history as a card. Commit and push to `main`; the Pages workflow rebuilds and deploys.
`python3 tools/publish_story.py <slug> --repin` pins an older story again.

## Checks

`python3 tools/build_site.py --check` fails if the generated files are out of date. `node tests/verify.mjs` runs the browser checks (see `tests/README.md`).
`stories/cargothustra/cover-art.html` plus `node tools/render_cover.mjs cargothustra` and `python3 tools/build_site.py --covers` regenerate that story's cover.

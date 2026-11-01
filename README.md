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

## The interactive story (Thus Spake Cargothustra, "Choose Nanda's walk")

First person, as Nanda. Prose, then a hurdle, then a decision that changes the course. There are 14 endings. Nothing is scored or numbered on screen.

- `stories/cargothustra/story-data-1.js`, `-2.js`, `-3.js`: the passages. Each node has prose (paragraphs, or `{if, t}` for conditional ones), then choices, a single continue, a `route` (conditions pick the next node), a `chance` (weighted dice) or an `end`. Choices set flags, carry items and bend a hidden world (markets high or low, war or peace) that drifts as a Markov chain between chapters, tilted by how gentle or harsh you have been. The reader only sees what it does to the prose.
- `story-engine.js`: pure engine (node and browser). `story-ui.js`: the reading page, with go-back, start again, and a tracker of endings found (kept in the browser).
- The outline's chapter cards have a "Read chapter N as an interactive story" button, and each chapter heading in the story links back to the outline.
- To add a passage, add a node to a data file and link to it. `node tests/story.test.mjs` checks every link, flag and item, that every passage and every ending can be reached, and that no reader can get stuck.

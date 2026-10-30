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

## The game (Thus Spake Cargothustra, "Play the walk")

`stories/cargothustra/game-data.js` (levels S01 to S10, calls, the 13 C meters, the Markov matrices), `game-engine.js` (pure engine, seeded, runs in the browser and node) and `game-ui.js` (the page). Three Markov chains move each turn: position S01..S10, regime (markets high/low x war/peace) and weather. All numbers are play-testing placeholders; tune them in `game-data.js`.
`node tests/game.test.mjs` checks the data, the chains, determinism and the balance (random play should win rarely, careful play often, chasing speed should collapse more).

### Cards, ports and links

- The player's calls fill a **bond hand** (Commerce, Commodity, Consignor, Consignee, Carriage, Carrier; cover and heat) that is weighed against the **port of loading and discharge** of each level (scrutiny, palm, heat; placeholder ratings). The margin nudges the chance of moving forward.
- **One-time cards** (Letter of Credit, the Katta chit, Gora's ledger page, Open Sesame, Forty Jars) are earned by calls and spent when played, one per turn.
- **Morgiana** is dealt face down from S06. Play her to audit (costs time), play her again to warn her, or leave her: face down at S08, sending the hull flips her.
- The outline's chapter cards have a "Play level" button, and each game level links back to its chapters. `#walk=SEED@LEVEL~approach.call.card` replays or shares a walk.

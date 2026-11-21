# makefun-auto-best-spot-the-difference-game-20261121-0451-entri

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/rioxbt/makefun-auto-best-spot-the-difference-game-20261121-0451-entri/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/rioxbt/makefun-auto-best-spot-the-difference-game-20261121-0451-entri/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Twice Upon a Time — a spot-the-difference game played with keyboard and mouse in desktop Chrome.
Two nearly identical pictures stand side by side; click a difference in either one to mark it and the
mark lands on both. Five original drawn scenes (Sunny Meadow, Coral Cove, Rocket Ridge, Moonlit Town,
Castaway Cove) hide 5 to 9 differences each, 35 in all, and each scene asks for a longer hunt than the
last. There is a clock you can feel, a hint that glows where you are already looking and costs you
seconds, a streak that rewards a clean run, and sound made with the Web Audio API rather than an audio
file. The game is plain ES modules under `game/`: no build step, no vendored library, no image or sound
file, and not one network request — every pixel and every note comes from the code in this repository.

The two pictures are identical by construction, not by eye. Each panel is painted once into an offscreen
canvas at the origin and blitted into both, so nothing is shifted by a fraction of a pixel, and
`game/src/audit.js` reads the painted frame back to prove it: across 240 audited frames (5 scenes x 16
seeds x 3 mark configurations) exactly 0 pixels differ outside the declared difference boxes, and every
declared difference changes at least 123 pixels. Run it yourself with `?shot=play&scene=1&seed=6` and
call `window.__spot.audit()`.

## Run it

```sh
node serve.ts            # serves game/ on http://localhost:8080
```

Then open http://localhost:8080 in desktop Chrome. `node serve.ts --port 8123` uses another port.

To write the hand-in the way the grader reads it:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## What is here

    game/                 the playable game: index.html plus ES modules under src/
      src/scenes/         one file per scene: its backdrop and the objects it places
      src/audit.js        the pixel self-check the screenshots were verified with
    screenshots/          three renders of the game, the first by name being the cover
    shots.json            the exact address each screenshot was staged with
    main.ts               the entrypoint: copies game/ and screenshots/ to /output, writes dossier.json
    serve.ts              a development-only static server for game/
    vendor/               make.fun's buildDossier library, the kit's copy, unchanged

## License

MIT (see LICENSE).

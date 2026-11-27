[![make.fun competition](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/c/turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/heruruben-hub/turkey-run-game-20261127/rank.svg)](https://make.fun/c/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/heruruben-hub/turkey-run-game-20261127/reward.svg)](https://make.fun/c/turkey-run-game-01)

# Gobble Dash — A Turkey's Great Escape

Thanksgiving is coming. Farmer Bram has the oven hot and the carving knife
sharpened. You are Tom the turkey, and you are not dinner — not today.

**Gobble Dash** is an original endless-runner escape game for
[make.fun's turkey escape game competition](https://make.fun/c/turkey-run-game-01).
It runs entirely offline in a desktop browser from its own static files: no
network requests, no libraries, all art drawn in code and all sounds
synthesised live with WebAudio.

## How to play

- **↑ / Space / click** — jump (press again mid-air for a double jump)
- **↓** — slide under the hanging pans
- **P** — pause, **M** — mute, **R** — run again after the end

Run from the farmyard, through the barn, into the kitchen — 1000 m to the
woods. Jump the fences, hay bales and carving knives, double-jump the ovens,
slide under the pans, and grab corn (and the odd golden drumstick) for points.
Every stumble costs a life and lets Farmer Bram close in; three stumbles and
he catches you. Reach the woods and you escape.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Layout

- `game/` — the game itself, plain Canvas 2D JavaScript in one module per job:
  `config.js` (tuning and stages), `art.js` (all drawn sprites), `world.js`
  (parallax farm-to-kitchen scenery), `entities.js` (obstacles and snacks),
  `audio.js` (synth sounds and music), `input.js` (keyboard and mouse),
  `game.js` (states, physics, the farmer's chase, HUD and screens),
  `main.js` (bootstrap and screenshot staging)
- `screenshots/` — title, mid-run and end screens, rendered by the game itself
- `main.ts` — the make.fun hand-in program (Node 22, standard library only)
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

## License

MIT — see [LICENSE](LICENSE).

// Gobble Dash — bootstrap: wire the canvas, run the frame loop, and stage
// deterministic scenes for screenshots (?shot=start|play|end&seed=N).
// A shot scene is the real game stepped forward, never a faked frame.

import { Game } from './game.js';

const canvas = document.getElementById('game');
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') || 1);

const game = new Game(canvas, shot);
window.__gobbleDash = game; // for play-testing from the console

if (shot === 'start') {
  // Title screen, frozen for the cover shot.
  game.render();
} else if (shot === 'play') {
  // A real mid-run: start, then play ~4.4 seconds with scripted jumps,
  // Bram close behind, turkey mid-air over the first hay bale.
  game.startRun(seed);
  game.sound.muted = true;
  for (let i = 0; i < 262; i++) {
    if (i === 120 || i === 235) game.jump();
    game.step(1 / 60);
    if (game.state !== 'playing') break;
  }
  game.farmerX = 70; // Bram just lunged after a near-miss: the chase reads
  game.farmerMood = 'close';
  game.render();
} else if (shot === 'end') {
  // A real caught ending: start, never jump, let Bram catch Tom.
  game.startRun(seed);
  game.sound.muted = true;
  for (let i = 0; i < 60 * 40; i++) {
    game.step(1 / 60);
    if (game.state === 'caught' || game.state === 'escaped') break;
  }
  game.render();
} else {
  // Normal play.
  let last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    game.frame(dt);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

// Boot. One job: wire the canvas to the game, run the loop, and — when the address asks for a
// staged shot or the self-audit — put the game in that state instead and stand still.
import { createInput } from './input.js';
import { createRenderer } from './renderer.js';
import { createGame } from './game.js';
import { audio } from './audio.js';
import { readShotParams, shotSummary, stageShot } from './shots.js';
import { auditPanels } from './audit.js';

const canvas = document.getElementById('stage');
const status = document.getElementById('status');
const params = new URLSearchParams(window.location.search);
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : null;

const input = createInput(canvas);
const renderer = createRenderer(canvas);
const game = createGame({
  input,
  renderer,
  audio,
  seed,
  announce: (message) => { status.textContent = message; },
});

// The hooks the entry's own screenshots and checks are driven through.
window.__spot = {
  game,
  state: game.state,
  summary: () => shotSummary(game.state),
  audit: () => auditPanels(canvas, game.state.level, game.state.found, game.state.screen),
  snapshot: (quality = 0.88) => canvas.toDataURL('image/jpeg', quality),
  stage: (search) => {
    stageShot(game, readShotParams(search));
    renderer.draw(game.state);
    return shotSummary(game.state);
  },
};

const shot = params.get('shot');
if (shot) {
  stageShot(game, readShotParams());
  let painted = 0;
  const paint = () => {
    renderer.draw(game.state);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  };
  requestAnimationFrame(paint);
} else {
  canvas.addEventListener('pointerdown', () => audio.resume());
  window.addEventListener('keydown', () => audio.resume());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.state.screen === 'play') game.state.screen = 'paused';
  });
  let last = performance.now();
  const frame = (now) => {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    game.update(dt, now);
    game.render();
  };
  requestAnimationFrame(frame);
}

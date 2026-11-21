// Staged states for the entry's screenshots. One job: read ?shot=… from the address and put the
// game in that exact state, so a picture of the game is reproducible and shows a real play frame.
import { LEVELS } from './config.js';
import { sideOf } from './scene.js';

export function readShotParams(search = window.location.search) {
  const params = new URLSearchParams(search);
  const num = (name, fallback) => {
    const value = Number.parseInt(params.get(name) ?? '', 10);
    return Number.isInteger(value) ? value : fallback;
  };
  return {
    shot: params.get('shot') ?? '',
    scene: num('scene', 0),
    seed: num('seed', null),
    found: (params.get('found') ?? '').split(',').map((v) => Number.parseInt(v, 10)).filter((v) => Number.isInteger(v)),
    time: num('time', 0),
    score: num('score', 0),
    best: num('best', 0),
    hints: num('hints', 3),
    now: num('now', 0),
    aim: params.get('aim') !== 'off',
  };
}

export function stageShot(game, spec) {
  const state = game.state;
  game.startScene(spec.scene, spec.seed);
  state.now = spec.now;
  const diffs = state.level.diffs;

  spec.found.forEach((index, order) => {
    const diff = diffs[index];
    if (!diff) return;
    state.found.add(diff);
    diff.foundAt = order === spec.found.length - 1 ? -spec.now - 240 : -spec.now - 3000;
  });
  state.lastFound = spec.found.length ? spec.found[spec.found.length - 1] : -1;
  state.hints = spec.hints;
  // A staged frame must not depend on what this browser remembers: the best score is set, never read.
  state.best = spec.best;
  state.score = spec.score || state.found.size * 120;
  state.streak = spec.found.length;
  state.bestStreak = Math.max(state.bestStreak, spec.streak ?? spec.found.length);
  if (spec.time > 0) state.timeLeft = spec.time;
  state.level.seconds = spec.time > 0 ? Math.max(state.level.seconds, spec.time) : state.level.seconds;
  state.timeTotal = state.level.seconds;
  state.levelIndex = spec.scene;

  // Aim at the first difference the picture still has to find, so the crosshair shows the hunt.
  const target = diffs.find((diff) => !state.found.has(diff)) ?? diffs[0];
  if (target) {
    state.crosshair.x = target.center.x - 26;
    state.crosshair.y = target.center.y + 22;
    state.crosshair.visible = spec.aim;
  }
  state.hint = null;

  if (spec.shot === 'clear') {
    state.screen = 'cleared';
    state.lastBonus = Math.floor(Math.max(0, state.timeLeft)) * 4;
    state.cleared = Array.from({ length: spec.scene }, (_, i) => i);
  } else if (spec.shot === 'timeout') {
    state.screen = 'timeout';
  } else if (spec.shot === 'title') {
    state.screen = 'title';
  } else if (spec.shot === 'finale') {
    state.screen = 'finale';
    state.cleared = LEVELS.map((_, i) => i);
  } else {
    state.screen = 'play';
  }
  return state;
}

export function shotSummary(state) {
  return {
    scene: state.level.scene.id,
    sceneIndex: state.level.index,
    screen: state.screen,
    found: state.found.size,
    toFind: state.level.diffs.length - state.found.size,
    differences: state.level.diffs.map((diff) => ({ kind: diff.kind, x: Math.round(diff.center.x), y: Math.round(diff.center.y), r: diff.r, shownIn: sideOf(diff) })),
  };
}

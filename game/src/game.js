// The rules of play. One job: hold the state of a run — which scene is open, what has been found,
// what the clock has left — and move it when the player marks, hints, pauses or continues.
import { LEVELS, RULES } from './config.js';
import { buildLevel } from './scene.js';

const BEST_KEY = 'twice-upon-a-time.best';

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (a private window): the best score then lasts this visit only.
  }
}

export function createGame({ input, renderer, audio, announce = () => {}, seed = null }) {
  const runSeed = seed ?? Math.floor(Math.random() * 4294967296);
  const state = {
    screen: 'title',
    level: buildLevel(0, runSeed),
    levelIndex: 0,
    found: new Set(),
    misses: [],
    hint: null,
    lastFound: -1,
    lastBonus: 0,
    score: 0,
    hints: RULES.hintsPerScene,
    streak: 0,
    bestStreak: 0,
    cleared: [],
    best: readBest(),
    timeLeft: 0,
    timeTotal: 1,
    now: 0,
    crosshair: input.crosshair,
    runSeed,
  };

  function startScene(index, seedOverride = null) {
    if (Number.isInteger(seedOverride)) state.runSeed = seedOverride;
    state.levelIndex = Math.max(0, Math.min(LEVELS.length - 1, index));
    state.level = buildLevel(state.levelIndex, state.runSeed);
    state.level.diffs.forEach((diff) => { diff.foundAt = 0; });
    state.found = new Set();
    state.misses = [];
    state.hint = null;
    state.lastFound = -1;
    state.lastBonus = 0;
    state.hints = RULES.hintsPerScene;
    state.streak = 0;
    state.timeTotal = state.level.seconds;
    state.timeLeft = state.level.seconds;
    state.screen = 'play';
    announce(`Scene ${state.levelIndex + 1}, ${state.level.name}. ${state.level.diffs.length} differences to find.`);
  }

  function resetRun() {
    state.score = 0;
    state.bestStreak = 0;
    state.cleared = [];
  }

  function nearestUnfound(x, y) {
    let best = null;
    let bestDist = Infinity;
    for (const diff of state.level.diffs) {
      if (state.found.has(diff)) continue;
      const d = Math.hypot(diff.center.x - x, diff.center.y - y);
      const reach = diff.r + 10;
      if (d <= reach && d < bestDist) {
        bestDist = d;
        best = diff;
      }
    }
    return best;
  }

  function clearScene() {
    state.lastBonus = Math.floor(Math.max(0, state.timeLeft)) * RULES.timeBonusPerSec;
    state.score += state.lastBonus;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    if (!state.cleared.includes(state.levelIndex)) state.cleared.push(state.levelIndex);
    state.screen = 'cleared';
    audio.clear();
    announce(`Scene cleared. Bonus ${state.lastBonus}. Score ${state.score}.`);
  }

  function found(diff) {
    state.found.add(diff);
    diff.foundAt = state.now;
    state.streak += 1;
    state.score += RULES.findScore + (state.streak - 1) * RULES.streakBonus;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.lastFound = diff.slot;
    audio.found(state.streak);
    const left = state.level.diffs.length - state.found.size;
    announce(left === 0 ? 'Last difference found.' : `Found. ${left} to go.`);
    if (state.found.size === state.level.diffs.length) clearScene();
  }

  function miss(side, x, y) {
    state.timeLeft -= RULES.missPenaltySec;
    state.streak = 0;
    state.misses.push({ side, x, y, at: state.now });
    state.misses = state.misses.filter((m) => state.now - m.at < RULES.missRingMs + 120);
    audio.miss();
    if (state.timeLeft <= 0) endByTime();
  }

  function endByTime() {
    state.timeLeft = 0;
    state.screen = 'timeout';
    audio.timeout();
    if (state.score > state.best) {
      state.best = state.score;
      saveBest(state.best);
    }
    announce(`Out of time. You found ${state.found.size} of ${state.level.diffs.length}.`);
  }

  function useHint() {
    if (state.screen !== 'play' || state.hints <= 0) return;
    const unfound = state.level.diffs.filter((diff) => !state.found.has(diff));
    if (!unfound.length) return;
    let target = unfound[0];
    let bestDist = Infinity;
    for (const diff of unfound) {
      const d = Math.hypot(diff.center.x - state.crosshair.x, diff.center.y - state.crosshair.y);
      if (d < bestDist) {
        bestDist = d;
        target = diff;
      }
    }
    state.hint = { diff: target, until: state.now + RULES.hintRingMs };
    state.hints -= 1;
    state.score = Math.max(0, state.score - RULES.hintCostScore);
    state.timeLeft -= RULES.hintPenaltySec;
    audio.hint();
    announce(`Hint: look near the marked circle. ${state.hints} hints left.`);
    if (state.timeLeft <= 0) endByTime();
  }

  function advance() {
    if (state.screen === 'title') {
      resetRun();
      startScene(0);
    } else if (state.screen === 'paused') {
      state.screen = 'play';
    } else if (state.screen === 'cleared') {
      if (state.levelIndex + 1 < LEVELS.length) startScene(state.levelIndex + 1);
      else {
        state.screen = 'finale';
        if (state.score > state.best) {
          state.best = state.score;
          saveBest(state.best);
        }
      }
    } else if (state.screen === 'timeout') {
      startScene(state.levelIndex);
    } else if (state.screen === 'finale') {
      resetRun();
      startScene(0);
    }
  }

  function handleMark(hit) {
    if (!hit) return;
    const already = state.level.diffs.some(
      (diff) => state.found.has(diff) && Math.hypot(diff.center.x - hit.x, diff.center.y - hit.y) <= diff.r + 10,
    );
    if (already) return;
    const target = nearestUnfound(hit.x, hit.y);
    if (target) found(target);
    else miss(hit.side, hit.x, hit.y);
  }

  let lastTickSecond = null;

  return {
    state,
    startScene,
    resetRun,
    update(dt, now) {
      state.now = now;
      for (const item of input.take()) {
        if (item.type === 'key') {
          if (item.action === 'confirm' || item.action === 'next') advance();
          else if (item.action === 'hint') useHint();
          else if (item.action === 'pause') {
            if (state.screen === 'play') {
              state.screen = 'paused';
              announce('Paused.');
            } else if (state.screen === 'paused') {
              state.screen = 'play';
              announce('Playing.');
            }
          } else if (item.action === 'mute') {
            audio.toggle();
          } else if (item.action === 'restart') {
            resetRun();
            startScene(0);
          }
        } else if (item.type === 'mark') {
          if (state.screen === 'play') handleMark(item.hit);
          else advance();
        }
      }

      if (state.screen === 'play') {
        input.moveCrosshair(dt);
        state.timeLeft -= dt;
        const second = Math.ceil(state.timeLeft);
        if (state.timeLeft <= 5 && second >= 0 && second !== lastTickSecond) {
          lastTickSecond = second;
          audio.tick();
        }
        state.misses = state.misses.filter((m) => state.now - m.at < RULES.missRingMs + 120);
        if (state.timeLeft <= 0) endByTime();
      }
    },
    render() {
      renderer.draw(state);
    },
  };
}

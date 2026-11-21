// Builds one level's two panels. One job: from a scene and a seed, lay the same scene out twice,
// pick which objects differ, mutate them in the right-hand copy, and hand back the difference
// list the marker, the hit test and the self-audit all read.
import { LEVELS, RULES, WORLD } from './config.js';
import { createRandom } from './random.js';
import { sceneById } from './scenes/index.js';
import { makeProp } from './props.js';
import { applyMutation, extraPlanFor, isApplicable, weightTable } from './differences.js';

// The clickable marker radius of a difference, and the wider box the self-audit compares.
export const MARKER_R = 29;

// Every object that may hide a difference: inside the edge margin, so a click on it lands on the
// panel and not near the rim.
function candidateOrder(base, rng) {
  return rng.shuffle(base.map((_, i) => i)).filter((i) => {
    const prop = base[i];
    return prop.x >= RULES.edgeMargin && prop.x <= WORLD - RULES.edgeMargin
      && prop.y >= 30 && prop.y <= WORLD - 34;
  });
}

// Spread the wanted differences out, relaxing the spacing only as far as it must to fit them all.
function spaceOut(order, base, wanted, rng) {
  const chosen = [];
  for (const gap of [RULES.minDiffGap, RULES.minDiffGap - 16, RULES.minDiffGap - 30, RULES.minDiffGap - 44]) {
    for (const index of order) {
      if (chosen.length >= wanted) return chosen;
      if (chosen.some((c) => c.index === index)) continue;
      const prop = base[index];
      if (chosen.some((c) => Math.hypot(c.center.x - prop.x, c.center.y - prop.y) < gap)) continue;
      chosen.push({ index, center: { x: prop.x, y: prop.y } });
    }
  }
  return chosen;
}

// A quiet empty spot for an object the other panel does not have.
function freeSpot(plan, base, diffs, rng) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const x = rng.range(66, WORLD - 66);
    const y = rng.range(plan.band[0], plan.band[1]);
    if (base.some((p) => Math.hypot(p.x - x, p.y - y) < 70)) continue;
    if (diffs.some((d) => Math.hypot(d.center.x - x, d.center.y - y) < RULES.minDiffGap - 12)) continue;
    return { x, y };
  }
  return null;
}

export function levelPlan(levelIndex) {
  const level = LEVELS[Math.min(levelIndex, LEVELS.length - 1)];
  return { ...level, name: sceneById(level.scene).name, index: levelIndex };
}

export function buildLevel(levelIndex, seed) {
  const plan = levelPlan(levelIndex);
  const scene = sceneById(plan.scene);
  const rng = createRandom((seed + levelIndex * 7919) >>> 0);
  const base = scene.props().map((p, i) => ({
    ...p,
    index: i,
    seed: p.seed === 1 ? 1000 + i * 37 : p.seed,
  }));

  const right = base.map((p) => ({ ...p }));
  const weights = weightTable(levelIndex);
  const order = candidateOrder(base, rng);
  const slots = spaceOut(order, base, plan.count, rng);
  const diffs = [];
  const used = new Set();
  const blocked = new Map();

  // One difference on one object. A mutation that cannot be made here — an object added where no
  // spot is free — is not lost: the kind is set aside and the next attempt uses another, so a
  // scene always ends up hiding exactly the differences its level asks for.
  function tryOne(index) {
    const prop = base[index];
    const failed = blocked.get(index) ?? new Set();
    const allowed = weights.filter((w) => isApplicable(w.kind, prop) && !failed.has(w.kind));
    if (!allowed.length) return false;
    const chosen = rng.weighted(allowed);
    failed.add(chosen.kind);
    blocked.set(index, failed);
    const result = applyMutation(chosen.kind, prop, right[index], levelIndex, rng, plan.scene);
    if (!result) return false;

    if (result.extra) {
      const extraPlan = extraPlanFor(plan.scene);
      const spot = freeSpot(extraPlan, base, diffs, rng);
      if (!spot) return false;
      const extra = makeProp(rng.pick(extraPlan.kinds), spot.x, spot.y, {
        s: rng.range(0.85, 1.15),
        seed: 700 + diffs.length * 53,
      });
      right.push(extra);
      diffs.push({
        index: right.length - 1,
        kind: 'appeared',
        center: spot,
        r: extra.r,
        boxR: extra.r * 1.4 + 34,
        axis: 'right',
      });
      return true;
    }

    const mutated = right[index];
    const scale = Math.max(prop.s, mutated.gone ? prop.s : mutated.s);
    diffs.push({
      index,
      kind: chosen.kind,
      center: result.center,
      r: result.r,
      boxR: Math.min(160, result.r * scale + 34),
      axis: 'both',
    });
    return true;
  }

  for (const slot of slots) {
    if (diffs.length >= plan.count) break;
    for (let attempt = 0; attempt < 6 && !used.has(slot.index); attempt += 1) {
      if (tryOne(slot.index)) used.add(slot.index);
    }
  }
  // If the spaced slots came short, any remaining object may take the difference.
  for (const index of order) {
    if (diffs.length >= plan.count) break;
    if (used.has(index)) continue;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      if (tryOne(index)) {
        used.add(index);
        break;
      }
    }
  }

  // Each difference gets a slot: its own position in this level's list, which is what the hint,
  // the last-found highlight and the screenshot stager address it by.
  diffs.forEach((diff, slot) => { diff.slot = slot; });

  return {
    ...plan,
    scene,
    seed,
    base,
    right,
    diffs,
  };
}

// Where a difference shows: both panels for a mutated object, the right one only for an object
// the other panel does not have.
export function sideOf(diff) {
  return diff.axis === 'right' ? 'right' : 'both';
}

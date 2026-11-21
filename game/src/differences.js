// How a difference is made. One job: the kinds of change the right-hand panel may hide, which
// props each kind may touch, how strongly it tells at a given level, and the colour ring that
// makes a recolour either bold (scene one) or close (scene five).
import { CATALOG, EXTRA_KINDS, FLIPPABLE, TILTABLE, VARIED, TWO_TONE, makeProp } from './props.js';
import { hexToRgb } from './draw.js';

// Twelve hues in a ring, ordered so a step of one is a near colour and a step of four a bold one.
export const COLOR_RING = [
  '#e8503a', '#fb923c', '#ffd166', '#a3e635', '#34d399', '#22d3ee',
  '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#ff7fa8', '#f97316',
];

function nearestRingIndex(color) {
  const [r, g, b] = hexToRgb(color);
  let best = 0;
  let bestDist = Infinity;
  COLOR_RING.forEach((hex, i) => {
    const [r2, g2, b2] = hexToRgb(hex);
    const dist = (r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  });
  return best;
}

function colorDistance(a, b) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

// How bold a recolour is per level: the first scenes swap a hue outright, the last ones nudge it.
const RECOLOR_STEP = [4, 3, 3, 2, 2];
const SHIFT_PX = [24, 22, 18, 16, 15];
const TILT_RAD = [0.44, 0.4, 0.34, 0.3, 0.28];
const SCALE_UP = [1.34, 1.3, 1.26, 1.24, 1.22];
const SCALE_DOWN = [0.74, 0.76, 0.79, 0.8, 0.82];

// Which mutations a level prefers. Earlier scenes lean on the plain ones (a thing gone, an extra
// thing, a bold recolour); later scenes lean on the quiet ones (a nudge, a tilt, a near colour).
const WEIGHTS = [
  { vanish: 4, add: 3, recolor: 3, variant: 2, rescale: 1.5, flip: 1.2, tilt: 1, shift: 0.7, swap: 1 },
  { vanish: 3, add: 2.6, recolor: 3, variant: 2.4, rescale: 1.6, flip: 1.3, tilt: 1.2, shift: 1, swap: 1.2 },
  { vanish: 2.2, add: 2, recolor: 2.8, variant: 2.4, rescale: 1.9, flip: 1.6, tilt: 1.5, shift: 1.4, swap: 1.4 },
  { vanish: 1.5, add: 1.4, recolor: 2.5, variant: 2.3, rescale: 2.1, flip: 1.8, tilt: 1.8, shift: 1.8, swap: 1.6 },
  { vanish: 1.1, add: 1.1, recolor: 2.3, variant: 2.1, rescale: 2.1, flip: 1.9, tilt: 2, shift: 2, swap: 1.8 },
];

// The quiet object a scene may gain, and the band of the panel it may appear in.
const SCENE_EXTRAS = {
  meadow: { kinds: ['flower', 'mushroom', 'grass', 'butterfly'], band: [430, 568] },
  reef: { kinds: ['bubble', 'shell', 'starfish', 'fish'], band: [150, 556] },
  space: { kinds: ['star', 'asteroid'], band: [50, 550] },
  town: { kinds: ['star', 'bush', 'rock'], band: [80, 550] },
  beach: { kinds: ['shell', 'starfish', 'grass', 'gull'], band: [140, 566] },
};

export function extraPlanFor(sceneId) {
  const plan = SCENE_EXTRAS[sceneId];
  if (!plan) return { kinds: EXTRA_KINDS, band: [60, 540] };
  return plan;
}

export function isApplicable(kind, prop) {
  switch (kind) {
    case 'variant': return VARIED.has(prop.kind);
    case 'flip': return FLIPPABLE.has(prop.kind);
    case 'tilt': return TILTABLE.has(prop.kind);
    case 'swap': return TWO_TONE.has(prop.kind);
    default: return true; // vanish, add, recolor, rescale, shift fit any prop
  }
}

export function weightTable(levelIndex) {
  const weights = WEIGHTS[Math.min(levelIndex, WEIGHTS.length - 1)];
  return Object.entries(weights).map(([kind, weight]) => ({ kind, weight }));
}

// A recolour that is actually visible: step around the ring until the two colours are far apart.
export function recolorValue(color, levelIndex, rng) {
  const from = nearestRingIndex(color);
  let step = RECOLOR_STEP[Math.min(levelIndex, RECOLOR_STEP.length - 1)];
  if (rng.chance(0.35)) step += 1;
  const dir = rng.chance(0.5) ? 1 : -1;
  let candidate = COLOR_RING[(from + dir * step + COLOR_RING.length) % COLOR_RING.length];
  let guard = 0;
  while (colorDistance(candidate, color) < 90 && guard < 6) {
    candidate = COLOR_RING[(from + dir * (step + 1 + guard) + COLOR_RING.length) % COLOR_RING.length];
    guard += 1;
  }
  return candidate;
}

// Apply one difference to a copy of a prop. Returns the marker centre and radius, or null when
// the mutation cannot be made on this prop.
export function applyMutation(kind, baseProp, rightProp, levelIndex, rng, sceneId) {
  const level = Math.min(levelIndex, 4);
  switch (kind) {
    case 'vanish':
      rightProp.gone = true;
      return { center: { x: baseProp.x, y: baseProp.y }, r: baseProp.r };
    case 'recolor': {
      const next = recolorValue(baseProp.c, level, rng);
      rightProp.c = next;
      if (colorDistance(next, baseProp.c2) < 60) rightProp.c2 = baseProp.c;
      return { center: { x: baseProp.x, y: baseProp.y }, r: baseProp.r };
    }
    case 'swap': {
      rightProp.c = baseProp.c2;
      rightProp.c2 = baseProp.c;
      return { center: { x: baseProp.x, y: baseProp.y }, r: baseProp.r };
    }
    case 'rescale': {
      rightProp.s = baseProp.s * (rng.chance(0.5) ? SCALE_UP[level] : SCALE_DOWN[level]);
      return { center: { x: baseProp.x, y: baseProp.y }, r: baseProp.r };
    }
    case 'variant':
      rightProp.variant = baseProp.variant ? 0 : 1;
      return { center: { x: baseProp.x, y: baseProp.y }, r: baseProp.r };
    case 'flip':
      rightProp.flip = !baseProp.flip;
      return { center: { x: baseProp.x, y: baseProp.y }, r: baseProp.r };
    case 'tilt': {
      rightProp.rot = (rng.chance(0.5) ? 1 : -1) * TILT_RAD[level];
      return { center: { x: baseProp.x, y: baseProp.y }, r: baseProp.r };
    }
    case 'shift': {
      const away = SHIFT_PX[level];
      const angle = rng.range(0, Math.PI * 2);
      rightProp.x = baseProp.x + Math.cos(angle) * away;
      rightProp.y = baseProp.y + Math.sin(angle) * away * 0.7;
      return {
        center: { x: (baseProp.x + rightProp.x) / 2, y: (baseProp.y + rightProp.y) / 2 },
        r: baseProp.r,
      };
    }
    case 'add': {
      const plan = extraPlanFor(sceneId);
      return { extra: true, plan, r: CATALOG[rng.pick(plan.kinds)].r };
    }
    default:
      return null;
  }
}

export function makeExtraProp(plan, x, y, seed) {
  const kind = plan.kinds[Math.floor(Math.random() * plan.kinds.length)];
  return makeProp(kind, x, y, { s: 0.9 + Math.random() * 0.25, seed });
}

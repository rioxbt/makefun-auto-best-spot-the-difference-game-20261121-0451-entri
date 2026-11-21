// Everything the player sees. One job: paint one frame of the game — the frame and its chips,
// the two panels with their marked differences, the hint, the misses, and any card on top.
//
// Each panel's scene is painted once into an offscreen canvas at the origin and then blitted into
// both panels, and the marks that belong on both pictures are painted into a third offscreen
// canvas and blitted into both. Two pictures built from the same pixels stay identical except
// where a difference is hidden: nothing shifts them by a fraction of a pixel.
import { HEADER_H, LEVELS, PANEL, RULES, UI, VIEW } from './config.js';
import { createRandom } from './random.js';
import { drawProp } from './props.js';
import { MARKER_R } from './scene.js';
import { sideOf } from './scene.js';
import {
  circle, fillRoundRect, label, linear, radial, ring, roundRect, strokeRoundRect, withAlpha,
} from './draw.js';

const PANEL_TOP = PANEL.y;

function formatClock(seconds) {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function offscreen() {
  const canvas = document.createElement('canvas');
  canvas.width = PANEL.size;
  canvas.height = PANEL.size;
  return canvas;
}

function drawBackdrop(ctx) {
  ctx.fillStyle = linear(ctx, 0, 0, 0, VIEW.h, [
    [0, '#141b30'],
    [0.5, '#0d1224'],
    [1, '#080c18'],
  ]);
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, VIEW.w - 3, VIEW.h - 3);
}

// A chip: a small label over a value, laid out from the right edge so the headline stays put.
function drawChip(ctx, xRight, y, h, spec, width) {
  const x = xRight - width;
  fillRoundRect(ctx, x, y, width, h, 12, UI.chip);
  strokeRoundRect(ctx, x, y, width, h, 12, 1.4, UI.chipEdge);
  label(ctx, spec.label, x + 13, y + 16, { font: UI.fontTiny, color: UI.inkDim });
  label(ctx, spec.value, x + 13, y + h - 11, {
    font: spec.big
      ? '800 30px system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      : '800 19px system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: spec.accent ?? UI.ink,
  });
}

function drawHeader(ctx, state) {
  ctx.fillStyle = linear(ctx, 0, 0, 0, HEADER_H, [
    [0, '#1a2340'],
    [1, '#111830'],
  ]);
  ctx.fillRect(0, 0, VIEW.w, HEADER_H);
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, HEADER_H - 0.75);
  ctx.lineTo(VIEW.w, HEADER_H - 0.75);
  ctx.stroke();

  label(ctx, 'TWICE UPON A TIME', 40, 40, { font: UI.font, color: UI.ink });
  label(ctx, 'spot the difference — find every change between the two pictures', 40, 62, {
    font: UI.fontSmall,
    color: UI.inkDim,
  });

  const total = state.level.diffs.length;
  const found = state.found.size;
  const left = total - found;
  const urgent = state.timeLeft <= 20;

  const chips = [
    { label: `SCENE ${state.level.index + 1} OF ${LEVELS.length}`, value: state.level.name.toUpperCase() },
    { label: 'FOUND', value: `${found} of ${total}` },
    { label: 'LEFT TO FIND', value: `${left}`, big: true, accent: UI.accent },
    { label: 'TIME', value: formatClock(state.timeLeft), accent: urgent ? UI.bad : UI.ink },
    { label: 'HINTS', value: `${state.hints}` },
    { label: 'SCORE', value: `${state.score}` },
  ];

  const gap = 10;
  const widths = chips.map((spec) => {
    ctx.font = spec.big ? '800 30px system-ui, sans-serif' : '800 19px system-ui, sans-serif';
    const valueWidth = ctx.measureText(spec.value).width;
    ctx.font = UI.fontTiny;
    const labelWidth = ctx.measureText(spec.label).width;
    return Math.max(88, Math.round(Math.max(valueWidth, labelWidth) + 26));
  });
  let cursor = VIEW.w - 40;
  chips.forEach((spec, i) => {
    drawChip(ctx, cursor, 12, 52, spec, widths[i]);
    cursor -= widths[i] + gap;
  });

  // The time bar: the pressure the player feels in the frame.
  const frac = Math.max(0, Math.min(1, state.timeLeft / Math.max(1, state.timeTotal)));
  fillRoundRect(ctx, 40, 70, VIEW.w - 80, 8, 4, 'rgba(255,255,255,0.09)');
  const barColor = frac > 0.5 ? UI.good : frac > 0.2 ? UI.accent : UI.bad;
  fillRoundRect(ctx, 40, 70, Math.max(8, (VIEW.w - 80) * frac), 8, 4, barColor);

  if (urgent && state.screen === 'play') {
    const pulse = 0.35 + 0.35 * Math.sin(state.now / 140);
    ctx.strokeStyle = withAlpha(UI.bad, pulse);
    ctx.lineWidth = 10;
    roundRect(ctx, 5, 5, VIEW.w - 10, VIEW.h - 10, 20);
    ctx.stroke();
  }
}

// The two panel pictures, painted once at the origin and cached until the scene changes. Each is
// made opaque at its rounded corners, so a panel is always one bitmap blitted whole.
function pictureCache() {
  return {
    key: '',
    panelsKey: '',
    base: null,
    right: null,
    overlay: offscreen(),
    cardBase: offscreen(),
    cardRight: offscreen(),
  };
}

function paintPicture(canvas, scene, props, seed) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, PANEL.size, PANEL.size);
  scene.paint(ctx, createRandom((seed * 31 + 7) >>> 0));
  // drawProp places a prop on its own coordinates itself, so no translate here.
  for (const prop of props) {
    if (prop.gone) continue;
    drawProp(ctx, prop);
  }
  // Cut the rounded corners, then lay the frame's own colour under the whole square: the picture
  // is opaque edge to edge, so nothing beside it can show through its corners.
  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = '#000';
  roundRect(ctx, 0, 0, PANEL.size, PANEL.size, PANEL.radius);
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = UI.panelEdge;
  ctx.fillRect(0, 0, PANEL.size, PANEL.size);
  ctx.restore();
}

function ensurePictures(cache, state) {
  const key = `${state.level.scene.id}:${state.level.seed}:${state.level.index}:${state.level.diffs.length}`;
  if (cache.key === key) return cache;
  cache.key = key;
  cache.base = cache.base ?? offscreen();
  cache.right = cache.right ?? offscreen();
  paintPicture(cache.base, state.level.scene, state.level.base, state.level.seed);
  paintPicture(cache.right, state.level.scene, state.level.right, state.level.seed);
  return cache;
}

function drawMarker(ctx, x, y, age, fresh) {
  if (fresh) {
    const t = Math.min(1, age / 620);
    ring(ctx, x, y, MARKER_R * (1 + t * 1.5), 4 * (1 - t), withAlpha(UI.accent, 0.7 * (1 - t)));
  }
  ctx.fillStyle = radial(ctx, x, y, 0, MARKER_R * 2.1, [
    [0.55, withAlpha(UI.accent, 0.28)],
    [1, withAlpha(UI.accent, 0)],
  ]);
  circle(ctx, x, y, MARKER_R * 2.1);
  ring(ctx, x, y, MARKER_R, 5.5, 'rgba(255,255,255,0.95)');
  ring(ctx, x, y, MARKER_R - 5, 3, UI.accent);
  ctx.strokeStyle = '#14261c';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 11, y + 1);
  ctx.lineTo(x - 3, y + 9);
  ctx.lineTo(x + 12, y - 9);
  ctx.stroke();
}

function drawCrosshair(ctx, x, y) {
  ring(ctx, x, y, 13, 2, withAlpha(UI.cyan, 0.85));
  ring(ctx, x, y, 3, 2, withAlpha(UI.cyan, 0.9));
  ctx.strokeStyle = withAlpha(UI.cyan, 0.5);
  ctx.lineWidth = 2;
  [[-20, 0, -15, 0], [15, 0, 20, 0], [0, -20, 0, -15], [0, 15, 0, 20]].forEach(([a, b, c, d]) => {
    ctx.beginPath();
    ctx.moveTo(x + a, y + b);
    ctx.lineTo(x + c, y + d);
    ctx.stroke();
  });
}

function drawMiss(ctx, x, y, miss, now) {
  const t = Math.min(1, (now - miss.at) / RULES.missRingMs);
  ring(ctx, x, y, 12 + t * 40, 4 * (1 - t), withAlpha(UI.bad, 0.9 * (1 - t)));
  ctx.strokeStyle = withAlpha(UI.bad, 1 - t);
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 9, y - 9);
  ctx.lineTo(x + 9, y + 9);
  ctx.moveTo(x + 9, y - 9);
  ctx.lineTo(x - 9, y + 9);
  ctx.stroke();
}

// The marks that belong on both pictures, painted once into a 588-square and blitted into both, so
// they too are pixel for pixel the same on either side.
function paintOverlay(canvas, state) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, PANEL.size, PANEL.size);
  for (const diff of state.found) {
    if (sideOf(diff) === 'right') continue;
    drawMarker(ctx, diff.center.x, diff.center.y, state.now - diff.foundAt, state.lastFound === diff.slot);
  }
  if (state.hint && state.hint.diff && state.now < state.hint.until) {
    const diff = state.hint.diff;
    const remain = (state.hint.until - state.now) / RULES.hintRingMs;
    const alpha = 0.3 + 0.55 * Math.abs(Math.sin(state.now / 220));
    ring(ctx, diff.center.x, diff.center.y, MARKER_R + 12 + remain * 96, 4, withAlpha(UI.cyan, alpha), [10, 8]);
  }
  if (state.crosshair.visible) drawCrosshair(ctx, state.crosshair.x, state.crosshair.y);
  return canvas;
}

// One panel, assembled as a single bitmap: the picture, the shared marks, and whatever belongs to
// this side alone.
function composeCard(canvas, picture, overlay, post) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, PANEL.size, PANEL.size);
  ctx.drawImage(picture, 0, 0);
  ctx.drawImage(overlay, 0, 0);
  if (post) post(ctx);
  return canvas;
}

// What the panels show changes only when a mark appears, a hint glows, a ripple runs or the aim
// moves, so they are recomposed then and re-blitted untouched in between.
function panelsKey(state) {
  const aim = state.crosshair;
  const fresh = [...state.found].some((diff) => state.now - diff.foundAt < 700);
  const hintLive = Boolean(state.hint && state.hint.diff && state.now < state.hint.until);
  const animating = fresh || hintLive || state.misses.length > 0;
  return [
    state.level.index,
    state.level.seed,
    state.level.diffs.length,
    state.found.size,
    state.lastFound,
    animating ? `at${Math.round(state.now / 16)}` : 'still',
    hintLive ? `hint${state.hint.diff.slot}` : 'noHint',
    state.misses.map((miss) => `${miss.side}${Math.round(miss.x)}x${Math.round(miss.y)}`).join(',') || 'noMiss',
    `${Math.round(aim.x)}x${Math.round(aim.y)}x${aim.visible ? 1 : 0}`,
  ].join('|');
}

function drawPanels(ctx, state, cache) {
  ensurePictures(cache, state);

  const panels = [
    { side: 'left', x0: PANEL.leftX, picture: cache.base, card: cache.cardBase },
    { side: 'right', x0: PANEL.rightX, picture: cache.right, card: cache.cardRight },
  ];

  const key = panelsKey(state);
  if (cache.panelsKey !== key) {
    paintOverlay(cache.overlay, state);
    for (const panel of panels) {
      composeCard(panel.card, panel.picture, cache.overlay, (card) => {
        // A difference the other picture does not have is marked only where it shows.
        for (const diff of state.found) {
          if (sideOf(diff) !== panel.side || sideOf(diff) === 'both') continue;
          drawMarker(card, diff.center.x, diff.center.y, state.now - diff.foundAt, state.lastFound === diff.slot);
        }
        for (const miss of state.misses) {
          if (miss.side !== panel.side) continue;
          drawMiss(card, miss.x, miss.y, miss, state.now);
        }
      });
    }
    cache.panelsKey = key;
  }

  // The frames and their shadows first, the pictures over them second: a frame's shadow can then
  // never fall on a picture already blitted beside it.
  for (const panel of panels) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 7;
    fillRoundRect(ctx, panel.x0 - 3, PANEL_TOP - 3, PANEL.size + 6, PANEL.size + 6, PANEL.radius + 3, UI.panelEdge);
    ctx.restore();
  }

  // The mirror line between the two pictures.
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 3;
  ctx.setLineDash([7, 9]);
  ctx.beginPath();
  ctx.moveTo(VIEW.w / 2, PANEL_TOP + 26);
  ctx.lineTo(VIEW.w / 2, PANEL_TOP + PANEL.size - 26);
  ctx.stroke();
  ctx.setLineDash([]);

  for (const panel of panels) {
    ctx.drawImage(panel.card, panel.x0, PANEL_TOP);
  }
}

function drawFooter(ctx, state) {
  label(ctx, 'Click a difference in either picture · Arrows aim, Space marks · H hint · P pause · M sound · R restart', 40, VIEW.h - 18, {
    font: UI.fontSmall,
    color: UI.inkDim,
  });
  const dots = LEVELS.length;
  const spacing = 26;
  const startX = VIEW.w - 40 - (dots - 1) * spacing;
  for (let i = 0; i < dots; i += 1) {
    const x = startX + i * spacing;
    const cleared = state.cleared.includes(i) || i < state.level.index;
    const current = i === state.level.index && state.screen !== 'finale';
    ctx.fillStyle = cleared ? UI.good : current ? UI.accent : 'rgba(255,255,255,0.2)';
    circle(ctx, x, VIEW.h - 24, current ? 9 : 7);
    if (current) ring(ctx, x, VIEW.h - 24, 13, 2, withAlpha(UI.accent, 0.6));
  }
  label(ctx, `BEST ${state.best}`, startX - 40, VIEW.h - 18, { font: UI.fontTiny, color: UI.inkDim, align: 'right' });
}

function drawCard(ctx, { title, lines, footer, tint = UI.accent }) {
  const w = 680;
  const h = 300 + lines.length * 26;
  const x = (VIEW.w - w) / 2;
  const y = (VIEW.h - h) / 2 - 10;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 28;
  fillRoundRect(ctx, x, y, w, h, 22, 'rgba(10,14,26,0.94)');
  ctx.restore();
  strokeRoundRect(ctx, x, y, w, h, 22, 2, withAlpha('#ffffff', 0.2));
  strokeRoundRect(ctx, x + 6, y + 6, w - 12, h - 12, 18, 1.2, withAlpha(tint, 0.35));
  label(ctx, title, VIEW.w / 2, y + 62, { font: '800 40px system-ui, sans-serif', color: tint, align: 'center' });
  lines.forEach((line, i) => {
    label(ctx, line, VIEW.w / 2, y + 112 + i * 26, { font: '600 18px system-ui, sans-serif', color: UI.ink, align: 'center' });
  });
  if (footer) {
    label(ctx, footer, VIEW.w / 2, y + h - 34, { font: '700 18px system-ui, sans-serif', color: UI.inkDim, align: 'center' });
  }
}

function drawCards(ctx, state) {
  const total = state.level.diffs.length;
  if (state.screen === 'title') {
    drawCard(ctx, {
      title: 'TWICE UPON A TIME',
      lines: [
        'Five scenes. Each one drawn twice — with a handful of things changed.',
        'Click a difference in either picture to mark it. Find them all before the clock runs out.',
        `Marks stay on both pictures. Hints glow, but they cost ${RULES.hintPenaltySec} seconds.`,
      ],
      footer: 'PRESS SPACE OR CLICK TO START',
    });
  } else if (state.screen === 'cleared') {
    drawCard(ctx, {
      title: 'SCENE CLEARED',
      lines: [
        `${state.level.name} — all ${total} differences found.`,
        `Time left ${formatClock(state.timeLeft)} at ${RULES.timeBonusPerSec} points a second: +${state.lastBonus}`,
        `Score ${state.score}. Best streak ×${state.bestStreak}.`,
      ],
      footer: state.level.index + 1 < LEVELS.length ? 'PRESS N OR CLICK FOR THE NEXT SCENE' : 'PRESS N OR CLICK FOR THE FINALE',
      tint: UI.good,
    });
  } else if (state.screen === 'timeout') {
    drawCard(ctx, {
      title: 'OUT OF TIME',
      lines: [
        `You found ${state.found.size} of ${total} in ${state.level.name}.`,
        `Score ${state.score}.`,
      ],
      footer: 'PRESS R OR CLICK TO TRY THIS SCENE AGAIN',
      tint: UI.bad,
    });
  } else if (state.screen === 'finale') {
    drawCard(ctx, {
      title: 'ALL FIVE SCENES CLEARED',
      lines: [
        `Total score ${state.score} across ${LEVELS.length} scenes.`,
        `Best streak ×${state.bestStreak}. Best score ${state.best}.`,
        'Every difference was found by eye, in both pictures.',
      ],
      footer: 'PRESS R OR CLICK TO PLAY AGAIN',
      tint: UI.cyan,
    });
  } else if (state.screen === 'paused') {
    drawCard(ctx, {
      title: 'PAUSED',
      lines: ['The clock is stopped.', 'Press P or Space to carry on.'],
      footer: '',
      tint: UI.cyan,
    });
  }
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const cache = pictureCache();
  return {
    ctx,
    draw(state) {
      drawBackdrop(ctx);
      drawHeader(ctx, state);
      drawPanels(ctx, state, cache);
      drawFooter(ctx, state);
      drawCards(ctx, state);
    },
  };
}

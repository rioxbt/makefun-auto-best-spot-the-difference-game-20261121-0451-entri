// The self-audit the entry's own screenshots were checked with. One job: read the painted canvas
// back and prove the two pictures are identical except where a difference was declared, that
// every declared difference really changed pixels, and that every found difference is marked.
import { PANEL } from './config.js';
import { sideOf } from './scene.js';
import { MARKER_R } from './scene.js';

// A difference smaller than this on the panel is too small to be a fair find.
export const MIN_VISIBLE_PIXELS = 100;

function pixels(ctx, x0) {
  return ctx.getImageData(x0, PANEL.y, PANEL.size, PANEL.size).data;
}

export function auditPanels(canvas, level, found, screen = 'play') {
  const ctx = canvas.getContext('2d');
  const left = pixels(ctx, PANEL.leftX);
  const right = pixels(ctx, PANEL.rightX);
  const inside = level.diffs.map(() => 0);
  let outsideChanged = 0;
  let compared = 0;

  for (let y = 0; y < PANEL.size; y += 1) {
    for (let x = 0; x < PANEL.size; x += 1) {
      const i = (y * PANEL.size + x) * 4;
      const same = left[i] === right[i] && left[i + 1] === right[i + 1]
        && left[i + 2] === right[i + 2] && left[i + 3] === right[i + 3];
      compared += 1;
      if (same) continue;
      let hit = -1;
      for (let d = 0; d < level.diffs.length; d += 1) {
        const diff = level.diffs[d];
        if (Math.hypot(diff.center.x - x, diff.center.y - y) <= diff.boxR) {
          hit = d;
          break;
        }
      }
      if (hit >= 0) inside[hit] += 1;
      else outsideChanged += 1;
    }
  }

  // Every found difference must carry its marker on each picture it shows in.
  const marker = [];
  for (const diff of found) {
    const probes = [];
    const sides = sideOf(diff) === 'right' ? [PANEL.rightX] : [PANEL.leftX, PANEL.rightX];
    for (const x0 of sides) {
      const px = Math.round(diff.center.x + MARKER_R);
      const py = Math.round(diff.center.y);
      const sample = ctx.getImageData(x0 + px, PANEL.y + py, 1, 1).data;
      probes.push({
        panel: x0 === PANEL.leftX ? 'left' : 'right',
        rgba: [sample[0], sample[1], sample[2]],
        bright: sample[0] > 190 && sample[1] > 190 && sample[2] > 190,
      });
    }
    marker.push({ index: diff.index, kind: diff.kind, marked: probes.every((p) => p.bright), probes });
  }

  const marked = new Set([...found].map((diff) => diff.slot));
  const unmarkedChanged = level.diffs
    .filter((diff) => !marked.has(diff.slot))
    .map((diff) => inside[diff.slot]);

  return {
    scene: level.scene.id,
    screen,
    // A card (title, cleared, out of time, finale) is drawn across both pictures, so the two panel
    // regions cover different halves of it: the comparison below holds on a play frame.
    comparable: screen === 'play',
    differences: level.diffs.length,
    declaredKinds: level.diffs.map((d) => d.kind),
    pixelsCompared: compared,
    pixelsChangedOutsideDeclaredBoxes: outsideChanged,
    identicalOutsideDeclaredBoxes: outsideChanged === 0,
    changedPixelsPerDifference: inside,
    anyChangedPixelsPerDifference: inside.every((n) => n > 0),
    // Only an unmarked difference shows its change whole: a mark is drawn on both pictures and
    // hides the very pixels it celebrates, so marks are measured separately.
    visibleDifferenceFloor: MIN_VISIBLE_PIXELS,
    smallestUnmarkedDifference: unmarkedChanged.length ? Math.min(...unmarkedChanged) : null,
    everyUnmarkedDifferenceVisible: unmarkedChanged.every((n) => n >= MIN_VISIBLE_PIXELS),
    markersDrawn: marker,
    allFoundMarked: marker.every((m) => m.marked),
  };
}

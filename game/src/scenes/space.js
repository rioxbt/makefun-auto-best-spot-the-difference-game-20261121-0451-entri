// Rocket Ridge, scene three: open space above a ringed planet. One job: this scene's backdrop
// and its objects.
import { makeProp } from '../props.js';
import { blob, circle, linear, radial, withAlpha } from '../draw.js';
import { createRandom } from '../random.js';

export const space = {
  id: 'space',
  name: 'Rocket Ridge',
  hint: 'Deep space: planets, comets and a rocket.',
  paint(ctx, rng) {
    ctx.fillStyle = linear(ctx, 0, 0, 0, 588, [
      [0, '#241246'],
      [0.45, '#160b33'],
      [1, '#080518'],
    ]);
    ctx.fillRect(0, 0, 588, 588);

    ctx.fillStyle = withAlpha('#7c3aed', 0.35);
    blob(ctx, createRandom(101), 140, 150, 130, 0.45, 9);
    ctx.fill();
    ctx.fillStyle = withAlpha('#ec4899', 0.22);
    blob(ctx, createRandom(202), 452, 118, 110, 0.5, 8);
    ctx.fill();
    ctx.fillStyle = withAlpha('#22d3ee', 0.18);
    blob(ctx, createRandom(303), 320, 430, 150, 0.4, 9);
    ctx.fill();

    for (let i = 0; i < 120; i += 1) {
      const x = rng.range(0, 588);
      const y = rng.range(0, 588);
      const r = rng.range(0.8, 2.4);
      ctx.fillStyle = withAlpha('#ffffff', rng.range(0.25, 0.95));
      circle(ctx, x, y, r);
    }
    ['#fff6d6', '#c4b5fd', '#a5f3fc'].forEach((tint, i) => {
      for (let k = 0; k < 3; k += 1) {
        const x = rng.range(0, 588);
        const y = rng.range(0, 588);
        ctx.fillStyle = withAlpha(tint, 0.9);
        circle(ctx, x, y, rng.range(1.6, 3));
        ctx.fillStyle = radial(ctx, x, y, 0, 22, [
          [0, withAlpha(tint, 0.35)],
          [1, withAlpha(tint, 0)],
        ]);
        circle(ctx, x, y, 22);
      }
    });
  },
  props() {
    return [
      makeProp('planet', 500, 118, { s: 1.6, c: '#f59e0b', c2: '#fcd34d', variant: true }),
      makeProp('moon', 92, 78, { s: 1.35, c: '#ffeaa7' }),
      makeProp('rocket', 178, 300, { s: 1.7, c: '#e63946', c2: '#8ecae6', rot: -0.42 }),
      makeProp('ufo', 424, 268, { s: 1.15, c: '#b8c2d0', variant: true }),
      makeProp('satellite', 108, 208, { s: 1.0, c: '#cbd5e1', rot: 0.5 }),
      makeProp('comet', 372, 168, { s: 1.1, c: '#bde3ff', variant: true, rot: 0.4 }),
      makeProp('asteroid', 330, 342, { s: 1.0, c: '#8b8f9c', seed: 31 }),
      makeProp('asteroid', 508, 396, { s: 1.3, c: '#7c8290', seed: 33 }),
      makeProp('asteroid', 70, 452, { s: 1.1, c: '#9198a5', seed: 35 }),
      makeProp('asteroid', 246, 96, { s: 0.8, c: '#98a0ad', seed: 37 }),
      makeProp('star', 300, 60, { s: 1.2, c: '#fff6d6' }),
      makeProp('star', 200, 470, { s: 1.0, c: '#fef3c7', variant: true }),
      makeProp('star', 542, 236, { s: 0.9, c: '#e9d5ff' }),
      makeProp('star', 40, 330, { s: 1.05, c: '#a5f3fc' }),
      makeProp('star', 452, 486, { s: 0.85, c: '#fff6d6' }),
      makeProp('star', 268, 528, { s: 1.1, c: '#fde68a' }),
      makeProp('star', 120, 556, { s: 0.8, c: '#e0f2fe' }),
      makeProp('star', 372, 552, { s: 0.95, c: '#f5d0fe' }),
    ];
  },
};

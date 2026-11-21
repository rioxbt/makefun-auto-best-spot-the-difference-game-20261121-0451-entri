// Coral Cove, scene two: the sunlit shallows. One job: this scene's backdrop and its objects.
import { makeProp } from '../props.js';
import { circle, ellipse, linear, withAlpha } from '../draw.js';

export const reef = {
  id: 'reef',
  name: 'Coral Cove',
  hint: 'A sunlit reef: fish, seaweed and bubbles.',
  paint(ctx, rng) {
    ctx.fillStyle = linear(ctx, 0, 0, 0, 588, [
      [0, '#5fd8ef'],
      [0.35, '#1e93b8'],
      [0.72, '#0d5f80'],
      [1, '#0a3f57'],
    ]);
    ctx.fillRect(0, 0, 588, 588);

    // Sun shafts falling through the surface.
    for (let i = 0; i < 5; i += 1) {
      const x = 40 + i * 128 + rng.range(-16, 16);
      const grad = linear(ctx, x, 0, x + 60, 470, [
        [0, withAlpha('#eafcff', 0.3)],
        [1, withAlpha('#eafcff', 0)],
      ]);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 34, 0);
      ctx.lineTo(x + 92, 470);
      ctx.lineTo(x + 30, 470);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = '#f2e2b4';
    ctx.beginPath();
    ctx.moveTo(-20, 588);
    ctx.lineTo(-20, 500);
    ctx.quadraticCurveTo(150, 462, 320, 508);
    ctx.quadraticCurveTo(470, 546, 608, 496);
    ctx.lineTo(608, 588);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = withAlpha('#fff6dd', 0.55);
    ctx.beginPath();
    ctx.moveTo(-20, 512);
    ctx.quadraticCurveTo(150, 476, 320, 520);
    ctx.quadraticCurveTo(470, 558, 608, 508);
    ctx.lineTo(608, 528);
    ctx.quadraticCurveTo(470, 578, 320, 540);
    ctx.quadraticCurveTo(150, 496, -20, 532);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = withAlpha('#bff4ff', 0.5);
    for (let i = 0; i < 26; i += 1) {
      circle(ctx, rng.range(10, 578), rng.range(20, 470), rng.range(1.6, 4));
    }
  },
  props() {
    return [
      makeProp('jellyfish', 84, 132, { s: 1.25, c: '#c084fc' }),
      makeProp('jellyfish', 508, 108, { s: 1.0, c: '#f472b6' }),
      makeProp('fish', 180, 96, { s: 1.1, c: '#ffb703', flip: true }),
      makeProp('fish', 392, 168, { s: 0.95, c: '#38bdf8', flip: true }),
      makeProp('fish', 268, 232, { s: 1.0, c: '#fb7185' }),
      makeProp('fish', 92, 300, { s: 1.05, c: '#a78bfa', flip: true }),
      makeProp('fish', 470, 318, { s: 0.9, c: '#facc15', flip: true }),
      makeProp('fish', 200, 396, { s: 1.15, c: '#34d399' }),
      makeProp('bubble', 138, 208, { s: 0.9, c: '#a5e8ff' }),
      makeProp('bubble', 330, 140, { s: 0.7, c: '#a5e8ff' }),
      makeProp('bubble', 552, 236, { s: 0.8, c: '#a5e8ff' }),
      makeProp('bubble', 246, 300, { s: 0.6, c: '#a5e8ff' }),
      makeProp('bubble', 428, 402, { s: 0.75, c: '#a5e8ff' }),
      makeProp('coral', 60, 508, { s: 1.25, c: '#ff7a8a' }),
      makeProp('coral', 486, 498, { s: 1.15, c: '#fb923c' }),
      makeProp('coral', 262, 512, { s: 0.95, c: '#f472b6' }),
      makeProp('seaweed', 150, 512, { s: 1.2, c: '#2dd4bf' }),
      makeProp('seaweed', 380, 486, { s: 1.05, c: '#22c55e' }),
      makeProp('seaweed', 552, 520, { s: 1.1, c: '#2dd4bf' }),
      makeProp('seaweed', 348, 546, { s: 0.9, c: '#22c55e' }),
      makeProp('crab', 214, 552, { s: 1.05, c: '#f2545b' }),
      makeProp('starfish', 442, 540, { s: 1.1, c: '#ff9f68' }),
      makeProp('starfish', 108, 424, { s: 0.85, c: '#f97316' }),
      makeProp('shell', 300, 560, { s: 1.0, c: '#f7c8e0' }),
      makeProp('shell', 596 - 18, 452, { s: 0.85, c: '#fbcfe8' }),
      makeProp('rock', 24, 548, { s: 1.05, c: '#6b7280', seed: 21 }),
      makeProp('rock', 516, 566, { s: 0.9, c: '#7b8494', seed: 23 }),
    ];
  },
};

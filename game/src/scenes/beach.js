// Castaway Cay, scene five: a small island at noon. One job: this scene's backdrop and its
// objects.
import { makeProp } from '../props.js';
import { circle, ellipse, linear, withAlpha, wavy } from '../draw.js';

export const beach = {
  id: 'beach',
  name: 'Castaway Cay',
  hint: 'An island shore: palms, shells and a boat.',
  paint(ctx, rng) {
    ctx.fillStyle = linear(ctx, 0, 0, 0, 340, [
      [0, '#3fa9f5'],
      [0.6, '#8fd8ff'],
      [1, '#fdf6e0'],
    ]);
    ctx.fillRect(0, 0, 588, 340);

    ctx.fillStyle = withAlpha('#fff3c4', 0.7);
    circle(ctx, 78, 70, 74);
    circle(ctx, 78, 70, 46);

    ctx.fillStyle = linear(ctx, 0, 300, 0, 452, [
      [0, '#1f8fd6'],
      [0.5, '#39b7e8'],
      [1, '#7fe0f2'],
    ]);
    ctx.fillRect(0, 300, 588, 152);

    for (let i = 0; i < 9; i += 1) {
      const y = 318 + i * 15;
      wavy(ctx, -20 + rng.range(0, 40), y, 588, 4, 10 - i * 0.4, 2.6, withAlpha('#ffffff', 0.34 - i * 0.02));
    }

    ctx.fillStyle = '#f8e6b0';
    ctx.beginPath();
    ctx.moveTo(-20, 588);
    ctx.lineTo(-20, 470);
    ctx.quadraticCurveTo(160, 428, 330, 466);
    ctx.quadraticCurveTo(480, 498, 608, 456);
    ctx.lineTo(608, 588);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fde9bd';
    ctx.fillRect(0, 500, 588, 88);
    ctx.fillStyle = linear(ctx, 0, 500, 0, 588, [
      [0, withAlpha('#fde68a', 0)],
      [1, withAlpha('#e0a83c', 0.55)],
    ]);
    ctx.fillRect(0, 500, 588, 88);

    ctx.fillStyle = withAlpha('#ffffff', 0.5);
    for (let i = 0; i < 30; i += 1) {
      circle(ctx, rng.range(6, 582), rng.range(470, 584), rng.range(1.2, 2.6));
    }
    ctx.fillStyle = '#f6d68b';
    ellipse(ctx, 300, 474, 46, 8);
  },
  props() {
    return [
      makeProp('lighthouse', 534, 366, { s: 1.5, c: '#e8503a', variant: true }),
      makeProp('gull', 168, 116, { s: 1.1, c: '#2c3a55' }),
      makeProp('gull', 250, 84, { s: 1.0, c: '#33415c', variant: true }),
      makeProp('gull', 372, 140, { s: 1.05, c: '#2c3a55' }),
      makeProp('boat', 208, 262, { s: 1.4, c: '#c1440e', variant: true }),
      makeProp('palm', 96, 428, { s: 1.6, c: '#16a34a', variant: true }),
      makeProp('palm', 470, 462, { s: 1.35, c: '#15803d', flip: true }),
      makeProp('umbrella', 300, 452, { s: 1.45, c: '#ff6b6b', c2: '#3f8f4f' }),
      makeProp('sandcastle', 176, 522, { s: 1.35, c: '#f8d68a', variant: true }),
      makeProp('ball', 396, 540, { s: 1.1, c: '#ff6b6b', c2: '#fff8e7' }),
      makeProp('starfish', 262, 556, { s: 1.0, c: '#ff9f68' }),
      makeProp('shell', 452, 546, { s: 1.15, c: '#f7c8e0' }),
      makeProp('shell', 96, 542, { s: 1.0, c: '#fbcfe8' }),
      makeProp('shell', 336, 580, { s: 0.9, c: '#f7c8e0' }),
      makeProp('crab', 528, 526, { s: 1.05, c: '#f2545b' }),
      makeProp('rock', 42, 512, { s: 0.95, c: '#a1a8b3', seed: 51 }),
      makeProp('rock', 250, 592, { s: 0.8, c: '#98a0ad', seed: 53 }),
      makeProp('grass', 128, 572, { s: 0.9, c: '#4fae63' }),
      makeProp('grass', 500, 578, { s: 0.8, c: '#3f9d5a' }),
    ];
  },
};

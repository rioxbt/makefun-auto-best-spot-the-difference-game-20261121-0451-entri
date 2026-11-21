// Sunny Meadow, scene one: the backdrop it paints and the objects it places. One job: what this
// scene looks like before any difference is hidden in it.
import { makeProp } from '../props.js';
import { circle, ellipse, linear, poly, roundRect, withAlpha } from '../draw.js';

export const meadow = {
  id: 'meadow',
  name: 'Sunny Meadow',
  hint: 'A bright hillside: kites, pines and flowers.',
  paint(ctx, rng) {
    ctx.fillStyle = linear(ctx, 0, 0, 0, 588, [
      [0, '#7ec8ff'],
      [0.55, '#bfe6ff'],
      [0.78, '#e8f6ff'],
    ]);
    ctx.fillRect(0, 0, 588, 588);

    ctx.fillStyle = withAlpha('#fff3c4', 0.75);
    circle(ctx, 96, 84, 92);
    circle(ctx, 96, 84, 58);

    ctx.fillStyle = '#a7dc8f';
    ctx.beginPath();
    ctx.moveTo(-20, 588);
    ctx.lineTo(-20, 452);
    ctx.quadraticCurveTo(90, 372, 238, 432);
    ctx.quadraticCurveTo(360, 480, 470, 424);
    ctx.quadraticCurveTo(548, 386, 608, 448);
    ctx.lineTo(608, 588);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#7fd06a';
    ctx.beginPath();
    ctx.moveTo(-20, 588);
    ctx.lineTo(-20, 492);
    ctx.quadraticCurveTo(140, 428, 300, 486);
    ctx.quadraticCurveTo(430, 534, 608, 470);
    ctx.lineTo(608, 588);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = linear(ctx, 0, 470, 0, 588, [
      [0, '#8fdc72'],
      [1, '#4f9f45'],
    ]);
    ctx.fillRect(0, 470, 588, 118);

    for (let i = 0; i < 46; i += 1) {
      const x = rng.range(0, 588);
      const y = rng.range(478, 584);
      const h = rng.range(6, 13);
      ctx.strokeStyle = withAlpha('#2f6f33', 0.35);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + rng.range(-3, 3), y - h);
      ctx.stroke();
    }

    ctx.fillStyle = '#e9d3a4';
    ctx.beginPath();
    ctx.moveTo(232, 588);
    ctx.quadraticCurveTo(276, 540, 300, 500);
    ctx.quadraticCurveTo(330, 552, 356, 588);
    ctx.closePath();
    ctx.fill();
  },
  props() {
    return [
      makeProp('sun', 92, 84, { s: 1.5, c: '#ffd45e' }),
      makeProp('cloud', 236, 116, { s: 1.25, seed: 3 }),
      makeProp('cloud', 430, 74, { s: 1.0, seed: 5 }),
      makeProp('cloud', 528, 176, { s: 0.8, seed: 9 }),
      makeProp('kite', 322, 196, { s: 1.15, c: '#ff6b6b', c2: '#ffd166' }),
      makeProp('butterfly', 152, 352, { s: 0.95, c: '#ff8fa3', c2: '#7c5cff' }),
      makeProp('butterfly', 268, 318, { s: 0.8, c: '#ffd166', c2: '#7c5cff', flip: true }),
      makeProp('pine', 92, 462, { s: 1.25, c: '#2f7d4f' }),
      makeProp('tree', 210, 456, { s: 1.1, c: '#3f9d5a' }),
      makeProp('pine', 508, 470, { s: 1.05, c: '#357f52' }),
      makeProp('bush', 148, 528, { s: 1.05, c: '#4fae63' }),
      makeProp('bush', 446, 540, { s: 1.0, c: '#3f9d5a' }),
      makeProp('pond', 300, 548, { s: 1.0, c: '#4aa3e0' }),
      makeProp('fence', 404, 486, { s: 1.0, c: '#c9a227' }),
      makeProp('rock', 38, 508, { s: 0.95, c: '#9aa1ad', seed: 11 }),
      makeProp('rock', 566, 528, { s: 0.8, c: '#8d949f', seed: 13 }),
      makeProp('flower', 64, 556, { s: 1.0, c: '#ff7fa8', c2: '#ffd166' }),
      makeProp('flower', 178, 572, { s: 0.9, c: '#ffd166', c2: '#ff7a59' }),
      makeProp('flower', 372, 556, { s: 0.95, c: '#a78bfa', c2: '#ffd166' }),
      makeProp('flower', 542, 552, { s: 0.85, c: '#ff7a59', c2: '#ffd166' }),
      makeProp('mushroom', 246, 578, { s: 0.95, c: '#e8503a' }),
      makeProp('mushroom', 486, 574, { s: 0.8, c: '#c2410c' }),
      makeProp('grass', 320, 520, { s: 0.9, c: '#3f9d5a' }),
      makeProp('grass', 528, 512, { s: 0.85, c: '#4fae63' }),
    ];
  },
};

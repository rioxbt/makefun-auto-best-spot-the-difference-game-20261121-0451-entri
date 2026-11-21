// Moonlit Town, scene four: a sleepy street at night. One job: this scene's backdrop and its
// objects.
import { makeProp } from '../props.js';
import { circle, linear, radial, withAlpha } from '../draw.js';
import { createRandom } from '../random.js';

export const town = {
  id: 'town',
  name: 'Moonlit Town',
  hint: 'A quiet street: windows, lamps and a cat.',
  paint(ctx, rng) {
    ctx.fillStyle = linear(ctx, 0, 0, 0, 588, [
      [0, '#101a45'],
      [0.5, '#1b2a5c'],
      [1, '#0a1130'],
    ]);
    ctx.fillRect(0, 0, 588, 588);

    ctx.fillStyle = radial(ctx, 508, 92, 10, 150, [
      [0, withAlpha('#ffeaa7', 0.45)],
      [1, withAlpha('#ffeaa7', 0)],
    ]);
    circle(ctx, 508, 92, 150);

    ctx.fillStyle = '#0c1430';
    ctx.beginPath();
    ctx.moveTo(-20, 588);
    ctx.lineTo(-20, 430);
    ctx.quadraticCurveTo(120, 356, 268, 424);
    ctx.quadraticCurveTo(400, 480, 608, 404);
    ctx.lineTo(608, 588);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#131c3d';
    ctx.beginPath();
    ctx.moveTo(-20, 588);
    ctx.lineTo(-20, 486);
    ctx.quadraticCurveTo(160, 440, 330, 496);
    ctx.quadraticCurveTo(470, 540, 608, 486);
    ctx.lineTo(608, 588);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = linear(ctx, 0, 520, 0, 588, [
      [0, '#2a3358'],
      [1, '#151d3c'],
    ]);
    ctx.fillRect(0, 520, 588, 68);
    ctx.strokeStyle = withAlpha('#ffeaa7', 0.35);
    ctx.lineWidth = 5;
    ctx.setLineDash([16, 22]);
    ctx.beginPath();
    ctx.moveTo(0, 588);
    ctx.lineTo(588, 588);
    ctx.stroke();
    ctx.setLineDash([]);

    for (let i = 0; i < 8; i += 1) {
      const x = rng.range(20, 568);
      const y = rng.range(430, 512);
      ctx.fillStyle = withAlpha('#7dd3fc', 0.14);
      circle(ctx, x, y, rng.range(8, 16));
    }
  },
  props() {
    return [
      makeProp('moon', 508, 92, { s: 1.6, c: '#ffeaa7' }),
      makeProp('cloud', 176, 96, { s: 1.1, seed: 41, c: '#cbd5e1' }),
      makeProp('star', 264, 62, { s: 0.9, c: '#fef3c7' }),
      makeProp('star', 386, 118, { s: 0.75, c: '#e0f2fe' }),
      makeProp('star', 96, 62, { s: 0.8, c: '#fde68a', variant: true }),
      makeProp('star', 448, 196, { s: 0.7, c: '#e9d5ff' }),
      makeProp('star', 40, 176, { s: 0.85, c: '#a5f3fc' }),
      makeProp('house', 122, 470, { s: 1.5, c: '#f4b5a0', c2: '#c75b4a' }),
      makeProp('window', 108, 462, { s: 0.9, variant: 1 }),
      makeProp('window', 150, 462, { s: 0.9 }),
      makeProp('house', 336, 456, { s: 1.75, c: '#c9d6f5', c2: '#5b6ba8', variant: 1 }),
      makeProp('window', 312, 446, { s: 1.0, variant: 1 }),
      makeProp('window', 366, 446, { s: 1.0 }),
      makeProp('house', 512, 484, { s: 1.25, c: '#fbd38d', c2: '#b45309' }),
      makeProp('window', 502, 474, { s: 0.85, variant: 1 }),
      makeProp('tree', 236, 470, { s: 1.15, c: '#1f6b45' }),
      makeProp('tree', 60, 512, { s: 0.9, c: '#215f42' }),
      makeProp('bush', 412, 528, { s: 1.0, c: '#1f6b45' }),
      makeProp('bush', 574, 512, { s: 0.85, c: '#215f42' }),
      makeProp('lamp', 200, 476, { s: 1.1, c: '#4c5570', variant: true }),
      makeProp('lamp', 434, 506, { s: 1.0, c: '#4c5570', variant: true }),
      makeProp('mailbox', 282, 522, { s: 1.05, c: '#4f7cff', flip: true }),
      makeProp('cat', 396, 556, { s: 1.15, c: '#8b93a1' }),
      makeProp('fence', 520, 546, { s: 0.95, c: '#8a6d3b' }),
      makeProp('rock', 320, 566, { s: 0.85, c: '#4b5563', seed: 43 }),
    ];
  },
};

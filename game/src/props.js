// The prop catalogue: every object a scene can place, drawn from its own centre in a nominal
// 40-pixel space. One job: how each kind of thing looks. A prop carries colour, scale, facing,
// tilt and one detail `variant`, so a scene can hide a difference in any of them.
import { createRandom } from './random.js';
import {
  circle, ellipse, poly, strokePoly, roundRect, fillRoundRect, starPath,
  blob, wavy, lighten, darken, withAlpha, groundShadow,
} from './draw.js';

const OUTLINE = 'rgba(24,20,32,0.28)';

function outlinePath(ctx, width = 2.4) {
  ctx.lineWidth = width;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
}

// ---------------------------------------------------------------- sky, space and weather

function drawSun(ctx, p) {
  ctx.fillStyle = withAlpha(p.c, 0.22);
  circle(ctx, 0, 0, 30);
  ctx.fillStyle = p.c;
  starPath(ctx, 0, 0, 23, 15, 12);
  ctx.fill();
  ctx.fillStyle = lighten(p.c, 0.45);
  circle(ctx, -5, -6, 9);
}

function drawCloud(ctx, p) {
  ctx.fillStyle = p.c;
  circle(ctx, -14, 3, 11);
  circle(ctx, 14, 4, 12);
  circle(ctx, 0, -2, 16);
  circle(ctx, -3, 8, 12);
  ctx.fillStyle = lighten(p.c, 0.35);
  circle(ctx, -6, -8, 8);
}

function drawMoon(ctx, p) {
  ctx.fillStyle = withAlpha(p.c, 0.2);
  circle(ctx, 0, 0, 27);
  ctx.fillStyle = p.c;
  circle(ctx, 0, 0, 21);
  ctx.fillStyle = darken(p.c, 0.14);
  circle(ctx, -8, -6, 4.5);
  circle(ctx, 7, 2, 3.4);
  circle(ctx, -1, 9, 2.6);
  if (p.variant) {
    // A broad dark mare across the face: a change worth looking for.
    ctx.fillStyle = darken(p.c, 0.22);
    ellipse(ctx, 5, 5, 9, 7);
    circle(ctx, -10, 8, 2.6);
  }
}

function drawStar(ctx, p) {
  ctx.fillStyle = withAlpha(p.c, 0.25);
  starPath(ctx, 0, 0, 22, 9, p.variant ? 5 : 4);
  ctx.fill();
  ctx.fillStyle = p.c;
  starPath(ctx, 0, 0, 15, 6, p.variant ? 5 : 4);
  ctx.fill();
}

function drawPlanet(ctx, p) {
  ctx.fillStyle = p.c;
  circle(ctx, 0, 0, 20);
  ctx.fillStyle = darken(p.c, 0.22);
  ellipse(ctx, -4, 3, 12, 15);
  ctx.fillStyle = lighten(p.c, 0.3);
  circle(ctx, -6, -7, 6);
  if (p.variant) {
    ctx.save();
    ctx.rotate(-0.32);
    ctx.strokeStyle = p.c2 ?? lighten(p.c, 0.5);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 31, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawComet(ctx, p) {
  const len = p.variant ? 30 : 18;
  const grad = ctx.createLinearGradient(0, 0, len, -len * 0.5);
  grad.addColorStop(0, withAlpha(p.c2 ?? '#9ad8ff', 0.9));
  grad.addColorStop(1, withAlpha(p.c2 ?? '#9ad8ff', 0));
  ctx.strokeStyle = grad;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(2, -1);
  ctx.lineTo(len, -len * 0.5);
  ctx.stroke();
  ctx.fillStyle = p.c;
  circle(ctx, 0, 0, 9);
  ctx.fillStyle = lighten(p.c, 0.5);
  circle(ctx, -2, -3, 3.4);
}

function drawAsteroid(ctx, p) {
  const rng = createRandom(p.seed);
  ctx.fillStyle = p.c;
  blob(ctx, rng, 0, 0, 14, 0.32, 8);
  ctx.fill();
  ctx.fillStyle = darken(p.c, 0.2);
  circle(ctx, -4, -3, 4);
  circle(ctx, 5, 3, 3);
  ctx.fillStyle = lighten(p.c, 0.22);
  circle(ctx, 3, -6, 2.4);
}

function drawSatellite(ctx, p) {
  ctx.fillStyle = p.c2 ?? '#7dd3fc';
  ctx.strokeStyle = darken(p.c2 ?? '#7dd3fc', 0.25);
  ctx.lineWidth = 1.6;
  roundRect(ctx, -25, -8, 18, 16, 2);
  ctx.fill();
  ctx.stroke();
  roundRect(ctx, 7, -8, 18, 16, 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = p.c;
  roundRect(ctx, -9, -9, 18, 18, 4);
  ctx.fill();
  ctx.fillStyle = darken(p.c, 0.3);
  circle(ctx, 0, 0, 4);
  ctx.fillStyle = p.c;
  roundRect(ctx, -1.5, -20, 3, 11, 1.5);
  ctx.fill();
  ctx.fillStyle = lighten(p.c, 0.4);
  circle(ctx, 0, -21, 3);
  if (p.variant) {
    // A dish unfolded beside the hull.
    ctx.fillStyle = lighten(p.c, 0.3);
    ctx.beginPath();
    ctx.ellipse(-19, -16, 13, 8.5, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = darken(p.c, 0.25);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-19, -16);
    ctx.lineTo(-9, -8);
    ctx.stroke();
  }
}

function drawRocket(ctx, p) {
  ctx.fillStyle = '#e9eef7';
  ctx.beginPath();
  ctx.moveTo(0, -26);
  ctx.quadraticCurveTo(10, -14, 10, 6);
  ctx.lineTo(-10, 6);
  ctx.quadraticCurveTo(-10, -14, 0, -26);
  ctx.closePath();
  ctx.fill();
  outlinePath(ctx);
  ctx.fillStyle = p.c;
  poly(ctx, [[10, -2], [20, 12], [10, 12]]);
  poly(ctx, [[-10, -2], [-20, 12], [-10, 12]]);
  ctx.fillStyle = p.c2 ?? '#8ecae6';
  circle(ctx, 0, -6, p.variant ? 8 : 6);
  if (p.variant) {
    // The cabin light on: the porthole breathes, and the whole window tells.
    ctx.fillStyle = withAlpha('#ffd166', 0.4);
    circle(ctx, 0, -6, 15);
  }
  ctx.fillStyle = p.variant ? '#ffd166' : '#2b3a55';
  circle(ctx, 0, -6, p.variant ? 6 : 4);
  ctx.fillStyle = '#ffb703';
  poly(ctx, [[-7, 7], [0, 22], [7, 7]]);
  ctx.fillStyle = '#ff6b35';
  poly(ctx, [[-4, 7], [0, 16], [4, 7]]);
}

function drawUfo(ctx, p) {
  if (p.variant) {
    ctx.fillStyle = withAlpha('#a3e635', 0.28);
    poly(ctx, [[-7, 4], [7, 4], [20, 30], [-20, 30]]);
  }
  ctx.fillStyle = p.c2 ?? '#9aa5b1';
  ellipse(ctx, 0, 4, 24, 8);
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 9, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = lighten(p.c, 0.4);
  circle(ctx, 0, -6, 4);
  ctx.fillStyle = '#ffd166';
  [-14, 0, 14].forEach((x) => circle(ctx, x, 6, 2.4));
}

// ---------------------------------------------------------------- ground and greenery

function drawPine(ctx, p) {
  groundShadow(ctx, 0, 21, 13, 3.5);
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(-2.5, 6, 5, 15);
  ctx.fillStyle = p.c;
  poly(ctx, [[0, -24], [15, 14], [-15, 14]]);
  ctx.fillStyle = darken(p.c, 0.16);
  poly(ctx, [[0, -24], [15, 14], [0, 14]]);
  if (p.variant) {
    ctx.fillStyle = p.c2;
    starPath(ctx, 0, -28, 12, 5, 5);
    ctx.fill();
    ctx.fillStyle = lighten(p.c2, 0.45);
    starPath(ctx, 0, -28, 6.5, 2.8, 5);
    ctx.fill();
  }
}

function drawTree(ctx, p) {
  groundShadow(ctx, 0, 22, 15, 4);
  ctx.fillStyle = '#8a5a2b';
  fillRoundRect(ctx, -4, 2, 8, 20, 3, '#8a5a2b');
  ctx.fillStyle = p.c;
  circle(ctx, -13, 2, 12);
  circle(ctx, 13, 1, 13);
  circle(ctx, 0, -7, 17);
  ctx.fillStyle = lighten(p.c, 0.2);
  circle(ctx, -7, -12, 8);
  if (p.variant) {
    ctx.fillStyle = p.c2;
    circle(ctx, 8, 4, 4);
    circle(ctx, -11, 8, 4);
    circle(ctx, 2, 10, 3.6);
  }
}

function drawBush(ctx, p) {
  groundShadow(ctx, 0, 13, 16, 3.5);
  ctx.fillStyle = p.c;
  circle(ctx, -10, 2, 10);
  circle(ctx, 10, 3, 10);
  circle(ctx, 0, -4, 13);
  ctx.fillStyle = lighten(p.c, 0.22);
  circle(ctx, -5, -8, 6);
}

function drawFlower(ctx, p) {
  ctx.strokeStyle = '#3f8f4f';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 16);
  ctx.quadraticCurveTo(2, 6, 0, -2);
  ctx.stroke();
  const petals = p.variant ? 6 : 5;
  ctx.fillStyle = p.c;
  for (let i = 0; i < petals; i += 1) {
    const a = (i / petals) * Math.PI * 2;
    circle(ctx, Math.cos(a) * 7, -4 + Math.sin(a) * 7, 5.4);
  }
  ctx.fillStyle = p.c2;
  circle(ctx, 0, -4, 4);
}

function drawMushroom(ctx, p) {
  groundShadow(ctx, 0, 12, 11, 3);
  ctx.fillStyle = '#f5ead6';
  fillRoundRect(ctx, -4, 0, 8, 13, 3, '#f5ead6');
  ctx.fillStyle = p.c;
  ctx.beginPath();
  // A tall dome, or a wide flat cap: the shape itself carries the difference.
  if (p.variant) ctx.ellipse(0, 0, 18, 8, 0, Math.PI, 0);
  else ctx.ellipse(0, 0, 14, 12, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#fdf6e8';
  const dots = p.variant
    ? [[-11, -3, 2.8], [9, -3, 2.5]]
    : [[-7, -4, 2.6], [5, -5, 2.2], [0, -8, 2.2]];
  dots.forEach(([x, y, r]) => circle(ctx, x, y, r));
}

function drawRock(ctx, p) {
  const rng = createRandom(p.seed);
  groundShadow(ctx, 0, 14, 16, 3.5);
  ctx.fillStyle = p.c;
  blob(ctx, rng, 0, 0, 15, 0.26, 8);
  ctx.fill();
  ctx.fillStyle = lighten(p.c, 0.24);
  blob(ctx, createRandom(p.seed + 7), -4, -5, 7, 0.3, 6);
  ctx.fill();
  ctx.fillStyle = darken(p.c, 0.2);
  circle(ctx, 6, 6, 4);
}

function drawPond(ctx, p) {
  ctx.fillStyle = '#6bbf59';
  ellipse(ctx, 0, 0, 44, 18);
  ctx.fillStyle = p.c;
  ellipse(ctx, 0, 0, 40, 15);
  ctx.strokeStyle = withAlpha('#ffffff', 0.4);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(-8, -2, 14, 5, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#3f8f4f';
  ellipse(ctx, 14, 4, 6, 4);
}

function drawFence(ctx, p) {
  ctx.fillStyle = p.c;
  [-20, 0, 20].forEach((x) => fillRoundRect(ctx, x - 3, -16, 6, 32, 2, p.c));
  ctx.fillStyle = lighten(p.c, 0.1);
  fillRoundRect(ctx, -24, -10, 48, 5, 2, lighten(p.c, 0.1));
  fillRoundRect(ctx, -24, 4, 48, 5, 2, lighten(p.c, 0.1));
}

function drawButterfly(ctx, p) {
  ctx.fillStyle = withAlpha('#ffffff', 0.12);
  circle(ctx, 0, 0, 18);
  ctx.fillStyle = p.c;
  ellipse(ctx, -11, -6, 10, 13, -0.4);
  ellipse(ctx, 11, -6, 10, 13, 0.4);
  ctx.fillStyle = p.c2;
  ellipse(ctx, -8, 8, 7, 9, 0.3);
  ellipse(ctx, 8, 8, 7, 9, -0.3);
  if (p.variant) {
    // A bright patch on the left-hand wings alone.
    ctx.fillStyle = '#fff8e7';
    ctx.beginPath();
    ctx.ellipse(-12, -6, 6, 8, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-8, 8, 4.4, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#3b3140';
  fillRoundRect(ctx, -2, -12, 4, 24, 2, '#3b3140');
  ctx.strokeStyle = '#3b3140';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-1, -12);
  ctx.lineTo(-7, -20);
  ctx.moveTo(1, -12);
  ctx.lineTo(7, -20);
  ctx.stroke();
}

function drawKite(ctx, p) {
  ctx.strokeStyle = '#e8e0cf';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, 16);
  ctx.quadraticCurveTo(9, 26, 2, 36);
  ctx.stroke();
  // The two halves of the sail, swapped when the variant is on: one bold, fair difference.
  ctx.fillStyle = p.variant ? p.c2 : p.c;
  poly(ctx, [[0, -18], [0, 16], [-14, 0]]);
  ctx.fillStyle = p.variant ? p.c : p.c2;
  poly(ctx, [[0, -18], [14, 0], [0, 16]]);
  strokePoly(ctx, [[0, -18], [14, 0], [0, 16], [-14, 0]], 1.8, 'rgba(24,20,32,0.28)');
  ctx.fillStyle = '#ff8fa3';
  [0.18, 0.5, 0.82].forEach((t) => {
    circle(ctx, 2 + 9 * t, 18 + 16 * t, 3.4);
  });
}

function drawGrass(ctx, p) {
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  [-8, -2, 4, 10].forEach((x, i) => {
    ctx.beginPath();
    ctx.moveTo(x, 10);
    ctx.quadraticCurveTo(x + (i % 2 ? 5 : -5), 0, x + (i % 2 ? 2 : -2), -8);
    ctx.stroke();
  });
}

// ---------------------------------------------------------------- water

function drawFish(ctx, p) {
  ctx.fillStyle = p.c;
  ellipse(ctx, 0, 0, 18, 11);
  poly(ctx, [[-16, 0], [-28, -9], [-28, 9]]);
  ctx.fillStyle = lighten(p.c, 0.35);
  ellipse(ctx, -2, -3, 11, 4.5);
  if (p.variant) {
    ctx.strokeStyle = darken(p.c, 0.4);
    ctx.lineWidth = 3.4;
    [-6, 0, 5].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, -10);
      ctx.quadraticCurveTo(x - 4, 0, x, 10);
      ctx.stroke();
    });
  }
  ctx.fillStyle = p.c2 ?? '#fff8e7';
  ellipse(ctx, 6, 4, 6, 3.4, 0.3);
  ctx.fillStyle = '#26303f';
  circle(ctx, 9, -3, 2.6);
  ctx.fillStyle = '#fff8e7';
  circle(ctx, 9.7, -3.7, 1);
}

function drawSeaweed(ctx, p) {
  wavy(ctx, 0, 22, 0.1, 12, 2, 7, p.c);
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  [-6, 2, 9].forEach((x, i) => {
    ctx.beginPath();
    ctx.moveTo(x, 22);
    ctx.quadraticCurveTo(x + (i % 2 ? 12 : -12), 4, x + 1, -16 + i * 3);
    ctx.stroke();
  });
  ctx.strokeStyle = lighten(p.c, 0.3);
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-6, 20);
  ctx.quadraticCurveTo(2, 4, -5, -12);
  ctx.stroke();
}

function drawCoral(ctx, p) {
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 22);
  ctx.lineTo(0, -2);
  ctx.stroke();
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.quadraticCurveTo(side * 14, -4, side * 12, -18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.quadraticCurveTo(side * 15, 6, side * 17, -4);
    ctx.stroke();
  });
  ctx.fillStyle = lighten(p.c, 0.25);
  circle(ctx, -12, -18, 3.4);
  circle(ctx, 12, -18, 3.4);
  circle(ctx, -17, -4, 3);
  circle(ctx, 17, -4, 3);
}

function drawStarfish(ctx, p) {
  ctx.fillStyle = p.c;
  starPath(ctx, 0, 0, 17, 7, 5, -Math.PI / 2 + 0.3);
  ctx.fill();
  if (p.variant) {
    // A spot on every arm.
    for (let i = 0; i < 5; i += 1) {
      const a = -Math.PI / 2 + 0.3 + (i * Math.PI * 2) / 5;
      circle(ctx, Math.cos(a) * 11, Math.sin(a) * 11, 3.2);
    }
    circle(ctx, 0, 0, 3.2);
  } else {
    circle(ctx, 0, 0, 2.6);
    circle(ctx, 0, -8, 2.4);
  }
}

function drawShell(ctx, p) {
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(-14, 10);
  ctx.quadraticCurveTo(0, -20, 14, 10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = withAlpha(darken(p.c, 0.4), 0.5);
  ctx.lineWidth = 2.4;
  const ridges = p.variant ? 8 : 4;
  for (let i = 1; i < ridges; i += 1) {
    const t = i / ridges;
    ctx.beginPath();
    ctx.moveTo(-14 + 28 * t, 10);
    ctx.lineTo(0 + (t - 0.5) * 10, -2 - 8 * Math.sin(t * Math.PI));
    ctx.stroke();
  }
  // A dark hinge at the crown, wider on the variant: the shell reads as a different shell.
  ctx.fillStyle = darken(p.c, 0.34);
  ellipse(ctx, 0, 9.5, p.variant ? 13 : 7, p.variant ? 3.4 : 2.6);
  ctx.fillStyle = lighten(p.c, 0.3);
  ellipse(ctx, 0, 10, 14, 3);
}

function drawBubble(ctx, p) {
  ctx.strokeStyle = withAlpha(p.c, 0.85);
  ctx.lineWidth = 2.2;
  circle(ctx, 0, 0, 10);
  ctx.stroke();
  ctx.fillStyle = withAlpha(p.c, 0.22);
  circle(ctx, 0, 0, 10);
  ctx.fillStyle = withAlpha('#ffffff', 0.9);
  circle(ctx, -3.4, -3.4, 2.6);
}

function drawJellyfish(ctx, p) {
  ctx.fillStyle = withAlpha(p.c, 0.25);
  ellipse(ctx, 0, 4, 20, 17);
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.ellipse(0, 0, 17, 15, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = lighten(p.c, 0.4);
  circle(ctx, -5, -6, 4);
  ctx.strokeStyle = withAlpha(p.c, 0.85);
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  [-10, -3, 4, 11].forEach((x, i) => {
    ctx.beginPath();
    ctx.moveTo(x, 1);
    ctx.quadraticCurveTo(x + (i % 2 ? 6 : -6), 12, x + (i % 2 ? 1 : -1), 24);
    ctx.stroke();
  });
}

function drawCrab(ctx, p) {
  groundShadow(ctx, 0, 13, 17, 3.5);
  ctx.strokeStyle = darken(p.c, 0.25);
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  [-1, 1].forEach((side) => {
    [-1, 1].forEach((row) => {
      ctx.beginPath();
      ctx.moveTo(side * 9, 2 + row * 4);
      ctx.quadraticCurveTo(side * 17, 6 + row * 6, side * 15, 14 + row * 4);
      ctx.stroke();
    });
  });
  ctx.fillStyle = p.c;
  ellipse(ctx, 0, 3, 14, 10);
  ctx.fillStyle = lighten(p.c, 0.25);
  ellipse(ctx, -3, 0, 8, 4.5);
  // One claw grown far bigger than the other, the way a fiddler crab carries it: the crab is not
  // symmetrical to begin with, so turning it round is a difference too.
  const clawY = p.variant ? -8 : 2;
  [[-16, 10], [15, 6]].forEach(([cx, size]) => {
    const dir = cx < 0 ? -1 : 1;
    ctx.fillStyle = p.c;
    circle(ctx, cx, clawY, size);
    ctx.fillStyle = darken(p.c, 0.3);
    poly(ctx, [
      [cx + dir * 2, clawY - 2],
      [cx + dir * 3, clawY - size * 0.9],
      [cx - dir * 3, clawY - size * 0.4],
    ]);
  });
  ctx.fillStyle = '#fff8e7';
  circle(ctx, -5, -4, 3.4);
  circle(ctx, 5, -4, 3.4);
  ctx.fillStyle = '#22303f';
  circle(ctx, -5, -4, 1.6);
  circle(ctx, 5, -4, 1.6);
}

// ---------------------------------------------------------------- town

function drawHouse(ctx, p) {
  groundShadow(ctx, 0, 24, 20, 4);
  ctx.fillStyle = p.c;
  fillRoundRect(ctx, -17, -6, 34, 30, 3, p.c);
  ctx.fillStyle = p.c2 ?? '#c75b4a';
  poly(ctx, [[0, -28], [22, -6], [-22, -6]]);
  ctx.fillStyle = darken(p.c2 ?? '#c75b4a', 0.2);
  poly(ctx, [[0, -28], [22, -6], [0, -6]]);
  if (p.variant) {
    ctx.fillStyle = darken(p.c, 0.35);
    fillRoundRect(ctx, 10, -31, 10, 19, 2, darken(p.c, 0.35));
    ctx.fillStyle = withAlpha('#ffffff', 0.3);
    fillRoundRect(ctx, 10, -31, 10, 3.5, 1.5, withAlpha('#ffffff', 0.3));
  }
  ctx.fillStyle = darken(p.c, 0.45);
  fillRoundRect(ctx, -5, 8, 11, 16, 2.5, darken(p.c, 0.45));
  ctx.fillStyle = '#ffd166';
  circle(ctx, 4, 17, 1.4);
}

function drawWindow(ctx, p) {
  if (p.variant) {
    ctx.fillStyle = withAlpha('#ffd166', 0.28);
    circle(ctx, 0, 0, 20);
  }
  ctx.fillStyle = p.variant ? '#ffd166' : '#42506b';
  fillRoundRect(ctx, -10, -11, 20, 22, 2.5, p.variant ? '#ffd166' : '#42506b');
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 2.6;
  roundRect(ctx, -10, -11, 20, 22, 2.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.lineTo(0, 11);
  ctx.moveTo(-10, 0);
  ctx.lineTo(10, 0);
  ctx.stroke();
}

function drawLamp(ctx, p) {
  groundShadow(ctx, 0, 22, 8, 2.5);
  ctx.fillStyle = p.c;
  fillRoundRect(ctx, -2.5, -14, 5, 36, 2, p.c);
  fillRoundRect(ctx, -9, 20, 18, 5, 2, p.c);
  if (p.variant) {
    ctx.fillStyle = withAlpha('#ffe08a', 0.3);
    circle(ctx, 0, -17, 20);
  }
  ctx.fillStyle = p.variant ? '#ffe08a' : '#8a93a6';
  poly(ctx, [[-8, -12], [8, -12], [5, -24], [-5, -24]]);
  ctx.fillStyle = p.c2 ?? '#5b6478';
  poly(ctx, [[-6, -24], [6, -24], [0, -31]]);
}

function drawMailbox(ctx, p) {
  groundShadow(ctx, 0, 22, 8, 2.5);
  ctx.fillStyle = '#8a5a2b';
  fillRoundRect(ctx, -2.5, -4, 5, 26, 2, '#8a5a2b');
  ctx.fillStyle = p.c;
  fillRoundRect(ctx, -12, -16, 24, 14, 5, p.c);
  ctx.fillStyle = darken(p.c, 0.2);
  fillRoundRect(ctx, 2, -14, 3, 10, 1.5, darken(p.c, 0.2));
  ctx.strokeStyle = p.c2 ?? '#ff5d5d';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, -17);
  ctx.lineTo(-14, -19);
  ctx.stroke();
  if (p.variant) {
    // A parcel left waiting at the post.
    ctx.fillStyle = '#c98b4b';
    fillRoundRect(ctx, -22, 3, 16, 13, 2, '#c98b4b');
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-22, 9.5);
    ctx.lineTo(-6, 9.5);
    ctx.moveTo(-14, 3);
    ctx.lineTo(-14, 16);
    ctx.stroke();
  }
}

function drawCat(ctx, p) {
  groundShadow(ctx, 0, 15, 14, 3);
  ctx.fillStyle = p.c;
  ellipse(ctx, 0, 4, 13, 9);
  circle(ctx, 9, -6, 8);
  poly(ctx, [[4, -12], [5, -20], [11, -13]]);
  poly(ctx, [[14, -12], [15, -20], [9, -13]]);
  ctx.fillStyle = lighten(p.c, 0.3);
  circle(ctx, 9, 0, 5);
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (p.variant) {
    ctx.moveTo(-11, 2);
    ctx.quadraticCurveTo(-20, -4, -16, -14);
  } else {
    ctx.moveTo(-11, 6);
    ctx.quadraticCurveTo(-22, 8, -20, 14);
  }
  ctx.stroke();
  ctx.fillStyle = '#22303f';
  circle(ctx, 7, -7, 1.6);
  circle(ctx, 11.5, -7, 1.6);
  ctx.fillStyle = '#ff9db1';
  poly(ctx, [[9, -3], [11, -3], [10, -1.4]]);
}

// ---------------------------------------------------------------- the shore

function drawPalm(ctx, p) {
  groundShadow(ctx, 0, 25, 15, 4);
  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 25);
  ctx.quadraticCurveTo(-4, 0, -8, -20);
  ctx.stroke();
  ctx.strokeStyle = lighten('#a16207', 0.25);
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-1, 24);
  ctx.quadraticCurveTo(-5, 0, -9, -19);
  ctx.stroke();
  const fronds = [[-30, -32], [-12, -40], [8, -38], [24, -28], [-4, -24]];
  fronds.forEach(([dx, dy], i) => {
    ctx.strokeStyle = i % 2 ? p.c : darken(p.c, 0.12);
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-8, -20);
    ctx.quadraticCurveTo(dx * 0.5, dy, dx, dy + 6);
    ctx.stroke();
  });
  if (p.variant) {
    ctx.fillStyle = '#7a4a1e';
    circle(ctx, -14, -17, 4.6);
    circle(ctx, -5, -13, 4.2);
    circle(ctx, 3, -19, 4);
  }
}

function drawUmbrella(ctx, p) {
  groundShadow(ctx, 0, 26, 16, 4);
  ctx.fillStyle = '#e8e0cf';
  fillRoundRect(ctx, -2, -14, 4, 40, 2, '#e8e0cf');
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(-28, -12);
  ctx.quadraticCurveTo(0, -40, 28, -12);
  ctx.closePath();
  ctx.fill();
  // Two light panels, or the same panels in the trim colour: the canopy carries the difference.
  ctx.fillStyle = p.variant ? (p.c2 ?? '#3f8f4f') : withAlpha('#ffffff', 0.75);
  ctx.beginPath();
  ctx.moveTo(-28, -12);
  ctx.quadraticCurveTo(-14, -30, 0, -32);
  ctx.quadraticCurveTo(-8, -22, -9, -12);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(9, -12);
  ctx.quadraticCurveTo(18, -24, 28, -12);
  ctx.quadraticCurveTo(18, -20, 9, -12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.c2 ?? '#3f8f4f';
  circle(ctx, 0, -38, 3.2);
}

function drawSandcastle(ctx, p) {
  groundShadow(ctx, 0, 22, 22, 4);
  ctx.fillStyle = p.c;
  fillRoundRect(ctx, -18, -8, 36, 28, 3, p.c);
  [-18, 0, 18].forEach((x) => {
    fillRoundRect(ctx, x - 6, -20, 12, 14, 2.5, p.c);
    fillRoundRect(ctx, x - 6, -24, 4, 6, 1, p.c);
    fillRoundRect(ctx, x - 1, -24, 4, 6, 1, p.c);
    fillRoundRect(ctx, x + 4, -24, 4, 6, 1, p.c);
  });
  ctx.fillStyle = darken(p.c, 0.22);
  fillRoundRect(ctx, -6, 6, 12, 14, 2, darken(p.c, 0.22));
  if (p.variant) {
    // A bright arched doorway in the middle tower.
    ctx.fillStyle = lighten(p.c, 0.32);
    ctx.beginPath();
    ctx.moveTo(-8, 20);
    ctx.lineTo(-8, 7);
    ctx.quadraticCurveTo(0, -1, 8, 7);
    ctx.lineTo(8, 20);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBall(ctx, p) {
  groundShadow(ctx, 0, 15, 13, 3);
  ctx.fillStyle = p.c;
  circle(ctx, 0, 0, 14);
  ctx.fillStyle = p.c2 ?? '#fff8e7';
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 14, 0.6, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 14, -0.6, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = lighten(p.c, 0.4);
  circle(ctx, -4, -5, 4);
}

function drawBoat(ctx, p) {
  ctx.fillStyle = withAlpha(p.c2 ?? '#0ea5e9', 0.3);
  ellipse(ctx, 0, 10, 30, 6);
  ctx.fillStyle = p.c;
  ctx.beginPath();
  ctx.moveTo(-24, -2);
  ctx.lineTo(24, -2);
  ctx.quadraticCurveTo(12, 14, -12, 14);
  ctx.quadraticCurveTo(-22, 10, -24, -2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = darken(p.c, 0.25);
  fillRoundRect(ctx, -1.5, -30, 3, 30, 1.5, darken(p.c, 0.25));
  ctx.fillStyle = p.c2 ?? '#fff8e7';
  poly(ctx, [[2, -28], [20, -8], [2, -8]]);
  if (p.variant) {
    ctx.fillStyle = lighten(p.c, 0.55);
    fillRoundRect(ctx, -19, 3, 38, 5, 2.5, lighten(p.c, 0.55));
    ctx.fillStyle = '#ff6b6b';
    poly(ctx, [[1.5, -32], [15, -26], [1.5, -20]]);
  }
}

function drawGull(ctx, p) {
  ctx.strokeStyle = p.c;
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  // A shallow glide, or the wings lifted high: a gull rising on a thermal.
  const lift = p.variant ? -16 : -3;
  ctx.beginPath();
  ctx.moveTo(-14, 2);
  ctx.quadraticCurveTo(-6, lift, 0, p.variant ? -5 : 0);
  ctx.quadraticCurveTo(6, lift, 14, 2);
  ctx.stroke();
  ctx.fillStyle = p.c2 ?? '#ffffff';
  ellipse(ctx, 0, p.variant ? -4 : 1, 5, 3);
}

function drawLighthouse(ctx, p) {
  groundShadow(ctx, 0, 26, 15, 4);
  ctx.fillStyle = '#f8f4ea';
  ctx.beginPath();
  ctx.moveTo(-11, 26);
  ctx.lineTo(-7, -16);
  ctx.lineTo(7, -16);
  ctx.lineTo(11, 26);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = p.c;
  [-6, 2, 12].forEach((y) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-10, y);
    ctx.lineTo(-7 + (y / 26) * 0, y);
    ctx.lineTo(10, y + 6);
    ctx.lineTo(-10, y + 6);
    ctx.closePath();
    ctx.fillStyle = p.c;
    ctx.globalAlpha = 1;
    ctx.fill();
    ctx.restore();
  });
  ctx.fillStyle = '#33415c';
  fillRoundRect(ctx, -9, -24, 18, 9, 2, '#33415c');
  if (p.variant) {
    ctx.fillStyle = withAlpha('#ffe08a', 0.35);
    circle(ctx, 0, -20, 16);
    poly(ctx, [[0, -22], [40, -34], [40, -6]]);
  }
  ctx.fillStyle = p.variant ? '#ffe08a' : '#8a93a6';
  fillRoundRect(ctx, -6, -22, 12, 6, 1.5, p.variant ? '#ffe08a' : '#8a93a6');
  ctx.fillStyle = '#33415c';
  poly(ctx, [[-10, -24], [10, -24], [0, -32]]);
}

// ---------------------------------------------------------------- the catalogue

// r: the clickable radius of a difference hidden on this prop. flip / tilt / variants /
// two-tone flags say which mutations the difference picker is allowed to use on it.
export const CATALOG = {
  sun: { r: 44, draw: drawSun, c: '#ffd45e' },
  cloud: { r: 44, draw: drawCloud, c: '#ffffff' },
  moon: { r: 42, draw: drawMoon, c: '#ffeaa7', variants: true },
  star: { r: 30, draw: drawStar, c: '#fff6d6', variants: true },
  planet: { r: 42, draw: drawPlanet, c: '#f59e0b', c2: '#fcd34d', variants: true },
  comet: { r: 34, draw: drawComet, c: '#bde3ff', c2: '#9ad8ff', variants: true, tiltOk: true },
  asteroid: { r: 30, draw: drawAsteroid, c: '#8b8f9c' },
  satellite: { r: 42, draw: drawSatellite, c: '#cbd5e1', c2: '#7dd3fc', variants: true, tiltOk: true },
  rocket: { r: 42, draw: drawRocket, c: '#e63946', c2: '#8ecae6', variants: true, tiltOk: true },
  ufo: { r: 42, draw: drawUfo, c: '#b8c2d0', c2: '#9aa5b1', variants: true, tiltOk: true },
  pine: { r: 36, draw: drawPine, c: '#2f7d4f', c2: '#ffd166', variants: true },
  tree: { r: 40, draw: drawTree, c: '#3f9d5a', c2: '#e8503a', variants: true },
  bush: { r: 32, draw: drawBush, c: '#4fae63' },
  flower: { r: 30, draw: drawFlower, c: '#ff7fa8', c2: '#ffd166', variants: true },
  mushroom: { r: 32, draw: drawMushroom, c: '#e8503a', variants: true },
  rock: { r: 34, draw: drawRock, c: '#9aa1ad' },
  pond: { r: 46, draw: drawPond, c: '#4aa3e0' },
  fence: { r: 38, draw: drawFence, c: '#c9a227' },
  butterfly: { r: 32, draw: drawButterfly, c: '#ff8fa3', c2: '#7c5cff', variants: true, tiltOk: true },
  kite: { r: 36, draw: drawKite, c: '#ff6b6b', c2: '#ffd166', variants: true, tiltOk: true },
  grass: { r: 28, draw: drawGrass, c: '#3f9d5a' },
  fish: { r: 34, draw: drawFish, c: '#ffb703', c2: '#ff9f1c', variants: true, flipOk: true, tiltOk: true },
  seaweed: { r: 34, draw: drawSeaweed, c: '#2dd4bf' },
  coral: { r: 36, draw: drawCoral, c: '#ff7a8a' },
  starfish: { r: 32, draw: drawStarfish, c: '#ff9f68', variants: true, tiltOk: true },
  shell: { r: 30, draw: drawShell, c: '#f7c8e0', variants: true, tiltOk: true },
  bubble: { r: 24, draw: drawBubble, c: '#a5e8ff' },
  jellyfish: { r: 38, draw: drawJellyfish, c: '#c084fc', tiltOk: true },
  crab: { r: 36, draw: drawCrab, c: '#f2545b', c2: '#ffffff', variants: true, flipOk: true },
  house: { r: 42, draw: drawHouse, c: '#f4b5a0', c2: '#c75b4a', variants: true },
  window: { r: 30, draw: drawWindow, c: '#8a5a2b', variants: true },
  lamp: { r: 34, draw: drawLamp, c: '#41506b', c2: '#5b6478', variants: true },
  mailbox: { r: 30, draw: drawMailbox, c: '#4f7cff', c2: '#ff5d5d', variants: true, flipOk: true },
  cat: { r: 34, draw: drawCat, c: '#6b7280', variants: true, flipOk: true },
  palm: { r: 42, draw: drawPalm, c: '#16a34a', variants: true },
  umbrella: { r: 40, draw: drawUmbrella, c: '#ff6b6b', c2: '#3f8f4f', variants: true, tiltOk: true },
  sandcastle: { r: 40, draw: drawSandcastle, c: '#f8d68a', variants: true },
  ball: { r: 30, draw: drawBall, c: '#ff6b6b', c2: '#fff8e7' },
  boat: { r: 38, draw: drawBoat, c: '#c1440e', c2: '#fff8e7', variants: true, flipOk: true },
  gull: { r: 30, draw: drawGull, c: '#f8f4ea', c2: '#ffffff', variants: true, tiltOk: true },
  lighthouse: { r: 42, draw: drawLighthouse, c: '#e8503a', variants: true },
};

// The small, quiet objects a scene can gain: the `add` difference puts one of these where the
// other panel has nothing, so the extra thing is the difference.
export const EXTRA_KINDS = ['flower', 'star', 'bubble', 'butterfly', 'mushroom', 'shell', 'grass', 'gull'];

export const FLIPPABLE = new Set(Object.keys(CATALOG).filter((k) => CATALOG[k].flipOk));
export const TILTABLE = new Set(Object.keys(CATALOG).filter((k) => CATALOG[k].tiltOk));
export const VARIED = new Set(Object.keys(CATALOG).filter((k) => CATALOG[k].variants));
export const TWO_TONE = new Set(Object.keys(CATALOG).filter((k) => CATALOG[k].c2));

export function makeProp(kind, x, y, opts = {}) {
  const def = CATALOG[kind];
  if (!def) throw new Error(`unknown prop kind ${kind}`);
  return {
    kind,
    x,
    y,
    s: opts.s ?? 1,
    c: opts.c ?? def.c,
    c2: opts.c2 ?? def.c2 ?? def.c,
    flip: Boolean(opts.flip),
    rot: opts.rot ?? 0,
    variant: opts.variant ? 1 : 0,
    r: opts.r ?? def.r,
    seed: opts.seed ?? 1,
    depth: opts.depth ?? 0,
  };
}

export function drawProp(ctx, prop) {
  const def = CATALOG[prop.kind];
  if (!def) return;
  ctx.save();
  ctx.translate(prop.x, prop.y);
  if (prop.rot) ctx.rotate(prop.rot);
  ctx.scale(prop.flip ? -prop.s : prop.s, prop.s);
  def.draw(ctx, prop);
  ctx.restore();
}

export function shadeForProp(prop) {
  return { light: lighten(prop.c, 0.3), dark: darken(prop.c, 0.3) };
}

// Canvas 2D drawing primitives and colour helpers. One job: the small vocabulary every shape,
// panel and marker is built from, so the art stays consistent and the code stays short.
import { UI } from './config.js';

export function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function ellipse(ctx, x, y, rx, ry, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
}

export function ring(ctx, x, y, r, width, color, dash = null) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  if (dash) ctx.setLineDash(dash);
  ctx.stroke();
  if (dash) ctx.setLineDash([]);
}

export function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

export function fillRoundRect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  roundRect(ctx, x, y, w, h, r);
  ctx.fill();
}

export function strokeRoundRect(ctx, x, y, w, h, r, width, color) {
  roundRect(ctx, x, y, w, h, r);
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.stroke();
}

export function poly(ctx, points, close = true) {
  ctx.beginPath();
  points.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  if (close) ctx.closePath();
  ctx.fill();
}

export function strokePoly(ctx, points, width, color, close = true) {
  ctx.beginPath();
  points.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  if (close) ctx.closePath();
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

export function starPath(ctx, x, y, outer, inner, points, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rot + (i * Math.PI) / points;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// An organic closed blob, so rocks, bushes and nebulas are never the same twice.
export function blob(ctx, rng, cx, cy, radius, wobble, steps = 9) {
  const points = [];
  for (let i = 0; i < steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    const r = radius * (1 - wobble + rng.next() * wobble * 2);
    points.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  ctx.beginPath();
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(points[steps - 1], points[0]);
  ctx.moveTo(start[0], start[1]);
  for (let i = 0; i < steps; i += 1) {
    const next = mid(points[i], points[(i + 1) % steps]);
    ctx.quadraticCurveTo(points[i][0], points[i][1], next[0], next[1]);
  }
  ctx.closePath();
}

// A wavy stroke, for water, seaweed, smoke and dashed trails.
export function wavy(ctx, x, y, length, amplitude, waves, width, color) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  const step = length / (waves * 2);
  for (let i = 0; i < waves * 2; i += 1) {
    const dir = i % 2 === 0 ? -1 : 1;
    ctx.quadraticCurveTo(x + step * (i + 0.5), y + amplitude * dir, x + step * (i + 1), y);
  }
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.stroke();
}

export function linear(ctx, x0, y0, x1, y1, stops) {
  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([at, color]) => grad.addColorStop(at, color));
  return grad;
}

export function radial(ctx, x, y, r0, r1, stops) {
  const grad = ctx.createRadialGradient(x, y, r0, x, y, r1);
  stops.forEach(([at, color]) => grad.addColorStop(at, color));
  return grad;
}

export function label(ctx, text, x, y, opts = {}) {
  ctx.font = opts.font ?? UI.fontSmall;
  ctx.fillStyle = opts.color ?? UI.ink;
  ctx.textAlign = opts.align ?? 'left';
  ctx.textBaseline = opts.baseline ?? 'alphabetic';
  if (opts.shadow) {
    ctx.shadowColor = opts.shadow;
    ctx.shadowBlur = opts.shadowBlur ?? 8;
    ctx.shadowOffsetY = opts.shadowOffsetY ?? 0;
  }
  ctx.fillText(text, x, y);
  if (opts.shadow) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
}

export function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const value = Number.parseInt(full, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function withAlpha(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function mix(a, b, t) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const to = (v1, v2) => Math.round(v1 + (v2 - v1) * t);
  return `rgb(${to(r1, r2)},${to(g1, g2)},${to(b1, b2)})`;
}

export const lighten = (hex, t) => mix(hex, '#ffffff', t);
export const darken = (hex, t) => mix(hex, '#000000', t);
export const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

// A soft contact shadow under a prop, so scene objects sit on the ground instead of floating.
export function groundShadow(ctx, x, y, rx, ry, alpha = 0.16) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ellipse(ctx, x, y, rx, ry);
}

// Input. One job: turn the mouse and the keyboard into the handful of things the game reacts to
// — a mark placed on a panel, a hint, a pause, a mute, and the continue key.
import { PANEL, VIEW } from './config.js';

const KEYS = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
  a: 'left', d: 'right', w: 'up', s: 'down',
  h: 'hint', p: 'pause', m: 'mute', n: 'next', r: 'restart', Enter: 'confirm', ' ': 'confirm',
};

export function createInput(canvas) {
  const crosshair = { x: 294, y: 300, visible: false };
  const state = { dir: { x: 0, y: 0 }, held: new Set(), queue: [], pointerDown: false, lastPointer: null };

  function toCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = VIEW.w / rect.width;
    const scaleY = VIEW.h / rect.height;
    return { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY };
  }

  // Which panel a frame point falls in, and where in the scene that is.
  function locate(point) {
    const y = point.y;
    if (y < PANEL.y || y > PANEL.y + PANEL.size) return null;
    for (const side of ['left', 'right']) {
      const x0 = side === 'left' ? PANEL.leftX : PANEL.rightX;
      if (point.x >= x0 && point.x <= x0 + PANEL.size) {
        return { side, x: point.x - x0, y: y - PANEL.y };
      }
    }
    return null;
  }

  canvas.addEventListener('pointerdown', (event) => {
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // A pointer the browser no longer knows about: the click still counts.
    }
    const point = toCanvas(event);
    state.pointerDown = true;
    const hit = locate(point);
    if (hit) crosshair.x = hit.x;
    if (hit) crosshair.y = hit.y;
    crosshair.visible = Boolean(hit);
    state.queue.push({ type: 'mark', point, hit });
  });

  canvas.addEventListener('pointermove', (event) => {
    const point = toCanvas(event);
    state.lastPointer = point;
    const hit = locate(point);
    if (hit) {
      crosshair.x = hit.x;
      crosshair.y = hit.y;
      crosshair.visible = true;
    }
  });

  canvas.addEventListener('pointerup', (event) => {
    state.pointerDown = false;
    try {
      canvas.releasePointerCapture(event.pointerId);
    } catch {
      // Never captured: nothing to release.
    }
  });

  canvas.addEventListener('pointerleave', () => {
    state.pointerDown = false;
    crosshair.visible = false;
  });

  window.addEventListener('keydown', (event) => {
    const action = KEYS[event.key] ?? KEYS[event.key.toLowerCase()];
    if (!action) return;
    if (event.key === ' ' || event.key.startsWith('Arrow')) event.preventDefault();
    if (!state.held.has(action)) state.queue.push({ type: 'key', action });
    state.held.add(action);
    if (action === 'left') state.dir.x = -1;
    if (action === 'right') state.dir.x = 1;
    if (action === 'up') state.dir.y = -1;
    if (action === 'down') state.dir.y = 1;
  });

  window.addEventListener('keyup', (event) => {
    const action = KEYS[event.key] ?? KEYS[event.key.toLowerCase()];
    if (!action) return;
    state.held.delete(action);
    if (action === 'left' && state.dir.x < 0) state.dir.x = 0;
    if (action === 'right' && state.dir.x > 0) state.dir.x = 0;
    if (action === 'up' && state.dir.y < 0) state.dir.y = 0;
    if (action === 'down' && state.dir.y > 0) state.dir.y = 0;
  });

  window.addEventListener('blur', () => {
    state.held.clear();
    state.dir.x = 0;
    state.dir.y = 0;
  });

  return {
    crosshair,
    locate,
    take() {
      const items = state.queue.slice();
      state.queue.length = 0;
      return items;
    },
    moveCrosshair(dt) {
      const speed = 420;
      crosshair.x = Math.max(8, Math.min(PANEL.size - 8, crosshair.x + state.dir.x * speed * dt));
      crosshair.y = Math.max(8, Math.min(PANEL.size - 8, crosshair.y + state.dir.y * speed * dt));
    },
  };
}

// Every shared number and colour the game uses, in one place: the frame, the two panels, the
// scene scenes and the difficulty curve all read from here, so one edit moves them together.
export const VIEW = { w: 1280, h: 720 };

// The two panels sit side by side inside the frame. A scene is authored in a square of WORLD
// units and drawn into the left panel and, mutated, into the right one.
export const WORLD = 588;
export const PANEL = { size: WORLD, leftX: 40, rightX: 652, y: 92, radius: 18, frame: 5 };
export const HEADER_H = 84;
export const FOOTER_Y = 684;

// The frame's own palette (the scenes carry their own).
export const UI = {
  backdrop: '#0b1020',
  panelEdge: '#f2e8d0',
  ink: '#f7f1e2',
  inkDim: '#a9a396',
  chip: '#151c30',
  chipEdge: 'rgba(255,255,255,0.16)',
  accent: '#ffc247',
  cyan: '#6fe3f7',
  good: '#79e8b4',
  bad: '#ff8974',
  font: '700 30px system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontSmall: '600 15px system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontTiny: '700 12px system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontBig: '800 46px system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

// One row per scene: which scene, how many differences it hides, and how long it gives.
export const LEVELS = [
  { scene: 'meadow', count: 5, seconds: 110 },
  { scene: 'reef', count: 6, seconds: 120 },
  { scene: 'space', count: 7, seconds: 130 },
  { scene: 'town', count: 8, seconds: 140 },
  { scene: 'beach', count: 9, seconds: 150 },
];

export const RULES = {
  hintsPerScene: 3,
  hintPenaltySec: 15,
  missPenaltySec: 5,
  findScore: 100,
  hintCostScore: 60,
  streakBonus: 25, // extra score per find while a streak is alive
  timeBonusPerSec: 4,
  hintRingMs: 3600,
  missRingMs: 420,
  minDiffGap: 104, // no two differences closer than this, so a click is never ambiguous
  edgeMargin: 50,
};

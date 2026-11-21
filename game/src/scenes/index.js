// The scene registry. One job: name every scene once, in the order the game plays them.
import { meadow } from './meadow.js';
import { reef } from './reef.js';
import { space } from './space.js';
import { town } from './town.js';
import { beach } from './beach.js';

export const SCENES = { meadow, reef, space, town, beach };

export const SCENE_ORDER = ['meadow', 'reef', 'space', 'town', 'beach'];

export function sceneById(id) {
  const scene = SCENES[id];
  if (!scene) throw new Error(`unknown scene ${id}`);
  return scene;
}

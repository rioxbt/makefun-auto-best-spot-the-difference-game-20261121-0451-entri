// Hands the entry in. The playable game in game/ and the screenshots in screenshots/ are copied
// to the output directory, and dossier.json — the summary the judge reads — is written from them
// with the vendored make.fun library. Node 22 or later, the standard library only, no build step.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Inside the grader MAKEFUN_OUTPUT_DIR is unset and /output is the writable directory.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps: text_max_bytes shapes the dossier's bytes, the rest are the limits the
// scorer refuses an entry on, so failing here fails where the scorer would.
const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

mkdirSync(out, { recursive: true });

for (const part of ['game', 'screenshots']) {
  const from = join(root, part);
  if (!existsSync(from)) throw new Error(`main.ts: ${part}/ is missing beside the entrypoint`);
  cpSync(from, join(out, part), { recursive: true });
}

const dossier = buildDossier(out, caps);
writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`handed in ${dossier.byteLength} bytes of dossier from ${out}/game and ${out}/screenshots`);

/**
 * Regenerates the SHA-256 CSP hashes for the inline scripts Astro injects to hydrate
 * client islands. Run after upgrading Astro, then paste the output into
 * ASTRO_INLINE_SCRIPT_HASHES in src/middleware.ts:
 *
 *   node scripts/csp-hashes.mjs
 */
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const files = {
  'astro-island bootstrap': 'node_modules/astro/dist/runtime/server/astro-island.prebuilt.js',
  'client:load directive': 'node_modules/astro/dist/runtime/client/load.prebuilt.js',
};

for (const [label, path] of Object.entries(files)) {
  // Imported by absolute file URL because Astro's package "exports" map blocks the subpath.
  const mod = await import(pathToFileURL(resolve(path)).href);
  const hash = 'sha256-' + createHash('sha256').update(mod.default, 'utf8').digest('base64');
  console.log(`  "'${hash}'", // ${label}`);
}

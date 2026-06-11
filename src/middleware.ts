import { defineMiddleware } from 'astro:middleware';
import { isValidSessionToken, SESSION_COOKIE } from './lib/auth';

const PUBLIC_PATHS = new Set(['/login', '/_actions/auth.login']);

/**
 * SHA-256 hashes of the inline scripts Astro injects to hydrate client islands
 * (the `client:load` directive script + the astro-island bootstrap). They let us
 * keep `script-src` free of `'unsafe-inline'`.
 * Regenerate with `node scripts/csp-hashes.mjs` after upgrading Astro.
 */
const ASTRO_INLINE_SCRIPT_HASHES = [
  "'sha256-SaCkFfPruIdTXT8/97JArQmGxiJAL2o4bBDvSgJ5y3Q='", // astro-island bootstrap
  "'sha256-QzWFZi+FLIx23tnm9SBU4aEgx4x8DsuASP07mfqol/c='", // client:load directive
];

function buildCsp(): string {
  // Dev (Vite) injects its own inline scripts, uses eval and an HMR websocket, so the
  // production hashes don't apply there. Relax script/connect for the dev server only.
  const scriptSrc = import.meta.env.DEV
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : `script-src 'self' ${ASTRO_INLINE_SCRIPT_HASHES.join(' ')}`;
  const connectSrc = import.meta.env.DEV ? "connect-src 'self' ws:" : "connect-src 'self'";

  return [
    "default-src 'self'",
    scriptSrc,
    // The chart components (Meter/Ring/PairBars) and a couple of pages use dynamic
    // inline `style=` attributes; those require 'unsafe-inline'. A hash or nonce in
    // style-src would void 'unsafe-inline' (CSP3) and break them, so we keep it.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    connectSrc,
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');
}

const CSP = buildCsp();

/**
 * Static assets bypass the auth gate. Action endpoints live under `/_actions/` and must
 * NEVER be treated as assets: their names end in `.<actionName>`, which would otherwise
 * match the file-extension check and skip authentication entirely.
 */
function isStaticAsset(pathname: string): boolean {
  if (pathname.startsWith('/_actions/')) return false;
  return pathname.startsWith('/_astro/') || /\.[a-z0-9]+$/i.test(pathname);
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  let response: Response;
  if (isStaticAsset(pathname) || PUBLIC_PATHS.has(pathname)) {
    response = await next();
  } else {
    const token = context.cookies.get(SESSION_COOKIE)?.value;
    if (!isValidSessionToken(token)) {
      if (pathname.startsWith('/_actions/')) {
        return new Response(JSON.stringify({ error: 'No autenticado' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return context.redirect('/login');
    }
    response = await next();
  }

  response.headers.set('Content-Security-Policy', CSP);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
});

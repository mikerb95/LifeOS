import { defineMiddleware } from 'astro:middleware';
import { isValidSessionToken, SESSION_COOKIE } from './lib/auth';

const PUBLIC_PATHS = new Set(['/login', '/_actions/auth.login']);

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

function isAsset(pathname: string): boolean {
  return pathname.startsWith('/_astro/') || /\.[a-z0-9]+$/i.test(pathname);
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  let response: Response;
  if (isAsset(pathname) || PUBLIC_PATHS.has(pathname)) {
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

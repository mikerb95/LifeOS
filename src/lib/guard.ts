import { ActionError, type ActionAPIContext } from 'astro:actions';
import { isValidSessionToken, SESSION_COOKIE } from './auth';

/**
 * Defense in depth: re-validate the session cookie inside each action, independently of
 * the middleware. The middleware is the primary gate, but actions are too sensitive
 * (they delete finances, health and journal data) to rely on a single chokepoint.
 * Throws a 401 ActionError when the session is missing or invalid.
 */
export function requireAuth(context: ActionAPIContext): void {
  const token = context.cookies.get(SESSION_COOKIE)?.value;
  if (!isValidSessionToken(token)) {
    throw new ActionError({ code: 'UNAUTHORIZED', message: 'No autenticado.' });
  }
}

import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  clearLoginAttempts,
  createSessionToken,
  getLockout,
  recordFailedLogin,
  verifyPassword,
} from '../lib/auth';

function clientIdentifier(context: { clientAddress?: string; request: Request }): string {
  try {
    return context.clientAddress || context.request.headers.get('x-forwarded-for') || 'global';
  } catch {
    return 'global';
  }
}

export const auth = {
  login: defineAction({
    accept: 'form',
    input: z.object({
      password: z.string().min(1, 'Introduce la contraseña.'),
    }),
    handler: async ({ password }, context) => {
      const identifier = clientIdentifier(context);

      const lockout = await getLockout(identifier);
      if (lockout !== null) {
        const minutos = Math.ceil(lockout / 60000);
        throw new ActionError({
          code: 'TOO_MANY_REQUESTS',
          message: `Demasiados intentos. Inténtalo de nuevo en ${minutos} min.`,
        });
      }

      const ok = await verifyPassword(password);
      if (!ok) {
        await recordFailedLogin(identifier);
        throw new ActionError({ code: 'UNAUTHORIZED', message: 'Contraseña incorrecta.' });
      }

      await clearLoginAttempts(identifier);
      context.cookies.set(SESSION_COOKIE, createSessionToken(), {
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE_SECONDS,
      });

      return { success: true };
    },
  }),

  logout: defineAction({
    accept: 'form',
    handler: async (_input, context) => {
      context.cookies.delete(SESSION_COOKIE, { path: '/' });
      return { success: true };
    },
  }),
};

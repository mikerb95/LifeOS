import { createHmac, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { loginAttempts } from '../db/schema';

export const SESSION_COOKIE = 'lifeos_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function getSecret(): string {
  const secret = import.meta.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET no está configurado');
  return secret;
}

function sign(value: string): string {
  return createHmac('sha256', getSecret()).update(value).digest('base64url');
}

/** Stateless signed session token: base64url(payload).base64url(hmac). */
export function createSessionToken(): string {
  const exp = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;

  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

/** Returns null if the request is allowed, or the number of ms remaining if locked out. */
export async function getLockout(identifier: string): Promise<number | null> {
  const [row] = await db.select().from(loginAttempts).where(eq(loginAttempts.identifier, identifier));
  if (!row?.lockedUntil) return null;
  const remaining = row.lockedUntil.getTime() - Date.now();
  return remaining > 0 ? remaining : null;
}

export async function recordFailedLogin(identifier: string): Promise<void> {
  const [row] = await db.select().from(loginAttempts).where(eq(loginAttempts.identifier, identifier));
  const attempts = (row?.attempts ?? 0) + 1;
  const lockedUntil = attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MS) : null;
  await db
    .insert(loginAttempts)
    .values({ identifier, attempts, lockedUntil, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: loginAttempts.identifier,
      set: { attempts, lockedUntil, updatedAt: new Date() },
    });
}

export async function clearLoginAttempts(identifier: string): Promise<void> {
  await db.delete(loginAttempts).where(eq(loginAttempts.identifier, identifier));
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = import.meta.env.AUTH_PASSWORD_HASH;
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

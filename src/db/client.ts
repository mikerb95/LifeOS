import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const url = import.meta.env.TURSO_DATABASE_URL || 'file:./local.db';
const authToken = import.meta.env.TURSO_AUTH_TOKEN;

export const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });

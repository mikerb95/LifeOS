import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { settings } from '../db/schema';

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const [row] = await db.select().from(settings).where(eq(settings.key, key));
  if (!row) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const json = JSON.stringify(value);
  await db
    .insert(settings)
    .values({ key, value: json, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value: json, updatedAt: new Date() } });
}

// ---------- claves conocidas ----------

export const SETTINGS_KEYS = {
  pesoObjetivo: 'bienestar.pesoObjetivo',
  suenoObjetivo: 'bienestar.suenoObjetivo',
  entrenosObjetivoSemana: 'bienestar.entrenosObjetivoSemana',
  kcalObjetivo: 'bienestar.kcalObjetivo',
  proteinaObjetivo: 'bienestar.proteinaObjetivo',
  horasObjetivoSemana: 'estudio.horasObjetivoSemana',
  librosObjetivoAnio: 'crecimiento.librosObjetivoAnio',
  mascotaPerfil: 'mascota.perfil',
  vehiculoPerfil: 'vehiculo.perfil',
} as const;

export interface MascotaPerfil {
  nombre: string;
  tipo: string;
}

export interface VehiculoPerfil {
  nombre: string;
  matricula: string;
  aceiteIntervaloKm: number;
  aceiteUltimoKm: number;
}

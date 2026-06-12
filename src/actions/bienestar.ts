import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireAuth } from '../lib/guard';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { biomarcadores, comidas, entrenos } from '../db/schema';
import { todayISO } from '../lib/dates';
import { setSetting, SETTINGS_KEYS } from '../lib/settings';

/** Parses an optional numeric string (allows comma decimals). Returns null for empty input. */
function parseOptionalNumber(value: string | undefined, label: string, integer = false): number | null {
  const raw = (value ?? '').trim().replace(',', '.');
  if (!raw) return null;
  const n = Number(raw);
  if (Number.isNaN(n)) {
    throw new ActionError({ code: 'BAD_REQUEST', message: `${label}: introduce un número válido.` });
  }
  return integer ? Math.round(n) : n;
}

export const bienestar = {
  guardarObjetivos: defineAction({
    accept: 'form',
    input: z.object({
      pesoObjetivo: z.coerce.number(),
      suenoObjetivo: z.coerce.number(),
      entrenosObjetivoSemana: z.coerce.number(),
      kcalObjetivo: z.coerce.number(),
      proteinaObjetivo: z.coerce.number(),
    }),
    handler: async ({ pesoObjetivo, suenoObjetivo, entrenosObjetivoSemana, kcalObjetivo, proteinaObjetivo }, context) => {
      requireAuth(context);
      await setSetting(SETTINGS_KEYS.pesoObjetivo, pesoObjetivo);
      await setSetting(SETTINGS_KEYS.suenoObjetivo, suenoObjetivo);
      await setSetting(SETTINGS_KEYS.entrenosObjetivoSemana, entrenosObjetivoSemana);
      await setSetting(SETTINGS_KEYS.kcalObjetivo, kcalObjetivo);
      await setSetting(SETTINGS_KEYS.proteinaObjetivo, proteinaObjetivo);

      return { success: true };
    },
  }),

  crearComida: defineAction({
    accept: 'form',
    input: z.object({
      nombre: z.string().min(1),
      detalle: z.string().optional(),
      kcal: z.string().optional(),
      proteinaG: z.string().optional(),
    }),
    handler: async ({ nombre, detalle, kcal, proteinaG }, context) => {
      requireAuth(context);
      const kcalValor = parseOptionalNumber(kcal, 'Calorías', true);
      const proteinaValor = parseOptionalNumber(proteinaG, 'Proteína');

      await db.insert(comidas).values({
        fecha: todayISO(),
        nombre,
        detalle: detalle?.trim() || null,
        kcal: kcalValor,
        proteinaG: proteinaValor,
      });

      return { success: true };
    },
  }),

  borrarComida: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.delete(comidas).where(eq(comidas.id, id));
      return { success: true };
    },
  }),

  borrarEntreno: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.delete(entrenos).where(eq(entrenos.id, id));
      return { success: true };
    },
  }),

  crearBiomarcador: defineAction({
    accept: 'form',
    input: z.object({
      nombre: z.string().min(1),
      valor: z.string().min(1),
      unidad: z.string().min(1),
      fecha: z.string().min(1),
      estado: z.enum(['ok', 'medio', 'alto']),
    }),
    handler: async ({ nombre, valor, unidad, fecha, estado }) => {
      await db.insert(biomarcadores).values({ nombre, valor, unidad, fecha, estado });
      return { success: true };
    },
  }),

  borrarBiomarcador: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.delete(biomarcadores).where(eq(biomarcadores.id, id));
      return { success: true };
    },
  }),
};

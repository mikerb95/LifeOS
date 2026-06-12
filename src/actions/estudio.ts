import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireAuth } from '../lib/guard';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { cursos, estudioSesiones } from '../db/schema';
import { setSetting, SETTINGS_KEYS } from '../lib/settings';

/** Parse a "0..100" string into a 0..1 float, clamped, defaulting to 0 when empty/invalid. */
function parsePorcentaje(value: string | undefined): number {
  const raw = (value ?? '').trim().replace(',', '.');
  if (!raw) return 0;
  const n = Number(raw);
  if (Number.isNaN(n)) {
    throw new ActionError({ code: 'BAD_REQUEST', message: 'Progreso: introduce un número válido.' });
  }
  return Math.max(0, Math.min(100, n)) / 100;
}

export const estudio = {
  crearCurso: defineAction({
    accept: 'form',
    input: z.object({
      nombre: z.string().min(1, 'Obligatorio.'),
      plataforma: z.string().optional(),
      progreso: z.string().optional(),
      siguiente: z.string().optional(),
    }),
    handler: async ({ nombre, plataforma, progreso, siguiente }) => {
      await db.insert(cursos).values({
        nombre: nombre.trim(),
        plataforma: plataforma?.trim() || null,
        progreso: parsePorcentaje(progreso),
        siguiente: siguiente?.trim() || null,
        activo: true,
      });

      return { success: true };
    },
  }),

  actualizarCurso: defineAction({
    accept: 'form',
    input: z.object({
      id: z.coerce.number().int(),
      progreso: z.coerce.number().min(0).max(100),
    }),
    handler: async ({ id, progreso }) => {
      await db.update(cursos).set({ progreso: progreso / 100 }).where(eq(cursos.id, id));
      return { success: true };
    },
  }),

  borrarCurso: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.delete(cursos).where(eq(cursos.id, id));
      return { success: true };
    },
  }),

  borrarSesion: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.delete(estudioSesiones).where(eq(estudioSesiones.id, id));
      return { success: true };
    },
  }),

  guardarObjetivo: defineAction({
    accept: 'form',
    input: z.object({
      horasObjetivoSemana: z.coerce.number().min(0),
    }),
    handler: async ({ horasObjetivoSemana }) => {
      await setSetting(SETTINGS_KEYS.horasObjetivoSemana, horasObjetivoSemana);
      return { success: true };
    },
  }),
};

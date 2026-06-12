import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireAuth } from '../lib/guard';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { libros, metas } from '../db/schema';
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

export const crecimiento = {
  crearLibro: defineAction({
    accept: 'form',
    input: z.object({
      titulo: z.string().min(1, 'Obligatorio.'),
      autor: z.string().optional(),
      totalPaginas: z.string().optional(),
      estado: z.enum(['pendiente', 'leyendo', 'leido']).optional(),
    }),
    handler: async ({ titulo, autor, totalPaginas, estado }, context) => {
      requireAuth(context);
      const totalPaginasValor = parseOptionalNumber(totalPaginas, 'Páginas totales', true);

      await db.insert(libros).values({
        titulo: titulo.trim(),
        autor: autor?.trim() || null,
        totalPaginas: totalPaginasValor,
        estado: estado ?? 'pendiente',
        paginaActual: 0,
      });

      return { success: true };
    },
  }),

  empezarLibro: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.update(libros).set({ estado: 'leyendo' }).where(eq(libros.id, id));
      return { success: true };
    },
  }),

  terminarLibro: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.update(libros).set({ estado: 'leido', fechaTerminado: todayISO() }).where(eq(libros.id, id));
      return { success: true };
    },
  }),

  borrarLibro: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.delete(libros).where(eq(libros.id, id));
      return { success: true };
    },
  }),

  crearMeta: defineAction({
    accept: 'form',
    input: z.object({
      nombre: z.string().min(1, 'Obligatorio.'),
      objetivo: z.coerce.number(),
      actual: z.string().optional(),
      unidad: z.string().optional(),
      detalle: z.string().optional(),
    }),
    handler: async ({ nombre, objetivo, actual, unidad, detalle }, context) => {
      requireAuth(context);
      const actualValor = parseOptionalNumber(actual, 'Actual') ?? 0;

      await db.insert(metas).values({
        nombre: nombre.trim(),
        objetivo,
        actual: actualValor,
        unidad: unidad?.trim() || null,
        detalle: detalle?.trim() || null,
      });

      return { success: true };
    },
  }),

  actualizarMeta: defineAction({
    accept: 'form',
    input: z.object({
      id: z.coerce.number().int(),
      actual: z.coerce.number(),
    }),
    handler: async ({ id, actual }, context) => {
      requireAuth(context);
      await db.update(metas).set({ actual }).where(eq(metas.id, id));
      return { success: true };
    },
  }),

  borrarMeta: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.delete(metas).where(eq(metas.id, id));
      return { success: true };
    },
  }),

  guardarObjetivoLibros: defineAction({
    accept: 'form',
    input: z.object({
      librosObjetivoAnio: z.coerce.number().min(0),
    }),
    handler: async ({ librosObjetivoAnio }) => {
      await setSetting(SETTINGS_KEYS.librosObjetivoAnio, librosObjetivoAnio);
      return { success: true };
    },
  }),
};

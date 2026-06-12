import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireAuth } from '../lib/guard';
import { db } from '../db/client';
import { diarioEntradas } from '../db/schema';
import { todayISO } from '../lib/dates';

export const diario = {
  guardar: defineAction({
    accept: 'form',
    input: z.object({
      animo: z.coerce.number().int().min(1).max(5),
      texto: z.string().trim().max(4000).optional(),
    }),
    handler: async ({ animo, texto }, context) => {
      requireAuth(context);
      const fecha = todayISO();
      const value = { fecha, animo, texto: texto || null, updatedAt: new Date() };
      await db
        .insert(diarioEntradas)
        .values(value)
        .onConflictDoUpdate({ target: diarioEntradas.fecha, set: { animo: value.animo, texto: value.texto, updatedAt: value.updatedAt } });

      return { success: true };
    },
  }),
};

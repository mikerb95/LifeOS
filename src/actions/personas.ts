import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireAuth } from '../lib/guard';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { contactos, fechasImportantes } from '../db/schema';
import { todayISO } from '../lib/dates';

export const personas = {
  crearFecha: defineAction({
    accept: 'form',
    input: z.object({
      nombre: z.string().min(1, 'Obligatorio.'),
      tipo: z.enum(['cumpleanos', 'aniversario', 'evento']),
      fecha: z.string().min(1, 'Obligatorio.'),
      detalle: z.string().optional(),
    }),
    handler: async ({ nombre, tipo, fecha, detalle }, context) => {
      requireAuth(context);
      await db.insert(fechasImportantes).values({
        nombre: nombre.trim(),
        tipo,
        fecha,
        detalle: detalle?.trim() || null,
      });

      return { success: true };
    },
  }),

  borrarFecha: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.delete(fechasImportantes).where(eq(fechasImportantes.id, id));
      return { success: true };
    },
  }),

  crearContacto: defineAction({
    accept: 'form',
    input: z.object({
      nombre: z.string().min(1, 'Obligatorio.'),
      relacion: z.string().optional(),
    }),
    handler: async ({ nombre, relacion }, context) => {
      requireAuth(context);
      await db.insert(contactos).values({
        nombre: nombre.trim(),
        relacion: relacion?.trim() || null,
      });

      return { success: true };
    },
  }),

  borrarContacto: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.delete(contactos).where(eq(contactos.id, id));
      return { success: true };
    },
  }),

  marcarContactoHoy: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.update(contactos).set({ ultimoContacto: todayISO() }).where(eq(contactos.id, id));
      return { success: true };
    },
  }),
};

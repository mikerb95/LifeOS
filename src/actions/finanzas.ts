import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireAuth } from '../lib/guard';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { deudas, impuestos, movimientos, patrimonioLogs } from '../db/schema';

/** Parses an optional numeric string (allows comma decimals). Returns null for empty input. */
function parseOptionalNumber(value: string | undefined, label: string): number | null {
  const raw = (value ?? '').trim().replace(',', '.');
  if (!raw) return null;
  const n = Number(raw);
  if (Number.isNaN(n)) {
    throw new ActionError({ code: 'BAD_REQUEST', message: `${label}: introduce un número válido.` });
  }
  return n;
}

export const finanzas = {
  guardarPatrimonio: defineAction({
    accept: 'form',
    input: z.object({
      fecha: z.string().min(1),
      valor: z.coerce.number(),
    }),
    handler: async ({ fecha, valor }) => {
      await db
        .insert(patrimonioLogs)
        .values({ fecha, valor })
        .onConflictDoUpdate({ target: patrimonioLogs.fecha, set: { valor } });

      return { success: true };
    },
  }),

  crearMovimiento: defineAction({
    accept: 'form',
    input: z.object({
      fecha: z.string().min(1),
      concepto: z.string().min(1),
      categoria: z.string().min(1),
      tipo: z.enum(['ingreso', 'gasto']),
      importe: z.coerce.number(),
    }),
    handler: async ({ fecha, concepto, categoria, tipo, importe }) => {
      await db.insert(movimientos).values({
        fecha,
        concepto,
        categoria,
        importe: tipo === 'gasto' ? -Math.abs(importe) : Math.abs(importe),
      });

      return { success: true };
    },
  }),

  borrarMovimiento: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.delete(movimientos).where(eq(movimientos.id, id));
      return { success: true };
    },
  }),

  crearDeuda: defineAction({
    accept: 'form',
    input: z.object({
      nombre: z.string().min(1),
      montoActual: z.coerce.number(),
      cuota: z.string().optional(),
      fechaFin: z.string().optional(),
    }),
    handler: async ({ nombre, montoActual, cuota, fechaFin }) => {
      await db.insert(deudas).values({
        nombre,
        montoActual,
        cuota: parseOptionalNumber(cuota, 'Cuota'),
        fechaFin: fechaFin?.trim() || null,
      });

      return { success: true };
    },
  }),

  borrarDeuda: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.delete(deudas).where(eq(deudas.id, id));
      return { success: true };
    },
  }),

  crearImpuesto: defineAction({
    accept: 'form',
    input: z.object({
      nombre: z.string().min(1),
      fecha: z.string().min(1),
    }),
    handler: async ({ nombre, fecha }) => {
      await db.insert(impuestos).values({ nombre, fecha, pagado: false });
      return { success: true };
    },
  }),

  marcarImpuestoPagado: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.update(impuestos).set({ pagado: true }).where(eq(impuestos.id, id));
      return { success: true };
    },
  }),

  borrarImpuesto: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.delete(impuestos).where(eq(impuestos.id, id));
      return { success: true };
    },
  }),
};

import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { requireAuth } from '../lib/guard';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { documentos, mascotaPesoLogs, mascotaTareas, vehiculoTareas } from '../db/schema';
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

export const responsabilidades = {
  guardarMascotaPerfil: defineAction({
    accept: 'form',
    input: z.object({
      nombre: z.string().min(1, 'Obligatorio.'),
      tipo: z.string().min(1, 'Obligatorio.'),
    }),
    handler: async ({ nombre, tipo }, context) => {
      requireAuth(context);
      await setSetting(SETTINGS_KEYS.mascotaPerfil, { nombre: nombre.trim(), tipo: tipo.trim() });
      return { success: true };
    },
  }),

  registrarPesoMascota: defineAction({
    accept: 'form',
    input: z.object({
      fecha: z.string().min(1),
      valorKg: z.coerce.number(),
    }),
    handler: async ({ fecha, valorKg }, context) => {
      requireAuth(context);
      await db
        .insert(mascotaPesoLogs)
        .values({ fecha, valorKg })
        .onConflictDoUpdate({ target: mascotaPesoLogs.fecha, set: { valorKg } });

      return { success: true };
    },
  }),

  crearMascotaTarea: defineAction({
    accept: 'form',
    input: z.object({
      nombre: z.string().min(1, 'Obligatorio.'),
      fechaVenc: z.string().min(1, 'Obligatorio.'),
      frecuenciaDias: z.string().optional(),
    }),
    handler: async ({ nombre, fechaVenc, frecuenciaDias }, context) => {
      requireAuth(context);
      const frecuencia = parseOptionalNumber(frecuenciaDias, 'Frecuencia', true);

      await db.insert(mascotaTareas).values({
        nombre: nombre.trim(),
        fechaVenc,
        frecuenciaDias: frecuencia,
      });

      return { success: true };
    },
  }),

  borrarMascotaTarea: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.delete(mascotaTareas).where(eq(mascotaTareas.id, id));
      return { success: true };
    },
  }),

  guardarVehiculoPerfil: defineAction({
    accept: 'form',
    input: z.object({
      nombre: z.string().min(1, 'Obligatorio.'),
      matricula: z.string().min(1, 'Obligatorio.'),
      aceiteIntervaloKm: z.coerce.number(),
      aceiteUltimoKm: z.coerce.number(),
    }),
    handler: async ({ nombre, matricula, aceiteIntervaloKm, aceiteUltimoKm }, context) => {
      requireAuth(context);
      await setSetting(SETTINGS_KEYS.vehiculoPerfil, {
        nombre: nombre.trim(),
        matricula: matricula.trim(),
        aceiteIntervaloKm,
        aceiteUltimoKm,
      });
      return { success: true };
    },
  }),

  crearVehiculoTarea: defineAction({
    accept: 'form',
    input: z.object({
      nombre: z.string().min(1, 'Obligatorio.'),
      fechaVenc: z.string().min(1, 'Obligatorio.'),
      frecuenciaDias: z.string().optional(),
    }),
    handler: async ({ nombre, fechaVenc, frecuenciaDias }, context) => {
      requireAuth(context);
      const frecuencia = parseOptionalNumber(frecuenciaDias, 'Frecuencia', true);

      await db.insert(vehiculoTareas).values({
        nombre: nombre.trim(),
        fechaVenc,
        frecuenciaDias: frecuencia,
      });

      return { success: true };
    },
  }),

  borrarVehiculoTarea: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.delete(vehiculoTareas).where(eq(vehiculoTareas.id, id));
      return { success: true };
    },
  }),

  crearDocumento: defineAction({
    accept: 'form',
    input: z.object({
      nombre: z.string().min(1, 'Obligatorio.'),
      detalle: z.string().optional(),
      fechaVenc: z.string().optional(),
    }),
    handler: async ({ nombre, detalle, fechaVenc }, context) => {
      requireAuth(context);
      await db.insert(documentos).values({
        nombre: nombre.trim(),
        detalle: detalle?.trim() || null,
        fechaVenc: fechaVenc?.trim() || null,
      });

      return { success: true };
    },
  }),

  borrarDocumento: defineAction({
    accept: 'form',
    input: z.object({ id: z.coerce.number().int() }),
    handler: async ({ id }) => {
      await db.delete(documentos).where(eq(documentos.id, id));
      return { success: true };
    },
  }),
};

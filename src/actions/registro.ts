import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/client';
import {
  comidas,
  contactos,
  entrenos,
  estudioSesiones,
  fcReposoLogs,
  lecturaSesiones,
  libros,
  movimientos,
  pesoLogs,
  registroLog,
  suenoLogs,
  vehiculoLogs,
} from '../db/schema';
import { nowHM, todayISO } from '../lib/dates';
import { QUICK_TYPES } from '../lib/quickTypes';

function parseNumber(value: string | undefined, label: string): number {
  const raw = (value ?? '').trim().replace(',', '.');
  const n = Number(raw);
  if (!raw || Number.isNaN(n)) {
    throw new ActionError({ code: 'BAD_REQUEST', message: `${label}: introduce un número válido.` });
  }
  return n;
}

export const registro = {
  crear: defineAction({
    accept: 'form',
    input: z.object({
      tipoId: z.string(),
      tipo: z.string().optional(),
      detalle: z.string().optional(),
    }),
    handler: async ({ tipoId, tipo, detalle }) => {
      const quickType = QUICK_TYPES.find((t) => t.id === tipoId);
      if (!quickType) {
        throw new ActionError({ code: 'BAD_REQUEST', message: 'Tipo de registro no válido.' });
      }

      const fecha = todayISO();
      const hora = nowHM();
      const tipoTrim = tipo?.trim() || null;
      const detalleTrim = detalle?.trim() || null;

      for (const campo of quickType.campos) {
        const value = campo.k === 'tipo' ? tipoTrim : detalleTrim;
        if (!value) {
          throw new ActionError({ code: 'BAD_REQUEST', message: `${campo.label}: este campo es obligatorio.` });
        }
      }

      switch (tipoId) {
        case 'entreno':
          await db.insert(entrenos).values({ fecha, tipo: tipoTrim!, detalle: detalleTrim });
          break;

        case 'comida':
          await db.insert(comidas).values({ fecha, nombre: tipoTrim!, detalle: detalleTrim, kcal: null, proteinaG: null });
          break;

        case 'peso': {
          const valorKg = parseNumber(detalle, 'Peso');
          await db
            .insert(pesoLogs)
            .values({ fecha, valorKg })
            .onConflictDoUpdate({ target: pesoLogs.fecha, set: { valorKg } });
          break;
        }

        case 'sueno': {
          const horas = parseNumber(detalle, 'Horas dormidas');
          await db
            .insert(suenoLogs)
            .values({ fecha, horas })
            .onConflictDoUpdate({ target: suenoLogs.fecha, set: { horas } });
          break;
        }

        case 'fcreposo': {
          const valorPpm = Math.round(parseNumber(detalle, 'FC en reposo'));
          await db
            .insert(fcReposoLogs)
            .values({ fecha, valorPpm })
            .onConflictDoUpdate({ target: fcReposoLogs.fecha, set: { valorPpm } });
          break;
        }

        case 'gasto': {
          const importe = parseNumber(detalle, 'Importe');
          await db
            .insert(movimientos)
            .values({ fecha, concepto: tipoTrim!, categoria: 'Sin categoría', importe: -Math.abs(importe) });
          break;
        }

        case 'lectura': {
          const paginas = Math.round(parseNumber(detalle, 'Páginas leídas'));
          const [leyendo] = await db.select().from(libros).where(eq(libros.estado, 'leyendo'));
          await db.insert(lecturaSesiones).values({ fecha, paginas, libroId: leyendo?.id ?? null });
          if (leyendo) {
            await db.update(libros).set({ paginaActual: leyendo.paginaActual + paginas }).where(eq(libros.id, leyendo.id));
          }
          break;
        }

        case 'estudio': {
          const minutos = Math.round(parseNumber(detalle, 'Minutos'));
          await db.insert(estudioSesiones).values({ fecha, curso: tipoTrim!, detalle: null, minutos });
          break;
        }

        case 'mascota':
          break;

        case 'contacto':
          await db
            .update(contactos)
            .set({ ultimoContacto: fecha })
            .where(sql`lower(${contactos.nombre}) = lower(${tipoTrim})`);
          break;

        case 'vehiculo': {
          const km = Math.round(parseNumber(detalle, 'Km actuales'));
          await db.insert(vehiculoLogs).values({ fecha, km, tipo: tipoTrim!, detalle: null });
          break;
        }

        case 'nota':
          break;
      }

      await db.insert(registroLog).values({
        fecha,
        hora,
        tipoId,
        nombre: quickType.nombre,
        icono: quickType.icono,
        tipo: tipoTrim,
        detalle: detalleTrim,
      });

      return { success: true };
    },
  }),
};

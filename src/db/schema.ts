import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';

const id = () => integer('id').primaryKey({ autoIncrement: true });
const createdAt = () =>
  integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`);

/** Singleton key/value config: profile data, targets, "currently reading" book, etc. JSON-encoded values. */
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

/** Login throttling, keyed by client IP (or 'global' if unknown). */
export const loginAttempts = sqliteTable('login_attempts', {
  identifier: text('identifier').primaryKey(),
  attempts: integer('attempts').notNull().default(0),
  lockedUntil: integer('locked_until', { mode: 'timestamp_ms' }),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

/** Generic "logged today" activity feed, fed by Quick Add. */
export const registroLog = sqliteTable('registro_log', {
  id: id(),
  fecha: text('fecha').notNull(), // YYYY-MM-DD
  hora: text('hora').notNull(), // HH:MM
  tipoId: text('tipo_id').notNull(),
  nombre: text('nombre').notNull(),
  icono: text('icono').notNull(),
  tipo: text('tipo'),
  detalle: text('detalle'),
  createdAt: createdAt(),
});

// ---------- Bienestar ----------

export const pesoLogs = sqliteTable(
  'peso_logs',
  {
    id: id(),
    fecha: text('fecha').notNull(),
    valorKg: real('valor_kg').notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('peso_logs_fecha_idx').on(t.fecha)],
);

export const suenoLogs = sqliteTable(
  'sueno_logs',
  {
    id: id(),
    fecha: text('fecha').notNull(),
    horas: real('horas').notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('sueno_logs_fecha_idx').on(t.fecha)],
);

export const fcReposoLogs = sqliteTable(
  'fc_reposo_logs',
  {
    id: id(),
    fecha: text('fecha').notNull(),
    valorPpm: integer('valor_ppm').notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('fc_reposo_logs_fecha_idx').on(t.fecha)],
);

export const entrenos = sqliteTable('entrenos', {
  id: id(),
  fecha: text('fecha').notNull(),
  tipo: text('tipo').notNull(),
  detalle: text('detalle'),
  createdAt: createdAt(),
});

export const comidas = sqliteTable('comidas', {
  id: id(),
  fecha: text('fecha').notNull(),
  nombre: text('nombre').notNull(),
  detalle: text('detalle'),
  kcal: integer('kcal'),
  proteinaG: real('proteina_g'),
  createdAt: createdAt(),
});

export const biomarcadores = sqliteTable('biomarcadores', {
  id: id(),
  nombre: text('nombre').notNull(),
  valor: text('valor').notNull(),
  unidad: text('unidad').notNull(),
  fecha: text('fecha').notNull(),
  estado: text('estado', { enum: ['ok', 'medio', 'alto'] })
    .notNull()
    .default('ok'),
  createdAt: createdAt(),
});

// ---------- Estudio ----------

export const cursos = sqliteTable('cursos', {
  id: id(),
  nombre: text('nombre').notNull(),
  plataforma: text('plataforma'),
  progreso: real('progreso').notNull().default(0), // 0..1
  siguiente: text('siguiente'),
  activo: integer('activo', { mode: 'boolean' }).notNull().default(true),
  createdAt: createdAt(),
});

export const estudioSesiones = sqliteTable('estudio_sesiones', {
  id: id(),
  fecha: text('fecha').notNull(),
  curso: text('curso').notNull(),
  detalle: text('detalle'),
  minutos: integer('minutos').notNull(),
  createdAt: createdAt(),
});

// ---------- Finanzas ----------

export const patrimonioLogs = sqliteTable(
  'patrimonio_logs',
  {
    id: id(),
    fecha: text('fecha').notNull(), // YYYY-MM (monthly snapshot)
    valor: real('valor').notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('patrimonio_logs_fecha_idx').on(t.fecha)],
);

export const deudas = sqliteTable('deudas', {
  id: id(),
  nombre: text('nombre').notNull(),
  montoActual: real('monto_actual').notNull(),
  cuota: real('cuota'),
  fechaFin: text('fecha_fin'),
  createdAt: createdAt(),
});

export const movimientos = sqliteTable('movimientos', {
  id: id(),
  fecha: text('fecha').notNull(),
  concepto: text('concepto').notNull(),
  categoria: text('categoria').notNull(),
  importe: real('importe').notNull(), // negative = gasto, positive = ingreso
  createdAt: createdAt(),
});

export const impuestos = sqliteTable('impuestos', {
  id: id(),
  nombre: text('nombre').notNull(),
  fecha: text('fecha').notNull(),
  pagado: integer('pagado', { mode: 'boolean' }).notNull().default(false),
  createdAt: createdAt(),
});

// ---------- Responsabilidades ----------

export const mascotaPesoLogs = sqliteTable(
  'mascota_peso_logs',
  {
    id: id(),
    fecha: text('fecha').notNull(),
    valorKg: real('valor_kg').notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('mascota_peso_logs_fecha_idx').on(t.fecha)],
);

export const mascotaTareas = sqliteTable('mascota_tareas', {
  id: id(),
  nombre: text('nombre').notNull(),
  fechaVenc: text('fecha_venc').notNull(),
  frecuenciaDias: integer('frecuencia_dias'),
  createdAt: createdAt(),
});

export const vehiculoLogs = sqliteTable('vehiculo_logs', {
  id: id(),
  fecha: text('fecha').notNull(),
  km: integer('km').notNull(),
  tipo: text('tipo').notNull(),
  detalle: text('detalle'),
  createdAt: createdAt(),
});

export const vehiculoTareas = sqliteTable('vehiculo_tareas', {
  id: id(),
  nombre: text('nombre').notNull(),
  fechaVenc: text('fecha_venc').notNull(),
  frecuenciaDias: integer('frecuencia_dias'),
  createdAt: createdAt(),
});

export const documentos = sqliteTable('documentos', {
  id: id(),
  nombre: text('nombre').notNull(),
  detalle: text('detalle'),
  fechaVenc: text('fecha_venc'),
  createdAt: createdAt(),
});

// ---------- Personas ----------

export const fechasImportantes = sqliteTable('fechas_importantes', {
  id: id(),
  nombre: text('nombre').notNull(),
  tipo: text('tipo', { enum: ['cumpleanos', 'aniversario', 'evento'] }).notNull(),
  fecha: text('fecha').notNull(), // origin date (YYYY-MM-DD) for recurring, target date for one-off events
  detalle: text('detalle'),
  createdAt: createdAt(),
});

export const contactos = sqliteTable('contactos', {
  id: id(),
  nombre: text('nombre').notNull(),
  relacion: text('relacion'),
  ultimoContacto: text('ultimo_contacto'),
  createdAt: createdAt(),
});

// ---------- Crecimiento ----------

export const libros = sqliteTable('libros', {
  id: id(),
  titulo: text('titulo').notNull(),
  autor: text('autor'),
  estado: text('estado', { enum: ['leyendo', 'leido', 'pendiente'] })
    .notNull()
    .default('pendiente'),
  paginaActual: integer('pagina_actual').notNull().default(0),
  totalPaginas: integer('total_paginas'),
  fechaTerminado: text('fecha_terminado'),
  createdAt: createdAt(),
});

export const lecturaSesiones = sqliteTable('lectura_sesiones', {
  id: id(),
  fecha: text('fecha').notNull(),
  paginas: integer('paginas').notNull(),
  libroId: integer('libro_id').references(() => libros.id, { onDelete: 'set null' }),
  createdAt: createdAt(),
});

export const metas = sqliteTable('metas', {
  id: id(),
  nombre: text('nombre').notNull(),
  actual: real('actual').notNull().default(0),
  objetivo: real('objetivo').notNull(),
  unidad: text('unidad'),
  detalle: text('detalle'),
  createdAt: createdAt(),
});

// ---------- Diario ----------

export const diarioEntradas = sqliteTable(
  'diario_entradas',
  {
    id: id(),
    fecha: text('fecha').notNull(),
    animo: integer('animo').notNull(), // 1..5
    texto: text('texto'),
    createdAt: createdAt(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [uniqueIndex('diario_entradas_fecha_idx').on(t.fecha)],
);

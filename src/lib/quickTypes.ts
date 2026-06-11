export interface QuickField {
  k: 'tipo' | 'detalle';
  label: string;
  ph: string;
  tipo?: 'number';
  area?: boolean;
}

export interface QuickType {
  id: string;
  nombre: string;
  icono: string;
  campos: QuickField[];
}

/** Tipos de "Registro rápido". `tipo`/`detalle` son siempre texto desde el formulario. */
export const QUICK_TYPES: QuickType[] = [
  { id: 'entreno', nombre: 'Entreno', icono: 'fuerza', campos: [{ k: 'tipo', label: 'Tipo', ph: 'Fuerza, carrera, yoga…' }, { k: 'detalle', label: 'Duración o distancia', ph: '45 min / 8 km' }] },
  { id: 'comida', nombre: 'Comida', icono: 'comida', campos: [{ k: 'tipo', label: 'Comida', ph: 'Cena' }, { k: 'detalle', label: 'Qué has comido', ph: 'Salmón con ensalada' }] },
  { id: 'peso', nombre: 'Peso', icono: 'peso', campos: [{ k: 'detalle', label: 'Peso (kg)', ph: '76,2', tipo: 'number' }] },
  { id: 'sueno', nombre: 'Sueño', icono: 'sueno', campos: [{ k: 'detalle', label: 'Horas dormidas', ph: '7,5', tipo: 'number' }] },
  { id: 'fcreposo', nombre: 'FC reposo', icono: 'corazon', campos: [{ k: 'detalle', label: 'FC en reposo (ppm)', ph: '54', tipo: 'number' }] },
  { id: 'gasto', nombre: 'Gasto', icono: 'gasto', campos: [{ k: 'tipo', label: 'Concepto', ph: 'Supermercado' }, { k: 'detalle', label: 'Importe (€)', ph: '23,50', tipo: 'number' }] },
  { id: 'lectura', nombre: 'Lectura', icono: 'libro', campos: [{ k: 'detalle', label: 'Páginas leídas', ph: '20', tipo: 'number' }] },
  { id: 'estudio', nombre: 'Estudio', icono: 'estudio', campos: [{ k: 'tipo', label: 'Curso o tema', ph: 'SQL avanzado, inglés…' }, { k: 'detalle', label: 'Minutos', ph: '45', tipo: 'number' }] },
  { id: 'mascota', nombre: 'Mascota', icono: 'pata', campos: [{ k: 'tipo', label: 'Qué ha pasado', ph: 'Antiparasitario, paseo largo…' }] },
  { id: 'contacto', nombre: 'Contacto', icono: 'personas', campos: [{ k: 'tipo', label: 'Con quién', ph: 'Mamá, Javi…' }, { k: 'detalle', label: 'Qué ha sido', ph: 'Llamada, café, cena…' }] },
  { id: 'vehiculo', nombre: 'Vehículo', icono: 'coche', campos: [{ k: 'tipo', label: 'Registro', ph: 'Repostaje, revisión…' }, { k: 'detalle', label: 'Km actuales', ph: '87.430', tipo: 'number' }] },
  { id: 'nota', nombre: 'Nota', icono: 'nota', campos: [{ k: 'detalle', label: 'Nota rápida', ph: 'Lo que quieras recordar', area: true }] },
];

export type QuickTypeId = (typeof QUICK_TYPES)[number]['id'];

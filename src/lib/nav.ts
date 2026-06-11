export interface Vista {
  id: string;
  nombre: string;
  icono: string;
  href: string;
  titulo: string;
  sub: string;
}

/** Sidebar / tab order. "Hoy" titulo is computed at render time from the real date. */
export const VISTAS: Vista[] = [
  { id: 'hoy', nombre: 'Hoy', icono: 'hoy', href: '/', titulo: '', sub: 'Tu vida de un vistazo: lo esencial de cada módulo y lo que viene pronto.' },
  { id: 'diario', nombre: 'Diario', icono: 'nota', href: '/diario', titulo: 'Diario', sub: 'Cómo te encuentras y qué quieres recordar de cada día.' },
  { id: 'bienestar', nombre: 'Bienestar', icono: 'bienestar', href: '/bienestar', titulo: 'Bienestar físico', sub: 'Entreno, alimentación, sueño y biomarcadores.' },
  { id: 'estudio', nombre: 'Estudio', icono: 'estudio', href: '/estudio', titulo: 'Estudio', sub: 'Tus cursos, tu constancia y lo que toca a continuación.' },
  { id: 'finanzas', nombre: 'Finanzas', icono: 'finanzas', href: '/finanzas', titulo: 'Finanzas', sub: 'Patrimonio, flujo mensual, deuda e impuestos.' },
  { id: 'responsabilidades', nombre: 'Responsabilidades', icono: 'responsabilidades', href: '/responsabilidades', titulo: 'Responsabilidades', sub: 'Mascota, vehículo y documentos, sin sorpresas.' },
  { id: 'personas', nombre: 'Personas', icono: 'personas', href: '/personas', titulo: 'Personas', sub: 'Cumpleaños, aniversarios y la gente con la que no quieres perder el contacto.' },
  { id: 'crecimiento', nombre: 'Crecimiento', icono: 'crecimiento', href: '/crecimiento', titulo: 'Crecimiento', sub: 'Lectura y metas del año.' },
  { id: 'integraciones', nombre: 'Integraciones', icono: 'integraciones', href: '/integraciones', titulo: 'Integraciones', sub: 'Fuentes externas que alimentan tu LifeOS. Solo estado de conexión: tus datos son tuyos.' },
];

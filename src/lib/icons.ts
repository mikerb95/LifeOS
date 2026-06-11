/** Shared icon path data, used by LifeIcon.astro (server) and QuickAdd.tsx (React island). */
export function buildIcons(stroke = 1.7): Record<string, string> {
  const a = `fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"`;

  return {
    hoy: `<circle cx="12" cy="12" r="4.2" ${a}/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" ${a}/>`,
    bienestar: `<path d="M12 20.2S4 15 4 9.6C4 6.8 6.2 5 8.4 5c1.5 0 2.9.8 3.6 2.1C12.7 5.8 14.1 5 15.6 5 17.8 5 20 6.8 20 9.6c0 5.4-8 10.6-8 10.6Z" ${a}/>`,
    finanzas: `<path d="M4 8.5h16v10.2H4z" ${a}/><path d="M7 8.5V6.2a1.7 1.7 0 0 1 1.7-1.7h6.6A1.7 1.7 0 0 1 17 6.2v2.3" ${a}/><circle cx="12" cy="13.6" r="2" ${a}/>`,
    responsabilidades: `<path d="M5 7.4 12 4l7 3.4v4.8c0 4.5-3 7.4-7 8.8-4-1.4-7-4.3-7-8.8Z" ${a}/><path d="m9.2 12 2 2 3.6-3.8" ${a}/>`,
    crecimiento: `<path d="M4 19.5V13M9.3 19.5V9.5M14.6 19.5V11M19.9 19.5V5.5" ${a}/>`,
    integraciones: `<path d="M9 6.5 5.8 9.7a3.8 3.8 0 0 0 0 5.4l3.1 3.1" ${a}/><path d="m15 17.5 3.2-3.2a3.8 3.8 0 0 0 0-5.4L15.1 5.8" ${a}/><path d="M9.4 12h5.2" ${a}/>`,
    mas: `<path d="M12 5.5v13M5.5 12h13" ${a}/>`,
    fuerza: `<path d="M7 8v8M17 8v8M4.5 10v4M19.5 10v4M7 12h10" ${a}/>`,
    correr: `<circle cx="15.5" cy="5.5" r="1.8" ${a}/><path d="M13.6 9.2 9.8 11l-1.4 3.4M13.6 9.2l1.3 3.5-3 2.2-1.2 4M13.6 9.2l3.3 1.7 2.3-.9" ${a}/>`,
    comida: `<path d="M6 3.8v6.4M3.8 3.8v3.6a2.2 2.2 0 0 0 4.4 0V3.8M6 10.2V20M16.8 14V3.8c-2.2.8-3.6 3-3.6 5.6 0 1.9.9 3.4 2.2 4M16.8 14v6" ${a}/>`,
    gasto: `<circle cx="12" cy="12" r="8.2" ${a}/><path d="M12 7.5v9M9.4 14.2c.5.9 1.5 1.4 2.6 1.4 1.6 0 2.8-.9 2.8-2.1 0-2.7-5.3-1.5-5.3-4.1 0-1.1 1.1-2 2.5-2 1 0 1.9.5 2.4 1.2" ${a}/>`,
    peso: `<path d="M5.5 4.5h13l1.7 15h-16.4z" ${a}/><path d="M9 8.5a3 3 0 0 0 6 0" ${a}/>`,
    libro: `<path d="M12 6.2C10.6 5 8.8 4.4 6.6 4.4c-1 0-1.9.1-2.6.4v14c.7-.3 1.6-.4 2.6-.4 2.2 0 4 .6 5.4 1.8 1.4-1.2 3.2-1.8 5.4-1.8 1 0 1.9.1 2.6.4v-14c-.7-.3-1.6-.4-2.6-.4-2.2 0-4 .6-5.4 1.8Z" ${a}/><path d="M12 6.2v14" ${a}/>`,
    pata: `<circle cx="8" cy="7.5" r="1.7" ${a}/><circle cx="16" cy="7.5" r="1.7" ${a}/><circle cx="4.8" cy="11.5" r="1.6" ${a}/><circle cx="19.2" cy="11.5" r="1.6" ${a}/><path d="M12 11.2c2.6 0 5 2.3 5 4.7 0 1.6-1.2 2.6-2.6 2.6-.9 0-1.7-.4-2.4-.4s-1.5.4-2.4.4c-1.4 0-2.6-1-2.6-2.6 0-2.4 2.4-4.7 5-4.7Z" ${a}/>`,
    coche: `<path d="M4.5 13.2 6 8.6A2 2 0 0 1 7.9 7.2h8.2a2 2 0 0 1 1.9 1.4l1.5 4.6M4.5 13.2h15v4.6h-2.2M4.5 13.2v4.6h2.2M6.7 17.8h10.6" ${a}/><circle cx="8" cy="17.8" r="1.4" ${a}/><circle cx="16" cy="17.8" r="1.4" ${a}/>`,
    doc: `<path d="M7 3.8h7l4 4v12.4H7z" ${a}/><path d="M14 3.8v4h4M10 12.5h5M10 15.5h5" ${a}/>`,
    sueno: `<path d="M19.5 13.5A7.8 7.8 0 0 1 10.5 4.4a7.8 7.8 0 1 0 9 9.1Z" ${a}/>`,
    corazon: `<path d="M3.5 12h4l1.8-3.8 2.6 7 2-4.4 1.3 1.2h5.3" ${a}/>`,
    check: `<path d="m5.5 12.5 4 4 9-9.5" ${a}/>`,
    flechaD: `<path d="M5 12h14M13 6l6 6-6 6" ${a}/>`,
    campana: `<path d="M12 4a5.3 5.3 0 0 0-5.3 5.3c0 5-2 6-2 6h14.6s-2-1-2-6A5.3 5.3 0 0 0 12 4Z" ${a}/><path d="M10.2 18.5a2 2 0 0 0 3.6 0" ${a}/>`,
    cerrar: `<path d="m6 6 12 12M18 6 6 18" ${a}/>`,
    nota: `<path d="M5 4.8h14v11.4l-3.8 3.8H5z" ${a}/><path d="M15.2 20v-3.8H19" ${a}/>`,
    puntos: `<circle cx="5" cy="12" r="1.5" ${a}/><circle cx="12" cy="12" r="1.5" ${a}/><circle cx="19" cy="12" r="1.5" ${a}/>`,
    personas: `<circle cx="9" cy="8.5" r="3" ${a}/><path d="M3.8 19c.5-3 2.6-5 5.2-5s4.7 2 5.2 5" ${a}/><circle cx="16.6" cy="9.6" r="2.4" ${a}/><path d="M15.8 14.3c2.2.4 3.9 2.1 4.3 4.7" ${a}/>`,
    estudio: `<path d="M12 4.5 21 9l-9 4.5L3 9z" ${a}/><path d="M6.5 11.2v4.2c0 1.3 2.5 2.6 5.5 2.6s5.5-1.3 5.5-2.6v-4.2" ${a}/><path d="M21 9v4.5" ${a}/>`,
    salir: `<path d="M9 4.5H5.5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1H9" ${a}/><path d="M14 8l4 4-4 4M18 12H9.5" ${a}/>`,
  };
}

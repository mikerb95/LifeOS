export const fmtEur = (n: number): string => n.toLocaleString('es-ES', { maximumFractionDigits: 0 }) + ' €';

export const fmtEur2 = (n: number): string =>
  n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

export const fmtNum = (n: number, maximumFractionDigits = 1): string =>
  n.toLocaleString('es-ES', { maximumFractionDigits });

export const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

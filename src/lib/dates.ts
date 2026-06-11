// Date helpers. All ISO date strings are plain "YYYY-MM-DD" calendar dates,
// handled as UTC midnight so arithmetic is unaffected by DST. "Today" is
// derived from the real clock in the configured timezone.

export const TIMEZONE = 'Europe/Madrid';
export const LOCALE = 'es-ES';

const DAY_MS = 24 * 60 * 60 * 1000;

const WEEKDAY_SHORT = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', timeZone: 'UTC' });
const DAY_NUM = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', timeZone: 'UTC' });
const MONTH_SHORT = new Intl.DateTimeFormat(LOCALE, { month: 'short', timeZone: 'UTC' });
const YEAR_NUM = new Intl.DateTimeFormat(LOCALE, { year: 'numeric', timeZone: 'UTC' });

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function clean(s: string): string {
  return s.replace('.', '');
}

export function parseISO(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Today's date (YYYY-MM-DD) in TIMEZONE. */
export function todayISO(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Current time "HH:MM" in TIMEZONE. */
export function nowHM(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

export function addDays(iso: string, days: number): string {
  return toISO(new Date(parseISO(iso).getTime() + days * DAY_MS));
}

/** Days from `fromIso` (default: today) until `iso`. Negative = in the past. */
export function diffDays(iso: string, fromIso: string = todayISO()): number {
  return Math.round((parseISO(iso).getTime() - parseISO(fromIso).getTime()) / DAY_MS);
}

/** "Miércoles, 10 de junio" */
export function formatLongDate(iso: string): string {
  return cap(
    new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(
      parseISO(iso),
    ),
  );
}

/** "Mié · 10 jun 2026" (or without year) */
export function formatHeaderDate(iso: string, withYear = true): string {
  const d = parseISO(iso);
  const wd = cap(clean(WEEKDAY_SHORT.format(d)));
  const day = DAY_NUM.format(d);
  const month = clean(MONTH_SHORT.format(d));
  return withYear ? `${wd} · ${day} ${month} ${YEAR_NUM.format(d)}` : `${wd} · ${day} ${month}`;
}

/** "10 jun" */
export function formatDayMonth(iso: string): string {
  const d = parseISO(iso);
  return `${DAY_NUM.format(d)} ${clean(MONTH_SHORT.format(d))}`;
}

/** Relative day label for activity lists: "Hoy" / "Ayer" / "Lun 8" / "10 jun" */
export function relativeDayLabel(iso: string): string {
  const dias = diffDays(iso);
  if (dias === 0) return 'Hoy';
  if (dias === -1) return 'Ayer';
  const d = parseISO(iso);
  if (dias >= -6 && dias < 0) return `${cap(clean(WEEKDAY_SHORT.format(d)))} ${DAY_NUM.format(d)}`;
  return formatDayMonth(iso);
}

/** Diary entry label: "Hoy · 10 jun" / "Ayer · 9 jun" / "Lun 8 jun" / "10 jun" */
export function diarioEntryLabel(iso: string): string {
  const dias = diffDays(iso);
  const dayMonth = formatDayMonth(iso);
  if (dias === 0) return `Hoy · ${dayMonth}`;
  if (dias === -1) return `Ayer · ${dayMonth}`;
  const d = parseISO(iso);
  if (dias >= -6 && dias < 0) return `${cap(clean(WEEKDAY_SHORT.format(d)))} ${dayMonth}`;
  return dayMonth;
}

/** "en 4 días" / "en 3 sem." / "en 2 meses" / "hace 5 días" / "Hoy" */
export function formatCountdown(dias: number): string {
  if (dias === 0) return 'Hoy';
  const abs = Math.abs(dias);
  const prefix = dias > 0 ? 'en' : 'hace';
  if (abs <= 7) return `${prefix} ${abs} día${abs === 1 ? '' : 's'}`;
  if (abs <= 60) return `${prefix} ${Math.round(abs / 7)} sem.`;
  return `${prefix} ${Math.round(abs / 30)} meses`;
}

/** "hoy" / "ayer" / "hace N días" / "hace N semanas" / "hace N meses" */
export function formatLastContact(iso: string | null): string {
  if (!iso) return 'sin registro';
  const dias = -diffDays(iso);
  if (dias <= 0) return 'hoy';
  if (dias === 1) return 'ayer';
  if (dias <= 13) return `hace ${dias} días`;
  if (dias <= 60) return `hace ${Math.round(dias / 7)} semanas`;
  return `hace ${Math.round(dias / 30)} meses`;
}

/** For recurring annual dates (birthdays/anniversaries): next occurrence (today or future) of month/day from `iso`. */
export function nextAnnualOccurrence(iso: string, fromIso: string = todayISO()): string {
  const d = parseISO(iso);
  const from = parseISO(fromIso);
  const month = d.getUTCMonth();
  const day = d.getUTCDate();
  const year = from.getUTCFullYear();
  let candidate = new Date(Date.UTC(year, month, day));
  if (candidate.getTime() < parseISO(fromIso).getTime()) {
    candidate = new Date(Date.UTC(year + 1, month, day));
  }
  return toISO(candidate);
}

/** Years between `iso` and its next annual occurrence (e.g. age turned, or anniversary count). */
export function yearsAtNextOccurrence(iso: string, fromIso: string = todayISO()): number {
  const originYear = parseISO(iso).getUTCFullYear();
  const nextYear = parseISO(nextAnnualOccurrence(iso, fromIso)).getUTCFullYear();
  return nextYear - originYear;
}

export type Estado = 'ok' | 'pronto';

export function estadoPorDias(dias: number, umbralDias: number): Estado {
  return dias <= umbralDias ? 'pronto' : 'ok';
}

/** Bucket a numeric value into a 0..3 heatmap level given ascending thresholds [t1, t2, t3]. */
export function bucketize(value: number, thresholds: [number, number, number]): 0 | 1 | 2 | 3 {
  if (value <= 0) return 0;
  if (value < thresholds[1]) return 1;
  if (value < thresholds[2]) return 2;
  return 3;
}

/** Build an 18-week (126 day) heatmap series ending today from a date->value map. */
export function heatmapSeries(
  values: Map<string, number>,
  thresholds: [number, number, number],
  weeks = 18,
): (0 | 1 | 2 | 3)[] {
  const days = weeks * 7;
  const today = todayISO();
  // Align so the last column ends on today; oldest day first.
  const out: (0 | 1 | 2 | 3)[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const iso = addDays(today, -i);
    out.push(bucketize(values.get(iso) ?? 0, thresholds));
  }
  return out;
}

/** Current streak (consecutive days up to and including today) where the date is present in `dates`. */
export function currentStreak(dates: Set<string>): number {
  let streak = 0;
  let cursor = todayISO();
  while (dates.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

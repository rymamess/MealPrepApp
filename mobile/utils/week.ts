const MONTH_NAMES = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

const DAY_NAMES_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function addWeeks(date: Date, amount: number): Date {
  return addDays(date, amount * 7);
}

// Semaine commençant le lundi (convention française/québécoise).
export function getStartOfWeek(date: Date): Date {
  const day = date.getDay(); // 0 = dimanche .. 6 = samedi
  const diff = day === 0 ? -6 : 1 - day;
  const start = addDays(date, diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

// Construit 'YYYY-MM-DD' à partir des composantes locales (pas toISOString(),
// qui convertit en UTC et peut décaler le jour près de minuit).
export function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Inverse de formatISODate : construit une Date locale à partir de 'YYYY-MM-DD'.
// Tolère aussi un datetime ISO complet (ex: réponses serveur "2024-01-01T00:00:00.000Z")
// en ne gardant que les 10 premiers caractères (la partie date).
export function parseISODate(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDayLabel(date: Date): string {
  return DAY_NAMES_SHORT[date.getDay()];
}

export function formatWeekRangeLabel(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${startDay} – ${endDay} ${MONTH_NAMES[weekStart.getMonth()]}`;
  }
  return `${startDay} ${MONTH_NAMES[weekStart.getMonth()]} – ${endDay} ${MONTH_NAMES[weekEnd.getMonth()]}`;
}

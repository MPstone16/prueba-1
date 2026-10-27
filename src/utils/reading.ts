export function currentMonthKey(date = new Date()): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}`;
}

export function isValidMeterCode(code: string): boolean {
  return /^MED-\d{6}$/.test(code);
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-EC', { dateStyle: 'medium' }).format(date);
}

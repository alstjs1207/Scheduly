export function getDateInMonth(date: Date, month: Date): Date {
  const lastDay = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();

  return new Date(
    month.getFullYear(),
    month.getMonth(),
    Math.min(date.getDate(), lastDay),
  );
}

export function getInitialCalendarDate(
  year: number,
  month: number,
  today = new Date(),
): Date {
  return today.getFullYear() === year && today.getMonth() === month - 1
    ? today
    : new Date(year, month - 1, 1);
}

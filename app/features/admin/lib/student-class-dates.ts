function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function addYearsToDateString(value: string, years = 1) {
  const [year, month, day] = value.split("-").map(Number);
  const targetYear = year + years;
  const lastDayOfTargetMonth = new Date(targetYear, month, 0).getDate();
  return formatDate(targetYear, month, Math.min(day, lastDayOfTargetMonth));
}

export function getDefaultStudentClassDates(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  const classStartDate = formatDate(year, month, day);

  return {
    classStartDate,
    classEndDate: addYearsToDateString(classStartDate),
  };
}

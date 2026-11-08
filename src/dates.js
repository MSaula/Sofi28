const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const calendarDate = (value) => new Date(`${value}T12:00:00Z`);

export function tripDateLabels({ startDate, endDate }) {
  const start = calendarDate(startDate),
    end = calendarDate(endDate);
  const format = (date, options) =>
    new Intl.DateTimeFormat("es-ES", { timeZone: "UTC", ...options }).format(
      date,
    );
  const dayRange = `${start.getUTCDate()}—${end.getUTCDate()}`;
  const month = format(start, { month: "long" }),
    year = start.getUTCFullYear();
  return {
    dayRange,
    month,
    year,
    monthYear: `${month}, ${year}`,
    long: `${start.getUTCDate()}–${end.getUTCDate()} de ${month} de ${year}`,
    compact: `${dayRange}.${String(start.getUTCMonth() + 1).padStart(2, "0")}.${year}`,
    weekdays: `${capitalize(format(start, { weekday: "long" }))} a ${format(end, { weekday: "long" })}.`,
  };
}

export function performanceDateLabels(startsAt) {
  const date = new Date(startsAt);
  return {
    date: capitalize(
      new Intl.DateTimeFormat("es-ES", {
        timeZone: "Europe/Vienna",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date),
    ),
    time: new Intl.DateTimeFormat("es-ES", {
      timeZone: "Europe/Vienna",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(date),
  };
}

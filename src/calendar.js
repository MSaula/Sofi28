import { trip } from "./content.js";

export function escapeCalendarText(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replace(/\r\n|\n|\r/g, "\\n")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,");
}

export function foldCalendarLine(line) {
  const encoder = new TextEncoder();
  const result = [];
  let current = "",
    bytes = 0;
  for (const char of line) {
    const n = encoder.encode(char).length;
    if (bytes + n > 75) {
      result.push(current);
      current = " ";
      bytes = 1;
    }
    current += char;
    bytes += n;
  }
  result.push(current);
  return result.join("\r\n");
}

const compactDate = (value) => value.replaceAll("-", "");
const utcDate = (value) =>
  new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");

export function buildCalendar(data = trip, now = new Date()) {
  const end = new Date(`${data.endDate}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 1);
  const stamp = utcDate(now);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sofi 28//Viena//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:viena-${compactDate(data.startDate)}@para-ti.local`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compactDate(data.startDate)}`,
    `DTEND;VALUE=DATE:${compactDate(end.toISOString().slice(0, 10))}`,
    `SUMMARY:${escapeCalendarText("Un fin de semana en Viena")}`,
    `LOCATION:${escapeCalendarText("Viena, Austria")}`,
    "END:VEVENT",
    "BEGIN:VEVENT",
    `UID:living-legacies-${compactDate(data.startDate)}@para-ti.local`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${utcDate(data.ballet.startsAt)}`,
    `SUMMARY:${escapeCalendarText(`${data.ballet.title} — ${data.ballet.theatre}`)}`,
    `LOCATION:${escapeCalendarText(`${data.ballet.theatre}, ${data.ballet.address}`)}`,
    `DESCRIPTION:${escapeCalendarText(`${data.ballet.choreographers.join(" / ")}. ${data.ballet.area}. Fila ${data.ballet.row}. Asientos ${data.ballet.seats}.`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ];
  return lines.map(foldCalendarLine).join("\r\n");
}

export function downloadCalendar() {
  const url = URL.createObjectURL(
    new Blob([buildCalendar()], { type: "text/calendar;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "Nos-vamos-a-Viena.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

import { memo, useMemo } from "react";
import { ArrowDown, CalendarDays } from "lucide-react";
import { memories, trip } from "../content";
import { useElementSize, useScene } from "../hooks";
import { calendarDays, clamp, mix, monthIndex, range, smooth } from "../motion";
import { tripDateLabels } from "../dates";

const names = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const startDate = new Date(`${trip.startDate}T12:00:00Z`),
  endDate = new Date(`${trip.endDate}T12:00:00Z`);
const startDay = startDate.getUTCDate(),
  endDay = endDate.getUTCDate();
const targetIndex =
  monthIndex(startDate.getUTCFullYear(), startDate.getUTCMonth()) -
  monthIndex(2024, 7);
const months = Array.from({ length: targetIndex + 1 }, (_, i) => {
  const d = new Date(Date.UTC(2024, 7 + i, 1));
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
    days: calendarDays(d.getUTCFullYear(), d.getUTCMonth()),
  };
});
const travelLabels = tripDateLabels(trip);
const last = targetIndex * 110 + 48;
const Month = memo(function Month({ index, selected = false }) {
  const month = months[index];
  return (
    <g
      transform={`translate(${index * 110} 0)`}
      className={index === targetIndex ? "target-month" : "history-month"}
    >
      <rect width="96" height="140" rx="9" fill="white" />
      <text
        x="9"
        y="19"
        fontSize="8"
        fontWeight="650"
        fill={index === targetIndex ? "#2368f5" : "#51535b"}
      >
        {names[month.month]}
      </text>
      <text x="9" y="31" fontSize="5" fill="#767985">
        {month.year}
      </text>
      {["L", "M", "X", "J", "V", "S", "D"].map((day, j) => (
        <text
          key={j}
          x={12 + j * 12}
          y="47"
          textAnchor="middle"
          fontSize="4.3"
          fill="#777b86"
        >
          {day}
        </text>
      ))}
      {month.days.map(
        (day, j) =>
          day && (
            <g
              key={j}
              data-selected-day={
                index === targetIndex && day >= startDay && day <= endDay
                  ? day
                  : undefined
              }
            >
              {selected && day >= startDay && day <= endDay && (
                <rect
                  x={6 + (j % 7) * 12}
                  y={51 + Math.floor(j / 7) * 14}
                  width="12"
                  height="12"
                  rx="6"
                  fill="#2368f5"
                />
              )}
              <text
                x={12 + (j % 7) * 12}
                y={59 + Math.floor(j / 7) * 14}
                textAnchor="middle"
                fontSize="5.3"
                fontWeight={
                  selected && day >= startDay && day <= endDay ? 650 : 400
                }
                fill={
                  selected && day >= startDay && day <= endDay
                    ? "#fff"
                    : "#626671"
                }
              >
                {day}
              </text>
            </g>
          ),
      )}
    </g>
  );
});
const History = memo(function History() {
  return months.slice(0, -1).map((_, i) => <Month key={i} index={i} />);
});

function visibleLabels(labels, w) {
  const ends = [-Infinity, -Infinity];
  return labels.filter((label) => {
    const left = label.x - label.width / 2,
      right = label.x + label.width / 2;
    if (left < 8 || right > w - 8 || left < ends[label.lane] + 12) return false;
    ends[label.lane] = right;
    return true;
  });
}

export default function CalendarScene() {
  const { ref, progress: p, reduced } = useScene();
  const [artRef, size] = useElementSize();
  const w = size.width,
    h = size.height;
  const overviewScale = Math.min((w - 52) / ((targetIndex + 1) * 110), 0.33);
  const approach = smooth(range(p, 0, 0.14)),
    travel = smooth(range(p, 0.14, 0.68)),
    zoom = smooth(range(p, 0.68, 0.93));
  const fitScale = Math.max(0.1, Math.min((w - 36) / 96, (h - 24) / 140, 3.5));
  const scale = mix(mix(overviewScale, 0.53, approach), fitScale, zoom);
  const focus = mix(mix(last / 2, 48, approach), last, travel);
  const tx = w / 2 - focus * scale,
    ty = h / 2 - 70 * scale;
  const labelOpacity = 1 - range(p, 0.66, 0.76);
  const arrived = smooth(range(p, 0.86, 0.93));
  const labels = useMemo(
    () =>
      memories.map((m, i) => ({
        name: m.name,
        month: m.month,
        year: m.year,
        index: monthIndex(m.year, m.month) - monthIndex(2024, 7),
        lane: i % 2,
        width: Math.max(m.name.length * 6.4, 62) + 12,
      })),
    [],
  );
  const fitted = visibleLabels(
    labels.map((label) => ({
      ...label,
      x: tx + (label.index * 110 + 48) * scale,
    })),
    w,
  );
  return (
    <section
      className={`scroll-scene calendar-scene ${reduced ? "reduced-scene" : ""}`}
      ref={ref}
      id="fechas"
      aria-label="Nuestros viajes y el próximo fin de semana"
    >
      <div className="scene-sticky calendar-stage">
        <div className="calendar-heading">
          <span className="eyebrow">
            <span className="blue-dot" />
            01 — CUÁNDO
          </span>
          <h2>
            {p < 0.7 ? (
              <>
                Siempre hay
                <br />
                una próxima vez.
              </>
            ) : (
              "Reserva estos días."
            )}
          </h2>
        </div>
        <div className="calendar-art" ref={artRef}>
          {w > 0 && h > 0 && (
            <svg
              className="calendar-canvas"
              viewBox={`0 0 ${w} ${h}`}
              role="img"
              aria-label="De agosto de 2024 a enero de 2027. El siguiente viaje es del 22 al 24 de enero de 2027."
            >
              <g transform={`translate(${tx} ${ty}) scale(${scale})`}>
                <g opacity={mix(0.9, 0.06, zoom)}>
                  <History />
                </g>
                <Month index={targetIndex} selected={p >= 0.84} />
                <g opacity={1 - zoom}>
                  <path
                    d="M48 164H3238"
                    stroke="#b9c2d0"
                    strokeWidth={1 / scale}
                  />
                  {memories.map((m) => (
                    <circle
                      key={m.name}
                      cx={(monthIndex(m.year, m.month) - 7) * 110 + 48}
                      cy="164"
                      r={2.5 / scale}
                      fill="#8a9ebc"
                    />
                  ))}
                </g>
              </g>
              <g opacity={labelOpacity} className="memory-labels">
                {fitted.map((label) => (
                  <g
                    key={label.name}
                    data-memory-label={label.name}
                    transform={`translate(${label.x} ${h / 2 + (label.lane === 0 ? -1 : 1) * (70 * scale + 30)})`}
                  >
                    <text
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="550"
                      fill="#3b414d"
                    >
                      {label.name}
                    </text>
                    <text
                      textAnchor="middle"
                      y="17"
                      fontSize="9"
                      fill="#697281"
                    >
                      {names[label.month].slice(0, 3).toUpperCase()}{" "}
                      {label.year}
                    </text>
                  </g>
                ))}
              </g>
            </svg>
          )}
        </div>
        <div className="calendar-result" style={{ opacity: arrived }}>
          <span className="date-pill">
            <CalendarDays size={15} />
            {travelLabels.weekdays.replace(".", "").toUpperCase()}
          </span>
          <p>
            {travelLabels.dayRange} <span>{travelLabels.monthYear}</span>
          </p>
        </div>
        <div className="scene-bottom">
          <span>
            {p < 0.7
              ? "Lo que hemos vivido. Y lo que nos queda."
              : "Tres días. Un nuevo recuerdo."}
          </span>
          <ArrowDown size={15} />
        </div>
        <ul className="sr-only" aria-label="Viajes anteriores">
          {memories.map((m) => (
            <li key={m.name}>
              {m.name}, {names[m.month]} de {m.year}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

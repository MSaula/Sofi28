import { memo } from "react";
import { ArrowDown, CalendarDays, Camera } from "lucide-react";
import { memories, trip } from "../content";
import { useElementSize, useScene } from "../hooks";
import { mix } from "../motion";
import {
  fitTimelineLabels,
  last,
  monthNames as names,
  months,
  monthX,
  targetIndex,
  timelineFrame,
  timelineItems,
} from "../timeline";
import { tripDateLabels } from "../dates";

const startDate = new Date(`${trip.startDate}T12:00:00Z`),
  endDate = new Date(`${trip.endDate}T12:00:00Z`);
const startDay = startDate.getUTCDate(),
  endDay = endDate.getUTCDate();
const travelLabels = tripDateLabels(trip);
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

function PhotoSlot({ gift, className = "" }) {
  return (
    <div
      className={`birthday-photo ${className}`}
      data-photo-slot={gift.birthdayAge}
    >
      {gift.photo ? (
        <img src={gift.photo.src} alt={gift.photo.alt} decoding="async" />
      ) : (
        <div className="birthday-photo-empty">
          <Camera size={22} strokeWidth={1.3} aria-hidden="true" />
          <span>{gift.current ? "Por vivir" : "Nosotros"}</span>
        </div>
      )}
    </div>
  );
}

function BirthdayCard({ gift, frame }) {
  const { detail } = frame;
  const layout = gift.layout;
  const titleSize = Math.min(
    gift.current ? 14 : 30,
    layout.textWidth / (gift.name.length * 0.52),
  );
  const dateReveal = Math.max(0, Math.min(1, (detail - 0.4) / 0.5));
  return (
    <article
      className={`birthday-card ${gift.current ? "birthday-card-current" : ""} ${layout.compact ? "birthday-card-compact" : ""}`}
      data-gift-card={gift.birthdayAge}
      style={{
        height: gift.height,
        padding: mix(8, layout.padding, detail),
        gap: mix(0, layout.gap, detail),
        borderRadius: mix(12, 22, detail),
        "--photo-width": `${layout.photoWidth * detail}px`,
        "--photo-height": `${layout.photoHeight * detail}px`,
        "--photo-opacity": detail,
        "--edition-size": `${mix(9, 11, detail)}px`,
        "--place-size": `${mix(9, titleSize, detail)}px`,
        "--copy-gap": `${mix(2, layout.compact ? 5 : 9, detail)}px`,
        "--date-opacity": dateReveal,
        "--date-height": `${(layout.compact ? 14 : 44) * dateReveal}px`,
        "--date-gap": `${(layout.compact ? 5 : 9) * detail * dateReveal}px`,
      }}
    >
      <PhotoSlot gift={gift} className="birthday-card-photo" />
      <div className="birthday-card-copy">
        <span className="birthday-card-edition">Sofi {gift.birthdayAge}</span>
        <strong className="birthday-card-place">{gift.name}</strong>
        <div className="birthday-card-date">
          <span>
            {layout.compact ? names[gift.month].slice(0, 3) : names[gift.month]}
          </span>
          <span>{gift.year}</span>
        </div>
      </div>
    </article>
  );
}

function StaticHistory() {
  return (
    <div className="timeline-static-history">
      <h3>Cumplir años. Sumar recuerdos.</h3>
      <div className="birthday-gallery">
        {memories
          .filter((gift) => gift.birthdayAge)
          .map((gift) => (
            <figure
              key={gift.birthdayAge}
              data-static-photo-slot={gift.birthdayAge}
            >
              <PhotoSlot gift={gift} className="birthday-gallery-photo" />
              <figcaption>
                <span>Sofi {gift.birthdayAge}</span>
                <strong>{gift.name}</strong>
                <small>
                  {names[gift.month]} {gift.year}
                </small>
              </figcaption>
            </figure>
          ))}
      </div>
      <ul className="other-trips" aria-label="Más viajes juntos">
        {memories
          .filter((m) => !m.birthdayAge)
          .map((m) => (
            <li key={m.name}>
              <strong>{m.name}</strong>
              <span>
                {names[m.month]} {m.year}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default function CalendarScene() {
  const { ref, progress: p, reduced } = useScene();
  const [artRef, size] = useElementSize();
  const w = size.width,
    h = size.height;
  const frame = timelineFrame(p, w, h);
  const { tx, ty, scale, zoom, arrived } = frame;
  const fitted = fitTimelineLabels(frame, w);
  return (
    <section
      className={`scroll-scene calendar-scene ${reduced ? "reduced-scene" : ""}`}
      ref={ref}
      id="fechas"
      aria-label="Nuestros viajes y el próximo fin de semana"
      style={{ "--calendar-arrived": arrived }}
    >
      <div className="scene-sticky calendar-stage">
        <div className="calendar-heading">
          <span className="eyebrow">
            <span className="blue-dot" />
            01 — CUÁNDO
          </span>
          <h2>
            {p < 0.7 || reduced ? (
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
        {reduced && <StaticHistory />}
        <div
          className="calendar-art"
          ref={artRef}
          style={{
            "--calendar-edge-strength": frame.edgeStrength,
            "--calendar-feather": `${Math.min(28, w * 0.055) * frame.edgeStrength}px`,
          }}
        >
          {w > 0 && h > 0 && (
            <svg
              className="calendar-canvas"
              viewBox={`0 0 ${w} ${h}`}
              style={{ width: w, height: h }}
              role="img"
              aria-label="De enero de 2022 a enero de 2027. Sofi 23 a Sofi 28. El siguiente viaje es del 22 al 24 de enero de 2027."
            >
              <g transform={`translate(${tx} ${ty}) scale(${scale})`}>
                <g opacity={mix(0.9, 0.06, zoom)}>
                  <History />
                </g>
                <Month index={targetIndex} selected={p >= 0.84} />
                <g opacity={1 - zoom}>
                  <path
                    d={`M48 164H${last}`}
                    stroke="#b9c2d0"
                    strokeWidth={1 / scale}
                  />
                  {timelineItems.map((m) => (
                    <circle
                      key={m.name}
                      cx={monthX(m.index)}
                      cy="164"
                      r={2.5 / scale}
                      fill={m.birthdayAge ? "#2368f5" : "#8a9ebc"}
                    />
                  ))}
                </g>
              </g>
              <g opacity={1 - zoom} aria-hidden="true">
                {months.map(
                  (month, index) =>
                    month.month === 0 && (
                      <text
                        key={month.year}
                        x={tx + monthX(index) * scale}
                        y={frame.axisY + 15}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#637087"
                      >
                        {month.year}
                      </text>
                    ),
                )}
              </g>
              <g className="memory-connectors" aria-hidden="true">
                {fitted
                  .filter((label) => label.lane === "gift")
                  .map((label) => (
                    <path
                      key={label.name}
                      d={`M${label.anchorX} ${ty - 3}L${label.x} ${ty - 16}`}
                      stroke="#afc3e5"
                      fill="none"
                      opacity={label.opacity}
                    />
                  ))}
              </g>
            </svg>
          )}
          <div className="timeline-annotations" aria-hidden="true">
            {fitted.map((label) => {
              const gift = label.lane === "gift";
              return (
                <div
                  key={label.name}
                  data-memory-label={label.name}
                  data-lane={label.lane}
                  className={
                    gift ? "timeline-gift-label" : "timeline-trip-label"
                  }
                  style={{
                    left: label.x,
                    top: gift ? ty - 16 - label.height : frame.axisY + 23,
                    width: label.width,
                    opacity: label.opacity,
                  }}
                >
                  {gift ? (
                    <BirthdayCard gift={label} frame={frame} />
                  ) : (
                    <>
                      <strong>{label.name}</strong>
                      <span>
                        {names[label.month].slice(0, 3).toUpperCase()}{" "}
                        {label.year}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
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
        {!reduced && (
          <ul className="sr-only" aria-label="Viajes anteriores">
            {memories.map((m) => (
              <li key={m.name}>
                {m.birthdayAge ? `Sofi ${m.birthdayAge}: ` : ""}
                {m.name}, {names[m.month]} de {m.year}
                {m.birthdayAge && !m.photo
                  ? ". Espacio para una foto de los dos."
                  : m.photo
                    ? `. ${m.photo.alt}.`
                    : ""}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

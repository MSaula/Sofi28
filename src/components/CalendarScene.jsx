import { memo, useId } from "react";
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

function PhotoSlot({ gift, width, height, clipId }) {
  return (
    <g
      data-photo-slot={gift.birthdayAge}
      aria-label={`Foto de los dos: Sofi ${gift.birthdayAge}`}
    >
      <defs>
        <clipPath id={clipId}>
          <rect width={width} height={height} rx="9" />
        </clipPath>
      </defs>
      {gift.photo ? (
        <image
          href={gift.photo.src}
          width={width}
          height={height}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        >
          <title>{gift.photo.alt}</title>
        </image>
      ) : (
        <>
          <rect width={width} height={height} rx="9" fill="#edf2fa" />
          <Camera
            x={width / 2 - 9}
            y={height / 2 - 17}
            width="18"
            height="18"
            stroke="#657691"
            strokeWidth="1.4"
          />
          <text
            x={width / 2}
            y={height / 2 + 13}
            textAnchor="middle"
            fontSize="7.5"
            fill="#596b85"
          >
            Nosotros
          </text>
        </>
      )}
    </g>
  );
}

function BirthdayCard({ gift, frame, id }) {
  const { cardHeight: height, detail } = frame;
  const photoSize = height - 20;
  const textX = mix(
    -gift.width / 2 + 9,
    -gift.width / 2 + photoSize + 21,
    detail,
  );
  return (
    <g data-gift-card={gift.birthdayAge}>
      <rect
        x={-gift.width / 2}
        width={gift.width}
        height={height}
        rx="13"
        fill="white"
        stroke={gift.current ? "#9fbcf7" : "#dfe6f0"}
      />
      {detail > 0 && (
        <g
          transform={`translate(${-gift.width / 2 + 10} ${height / 2 - (photoSize * detail) / 2}) scale(${detail})`}
          opacity={detail}
        >
          <PhotoSlot
            gift={gift}
            width={photoSize}
            height={photoSize}
            clipId={`${id}-photo-${gift.birthdayAge}`}
          />
        </g>
      )}
      <g transform={`translate(${textX} 0)`}>
        <text
          y={mix(14, height / 2 - 13, detail)}
          fill="#2360ce"
          fontSize={mix(9, 10, detail)}
          fontWeight="650"
        >
          Sofi {gift.birthdayAge}
        </text>
        <text
          y={mix(28, height / 2 + 3, detail)}
          fill="#293341"
          fontSize={mix(9, 12, detail)}
          fontWeight="550"
        >
          {gift.name}
        </text>
        <text y={height / 2 + 18} fill="#617087" fontSize="8" opacity={detail}>
          {names[gift.month].slice(0, 3).toUpperCase()} {gift.year}
        </text>
      </g>
    </g>
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
              {gift.photo ? (
                <img src={gift.photo.src} alt={gift.photo.alt} />
              ) : (
                <div className="birthday-photo-placeholder">
                  <Camera size={22} strokeWidth={1.3} />
                  <span>Nuestra foto</span>
                </div>
              )}
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
  const id = useId();
  const w = size.width,
    h = size.height;
  const frame = timelineFrame(p, w, h);
  const { tx, ty, scale, zoom, labelOpacity, arrived } = frame;
  const fitted = fitTimelineLabels(frame, w);
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
        <div className="calendar-art" ref={artRef}>
          {w > 0 && h > 0 && (
            <svg
              className="calendar-canvas"
              viewBox={`0 0 ${w} ${h}`}
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
              <g className="memory-labels">
                {fitted.map((label) => {
                  const gift = label.lane === "gift";
                  const y = gift
                    ? ty - 16 - frame.cardHeight
                    : frame.axisY + 35;
                  const opacity = label.current ? 1 : labelOpacity;
                  return (
                    <g key={label.name} opacity={opacity}>
                      {gift && (
                        <path
                          d={`M${label.anchorX} ${ty - 3}L${label.x} ${ty - 16}`}
                          stroke="#afc3e5"
                          fill="none"
                        />
                      )}
                      <g
                        data-memory-label={label.name}
                        data-lane={label.lane}
                        transform={`translate(${label.x} ${y})`}
                      >
                        {gift ? (
                          <BirthdayCard gift={label} frame={frame} id={id} />
                        ) : (
                          <>
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
                          </>
                        )}
                      </g>
                    </g>
                  );
                })}
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
              {m.birthdayAge ? `Sofi ${m.birthdayAge}: ` : ""}
              {m.name}, {names[m.month]} de {m.year}
              {m.birthdayAge && !m.photo
                ? ". Espacio para una foto de los dos."
                : ""}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

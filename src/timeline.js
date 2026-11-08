import { timelineStart, timelineEvents, trip } from "./content.js";
import {
  calendarDays,
  clamp,
  mix,
  monthIndex,
  range,
  smooth,
} from "./motion.js";

export const monthNames = [
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
const startIndex = monthIndex(timelineStart.year, timelineStart.month);
const date = new Date(`${trip.startDate}T12:00:00Z`);
export const targetIndex =
  monthIndex(date.getUTCFullYear(), date.getUTCMonth()) - startIndex;
export const months = Array.from({ length: targetIndex + 1 }, (_, index) => {
  const d = new Date(
    Date.UTC(timelineStart.year, timelineStart.month + index, 1),
  );
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
    days: calendarDays(d.getUTCFullYear(), d.getUTCMonth()),
  };
});
export const timelineItems = timelineEvents.map((event) => ({
  ...event,
  index: monthIndex(event.year, event.month) - startIndex,
  lane: event.birthdayAge ? "gift" : "trip",
}));
export const monthX = (index) => index * 110 + 48;
export const last = monthX(targetIndex);

// Fixed-size annotations sit outside the scaled calendar world. Reserve their
// actual height before fitting the month, including on short laptop screens.
export function timelineFrame(p, w, h) {
  const approach = smooth(range(p, 0, 0.14));
  const travel = smooth(range(p, 0.14, 0.68));
  const zoom = smooth(range(p, 0.68, 0.93));
  const fullCardHeight = h < 280 ? 64 : 84;
  const fullCardWidth = h < 280 ? 164 : 184;
  const detail = approach;
  const cardHeight = mix(38, fullCardHeight, detail);
  const cardWidth = mix(72, fullCardWidth, detail);
  const overview = Math.min((w - 52) / (months.length * 110), 0.33);
  const travelScale = Math.max(
    0.1,
    Math.min(0.62, (h - fullCardHeight - 16 - 56) / 164),
  );
  const finalScale = Math.max(
    0.1,
    Math.min((w - 36) / 96, (h - fullCardHeight - 16 - 12) / 140, 3.5),
  );
  const scale = mix(mix(overview, travelScale, approach), finalScale, zoom);
  const focus = mix(
    mix(last / 2, monthX(timelineItems[0].index), approach),
    last,
    travel,
  );
  const bottomSpace = mix(24 * scale + 56, 12, zoom);
  const stackHeight = cardHeight + 16 + 140 * scale + bottomSpace;
  const ty = (h - stackHeight) / 2 + cardHeight + 16;
  return {
    tx: w / 2 - focus * scale,
    ty,
    scale,
    zoom,
    detail,
    cardHeight,
    cardWidth,
    axisY: ty + 164 * scale,
    labelOpacity: 1 - range(p, 0.66, 0.76),
    arrived: smooth(range(p, 0.86, 0.93)),
  };
}

export function fitTimelineLabels(frame, w) {
  const accepted = [];
  const candidates = timelineItems
    .map((item) => {
      const anchorX = frame.tx + monthX(item.index) * frame.scale;
      const width = item.birthdayAge
        ? frame.cardWidth
        : Math.max(item.name.length * 6.4, 62) + 12;
      return {
        ...item,
        anchorX,
        width,
        x: clamp(anchorX, width / 2 + 8, w - width / 2 - 8),
      };
    })
    .filter((label) => label.anchorX >= 8 && label.anchorX <= w - 8);
  // Give the trip nearest the camera first choice. Chronological greediness
  // starves adjacent months (e.g. Greece and the Basque Country) until the
  // earlier label has almost left the screen.
  candidates.sort(
    (a, b) => Math.abs(a.anchorX - w / 2) - Math.abs(b.anchorX - w / 2),
  );
  for (const label of candidates) {
    if (
      accepted.some(
        (other) =>
          other.lane === label.lane &&
          Math.abs(other.x - label.x) < (other.width + label.width) / 2 + 12,
      )
    )
      continue;
    accepted.push(label);
  }
  return accepted.sort((a, b) => a.index - b.index);
}

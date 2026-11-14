import { timelineStart, timelineEvents, trip } from "./content.js";
import { calendarDays, mix, monthIndex, range, smooth } from "./motion.js";

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

// Portrait photos keep their complete 3:4 composition. The remaining width is
// a separate caption column, so no text has to sit over a face or landscape.
export function birthdayLayout(w, h, scale, current = false) {
  if (current)
    return {
      width: Math.min(w - 16, 320),
      height: h < 280 ? 88 : 104,
      photoWidth: 0,
      photoHeight: 0,
      textWidth: Math.min(w - 16, 320) - (h < 280 || w < 300 ? 32 : 44) - 56,
      gap: 0,
      padding: h < 280 || w < 300 ? 16 : 22,
      compact: false,
    };
  const textWidth = w < 400 ? 94 : w < 700 ? 112 : 154;
  const maxWidth = Math.min(w - 16, 440);
  const availablePhotoHeight = Math.max(30, h - 16 - 164 * scale - 56 - 8 - 24);
  const photoWidth = Math.max(
    20,
    Math.min(maxWidth - textWidth - 40, (availablePhotoHeight * 3) / 4),
  );
  const photoHeight = (photoWidth * 4) / 3;
  return {
    width: photoWidth + textWidth + 40,
    height: photoHeight + 24,
    photoWidth,
    photoHeight,
    textWidth,
    gap: 16,
    padding: 12,
    compact: photoHeight < 120,
  };
}

// Calendar and HTML annotations share one camera. Dates reserve their space
// only as they arrive; historical photos finish fading before the final zoom.
export function timelineFrame(p, w, h) {
  const approach = smooth(range(p, 0, 0.14));
  const travel = smooth(range(p, 0.14, 0.68));
  const zoom = smooth(range(p, 0.76, 0.93));
  const detail = approach;
  const overview = Math.min((w - 88) / (months.length * 110), 0.33);
  const travelScale = Math.max(0.16, Math.min(0.5, (h - 200) / 250));
  const giftLayout = birthdayLayout(w, h, travelScale);
  const currentLayout = birthdayLayout(w, h, travelScale, true);
  const cardHeight = mix(
    mix(38, giftLayout.height, detail),
    currentLayout.height,
    smooth(range(p, 0.74, 0.82)),
  );
  const finalScale = Math.max(
    0.1,
    Math.min((w - 36) / 96, (h - currentLayout.height - 16 - 12) / 140, 3.5),
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
    giftLayout,
    currentLayout,
    axisY: ty + 164 * scale,
    labelOpacity: 1 - range(p, 0.66, 0.74),
    arrived: smooth(range(p, 0.86, 0.93)),
    edgeStrength: approach * (1 - smooth(range(p, 0.74, 0.86))),
  };
}

export function fitTimelineLabels(frame, w) {
  const candidates = timelineItems.map((item) => {
    const anchorX = frame.tx + monthX(item.index) * frame.scale;
    const layout = item.current ? frame.currentLayout : frame.giftLayout;
    const width = item.birthdayAge
      ? mix(72, layout.width, frame.detail)
      : Math.max(item.name.length * 6.4, 62) + 12;
    return {
      ...item,
      anchorX,
      width,
      height: item.birthdayAge ? mix(38, layout.height, frame.detail) : 32,
      layout,
      x: anchorX,
      opacity: item.current ? 1 : frame.labelOpacity,
    };
  });
  const separation = (a, b) =>
    smooth(range(Math.abs(a.x - b.x) - (a.width + b.width) / 2, 12, 32));

  // Stable birthday priority in the overview; reveal each neighbour gradually
  // as its rectangle gains room. No DOM removal or priority flips on zoom.
  const gifts = candidates.filter((label) => label.lane === "gift").reverse();
  gifts.forEach((label, index) => {
    label.collisionOpacity = 1;
    for (const other of gifts.slice(0, index))
      label.collisionOpacity *=
        1 - other.collisionOpacity * (1 - separation(label, other));
    label.opacity *= label.collisionOpacity;
  });

  // Adjacent ordinary trips share their band with a spatial crossfade. The
  // label nearest the camera becomes readable continuously, including pairs
  // only a month apart. Their positions always follow the actual months.
  const trips = candidates.filter((label) => label.lane === "trip");
  for (const label of trips) {
    for (const other of trips) {
      if (label === other) continue;
      const preference = smooth(
        range(Math.abs(other.x - w / 2) - Math.abs(label.x - w / 2), -36, 36),
      );
      label.opacity *=
        separation(label, other) + (1 - separation(label, other)) * preference;
    }
  }
  return candidates;
}

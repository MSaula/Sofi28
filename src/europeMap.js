import { geoInterpolate, geoMercator } from "d3-geo";
import places from "./data/europe-places.json" with { type: "json" };
import { airports, boundsFeature } from "./geography.js";
import { clamp, mix } from "./motion.js";

export { places as europePlaces };
export const europeFrameBounds = [-11, 35, 27, 57.5];
const intersects = (a, b, gap = 0) =>
  a.x < b.x + b.width + gap &&
  a.x + a.width + gap > b.x &&
  a.y < b.y + b.height + gap &&
  a.y + a.height + gap > b.y;

export function buildEuropeModel(w, h) {
  const padding = w < 400 ? 24 : 30;
  const projection = geoMercator().fitExtent(
    [
      [padding, 28],
      [w - padding, h - 28],
    ],
    boundsFeature(europeFrameBounds),
  );
  const interpolate = geoInterpolate(
    airports.BCN.coordinates,
    airports.VIE.coordinates,
  );
  const route = Array.from({ length: 129 }, (_, i) =>
    projection(interpolate(i / 128)),
  );
  const lengths = [0];
  for (let i = 1; i < route.length; i++)
    lengths.push(
      lengths[i - 1] +
        Math.hypot(
          route[i][0] - route[i - 1][0],
          route[i][1] - route[i - 1][1],
        ),
    );
  const d = route
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(4)},${p[1].toFixed(4)}`)
    .join("");
  const a = route[0],
    b = route.at(-1);
  const reserved = [
    { x: 8, y: 7, width: 108, height: 22 },
    { x: w - 54, y: 8, width: 46, height: 60 },
    { x: w - 88, y: h - 38, width: 80, height: 30 },
    { x: a[0] - 38, y: a[1] + 18, width: 76, height: 32 },
    { x: a[0] - 13, y: a[1] - 13, width: 26, height: 26 },
    { x: b[0] - 30, y: b[1] - 46, width: 60, height: 35 },
    { x: b[0] - 13, y: b[1] - 13, width: 26, height: 26 },
  ];
  // Prioritise the shared places on small maps. Extra capitals are context,
  // never a reason to move a visited marker or send its label far away.
  const mobileContext = w < 290 ? [] : ["madrid", "paris", "berlin"];
  const visible = places.places
    .filter(
      (p) =>
        w >= 400 ||
        p.visited ||
        p.frameReference ||
        mobileContext.includes(p.id),
    )
    .map((place) => ({ ...place, point: projection(place.coordinates) }))
    .filter(
      (place) =>
        place.point[0] > 10 &&
        place.point[0] < w - 10 &&
        place.point[1] > 12 &&
        place.point[1] < h - 28,
    );
  const required = visible.filter((p) => p.visited || p.frameReference);
  const dots = required.map((p) => ({
    x: p.point[0] - 4,
    y: p.point[1] - 4,
    width: 8,
    height: 8,
  }));
  const fits = (r) =>
    r.x >= 8 && r.y >= 8 && r.x + r.width <= w - 8 && r.y + r.height <= h - 16;
  const prepared = visible.map((place) => {
    const fontSize = place.visited ? (w < 400 ? 9.5 : 10.5) : 9;
    const width = place.name.length * fontSize * 0.55 + 5,
      height = fontSize + 5;
    const [x, y] = place.point;
    const candidates = [];
    for (const offset of [0, 14, 28, 44, 60, 78]) {
      for (const [left, top] of [
        [x + 8, y - height - 3 - offset],
        [x - width - 8, y - height - 3 - offset],
        [x + 8, y + 5 + offset],
        [x - width - 8, y + 5 + offset],
        [x - width / 2, y - height - 10 - offset],
        [x - width / 2, y + 12 + offset],
      ])
        candidates.push({ x: left, y: top, width, height });
    }
    for (const offset of [20, 40, 60, 80])
      for (const dy of [-height - 5, 5, -height - 24, 24])
        for (const left of [x + 8 + offset, x - width - 8 - offset])
          candidates.push({ x: left, y: y + dy, width, height });
    candidates.sort(
      (a, b) =>
        Math.hypot(a.x + a.width / 2 - x, a.y + a.height / 2 - y) -
        Math.hypot(b.x + b.width / 2 - x, b.y + b.height / 2 - y),
    );
    return {
      ...place,
      fontSize,
      candidates: candidates.filter(
        (r) =>
          fits(r) && [...reserved, ...dots].every((b) => !intersects(r, b, 2)),
      ),
    };
  });
  const mandatory = prepared.filter((p) => p.visited || p.frameReference);
  const optional = prepared.filter((p) => !p.visited && !p.frameReference);
  const distance = (p) =>
    !p.rect
      ? 10000
      : Math.hypot(
          Math.max(
            p.rect.x - p.point[0],
            0,
            p.point[0] - p.rect.x - p.rect.width,
          ),
          Math.max(
            p.rect.y - p.point[1],
            0,
            p.point[1] - p.rect.y - p.rect.height,
          ),
        );
  const placeOne = (p, accepted) => {
    const rect = p.candidates.find((r) =>
      accepted.every((other) => !other.rect || !intersects(r, other.rect, 2)),
    );
    const { candidates, ...rest } = p;
    return { ...rest, rect: rect || null, unplaced: !rect };
  };
  // Compare bounded, deterministic layouts instead of allowing the last label
  // in a crowded cluster to inherit a long, misleading leader line.
  const orders = [
    [...mandatory].sort((a, b) => b.name.length - a.name.length),
    [...mandatory].sort((a, b) => a.point[0] - b.point[0]),
    [...mandatory].sort((a, b) => b.point[0] - a.point[0]),
    [...mandatory].sort((a, b) => a.point[1] - b.point[1]),
    [...mandatory].sort((a, b) => b.point[1] - a.point[1]),
  ];
  let seed = 28;
  for (let attempt = 0; attempt < 24; attempt++) {
    const order = [...mandatory];
    for (let i = order.length - 1; i > 0; i--) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const j = seed % (i + 1);
      [order[i], order[j]] = [order[j], order[i]];
    }
    orders.push(order);
  }
  let accepted = [],
    best = Infinity;
  for (const order of orders) {
    const candidate = [];
    for (const p of order) candidate.push(placeOne(p, candidate));
    const distances = candidate.map(distance),
      score =
        Math.max(...distances) ** 2 + distances.reduce((s, d) => s + d * d, 0);
    if (score < best) {
      best = score;
      accepted = candidate;
    }
  }
  for (const p of optional) {
    if (
      accepted.some(
        (a) =>
          a.rect &&
          intersects(
            { x: p.point[0] - 3, y: p.point[1] - 3, width: 6, height: 6 },
            a.rect,
            1,
          ),
      )
    )
      continue;
    const label = placeOne(p, accepted);
    if (label.rect) accepted.push(label);
  }
  return {
    projection,
    route,
    lengths,
    d,
    a,
    b,
    labels: accepted,
    reserved,
    width: w,
    height: h,
  };
}

export function flightAt(model, progress) {
  const t = clamp(progress),
    target = t * model.lengths.at(-1);
  let i = 1;
  while (i < model.lengths.length - 1 && model.lengths[i] < target) i++;
  const a = model.route[i - 1],
    b = model.route[i];
  const span = model.lengths[i] - model.lengths[i - 1];
  const f = span ? (target - model.lengths[i - 1]) / span : 0;
  return {
    point: [mix(a[0], b[0], f), mix(a[1], b[1], f)],
    angle: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI + 45,
  };
}

export function europeCamera(model, zoom) {
  const scale = mix(1, 1.65, zoom);
  return {
    scale,
    x: (model.width / 2 - model.b[0] * 1.65) * zoom,
    y: (model.height / 2 - model.b[1] * 1.65) * zoom,
  };
}

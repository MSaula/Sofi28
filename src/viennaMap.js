import { geoMercator } from "d3-geo";
import { boundsFeature } from "./geography.js";

export const featuredPlaceIds = [
  "belvedere",
  "staatsoper",
  "hofburg",
  "stephansdom",
  "karlskirche",
];

export function buildViennaModel(width, height, coordinates, origin) {
  const points = [...coordinates, origin];
  const bounds = [
    Math.min(...points.map((p) => p[0])),
    Math.min(...points.map((p) => p[1])),
    Math.max(...points.map((p) => p[0])),
    Math.max(...points.map((p) => p[1])),
  ];
  const px = width < 600 ? 40 : 76;
  const py = Math.min(height * 0.2, width < 600 ? 64 : 80);
  const projection = geoMercator().fitExtent(
    [
      [px, py],
      [Math.max(px + 1, width - px), Math.max(py + 1, height - py)],
    ],
    boundsFeature(bounds),
  );
  return { width, height, projection };
}

export const screenPoint = (point, view) => [
  point[0] * view.k + view.x,
  point[1] * view.k + view.y,
];
export const viewTransform = (view) =>
  `translate(${view.x} ${view.y}) scale(${view.k})`;

export function zoomView(view, factor, width, height) {
  const k = Math.max(1, Math.min(3.6, view.k * factor));
  const ratio = k / view.k;
  return {
    k,
    x: width / 2 - (width / 2 - view.x) * ratio,
    y: height / 2 - (height / 2 - view.y) * ratio,
  };
}

export function fitWalkingRoute(model, coordinates) {
  const points = coordinates.map(model.projection);
  const xs = points.map((p) => p[0]),
    ys = points.map((p) => p[1]);
  const left = Math.min(...xs),
    right = Math.max(...xs),
    top = Math.min(...ys),
    bottom = Math.max(...ys);
  const padX = model.width < 600 ? 42 : 85;
  const padY = Math.min(model.height * 0.2, 90);
  const k = Math.max(
    1,
    Math.min(
      3.6,
      (model.width - padX * 2) / Math.max(1, right - left),
      (model.height - padY * 2) / Math.max(1, bottom - top),
    ),
  );
  return {
    k,
    x: model.width / 2 - ((left + right) / 2) * k,
    y: model.height / 2 - ((top + bottom) / 2) * k,
  };
}

export function constrainView(view, model, bbox) {
  const a = model.projection([bbox[0], bbox[3]]),
    b = model.projection([bbox[2], bbox[1]]);
  const clamp = (n, lo, hi) =>
    lo <= hi ? Math.max(lo, Math.min(hi, n)) : (lo + hi) / 2;
  return {
    k: view.k,
    x: clamp(view.x, model.width - b[0] * view.k, -a[0] * view.k),
    y: clamp(view.y, model.height - b[1] * view.k, -a[1] * view.k),
  };
}

export function projectedGeometryPath(geometry, projection) {
  const line = (points) =>
    points.length
      ? "M" +
        points
          .map((p) =>
            projection(p)
              .map((n) => n.toFixed(2))
              .join(","),
          )
          .join("L")
      : "";
  if (geometry.type === "LineString") return line(geometry.coordinates);
  if (geometry.type === "MultiLineString")
    return geometry.coordinates.map(line).join("");
  const polygon = (rings) => rings.map((ring) => line(ring) + "Z").join("");
  if (geometry.type === "Polygon") return polygon(geometry.coordinates);
  if (geometry.type === "MultiPolygon")
    return geometry.coordinates.map(polygon).join("");
  return "";
}

const intersects = (a, b, margin = 5) =>
  a.x < b.x + b.width + margin &&
  a.x + a.width + margin > b.x &&
  a.y < b.y + b.height + margin &&
  a.y + a.height + margin > b.y;

// Only labels move. Every dot remains at its true projected coordinate.
export function placeMapLabels(points, width, height, reserved = []) {
  const taken = [...reserved];
  const result = [];
  for (const point of points) {
    const boxWidth = Math.min(width - 16, point.name.length * 6.5 + 20);
    const boxHeight = point.home ? 26 : 22;
    const [x, y] = point.point;
    const candidates = [
      { x: x - boxWidth / 2, y: y + (point.home ? 27 : 23) },
      { x: x - boxWidth / 2, y: y - boxHeight - 24 },
      { x: x + 25, y: y - boxHeight / 2 },
      { x: x - boxWidth - 25, y: y - boxHeight / 2 },
    ].map((p) => ({
      x: Math.max(8, Math.min(width - boxWidth - 8, p.x)),
      y: Math.max(8, Math.min(height - boxHeight - 8, p.y)),
      width: boxWidth,
      height: boxHeight,
    }));
    const rect = candidates.find(
      (rect) =>
        !taken.some((other) => intersects(rect, other)) &&
        !points.some((other) => {
          if (other.id === point.id) return false;
          return intersects(
            rect,
            {
              x: other.point[0] - 17,
              y: other.point[1] - 17,
              width: 34,
              height: 34,
            },
            1,
          );
        }),
    );
    if (rect) taken.push(rect);
    result.push({ ...point, rect: rect || null });
  }
  return result;
}

export function nearestMapPlace(places, projection, view, target, radius = 20) {
  return (
    places
      .map((place) => ({
        place,
        distance: Math.hypot(
          ...screenPoint(projection(place.coordinates), view).map(
            (n, i) => n - target[i],
          ),
        ),
      }))
      .filter((p) => p.distance <= radius)
      .sort((a, b) => a.distance - b.distance)[0]?.place || null
  );
}

export function walkingLabels(route) {
  const step = route.meters < 300 ? 10 : 50;
  const meters = Math.round(route.meters / step) * step;
  return {
    meters,
    minutes: Math.max(1, Math.round(route.seconds / 60)),
    distance: `${meters.toLocaleString("es-ES", { useGrouping: "always" })} m`,
  };
}

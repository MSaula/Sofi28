import vienna from "./data/vienna-streets.json" with { type: "json" };
import europe from "./data/europe.json" with { type: "json" };

export { vienna, europe };
export const airports = {
  BCN: { name: "Barcelona · El Prat", coordinates: [2.0785, 41.2974] },
  VIE: { name: "Viena · Schwechat", coordinates: [16.5697, 48.1103] },
};

// Orientation landmarks, not stops or promises of booked visits.
export const landmarks = [
  { name: "Stephansdom", coordinates: [16.3731, 48.2085] },
  { name: "Kunst Haus Wien", coordinates: [16.3932, 48.2111] },
  { name: "Hundertwasserhaus", coordinates: [16.3945, 48.2073] },
];

export function boundsFeature([west, south, east, north]) {
  // Clockwise winding is important for d3's spherical polygon interpretation.
  return {
    type: "MultiPoint",
    coordinates: [
      [west, south],
      [east, north],
    ],
  };
}

export function transformPoint(point, camera) {
  return [
    point[0] * camera.scale + camera.x,
    point[1] * camera.scale + camera.y,
  ];
}

export function fitCamera(from, to, t) {
  // Interpolate complete affine matrices, not scale and a geographic focus
  // independently. Every point then follows a bounded straight screen path.
  const ratio = to.scale() / from.scale();
  const a = from.translate(),
    b = to.translate();
  return {
    scale: 1 + (ratio - 1) * t,
    x: (b[0] - a[0] * ratio) * t,
    y: (b[1] - a[1] * ratio) * t,
  };
}

export function downloadMapData(reference = vienna.reference) {
  const url = URL.createObjectURL(
    new Blob(
      [
        JSON.stringify({
          ...vienna,
          reference,
          historicalStreetReference: vienna.reference,
        }),
      ],
      { type: "application/geo+json" },
    ),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "vienna-streets-ODbL.geojson";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

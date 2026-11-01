export const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
export const mix = (a, b, t) => a + (b - a) * t;
export const range = (p, start, end) => clamp((p - start) / (end - start));
export const smooth = (t) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};
export const fadeWindow = (p, start, end, fade = 0.07) =>
  range(p, start, start + fade) * (1 - range(p, end - fade, end));

export function sceneProgress(top, height, viewport) {
  return clamp(-top / Math.max(1, height - viewport));
}

export function monthIndex(year, month) {
  return (year - 2024) * 12 + month;
}

export function calendarDays(year, month) {
  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return [
    ...Array(offset).fill(null),
    ...Array.from({ length: count }, (_, i) => i + 1),
  ];
}

export function quadraticPoint(a, control, b, t) {
  const u = 1 - clamp(t);
  t = clamp(t);
  return [
    u * u * a[0] + 2 * u * t * control[0] + t * t * b[0],
    u * u * a[1] + 2 * u * t * control[1] + t * t * b[1],
  ];
}

export function quadraticTangent(a, control, b, t) {
  t = clamp(t);
  return [
    2 * ((1 - t) * (control[0] - a[0]) + t * (b[0] - control[0])),
    2 * ((1 - t) * (control[1] - a[1]) + t * (b[1] - control[1])),
  ];
}

export function quadraticLengthTable(a, control, b, steps = 160) {
  const table = [{ t: 0, length: 0 }];
  let previous = a,
    length = 0;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps,
      point = quadraticPoint(a, control, b, t);
    length += Math.hypot(point[0] - previous[0], point[1] - previous[1]);
    table.push({ t, length });
    previous = point;
  }
  return table;
}

export function quadraticParameterAtLength(table, progress) {
  const target = clamp(progress) * table.at(-1).length;
  let lo = 0,
    hi = table.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (table[mid].length < target) lo = mid;
    else hi = mid;
  }
  const span = table[hi].length - table[lo].length;
  return span
    ? mix(table[lo].t, table[hi].t, (target - table[lo].length) / span)
    : 0;
}

export function journeyState(p) {
  p = clamp(p);
  const flightProgress = smooth(range(p, 0.06, 0.52));
  const cityOpacity = smooth(range(p, 0.65, 0.78));
  const phase =
    p < 0.06
      ? "departure"
      : p < 0.52
        ? "flight"
        : p < 0.65
          ? "arrival"
          : p < 0.84
            ? "city"
            : "stay";
  return {
    phase,
    flightProgress,
    destinationRevealed: flightProgress === 1,
    europeOpacity: 1 - cityOpacity,
    cityOpacity,
    europeZoom: smooth(range(p, 0.62, 0.77)),
    cityZoom: smooth(range(p, 0.78, 0.94)),
    planeOpacity: 1 - range(p, 0.61, 0.67),
    stayOpacity: smooth(range(p, 0.82, 0.93)),
    title:
      phase === "departure" || phase === "flight"
        ? "Un poco más lejos."
        : phase === "arrival"
          ? "Viena."
          : phase === "city"
            ? "Y ahora, un poco más cerca."
            : "Nuestro lugar en Viena.",
  };
}

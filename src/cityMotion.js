import { clamp, mix, range, smooth } from "./motion.js";

export const CITY_TRANSITIONS = [
  [0.215, 0.305],
  [0.445, 0.535],
  [0.675, 0.765],
];
const COPY_START = [0.025, 0.28, 0.51, 0.74];
const COPY_FULL = [0.12, 0.34, 0.57, 0.8];
const COPY_OUT = [0.19, 0.42, 0.65, 2];
const COPY_GONE = [0.235, 0.465, 0.695, 3];

// Persistent opaque plates cover one another. Every visible property shares
// this clock: reverse scroll evaluates exactly the same geometry, without timers.
export function cityState(progress) {
  const p = clamp(progress);
  const aperture = smooth(range(p, 0, 0.105));
  const release = smooth(range(p, 0.915, 1));
  const transitions = CITY_TRANSITIONS.map(([a, b]) => smooth(range(p, a, b)));
  const plates = Array.from({ length: 4 }, (_, index) => {
    const incoming = index ? transitions[index - 1] : 1;
    const outgoing = transitions[index] || 0;
    const local = smooth(
      range(
        p,
        index ? CITY_TRANSITIONS[index - 1][0] : 0,
        index < 3 ? CITY_TRANSITIONS[index][1] : 1,
      ),
    );
    const enter = smooth(range(p, COPY_START[index], COPY_FULL[index]));
    const leave = smooth(range(p, COPY_OUT[index], COPY_GONE[index]));
    return {
      x: (1 - incoming) * 100 - outgoing * 12,
      cameraScale: mix(1.075, 1.015, local),
      cameraY: mix(0.7, -0.7, local),
      copyOpacity: enter * (1 - leave),
      copyY: 24 * (1 - enter) - 12 * leave,
      dim: outgoing * 0.12,
      progress: range(
        p,
        index ? CITY_TRANSITIONS[index - 1][1] : 0.105,
        index < 3 ? CITY_TRANSITIONS[index][0] : 0.915,
      ),
    };
  });
  return {
    plates,
    active: transitions.filter((value) => value >= 0.5).length,
    insetX: 14 * (1 - aperture) + 5 * release,
    insetY: 14 * (1 - aperture) + 7 * release,
    radius: 32 * (1 - aperture) + 25 * release,
    mosaic: smooth(range(p, 0.105, 0.18)),
    chromeOpacity:
      smooth(range(p, 0.075, 0.14)) * (1 - smooth(range(p, 0.9, 0.94))),
  };
}

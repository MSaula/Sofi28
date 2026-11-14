import { mix, range, smooth } from "./motion.js";

// One reversible scroll timeline; no element is inserted at a reveal threshold.
export function stayState(progress) {
  const aperture = smooth(range(progress, 0, 0.55));
  const copy = smooth(range(progress, 0.25, 0.58));
  return {
    insetX: mix(14, 0, aperture),
    insetY: mix(16, 0, aperture),
    radius: mix(36, 0, aperture),
    imageScale: mix(1.08, 1, aperture),
    copyOpacity: copy,
    copyY: mix(28, 0, copy),
    shadeOpacity: mix(0.12, 1, copy),
  };
}

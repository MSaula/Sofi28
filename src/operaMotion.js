import { clamp, mix, range, smooth } from "./motion.js";

export const OPERA_PHASES = {
  aperture: [0, 0.16],
  portal: [0.23, 0.36],
  ensemble: [0.44, 0.53],
  jump: [0.62, 0.7],
  handoff: [0.78, 0.94],
};
const eased = (p, a, b) => smooth(range(p, a, b));

export function operaState(
  progress,
  size = { width: 1, height: 1 },
  target = null,
) {
  const p = clamp(progress),
    width = Math.max(1, size.width),
    height = Math.max(1, size.height);
  const opening = eased(p, ...OPERA_PHASES.aperture),
    portal = eased(p, ...OPERA_PHASES.portal);
  const handoff = eased(p, ...OPERA_PHASES.handoff);
  const destination = target || {
    x: width * 0.08,
    y: height * 0.3,
    width: width * 0.42,
    height: width * 0.315,
  };
  const hero = {
    x: mix(0, destination.x, handoff),
    y: mix(0, destination.y, handoff),
    width: mix(width, destination.width, handoff),
    height: mix(height, destination.height, handoff),
  };
  return {
    p,
    opening,
    portal,
    handoff,
    hero,
    tone: eased(p, 0.08, 0.19),
    introOpacity: 1 - eased(p, 0.035, 0.125),
    roomInsetX: 9 * (1 - opening),
    roomInsetY: 32 * (1 - opening),
    roomRadius: 24 * (1 - opening),
    roomScale: mix(1, 1.12, eased(p, 0.13, 0.32)),
    roomOpacity: 1 - eased(p, 0.76, 0.87),
    portalInsetX: 34 * (1 - portal),
    portalInsetTop: 25 * (1 - portal),
    portalInsetBottom: 32 * (1 - portal),
    portalOpacity: eased(p, 0.22, 0.255),
    ensembleOpacity: eased(p, ...OPERA_PHASES.ensemble),
    jumpOpacity: eased(p, ...OPERA_PHASES.jump),
    earlierOpacity: 1 - eased(p, 0.77, 0.84),
    editorialOpacity: eased(p, 0.85, 0.945),
    supportOpacity: eased(p, 0.88, 0.96),
    chromeOpacity: eased(p, 0.16, 0.22) * (1 - eased(p, 0.75, 0.8)),
    interactive: p >= 0.96,
  };
}

export function containedPhotoSize(frame, photo) {
  const scale = Math.min(
    frame.width / photo.width,
    frame.height / photo.height,
    1,
  );
  return { width: photo.width * scale, height: photo.height * scale };
}

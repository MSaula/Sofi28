import data from "./data/opera-selection.json" with { type: "json" };

// Literal paths are also embedded by the standalone exporter.
const sources = {
  room: "/images/opera-auditorium.jpg",
  duet: "/images/opera-duet.jpg",
  ensemble: "/images/opera-ensemble.jpg",
  jump: "/images/opera-jump.jpg",
  rhapsody: "/images/opera-rhapsody.jpg",
};
export const operaPhotos = Object.fromEntries(
  Object.entries(data.photos).map(([key, p]) => [
    key,
    { ...p, src: sources[key] },
  ]),
);
export const operaProgramme = data.pieces;
export const operaProgrammeUrl = data.programmeUrl;

import data from "./data/city-selections.json" with { type: "json" };
import { places } from "./viennaPlaces.js";

// Literal paths are embedded by the existing standalone exporter.
const photos = {
  griechengasse: "/images/city-griechengasse.jpg",
  ballgasse: "/images/city-ballgasse.jpg",
  spittelberggasse: "/images/city-spittelberggasse.jpg",
  gutenberggasse: "/images/city-gutenberggasse.jpg",
  "linke-wienzeile": "/images/city-linke-wienzeile.jpg",
  "ferstel-pasaje": "/images/city-ferstel-pasaje.jpg",
  kohlmarkt: "/images/city-kohlmarkt.jpg",
  balthasar: "/images/city-balthasar.jpg",
  kaffemik: "/images/city-kaffemik.jpg",
  "caffe-couture": "/images/city-caffe-couture.jpg",
  kaffeefabrik: "/images/city-kaffeefabrik.jpg",
  flora: "/images/city-flora.jpg",
  "motto-am-fluss": "/images/city-motto-am-fluss.jpg",
  salonplafond: "/images/city-salonplafond.jpg",
  "das-loft": "/images/city-das-loft.webp",
  "chez-bernard": "/images/city-chez-bernard.jpg",
  tian: "/images/city-tian.jpg",
};

export const cityKinds = {
  landmark: "Lo imprescindible",
  street: "Calles y pasajes",
  coffee: "Un buen café",
  table: "A la mesa",
};

export const cityPlaces = data.places.map((place) => ({
  ...place,
  image: place.imageKey.startsWith("map:")
    ? places.find((p) => p.id === place.mapPlaceId).image
    : photos[place.imageKey],
}));
export const cityById = Object.fromEntries(cityPlaces.map((p) => [p.id, p]));

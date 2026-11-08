import fs from "node:fs";
import { feature } from "topojson-client";
import {
  presimplify,
  quantile,
  simplify,
  sphericalTriangleArea,
} from "topojson-simplify";

const atlas = JSON.parse(
  fs.readFileSync(
    new URL("../node_modules/world-atlas/countries-50m.json", import.meta.url),
    "utf8",
  ),
);
const weighted = presimplify(atlas, sphericalTriangleArea);
const topology = simplify(weighted, quantile(weighted, 0.75));
const ids = new Set([
  "008",
  "012",
  "020",
  "040",
  "056",
  "070",
  "100",
  "191",
  "196",
  "203",
  "208",
  "233",
  "246",
  "250",
  "276",
  "300",
  "348",
  "352",
  "372",
  "380",
  "428",
  "440",
  "442",
  "470",
  "504",
  "498",
  "499",
  "528",
  "578",
  "616",
  "620",
  "642",
  "688",
  "703",
  "705",
  "724",
  "752",
  "756",
  "788",
  "792",
  "804",
  "807",
  "826",
]);
const round = (value) =>
  Array.isArray(value) ? value.map(round) : Math.round(value * 10000) / 10000;
const features = feature(topology, topology.objects.countries)
  .features.filter((f) => ids.has(String(f.id).padStart(3, "0")))
  .map((f) => {
    const polygons =
      f.geometry.type === "MultiPolygon"
        ? f.geometry.coordinates
        : [f.geometry.coordinates];
    return {
      ...f,
      geometry: {
        type: "MultiPolygon",
        coordinates: round(
          polygons.filter((poly) =>
            poly[0].some(([x, y]) => x > -30 && x < 45 && y > 27 && y < 72),
          ),
        ),
      },
    };
  });
const result = {
  type: "FeatureCollection",
  source: {
    name: "Natural Earth 1:50m",
    license: "Public domain",
    url: "https://www.naturalearthdata.com/",
    processing:
      "Topological simplification, 75th percentile spherical triangle area; rounded to 4 decimal places.",
  },
  features,
};
const out = new URL("../src/data/europe.json", import.meta.url);
fs.writeFileSync(out, JSON.stringify(result));
console.log(
  "European geography:",
  features.length,
  "features;",
  fs.statSync(out).size,
  "bytes",
);

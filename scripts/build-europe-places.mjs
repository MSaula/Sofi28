import fs from "node:fs";
import { createHash } from "node:crypto";
import { geoCentroid, geoContains } from "d3-geo";

const [naturalFile, geonamesFile] = process.argv.slice(2);
if (!naturalFile || !geonamesFile)
  throw new Error(
    "Pass pinned Natural Earth GeoJSON and selected GeoNames JSON.",
  );
const bytes = fs.readFileSync(naturalFile);
if (
  createHash("sha256").update(bytes).digest("hex") !==
  "fd3fa867a320cbd5c5b6bb5bc550afeec2939fb2cef688e508007282a55ac42f"
)
  throw new Error("Unexpected Natural Earth source.");
const source = JSON.parse(bytes),
  geonames = JSON.parse(fs.readFileSync(geonamesFile));
const land = JSON.parse(
  fs.readFileSync(new URL("../src/data/europe.json", import.meta.url)),
);
const cities = [];
function city(id, name, sourceName, country, extra = {}) {
  const matches = source.features.filter(
    (f) => f.properties.name === sourceName && f.properties.iso_a2 === country,
  );
  if (matches.length !== 1)
    throw new Error(`Ambiguous city ${sourceName}/${country}`);
  const f = matches[0];
  cities.push({
    id,
    name,
    coordinates: f.geometry.coordinates,
    country,
    kind: "city",
    capital: Boolean(f.properties.adm0cap),
    source: "natural-earth",
    sourceId: f.properties.ne_id,
    sourceName,
    ...extra,
  });
}
city("nice", "Niza", "Nice", "FR", { visited: true });
city("london", "Londres", "London", "GB", { visited: true });
city("rome", "Roma", "Rome", "IT", { visited: true });
city("florence", "Florencia", "Florence", "IT", { visited: true });
city("lisbon", "Lisboa", "Lisbon", "PT", { visited: true });
const cortina = geonames.find(
  (c) => c.name === "Cortina d'Ampezzo" && c.countrycode === "IT",
);
if (!cortina) throw new Error("Missing Cortina record");
cities.push({
  id: "cortina",
  name: "Cortina d’Ampezzo",
  coordinates: [cortina.longitude, cortina.latitude],
  country: "IT",
  kind: "city",
  visited: true,
  source: "geonames",
  sourceId: cortina.geonameid,
  sourceName: cortina.name,
});
function region(id, name, countryId, seed, kind) {
  const f = land.features.find((f) => f.id === countryId);
  const polygon = f.geometry.coordinates.find((coordinates) =>
    geoContains({ type: "Polygon", coordinates }, seed),
  );
  if (!polygon) throw new Error(`Missing land for ${name}`);
  const coordinates = geoCentroid({
    type: "Polygon",
    coordinates: polygon,
  }).map((n) => +n.toFixed(6));
  cities.push({
    id,
    name,
    coordinates,
    kind,
    visited: true,
    source: "natural-earth-centroid",
    sourceId: countryId,
    precision: "regional-reference-not-city",
  });
}
region("mallorca", "Mallorca", "724", [2.97, 39.64], "island");
region("paros", "Paros", "300", [25.15, 37.08], "island");
region("montenegro", "Montenegro", "499", [19.2, 42.7], "country");
const basque = geonames.filter((c) => c.countrycode === "ES");
if (basque.length !== 3)
  throw new Error("Expected three Basque provincial-capital references");
cities.push({
  id: "basque",
  name: "País Vasco",
  coordinates: [
    basque.reduce((s, c) => s + c.longitude, 0) / 3,
    basque.reduce((s, c) => s + c.latitude, 0) / 3,
  ].map((n) => +n.toFixed(6)),
  kind: "region",
  visited: true,
  source: "geonames-regional-reference",
  sourceIds: basque.map((c) => c.geonameid),
  precision: "regional-reference-not-claimed-city-visit",
});
for (const args of [
  ["edinburgh", "Edimburgo", "Edinburgh", "GB", { frameReference: true }],
  ["copenhagen", "Copenhague", "København", "DK", { frameReference: true }],
  ["madrid", "Madrid", "Madrid", "ES"],
  ["paris", "París", "Paris", "FR"],
  ["berlin", "Berlín", "Berlin", "DE"],
  ["dublin", "Dublín", "Dublin", "IE"],
  ["amsterdam", "Ámsterdam", "Amsterdam", "NL"],
  ["brussels", "Bruselas", "Brussels", "BE"],
  ["prague", "Praga", "Prague", "CZ"],
  ["budapest", "Budapest", "Budapest", "HU"],
  ["bern", "Berna", "Bern", "CH"],
  ["warsaw", "Varsovia", "Warsaw", "PL"],
  ["stockholm", "Estocolmo", "Stockholm", "SE"],
  ["athens", "Atenas", "Athens", "GR"],
  ["zagreb", "Zagreb", "Zagreb", "HR"],
  ["ljubljana", "Liubliana", "Ljubljana", "SI"],
  ["reykjavik", "Reikiavik", "Reykjavík", "IS"],
])
  city(...args);
const output = {
  source: {
    naturalEarth: {
      name: "Natural Earth 1:10m populated places",
      license: "Public domain",
      url: "https://github.com/nvkelso/natural-earth-vector/blob/ca96624a56bd078437bca8184e78163e5039ad19/geojson/ne_10m_populated_places_simple.geojson",
      revision: "ca96624a56bd078437bca8184e78163e5039ad19",
      sha256: createHash("sha256").update(bytes).digest("hex"),
    },
    geonames: {
      name: "GeoNames",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      url: "https://www.geonames.org/",
      distribution: "geonamescache 3.0.2",
      distributionSha256:
        "b830e8942f2d58c7e68782dcf4dff2ffe8c4104a35ee881ed1ad4023cefcdba4",
    },
  },
  places: cities,
};
fs.writeFileSync(
  new URL("../src/data/europe-places.json", import.meta.url),
  JSON.stringify(output, null, 2) + "\n",
);
console.log(`Saved ${cities.length} places with pinned provenance.`);

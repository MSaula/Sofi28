import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { places, placesData } from "../src/viennaPlaces.js";
import context from "../src/data/vienna-context.json" with { type: "json" };
import { trip } from "../src/content.js";
import {
  buildViennaModel,
  featuredPlaceIds,
  fitWalkingRoute,
  nearestMapPlace,
  placeMapLabels,
  projectedGeometryPath,
  screenPoint,
  walkingLabels,
  zoomView,
} from "../src/viennaMap.js";

const meters = (a, b) => {
  const k = Math.PI / 180,
    x = (b[1] - a[1]) * k,
    y = (b[0] - a[0]) * k;
  return (
    6371008.8 *
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin(x / 2) ** 2 +
          Math.cos(a[1] * k) * Math.cos(b[1] * k) * Math.sin(y / 2) ** 2,
      ),
    )
  );
};

test("the city catalogue retains 32 real photos, independent credits, and exactly five primary places", () => {
  assert.equal(places.length, 32);
  assert.deepEqual(
    places
      .filter((p) => p.featured)
      .map((p) => p.id)
      .sort(),
    [...featuredPlaceIds].sort(),
  );
  for (const p of places) {
    assert.equal(
      createHash("sha256")
        .update(readFileSync("public" + p.image))
        .digest("hex"),
      p.photo.sha256,
      p.id,
    );
    assert.ok(
      p.photo.artist &&
        p.photo.license &&
        p.photo.licenseUrl &&
        p.photo.commonsPage,
    );
    assert.ok(
      p.coordinateSource.osmId &&
        /^https:\/\/www.openstreetmap.org\/(way|node|relation)\//.test(
          p.coordinateSource.sourceUrl,
        ),
    );
    assert.ok(
      p.coordinates[0] > 16.35 &&
        p.coordinates[0] < 16.4 &&
        p.coordinates[1] > 48.188 &&
        p.coordinates[1] < 48.215,
    );
  }
  assert.ok(places.find((p) => p.id === "cafe-central").statusNote);
});

test("critical map references identify the actual photographed objects, not nearby substitutes", () => {
  const byId = (id) => places.find((p) => p.id === id);
  // Reviewed OSM object IDs distinguish Upper Belvedere from the whole complex,
  // KunstHausWien from a different gallery, and the Secession from its subway entrance.
  for (const [id, osmId] of [
    ["belvedere", 5887599],
    ["kunsthaus", 342113776],
    ["secession", 25371168],
    ["staatsoper", 8097595],
    ["stadtpark", 262932599],
  ])
    assert.equal(byId(id).coordinateSource.osmId, osmId, id);
  assert.ok(byId("belvedere").coordinates[1] < 48.192);
  assert.ok(byId("kunsthaus").coordinates[0] > 16.39);
  assert.deepEqual(placesData.origin.coordinates, trip.airbnb.coordinates);
  assert.match(placesData.origin.precision, /approximate/);
});

test("every walking route matches the real network geometry, endpoints and pedestrian timing", () => {
  assert.match(
    placesData.source.routingEndpoint,
    /routed-foot\/route\/v1\/foot/,
  );
  for (const p of places) {
    const route = p.walk,
      coords = route.geometry.coordinates;
    assert.equal(route.geometry.type, "LineString");
    assert.ok(coords.length >= 3);
    assert.ok(meters(coords[0], trip.airbnb.coordinates) < 20, p.id);
    assert.ok(meters(coords.at(-1), p.coordinates) < 90, p.id);
    const length = coords
      .slice(1)
      .reduce((n, point, i) => n + meters(coords[i], point), 0);
    assert.ok(Math.abs(length - route.meters) / route.meters < 0.025, p.id);
    assert.ok(
      route.meters + route.originGapMeters + route.destinationGapMeters >=
        meters(trip.airbnb.coordinates, p.coordinates) * 0.98,
      p.id,
    );
    assert.ok(
      route.meters / (route.seconds / 3600) / 1000 > 3 &&
        route.meters / (route.seconds / 3600) / 1000 < 5.5,
      p.id,
    );
    const labels = walkingLabels(route);
    assert.ok(labels.minutes >= 1);
    assert.match(labels.distance, / m$/);
    assert.ok(Math.abs(labels.meters - route.meters) <= 25, p.id);
  }
});

test("official context has true feature IDs, source requests and the WFS advertised licence", () => {
  assert.equal(context.source.license, "CC BY 3.0 AT");
  assert.equal(context.source.layers.length, 3);
  assert.ok(context.features.length > 3000);
  assert.deepEqual(
    [...new Set(context.features.map((f) => f.properties.layer))].sort(),
    ["blocks", "green", "water"],
  );
  assert.ok(
    context.features.every(
      (f) => f.id && ["Polygon", "MultiPolygon"].includes(f.geometry.type),
    ),
  );
  assert.ok(
    context.source.layers.every(
      (s) =>
        s.sha256.length === 64 &&
        s.requestUrl.startsWith("https://data.wien.gv.at/"),
    ),
  );
});

test("all places and the apartment fit the opening view at desktop and mobile dimensions", () => {
  for (const [w, h] of [
    [1050, 800],
    [730, 530],
    [360, 380],
    [288, 315],
  ]) {
    const model = buildViennaModel(
      w,
      h,
      places.map((p) => p.coordinates),
      trip.airbnb.coordinates,
    );
    for (const coordinate of [
      ...places.map((p) => p.coordinates),
      trip.airbnb.coordinates,
    ]) {
      const point = model.projection(coordinate);
      assert.ok(point[0] >= 25 && point[0] <= w - 25);
      assert.ok(point[1] >= 25 && point[1] <= h - 25);
    }
  }
});

test("route fitting keeps home, destination and path in frame; camera operations preserve geography", () => {
  const model = buildViennaModel(
    1050,
    800,
    places.map((p) => p.coordinates),
    trip.airbnb.coordinates,
  );
  for (const p of places) {
    const coordinates = [
      trip.airbnb.coordinates,
      ...p.walk.geometry.coordinates,
      p.coordinates,
    ];
    const view = fitWalkingRoute(model, coordinates);
    assert.ok(view.k >= 1 && view.k <= 3.6);
    for (const coordinate of coordinates) {
      const point = screenPoint(model.projection(coordinate), view);
      assert.ok(point[0] >= 70 && point[0] <= 980, p.id);
      assert.ok(point[1] >= 70 && point[1] <= 730, p.id);
    }
    assert.equal(
      nearestMapPlace(
        [p],
        model.projection,
        view,
        screenPoint(model.projection(p.coordinates), view),
      ).id,
      p.id,
    );
    assert.equal(
      nearestMapPlace([p], model.projection, view, [-999, -999]),
      null,
    );
  }
  const before = { k: 1, x: 0, y: 0 };
  const after = zoomView(before, 1.25, 1050, 800);
  assert.deepEqual(screenPoint([525, 400], after), [525, 400]);
});

test("map labels never move their pins or overlap each other; home is allocated first", () => {
  const model = buildViennaModel(
    1050,
    800,
    places.map((p) => p.coordinates),
    trip.airbnb.coordinates,
  );
  const labels = placeMapLabels(
    [
      {
        id: "home",
        name: "Nuestro ático",
        home: true,
        point: model.projection(trip.airbnb.coordinates),
      },
      ...places
        .filter((p) => p.featured)
        .map((p) => ({
          id: p.id,
          name: p.shortName,
          point: model.projection(p.coordinates),
        })),
    ],
    1050,
    800,
  );
  assert.ok(labels.every((p) => p.rect));
  for (let i = 0; i < labels.length; i++)
    for (let j = i + 1; j < labels.length; j++) {
      const a = labels[i].rect,
        b = labels[j].rect;
      assert.ok(
        a.x + a.width <= b.x ||
          b.x + b.width <= a.x ||
          a.y + a.height <= b.y ||
          b.y + b.height <= a.y,
      );
    }
  for (const label of labels) {
    const source =
      label.id === "home"
        ? trip.airbnb.coordinates
        : places.find((p) => p.id === label.id).coordinates;
    assert.deepEqual(label.point, model.projection(source));
  }
});

test("cartographic paths preserve holes and route geometry without NaN or fabricated polygons", () => {
  const projection = (p) => p;
  assert.equal(
    projectedGeometryPath(
      {
        type: "LineString",
        coordinates: [
          [1, 2],
          [3, 4],
        ],
      },
      projection,
    ),
    "M1.00,2.00L3.00,4.00",
  );
  const polygon = {
    type: "Polygon",
    coordinates: [
      [
        [0, 0],
        [5, 0],
        [5, 5],
        [0, 0],
      ],
      [
        [1, 1],
        [2, 1],
        [1, 2],
        [1, 1],
      ],
    ],
  };
  assert.equal(
    projectedGeometryPath(polygon, projection).split("Z").length - 1,
    2,
  );
  const model = buildViennaModel(
    1000,
    700,
    places.map((p) => p.coordinates),
    trip.airbnb.coordinates,
  );
  for (const p of places)
    assert.ok(
      !projectedGeometryPath(p.walk.geometry, model.projection).includes("NaN"),
    );
});

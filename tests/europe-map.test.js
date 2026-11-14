import test from "node:test";
import assert from "node:assert/strict";
import { geoContains } from "d3-geo";
import {
  buildEuropeModel,
  europePlaces,
  europeFrameBounds,
  europeCamera,
  flightAt,
} from "../src/europeMap.js";
import { airports, europe, transformPoint } from "../src/geography.js";
import { birthdayLayout, timelineFrame } from "../src/timeline.js";

const visited = [
  "nice",
  "london",
  "rome",
  "florence",
  "lisbon",
  "cortina",
  "mallorca",
  "paros",
  "montenegro",
  "basque",
];
const sizes = [
  [1216, 645],
  [329, 499],
  [259, 355],
  [839, 295],
  [798, 370],
];
const overlap = (a, b) =>
  a.x < b.x + b.width &&
  a.x + a.width > b.x &&
  a.y < b.y + b.height &&
  a.y + a.height > b.y;

test("visited places have country-specific, sourced coordinates; islands and regions remain distinct", () => {
  const byId = Object.fromEntries(europePlaces.places.map((p) => [p.id, p]));
  assert.deepEqual(
    europePlaces.places
      .filter((p) => p.visited)
      .map((p) => p.id)
      .sort(),
    [...visited].sort(),
  );
  // Independent city bounds catch swapped axes and homonyms in other countries.
  for (const [id, country, box] of [
    ["nice", "FR", [7.2, 43.6, 7.35, 43.8]],
    ["london", "GB", [-0.3, 51.4, 0.1, 51.6]],
    ["rome", "IT", [12.4, 41.8, 12.6, 42]],
    ["florence", "IT", [11.1, 43.7, 11.4, 43.9]],
    ["lisbon", "PT", [-9.3, 38.6, -9, 38.8]],
    ["cortina", "IT", [12.1, 46.5, 12.2, 46.6]],
    ["edinburgh", "GB", [-3.3, 55.9, -3.1, 56]],
    ["copenhagen", "DK", [12.4, 55.6, 12.7, 55.8]],
  ]) {
    const p = byId[id],
      [lon, lat] = p.coordinates;
    assert.equal(p.country, country);
    assert.ok(p.sourceId);
    assert.ok(lon > box[0] && lon < box[2] && lat > box[1] && lat < box[3], id);
  }
  assert.equal(byId.cortina.sourceId, 3177952);
  assert.deepEqual(byId.cortina.coordinates, [12.13903, 46.5369]);
  assert.equal(byId.paros.kind, "island");
  assert.equal(byId.mallorca.kind, "island");
  assert.equal(byId.basque.kind, "region");
  assert.equal(byId.montenegro.kind, "country");
  for (const [id, countryId, box] of [
    ["paros", "300", [25.1, 36.9, 25.3, 37.2]],
    ["mallorca", "724", [2.8, 39.5, 3.1, 39.8]],
    ["montenegro", "499", [18.4, 41.8, 20.5, 43.6]],
    ["basque", "724", [-3.4, 42.5, -1.6, 43.6]],
  ]) {
    const p = byId[id],
      [lon, lat] = p.coordinates;
    assert.ok(
      geoContains(
        europe.features.find((f) => f.id === countryId),
        p.coordinates,
      ),
      id,
    );
    assert.ok(lon > box[0] && lon < box[2] && lat > box[1] && lat < box[3], id);
    assert.match(p.precision, /reference/);
  }
  assert.equal(byId.athens.visited, undefined);
  assert.ok(
    !europePlaces.places.some((p) => /vienna|viena/i.test(p.name)),
    "no background destination label",
  );
  assert.ok(
    europe.features.some((f) => f.id === "643"),
    "Russia fills the northeastern context",
  );
  assert.ok(
    europe.features.some((f) => f.id === "112"),
    "Belarus fills the eastern context",
  );
});

test("Europe frame includes Iberia, Edinburgh, Copenhagen and Paros without expanding for Iceland or Lanzarote", () => {
  assert.deepEqual(europeFrameBounds, [-11, 35, 27, 57.5]);
  for (const [w, h] of sizes) {
    const m = buildEuropeModel(w, h);
    for (const point of [
      [-9.5, 36],
      [3.3, 43.8],
      [-3.2, 55.95],
      [12.56, 55.68],
      [25.2, 37.07],
      ...Object.values(airports).map((p) => p.coordinates),
    ]) {
      const p = m.projection(point);
      assert.ok(
        p[0] > 0 && p[0] < w && p[1] > 0 && p[1] < h,
        `${w}×${h}: ${point}`,
      );
    }
    for (const id of [...visited, "edinburgh", "copenhagen"])
      assert.ok(m.labels.find((p) => p.id === id)?.rect, `${w}×${h}: ${id}`);
    assert.ok(!m.labels.some((p) => p.id === "reykjavik"));
    for (const p of m.labels) {
      assert.deepEqual(
        p.point,
        m.projection(p.coordinates),
        "markers are never moved to fit labels",
      );
      for (const other of m.labels)
        if (p !== other)
          assert.ok(!overlap(p.rect, other.rect), `${p.name}/${other.name}`);
      const distance = Math.hypot(
        Math.max(
          p.rect.x - p.point[0],
          0,
          p.point[0] - p.rect.x - p.rect.width,
        ),
        Math.max(
          p.rect.y - p.point[1],
          0,
          p.point[1] - p.rect.y - p.rect.height,
        ),
      );
      if (p.visited)
        assert.ok(
          distance < 42,
          `${w}×${h}: ${p.name} leader too far (${distance})`,
        );
    }
  }
});

test("aircraft, trace and zoom use one geographic path, remain bounded and reverse exactly", () => {
  for (const [w, h] of sizes) {
    const m = buildEuropeModel(w, h);
    assert.deepEqual(
      flightAt(m, 0).point,
      m.projection(airports.BCN.coordinates),
    );
    assert.ok(
      Math.hypot(
        ...flightAt(m, 1).point.map(
          (n, i) => n - m.projection(airports.VIE.coordinates)[i],
        ),
      ) < 1e-9,
    );
    let previous = flightAt(m, 0).point;
    for (let i = 0; i <= 1000; i++) {
      const p = i / 1000,
        f = flightAt(m, p),
        reverse = flightAt(m, 1 - (1000 - i) / 1000);
      assert.ok(
        Math.hypot(f.point[0] - previous[0], f.point[1] - previous[1]) < 2,
      );
      assert.ok(
        Math.hypot(
          f.point[0] - reverse.point[0],
          f.point[1] - reverse.point[1],
        ) < 1e-9,
      );
      assert.ok(Number.isFinite(f.angle));
      previous = f.point;
    }
    for (let i = 0; i <= 100; i++) {
      const camera = europeCamera(m, i / 100),
        p = transformPoint(flightAt(m, 1).point, camera);
      assert.ok(p[0] > 0 && p[0] < w && p[1] > 0 && p[1] < h);
    }
    const center = transformPoint(m.b, europeCamera(m, 1));
    assert.ok(
      Math.abs(center[0] - w / 2) < 1e-9 && Math.abs(center[1] - h / 2) < 1e-9,
    );
    assert.equal(flightAt(m, 1).angle, flightAt(m, 1.2).angle);
  }
});

test("the final birthday card reserves typography space instead of a photograph throughout the calendar zoom", () => {
  for (const [w, h] of [
    [1218, 680],
    [331, 560],
    [261, 416],
    [841, 332],
  ]) {
    for (let i = 0; i <= 100; i++) {
      const f = timelineFrame(i / 100, w, h),
        c = birthdayLayout(w, h, f.scale, true);
      assert.equal(c.photoWidth, 0);
      assert.equal(c.photoHeight, 0);
      assert.ok(c.width <= w - 16);
      assert.ok(c.textWidth > 140);
      assert.ok(c.height >= 88);
      assert.ok(f.ty - 16 - f.cardHeight >= -1e-9);
    }
  }
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { cityState, CITY_TRANSITIONS } from "../src/cityMotion.js";
import { cityPlaces } from "../src/cityContent.js";
import { places } from "../src/viennaPlaces.js";

test("the city curation links the two studies with authentic files and only existing map references", () => {
  assert.equal(cityPlaces.length, 29);
  assert.equal(new Set(cityPlaces.map((p) => p.id)).size, 29);
  assert.deepEqual(
    Object.fromEntries(
      ["landmark", "street", "coffee", "table"].map((kind) => [
        kind,
        cityPlaces.filter((p) => p.kind === kind).length,
      ]),
    ),
    { landmark: 12, street: 7, coffee: 4, table: 6 },
  );
  for (const p of cityPlaces) {
    const file = readFileSync(new URL("../public" + p.image, import.meta.url));
    assert.equal(
      createHash("sha256").update(file).digest("hex"),
      p.photo.sha256,
      p.id,
    );
    assert.ok(
      p.name && p.description && p.photo.alt && p.photo.sourcePage,
      p.id,
    );
    if (p.mapPlaceId)
      assert.ok(
        places.some((place) => place.id === p.mapPlaceId),
        p.id,
      );
  }
  assert.equal(
    cityPlaces.find((p) => p.id === "kohlmarkt").mapPlaceId,
    "kohlmarkt",
  );
  assert.equal(cityPlaces.find((p) => p.id === "flora").mapPlaceId, null);
});

test("opaque city plates cover the full film at every transition, with restrained camera overscan", () => {
  for (let i = 0; i <= 2000; i++) {
    const state = cityState(i / 2000),
      intervals = state.plates
        .map((p) => [Math.max(0, p.x), Math.min(100, p.x + 100)])
        .filter(([a, b]) => b > a)
        .sort(([a], [b]) => a - b);
    let end = 0;
    for (const [a, b] of intervals) {
      assert.ok(a <= end + 1e-9, "uncovered film at " + i / 2000);
      end = Math.max(end, b);
    }
    assert.ok(end >= 100 - 1e-9);
    for (const plate of state.plates) {
      assert.ok(plate.copyOpacity >= 0 && plate.copyOpacity <= 1);
      assert.ok(
        Math.abs(plate.cameraY) <= (plate.cameraScale - 1) * 50 + 1e-9,
        "camera exposes an image edge",
      );
      assert.ok(plate.progress >= 0 && plate.progress <= 1);
    }
  }
});

test("city transforms and copy stay continuous and exactly reversible, including all edit boundaries", () => {
  const values = (s) =>
    s.plates.flatMap((p) => [
      p.x,
      p.cameraScale,
      p.cameraY,
      p.copyOpacity,
      p.copyY,
    ]);
  let previous = cityState(0);
  for (let i = 1; i <= 1000; i++) {
    const current = cityState(i / 1000);
    current.plates.forEach((plate, index) => {
      assert.ok(
        Math.abs(plate.x - previous.plates[index].x) < 1.8,
        "position jump",
      );
      assert.ok(
        Math.abs(plate.copyOpacity - previous.plates[index].copyOpacity) < 0.04,
        "copy jump",
      );
    });
    previous = current;
  }
  for (const p of [0, 0.105, 0.18, ...CITY_TRANSITIONS.flat(), 0.915, 1]) {
    const before = values(cityState(p - 1e-8)),
      after = values(cityState(p + 1e-8));
    before.forEach((v, i) =>
      assert.ok(
        Math.abs(v - after[i]) < 0.0001,
        "boundary discontinuity at " + p,
      ),
    );
  }
  const forward = Array.from({ length: 251 }, (_, i) =>
    values(cityState(i / 250)),
  );
  const backward = Array.from({ length: 251 }, (_, i) =>
    values(cityState((250 - i) / 250)),
  ).reverse();
  assert.deepEqual(forward, backward);
  assert.equal(cityState(1).active, 3);
  assert.equal(cityState(1).plates[3].copyOpacity, 1);
});

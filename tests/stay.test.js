import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { stayState } from "../src/stayMotion.js";
import { trip } from "../src/content.js";
import listing from "../src/data/airbnb-listing.json" with { type: "json" };

test("apartment photos are five original listing assets with factual captions", () => {
  assert.equal(trip.airbnb.photos.length, 5);
  assert.equal(trip.airbnb.benefits.length, 4);
  assert.equal(new Set(trip.airbnb.photos.map((p) => p.src)).size, 5);
  for (const photo of trip.airbnb.photos) {
    const source = listing.photos.find(
      (p) => photo.src === "/images/" + p.filename,
    );
    assert.ok(source, photo.src);
    assert.equal(
      createHash("sha256")
        .update(readFileSync("public" + photo.src))
        .digest("hex"),
      source.sha256,
    );
    assert.ok(photo.title && photo.description && photo.alt);
    assert.ok(
      !/balcón privado|terraza privada|desayuno incluido|m²|king size/i.test(
        photo.description,
      ),
    );
  }
});

test("Airbnb's public point replaces the street midpoint without inventing precision", () => {
  assert.deepEqual(trip.airbnb.coordinates, [16.39508, 48.20926]);
  assert.equal(listing.location.isExactLocation, false);
  assert.equal(listing.location.exactAddress, null);
  assert.equal(trip.airbnb.locationPrecision, "approximate-listing");
  assert.equal(trip.airbnb.uncertaintyMeters, null);
  assert.equal(trip.airbnb.address, null);
});

test("apartment aperture, camera and caption are continuous, bounded and reversible", () => {
  let previous = stayState(0);
  assert.equal(previous.copyOpacity, 0);
  for (let i = 1; i <= 10000; i++) {
    const current = stayState(i / 10000);
    assert.ok(current.insetX <= previous.insetX && current.insetX >= 0);
    assert.ok(current.insetY <= previous.insetY && current.insetY >= 0);
    assert.ok(
      current.imageScale <= previous.imageScale && current.imageScale >= 1,
    );
    assert.ok(
      current.copyOpacity >= previous.copyOpacity && current.copyOpacity <= 1,
    );
    for (const key of Object.keys(current))
      assert.ok(Math.abs(current[key] - previous[key]) < 0.04, key);
    previous = current;
  }
  assert.equal(stayState(1).insetX, 0);
  assert.equal(stayState(1).copyOpacity, 1);
  assert.deepEqual(stayState(1), stayState(2));
  assert.deepEqual(stayState(0), stayState(-1));
});

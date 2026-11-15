import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { operaState, containedPhotoSize } from "../src/operaMotion.js";
import { operaPhotos, operaProgramme } from "../src/operaContent.js";
import seats from "../src/data/opera-seating.json" with { type: "json" };

test("the five Opera photographs preserve the original report bytes and evidence", () => {
  assert.equal(Object.keys(operaPhotos).length, 5);
  for (const p of Object.values(operaPhotos)) {
    const data = readFileSync(new URL("../public" + p.src, import.meta.url));
    assert.equal(data.length, p.bytes);
    assert.equal(createHash("sha256").update(data).digest("hex"), p.sha256);
    assert.ok(p.sourcePage.startsWith("https://"));
  }
  assert.equal(operaPhotos.room.evidence, "same-box-source-confirmed");
  assert.match(operaPhotos.room.description, /no están documentados/);
  assert.deepEqual(
    operaProgramme.map((p) => p.choreographer),
    ["George Balanchine", "Christopher Wheeldon", "Frederick Ashton"],
  );
});
test("the complete sales plan preserves 1753 positions and the booked seats without an occluding label", () => {
  assert.equal(seats.sourceVersion, 356552144);
  assert.equal(seats.seats.length, 1753);
  assert.equal(new Set(seats.seats.map((p) => p[0])).size, 1753);
  assert.equal(seats.blocks.length, 111);
  assert.equal(seats.seats.filter((p) => p[3] === 489).length, 36);
  assert.deepEqual(
    seats.seats
      .filter((p) => [500, 501].includes(p[0]))
      .map((p) => p.slice(0, 4)),
    [
      [500, 4211, 5595, 489],
      [501, 4115, 5595, 489],
    ],
  );
  const a = seats.annotationBounds;
  assert.equal(
    seats.seats.filter(
      ([, x, y]) =>
        x + 24 >= a.x &&
        x - 24 <= a.x + a.width &&
        y + 24 >= a.y &&
        y - 24 <= a.y + a.height,
    ).length,
    0,
  );
  assert.match(seats.orientation, /Escenario arriba/);
});
test("cinematic phases remain continuous and reversible and keep the programme until after the images", () => {
  for (let i = 0; i <= 1000; i++) {
    const p = i / 1000,
      a = operaState(p),
      b = operaState(p + 0.000001);
    for (const k of [
      "opening",
      "portal",
      "portalOpacity",
      "ensembleOpacity",
      "jumpOpacity",
      "handoff",
      "editorialOpacity",
      "roomScale",
    ])
      assert.ok(Math.abs(a[k] - b[k]) < 0.001, k);
    assert.deepEqual(operaState(p), a);
    if (p <= 0.22) assert.equal(a.portalOpacity, 0);
    if (p <= 0.85) assert.equal(a.editorialOpacity, 0);
  }
  assert.equal(operaState(0.96).interactive, true);
  assert.equal(operaState(0.32).roomScale, 1.12);
});
test("the final photograph lands on a measured responsive target and never needs pixel enlargement", () => {
  for (const size of [
    { width: 1440, height: 932 },
    { width: 390, height: 784 },
    { width: 1920, height: 1012 },
  ]) {
    const target = {
      x: 30,
      y: 80,
      width: size.width * 0.4,
      height: size.width * 0.3,
    };
    assert.deepEqual(operaState(0.94, size, target).hero, target);
    for (const p of [0, 0.7, 0.79, 0.85, 0.94, 1]) {
      const f = operaState(p, size, target).hero,
        image = containedPhotoSize(f, operaPhotos.jump);
      assert.ok(f.width > 0 && f.height > 0);
      assert.ok(image.width <= 2500 && image.height <= 1875);
      assert.ok(
        image.width <= f.width + 0.01 && image.height <= f.height + 0.01,
      );
    }
  }
});

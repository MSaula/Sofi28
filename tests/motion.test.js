import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import ICAL from "ical.js";
import { geoMercator } from "d3-geo";
import {
  calendarDays,
  monthIndex,
  quadraticPoint,
  quadraticTangent,
  quadraticLengthTable,
  quadraticParameterAtLength,
  journeyState,
  sceneProgress,
} from "../src/motion.js";
import { memories, trip, timelineEvents } from "../src/content.js";
import {
  fitTimelineLabels,
  months,
  targetIndex,
  timelineFrame,
  monthX,
  timelineItems,
  birthdayLayout,
} from "../src/timeline.js";
import { buildCalendar } from "../src/calendar.js";
import {
  airports,
  boundsFeature,
  europe,
  fitCamera,
  transformPoint,
  vienna,
} from "../src/geography.js";

test("January 2027 correctly places 22–24 in Friday, Saturday and Sunday", () => {
  const days = calendarDays(2027, 0);
  assert.deepEqual(days.slice(0, 7), [null, null, null, null, 1, 2, 3]);
  for (const [day, column] of [
    [22, 4],
    [23, 5],
    [24, 6],
  ])
    assert.equal(days.indexOf(day) % 7, column);
  assert.equal(days.filter(Boolean).length, 31);
});

test("all fifteen memories preserve the supplied months without invented days", () => {
  assert.equal(memories.length, 15);
  const indices = memories.map((m) => monthIndex(m.year, m.month));
  assert.deepEqual(
    indices,
    [...indices].sort((a, b) => a - b),
  );
  assert.deepEqual(
    memories.map((m) => m.name),
    [
      "Niza",
      "Mallorca",
      "Londres",
      "Montenegro",
      "Roma",
      "Islandia",
      "Grecia",
      "País Vasco",
      "Dolomitas",
      "Indonesia",
      "Lanzarote",
      "Florencia",
      "Egipto",
      "México",
      "Lisboa",
    ],
  );
  assert.ok(memories.every((m) => !("day" in m)));
  assert.deepEqual(
    memories.slice(0, 6).map((m) => [m.year, m.month]),
    [
      [2022, 2],
      [2022, 7],
      [2023, 0],
      [2023, 7],
      [2023, 9],
      [2023, 11],
    ],
  );
});

test("birthday editions 23–28 have six configurable photos and use the upper lane", () => {
  assert.deepEqual(
    timelineEvents
      .filter((m) => m.birthdayAge)
      .map((m) => [m.name, m.birthdayAge]),
    [
      ["Niza", 23],
      ["Londres", 24],
      ["Islandia", 25],
      ["Dolomitas", 26],
      ["Florencia", 27],
      ["Lo próximo", 28],
    ],
  );
  assert.equal(timelineItems.filter((m) => m.lane === "trip").length, 10);
  assert.ok(
    timelineItems.filter((m) => m.birthdayAge).every((m) => m.lane === "gift"),
  );
  for (const gift of timelineEvents.filter((m) => m.birthdayAge)) {
    assert.ok(Object.hasOwn(gift, "photo"));
    if (!gift.photo) continue;
    assert.match(
      gift.photo.src,
      /^\/images\/[\w.-]+\.(webp|jpe?g|png|avif|svg)$/i,
    );
    assert.ok(gift.photo.alt.trim());
    assert.ok(
      existsSync(new URL(`../public${gift.photo.src}`, import.meta.url)),
      `${gift.name}: missing photo asset`,
    );
  }
});

test("timeline spans 2022–2027 and all annotations remain discoverable without lane collisions", () => {
  assert.equal(months.length, 61);
  assert.deepEqual([months[0].year, months[0].month], [2022, 0]);
  assert.deepEqual(
    [months[targetIndex].year, months[targetIndex].month],
    [2027, 0],
  );
  for (const [w, h] of [
    [1260, 580],
    [346, 480],
    [276, 310],
    [820, 190],
  ]) {
    const seen = new Set();
    for (let i = 0; i <= 200; i++) {
      const frame = timelineFrame(i / 200, w, h);
      const labels = fitTimelineLabels(frame, w);
      for (const a of labels) {
        seen.add(a.name);
        assert.ok(a.x - a.width / 2 >= 7.99 && a.x + a.width / 2 <= w - 7.99);
        for (const b of labels)
          if (a.index < b.index && a.lane === b.lane)
            assert.ok(a.x + a.width / 2 + 11.99 <= b.x - b.width / 2);
      }
    }
    assert.equal(seen.size, 16, `${w}×${h}: missing a trip`);
    const end = timelineFrame(1, w, h);
    assert.ok(
      Math.abs(end.tx + monthX(targetIndex) * end.scale - w / 2) < 0.01,
    );
    assert.ok(end.ty - end.cardHeight - 16 >= 0);
    assert.ok(end.ty + 140 * end.scale <= h);
  }
});

test("portrait birthday compositions preserve photo ratio and fit the available stage", () => {
  for (const [width, height] of [
    [1218, 680],
    [331, 560],
    [261, 416],
    [841, 332],
  ]) {
    const frame = timelineFrame(0.3, width, height);
    const card = birthdayLayout(width, height, frame.scale);
    assert.ok(card.width <= width - 16);
    assert.ok(card.photoWidth > 90);
    assert.ok(Math.abs(card.photoWidth / card.photoHeight - 3 / 4) < 0.001);
    assert.ok(frame.ty - 16 - card.height >= 0);
    assert.ok(frame.axisY + 55 <= height);
    assert.ok(card.photoHeight * card.photoWidth > 64 * 64 * 3);
  }
});

test("scene progress respects the actual sticky height and both boundaries", () => {
  assert.equal(sceneProgress(100, 4000, 800), 0);
  assert.equal(sceneProgress(-1600, 4000, 800), 0.5);
  assert.equal(sceneProgress(-3200, 4000, 800), 1);
  assert.equal(sceneProgress(-4000, 4000, 800), 1);
  assert.equal(sceneProgress(0, 800, 800), 0);
});

test("journey states never show an accommodation before the city or a destination before arrival", () => {
  const samples = Array.from({ length: 1001 }, (_, i) =>
    journeyState(i / 1000),
  );
  for (const s of samples) {
    if (s.destinationRevealed) assert.equal(s.flightProgress, 1);
    if (s.cityOpacity > 0.01) assert.equal(s.flightProgress, 1);
    if (s.stayOpacity > 0.01) assert.equal(s.cityOpacity, 1);
    if (s.cityOpacity > 0.5) assert.equal(s.planeOpacity, 0);
    assert.ok(!["car", "taxi"].includes(s.phase));
  }
  for (let i = 1; i < samples.length; i++)
    assert.ok(samples[i].flightProgress >= samples[i - 1].flightProgress);
  assert.deepEqual(journeyState(0.4), journeyState(0.4));
});

test("flight heading remains finite and continuous on reaching the endpoint", () => {
  const a = [0, 400],
    control = [220, 0],
    b = [600, 100];
  assert.deepEqual(quadraticPoint(a, control, b, 1), b);
  const angle = (t) => {
    const d = quadraticTangent(a, control, b, t);
    return Math.atan2(d[1], d[0]);
  };
  assert.ok(Math.hypot(...quadraticTangent(a, control, b, 1)) > 0);
  assert.ok(Math.abs(angle(1) - angle(0.9999)) < 0.001);
});

test("distance-based curve progression is monotonic and reaches both airports", () => {
  const a = [0, 400],
    c = [220, 0],
    b = [600, 100],
    table = quadraticLengthTable(a, c, b);
  const points = Array.from({ length: 11 }, (_, i) =>
    quadraticPoint(a, c, b, quadraticParameterAtLength(table, i / 10)),
  );
  assert.deepEqual(points[0], a);
  assert.deepEqual(points.at(-1), b);
  const lengths = points
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  assert.ok(Math.max(...lengths) - Math.min(...lengths) < 1.3);
});

test("Vienna contains real attributed streets and the supplied reference is on the named street", () => {
  assert.equal(
    vienna.source.commit,
    "734333a5f858729a6bc227c2f8dae742af050d25",
  );
  assert.equal(vienna.source.license, "ODbL-1.0");
  assert.ok(vienna.features.length > 1000);
  const street = vienna.features.filter(
    (f) => f.properties.name === "Untere Weißgerberstraße",
  );
  assert.ok(street.length);
  const [x, y] = trip.airbnb.coordinates;
  const sx = 111320 * Math.cos((y * Math.PI) / 180),
    sy = 111320;
  let closest = Infinity;
  for (const f of street)
    for (const line of f.geometry.coordinates)
      for (let i = 1; i < line.length; i++) {
        const a = line[i - 1],
          b = line[i],
          dx = (b[0] - a[0]) * sx,
          dy = (b[1] - a[1]) * sy;
        const t = Math.max(
          0,
          Math.min(
            1,
            ((x - a[0]) * sx * dx + (y - a[1]) * sy * dy) / (dx * dx + dy * dy),
          ),
        );
        closest = Math.min(
          closest,
          Math.hypot((x - a[0]) * sx - t * dx, (y - a[1]) * sy - t * dy),
        );
      }
  assert.ok(
    closest < 2,
    `Reference must remain on the sourced street: ${closest}m`,
  );
  assert.equal(trip.airbnb.locationPrecision, "approximate-street");
  assert.ok(trip.airbnb.uncertaintyMeters >= 350);
  assert.ok(trip.airbnb.address.includes("37"));
});

test("all street geometry lies inside its declared geographic extent", () => {
  const [west, south, east, north] = vienna.bbox;
  for (const f of vienna.features) {
    assert.equal(f.geometry.type, "MultiLineString");
    for (const line of f.geometry.coordinates) {
      assert.ok(line.length >= 2);
      for (const [x, y] of line)
        assert.ok(
          x >= west - 1e-7 &&
            x <= east + 1e-7 &&
            y >= south - 1e-7 &&
            y <= north + 1e-7,
        );
    }
  }
  assert.ok(europe.features.some((f) => f.id === "040"));
  assert.ok(europe.features.some((f) => f.id === "724"));
});

test("camera interpolation keeps required locations inside both viewport shapes", () => {
  for (const [w, h] of [
    [340, 460],
    [1200, 600],
  ]) {
    const from = geoMercator().fitExtent(
      [
        [26, 28],
        [w - 26, h - 28],
      ],
      boundsFeature([16.354, 48.198, 16.407, 48.222]),
    );
    const to = geoMercator().fitExtent(
      [
        [Math.min(75, w * 0.19), 52],
        [w - Math.min(75, w * 0.19), h - 58],
      ],
      boundsFeature([16.365, 48.201, 16.401, 48.215]),
    );
    for (let i = 0; i <= 100; i++)
      for (const c of [trip.airbnb.coordinates, [16.3731, 48.2085]]) {
        const p = transformPoint(from(c), fitCamera(from, to, i / 100));
        assert.ok(p[0] > 22 && p[0] < w - 22 && p[1] > 22 && p[1] < h - 22);
      }
  }
  assert.ok(airports.BCN.coordinates[0] < airports.VIE.coordinates[0]);
});

test("an independent ICS parser sees the inclusive weekend and 19:00 Vienna performance", () => {
  const parsed = new ICAL.Component(ICAL.parse(buildCalendar()));
  const events = parsed.getAllSubcomponents("vevent");
  assert.equal(events.length, 2);
  const stay = new ICAL.Event(events[0]),
    ballet = new ICAL.Event(events[1]);
  assert.equal(stay.startDate.toString(), "2027-01-22");
  assert.equal(stay.endDate.toString(), "2027-01-25");
  assert.equal(stay.duration.toSeconds(), 3 * 86400);
  assert.equal(
    ballet.startDate.toJSDate().toISOString(),
    "2027-01-22T18:00:00.000Z",
  );
  assert.equal(ballet.location, "Wiener Staatsoper, Opernring 2, 1010 Wien");
  assert.equal(events[1].getFirstProperty("dtend"), null);
});

test("calendar TEXT escapes and UTF-8 folding round-trip without corruption", () => {
  const title =
    "Viena, música; una noche \\ especial\n" + "Öpera y compañía ".repeat(14);
  const data = { ...trip, ballet: { ...trip.ballet, title } };
  const ics = buildCalendar(data);
  for (const line of ics.split("\r\n"))
    assert.ok(Buffer.byteLength(line, "utf8") <= 75);
  const components = new ICAL.Component(ICAL.parse(ics)).getAllSubcomponents(
    "vevent",
  );
  const event = new ICAL.Event(components[1]);
  assert.equal(event.summary, `${title} — ${trip.ballet.theatre}`);
});

test("no admission documents are public and unconfirmed content remains unset", () => {
  assert.equal(trip.airbnb.photos.length, 0);
  assert.equal(trip.flight.outbound, null);
  assert.equal(trip.ballet.title, "Living Legacies");
  assert.ok(
    !readdirSync("public", { recursive: true }).some((f) => /\.pdf$/i.test(f)),
  );
});

test("displayed dates and exported times share the supplied trip date model", () => {
  assert.equal(trip.dates, "22–24 de enero de 2027");
  assert.equal(trip.shortDates, "22—24.01.2027");
  assert.equal(trip.ballet.date, "Viernes, 22 de enero de 2027");
  assert.equal(trip.ballet.time, "19:00");
  assert.equal(
    new Date(trip.ballet.startsAt).toISOString(),
    "2027-01-22T18:00:00.000Z",
  );
});

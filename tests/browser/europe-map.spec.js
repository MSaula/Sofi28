import { test, expect } from "@playwright/test";
import { scrollScene, expectInside } from "./helpers.js";
import { geoMercator } from "d3-geo";
import { boundsFeature } from "../../src/geography.js";
import places from "../../src/data/europe-places.json" with { type: "json" };

for (const [name, width, height] of [
  ["desktop", 1440, 1000],
  ["mobile", 390, 844],
  ["narrow", 320, 700],
  ["laptop", 1000, 650],
]) {
  test(`${name}: Europe shows real visited places without displaced markers or colliding labels`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await scrollScene(page, ".journey-scene", 0.02);
    await expect(page.locator(".journey-heading-copy h2")).toHaveText(
      "¿A dónde iremos?",
    );
    await expect(page.locator(".air-route-track")).toHaveCount(0);
    await expect(page.getByTestId("destination-label")).toHaveCount(0);
    await expect(page.locator(".journey-scene")).not.toHaveAttribute(
      "aria-label",
      /Viena/,
    );
    await expect(page.getByTestId("flight-route")).toHaveAttribute(
      "opacity",
      "0",
    );
    for (const place of await page
      .locator('[data-map-place][data-visited="true"]')
      .all()) {
      await expect(place).toHaveAttribute("opacity", "1");
    }
    const map = page.locator(".europe-map");
    const geometry = await map.evaluate((svg) => {
      const box = svg.viewBox.baseVal;
      return {
        w: box.width,
        h: box.height,
        places: [...svg.querySelectorAll("[data-map-place]")].map((g) => {
          const marker = g.querySelector("[data-place-marker]"),
            label = g.querySelector("[data-place-label]"),
            r = label.getBBox();
          return {
            id: g.dataset.mapPlace,
            visited: g.dataset.visited,
            lon: Number(g.dataset.lon),
            lat: Number(g.dataset.lat),
            point: [
              Number(marker.getAttribute("cx")),
              Number(marker.getAttribute("cy")),
            ],
            rect: { x: r.x, y: r.y, width: r.width, height: r.height },
          };
        }),
      };
    });
    // A separate projection from geographic bounds catches SVG/viewBox scaling errors.
    const projection = geoMercator().fitExtent(
      [
        [geometry.w < 400 ? 24 : 30, 28],
        [geometry.w - (geometry.w < 400 ? 24 : 30), geometry.h - 28],
      ],
      boundsFeature([-11, 35, 27, 57.5]),
    );
    const expected = places.places.filter((p) => p.visited || p.frameReference);
    for (const p of expected) {
      const actual = geometry.places.find((a) => a.id === p.id);
      expect(actual, `${p.name} present`).toBeTruthy();
      expect([actual.lon, actual.lat]).toEqual(p.coordinates);
      const correct = projection(p.coordinates);
      expect(
        Math.hypot(actual.point[0] - correct[0], actual.point[1] - correct[1]),
      ).toBeLessThan(0.001);
    }
    expect(geometry.places.some((p) => p.id === "reykjavik")).toBe(false);
    for (const p of geometry.places) {
      expect(p.rect.x).toBeGreaterThan(0);
      expect(p.rect.y).toBeGreaterThan(0);
      expect(p.rect.x + p.rect.width).toBeLessThan(geometry.w);
      expect(p.rect.y + p.rect.height).toBeLessThan(geometry.h);
      for (const other of geometry.places)
        if (p !== other) {
          const a = p.rect,
            b = other.rect;
          expect(
            a.x < b.x + b.width &&
              a.x + a.width > b.x &&
              a.y < b.y + b.height &&
              a.y + a.height > b.y,
            `${p.id}/${other.id}: actual text overlap`,
          ).toBe(false);
        }
    }
    await page.screenshot({
      path: testInfo.outputPath(`${name}-europe-departure.png`),
    });
    for (const progress of [
      0.12, 0.3, 0.5, 0.55, 0.62, 0.68, 0.72, 0.8, 0.98, 0.8, 0.68, 0.55, 0.5,
      0.3, 0.02,
    ]) {
      await scrollScene(page, ".journey-scene", progress);
      if (progress < 0.52)
        await expect(page.getByTestId("destination-label")).toHaveCount(0);
      if (progress === 0.55)
        await expect(page.getByTestId("destination-label")).toContainText(
          "Viena",
        );
      if (progress >= 0.68) {
        await expect(page.getByTestId("flight-route")).toHaveAttribute(
          "opacity",
          "0",
        );
        await expect(
          page.locator(".animated-map-panel .map-panel-caption"),
        ).toHaveText("VIENA · CENTRO");
      }
      if (progress === 0.98) {
        await expect(page.getByTestId("stay-location")).toHaveCSS(
          "opacity",
          "1",
        );
        await expectInside(
          page.locator(".animated-map-panel"),
          page.getByTestId("stay-pin"),
        );
      }
      if (progress < 0.64) {
        const delta = await page.evaluate(() => {
          const path = document.querySelector("[data-testid=flight-route]"),
            plane = document.querySelector("[data-testid=plane-marker]");
          const fraction = Number(plane.dataset.progress),
            drawn = 1 - Number(path.getAttribute("stroke-dashoffset"));
          const a = path
              .getPointAtLength(path.getTotalLength() * fraction)
              .matrixTransform(path.getScreenCTM()),
            b = new DOMPoint(0, 0).matrixTransform(plane.getScreenCTM());
          return {
            position: Math.hypot(a.x - b.x, a.y - b.y),
            trace: Math.abs(drawn - fraction),
          };
        });
        expect(delta.position).toBeLessThan(1);
        expect(delta.trace).toBeLessThan(1e-8);
      }
    }
  });
}

test("final card uses a large typographic composition with five historical photos and no future image", async ({
  page,
}) => {
  for (const [width, height] of [
    [1440, 1000],
    [390, 844],
    [320, 700],
    [1000, 650],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await scrollScene(page, ".calendar-scene", 0.95);
    const card = page.locator('[data-gift-card="28"]');
    await expect(card).toContainText("Sofi 28");
    await expect(card).toContainText("Lo próximo");
    await expect(card).toContainText("Enero");
    await expect(card).toContainText("2027");
    await expect(
      card.locator("img, .birthday-photo, .birthday-photo-empty, svg"),
    ).toHaveCount(0);
    await expect(page.locator("[data-photo-slot]")).toHaveCount(5);
    const title = card.locator(".birthday-card-place");
    expect(
      await title.evaluate((n) => parseFloat(getComputedStyle(n).fontSize)),
    ).toBeGreaterThanOrEqual(31);
    for (const selector of [
      ".birthday-card-edition",
      ".birthday-card-place",
      ".birthday-card-date",
    ])
      await expectInside(card, card.locator(selector));
    expect(await title.evaluate((n) => n.scrollWidth <= n.clientWidth)).toBe(
      true,
    );
    const titleBox = await title.boundingBox(),
      dateBox = await card.locator(".birthday-card-date").boundingBox();
    expect(titleBox.x + titleBox.width).toBeLessThanOrEqual(dateBox.x - 8);
    await expectInside(page.locator(".calendar-art"), card);
  }
});

test("map labels fade continuously through departure, arrival and the city zoom", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const [start, end] of [
    [0.055, 0.085],
    [0.5, 0.535],
    [0.62, 0.72],
  ]) {
    let previous = null;
    for (let i = 0; i <= 30; i++) {
      await scrollScene(
        page,
        ".journey-scene",
        start + ((end - start) * i) / 30,
      );
      const current = await page
        .locator(
          '.europe-place, .europe-place-labels, [data-testid="departure-label"], [data-testid="destination-label"]',
        )
        .evaluateAll((nodes) =>
          Object.fromEntries(
            nodes.map((n) => [
              n.dataset.mapPlace || n.dataset.testid || "places",
              Number(n.getAttribute("opacity")),
            ]),
          ),
        );
      if (previous)
        for (const key of Object.keys(current))
          if (key in previous)
            expect(Math.abs(current[key] - previous[key]), key).toBeLessThan(
              0.17,
            );
      previous = current;
    }
  }
});

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { places } from "../../src/viennaPlaces.js";
import { scrollScene, expectInside } from "./helpers.js";

async function openMap(page) {
  await page.goto("/");
  await scrollScene(page, ".journey-scene", 0.98);
  await page.getByRole("button", { name: /Explorar Viena/ }).click();
  const dialog = page.getByRole("dialog", { name: "Viena, a pie." });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("[data-vienna-marker]")).toHaveCount(32);
  return dialog;
}
async function choose(dialog, place) {
  await dialog
    .getByRole("searchbox", { name: "Buscar un lugar en Viena" })
    .fill(place.name);
  await dialog.locator(`[data-list-place="${place.id}"]`).click();
  const card = dialog.getByTestId("vienna-place-card");
  await expect(card).toHaveAttribute("data-place-id", place.id);
  return card;
}

test("desktop overview gives the five key places and apartment clear, correctly positioned markers", async ({
  page,
}, info) => {
  const dialog = await openMap(page);
  await expect(dialog.locator(".v-featured-pin")).toHaveCount(5);
  const map = dialog.getByTestId("explorer-map"),
    home = dialog.getByTestId("explorer-home-pin");
  await expectInside(map, home);
  const labels = await dialog
    .locator("[data-vienna-label]")
    .evaluateAll((nodes) =>
      nodes.map((n) => ({
        id: n.dataset.viennaLabel,
        rect: n.getBoundingClientRect().toJSON(),
      })),
    );
  expect(labels.map((l) => l.id).sort()).toEqual(
    [
      "home",
      "belvedere",
      "staatsoper",
      "hofburg",
      "stephansdom",
      "karlskirche",
    ].sort(),
  );
  for (let i = 0; i < labels.length; i++)
    for (let j = i + 1; j < labels.length; j++) {
      const a = labels[i].rect,
        b = labels[j].rect;
      expect(
        a.right <= b.left ||
          b.right <= a.left ||
          a.bottom <= b.top ||
          b.bottom <= a.top,
      ).toBe(true);
    }
  const mapBox = await map.boundingBox(),
    side = await dialog.locator(".v-explorer-sidebar").boundingBox();
  expect(mapBox.x + mapBox.width).toBeLessThanOrEqual(side.x + 1);
  for (const p of places) {
    const marker = dialog.locator(`[data-vienna-marker="${p.id}"]`);
    await expect(marker).toHaveAttribute(
      "data-longitude",
      String(p.coordinates[0]),
    );
    await expect(marker).toHaveAttribute(
      "data-latitude",
      String(p.coordinates[1]),
    );
  }
  await page.screenshot({ path: info.outputPath("vienna-overview.png") });
});

test("all 32 cards select the matching original photo, description, pedestrian metrics and route", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const dialog = await openMap(page);
  for (const p of places) {
    const card = await choose(dialog, p);
    await expect(card.locator("h3")).toHaveText(p.name);
    await expect(card.locator(".v-place-description")).toHaveText(
      p.description,
    );
    await expect(card.locator("img")).toHaveAttribute("src", p.image);
    await expect
      .poll(() =>
        card
          .locator("img")
          .evaluate((img) => img.complete && img.naturalWidth > 0),
      )
      .toBe(true);
    await expect(card.getByTestId("walking-distance")).toHaveAttribute(
      "data-meters",
      String(p.walk.meters),
    );
    await expect(card.getByTestId("walking-distance")).toHaveAttribute(
      "data-seconds",
      String(p.walk.seconds),
    );
    await expect(dialog.locator("[data-vienna-route]")).toHaveAttribute(
      "data-vienna-route",
      p.id,
    );
    const coverage = await dialog.locator(".v-walk-line").evaluate((path) => {
      const length = path.getTotalLength();
      return [0.2, 0.5, 0.8, 0.95].map((t) =>
        path.isPointInStroke(path.getPointAtLength(length * t)),
      );
    });
    expect(
      coverage,
      p.id + " route must remain fully painted when zoomed",
    ).toEqual([true, true, true, true]);
  }
});

test("map markers support keyboard and rapid selections never leave stale card or route data", async ({
  page,
}) => {
  const dialog = await openMap(page);
  const opera = dialog.getByRole("button", {
    name: "Ver Wiener Staatsoper",
    exact: true,
  });
  await opera.focus();
  await page.keyboard.press("Enter");
  await expect(dialog.getByTestId("vienna-place-card")).toHaveAttribute(
    "data-place-id",
    "staatsoper",
  );
  for (const id of [
    "kunsthaus",
    "karlskirche",
    "belvedere",
    "demel",
    "hundertwasserhaus",
    "stephansdom",
  ])
    await choose(
      dialog,
      places.find((p) => p.id === id),
    );
  await expect(dialog.locator("[data-vienna-route]")).toHaveAttribute(
    "data-vienna-route",
    "stephansdom",
  );
  await expect(dialog.locator(".v-place-card img")).toHaveAttribute(
    "src",
    "/images/vienna-stephansdom.jpg",
  );
  await expect(
    dialog.locator('[data-vienna-marker="stephansdom"]'),
  ).toHaveAttribute("aria-pressed", "true");
});

test("nearby secondary markers select the actual closest point in both the story and the explorer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await scrollScene(page, ".journey-scene", 0.98);
  const source = page.locator('.vienna-map [data-vienna-marker="freyung"]');
  const point = await source.evaluate((node) => {
    const m = node.getScreenCTM();
    return { x: m.e, y: m.f };
  });
  await page.mouse.click(point.x, point.y);
  const dialog = page.getByRole("dialog", { name: "Viena, a pie." });
  await expect(dialog.getByTestId("vienna-place-card")).toHaveAttribute(
    "data-place-id",
    "freyung",
  );
  await page.setViewportSize({ width: 1000, height: 650 });
  await dialog
    .getByRole("button", { name: "Vista general", exact: true })
    .click();
  await expect
    .poll(() =>
      dialog.getByTestId("explorer-map").getAttribute("data-zoom").then(Number),
    )
    .toBe(1);
  const target = dialog.locator('[data-vienna-marker="cafe-central"]');
  const other = await target.evaluate((node) => {
    const m = node.getScreenCTM();
    return { x: m.e, y: m.f };
  });
  await page.mouse.click(other.x, other.y);
  await expect(dialog.getByTestId("vienna-place-card")).toHaveAttribute(
    "data-place-id",
    "cafe-central",
  );
});

test("walking route and map pins remain aligned while zooming and panning, with no truncated blue stroke", async ({
  page,
}) => {
  const dialog = await openMap(page);
  const p = places.find((p) => p.id === "kunsthaus");
  await choose(dialog, p);
  const map = dialog.getByTestId("explorer-map");
  await expect
    .poll(() => map.getAttribute("data-zoom").then(Number))
    .toBeGreaterThan(3.5);
  // Zoom out from the fitted nearby route so both endpoints stay on screen.
  await dialog.getByRole("button", { name: "Alejar el mapa" }).click();
  for (let i = 0; i < 6; i++) {
    const geometry = await dialog
      .locator(".v-walk-line")
      .evaluate((path, coordinates) => {
        const start = path.getPointAtLength(0),
          end = path.getPointAtLength(path.getTotalLength()),
          matrix = path.getCTM();
        const a = new DOMPoint(start.x, start.y).matrixTransform(matrix),
          b = new DOMPoint(end.x, end.y).matrixTransform(matrix);
        const svg = path.closest("svg");
        const home = svg
          .querySelector("[data-testid=explorer-home-pin]")
          .getCTM();
        const target = svg
          .querySelector("[data-vienna-marker=kunsthaus]")
          .getCTM();
        return {
          a: [a.x, a.y],
          b: [b.x, b.y],
          home: [home.e, home.f],
          target: [target.e, target.f],
          vector: getComputedStyle(path).vectorEffect,
        };
      });
    expect(
      Math.hypot(
        geometry.a[0] - geometry.home[0],
        geometry.a[1] - geometry.home[1],
      ),
    ).toBeLessThan(18);
    expect(
      Math.hypot(
        geometry.b[0] - geometry.target[0],
        geometry.b[1] - geometry.target[1],
      ),
    ).toBeLessThan(18);
    expect(geometry.vector).toBe("none");
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(300);
  const coverage = await dialog
    .locator(".v-walk-line")
    .evaluate((path) =>
      [0.3, 0.65, 0.95].map((t) =>
        path.isPointInStroke(path.getPointAtLength(path.getTotalLength() * t)),
      ),
    );
  expect(coverage).toEqual([true, true, true]);
  await dialog
    .getByRole("button", { name: "Vista general", exact: true })
    .click();
  await expect.poll(() => map.getAttribute("data-zoom").then(Number)).toBe(1);
  const bounds = await map.boundingBox();
  const before = Number(await map.getAttribute("data-zoom"));
  const beforeTransform = await dialog
    .locator(".v-interactive-svg > g")
    .first()
    .getAttribute("transform");
  await page.mouse.move(
    bounds.x + bounds.width * 0.4,
    bounds.y + bounds.height * 0.7,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width * 0.4 + 60,
    bounds.y + bounds.height * 0.7 + 30,
    { steps: 5 },
  );
  await page.mouse.up();
  expect(Number(await map.getAttribute("data-zoom"))).toBeCloseTo(before, 3);
  expect(
    await dialog
      .locator(".v-interactive-svg > g")
      .first()
      .getAttribute("transform"),
  ).not.toBe(beforeTransform);
  await expect(dialog.getByTestId("vienna-place-card")).toHaveAttribute(
    "data-place-id",
    "kunsthaus",
  );
});

test("dialog locks the story, restores focus and leaves reverse scroll and destination reveal intact", async ({
  page,
}) => {
  await page.goto("/");
  await scrollScene(page, ".journey-scene", 0.35);
  await expect(page.locator(".city-layer .v-marker-layer")).toHaveCSS(
    "pointer-events",
    "none",
  );
  await expect(
    page.getByRole("button", { name: /Explorar Viena/ }),
  ).toHaveCount(0);
  await scrollScene(page, ".journey-scene", 0.98);
  const opener = page.getByRole("button", { name: /Explorar Viena/ });
  await opener.click();
  const y = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => scrollY)).toBe(y);
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("vienna-explorer")).not.toBeVisible();
  await expect(opener).toBeFocused();
  await scrollScene(page, ".journey-scene", 0.35);
  await expect(page.locator(".journey-flight-description")).toContainText(
    "Por descubrir",
  );
  await scrollScene(page, ".journey-scene", 0.98);
  await opener.click();
  await expect(
    page.getByRole("dialog", { name: "Viena, a pie." }),
  ).toBeVisible();
});

test("mobile, narrow and landscape layouts keep cards reachable and return to the city after rotation", async ({
  page,
}, info) => {
  const dialog = await openMap(page);
  await choose(
    dialog,
    places.find((p) => p.id === "belvedere"),
  );
  for (const [name, width, height] of [
    ["mobile", 390, 844],
    ["narrow", 320, 700],
    ["landscape", 844, 390],
  ]) {
    await page.setViewportSize({ width, height });
    await expectInside(
      dialog.getByTestId("explorer-map"),
      dialog.getByTestId("explorer-home-pin"),
    );
    await dialog.getByTestId("walking-distance").scrollIntoViewIfNeeded();
    await expect(dialog.getByTestId("walking-distance")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: info.outputPath(name + "-explorer.png") });
  }
  await page.getByRole("button", { name: "Cerrar mapa de Viena" }).click();
  await expect(
    page.getByRole("button", { name: /Explorar Viena/ }),
  ).toBeInViewport();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.getByTestId("stay-location")).toBeInViewport();
});

test("search, empty results and the map overview are usable without a pointer", async ({
  page,
}) => {
  const dialog = await openMap(page);
  await dialog.getByRole("button", { name: "32 lugares", exact: true }).click();
  const search = dialog.getByRole("searchbox", {
    name: "Buscar un lugar en Viena",
  });
  await expect(search).toBeFocused();
  await search.fill("xxxx-no-place-2449");
  await expect(dialog.locator(".v-list-empty")).toBeVisible();
  await search.fill("Ópera");
  await expect(dialog.locator("[data-list-place=staatsoper]")).toBeVisible();
  await dialog.locator("[data-list-place=staatsoper]").focus();
  await page.keyboard.press("Enter");
  await expect(dialog.getByTestId("vienna-place-card")).toHaveAttribute(
    "data-place-id",
    "staatsoper",
  );
  const svg = dialog.locator(".v-interactive-svg");
  await svg.focus();
  await page.keyboard.press("Home");
  await expect
    .poll(() =>
      dialog.getByTestId("explorer-map").getAttribute("data-zoom").then(Number),
    )
    .toBe(1);
});

test("the overview, selected card and searchable catalogue have no serious accessibility violations", async ({
  page,
}) => {
  const dialog = await openMap(page);
  for (const mode of ["overview", "card", "list"]) {
    if (mode === "card")
      await choose(
        dialog,
        places.find((p) => p.id === "belvedere"),
      );
    if (mode === "list")
      await dialog
        .getByRole("button", { name: "32 lugares", exact: true })
        .click();
    await page.waitForTimeout(300);
    const results = await new AxeBuilder({ page })
      .include("#vienna-explorer")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations
        .filter((v) => ["serious", "critical"].includes(v.impact))
        .map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  }
});

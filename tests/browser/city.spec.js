import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { cityPlaces } from "../../src/cityContent.js";
import { scrollScene, expectInside, finishReveals } from "./helpers.js";

async function collection(page) {
  await page
    .locator("#ciudad-lugares")
    .evaluate((n) => n.scrollIntoView({ block: "start", behavior: "instant" }));
  await expect(page.locator(".city-gallery-heading")).toHaveClass(/is-visible/);
  await finishReveals(page);
}

test("desktop: the four acts retain decoded authentic photos, readable copy and reversible covered transitions", async ({
  page,
}, info) => {
  test.setTimeout(90000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await scrollScene(page, ".city-scene", 0.15);
  await expect(page.locator("[data-city-shot]")).toHaveCount(8);
  await expect
    .poll(() =>
      page
        .locator("[data-city-shot]")
        .evaluateAll((nodes) =>
          nodes.every((n) => n.dataset.photoReady === "true"),
        ),
    )
    .toBe(true);
  for (const [p, act] of [
    [0.15, 0],
    [0.37, 1],
    [0.59, 2],
    [0.86, 3],
  ]) {
    await scrollScene(page, ".city-scene", p);
    await expect(page.locator(`[data-city-copy="${act}"]`)).toHaveCSS(
      "opacity",
      "1",
    );
    await expectInside(
      page.locator(".city-stage"),
      page.locator(`[data-city-copy="${act}"]`),
    );
    await page.screenshot({ path: info.outputPath(`city-act-${act}.png`) });
  }
  const inspect = () =>
    page.evaluate(() => {
      const film = document.querySelector(".city-film").getBoundingClientRect();
      return {
        width: film.width,
        plates: [...document.querySelectorAll("[data-city-plate]")].map((n) => {
          const b = n.getBoundingClientRect();
          return { x: b.left - film.left, right: b.right - film.left };
        }),
      };
    });
  const positions = [
    0.19, 0.21, 0.215, 0.225, 0.24, 0.26, 0.28, 0.295, 0.305, 0.31, 0.42, 0.445,
    0.46, 0.49, 0.52, 0.535, 0.54, 0.65, 0.675, 0.69, 0.72, 0.75, 0.765, 0.78,
    0.9, 0.915, 0.94, 0.97, 1,
  ];
  const forward = [];
  for (const p of positions) {
    await scrollScene(page, ".city-scene", p);
    const frame = await inspect();
    forward.push(frame);
    const intervals = frame.plates
      .map((r) => [Math.max(0, r.x), Math.min(frame.width, r.right)])
      .filter(([a, b]) => b > a)
      .sort(([a], [b]) => a - b);
    let covered = 0;
    for (const [a, b] of intervals) {
      expect(a).toBeLessThanOrEqual(covered + 1);
      covered = Math.max(covered, b);
    }
    expect(covered).toBeGreaterThanOrEqual(frame.width - 1);
    await expect(page.locator("[data-city-shot]")).toHaveCount(8);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  for (let i = positions.length - 1; i >= 0; i--) {
    await scrollScene(page, ".city-scene", positions[i]);
    const frame = await inspect();
    frame.plates.forEach((plate, j) =>
      expect(Math.abs(plate.x - forward[i].plates[j].x)).toBeLessThan(1),
    );
  }
  await scrollScene(page, ".city-scene", 0.99);
  await expect(page.locator(".city-film-progress")).toHaveCSS("opacity", "0");
  expect(errors).toEqual([]);
});

test("late inset decode never shows an empty framed photograph", async ({
  page,
}) => {
  let release;
  const gate = new Promise((resolve) => (release = resolve));
  await page.route("**/images/city-flora.jpg", async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.locator(".city-scene").waitFor();
  await scrollScene(page, ".city-scene", 0.59);
  await expect(page.locator(".city-cafe-inset")).toHaveAttribute(
    "data-photo-ready",
    "false",
  );
  await expect(page.locator(".city-cafe-inset")).toHaveCSS("opacity", "0");
  await expect
    .poll(() =>
      page
        .locator('[data-city-shot="balthasar"] img')
        .evaluate((img) => img.complete && img.naturalWidth > 0),
    )
    .toBe(true);
  release();
  await expect(page.locator(".city-cafe-inset")).toHaveAttribute(
    "data-photo-ready",
    "true",
  );
  await expect(page.locator(".city-cafe-inset")).toHaveCSS("opacity", "1");
});

test("the horizontal collection filters, reaches both ends and opens the matching original photographs", async ({
  page,
}) => {
  await page.goto("/");
  await collection(page);
  await expect(page.locator(".city-card")).toHaveCount(29);
  const filters = page.getByRole("group", {
    name: "Filtrar los lugares de Viena",
  });
  for (const [name, count] of [
    ["Lo imprescindible", 12],
    ["Calles y pasajes", 7],
    ["Un buen café", 4],
    ["A la mesa", 6],
    ["Todo", 29],
  ]) {
    await filters.getByRole("button", { name: new RegExp("^" + name) }).click();
    await expect(page.locator(".city-card")).toHaveCount(count);
    await expect
      .poll(() => page.locator(".city-rail").evaluate((n) => n.scrollLeft))
      .toBe(0);
  }
  await page
    .getByRole("button", { name: "Ver elementos siguientes", exact: true })
    .click();
  await expect
    .poll(() => page.locator(".city-rail").evaluate((n) => n.scrollLeft))
    .toBeGreaterThan(100);
  await page.locator(".city-rail").focus();
  await page.keyboard.press("End");
  await expect
    .poll(() =>
      page
        .locator(".city-rail")
        .evaluate((n) => n.scrollLeft + n.clientWidth >= n.scrollWidth - 2),
    )
    .toBe(true);
  await expect(
    page.getByRole("button", { name: "Ver elementos siguientes", exact: true }),
  ).toBeDisabled();
  await expectInside(
    page.locator(".city-rail"),
    page.locator(".city-card").last(),
  );
  await page.keyboard.press("Home");
  await expect
    .poll(() => page.locator(".city-rail").evaluate((n) => n.scrollLeft))
    .toBe(0);
  await page
    .getByRole("button", {
      name: "Ver fotografía de Belvedere Superior",
      exact: false,
    })
    .click();
  const viewer = page.getByRole("dialog", { name: "Una mirada a Viena" });
  await expect(viewer).toBeVisible();
  for (const place of cityPlaces) {
    await expect(
      viewer.getByRole("heading", { name: place.name, exact: true }),
    ).toBeVisible();
    await expect
      .poll(() =>
        viewer
          .locator(".city-lightbox-image img")
          .evaluate((img) => img.complete && img.naturalWidth > 0),
      )
      .toBe(true);
    expect(
      await viewer.locator(".city-lightbox-image img").getAttribute("src"),
    ).toBe(place.image);
    await page.keyboard.press("ArrowRight");
  }
  const y = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 350);
  await page.waitForTimeout(80);
  expect(await page.evaluate(() => scrollY)).toBe(y);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", {
      name: "Ver fotografía de Belvedere Superior",
      exact: false,
    }),
  ).toBeFocused();
});

test("one shared map opens from the journey, the city and a landmark photo without nested dialogs", async ({
  page,
}) => {
  await page.goto("/");
  await scrollScene(page, ".journey-scene", 0.98);
  await page.getByRole("button", { name: /Explorar Viena/ }).click();
  const map = page.getByRole("dialog", { name: "Viena, a pie." });
  await expect(map).toBeVisible();
  await page.keyboard.press("Escape");
  await collection(page);
  await page
    .getByRole("button", { name: "Abrir el mapa de Viena", exact: true })
    .click();
  await expect(map).toBeVisible();
  await expect(page.locator("#vienna-explorer")).toHaveCount(1);
  await expect(map.locator("[data-vienna-marker]")).toHaveCount(32);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Abrir el mapa de Viena", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", {
      name: "Ver fotografía de Belvedere Superior",
      exact: false,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Ver Belvedere Superior en el mapa",
      exact: true,
    })
    .click();
  await expect(map).toBeVisible();
  await expect(page.locator("dialog[open]")).toHaveCount(1);
  await expect(map.getByTestId("vienna-place-card")).toHaveAttribute(
    "data-place-id",
    "belvedere",
  );
  await expect(map.locator('[data-vienna-route="belvedere"]')).toBeVisible();
});

test("closing the city map after rotation returns to its actual origin, not to the flight", async ({
  page,
}) => {
  await page.goto("/");
  await collection(page);
  const trigger = page.getByRole("button", {
    name: "Abrir el mapa de Viena",
    exact: true,
  });
  await trigger.click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.setViewportSize({ width: 844, height: 390 });
  await page
    .getByRole("button", { name: "Cerrar mapa de Viena", exact: true })
    .click();
  await expect(trigger).toBeInViewport();
  await expect(trigger).toBeFocused();
  await expect(page.locator("#destino")).not.toBeInViewport();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(trigger).toBeInViewport();
});

for (const [name, width, height, reduced] of [
  ["mobile", 390, 844, false],
  ["narrow", 320, 700, false],
  ["landscape", 844, 390, false],
  ["reduced", 1440, 1000, true],
]) {
  test(`${name}: the city remains readable and usable without horizontal page overflow`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height });
    if (reduced) await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const staticMode = reduced || height <= 600;
    if (staticMode) {
      await expect(page.locator(".city-scene")).toHaveClass(/reduced-scene/);
      await expect(page.locator(".city-static-hero")).toBeVisible();
      await expect(page.locator("[data-city-plate]")).toHaveCount(0);
    } else
      for (const p of [0.15, 0.37, 0.59, 0.86, 0.99]) {
        await scrollScene(page, ".city-scene", p);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page.screenshot({ path: info.outputPath(`city-${p}.png`) });
      }
    await collection(page);
    await page.screenshot({ path: info.outputPath("city-collection.png") });
    const filters = page.getByRole("group", {
      name: "Filtrar los lugares de Viena",
    });
    await filters.getByRole("button", { name: /^A la mesa/ }).click();
    await expect(page.locator(".city-card")).toHaveCount(6);
    await page.locator(".city-rail").focus();
    await page.keyboard.press("End");
    await expect
      .poll(() =>
        page
          .locator(".city-rail")
          .evaluate((n) => n.scrollLeft + n.clientWidth >= n.scrollWidth - 2),
      )
      .toBe(true);
    await page
      .getByRole("button", { name: "Ver fotografía de TIAN", exact: false })
      .click();
    await expect(
      page.getByRole("dialog", { name: "Una mirada a Viena" }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("dialog", { name: "Una mirada a Viena" })
        .getByRole("heading", { name: "TIAN", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}

test("city collection and photograph dialog have no serious or critical accessibility findings", async ({
  page,
}) => {
  await page.goto("/");
  await collection(page);
  for (const photoOpen of [false, true]) {
    if (photoOpen)
      await page
        .getByRole("button", {
          name: "Ver fotografía de Belvedere Superior",
          exact: false,
        })
        .click();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    await test
      .info()
      .attach(photoOpen ? "axe-city-photo" : "axe-city-collection", {
        body: Buffer.from(JSON.stringify(results.violations, null, 2)),
        contentType: "application/json",
      });
    expect(
      results.violations
        .filter((v) => ["serious", "critical"].includes(v.impact))
        .map((v) => v.id),
    ).toEqual([]);
  }
});

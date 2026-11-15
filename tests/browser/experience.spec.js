import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import ICAL from "ical.js";
import AxeBuilder from "@axe-core/playwright";
import {
  expectInside,
  finishReveals,
  scrollScene,
  walkPage,
} from "./helpers.js";

for (const [name, width, height] of [
  ["desktop", 1440, 1000],
  ["mobile", 390, 844],
]) {
  test(`${name}: flight marker matches the actual SVG route throughout its movement`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await scrollScene(page, ".journey-scene", 0.3);
    await expect(page.locator(".journey-flight-description")).toContainText(
      "Por descubrir",
    );
    await expect(page.locator(".journey-heading-copy")).not.toContainText(
      "Viena",
    );
    await expect(page.locator(".route-stop")).toHaveCount(0);
    let finalAngle;
    for (const p of [0.061, 0.12, 0.22, 0.34, 0.46, 0.515, 0.52, 0.55, 0.6]) {
      await scrollScene(page, ".journey-scene", p);
      const deviation = await page.evaluate(() => {
        const route = document.querySelector("[data-testid=flight-route]"),
          marker = document.querySelector("[data-testid=plane-marker]");
        const fraction = Number(marker.dataset.progress);
        const expected = route
          .getPointAtLength(route.getTotalLength() * fraction)
          .matrixTransform(route.getScreenCTM());
        const actual = new DOMPoint(0, 0).matrixTransform(
          marker.getScreenCTM(),
        );
        return {
          distance: Math.hypot(actual.x - expected.x, actual.y - expected.y),
          angle: Number(marker.dataset.angle),
        };
      });
      expect(deviation.distance).toBeLessThan(1);
      if (p === 0.52) finalAngle = deviation.angle;
      if (p > 0.52)
        expect(Math.abs(deviation.angle - finalAngle)).toBeLessThan(0.1);
      await expectInside(
        page.locator(".animated-map-panel"),
        page.getByTestId("plane-marker"),
      );
    }
    await expect(page.locator(".journey-heading-copy h2")).toHaveText("Viena.");
    await scrollScene(page, ".journey-scene", 0.98);
    await expect(page.getByTestId("stay-location")).toHaveCSS("opacity", "1");
    await expectInside(
      page.locator(".animated-map-panel"),
      page.getByTestId("stay-pin"),
    );
    await expect(page.locator(".location-description")).toContainText(
      "Landstraße",
    );
    await expect(page.locator(".location-description")).toContainText(
      "aproximada",
    );
    await expect(page.locator(".real-street-network")).toHaveAttribute(
      "data-source-commit",
      "734333a5f858729a6bc227c2f8dae742af050d25",
    );
    await scrollScene(page, ".journey-scene", 0.3);
    await expect(page.locator(".journey-heading-copy")).not.toContainText(
      "Viena",
    );
    expect(errors).toEqual([]);
  });

  test(`${name}: chronology clips at the window, crossfades crowded labels and keeps all memories discoverable`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const seen = new Set();
    const photos = new Set();
    await expect(page).toHaveTitle("Sofi 28");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Hoy cumples 28 años.",
    );
    await expect(page.locator(".hero-copy > p")).toHaveText(
      "Y eso merece un regalo a la altura.",
    );
    for (let i = 0; i <= 50; i++) {
      await scrollScene(page, ".calendar-scene", i / 50);
      const labels = await page
        .locator("[data-memory-label]")
        .evaluateAll((nodes) =>
          nodes.map((n) => {
            const b = n.getBoundingClientRect();
            let opacity = 1;
            for (let parent = n; parent; parent = parent.parentElement)
              opacity *= Number(getComputedStyle(parent).opacity);
            return {
              name: n.dataset.memoryLabel,
              lane: n.dataset.lane,
              opacity,
              x: b.x,
              y: b.y,
              w: b.width,
              h: b.height,
            };
          }),
        );
      const art = await page.locator(".calendar-art").boundingBox();
      const month = await page.locator(".target-month").boundingBox();
      const slots = await page
        .locator("[data-photo-slot]")
        .evaluateAll((nodes) =>
          nodes
            .filter((n) => {
              let opacity = 1;
              for (let parent = n; parent; parent = parent.parentElement)
                opacity *= Number(getComputedStyle(parent).opacity);
              const b = n.getBoundingClientRect(),
                art = n.closest(".calendar-art").getBoundingClientRect();
              const overlap = Math.max(
                0,
                Math.min(b.right, art.right) - Math.max(b.left, art.left),
              );
              return opacity > 0.95 && b.width > 0 && overlap >= b.width * 0.85;
            })
            .map((n) => n.dataset.photoSlot),
        );
      slots.forEach((age) => photos.add(age));
      const visible = labels.filter(
        (a) => a.opacity > 0.65 && a.x + a.w > art.x && a.x < art.x + art.width,
      );
      for (const a of visible) {
        const overlap =
          Math.min(a.x + a.w, art.x + art.width) - Math.max(a.x, art.x);
        if (overlap >= a.w * 0.8) seen.add(a.name);
        expect(a.y).toBeGreaterThanOrEqual(art.y - 1);
        expect(a.y + a.h).toBeLessThanOrEqual(art.y + art.height + 1);
        if (a.lane === "gift") expect(a.y + a.h).toBeLessThan(month.y);
        else expect(a.y).toBeGreaterThan(month.y + month.height);
        for (const b of visible)
          if (a.name !== b.name) {
            const intersection =
              Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
            const vertical =
              Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
            expect(
              intersection > 1 && vertical > 1,
              `${a.name} overlaps ${b.name}`,
            ).toBe(false);
          }
      }
    }
    expect(seen.size).toBe(16);
    expect([...photos].sort()).toEqual(["23", "24", "25", "26", "27"]);
    await scrollScene(page, ".calendar-scene", 0.95);
    await expect(page.locator(".calendar-result")).toHaveCSS("opacity", "1");
    await expectInside(
      page.locator(".calendar-art"),
      page.locator(".target-month"),
    );
    await expectInside(
      page.locator(".calendar-art"),
      page.locator('[data-gift-card="28"]'),
    );
    await expect(page.locator(".calendar-canvas")).not.toContainText("Viena");
    for (const day of ["22", "23", "24"]) {
      await expect(
        page.locator(`[data-selected-day="${day}"] text`),
      ).toHaveAttribute("fill", "#fff");
      await expect(
        page.locator(`[data-selected-day="${day}"] rect`),
      ).toHaveAttribute("fill", "#2368f5");
    }
  });
}

test("navigation locks background scrolling, restores focus and calendar download parses correctly", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir el recorrido" }).click();
  const y = await page.evaluate(() => scrollY);
  await page.mouse.move(5, 500);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => scrollY)).toBe(y);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Abrir el recorrido" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Abrir el recorrido" }).click();
  await page.getByRole("button", { name: "07 Todo, aquí" }).click();
  const event = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Guardar las fechas", exact: true })
    .click();
  const downloaded = await event;
  const parsed = new ICAL.Component(
    ICAL.parse(await readFile(await downloaded.path(), "utf8")),
  );
  const ballet = new ICAL.Event(parsed.getAllSubcomponents("vevent")[1]);
  expect(ballet.location).toBe("Wiener Staatsoper, Opernring 2, 1010 Wien");
  expect(ballet.startDate.toJSDate().toISOString()).toBe(
    "2027-01-22T18:00:00.000Z",
  );
});

for (const [width, height] of [
  [1440, 1000],
  [390, 844],
  [844, 390],
  [1000, 650],
  [320, 700],
]) {
  test(`${width}×${height}: complete wheel traversal, reverse and rotation remain free of horizontal overflow`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await walkPage(page);
    for (const selector of [
      ".opera-scene",
      ".journey-scene",
      ".calendar-scene",
    ])
      await scrollScene(page, selector, 0.5);
    await page.setViewportSize({ width: height, height: width });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  });
}

test("landscape and reduced motion use readable static maps, preserving every essential detail", async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto("/");
  await expect(page.locator(".journey-scene")).toHaveClass(/static-journey/);
  await expect(page.locator(".static-map-pair .map-panel")).toHaveCount(2);
  await expect(page.locator(".journey-stage")).toHaveCSS(
    "position",
    "relative",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".calendar-result")).toHaveCSS("opacity", "1");
  await expect(page.locator(".opera-programme")).toHaveCSS("opacity", "1");
  await expect(page.locator(".static-map-pair .map-panel")).toHaveCount(2);
  await expect(page.locator(".summary-ballet")).toContainText(
    "Living Legacies",
  );
});

test("narrow and short laptop calendars clip sliding cards and keep photo copy and the final month readable", async ({
  page,
}) => {
  test.setTimeout(60000);
  for (const [width, height] of [
    [320, 700],
    [1000, 650],
    [390, 620],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    for (const p of [0, 0.07, 0.14, 0.28, 0.36, 0.44, 0.54, 0.7, 0.84, 0.98]) {
      await scrollScene(page, ".calendar-scene", p);
      for (const card of await page.locator("[data-gift-card]").all()) {
        const box = await card.boundingBox(),
          art = await page.locator(".calendar-art").boundingBox();
        const opacity = await card
          .locator("..")
          .evaluate((n) => Number(getComputedStyle(n).opacity));
        if (
          opacity < 0.65 ||
          box.x + box.width <= art.x ||
          box.x >= art.x + art.width
        )
          continue;
        expect(box.y).toBeGreaterThanOrEqual(art.y - 1);
        expect(box.y + box.height).toBeLessThanOrEqual(art.y + art.height + 1);
        const photo = card.locator("[data-photo-slot]");
        if ((await photo.count()) && p > 0) {
          const photoBox = await photo.boundingBox();
          const textBox = await card
            .locator(".birthday-card-edition")
            .boundingBox();
          expect(photoBox.x + photoBox.width).toBeLessThanOrEqual(
            textBox.x - 1,
          );
        }
        const copy = card.locator(".birthday-card-copy");
        expect(
          await copy.evaluate((n) => n.scrollWidth <= n.clientWidth + 1),
        ).toBe(true);
      }
    }
    await expectInside(
      page.locator(".calendar-art"),
      page.locator(".target-month"),
    );
    await expect(page.locator(".calendar-result")).toHaveCSS("opacity", "1");
  }
});

test("historical photos get a large portrait frame and release space for the final dates", async ({
  page,
}) => {
  for (const [width, height, minPhotoWidth] of [
    [1440, 1000, 230],
    [390, 844, 170],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await scrollScene(page, ".calendar-scene", 0.14);
    const photo = await page.locator('[data-photo-slot="23"]').boundingBox();
    expect(photo.width).toBeGreaterThan(minPhotoWidth);
    expect(Math.abs(photo.width / photo.height - 3 / 4)).toBeLessThan(0.005);
    expect(
      await page.locator(".calendar-result").evaluate((n) => n.clientHeight),
    ).toBe(0);
    await scrollScene(page, ".calendar-scene", 0.98);
    await expect(page.locator(".calendar-result")).toHaveCSS("opacity", "1");
    expect(
      await page.locator(".calendar-result").evaluate((n) => n.clientHeight),
    ).toBeGreaterThan(60);
    await scrollScene(page, ".calendar-scene", 0.14);
    await expect
      .poll(
        async () =>
          (await page.locator('[data-photo-slot="23"]').boundingBox()).width,
      )
      .toBeGreaterThan(minPhotoWidth);
    await expectInside(
      page.locator(".calendar-art"),
      page.locator('[data-gift-card="23"]'),
    );
  }
});

test("supplied portraits load in their correct cards without cropping, including reverse and static views", async ({
  page,
}) => {
  test.setTimeout(60000);
  const photos = [
    [23, 0.14, "niza", 768, 1024],
    [24, 0.28, "londres", 768, 1024],
    [25, 0.36, "islandia", 1536, 2048],
    [26, 0.44, "dolomitas", 768, 1024],
    [27, 0.54, "florencia", 768, 1024],
  ];
  for (const [width, height] of [
    [1440, 1000],
    [390, 844],
    [320, 700],
    [1000, 650],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    for (const [age, p, file, naturalWidth, naturalHeight] of photos) {
      await scrollScene(page, ".calendar-scene", p);
      const img = page.locator(`[data-photo-slot="${age}"] img`);
      await expect(img).toHaveAttribute("src", `/images/${file}.jpeg`);
      await expect
        .poll(() => img.evaluate((n) => n.complete && n.naturalWidth))
        .toBe(naturalWidth);
      expect(await img.evaluate((n) => n.naturalHeight)).toBe(naturalHeight);
      await expect(img).toHaveCSS("object-fit", "contain");
      const rect = await img.boundingBox();
      expect(
        Math.abs(rect.width / rect.height - naturalWidth / naturalHeight),
      ).toBeLessThan(0.005);
      await expectInside(page.locator(`[data-gift-card="${age}"]`), img);
    }
    await scrollScene(page, ".calendar-scene", 0.98);
    await scrollScene(page, ".calendar-scene", 0.14);
    await expect
      .poll(() =>
        page
          .locator('[data-photo-slot="23"] img')
          .evaluate((n) => n.complete && n.naturalWidth),
      )
      .toBe(768);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".birthday-gallery img")).toHaveCount(5);
  for (const img of await page.locator(".birthday-gallery img").all()) {
    await expect
      .poll(() =>
        img.evaluate((n) => n.complete && n.naturalHeight > n.naturalWidth),
      )
      .toBe(true);
    await expect(img).toHaveCSS("object-fit", "contain");
  }
});

test("static chronology retains five portraits, a typographic future card and the ten ordinary trips", async ({
  page,
}) => {
  for (const [width, height, reduced] of [
    [844, 390, false],
    [390, 844, true],
  ]) {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({
      reducedMotion: reduced ? "reduce" : "no-preference",
    });
    await page.goto("/");
    await expect(page.locator(".calendar-scene")).toHaveClass(/reduced-scene/);
    await expect(page.locator(".birthday-gallery figure")).toHaveCount(5);
    await expect(page.locator(".other-trips li")).toHaveCount(10);
    for (const age of [23, 24, 25, 26, 27])
      await expect(
        page.locator(`[data-static-photo-slot="${age}"]`),
      ).toContainText(`Sofi ${age}`);
    await expect(page.locator('[data-photo-slot="28"]')).toHaveCount(0);
    const history = await page
      .locator(".timeline-static-history")
      .boundingBox();
    const final = await page.locator(".calendar-art").boundingBox();
    expect(history.y + history.height).toBeLessThanOrEqual(final.y);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("map provenance and downloadable source data preserve the approximate location claim", async ({
  page,
}) => {
  await page.goto("/");
  await scrollScene(page, ".journey-scene", 0.99);
  await page.getByRole("button", { name: "Datos y precisión" }).click();
  await expect(
    page.getByRole("dialog", { name: "Sobre este mapa." }),
  ).toContainText("no identifica un edificio confirmado");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Descargar datos cartográficos" })
    .click();
  const data = JSON.parse(
    await readFile(await (await download).path(), "utf8"),
  );
  expect(data.source.license).toBe("ODbL-1.0");
  expect(data.features.length).toBeGreaterThan(1000);
  expect(data.reference.coordinates).toEqual([16.39508, 48.20926]);
  expect(data.reference.isExactLocation).toBe(false);
  expect(data.reference.uncertaintyMeters).toBeNull();
  await page.keyboard.press("Escape");
  await expect(page.locator(".stay-caption")).toContainText(
    "referencia aproximada",
  );
  await expect(page.locator(".summary-grid")).toContainText(
    "Referencia aproximada",
  );
});

test("opera reveals the programme before complete ticket information", async ({
  page,
}) => {
  for (const [width, height] of [
    [1440, 1000],
    [390, 844],
    [320, 700],
    [1000, 650],
    [390, 620],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const staticMode = await page
      .locator(".opera-scene")
      .evaluate((n) => n.classList.contains("reduced-scene"));
    if (!staticMode) {
      await scrollScene(page, ".opera-scene", 0.7);
      await expect(page.locator(".opera-programme")).toHaveCSS("opacity", "0");
    }
    await scrollScene(page, ".opera-scene", 0.98);
    await expect(page.locator(".opera-programme")).toHaveCSS("opacity", "1");
    await expect(page.locator(".opera-programme h2")).toHaveText(
      "LivingLegacies.",
    );
    await expect(page.locator(".opera-ticket-date")).toContainText("19:00");
    await expect(page.locator(".opera-ticket-date")).toContainText(
      "enero de 2027",
    );
    await expect(page.locator(".opera-ticket-seat")).toContainText("23 + 24");
    const box = await page.locator(".opera-programme").boundingBox();
    const heading = await page.locator(".opera-programme h2").boundingBox();
    expect(heading.x + heading.width).toBeLessThanOrEqual(width);
    if (!staticMode) expect(box.height).toBeLessThanOrEqual(height);
  }
});

test("horizontal city cards remain reachable on mobile and intermediate viewport widths", async ({
  page,
}) => {
  for (const width of [390, 844, 1000]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await page.locator("#ciudad").scrollIntoViewIfNeeded();
    await finishReveals(page);
    const next = page
      .locator("#ciudad")
      .getByRole("button", { name: "Ver elementos siguientes" });
    await expect(next).toBeVisible();
    await next.click();
    await expect
      .poll(() => page.locator(".city-rail").evaluate((n) => n.scrollLeft))
      .toBeGreaterThan(50);
    await page.locator(".city-rail").focus();
    await page.keyboard.press("End");
    await expect
      .poll(async () => {
        const rail = await page.locator(".city-rail").boundingBox(),
          last = await page.locator(".city-card").last().boundingBox();
        return last.x + last.width <= rail.x + rail.width + 1;
      })
      .toBe(true);
  }
});

test("stable full-flow screens have no serious or critical accessibility violations", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto("/");
  await walkPage(page);
  for (const [selector, p] of [
    [".calendar-scene", 0.98],
    [".journey-scene", 0.98],
    [".opera-scene", 0.98],
  ]) {
    await scrollScene(page, selector, p);
    await finishReveals(page);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(
      serious.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          details: n.failureSummary,
        })),
      })),
    ).toEqual([]);
  }
});

test("orientation changes preserve the accommodation chapter and visible reference pin", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await scrollScene(page, ".journey-scene", 0.9);
  await expect(page.locator(".journey-scene")).toHaveAttribute(
    "data-journey-phase",
    "stay",
  );
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator(".journey-scene")).toHaveClass(/static-journey/);
  await expect
    .poll(() =>
      page.getByTestId("stay-pin").evaluate((n) => {
        const r = n.getBoundingClientRect();
        return r.top >= 68 && r.bottom <= innerHeight;
      }),
    )
    .toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".journey-scene")).not.toHaveClass(
    /static-journey/,
  );
  await expect(page.locator(".journey-scene")).toHaveAttribute(
    "data-journey-phase",
    "stay",
  );
  await expect
    .poll(() =>
      page.getByTestId("stay-pin").evaluate((n) => {
        const r = n.getBoundingClientRect();
        return r.top >= 60 && r.bottom <= innerHeight;
      }),
    )
    .toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".journey-scene")).toHaveClass(/static-journey/);
  await expect
    .poll(() =>
      page.getByTestId("stay-pin").evaluate((n) => {
        const r = n.getBoundingClientRect();
        return r.top >= 60 && r.bottom <= innerHeight;
      }),
    )
    .toBe(true);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".journey-scene")).not.toHaveClass(
    /static-journey/,
  );
  await expect(page.locator(".journey-scene")).toHaveAttribute(
    "data-journey-phase",
    "stay",
  );
});

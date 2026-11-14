import { test, expect } from "@playwright/test";
import { scrollScene } from "./helpers.js";

for (const [name, width, height, enter, middle, leave, outside] of [
  ["desktop", 1440, 1000, 0.2, 0.28, 0.36, 0.4],
  ["mobile", 390, 844, 0.25, 0.28, 0.3, 0.34],
  ["narrow", 320, 700, 0.25, 0.28, 0.3, 0.34],
  ["laptop", 1000, 650, 0.22, 0.28, 0.34, 0.38],
]) {
  test(`${name}: a birthday card passes through both edges with its month and keeps its identity`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const card = page.locator('[data-memory-label="Londres"]');
    await scrollScene(page, ".calendar-scene", enter);
    await expect(card).toHaveCount(1);
    await card.evaluate((n) => {
      n.dataset.motionIdentity = "original";
    });
    const positions = [];
    for (const p of [enter, middle, leave, outside, leave, middle, enter]) {
      await scrollScene(page, ".calendar-scene", p);
      await expect(card).toHaveAttribute("data-motion-identity", "original");
      const actual = await card.boundingBox();
      const month = await page
        .locator(".history-month")
        .nth(12)
        .locator("rect")
        .first()
        .boundingBox();
      const art = await page.locator(".calendar-art").boundingBox();
      expect(
        Math.abs(actual.x + actual.width / 2 - month.x - month.width / 2),
      ).toBeLessThan(1);
      positions.push({ p, actual, art });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    const first = positions[0],
      last = positions[2],
      gone = positions[3];
    expect(first.actual.x).toBeLessThan(first.art.x + first.art.width);
    expect(first.actual.x + first.actual.width).toBeGreaterThan(
      first.art.x + first.art.width,
    );
    expect(last.actual.x).toBeLessThan(last.art.x);
    expect(last.actual.x + last.actual.width).toBeGreaterThan(last.art.x);
    expect(gone.actual.x + gone.actual.width).toBeLessThan(gone.art.x);
    await expect(page.locator(".calendar-art")).toHaveCSS("overflow", "hidden");
  });
}

test("zoom opens the same photo and date elements continuously before the horizontal journey", async ({
  page,
}) => {
  test.setTimeout(60000);
  for (const [width, height] of [
    [1440, 1000],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const photo = page.locator('[data-photo-slot="23"]');
    const date = page.locator('[data-gift-card="23"] .birthday-card-date');
    await expect(photo).toHaveCount(1);
    await expect(date).toHaveCount(1);
    await photo.evaluate((n) => {
      n.dataset.zoomIdentity = "same-photo";
    });
    await date.evaluate((n) => {
      n.dataset.zoomIdentity = "same-date";
    });
    await expect
      .poll(() =>
        page
          .locator(".timeline-annotations img")
          .evaluateAll(
            (imgs) =>
              imgs.length === 5 &&
              imgs.every((img) => img.complete && img.naturalWidth > 0),
          ),
      )
      .toBe(true);
    let previousWidth = 0,
      previousDateHeight = 0;
    for (const p of [0, 0.02, 0.04, 0.055, 0.065, 0.075, 0.09, 0.11, 0.14]) {
      await scrollScene(page, ".calendar-scene", p);
      await expect(photo).toHaveAttribute("data-zoom-identity", "same-photo");
      await expect(date).toHaveAttribute("data-zoom-identity", "same-date");
      const photoRect = await photo.boundingBox(),
        dateRect = await date.boundingBox();
      expect(photoRect.width).toBeGreaterThanOrEqual(previousWidth - 0.1);
      expect(dateRect.height).toBeGreaterThanOrEqual(previousDateHeight - 0.1);
      previousWidth = photoRect.width;
      previousDateHeight = dateRect.height;
    }
    for (const p of [0.09, 0.04, 0]) {
      await scrollScene(page, ".calendar-scene", p);
      await expect(photo).toHaveAttribute("data-zoom-identity", "same-photo");
      await expect(date).toHaveAttribute("data-zoom-identity", "same-date");
    }
  }
});

test("calendar and card stay synchronized while the final dates change the available height", async ({
  page,
}) => {
  for (const [width, height] of [
    [1440, 1000],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await scrollScene(page, ".calendar-scene", 0.84);
    for (let i = 0; i < 24; i++) {
      await page.mouse.wheel(0, 24);
      await page.waitForTimeout(25);
      const gap = await page.evaluate(() => {
        const card = document
          .querySelector('[data-gift-card="28"]')
          .getBoundingClientRect();
        const month = document
          .querySelector(".target-month rect")
          .getBoundingClientRect();
        return month.top - card.bottom;
      });
      expect(Math.abs(gap - 16)).toBeLessThan(0.25);
    }
  }
});

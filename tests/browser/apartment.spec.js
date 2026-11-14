import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";
import { geoMercator } from "d3-geo";
import {
  boundsFeature,
  fitCamera,
  transformPoint,
} from "../../src/geography.js";
import { journeyState } from "../../src/motion.js";
import { scrollScene, finishReveals, expectInside } from "./helpers.js";
import listing from "../../src/data/airbnb-listing.json" with { type: "json" };

for (const [name, width, height] of [
  ["desktop", 1440, 1000],
  ["mobile", 390, 844],
  ["narrow", 320, 700],
  ["laptop", 1000, 650],
]) {
  test(
    name +
      ": apartment reveal is reversible, keeps its image and leads to real photo captions",
    async ({ page }, info) => {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      const image = page.locator(".stay-hero-image");
      await expect(image).toHaveAttribute(
        "src",
        width <= 700
          ? "/images/apartment-bedroom-window.jpg"
          : "/images/apartment-bedroom.jpg",
      );
      await image.evaluate((n) => {
        n.dataset.identity = "original-hero";
      });
      let initialClip;
      for (const p of [
        0, 0.15, 0.3, 0.5, 0.75, 0.98, 0.75, 0.5, 0.3, 0.15, 0,
      ]) {
        await scrollScene(page, ".stay-scene", p);
        await expect(image).toHaveAttribute("data-identity", "original-hero");
        const frame = await page.locator(".stay-film").evaluate((n) => ({
          clip: getComputedStyle(n).clipPath,
          opacity: parseFloat(
            getComputedStyle(n).getPropertyValue("--stay-copy"),
          ),
          loaded:
            n.querySelector("img").complete &&
            n.querySelector("img").naturalWidth > 0,
        }));
        expect(frame.loaded).toBe(true);
        expect(frame.clip).not.toContain("NaN");
        if (p === 0) {
          if (initialClip) expect(frame.clip).toBe(initialClip);
          initialClip = frame.clip;
          expect(frame.opacity).toBe(0);
        }
        if (p > 0.75) {
          expect(frame.opacity).toBe(1);
          await expectInside(
            page.locator(".stay-stage"),
            page.locator(".stay-film-copy"),
          );
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
      }
      await scrollScene(page, ".stay-scene", 0.95);
      await page.screenshot({
        path: info.outputPath(name + "-stay-reveal.png"),
      });
      await expect(page.locator(".stay-photo-card")).toHaveCount(4);
      await expect(page.locator(".stay-benefit")).toHaveCount(4);
      await expect(page.locator(".stay-preview, .pending-tag")).toHaveCount(0);
      for (const card of await page.locator(".stay-photo-card").all()) {
        await expect(card.locator("h4")).not.toBeEmpty();
        await expect(card.locator(".stay-card-copy > p")).not.toBeEmpty();
        const img = card.locator("img");
        await expect(img).toHaveCSS("object-fit", "contain");
        expect(
          await img.evaluate((n) => n.complete && n.naturalWidth > 0),
        ).toBe(true);
      }
    },
  );
}

test("apartment gallery reaches every corner, supports keyboard, and restores focus after the photo viewer", async ({
  page,
}) => {
  for (const [width, height] of [
    [1440, 1000],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.locator("#estancia-fotos").scrollIntoViewIfNeeded();
    await finishReveals(page);
    const region = page.getByRole("region", {
      name: "Rincones del apartamento",
    });
    await expect(
      page.getByRole("button", { name: "Ver rincones anteriores" }),
    ).toBeDisabled();
    await region.focus();
    await page.keyboard.press("End");
    await expect
      .poll(() =>
        region.evaluate(
          (n) => n.scrollLeft + n.clientWidth >= n.scrollWidth - 2,
        ),
      )
      .toBe(true);
    await expect(
      page.getByRole("button", { name: "Ver rincones siguientes" }),
    ).toBeDisabled();
    const last = page.locator(".stay-card-image").last();
    await expectInside(region, last, 0);
    await last.click();
    await expect(
      page.getByRole("dialog", { name: "Fotografías del apartamento" }),
    ).toBeVisible();
    await expect(page.locator(".stay-lightbox-title")).toContainText(
      "También, no hacer nada.",
    );
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".stay-lightbox-title")).toContainText(
      "Nuestro ático en Viena.",
    );
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator(".stay-lightbox-title")).toContainText(
      "También, no hacer nada.",
    );
    const y = await page.evaluate(() => scrollY);
    await page.mouse.move(5, 400);
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(60);
    expect(await page.evaluate(() => scrollY)).toBe(y);
    await page.keyboard.press("Escape");
    await expect(last).toBeFocused();
    await region.focus();
    await page.keyboard.press("Home");
    await expect
      .poll(() => region.evaluate((n) => n.scrollLeft))
      .toBeLessThan(2);
    await page.getByRole("button", { name: "Ver rincones siguientes" }).click();
    await expect
      .poll(() => region.evaluate((n) => n.scrollLeft))
      .toBeGreaterThan(50);
  }
});

test("short viewports and reduced motion retain the complete apartment without pinning the scene", async ({
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
    await expect(page.locator(".stay-scene")).toHaveClass(/reduced-scene/);
    await expect(page.locator(".stay-stage")).toHaveCSS("position", "relative");
    await expect(page.locator(".stay-film-copy")).toHaveCSS("opacity", "1");
    await expect(page.locator(".stay-photo-card")).toHaveCount(4);
    await page.locator(".stay-stage").scrollIntoViewIfNeeded();
    await expectInside(
      page.locator(".stay-stage"),
      page.locator(".stay-film-copy"),
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("Vienna pin projects Airbnb's accepted coordinates and no longer draws a street-sized uncertainty circle", async ({
  page,
}) => {
  for (const [width, height] of [
    [1440, 1000],
    [390, 844],
    [320, 700],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await scrollScene(page, ".journey-scene", 0.98);
    await expect(page.getByTestId("stay-location")).toHaveAttribute(
      "data-precision",
      "approximate-listing",
    );
    await expect(page.getByTestId("stay-location")).toHaveAttribute(
      "data-longitude",
      "16.39508",
    );
    await expect(page.getByTestId("stay-location")).toHaveAttribute(
      "data-latitude",
      "48.20926",
    );
    await expect(page.locator(".location-uncertainty")).toHaveCount(0);
    await expect(page.locator(".location-description")).toContainText(
      "Landstraße",
    );
    await expect(page.locator(".real-map-link")).toHaveAttribute(
      "href",
      /mlat=48\.20926&mlon=16\.39508/,
    );
    const geometry = await page.evaluate(() => {
      const svg = document.querySelector(".vienna-map"),
        scene = document.querySelector(".journey-scene"),
        sticky = scene.querySelector(".scene-sticky");
      const matrix = document.querySelector("[data-testid=stay-pin]").getCTM();
      return {
        w: svg.viewBox.baseVal.width,
        h: svg.viewBox.baseVal.height,
        x: matrix.e,
        y: matrix.f,
        p:
          -scene.getBoundingClientRect().top /
          (scene.offsetHeight - sticky.getBoundingClientRect().height),
      };
    });
    const { w, h } = geometry;
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
    const expected = transformPoint(
      from([16.39508, 48.20926]),
      fitCamera(from, to, journeyState(geometry.p).cityZoom),
    );
    expect(
      Math.hypot(expected[0] - geometry.x, expected[1] - geometry.y),
    ).toBeLessThan(1);
  }
});

test("the completed apartment and its photo captions have no serious accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  await scrollScene(page, ".stay-scene", 0.95);
  await page.locator(".stay-benefits").scrollIntoViewIfNeeded();
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await finishReveals(page);
  for (const benefit of await page.locator(".stay-benefit").all())
    await expect(benefit).toHaveCSS("opacity", "1");
  const violations = (
    await new AxeBuilder({ page }).include("#estancia").analyze()
  ).violations.filter((v) => ["serious", "critical"].includes(v.impact));
  expect(
    violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
  for (const photo of listing.photos) {
    const response = await page.request.get("/images/" + photo.filename);
    expect(
      createHash("sha256")
        .update(await response.body())
        .digest("hex"),
    ).toBe(photo.sha256);
  }
});

test("rotating during the apartment reveal preserves the chapter and returns to the same reveal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await scrollScene(page, ".stay-scene", 0.75);
  await page.waitForTimeout(100);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator(".stay-scene")).toHaveClass(/reduced-scene/);
  await expect
    .poll(() =>
      page
        .locator(".stay-stage")
        .evaluate((n) => n.getBoundingClientRect().top),
    )
    .toBeGreaterThan(-200);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".stay-scene")).not.toHaveClass(/reduced-scene/);
  await expect
    .poll(() =>
      page
        .locator(".stay-film-copy")
        .evaluate((n) => Number(getComputedStyle(n).opacity)),
    )
    .toBe(1);
});

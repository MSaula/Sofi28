import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { scrollScene, expectInside } from "./helpers.js";

const decoded = async (page) => {
  await expect
    .poll(() =>
      page
        .locator(".opera-moving-photo img")
        .evaluate((n) => n.dataset.ready === "true"),
    )
    .toBe(true);
};

test("Opera advances and reverses through architecture, complete photographs and the editorial handoff", async ({
  page,
}) => {
  await page.goto("/");
  await decoded(page);
  await page.evaluate(() => document.fonts.ready);
  for (const p of [
    0, 0.16, 0.31, 0.55, 0.7, 0.86, 0.94, 0.98, 0.86, 0.7, 0.55, 0.31, 0,
  ]) {
    await scrollScene(page, ".opera-scene", p);
    await expect
      .poll(() =>
        page
          .locator(".opera-scene")
          .getAttribute("data-opera-progress")
          .then(Number),
      )
      .toBeCloseTo(p, 2);
    if (p <= 0.7)
      await expect(page.locator(".opera-programme")).toHaveCSS("opacity", "0");
    await expect(page.locator(".opera-programme")).toHaveCSS(
      "pointer-events",
      p >= 0.96 ? "auto" : "none",
    );
    if (p === 0)
      await expect(page.locator(".opera-portal")).toHaveCSS("opacity", "0");
    if (p >= 0.96)
      await expect(page.locator(".opera-programme")).toHaveCSS("opacity", "1");
    const actual = await page.locator(".opera-moving-photo").boundingBox();
    expect(actual.width).toBeGreaterThan(0);
    expect(actual.height).toBeGreaterThan(0);
  }
  await expect(page.locator("html")).not.toHaveAttribute("data-opera-chrome");
  const layers = await page.evaluate(() => [
    Number(getComputedStyle(document.querySelector(".opera-programme")).zIndex),
    Number(
      getComputedStyle(document.querySelector(".opera-moving-photo")).zIndex,
    ),
  ]);
  expect(layers[0]).toBeLessThan(layers[1]);
});

for (const [name, width, height] of [
  ["PC", 1440, 1000],
  ["wide PC", 1920, 1080],
  ["laptop", 1280, 800],
  ["short laptop", 1000, 650],
  ["mobile", 390, 844],
]) {
  test(`${name}: the single moving photograph lands exactly in its editorial slot and releases without a jump`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await decoded(page);
    await page.evaluate(() => document.fonts.ready);
    await scrollScene(page, ".opera-scene", 0.98);
    const moving = await page
        .locator("[data-opera-moving-photo]")
        .boundingBox(),
      target = await page.locator("[data-opera-target]").boundingBox();
    for (const k of ["x", "y", "width", "height"])
      expect(Math.abs(moving[k] - target[k]), k).toBeLessThan(1);
    await expectInside(
      page.locator(".opera-stage"),
      page.locator(".opera-programme-copy"),
    );
    await expectInside(
      page.locator(".opera-stage"),
      page.locator(".opera-programme-mosaic"),
    );
    await page.evaluate(() => scrollBy({ top: 240, behavior: "instant" }));
    await page.waitForTimeout(60);
    const after = await page.locator("[data-opera-moving-photo]").boundingBox(),
      slot = await page.locator("[data-opera-target]").boundingBox();
    for (const k of ["x", "y", "width", "height"])
      expect(Math.abs(after[k] - slot[k]), k).toBeLessThan(1);
    expect(after.width).toBeCloseTo(moving.width, 1);
    await scrollScene(page, ".opera-scene", 0.7);
    const quality = await page
      .locator(".opera-moving-photo img,.opera-portal>img,.opera-ensemble>img")
      .evaluateAll((nodes) =>
        nodes.map((i) => {
          let b = i.getBoundingClientRect(),
            s = getComputedStyle(i);
          return {
            fit: s.objectFit,
            scale: Math.min(
              (b.width -
                parseFloat(s.paddingLeft) -
                parseFloat(s.paddingRight)) /
                i.naturalWidth,
              (b.height -
                parseFloat(s.paddingTop) -
                parseFloat(s.paddingBottom)) /
                i.naturalHeight,
            ),
          };
        }),
      );
    for (const p of quality) {
      expect(p.fit).toBe("contain");
      expect(p.scale).toBeLessThanOrEqual(1);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  });
}

test("a delayed final photograph leaves the preceding image visible until decoding completes", async ({
  page,
}) => {
  let release;
  const held = new Promise((r) => (release = r));
  await page.route("**/images/opera-jump.jpg", async (route) => {
    await held;
    await route.continue();
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect
    .poll(() =>
      page
        .locator(".opera-ensemble img")
        .evaluate((n) => n.dataset.ready === "true"),
    )
    .toBe(true);
  await scrollScene(page, ".opera-scene", 0.8);
  await expect(page.locator(".opera-dance-layers")).toHaveCSS("opacity", "1");
  await expect(page.locator(".opera-ensemble")).toHaveCSS("opacity", "1");
  await expect(page.locator(".opera-moving-photo")).toHaveCSS("opacity", "0");
  release();
  await decoded(page);
  await expect(page.locator(".opera-moving-photo")).toHaveCSS("opacity", "1");
});

test("the complete map, real box view, programme and shared city map preserve information, focus and scroll", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator("#ballet-detalles")
    .evaluate((n) => n.scrollIntoView({ behavior: "instant" }));
  await expect(page.locator(".opera-tickets [data-opera-seat]")).toHaveCount(
    1753,
  );
  await expect(page.locator(".opera-tickets [data-selected=true]")).toHaveCount(
    2,
  );
  await expect(
    page.locator(".opera-tickets [data-selected=true]").first(),
  ).toHaveAttribute("cx", "4211");
  const trigger = page.getByRole("button", {
    name: /Ver la vista desde Mittelloge/,
  });
  await trigger.click();
  await expect(page.locator(".opera-viewer")).toBeVisible();
  await expect(page.locator(".opera-viewer")).toContainText(
    "no es una simulación exacta",
  );
  await expect
    .poll(() =>
      page.locator(".opera-viewer img").evaluate((i) => i.naturalWidth),
    )
    .toBe(5300);
  await expect(page.locator(".opera-viewer img")).toHaveCSS(
    "object-fit",
    "contain",
  );
  const y = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(70);
  expect(await page.evaluate(() => scrollY)).toBe(y);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  const map = page.getByRole("button", {
    name: "Ampliar plano completo de butacas",
  });
  await map.click();
  await expect(page.locator(".opera-viewer [data-opera-seat]")).toHaveCount(
    1753,
  );
  await page.keyboard.press("Escape");
  await expect(map).toBeFocused();
  await page.locator(".opera-programme-details summary").click();
  await expect(page.locator(".opera-piece-grid article")).toHaveCount(3);
  await expect(page.locator(".opera-programme-duration")).toContainText(
    "dos entreactos",
  );
  const city = page.getByRole("button", { name: "Cómo llegar a la Ópera" });
  await city.click();
  const explorer = page.getByRole("dialog", { name: "Viena, a pie." });
  await expect(explorer).toBeVisible();
  await expect(explorer.getByTestId("vienna-place-card")).toHaveAttribute(
    "data-place-id",
    "staatsoper",
  );
  await page.setViewportSize({ width: 1000, height: 650 });
  await page.waitForTimeout(150);
  await page.keyboard.press("Escape");
  await expect(city).toBeFocused();
  expect((await page.locator("#ballet-detalles").boundingBox()).y).toBeLessThan(
    150,
  );
});

test("small, landscape and reduced motion views keep the entire chapter in normal readable flow", async ({
  page,
}) => {
  for (const [width, height, reduced] of [
    [320, 700, false],
    [390, 620, false],
    [844, 390, false],
    [390, 844, true],
  ]) {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({
      reducedMotion: reduced ? "reduce" : "no-preference",
    });
    await page.goto("/");
    await expect(page.locator(".opera-scene")).toHaveClass(/reduced-scene/);
    await expect(page.locator(".opera-stage")).toHaveCSS(
      "position",
      "relative",
    );
    await page.locator(".opera-programme-copy").scrollIntoViewIfNeeded();
    await expect(page.locator(".opera-programme")).toHaveCSS("opacity", "1");
    await expect(page.locator(".opera-programme h2")).toHaveText(
      "LivingLegacies.",
    );
    const box = await page.locator(".opera-programme-copy").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    await page
      .getByRole("button", { name: /Ver la vista desde Mittelloge/ })
      .click();
    await expectInside(
      page.locator(".opera-viewer"),
      page.getByRole("button", { name: "Cerrar imagen de la Ópera" }),
    );
    await page.keyboard.press("Escape");
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
});

test("Opera header, menu, programme, tickets and photograph dialog have no serious accessibility findings", async ({
  page,
}) => {
  await page.goto("/");
  await decoded(page);
  await scrollScene(page, ".opera-scene", 0.98);
  const check = async () =>
    expect(
      (await new AxeBuilder({ page }).analyze()).violations
        .filter((v) => ["serious", "critical"].includes(v.impact))
        .map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  await check();
  await page.getByRole("button", { name: "Abrir el recorrido" }).click();
  await check();
  await page.keyboard.press("Escape");
  await page
    .locator("#ballet-detalles")
    .evaluate((n) => n.scrollIntoView({ behavior: "instant" }));
  await check();
  await page
    .getByRole("button", { name: /Ver la vista desde Mittelloge/ })
    .click();
  await check();
  await page.keyboard.press("Escape");
  await page
    .locator("#resumen")
    .evaluate((n) => n.scrollIntoView({ behavior: "instant" }));
  await expect(page.locator("html")).not.toHaveAttribute("data-opera-chrome");
});

test("closing an editorial photograph after changing between cinematic and static layouts returns to that photograph", async ({
  page,
}) => {
  await page.goto("/");
  await decoded(page);
  await scrollScene(page, ".opera-scene", 0.98);
  const button = page.getByRole("button", {
    name: "Ampliar Divertimento No. 15",
    exact: true,
  });
  for (const [width, height, staticMode] of [
    [320, 700, true],
    [1440, 1000, false],
  ]) {
    await button.click();
    await expect(page.locator(".opera-viewer")).toBeVisible();
    await page.setViewportSize({ width, height });
    if (staticMode)
      await expect(page.locator(".opera-scene")).toHaveClass(/reduced-scene/);
    else
      await expect(page.locator(".opera-scene")).not.toHaveClass(
        /reduced-scene/,
      );
    await page.keyboard.press("Escape");
    await expect(button).toBeFocused();
    await expect
      .poll(async () => {
        const b = await button.boundingBox();
        return b.y >= 0 && b.y + b.height <= height;
      })
      .toBe(true);
    if (!staticMode)
      await expect
        .poll(() =>
          page
            .locator(".opera-scene")
            .getAttribute("data-opera-progress")
            .then(Number),
        )
        .toBeCloseTo(0.98, 2);
  }
});

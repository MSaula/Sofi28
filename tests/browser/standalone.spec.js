import { test, expect } from "@playwright/test";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { scrollScene } from "./helpers.js";
import { memories } from "../../src/content.js";
import listing from "../../src/data/airbnb-listing.json" with { type: "json" };
import { createHash } from "node:crypto";

test("exported HTML runs without server or network, with assets, animation and calendar", async ({
  page,
  context,
}) => {
  const requests = [];
  const errors = [];
  page.on("request", (request) => {
    if (/^https?:/.test(request.url())) requests.push(request.url());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await context.setOffline(true);
  // Managed Chromium blocks file:// navigation. Load our generated document
  // directly rather than disabling the browser's administrator policy.
  await page.setContent(
    await readFile(resolve("dist-standalone/index.html"), "utf8"),
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Hoy cumples 28 años.",
  );
  await expect(page).toHaveTitle("Sofi 28");

  const seenPhotos = new Set();
  for (const p of [0.14, 0.28, 0.36, 0.44, 0.54]) {
    await scrollScene(page, ".calendar-scene", p);
    for (const photo of await page.locator("[data-photo-slot] img").all()) {
      await expect
        .poll(() =>
          photo.evaluate((img) => img.complete && img.naturalWidth > 0),
        )
        .toBe(true);
      expect(await photo.getAttribute("src")).toMatch(/^data:image\//);
      const age = await photo.locator("..").getAttribute("data-photo-slot");
      const gift = memories.find((m) => m.birthdayAge === Number(age));
      const original = await readFile(
        resolve("public", gift.photo.src.slice(1)),
      );
      const embedded = Buffer.from(
        (await photo.getAttribute("src")).split(",")[1],
        "base64",
      );
      const hash = (data) => createHash("sha256").update(data).digest("hex");
      expect(hash(embedded)).toBe(hash(original));
      seenPhotos.add(age);
    }
  }
  expect(seenPhotos.size).toBe(
    memories.filter((m) => m.birthdayAge && m.photo).length,
  );

  await scrollScene(page, ".stay-scene", 0.95);
  await expect(page.locator(".stay-film-copy")).toHaveCSS("opacity", "1");
  await expect(page.locator(".stay-photo-card")).toHaveCount(4);
  const apartmentUris = await page
    .locator("#estancia img")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("src")));
  for (const photo of listing.photos) {
    expect(
      apartmentUris.some(
        (uri) =>
          uri.startsWith("data:image/") &&
          createHash("sha256")
            .update(Buffer.from(uri.split(",")[1], "base64"))
            .digest("hex") === photo.sha256,
      ),
    ).toBe(true);
  }
  await page.locator(".stay-hero-zoom").click();
  await expect(
    page.getByRole("dialog", { name: "Fotografías del apartamento" }),
  ).toBeVisible();
  await page.keyboard.press("ArrowRight");
  expect(
    await page
      .locator(".stay-lightbox-image img")
      .evaluate((img) => img.complete && img.naturalWidth > 0),
  ).toBe(true);
  await page.keyboard.press("Escape");

  for (const [selector, p] of [
    [".calendar-scene", 0.96],
    [".journey-scene", 0.5],
    [".journey-scene", 0.98],
    [".opera-scene", 0.9],
  ]) {
    await scrollScene(page, selector, p);
    if (selector === ".calendar-scene") {
      await expect(page.locator(".calendar-result")).toHaveCSS("opacity", "1");
      await expect(page.locator('[data-gift-card="28"]')).toContainText(
        "Sofi 28",
      );
      await expect(page.locator('[data-photo-slot="28"]')).toHaveCount(0);
    }
    if (selector === ".journey-scene" && p < 0.6)
      await expect(page.locator(".journey-flight-description")).toContainText(
        "Barcelona",
      );
    if (selector === ".journey-scene" && p > 0.9) {
      await expect(page.getByTestId("stay-location")).toHaveCSS("opacity", "1");
      await expect(page.getByTestId("stay-location")).toHaveAttribute(
        "data-precision",
        "approximate-listing",
      );
      await expect(page.locator(".real-street-network")).toHaveAttribute(
        "data-source-commit",
        "734333a5f858729a6bc227c2f8dae742af050d25",
      );
      await page.getByRole("button", { name: "Datos y precisión" }).click();
      const dataDownload = page.waitForEvent("download");
      await page
        .getByRole("button", { name: "Descargar datos cartográficos" })
        .click();
      const data = JSON.parse(
        await readFile(await (await dataDownload).path(), "utf8"),
      );
      expect(data.source.license).toBe("ODbL-1.0");
      await page.keyboard.press("Escape");
    }
    if (selector === ".opera-scene")
      await expect(page.locator(".opera-content")).toHaveCSS("opacity", "1");
  }

  const images = await page
    .locator("main img")
    .evaluateAll((nodes) => nodes.map((img) => img.getAttribute("src")));
  expect(images.length).toBeGreaterThan(0);
  expect(images.every((src) => src.startsWith("data:image/"))).toBe(true);
  await expect(
    page.locator("script[src], link[rel=stylesheet][href]"),
  ).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() =>
      [...document.fonts].some(
        (font) => font.family.includes("Inter") && font.status === "loaded",
      ),
    ),
  ).toBe(true);

  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Guardar las fechas", exact: true })
    .click();
  const calendar = await downloadPromise;
  expect(await readFile(await calendar.path(), "utf8")).toContain(
    "DTSTART:20270122T180000Z",
  );
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});

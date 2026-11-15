const { chromium } = require("playwright");
const fs = require("node:fs"),
  path = require("node:path"),
  assert = require("node:assert/strict");
const out = process.env.QA_OUT || path.resolve("artifacts/qa-opera");
fs.mkdirSync(out, { recursive: true });
async function seek(page, p) {
  await page.evaluate((p) => {
    const n = document.querySelector(".opera-scene"),
      s = n.querySelector(".scene-sticky");
    scrollTo({
      top:
        n.getBoundingClientRect().top +
        scrollY +
        (n.classList.contains("reduced-scene")
          ? 0
          : n.offsetHeight - s.clientHeight) *
          p,
      behavior: "instant",
    });
  }, p);
  await page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
}
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const report = {
    browser: browser.version(),
    emulatedViewports: true,
    modes: [],
  };
  try {
    for (const [name, width, height, reduced] of [
      ["desktop", 1440, 1000, false],
      ["wide", 1920, 1080, false],
      ["laptop", 1280, 800, false],
      ["short", 1000, 650, false],
      ["tablet", 768, 700, false],
      ["mobile", 390, 844, false],
      ["narrow", 320, 700, false],
      ["landscape", 844, 390, false],
      ["reduced", 1440, 1000, true],
    ]) {
      const context = await browser.newContext({
        viewport: { width, height },
        reducedMotion: reduced ? "reduce" : "no-preference",
        ...(name === "desktop"
          ? {
              recordVideo: {
                dir: path.join(out, "video"),
                size: { width, height },
              },
            }
          : {}),
      });
      const page = await context.newPage(),
        errors = [],
        badResponses = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("response", (r) => {
        if (r.status() >= 400)
          badResponses.push({ url: r.url(), status: r.status() });
      });
      await page.goto(process.env.QA_URL || "http://127.0.0.1:5173/", {
        waitUntil: "networkidle",
      });
      await page.evaluate(() => document.fonts.ready);
      await page
        .locator("[data-opera-photo]")
        .evaluateAll((imgs) => Promise.all(imgs.map((i) => i.decode())));
      const staticMode = await page
        .locator(".opera-scene")
        .evaluate((n) => n.classList.contains("reduced-scene"));
      if (name === "desktop") {
        await seek(page, 0);
        await page.waitForTimeout(150);
        await page.evaluate(() => {
          window.operaTimes = [];
          window.operaFrames = true;
          let last = performance.now();
          function f(t) {
            if (!window.operaFrames) return;
            window.operaTimes.push(t - last);
            last = t;
            requestAnimationFrame(f);
          }
          requestAnimationFrame(f);
        });
        for (let i = 0; i < 110; i++) {
          await page.mouse.wheel(0, 52);
          await page.waitForTimeout(24);
        }
        for (let i = 0; i < 110; i++) {
          await page.mouse.wheel(0, -52);
          await page.waitForTimeout(24);
        }
        report.wheelTiming = await page.evaluate(() => {
          window.operaFrames = false;
          const a = window.operaTimes.slice(3).sort((a, b) => a - b);
          return {
            samples: a.length,
            median: a[Math.floor(a.length * 0.5)],
            p95: a[Math.floor(a.length * 0.95)],
            max: Math.max(...a),
          };
        });
      }
      const frames = [];
      for (const p of staticMode
        ? [1]
        : [0, 0.16, 0.31, 0.4, 0.55, 0.7, 0.82, 0.88, 0.94, 0.98]) {
        await seek(page, p);
        const state = await page.evaluate(() => {
          const rect = (n) => {
            const b = n.getBoundingClientRect();
            return { x: b.x, y: b.y, width: b.width, height: b.height };
          };
          const n = document.querySelector(".opera-scene");
          return {
            p: Number(n.dataset.operaProgress),
            overflow: document.documentElement.scrollWidth > innerWidth,
            target: rect(n.querySelector("[data-opera-target]")),
            moving: n.querySelector("[data-opera-moving-photo]")
              ? rect(n.querySelector("[data-opera-moving-photo]"))
              : null,
            copy: rect(n.querySelector(".opera-programme-copy")),
            stage: rect(n.querySelector(".opera-stage")),
            photos: [...n.querySelectorAll("[data-opera-photo]")].map((i) => ({
              name: i.dataset.operaPhoto,
              loaded: i.complete && i.naturalWidth > 0,
              width: i.naturalWidth,
              height: i.naturalHeight,
            })),
          };
        });
        assert(!state.overflow, name + " overflow");
        assert(
          state.photos.every((i) => i.loaded),
          name + " missing photo",
        );
        if (!staticMode && p >= 0.94) {
          for (const k of ["x", "y", "width", "height"])
            assert(
              Math.abs(state.target[k] - state.moving[k]) < 1,
              name + " handoff " + k,
            );
          assert(
            state.copy.y >= state.stage.y - 1 &&
              state.copy.y + state.copy.height <=
                state.stage.y + state.stage.height + 1,
            name + " copy exceeds stage",
          );
        }
        await page.screenshot({
          path: path.join(out, `${name}-${Math.round(p * 100)}.png`),
        });
        frames.push(state);
      }
      await page
        .locator("#ballet-detalles")
        .evaluate((n) =>
          n.scrollIntoView({ behavior: "instant", block: "start" }),
        );
      await page.screenshot({ path: path.join(out, `${name}-tickets.png`) });
      if (name === "desktop") {
        await page
          .getByRole("button", { name: "Ampliar plano completo de butacas" })
          .click();
        await page.screenshot({ path: path.join(out, "desktop-map.png") });
        await page.keyboard.press("Escape");
        await page
          .getByRole("button", { name: /Ver la vista desde Mittelloge/ })
          .click();
        await page.screenshot({ path: path.join(out, "desktop-view.png") });
        await page.keyboard.press("Escape");
      }
      assert.deepEqual(errors, []);
      assert.deepEqual(badResponses, []);
      report.modes.push({
        name,
        width,
        height,
        reduced,
        staticMode,
        errors,
        badResponses,
        frames,
      });
      const video = page.video();
      await context.close();
      if (video)
        await video.saveAs(path.join(out, "opera-scroll-desktop.webm"));
    }
    fs.writeFileSync(
      path.join(out, "visual-review.json"),
      JSON.stringify(report, null, 2) + "\n",
    );
    console.log(
      JSON.stringify({
        modes: report.modes.length,
        frames: report.modes.reduce((n, m) => n + m.frames.length, 0),
        wheelTiming: report.wheelTiming,
        errors: report.modes.flatMap((m) => m.errors),
      }),
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

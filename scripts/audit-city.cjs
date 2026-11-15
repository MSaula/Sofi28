const { chromium } = require("playwright");
const fs = require("node:fs"),
  path = require("node:path"),
  assert = require("node:assert/strict");
const out = process.env.QA_OUT || path.resolve("artifacts/qa-city");
fs.mkdirSync(out, { recursive: true });
async function sample(page, p) {
  await page.evaluate((p) => {
    const n = document.querySelector(".city-scene");
    const sticky = n.querySelector(".scene-sticky");
    const d = n.classList.contains("reduced-scene")
      ? 0
      : n.offsetHeight - sticky.getBoundingClientRect().height;
    scrollTo({
      top: n.getBoundingClientRect().top + scrollY + d * p,
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
    executablePath:
      process.env.CHROMIUM_PATH ||
      (fs.existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
    headless: true,
    args: ["--no-sandbox"],
  });
  const report = {
    browser: browser.version(),
    viewportEmulation: true,
    modes: [],
  };
  try {
    for (const [name, width, height, reduced] of [
      ["desktop", 1440, 1000, false],
      ["laptop", 1280, 800, false],
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
                size: { width: 1440, height: 1000 },
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
      const staticMode = reduced || height <= 600;
      const frames = [];
      if (!staticMode) {
        await sample(page, 0);
        await page
          .locator("[data-city-shot] img")
          .evaluateAll(async (imgs) =>
            Promise.all(imgs.map((i) => i.decode())),
          );
        await page.waitForFunction(() =>
          [...document.querySelectorAll("[data-city-shot]")].every(
            (n) => n.dataset.photoReady === "true",
          ),
        );
        if (name === "desktop") {
          await page.evaluate(() => {
            window.cityFrameTimes = [];
            window.cityFrameRunning = true;
            let last = performance.now();
            function frame(now) {
              if (!window.cityFrameRunning) return;
              window.cityFrameTimes.push(now - last);
              last = now;
              requestAnimationFrame(frame);
            }
            requestAnimationFrame(frame);
          });
          for (let i = 0; i < 90; i++) {
            await page.mouse.wheel(0, 68);
            await page.waitForTimeout(18);
          }
          report.frameTimes = await page.evaluate(() => {
            window.cityFrameRunning = false;
            const a = window.cityFrameTimes.slice(3).sort((x, y) => x - y);
            return {
              samples: a.length,
              median: a[Math.floor(a.length * 0.5)],
              p95: a[Math.floor(a.length * 0.95)],
              max: Math.max(...a),
            };
          });
          for (let i = 0; i < 90; i++) {
            await page.mouse.wheel(0, -68);
            await page.waitForTimeout(18);
          }
        }
        for (const p of [
          0.025, 0.15, 0.2, 0.26, 0.37, 0.49, 0.59, 0.72, 0.86, 0.96, 0.995,
        ]) {
          await sample(page, p);
          const state = await page.evaluate(() => ({
            p: Number(
              document.querySelector(".city-scene").dataset.cityProgress,
            ),
            act: Number(document.querySelector(".city-scene").dataset.cityAct),
            overflow: document.documentElement.scrollWidth > innerWidth,
            loaded: [...document.querySelectorAll("[data-city-shot]")].every(
              (n) => n.dataset.photoReady === "true",
            ),
          }));
          assert(!state.overflow && state.loaded, name + " " + p);
          frames.push(state);
          if ([0.15, 0.37, 0.59, 0.86, 0.995].includes(p))
            await page.screenshot({
              path: path.join(out, `${name}-final-${p}.png`),
            });
        }
      } else {
        await page
          .locator(".city-static-stage")
          .evaluate((n) =>
            n.scrollIntoView({ block: "start", behavior: "instant" }),
          );
        await page.screenshot({ path: path.join(out, name + "-static.png") });
      }
      await page
        .locator("#ciudad-lugares")
        .evaluate((n) =>
          n.scrollIntoView({ block: "start", behavior: "instant" }),
        );
      await page.waitForFunction(() =>
        document
          .querySelector(".city-gallery-heading")
          .classList.contains("is-visible"),
      );
      await page.locator(".city-gallery-heading").evaluate(async (n) => {
        for (const a of n.getAnimations({ subtree: true }))
          await a.finished.catch(() => {});
      });
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(out, name + "-collection.png") });
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      assert.deepEqual(errors, []);
      assert.deepEqual(badResponses, []);
      report.modes.push({
        name,
        width,
        height,
        reduced,
        staticMode,
        frames,
        errors,
        badResponses,
      });
      const video = page.video();
      await context.close();
      if (video && name === "desktop")
        await video.saveAs(path.join(out, "city-scroll-desktop.webm"));
    }
    fs.writeFileSync(
      path.join(out, "visual-review.json"),
      JSON.stringify(report, null, 2) + "\n",
    );
    console.log(
      JSON.stringify({
        modes: report.modes.length,
        frames: report.modes.reduce((a, m) => a + m.frames.length, 0),
        frameTimes: report.frameTimes,
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

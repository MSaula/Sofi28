const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const out = process.env.QA_OUT || path.resolve("artifacts/qa-flow");
fs.mkdirSync(out, { recursive: true });
const sample = async (page, selector, p) => {
  await page.evaluate(
    ({ selector, p }) => {
      const el = document.querySelector(selector);
      const distance = el.classList.contains("reduced-scene")
        ? 0
        : el.offsetHeight -
          el.querySelector(".scene-sticky").getBoundingClientRect().height;
      window.scrollTo({
        top: el.getBoundingClientRect().top + scrollY + distance * p,
        behavior: "instant",
      });
    },
    { selector, p },
  );
  await page.waitForTimeout(110);
  return page.evaluate((selector) => {
    const root = document.querySelector(selector);
    const rect = (node) => {
      const b = node.getBoundingClientRect();
      return { x: b.x, y: b.y, w: b.width, h: b.height };
    };
    const opacity = (node) => {
      let o = 1;
      for (let n = node; n && n !== document.body; n = n.parentElement)
        o *= Number(getComputedStyle(n).opacity);
      return o;
    };
    const text = [
      ...root.querySelectorAll(
        "h2, svg text, .birthday-card-copy, .timeline-trip-label, .scene-bottom, .calendar-result, .opera-date",
      ),
    ]
      .map((node) => ({
        text: node.textContent.trim(),
        rect: rect(node),
        opacity: opacity(node),
      }))
      .filter(
        (n) =>
          n.opacity > 0.65 &&
          n.rect.x + n.rect.w > 0 &&
          n.rect.x < innerWidth &&
          n.rect.y + n.rect.h > 0 &&
          n.rect.y < innerHeight,
      );
    return {
      scrollY,
      innerWidth,
      innerHeight,
      sticky: rect(root.querySelector(".scene-sticky")),
      stickyPosition: getComputedStyle(root.querySelector(".scene-sticky"))
        .position,
      sceneStatic: root.classList.contains("reduced-scene"),
      pageWidth: document.documentElement.scrollWidth,
      active: root.dataset.journeyPhase,
      photos: [...root.querySelectorAll("[data-photo-slot]")].map((slot) => {
        const img = slot.querySelector("img");
        return {
          edition: slot.dataset.photoSlot,
          rect: rect(slot),
          opacity: opacity(slot),
          hasImage: Boolean(img),
          loaded: img ? img.complete && img.naturalWidth > 0 : false,
        };
      }),
      text,
    };
  }, selector);
};

(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH ||
      (fs.existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
    headless: true,
    args: ["--no-sandbox"],
  });
  const report = [];
  for (const [name, width, height, reduced] of [
    ["desktop", 1440, 1000, false],
    ["mobile", 390, 844, false],
    ["landscape", 844, 390, false],
    ["reduced", 390, 844, true],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: reduced ? "reduce" : "no-preference",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("https://images.unsplash.com/**", (r) => r.abort());
    await page.goto(process.env.QA_URL || "http://127.0.0.1:5173", {
      waitUntil: "networkidle",
    });
    await page.evaluate(() => {
      window.qaLongTasks = [];
      try {
        new PerformanceObserver((list) =>
          window.qaLongTasks.push(...list.getEntries().map((e) => e.duration)),
        ).observe({ entryTypes: ["longtask"] });
      } catch {}
    });
    // Exercise the complete page with actual wheel events, including all scene boundaries.
    const flow = [];
    for (let i = 0; i < 150; i++) {
      await page.mouse.wheel(0, 260);
      await page.waitForTimeout(25);
      const state = await page.evaluate(() => ({
        y: scrollY,
        max: document.documentElement.scrollHeight - innerHeight,
        chapter: document.querySelector(".header-chapter")?.textContent,
        overflow: document.documentElement.scrollWidth > innerWidth,
      }));
      flow.push(state);
      if (state.y >= state.max - 2) break;
    }
    await page.waitForTimeout(50);
    const flowLongTasks = await page.evaluate(() => window.qaLongTasks.slice());
    const frames = [];
    const captureStages =
      process.env.QA_CAPTURE === "0"
        ? []
        : [
            [".calendar-scene", [0, 0.2, 0.5, 0.65, 0.77, 0.94]],
            [
              ".journey-scene",
              [0.1, 0.21, 0.25, 0.5, 0.66, 0.7, 0.73, 0.8, 0.96],
            ],
            [".opera-scene", [0, 0.2, 0.4, 0.6, 0.85]],
          ];
    for (const [selector, stages] of captureStages) {
      for (const p of stages) {
        const data = await sample(page, selector, p);
        const filename = `${name}-${selector.slice(1)}-${Math.round(p * 100)}.png`;
        await page.screenshot({ path: path.join(out, filename) });
        frames.push({ selector, p, filename, ...data });
      }
    }
    // Reverse traversal and a resize while a scene is active.
    for (const selector of [
      ".opera-scene",
      ".journey-scene",
      ".calendar-scene",
    ])
      await sample(page, selector, 0.4);
    await page.setViewportSize({ width: height, height: width });
    await page.waitForTimeout(200);
    const resized = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    report.push({
      name,
      width,
      height,
      reduced,
      errors,
      flow,
      flowLongTasks,
      frames,
      resized,
      longTasks: await page.evaluate(() => window.qaLongTasks),
    });
    await context.close();
  }
  fs.writeFileSync(
    path.join(out, "flow-report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify(
      report.map((r) => ({
        name: r.name,
        errors: r.errors,
        fullFlowReachedEnd: r.flow.at(-1).y >= r.flow.at(-1).max - 2,
        overflowFrames: r.flow.filter((x) => x.overflow).length,
        flowLongTasks: r.flowLongTasks.length,
        maxFlowLongTask: Math.round(Math.max(0, ...r.flowLongTasks)),
        longTasks: r.longTasks.length,
        maxLongTask: Math.round(Math.max(0, ...r.longTasks)),
        frames: r.frames.length,
      })),
      null,
      2,
    ),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

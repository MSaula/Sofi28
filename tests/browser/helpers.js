import { expect } from "@playwright/test";

export async function scrollScene(page, selector, p) {
  await page.evaluate(
    ({ selector, p }) => {
      const el = document.querySelector(selector),
        sticky = el.querySelector(".scene-sticky");
      const distance = el.classList.contains("reduced-scene")
        ? 0
        : el.offsetHeight - sticky.getBoundingClientRect().height;
      window.scrollTo({
        top: el.getBoundingClientRect().top + scrollY + distance * p,
        behavior: "instant",
      });
    },
    { selector, p },
  );
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

export async function expectInside(container, element, padding = 0) {
  const a = await container.boundingBox(),
    b = await element.boundingBox();
  expect(a).not.toBeNull();
  expect(b).not.toBeNull();
  expect(b.x).toBeGreaterThanOrEqual(a.x + padding - 1);
  expect(b.y).toBeGreaterThanOrEqual(a.y + padding - 1);
  expect(b.x + b.width).toBeLessThanOrEqual(a.x + a.width - padding + 1);
  expect(b.y + b.height).toBeLessThanOrEqual(a.y + a.height - padding + 1);
}

export async function finishReveals(page) {
  await page.evaluate(async () => {
    const animations = document.getAnimations();
    await Promise.all(
      animations.map((animation) => animation.finished.catch(() => {})),
    );
  });
}

export async function walkPage(page) {
  const frames = [];
  for (let i = 0; i < 150; i++) {
    await page.mouse.wheel(0, 280);
    await page.waitForTimeout(20);
    const frame = await page.evaluate(() => ({
      y: scrollY,
      max: document.documentElement.scrollHeight - innerHeight,
      width: innerWidth,
      pageWidth: document.documentElement.scrollWidth,
    }));
    frames.push(frame);
    expect(frame.pageWidth).toBeLessThanOrEqual(frame.width);
    if (frame.y >= frame.max - 2) break;
  }
  expect(frames.at(-1).y).toBeGreaterThanOrEqual(frames.at(-1).max - 2);
  await finishReveals(page);
  return frames;
}

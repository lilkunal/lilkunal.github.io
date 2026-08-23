const { test, expect } = require("@playwright/test");

const PAGES = ["/", "/work/", "/portfolios/", "/resume/"];
const SIZES = [
  { name: "phone", width: 390, height: 844 },
  { name: "small phone", width: 320, height: 568 },
  { name: "tablet", width: 768, height: 1024 },
];

test.describe("Kunal hire site — device fit", () => {
  for (const size of SIZES) {
    for (const path of PAGES) {
      test(`${path} does not overflow sideways on ${size.name}`, async ({ page }) => {
        await page.setViewportSize({ width: size.width, height: size.height });
        await page.goto(path);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow).toBeLessThanOrEqual(1);
      });
    }
  }

  test("Home nav mark is one logo, not two stacked", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const stacked = await page.evaluate(() => {
      const logo = document.querySelector(".nav__logo");
      const draw = document.querySelector(".nav__logo-draw");
      if (!logo || !draw) return false;
      const drawStyle = getComputedStyle(draw);
      if (drawStyle.display === "none" || drawStyle.opacity === "0" || drawStyle.visibility === "hidden") {
        return false;
      }
      const a = logo.getBoundingClientRect();
      const b = draw.getBoundingClientRect();
      return Math.abs(a.top - b.top) > 8;
    });
    expect(stacked).toBe(false);
  });

  test("Phone menu button is at least 44px tall", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const burger = page.locator(".nav__burger");
    await expect(burger).toBeVisible();
    const box = await burger.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
  });
});

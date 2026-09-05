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

  test("Home nav mark is the guy drawing, not the old robot face", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator(".nav__logo")).toHaveAttribute("src", /kunal-mark\.jpg$/);
    await expect(page.locator(".nav__logo-draw")).toHaveCount(0);
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

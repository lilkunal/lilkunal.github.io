const { test, expect } = require("@playwright/test");

// The whole reason the demo lives behind a button: no visitor should pay for
// three.js or the character unless they ask. If this test fails, the page has
// quietly become expensive and the claim on the resume stops being true.
test.describe("Kunal hire site — lab", () => {
  const heavy = /three\.(module|core)\.min\.js|GLTFLoader\.js|BufferGeometryUtils\.js|\.glb$/i;

  test("nothing 3D downloads until the demo is started", async ({ page }) => {
    const loaded = [];
    page.on("response", (r) => {
      const name = new URL(r.url()).pathname;
      if (heavy.test(name)) loaded.push(name);
    });

    await page.goto("/lab/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForTimeout(1200);
    expect(loaded).toEqual([]);

    // Controls must stay hidden too — `display: grid` can override [hidden].
    await expect(page.locator("#panel")).toBeHidden();
  });

  test("starting the demo renders a canvas and reveals the controls", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));

    await page.goto("/lab/");
    await page.click("#start");
    await expect(page.locator("#stage canvas")).toBeVisible({ timeout: 25000 });
    await expect(page.locator("#panel")).toBeVisible();
    await expect(page.locator("#start")).toBeHidden();

    // Every animation control should be wired to a clip.
    await page.click('button[data-action="Running"]');
    await expect(page.locator('button[data-action="Running"]')).toHaveAttribute("aria-pressed", "true");

    expect(errors).toEqual([]);
  });

  test("every page links to the lab", async ({ page }) => {
    for (const path of ["/", "/work/", "/portfolios/", "/gaming/"]) {
      await page.goto(path);
      await expect(page.locator(".nav__links").getByRole("link", { name: "Lab" })).toHaveCount(1);
    }
  });

  test("the service worker does not precache the 3D assets", async ({ request }) => {
    const sw = await (await request.get("/sw.js")).text();
    expect(sw).toContain('"./lab/index.html"');
    expect(sw).not.toMatch(/three\.(module|core)/);
    expect(sw).not.toMatch(/\.glb/);
  });
});

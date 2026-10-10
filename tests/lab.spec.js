const { test, expect } = require("@playwright/test");

// /lab/ is unlisted on purpose: it works at its URL but is not linked, not in
// the sitemap and carries a noindex. These tests hold both halves of that —
// it stays reachable, and it stays private.
test.describe("Kunal hire site — lab", () => {
  const heavy = /three\.(module|core)\.min\.js|GLTFLoader\.js|DRACOLoader\.js|draco_|\.glb$/i;

  test("the page is unlisted: no links, no sitemap entry, noindex", async ({ page, request }) => {
    for (const path of ["/", "/work/", "/portfolios/", "/gaming/"]) {
      await page.goto(path);
      await expect(page.locator(".nav__links").getByRole("link", { name: "Lab" })).toHaveCount(0);
    }

    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("/lab/");

    await page.goto("/lab/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("nothing 3D downloads until a demo is started", async ({ page }) => {
    const loaded = [];
    page.on("response", (r) => {
      const name = new URL(r.url()).pathname;
      if (heavy.test(name)) loaded.push(name);
    });

    await page.goto("/lab/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForTimeout(1200);
    expect(loaded).toEqual([]);
    await expect(page.locator("#panel")).toBeHidden();
    await expect(page.locator("#tabs")).toBeHidden();
  });

  test("all three demos load and the mouse orbits the camera", async ({ page }) => {
    test.setTimeout(120000);   // 2.8 MB of Xbot plus the DRACO decoder
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));

    await page.goto("/lab/");
    await page.click("#start");
    await expect(page.locator("#stage canvas")).toBeVisible({ timeout: 30000 });
    await expect(page.locator("#tabs")).toBeVisible();
    await page.waitForTimeout(2000);

    // Dragging must actually move the camera — OrbitControls wired to the canvas.
    const box = await page.locator("#stage").boundingBox();
    const before = await page.screenshot({ clip: box });
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 180, box.y + box.height / 2 + 30, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(800);
    expect((await page.screenshot({ clip: box })).equals(before)).toBe(false);

    for (const demo of ["additive", "ik"]) {
      await page.click(`button[data-demo="${demo}"]`);
      // The status line clears only once the model is in the scene.
      await expect(page.locator("#status")).toHaveText("", { timeout: 60000 });
      await expect(page.locator(".lab-group")).not.toHaveCount(0);
      await expect(page.locator("#stage canvas")).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test("the service worker does not precache the 3D assets or the page", async ({ request }) => {
    const sw = await (await request.get("/sw.js")).text();
    expect(sw).not.toMatch(/three\.(module|core)/);
    expect(sw).not.toMatch(/\.glb/);
    expect(sw).not.toContain('"./lab/');
  });
});

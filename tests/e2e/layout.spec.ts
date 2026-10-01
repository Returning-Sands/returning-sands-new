import { expect, test } from "@playwright/test";

import { INDEXABLE_ROUTES, NOINDEX_ROUTES } from "@/lib/routes";

// Layout behaviour across every route (Req 1.9, 15.11, 19.8, 13.11).

const ALL_PATHS: readonly string[] = [
  ...INDEXABLE_ROUTES.map((r) => r.path),
  ...NOINDEX_ROUTES.map((r) => r.path),
  "/this-page-does-not-exist",
];

const NOT_FOUND_HEADING = "VISA DENIED — page not found";

test.describe("320px viewport", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  for (const path of ALL_PATHS) {
    test(`no horizontal scrollbar on ${path}`, async ({ page }) => {
      await page.goto(path);
      const widths = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(widths.scrollWidth, `${path} overflows horizontally at 320px: ${JSON.stringify(widths)}`).toBeLessThanOrEqual(
        widths.clientWidth,
      );
    });
  }
});

test.describe("404", () => {
  test("unknown URL returns HTTP 404 with the VISA DENIED heading inside the full layout", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(NOT_FOUND_HEADING);
    await expect(page.locator('nav[aria-label="Primary"]')).toBeVisible();
    await expect(page.locator('nav[aria-label="Footer"]')).toBeVisible();
  });
});

test.describe("JavaScript disabled", () => {
  // Equivalent to `browser.newContext({ javaScriptEnabled: false })`, scoped to
  // this describe so the fixture handles context lifetime.
  test.use({ javaScriptEnabled: false });

  for (const path of ["/", "/about"]) {
    test(`primary nav links, footer and body text are visible on ${path}`, async ({ page }) => {
      await page.goto(path);

      // The `no-js` hook stays on <html> because the inline script never ran.
      await expect(page.locator("html")).toHaveClass(/no-js/);

      // `.no-js .nav-inline { display: flex }` shows the inline list at every width.
      const navLinks = page.locator('nav[aria-label="Primary"] ul.nav-inline a');
      await expect(navLinks).toHaveCount(6);
      for (const link of await navLinks.all()) {
        await expect(link).toBeVisible();
      }
      await expect(page.locator('nav[aria-label="Primary"] a[href="/donate"]')).toBeVisible();

      await expect(page.locator('nav[aria-label="Footer"]')).toBeVisible();
      // Legal block: the fallback line (or the three company fields) and the © line.
      await expect(page.locator("footer").getByText(/Company details to follow|Company no\./)).toBeVisible();
      await expect(page.locator("footer").getByText(/© \d{4} Returning Sands CIC/)).toBeVisible();

      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const bodyText = await page.locator("main").innerText();
      expect(bodyText.trim().length).toBeGreaterThan(200);
    });
  }
});

test.describe("reduced motion", () => {
  test("`.reveal` and `.stamp-sway` elements have zero transition and animation durations", async ({ page }) => {
    test.slow(); // visits every route in one test
    await page.emulateMedia({ reducedMotion: "reduce" });

    type Sample = { path: string; selector: string; transitionDuration: string; animationDuration: string };
    const samples: Sample[] = [];

    for (const path of ALL_PATHS) {
      await page.goto(path);
      const found = await page.$$eval(".reveal, .reveal-lg, .stamp-sway", (els) =>
        els.map((el) => {
          const cs = getComputedStyle(el);
          return {
            selector: `${el.tagName.toLowerCase()}.${Array.from(el.classList).join(".")}`,
            transitionDuration: cs.transitionDuration,
            animationDuration: cs.animationDuration,
          };
        }),
      );
      samples.push(...found.map((s) => ({ path, ...s })));
    }

    test.skip(samples.length === 0, "no `.reveal` / `.stamp-sway` elements are rendered on any route yet");

    for (const s of samples) {
      // A comma-separated list (one entry per property) must be all zeros.
      const durations = `${s.transitionDuration}, ${s.animationDuration}`.split(",").map((d) => d.trim());
      expect(durations.every((d) => d === "0s"), `${s.path} ${s.selector}: ${durations.join(", ")}`).toBe(true);
    }
  });
});

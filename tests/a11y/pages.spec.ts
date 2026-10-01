import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { INDEXABLE_ROUTES } from "@/lib/routes";

// Accessibility_Check (Req 15.1, 15.2, 15.12, 15.13, 13.12, 13.13, 13.16).
//
// Runs axe-core (WCAG 2.0/2.1 A + AA and WCAG 2.2 AA tag sets) against every
// Page in Requirement 1 plus `/museum/thanks` and the 404, and fails on any
// `serious` or `critical` violation. The failure message lists the page URL,
// rule id, impact, help URL and every affected selector so the GitHub Action
// log is actionable on its own (15.13).
//
// Two image checks axe does not cover are asserted alongside:
//   - no `<img>` inside an `aria-hidden="true"` ancestor carries a non-empty
//     alt (decorative images must stay silent, 13.12);
//   - no `<img alt>` has an alt that is just a file name (13.13).
//
// axe is viewport-agnostic for everything we care about here, so the suite
// runs on the `chromium` project only; the `mobile` project is skipped to
// halve the runtime. Mobile-specific behaviour is covered in tests/e2e.

type Violation = Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"][number];

const PATHS: readonly string[] = [
  ...INDEXABLE_ROUTES.map((r) => r.path),
  "/museum/thanks",
  "/this-page-does-not-exist",
];

const FILE_NAME_ALT = /\.(png|jpe?g|svg|webp)$/i;

/** One readable block per violation: URL, rule, impact, help, and each target. */
export function formatViolations(path: string, violations: Violation[]): string {
  if (violations.length === 0) return "";
  const lines: string[] = [`${violations.length} serious/critical axe violation(s) on ${path}`];
  for (const v of violations) {
    lines.push(`  [${v.impact}] ${v.id} — ${v.help}`);
    lines.push(`    ${v.helpUrl}`);
    for (const node of v.nodes) {
      lines.push(`    - ${node.target.join(" ")}`);
    }
  }
  return lines.join("\n");
}

test.describe("axe accessibility gate", () => {
  for (const path of PATHS) {
    test(`axe: ${path}`, async ({ page }) => {
      test.skip(test.info().project.name === "mobile", "axe runs on the chromium project only");
      await page.goto(path);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
        .analyze();

      const serious = results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""));
      expect(serious, formatViolations(path, serious)).toEqual([]);

      // Req 13.12: decorative images under an aria-hidden wrapper stay silent.
      const exposedDecorative = await page.$$eval('[aria-hidden="true"] img', (imgs) =>
        imgs
          .filter((img) => (img.getAttribute("alt") ?? "").trim() !== "")
          .map((img) => `${img.getAttribute("src")} alt="${img.getAttribute("alt")}"`),
      );
      expect(exposedDecorative, `${path}: decorative images exposing alt text`).toEqual([]);

      // Req 13.13: no alt that is merely a file name.
      const fileNameAlts = await page.$$eval("img[alt]", (imgs) =>
        imgs.map((img) => img.getAttribute("alt") ?? "").filter((alt) => alt.trim() !== ""),
      );
      const offending = fileNameAlts.filter((alt) => FILE_NAME_ALT.test(alt.trim()));
      expect(offending, `${path}: alt text that looks like a file name`).toEqual([]);
    });
  }
});

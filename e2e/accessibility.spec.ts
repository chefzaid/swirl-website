import AxeBuilder from '@axe-core/playwright';
import { devices, expect, test } from '@playwright/test';

// One page per template, alternating languages.
const pages = [
  '/',
  '/en/custom-software-development/',
  '/swirl-cloud/',
  '/en/swirl-cloud/how-it-works/',
  '/swirl-cloud/securite-conformite/',
  '/en/swirl-cloud/sovereignty/',
  '/swirl-cloud/comparatif/',
  '/en/resources/',
  '/ressources/checklist-nis2/',
  '/projets/',
  '/en/projects/engie-electricity-gas-portal/',
  '/confidentialite/',
  '/en/missing-page/',
];
// At phone width, the homepage (hydrated header) and an inner page.
const phonePages = ['/en/', '/swirl-cloud/'];
const { defaultBrowserType: _, ...phone } = devices['Pixel 7'];

for (const [width, paths] of [
  ['desktop', pages],
  ['phone', phonePages],
] as const) {
  for (const theme of ['dark', 'light'] as const) {
    test.describe(`${width}, ${theme} theme`, () => {
      test.use({ reducedMotion: 'reduce', ...(width === 'phone' && phone) });
      test.beforeEach(async ({ page }) => {
        await page.addInitScript((value) => {
          localStorage.setItem('theme', value);
        }, theme);
      });
      for (const path of paths) {
        test(`${path} meets WCAG 2.2 AA`, async ({ page }) => {
          await page.goto(path);
          await expect(page.locator('html')).toHaveAttribute(
            'data-theme',
            theme,
          );
          const { violations } = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
            .analyze();
          expect(
            violations.map(({ id, nodes }) => ({
              id,
              targets: nodes.map((node) => node.target.join(' ')),
            })),
          ).toEqual([]);
        });
      }
    });
  }
}

import { devices, expect, test } from '@playwright/test';

const { defaultBrowserType: _, ...phone } = devices['Pixel 7'];
test.use(phone);

test('the phone menu opens and closes on the homepage', async ({ page }) => {
  await page.goto('/en/');
  // The homepage header hydrates at phone width so links close the menu.
  await expect(page.locator('astro-island:not([ssr]) .header')).toBeAttached();
  const menu = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(menu).toBeHidden();
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(menu).toBeVisible();
  await menu.getByRole('link', { name: 'Projects' }).click();
  await expect(menu).toBeHidden();
  await expect(page).toHaveURL(/#projects$/);
});

test('the phone menu works on inner pages without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    ...phone,
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  await page.goto('/swirl-cloud/');
  await page.getByRole('button', { name: 'Menu' }).click();
  const menu = page.getByRole('navigation', { name: 'Navigation mobile' });
  await expect(menu).toBeVisible();
  await menu.getByRole('link', { name: 'Contact' }).click();
  await expect(page).toHaveURL(/\/#contact$/);
  await context.close();
});

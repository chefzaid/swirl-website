import { expect, test } from '@playwright/test';

test('the language links switch between French and English', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await page.getByRole('link', { name: 'EN – English' }).click();
  await expect(page).toHaveURL('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('link', { name: 'FR – Français' }).click();
  await expect(page).toHaveURL('/');
});

test('the theme choice is kept on other pages', async ({ page }) => {
  await page.goto('/en/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Light mode' }).click();
  await expect(html).toHaveAttribute('data-theme', 'light');
  await page.goto('/en/swirl-cloud/');
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect(
    page.getByRole('button', { name: 'Light mode', pressed: true }),
  ).toBeVisible();
});

test('the chat contacts Odoo only once the visitor opens it', async ({
  page,
}) => {
  const odooRequests: string[] = [];
  // Never reach the production Odoo from tests.
  await page.route('https://odoo.swirlit.dev/**', (route) => {
    odooRequests.push(route.request().url());
    return route.abort();
  });
  await page.goto('/en/swirl-cloud/');
  const launcher = page.getByRole('button', { name: /Chat with us/ });
  await expect(launcher).toBeVisible();
  expect(odooRequests).toEqual([]);
  await launcher.click();
  await expect(page.getByRole('region', { name: 'Live chat' })).toBeVisible();
  await expect(page.locator('iframe.chat-frame')).toHaveAttribute(
    'src',
    'https://odoo.swirlit.dev/platform_crm_intake/chat/1?lang=en&open=1',
  );
  await expect.poll(() => odooRequests.length).toBeGreaterThan(0);
});

test('a printed guide keeps only the article, in light colours', async ({
  page,
}) => {
  await page.emulateMedia({ media: 'print' });
  await page.goto('/en/resources/nis2-checklist/');
  await expect(page.locator('h1')).toBeVisible();
  for (const chrome of ['.header', '.footer', '.chat-launcher'])
    await expect(page.locator(chrome)).toBeHidden();
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
});

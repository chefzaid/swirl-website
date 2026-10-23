import { expect, test, type Page } from '@playwright/test';

// The server rejects forms sent less than two seconds after they appear, so
// the page's clock runs ten seconds behind the server's.
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: Date.now() - 10_000 });
});

async function hydratedForm(page: Page) {
  const form = page.locator('form.contact-form');
  await form.scrollIntoViewIfNeeded();
  await expect(
    page.locator('astro-island:not([ssr]) form.contact-form'),
  ).toBeVisible();
  return form;
}

test('a project inquiry is stored and confirmed', async ({ page }) => {
  await page.goto('/en/#contact');
  const form = await hydratedForm(page);
  await expect(form.getByLabel('A project')).toBeChecked();
  await form.getByLabel('Your name').fill('Ada Lovelace');
  await form.getByLabel('Your email').fill('ada@example.com');
  await form.getByLabel('Subject').fill('Analytical engine');
  await form
    .getByLabel('Tell us about your project')
    .fill('We would like to discuss a new computing project.');
  await form.getByLabel(/I agree/).check();
  await form.getByRole('button', { name: 'Send message' }).click();
  await expect(
    page.getByRole('heading', { name: 'Thank you for reaching out.' }),
  ).toBeVisible();
  await expect(page.getByText('Your message has been saved.')).toBeVisible();
});

test('the product page opens a Swirl Cloud demo request', async ({ page }) => {
  await page.goto('/swirl-cloud/');
  await page
    .getByRole('link', { name: /Demander une démo/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/\?topic=demo#contact$/);
  const form = await hydratedForm(page);
  await expect(form.getByLabel('Une démo Swirl Cloud')).toBeChecked();
  await expect(form.getByLabel('Sujet')).toHaveCount(0);
  await form.getByLabel('Votre nom').fill('Marie Curie');
  await form.getByLabel('Votre e-mail').fill('marie@example.com');
  await form.getByLabel('Votre entreprise').fill('Institut du Radium');
  await form
    .getByLabel('Parlez-nous de votre contexte')
    .fill('Quarante postes, trois applications métier, exigences NIS2.');
  await form.getByLabel(/J’accepte/).check();
  await form.getByRole('button', { name: 'Demander une démo' }).click();
  await expect(
    page.getByRole('heading', { name: 'Merci pour votre message.' }),
  ).toBeVisible();
});

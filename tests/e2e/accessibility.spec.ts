import { expect, test } from '@playwright/test';

test.describe('accessibility smoke checks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const onboarding = page.getByRole('dialog', { name: /welcome|onboarding/i });
    if (await onboarding.isVisible().catch(() => false)) {
      const finish = page.getByRole('button', { name: /get started|finish|continue/i }).last();
      if (await finish.isVisible().catch(() => false)) await finish.click();
    }
  });

  test('provides landmarks, a skip link, and one main heading', async ({ page }) => {
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.locator('.skip-link')).toHaveAttribute('href', '#main-content');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });

  test('interactive controls expose accessible names', async ({ page }) => {
    const unnamedButtons = await page.locator('button').evaluateAll((buttons) =>
      buttons
        .filter((button) => {
          const text = button.textContent?.trim();
          const aria = button.getAttribute('aria-label')?.trim();
          const title = button.getAttribute('title')?.trim();
          return !text && !aria && !title;
        })
        .map((button) => button.outerHTML),
    );
    expect(unnamedButtons).toEqual([]);

    const unlabeledInputs = await page.locator('input:not([type="hidden"])').evaluateAll((inputs) =>
      inputs
        .filter((input) => {
          const id = input.getAttribute('id');
          const hasForLabel = Boolean(id && document.querySelector(`label[for="${CSS.escape(id)}"]`));
          const wrappingLabel = Boolean(input.closest('label'));
          const aria = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
          return !hasForLabel && !wrappingLabel && !aria;
        })
        .map((input) => input.outerHTML),
    );
    expect(unlabeledInputs).toEqual([]);
  });

  test('content images provide alternative text', async ({ page }) => {
    const missingAlt = await page.locator('img').evaluateAll((images) =>
      images.filter((image) => !image.hasAttribute('alt')).map((image) => image.outerHTML),
    );
    expect(missingAlt).toEqual([]);
  });
});

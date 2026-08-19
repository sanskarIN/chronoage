import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function expectNoWcagViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(
    results.violations,
    results.violations
      .map((violation) => `${violation.id}: ${violation.help} (${violation.nodes.length} nodes)`)
      .join('\n'),
  ).toEqual([]);
}

test.describe('accessibility checks', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'chronoage.settings.v1',
        JSON.stringify({ onboardingComplete: true, theme: 'system' }),
      );
    });
    await page.goto('/');
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

  test('advanced date tools retain accessible controls and visualization names', async ({ page }) => {
    await page.getByRole('button', { name: 'Difference' }).click();
    await expect(page.getByLabel('First date')).toBeVisible();
    await expect(page.getByLabel('Second date')).toBeVisible();
    await expect(page.getByRole('img', { name: /years, .* months, and .* days between/ })).toBeVisible();

    await page.getByRole('button', { name: 'Milestones' }).click();
    await expect(page.getByLabel('Amount')).toBeVisible();
    await expect(page.getByLabel('Milestone unit')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Build your own milestone' })).toBeVisible();
  });

  test('content images provide alternative text', async ({ page }) => {
    const missingAlt = await page.locator('img').evaluateAll((images) =>
      images.filter((image) => !image.hasAttribute('alt')).map((image) => image.outerHTML),
    );
    expect(missingAlt).toEqual([]);
  });

  test('passes automated WCAG audits on every core page', async ({ page }) => {
    await expectNoWcagViolations(page);

    for (const name of ['Difference', 'Interval', 'Milestones', 'Profiles', 'Settings', 'About']) {
      await page.getByRole('button', { name }).click();
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expectNoWcagViolations(page);
    }
  });
});

import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'chronoage.settings.v1',
      JSON.stringify({ onboardingComplete: true, theme: 'system' }),
    );
  });
});

test('captures the calculator release-candidate interface', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('chronoage-calculator.png'),
    fullPage: true,
  });
});

test('captures the age-difference visualization', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Difference' }).click();
  await page.getByLabel('First date').fill('2000-01-01');
  await page.getByLabel('Second date').fill('2026-08-19');
  await expect(page.getByRole('heading', { name: 'Calendar duration timeline' })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('chronoage-difference.png'),
    fullPage: true,
  });
});

test('captures the custom milestone builder', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Milestones' }).click();
  await page.getByLabel('Birth date').fill('2000-01-01');
  await page.getByLabel('Amount').fill('10000');
  await expect(page.getByText('10,000 days').first()).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('chronoage-milestones.png'),
    fullPage: true,
  });
});

test('captures the mobile calculator release-candidate interface', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('chronoage-calculator-mobile.png'),
    fullPage: true,
  });
});

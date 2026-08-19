import { expect, test } from '@playwright/test';

test('captures the calculator release-candidate interface', async ({ page }, testInfo) => {
  await page.goto('/');

  const start = page.getByRole('button', { name: 'Start calculating' });
  if (await start.isVisible().catch(() => false)) await start.click();

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('chronoage-calculator.png'),
    fullPage: true,
  });
});

test('captures the mobile calculator release-candidate interface', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const start = page.getByRole('button', { name: 'Start calculating' });
  if (await start.isVisible().catch(() => false)) await start.click();

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('chronoage-calculator-mobile.png'),
    fullPage: true,
  });
});

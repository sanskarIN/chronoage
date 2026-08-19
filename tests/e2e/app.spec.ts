import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('chronoage.settings.v1', JSON.stringify({ onboardingComplete: true, theme: 'system' }));
  });
});

test('primary age calculation flow works', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'How much time has passed?' })).toBeVisible();
  await page.getByLabel('Birth date').fill('2000-01-15');
  await page.getByLabel('Reference date').fill('2026-08-19');
  await expect(page.getByText('26 years old')).toBeVisible();
  await expect(page.getByText('7', { exact: true }).first()).toBeVisible();
});

test('saved profile remains local and can be removed', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Profiles' }).click();
  await page.getByLabel('Name').fill('Example');
  await page.getByLabel('Birth date').fill('2001-02-03');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByText('Example')).toBeVisible();
  await page.getByRole('button', { name: 'Delete Example' }).click();
  await expect(page.getByText('No profiles saved')).toBeVisible();
});

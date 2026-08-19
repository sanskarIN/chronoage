import { expect, test } from '@playwright/test';
import { navigateTo, seedCompletedOnboarding } from './helpers';

test.beforeEach(async ({ page }) => {
  await seedCompletedOnboarding(page);
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
  await navigateTo(page, 'Profiles');
  await page.getByLabel('Name').fill('Example');
  await page.getByLabel('Birth date').fill('2001-02-03');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByText('Example')).toBeVisible();
  await page.getByRole('button', { name: 'Delete Example' }).click();
  await expect(page.getByText('No profiles saved')).toBeVisible();
});

test('saved profile deletion can be undone', async ({ page }) => {
  await page.goto('/');
  await navigateTo(page, 'Profiles');
  await page.getByLabel('Name').fill('Recoverable');
  await page.getByLabel('Birth date').fill('2000-01-01');
  await page.getByRole('button', { name: 'Save profile' }).click();

  await page.getByRole('button', { name: 'Delete Recoverable' }).click();
  await expect(page.getByText('No profiles saved')).toBeVisible();
  await page.getByRole('button', { name: 'Undo delete' }).click();

  await expect(page.getByText('Recoverable')).toBeVisible();
  await expect(page.getByText('Deleted profile restored.')).toBeVisible();
});

test('saved profile can prefill the age calculator', async ({ page }) => {
  await page.goto('/');
  await navigateTo(page, 'Profiles');
  await page.getByLabel('Name').fill('Calculator person');
  await page.getByLabel('Birth date').fill('2004-05-06');
  await page.getByRole('button', { name: 'Save profile' }).click();

  await page.getByRole('button', { name: 'Age: Calculator person' }).click();

  await expect(page.getByRole('heading', { name: 'How much time has passed?' })).toBeVisible();
  await expect(page.getByLabel('Birth date')).toHaveValue('2004-05-06');
});

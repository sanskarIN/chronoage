import { expect, test } from '@playwright/test';
import { seedCompletedOnboarding } from './helpers';

test('refreshes online navigations and reloads offline without HTML asset fallbacks', async ({ page, context }) => {
  await seedCompletedOnboarding(page);
  await page.goto('/');

  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (navigator.serviceWorker.controller) return;

    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(
        () => reject(new Error('Service worker did not take control in time.')),
        5000,
      );
      navigator.serviceWorker.addEventListener(
        'controllerchange',
        () => {
          window.clearTimeout(timeout);
          resolve();
        },
        { once: true },
      );
    });
  });

  await page.reload();
  await expect(page.getByRole('heading', { name: 'How much time has passed?' })).toBeVisible();

  await page.evaluate(async () => {
    const key = (await caches.keys()).find((candidate) => candidate.startsWith('chronoage-'));
    if (!key) throw new Error('ChronoAge cache was not found.');
    const cache = await caches.open(key);
    await cache.put(
      '/',
      new Response('<!doctype html><html><body><h1>Stale cached document</h1></body></html>', {
        headers: { 'Content-Type': 'text/html' },
      }),
    );
  });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'How much time has passed?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Stale cached document' })).toHaveCount(0);

  try {
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'How much time has passed?' })).toBeVisible();

    const missingAssetWasRejected = await page.evaluate(async () => {
      try {
        const response = await fetch('/definitely-missing-chronoage-asset.css');
        return response.status === 0;
      } catch {
        return true;
      }
    });
    expect(missingAssetWasRejected).toBe(true);
  } finally {
    await context.setOffline(false);
  }
});

import type { Page } from '@playwright/test';

export async function seedCompletedOnboarding(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem(
      'chronoage.settings.v1',
      JSON.stringify({ onboardingComplete: true, theme: 'system' }),
    );
  });
}

export async function navigateTo(page: Page, name: string): Promise<void> {
  const destination = page.getByRole('button', { name, exact: true });
  if (!(await destination.isVisible())) {
    const openNavigation = page.getByRole('button', { name: 'Open navigation', exact: true });
    if (await openNavigation.isVisible()) await openNavigation.click();
  }
  await destination.click();
}

import { test, expect } from '@playwright/test';

test.describe('Tests Smoke - Pages principales', () => {
  test('Page d\'accueil charge', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // La page devrait charger sans erreur 500
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toContain('500');
    expect(bodyText).not.toContain('Internal Server Error');
  });

  test('Page login accessible', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    // Devrait avoir un champ email
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
  });

  test('Page platform accessible', async ({ page }) => {
    await page.goto('/platform', { waitUntil: 'networkidle' });
    // Devrait contenir du contenu LAIA
    await expect(page.locator('body')).toContainText(/LAIA|Connect|institut/i, { timeout: 10000 });
  });

  test('Page onboarding accessible', async ({ page }) => {
    const response = await page.goto('/onboarding', { waitUntil: 'networkidle' });
    // Pas d'erreur 500
    expect(response?.status()).toBeLessThan(500);
  });

  test('Navigation existe sur la page d\'accueil', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // Au moins un lien devrait exister
    const links = page.locator('a[href]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});
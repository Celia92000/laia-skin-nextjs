import { test, expect } from '@playwright/test';

test.describe('Tests Smoke - Pages principales', () => {
  test('Page d\'accueil charge sans erreur 500', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'networkidle' });
    // Vérifie que le status HTTP n'est pas une erreur serveur
    expect(response?.status()).toBeLessThan(500);
  });

  test('Page login accessible', async ({ page }) => {
    const response = await page.goto('/login', { waitUntil: 'networkidle' });
    expect(response?.status()).toBeLessThan(500);

    // Le formulaire devrait être présent
    const hasEmailField = await page.locator('input[type="email"]').isVisible({ timeout: 5000 }).catch(() => false);
    const hasPasswordField = await page.locator('input[type="password"]').isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasEmailField || hasPasswordField).toBe(true);
  });

  test('Page platform accessible', async ({ page }) => {
    await page.goto('/platform', { waitUntil: 'networkidle' });
    await expect(page.locator('body')).toContainText(/LAIA|Connect|institut/i, { timeout: 10000 });
  });

  test('Page onboarding accessible', async ({ page }) => {
    const response = await page.goto('/onboarding', { waitUntil: 'networkidle' });
    expect(response?.status()).toBeLessThan(500);
  });

  test('Navigation existe sur la page d\'accueil', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const links = page.locator('a[href]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});

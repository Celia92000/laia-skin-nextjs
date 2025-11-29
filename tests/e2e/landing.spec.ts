import { test, expect } from '@playwright/test';

/**
 * Tests E2E de la landing page LAIA Connect
 * Tests simplifiés pour vérifier l'accessibilité des pages
 */

test.describe('Landing Page LAIA Connect', () => {
  test('Page /platform accessible', async ({ page }) => {
    const response = await page.goto('/platform', { waitUntil: 'networkidle' });
    expect(response?.status()).toBeLessThan(500);

    // La page devrait contenir du contenu
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(100);
  });

  test('Page /platform contient LAIA ou Connect', async ({ page }) => {
    await page.goto('/platform', { waitUntil: 'networkidle' });
    await expect(page.locator('body')).toContainText(/LAIA|Connect|institut/i, { timeout: 10000 });
  });

  test('Des liens existent sur la page', async ({ page }) => {
    await page.goto('/platform', { waitUntil: 'networkidle' });
    const links = page.locator('a[href]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Page se charge en mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const response = await page.goto('/platform', { waitUntil: 'networkidle' });
    expect(response?.status()).toBeLessThan(500);
  });
});

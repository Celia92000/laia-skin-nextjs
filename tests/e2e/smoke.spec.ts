import { test, expect } from '@playwright/test';

test.describe('Tests Smoke - Pages principales', () => {
  test.describe.configure({ mode: 'parallel' });

  test('Landing page charge correctement', async ({ page }) => {
    await page.goto('/');

    // Vérifier que la page se charge sans erreur
    await expect(page).toHaveTitle(/LAIA/i);

    // Vérifier qu'un élément principal existe
    const heading = page.getByRole('heading', { level: 1 }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('Page onboarding accessible', async ({ page }) => {
    await page.goto('/onboarding');

    // Vérifier que la page onboarding se charge
    await expect(page).toHaveURL(/onboarding/);

    // Vérifier qu'un formulaire est présent
    const form = page.locator('form').first();
    await expect(form).toBeVisible({ timeout: 10000 });
  });

  test('Page pricing accessible', async ({ page }) => {
    await page.goto('/pricing');

    // Vérifier que la page pricing existe ou redirige
    const response = await page.goto('/pricing', { waitUntil: 'networkidle' });
    expect(response?.status()).toBeLessThan(500); // Pas d'erreur serveur
  });

  test('Page connexion accessible', async ({ page }) => {
    await page.goto('/auth/signin');

    // Vérifier la présence d'un formulaire de connexion
    const emailInput = page.locator('input[type="email"], input[name*="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 10000 });
  });

  test('Navigation principale fonctionne', async ({ page }) => {
    await page.goto('/');

    // Vérifier que le menu de navigation existe
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible({ timeout: 10000 });

    // Vérifier qu'au moins un lien de navigation existe
    const links = page.locator('a[href]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});
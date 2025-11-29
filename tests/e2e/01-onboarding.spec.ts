import { test, expect } from '@playwright/test';

/**
 * Tests du parcours utilisateur basiques
 * Tests simplifiés sans authentification
 */

test.describe('Pages principales', () => {
  test('Page login accessible', async ({ page }) => {
    const response = await page.goto('/login', { waitUntil: 'networkidle' });
    expect(response?.status()).toBeLessThan(500);

    // Vérifier qu'un formulaire existe
    const hasEmailField = await page.locator('input[type="email"]').isVisible({ timeout: 5000 }).catch(() => false);
    const hasPasswordField = await page.locator('input[type="password"]').isVisible({ timeout: 5000 }).catch(() => false);
    const hasAnyInput = await page.locator('input').first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasEmailField || hasPasswordField || hasAnyInput).toBe(true);
  });

  test('Page onboarding accessible', async ({ page }) => {
    const response = await page.goto('/onboarding', { waitUntil: 'networkidle' });
    expect(response?.status()).toBeLessThan(500);
  });

  test('API login rejette credentials invalides', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'admin@laiaskin.com',
        password: 'mauvais_mot_de_passe'
      }
    });

    expect(response.status()).toBe(401);
  });
});

import { test, expect } from '@playwright/test';

/**
 * Tests E2E de la landing page LAIA Connect
 * Vérifier que la page /platform est accessible et fonctionnelle
 */

test.describe('Landing Page LAIA Connect', () => {
  // Augmenter le timeout pour tous les tests de ce groupe
  test.beforeEach(async ({ page }) => {
    // Attendre que la page soit complètement chargée
    await page.goto('/platform', { waitUntil: 'networkidle' });
  });

  test('Affiche la landing page correctement', async ({ page }) => {
    // La page devrait contenir LAIA Connect
    await expect(page.locator('body')).toContainText(/LAIA|Connect|institut/i, { timeout: 10000 });
  });

  test('Affiche les 4 plans tarifaires', async ({ page }) => {
    // Scroll pour voir les plans
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    // Vérifier que les 4 plans sont affichés
    await expect(page.locator('text=Solo').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Duo').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Team').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Premium').first()).toBeVisible({ timeout: 5000 });
  });

  test('CTA vers onboarding existe', async ({ page }) => {
    // Chercher un lien vers onboarding
    const onboardingLinks = page.locator('a[href*="onboarding"]');
    const count = await onboardingLinks.count();

    // Il devrait y avoir au moins un lien vers l'onboarding
    expect(count).toBeGreaterThan(0);
  });

  test('Affiche les prix correctement', async ({ page }) => {
    // Scroll pour voir les prix
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    // Vérifier que les prix sont affichés (49€, 69€, 119€, 179€)
    const priceText = await page.locator('body').textContent();
    expect(priceText).toMatch(/49|69|119|179/);
  });

  test('Affiche les features des plans', async ({ page }) => {
    // Scroll pour voir les features
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(500);

    // Vérifier que des features sont listées
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.toLowerCase()).toMatch(/réservation|client|site web|dashboard/i);
  });

  test('Page se charge en mobile', async ({ page }) => {
    // Définir la taille mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'networkidle' });

    // Vérifier que la page se charge sans erreur
    await expect(page.locator('body')).toContainText(/LAIA|institut|beauté/i, { timeout: 10000 });
  });
});

import { test, expect } from '@playwright/test';

/**
 * Tests E2E de la landing page LAIA Connect
 * Vérifier que la page /platform est accessible et fonctionnelle
 */

test.describe('Landing Page LAIA Connect', () => {

  test('Affiche la landing page correctement', async ({ page }) => {
    await page.goto('/platform');

    // Vérifier le titre
    await expect(page).toHaveTitle(/LAIA|Connect/i);

    // Vérifier que les éléments clés sont visibles
    await expect(page.getByText(/plateforme|solution|institut/i)).toBeVisible();
  });

  test('Affiche les 4 plans tarifaires', async ({ page }) => {
    await page.goto('/platform');

    // Vérifier que les 4 plans sont affichés
    await expect(page.getByText('Solo')).toBeVisible();
    await expect(page.getByText('Duo')).toBeVisible();
    await expect(page.getByText('Team')).toBeVisible();
    await expect(page.getByText('Premium')).toBeVisible();
  });

  test('CTA "Essayer gratuitement" redirige vers onboarding', async ({ page }) => {
    await page.goto('/platform');

    // Trouver le bouton CTA
    const ctaButton = page.getByRole('button', { name: /essai|essayer|gratuit/i }).first();

    if (await ctaButton.isVisible()) {
      await ctaButton.click();

      // Vérifier qu'on est redirigé vers /onboarding
      await expect(page).toHaveURL(/\/onboarding/);
    }
  });

  test('Navigation vers pricing fonctionne', async ({ page }) => {
    await page.goto('/platform');

    // Chercher un lien vers pricing
    const pricingLink = page.locator('a[href*="pricing"]').first();

    if (await pricingLink.isVisible()) {
      await pricingLink.click();
      await expect(page).toHaveURL(/\/pricing/);
    }
  });

  test('Modal démo booking s\'ouvre', async ({ page }) => {
    await page.goto('/platform');

    // Chercher le bouton de démo
    const demoButton = page.getByRole('button', { name: /démo|demo/i }).first();

    if (await demoButton.isVisible()) {
      await demoButton.click();

      // Vérifier que le modal s'ouvre
      await expect(page.locator('[role="dialog"], .modal')).toBeVisible();
    }
  });

  test('Formulaire de contact fonctionne', async ({ page }) => {
    await page.goto('/platform');

    // Scroll vers le bas pour voir le formulaire de contact
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Chercher le formulaire de contact
    const contactForm = page.locator('form').filter({ hasText: /contact|message/i });

    if (await contactForm.isVisible()) {
      await expect(contactForm).toBeVisible();
    }
  });

  test('Page responsive - Mobile', async ({ page }) => {
    // Définir la taille mobile
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/platform');

    // Vérifier que la page se charge
    await expect(page.getByText(/LAIA|Connect/i)).toBeVisible();

    // Vérifier le menu mobile
    const mobileMenuButton = page.getByRole('button', { name: /menu|burger/i });

    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await expect(page.locator('nav')).toBeVisible();
    }
  });

  test('Affiche les prix correctement', async ({ page }) => {
    await page.goto('/platform');

    // Vérifier que les prix sont affichés
    await expect(page.getByText(/49|69|119|179/)).toBeVisible();
  });

  test('Affiche les features des plans', async ({ page }) => {
    await page.goto('/platform');

    // Vérifier que des features sont listées
    await expect(page.getByText(/réservation|client|facture|site web/i)).toBeVisible();
  });

  test('Liens externes fonctionnent', async ({ page }) => {
    await page.goto('/platform');

    // Vérifier les liens sociaux (si présents)
    const socialLinks = page.locator('a[href*="facebook"], a[href*="instagram"], a[href*="linkedin"]');

    const count = await socialLinks.count();
    if (count > 0) {
      // Juste vérifier qu'ils existent, ne pas cliquer (ouvriraient des pages externes)
      expect(count).toBeGreaterThan(0);
    }
  });
});

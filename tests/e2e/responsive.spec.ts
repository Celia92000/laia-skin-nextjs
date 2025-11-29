import { test, expect } from '@playwright/test';

/**
 * Tests Responsive - Vérification multi-devices
 * Ces tests s'exécutent sur Chrome, Firefox, Safari, Mobile et Tablet
 */

test.describe('Tests Responsive - Pages principales', () => {
  test('Page d\'accueil s\'affiche correctement', async ({ page }) => {
    const response = await page.goto('/', { waitUntil: 'networkidle' });
    expect(response?.status()).toBeLessThan(500);

    // Vérifier que le contenu principal est visible
    await expect(page.locator('body')).toBeVisible();

    // Pas d'overflow horizontal (scroll horizontal = problème responsive)
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('Page login s\'affiche correctement', async ({ page }) => {
    const response = await page.goto('/login', { waitUntil: 'networkidle' });
    expect(response?.status()).toBeLessThan(500);

    // Vérifier qu'un formulaire existe (email ou password)
    const hasEmailField = await page.locator('input[type="email"]').isVisible({ timeout: 5000 }).catch(() => false);
    const hasPasswordField = await page.locator('input[type="password"]').isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasEmailField || hasPasswordField).toBe(true);
  });

  test('Page platform s\'affiche correctement', async ({ page }) => {
    await page.goto('/platform', { waitUntil: 'networkidle' });

    // Contenu LAIA visible
    await expect(page.locator('body')).toContainText(/LAIA|Connect|institut/i, { timeout: 10000 });

    // Pas d'overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('Navigation accessible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Des liens doivent exister
    const links = page.locator('a[href]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    // Les liens doivent être cliquables (assez grands pour le touch)
    const firstLink = links.first();
    if (await firstLink.isVisible()) {
      const box = await firstLink.boundingBox();
      // Minimum 44x44px recommandé pour le touch (on accepte 24px minimum)
      expect(box?.height).toBeGreaterThan(20);
    }
  });
});

test.describe('Tests Responsive - Formulaires', () => {
  test('Formulaire de réservation accessible', async ({ page }) => {
    // Aller sur une page avec un formulaire de réservation
    await page.goto('/platform', { waitUntil: 'networkidle' });

    // Chercher un bouton de réservation
    const bookingButton = page.locator('a[href*="reservation"], button:has-text("Réserver")').first();

    if (await bookingButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      const box = await bookingButton.boundingBox();
      // Bouton assez grand pour le touch
      expect(box?.height).toBeGreaterThan(35);
      expect(box?.width).toBeGreaterThan(80);
    }
  });
});

test.describe('Tests Responsive - Performance', () => {
  test('Page charge en moins de 10 secondes', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    // La page doit charger en moins de 10 secondes
    expect(loadTime).toBeLessThan(10000);
  });

  test('Pas d\'erreurs JavaScript critiques', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    // Filtrer les erreurs non critiques (hydration warnings, etc.)
    const criticalErrors = errors.filter(e =>
      !e.includes('hydration') &&
      !e.includes('Hydration') &&
      !e.includes('Warning')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});

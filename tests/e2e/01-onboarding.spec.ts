import { test, expect } from '@playwright/test';
import { login, logout, TEST_DATA } from './helpers';

test.describe('Parcours Admin', () => {
  test('Connexion admin et accès au dashboard', async ({ page }) => {
    test.setTimeout(60000);

    // Étape 1: Aller sur la page de connexion
    await page.goto('/login', { waitUntil: 'networkidle' });

    // Étape 2: Se connecter
    await page.fill('input[type="email"]', TEST_DATA.orgAdmin.email);
    await page.fill('input[type="password"]', TEST_DATA.orgAdmin.password);
    await page.click('button[type="submit"]');

    // Attendre la redirection vers admin
    await page.waitForURL(/\/(admin|super-admin)/, { timeout: 15000 });

    // Vérifier qu'on est bien sur le dashboard admin
    await expect(page.locator('body')).toContainText(/dashboard|tableau de bord|admin/i, { timeout: 10000 });
  });

  test('Navigation dans les onglets admin', async ({ page }) => {
    test.setTimeout(60000);

    // Se connecter d'abord
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', TEST_DATA.orgAdmin.email);
    await page.fill('input[type="password"]', TEST_DATA.orgAdmin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|super-admin)/, { timeout: 15000 });

    // Vérifier que les onglets principaux existent
    const bodyText = await page.locator('body').textContent();

    // Au moins un de ces onglets devrait être présent
    const hasAdminNav = /planning|services|clients|crm|réservations/i.test(bodyText || '');
    expect(hasAdminNav).toBe(true);
  });

  test('Déconnexion fonctionne', async ({ page }) => {
    // Se connecter
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', TEST_DATA.orgAdmin.email);
    await page.fill('input[type="password"]', TEST_DATA.orgAdmin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(admin|super-admin)/, { timeout: 15000 });

    // Se déconnecter via l'API
    await page.goto('/api/auth/logout');

    // Vérifier qu'on est redirigé vers login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});

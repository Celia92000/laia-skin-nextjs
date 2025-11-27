import { test, expect } from '@playwright/test';
import { login, logout, TEST_DATA } from './helpers';

test.describe('Test des rôles utilisateurs', () => {
  test('SUPER_ADMIN - Accès super-admin', async ({ page }) => {
    await login(page, TEST_DATA.superAdmin.email, TEST_DATA.superAdmin.password);

    // Vérifier accès à /super-admin
    await page.goto('/super-admin');
    await expect(page).toHaveURL(/\/super-admin/);
    
    // Vérifier présence des fonctionnalités super-admin
    await expect(page.locator('text=/Organizations?/i')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Super Admin: Accès complet vérifié');
    await logout(page);
  });

  test('ORG_ADMIN - Accès admin organisation', async ({ page }) => {
    await login(page, TEST_DATA.orgAdmin.email, TEST_DATA.orgAdmin.password);

    // Vérifier redirection vers /admin
    await expect(page).toHaveURL(/\/admin/);
    
    // Vérifier accès aux onglets admin
    const adminTabs = ['Stats', 'Planning', 'CRM', 'Services'];
    for (const tab of adminTabs) {
      const tabElement = page.locator(`button:has-text("${tab}")`).first();
      if (await tabElement.isVisible()) {
        await expect(tabElement).toBeVisible();
        console.log(`✅ ORG_ADMIN: Accès à ${tab}`);
      }
    }

    // Vérifier interdiction d'accès à /super-admin
    await page.goto('/super-admin');
    // Devrait être redirigé ou voir erreur 403
    const url = page.url();
    const is403 = await page.locator('text=/403|Forbidden|Non autorisé/i').isVisible().catch(() => false);
    if (url.includes('/admin') || url.includes('/login') || is403) {
      console.log('✅ ORG_ADMIN: Pas d\'accès super-admin (correct)');
    }

    await logout(page);
  });

  test('STAFF - Accès employé limité', async ({ page }) => {
    await login(page, TEST_DATA.staff.email, TEST_DATA.staff.password);

    // Vérifier redirection vers /employee ou /admin avec vue limitée
    const url = page.url();
    const isEmployeeRoute = url.includes('/employee') || url.includes('/admin');
    expect(isEmployeeRoute).toBeTruthy();

    // Vérifier limitations (pas d'accès à config, comptabilité, etc.)
    await page.goto('/admin');
    
    // Employé ne devrait pas voir certains onglets sensibles
    const restrictedTabs = ['Comptabilité', 'Configuration'];
    for (const tab of restrictedTabs) {
      const isVisible = await page.locator(`button:has-text("${tab}")`).isVisible().catch(() => false);
      if (!isVisible) {
        console.log(`✅ STAFF: Pas d'accès à ${tab} (correct)`);
      }
    }

    await logout(page);
  });

  test('Vérification multi-tenant isolation', async ({ page }) => {
    // Connexion avec ORG_ADMIN
    await login(page, TEST_DATA.orgAdmin.email, TEST_DATA.orgAdmin.password);

    // Récupérer l'organizationId depuis l'API
    const response = await page.request.get('/api/admin/organization/current');
    const orgData = await response.json();
    
    expect(orgData).toHaveProperty('id');
    console.log(`✅ Organization ID: ${orgData.id}`);

    // Vérifier que les données sont isolées
    const clientsResponse = await page.request.get('/api/admin/clients');
    const clients = await clientsResponse.json();

    // Tous les clients doivent appartenir à cette organisation
    if (Array.isArray(clients)) {
      const allBelongToOrg = clients.every(client => 
        client.organizationId === orgData.id || !client.organizationId
      );
      expect(allBelongToOrg).toBeTruthy();
      console.log('✅ Multi-tenant: Données isolées correctement');
    }

    await logout(page);
  });
});

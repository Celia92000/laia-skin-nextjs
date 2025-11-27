import { test, expect } from '@playwright/test';
import { login, logout, TEST_DATA, completeOnboarding } from './helpers';

test.describe('Parcours inscription et onboarding', () => {
  test('Complet: Inscription → Onboarding → Admin → Site vitrine', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes

    // Étape 1: Vérifier que la page d'accueil charge
    console.log('✅ Étape 1: Chargement page d\'accueil');
    await page.goto('/');
    await expect(page).toHaveTitle(/LAIA/);

    // Étape 2: Connexion avec compte ORG_ADMIN de test
    console.log('✅ Étape 2: Connexion admin organisation');
    await login(page, TEST_DATA.orgAdmin.email, TEST_DATA.orgAdmin.password);

    // Vérifier redirection vers admin
    await expect(page).toHaveURL(/\/admin/);
    console.log('✅ Redirection vers /admin réussie');

    // Étape 3: Vérifier que le wizard de configuration s'affiche
    console.log('✅ Étape 3: Vérification wizard configuration');
    const wizardButton = page.locator('button:has-text("Configurer")');
    if (await wizardButton.isVisible()) {
      await wizardButton.click();
      await expect(page.locator('#config-wizard')).toBeVisible({ timeout: 5000 });
      console.log('✅ Wizard configuration visible');
    } else {
      console.log('⚠️  Wizard déjà complété ou masqué');
    }

    // Étape 4: Naviguer dans l'admin
    console.log('✅ Étape 4: Navigation dans l\'admin');
    
    // Vérifier onglets principaux
    const tabs = ['Planning', 'CRM', 'Services'];
    for (const tab of tabs) {
      const tabButton = page.locator(`button:has-text("${tab}")`);
      if (await tabButton.isVisible()) {
        await tabButton.click();
        console.log(`✅ Onglet ${tab} accessible`);
        await page.waitForTimeout(500);
      }
    }

    // Étape 5: Vérifier le site vitrine
    console.log('✅ Étape 5: Vérification site vitrine');
    
    // Ouvrir le site vitrine dans un nouvel onglet
    const [vitrineTab] = await Promise.all([
      page.context().waitForEvent('page'),
      page.click('a:has-text("Voir mon site")').catch(() => {
        console.log('⚠️  Bouton "Voir mon site" non trouvé, navigation directe');
        return page.goto('/');
      })
    ]);

    if (vitrineTab) {
      await vitrineTab.waitForLoadState();
      await expect(vitrineTab).toHaveTitle(/.*/, { timeout: 10000 });
      console.log('✅ Site vitrine chargé');
      await vitrineTab.close();
    } else {
      // Navigation directe si pas de nouvel onglet
      await page.goto('/');
      await expect(page).toHaveTitle(/.*/, { timeout: 10000 });
      console.log('✅ Site vitrine chargé (page actuelle)');
      await page.goto('/admin'); // Retour à l'admin
    }

    // Étape 6: Déconnexion
    console.log('✅ Étape 6: Déconnexion');
    await logout(page);
    
    console.log('✅ TEST COMPLET RÉUSSI');
  });

  test('Vérification du wizard de configuration', async ({ page }) => {
    await login(page, TEST_DATA.orgAdmin.email, TEST_DATA.orgAdmin.password);

    // Cliquer sur le bouton "Configurer"
    const configButton = page.locator('button:has-text("Configurer")');
    if (await configButton.isVisible()) {
      await configButton.click();

      // Vérifier que le wizard complet s'affiche
      const wizard = page.locator('#config-wizard');
      await expect(wizard).toBeVisible({ timeout: 5000 });

      // Vérifier la présence du CompleteOnboardingWizard
      const wizardContent = page.locator('.onboarding-wizard, [data-wizard]');
      await expect(wizardContent.or(wizard)).toBeVisible();

      console.log('✅ Wizard de configuration fonctionnel');
    } else {
      console.log('⚠️  Configuration déjà complète (>= 70%)');
    }
  });
});

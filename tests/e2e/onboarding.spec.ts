import { test, expect } from '@playwright/test';

/**
 * Tests E2E du tunnel d'onboarding LAIA Connect
 *
 * Parcours testé :
 * 1. Landing page → CTA inscription
 * 2. Onboarding étape par étape
 * 3. Choix template
 * 4. Preview live
 * 5. Infos billing
 * 6. Redirection Stripe (mock)
 */

test.describe('Tunnel d\'onboarding LAIA Connect', () => {

  test.beforeEach(async ({ page }) => {
    // Réinitialiser le localStorage avant chaque test
    await page.goto('/onboarding?reset=true');
    await page.waitForTimeout(500);
  });

  test('Affiche la page d\'onboarding correctement', async ({ page }) => {
    await page.goto('/onboarding');

    // Vérifier le titre de la page
    await expect(page.locator('h1')).toContainText(/Créez votre institut|Bienvenue/i);

    // Vérifier que le formulaire est visible
    await expect(page.locator('form')).toBeVisible();
  });

  test('Permet de choisir un plan depuis l\'URL', async ({ page }) => {
    await page.goto('/onboarding?plan=TEAM');

    // Vérifier que le plan TEAM est sélectionné
    await expect(page.getByText(/Team/i)).toBeVisible();
  });

  test('Parcours complet onboarding - Mode rapide (skip questionnaire)', async ({ page }) => {
    // ÉTAPE 1 : Infos personnelles
    await page.goto('/onboarding?skip=true&plan=SOLO');

    // Remplir le formulaire
    await page.fill('input[name="ownerFirstName"]', 'Marie');
    await page.fill('input[name="ownerLastName"]', 'Dupont');
    await page.fill('input[name="ownerEmail"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="ownerPhone"]', '0601020304');

    // Cliquer sur Continuer
    await page.getByRole('button', { name: /continuer/i }).click();
    await page.waitForTimeout(500);

    // ÉTAPE 2 : Bienvenue (skip questionnaire activé)
    // Devrait afficher la page de bienvenue avec le plan choisi
    await expect(page.locator('text=/Bienvenue|Solo/i')).toBeVisible();

    // Continuer
    await page.getByRole('button', { name: /continuer|commencer/i }).first().click();
    await page.waitForTimeout(500);

    // ÉTAPE 3 : Infos institut
    const timestamp = Date.now();
    await page.fill('input[name="institutName"]', 'Institut Test E2E');

    // Le slug devrait être auto-généré
    const slugInput = page.locator('input[name="slug"]');
    await expect(slugInput).toHaveValue(/institut-test-e2e/i);

    await page.fill('input[name="city"]', 'Paris');
    await page.fill('input[name="address"]', '123 Rue de la Beauté');
    await page.fill('input[name="postalCode"]', '75001');

    // Continuer
    await page.getByRole('button', { name: /continuer/i }).click();
    await page.waitForTimeout(500);

    // ÉTAPE 4 : Choix du template
    // Vérifier que les templates sont affichés
    await expect(page.getByText(/Classic|Modern|Minimal/i)).toBeVisible();

    // Sélectionner le template "Modern"
    await page.locator('text=Modern').first().click();
    await page.waitForTimeout(300);

    // Continuer
    await page.getByRole('button', { name: /continuer/i }).click();
    await page.waitForTimeout(500);

    // ÉTAPE 5 : Contenu du site avec preview
    // Remplir le contenu
    await page.fill('input[name="heroTitle"]', 'Votre institut de beauté à Paris');
    await page.fill('textarea[name="heroDescription"]', 'Découvrez nos soins exclusifs');

    // Vérifier que le preview est visible
    await expect(page.locator('.preview-container, [class*="preview"]')).toBeVisible();

    // Continuer
    await page.getByRole('button', { name: /continuer/i }).click();
    await page.waitForTimeout(500);

    // ÉTAPE 6 : Infos légales et facturation
    await page.fill('input[name="legalName"]', 'Institut Test SARL');
    await page.fill('input[name="siret"]', '12345678901234');
    await page.fill('input[name="billingEmail"]', `billing-${timestamp}@example.com`);
    await page.fill('input[name="billingAddress"]', '123 Rue de Facturation');
    await page.fill('input[name="billingPostalCode"]', '75001');
    await page.fill('input[name="billingCity"]', 'Paris');

    // Cliquer sur "Finaliser l'inscription"
    await page.getByRole('button', { name: /finaliser|créer mon compte/i }).click();

    // Attendre la redirection vers Stripe (ou page de success en test)
    await page.waitForTimeout(2000);

    // Vérifier qu'on est redirigé vers Stripe ou la page success
    // En test, on ne peut pas compléter le paiement Stripe
    // Donc on vérifie juste qu'on a été redirigé
    const currentUrl = page.url();

    // Soit on est sur Stripe checkout, soit sur la page de success
    expect(
      currentUrl.includes('checkout.stripe.com') ||
      currentUrl.includes('/onboarding/success')
    ).toBeTruthy();
  });

  test('Validation des champs requis', async ({ page }) => {
    await page.goto('/onboarding');

    // Essayer de continuer sans remplir les champs
    const continuerButton = page.getByRole('button', { name: /continuer/i });
    await continuerButton.click();

    // Vérifier que les messages d'erreur apparaissent
    // (HTML5 validation ou messages custom)
    const emailInput = page.locator('input[name="ownerEmail"]');
    const isRequired = await emailInput.evaluate((el: HTMLInputElement) => el.required);
    expect(isRequired).toBeTruthy();
  });

  test('Sauvegarde automatique dans localStorage', async ({ page }) => {
    await page.goto('/onboarding');

    // Remplir quelques champs
    await page.fill('input[name="ownerFirstName"]', 'Test');
    await page.fill('input[name="ownerEmail"]', 'test@example.com');

    // Attendre un peu pour la sauvegarde auto
    await page.waitForTimeout(1000);

    // Recharger la page
    await page.reload();

    // Vérifier que les données sont toujours là
    await expect(page.locator('input[name="ownerFirstName"]')).toHaveValue('Test');
    await expect(page.locator('input[name="ownerEmail"]')).toHaveValue('test@example.com');
  });

  test('Reset onboarding avec ?reset=true', async ({ page }) => {
    // D'abord, remplir des données
    await page.goto('/onboarding');
    await page.fill('input[name="ownerFirstName"]', 'ToDelete');
    await page.waitForTimeout(500);

    // Reset avec le param
    await page.goto('/onboarding?reset=true');
    await page.waitForTimeout(500);

    // Vérifier que les champs sont vides
    await expect(page.locator('input[name="ownerFirstName"]')).toHaveValue('');
  });

  test('Connexion Google OAuth (simulation)', async ({ page }) => {
    // Tester le flow OAuth (sans vraiment se connecter à Google)
    await page.goto('/onboarding');

    // Vérifier que le bouton "Continuer avec Google" existe
    const googleButton = page.getByRole('button', { name: /google/i });
    await expect(googleButton).toBeVisible();

    // Note: En test E2E réel, il faudrait mocker l'OAuth
    // Pour l'instant on vérifie juste que le bouton est là
  });

  test('Choix de différents plans', async ({ page }) => {
    const plans = ['SOLO', 'DUO', 'TEAM', 'PREMIUM'];

    for (const plan of plans) {
      await page.goto(`/onboarding?plan=${plan}`);
      await page.waitForTimeout(300);

      // Vérifier que le plan est affiché
      await expect(page.getByText(new RegExp(plan, 'i'))).toBeVisible();
    }
  });

  test('Preview live du template', async ({ page }) => {
    // Aller directement à l'étape de contenu
    await page.goto('/onboarding?skip=true&plan=SOLO');

    // Remplir les étapes rapidement
    await page.fill('input[name="ownerFirstName"]', 'Test');
    await page.fill('input[name="ownerLastName"]', 'User');
    await page.fill('input[name="ownerEmail"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="ownerPhone"]', '0601020304');
    await page.getByRole('button', { name: /continuer/i }).click();
    await page.waitForTimeout(500);

    // Skip bienvenue
    await page.getByRole('button', { name: /continuer|commencer/i }).first().click();
    await page.waitForTimeout(500);

    // Infos institut
    await page.fill('input[name="institutName"]', 'Test Preview');
    await page.fill('input[name="city"]', 'Paris');
    await page.fill('input[name="address"]', '123 Rue Test');
    await page.fill('input[name="postalCode"]', '75001');
    await page.getByRole('button', { name: /continuer/i }).click();
    await page.waitForTimeout(500);

    // Choisir template
    await page.locator('text=Modern').first().click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /continuer/i }).click();
    await page.waitForTimeout(500);

    // Maintenant on devrait être sur la page de contenu avec preview
    // Modifier le titre et vérifier qu'il apparaît dans le preview
    const heroTitle = 'Mon Institut Test';
    await page.fill('input[name="heroTitle"]', heroTitle);
    await page.waitForTimeout(500);

    // Vérifier que le titre apparaît dans le preview
    // (Le preview devrait contenir le texte qu'on vient d'entrer)
    await expect(page.getByText(heroTitle)).toBeVisible();
  });
});

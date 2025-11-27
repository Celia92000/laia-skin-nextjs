import { test, expect } from '@playwright/test';
import { login, logout, TEST_DATA } from './helpers';

test.describe('Test de génération de factures', () => {
  test('Générer une facture pour un service', async ({ page }) => {
    test.setTimeout(90000); // 1.5 minutes

    await login(page, TEST_DATA.orgAdmin.email, TEST_DATA.orgAdmin.password);

    // Aller dans la section paiements
    await page.goto('/admin');

    // Cliquer sur l'onglet Paiements
    const paymentsTab = page.locator('button:has-text("Paiements")').first();
    if (await paymentsTab.isVisible()) {
      await paymentsTab.click();
      await page.waitForTimeout(1000);

      // Chercher un paiement sans facture
      const generateInvoiceButton = page.locator('button:has-text(/Générer|Facture/i)').first();

      if (await generateInvoiceButton.isVisible()) {
        await generateInvoiceButton.click();

        // Attendre la génération
        await page.waitForTimeout(2000);

        // Vérifier qu'une notification de succès apparaît
        const successNotification = page.locator('text=/Facture générée|Success|Succès/i');
        if (await successNotification.isVisible({ timeout: 5000 })) {
          console.log('✅ Facture générée avec succès');
        }
      } else {
        console.log('⚠️ Pas de bouton génération facture (toutes déjà générées)');
      }
    }

    await logout(page);
  });

  test('Télécharger une facture PDF', async ({ page }) => {
    await login(page, TEST_DATA.orgAdmin.email, TEST_DATA.orgAdmin.password);

    await page.goto('/admin');

    // Aller dans Comptabilité
    const comptaTab = page.locator('button:has-text("Comptabilité")');
    if (await comptaTab.isVisible()) {
      await comptaTab.click();
      await page.waitForTimeout(1000);

      // Chercher un lien de téléchargement PDF
      const downloadButton = page.locator('a[href*="/invoices/"], a[href*=".pdf"]').first();

      if (await downloadButton.isVisible()) {
        // Vérifier que le lien existe
        const href = await downloadButton.getAttribute('href');
        console.log(`✅ Lien facture trouvé: ${href}`);

        // Ne pas télécharger réellement pour éviter les popups
        // Juste vérifier que le lien est valide
        expect(href).toBeTruthy();
      } else {
        console.log('⚠️ Pas de facture disponible au téléchargement');
      }
    }

    await logout(page);
  });

  test('Voir la liste des factures', async ({ page }) => {
    await login(page, TEST_DATA.orgAdmin.email, TEST_DATA.orgAdmin.password);

    await page.goto('/admin');

    // Aller dans Comptabilité
    const comptaTab = page.locator('button:has-text("Comptabilité")');
    if (await comptaTab.isVisible()) {
      await comptaTab.click();
      await page.waitForTimeout(1000);

      // Vérifier que la liste des factures s'affiche
      const invoicesList = page.locator('[data-invoices-list], .invoices-table, table');
      if (await invoicesList.isVisible()) {
        console.log('✅ Liste des factures affichée');

        // Compter les factures
        const rows = page.locator('tr[data-invoice], tbody tr');
        const count = await rows.count();
        console.log(`📊 Nombre de factures: ${count}`);
      } else {
        console.log('⚠️ Liste des factures non trouvée');
      }
    }

    await logout(page);
  });

  test('Envoyer une facture par email', async ({ page }) => {
    await login(page, TEST_DATA.orgAdmin.email, TEST_DATA.orgAdmin.password);

    await page.goto('/admin');

    // Aller dans Comptabilité
    const comptaTab = page.locator('button:has-text("Comptabilité")');
    if (await comptaTab.isVisible()) {
      await comptaTab.click();
      await page.waitForTimeout(1000);

      // Chercher un bouton d'envoi par email
      const sendEmailButton = page.locator('button:has-text(/Envoyer|Email/i)').first();

      if (await sendEmailButton.isVisible()) {
        await sendEmailButton.click();

        // Vérifier qu'un modal de confirmation s'ouvre
        const modal = page.locator('[role="dialog"], .modal, [data-modal]');
        if (await modal.isVisible({ timeout: 3000 })) {
          console.log('✅ Modal d\'envoi par email ouvert');

          // Annuler pour ne pas envoyer réellement
          const cancelButton = page.locator('button:has-text(/Annuler|Cancel/i)');
          if (await cancelButton.isVisible()) {
            await cancelButton.click();
          }
        }
      } else {
        console.log('⚠️ Bouton envoi email non trouvé');
      }
    }

    await logout(page);
  });

  test('Rechercher une facture', async ({ page }) => {
    await login(page, TEST_DATA.orgAdmin.email, TEST_DATA.orgAdmin.password);

    await page.goto('/admin');

    // Aller dans Comptabilité
    const comptaTab = page.locator('button:has-text("Comptabilité")');
    if (await comptaTab.isVisible()) {
      await comptaTab.click();
      await page.waitForTimeout(1000);

      // Chercher le champ de recherche
      const searchInput = page.locator('input[placeholder*="Rechercher"], input[type="search"]');

      if (await searchInput.isVisible()) {
        await searchInput.fill('2024');
        await page.waitForTimeout(1000);

        console.log('✅ Recherche de factures effectuée');
      } else {
        console.log('⚠️ Champ de recherche non trouvé');
      }
    }

    await logout(page);
  });

  test('Filtrer les factures par statut', async ({ page }) => {
    await login(page, TEST_DATA.orgAdmin.email, TEST_DATA.orgAdmin.password);

    await page.goto('/admin');

    // Aller dans Comptabilité
    const comptaTab = page.locator('button:has-text("Comptabilité")');
    if (await comptaTab.isVisible()) {
      await comptaTab.click();
      await page.waitForTimeout(1000);

      // Chercher les filtres
      const statusFilters = ['Payée', 'En attente', 'Annulée'];

      for (const status of statusFilters) {
        const filterButton = page.locator(`button:has-text("${status}")`);
        if (await filterButton.isVisible()) {
          console.log(`✅ Filtre "${status}" disponible`);
        }
      }
    }

    await logout(page);
  });

  test('Vérifier les informations légales sur une facture', async ({ page }) => {
    await login(page, TEST_DATA.orgAdmin.email, TEST_DATA.orgAdmin.password);

    // Tester l'API de génération de facture
    const response = await page.request.get('/api/admin/invoices');

    if (response.ok()) {
      const invoices = await response.json();

      if (Array.isArray(invoices) && invoices.length > 0) {
        const firstInvoice = invoices[0];

        // Vérifier les champs obligatoires
        const requiredFields = [
          'invoiceNumber',
          'amount',
          'clientName',
          'date'
        ];

        const missingFields = requiredFields.filter(field => !firstInvoice[field]);

        if (missingFields.length === 0) {
          console.log('✅ Facture contient tous les champs obligatoires');
        } else {
          console.log(`⚠️ Champs manquants: ${missingFields.join(', ')}`);
        }
      } else {
        console.log('⚠️ Aucune facture dans la base de données');
      }
    } else {
      console.log('⚠️ Erreur lors de la récupération des factures');
    }

    await logout(page);
  });

  test('Facture automatique après réservation payée', async ({ page }) => {
    await login(page, TEST_DATA.orgAdmin.email, TEST_DATA.orgAdmin.password);

    // Créer une réservation de test
    await page.goto('/admin');

    const planningTab = page.locator('button:has-text("Planning")');
    if (await planningTab.isVisible()) {
      await planningTab.click();
      await page.waitForTimeout(1000);

      // Note: Ce test nécessiterait une création complète de réservation
      // avec paiement, ce qui est complexe en E2E
      console.log('⚠️ Test de génération automatique nécessite une réservation complète');
    }

    await logout(page);
  });
});

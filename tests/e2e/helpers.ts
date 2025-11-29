import { Page, expect } from '@playwright/test';

// Données de test - Utilisateurs existants en base
export const TEST_DATA = {
  superAdmin: {
    email: 'admin@laiaskin.com',
    password: 'admin'
  },
  orgAdmin: {
    email: 'admin@laiaskin.com',
    password: 'admin',
    firstName: 'Admin',
    lastName: 'Test',
    organizationName: 'Laia Skin Institut',
    slug: 'laia-skin-institut'
  },
  staff: {
    email: 'admin@laiaskin.com',
    password: 'admin'
  }
};

// Helper pour se connecter
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  // Attendre la redirection
  await page.waitForURL(/\/(admin|super-admin|employee)/, { timeout: 10000 });
}

// Helper pour se déconnecter
export async function logout(page: Page) {
  await page.click('[data-logout]').catch(() => {
    // Si pas de bouton logout, aller sur /api/auth/logout
    return page.goto('/api/auth/logout');
  });
  await page.waitForURL('/login', { timeout: 5000 });
}

// Helper pour attendre un toast/notification
export async function waitForNotification(page: Page, text?: string) {
  const notification = page.locator('[role="status"], .toast, .notification');
  await expect(notification).toBeVisible({ timeout: 5000 });
  if (text) {
    await expect(notification).toContainText(text);
  }
}

// Helper pour remplir l'onboarding
export async function completeOnboarding(page: Page, data: typeof TEST_DATA.orgAdmin) {
  // Étape 1: Informations générales
  await page.fill('input[name="siteName"]', data.organizationName);
  await page.fill('input[name="siteTagline"]', 'Site de test E2E');
  await page.click('button:has-text("Suivant")');

  // Étape 2: Template
  await page.click('[data-template]:first-child');
  await page.click('button:has-text("Suivant")');

  // Étape 3: Couleurs (utiliser les couleurs par défaut)
  await page.click('button:has-text("Suivant")');

  // Étape 4: Contact
  await page.fill('input[name="email"]', data.email);
  await page.fill('input[name="phone"]', '0612345678');
  await page.fill('input[name="address"]', '123 rue de Test');
  await page.fill('input[name="city"]', 'Paris');
  await page.fill('input[name="postalCode"]', '75001');
  await page.click('button:has-text("Suivant")');

  // Sauvegarder et quitter
  await page.click('button:has-text("Sauvegarder")').catch(() => {});
}

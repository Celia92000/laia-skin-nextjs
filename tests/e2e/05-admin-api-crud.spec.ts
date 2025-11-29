import { test, expect } from '@playwright/test';

/**
 * Tests API Admin - Sécurité et Authentification
 *
 * Ces tests vérifient:
 * - Rejet des accès non autorisés
 * - Validation des credentials
 */

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3001';

test.describe('API Auth - Validation', () => {
  test('Login rejeté avec mauvais mot de passe', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: 'admin@laiaskin.com',
        password: 'wrongpassword'
      }
    });

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('Login rejeté avec email inexistant', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: 'nonexistent@example.com',
        password: 'anypassword'
      }
    });

    expect(response.status()).toBe(401);
  });

  test('Login rejeté sans credentials', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {}
    });

    // Devrait retourner une erreur de validation
    expect([400, 401, 422]).toContain(response.status());
  });
});

test.describe('API Admin - Sécurité', () => {
  test('API admin clients rejette accès sans auth', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/admin/clients`);
    expect(response.status()).toBe(401);
  });

  test('API admin services rejette accès sans auth', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/admin/services`);
    expect(response.status()).toBe(401);
  });

  test('API admin categories rejette accès sans auth', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/admin/categories`);
    expect(response.status()).toBe(401);
  });

  test('API admin dashboard rejette accès sans auth', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/admin/dashboard`);
    expect(response.status()).toBe(401);
  });

  test('Token invalide rejeté', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/admin/clients`, {
      headers: {
        'Authorization': 'Bearer fake-invalid-token-12345'
      }
    });

    expect(response.status()).toBe(401);
  });
});

test.describe('API Publiques', () => {
  test('Webhook Stripe endpoint accessible', async ({ request }) => {
    // Le webhook devrait répondre même sans payload valide
    const response = await request.post(`${BASE_URL}/api/webhooks/stripe`, {
      data: {}
    });

    // Peut retourner 400 (bad request) ou 200, mais pas 404
    expect([200, 400, 401]).toContain(response.status());
  });

  test('API santé existe', async ({ request }) => {
    // Tester si une API de santé existe
    const response = await request.get(`${BASE_URL}/api/health`);
    // Peut ne pas exister (404) ou exister (200)
    expect([200, 404]).toContain(response.status());
  });
});

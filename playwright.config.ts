import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour LAIA Connect
 * Tests E2E du tunnel d'onboarding et fonctionnalités critiques
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* Timeout par test */
  timeout: 60 * 1000, // 60 secondes

  /* Configuration globale */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  /* Reporter */
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  /* Configuration partagée pour tous les tests */
  use: {
    /* URL de base */
    baseURL: 'http://localhost:3001',

    /* Collecter les traces en cas d'échec */
    trace: 'on-first-retry',

    /* Screenshots en cas d'échec */
    screenshot: 'only-on-failure',

    /* Vidéo en cas d'échec */
    video: 'retain-on-failure',
  },

  /* Projets de test (différents navigateurs) */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Décommenter pour tester sur Firefox et Safari
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Tests mobile */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  /* Serveur de dev local */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes pour démarrer
  },
});

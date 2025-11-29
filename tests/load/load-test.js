/**
 * Tests de charge LAIA Connect
 * Utilise k6 (https://k6.io/)
 *
 * Installation: npm install -g k6 (ou brew install k6 sur Mac)
 * Exécution: k6 run tests/load/load-test.js
 *
 * Options de test:
 * - k6 run --vus 10 --duration 30s tests/load/load-test.js  (10 utilisateurs, 30 secondes)
 * - k6 run --vus 100 --duration 60s tests/load/load-test.js (100 utilisateurs, 1 minute)
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Métriques personnalisées
const errorRate = new Rate('errors');
const pageLoadTime = new Trend('page_load_time');

// Configuration du test
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Montée à 10 utilisateurs en 30s
    { duration: '1m', target: 50 },    // Montée à 50 utilisateurs en 1min
    { duration: '2m', target: 100 },   // Montée à 100 utilisateurs en 2min
    { duration: '1m', target: 100 },   // Maintien à 100 utilisateurs
    { duration: '30s', target: 0 },    // Descente à 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% des requêtes < 3s
    errors: ['rate<0.1'],               // Moins de 10% d'erreurs
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://laiaconnect.fr';

export default function () {
  // === Test 1: Page d'accueil ===
  group('Page accueil', function () {
    const startTime = new Date();
    const res = http.get(`${BASE_URL}/`);
    pageLoadTime.add(new Date() - startTime);

    const success = check(res, {
      'status 200': (r) => r.status === 200,
      'page contient LAIA': (r) => r.body.includes('LAIA') || r.body.includes('Connect'),
    });
    errorRate.add(!success);
  });

  sleep(1);

  // === Test 2: Page platform ===
  group('Page platform', function () {
    const res = http.get(`${BASE_URL}/platform`);

    const success = check(res, {
      'status 200': (r) => r.status === 200,
    });
    errorRate.add(!success);
  });

  sleep(1);

  // === Test 3: Page login ===
  group('Page login', function () {
    const res = http.get(`${BASE_URL}/login`);

    const success = check(res, {
      'status 200': (r) => r.status === 200,
      'formulaire présent': (r) => r.body.includes('email') || r.body.includes('password'),
    });
    errorRate.add(!success);
  });

  sleep(1);

  // === Test 4: API publique ===
  group('API services', function () {
    const res = http.get(`${BASE_URL}/api/services`);

    const success = check(res, {
      'status OK': (r) => r.status === 200 || r.status === 401,
    });
    errorRate.add(!success);
  });

  sleep(1);

  // === Test 5: Tentative de login (échec attendu) ===
  group('API auth', function () {
    const payload = JSON.stringify({
      email: 'loadtest@example.com',
      password: 'wrongpassword',
    });

    const params = {
      headers: { 'Content-Type': 'application/json' },
    };

    const res = http.post(`${BASE_URL}/api/auth/login`, payload, params);

    const success = check(res, {
      'login rejeté (401)': (r) => r.status === 401,
    });
    errorRate.add(!success);
  });

  sleep(2);
}

// Rapport final
export function handleSummary(data) {
  return {
    'tests/load/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, opts) {
  const metrics = data.metrics;
  return `
╔════════════════════════════════════════════════════════════╗
║          RAPPORT DE TEST DE CHARGE - LAIA CONNECT          ║
╠════════════════════════════════════════════════════════════╣
║ Durée totale: ${(data.state.testRunDurationMs / 1000).toFixed(0)}s
║ VUs max: ${data.metrics.vus?.values?.max || 'N/A'}
║ Requêtes totales: ${metrics.http_reqs?.values?.count || 0}
║ Requêtes/sec: ${(metrics.http_reqs?.values?.rate || 0).toFixed(2)}
╠════════════════════════════════════════════════════════════╣
║ TEMPS DE RÉPONSE
║ - Moyenne: ${(metrics.http_req_duration?.values?.avg || 0).toFixed(0)}ms
║ - Médiane (p50): ${(metrics.http_req_duration?.values?.['p(50)'] || 0).toFixed(0)}ms
║ - p95: ${(metrics.http_req_duration?.values?.['p(95)'] || 0).toFixed(0)}ms
║ - p99: ${(metrics.http_req_duration?.values?.['p(99)'] || 0).toFixed(0)}ms
║ - Max: ${(metrics.http_req_duration?.values?.max || 0).toFixed(0)}ms
╠════════════════════════════════════════════════════════════╣
║ TAUX D'ERREUR: ${((metrics.errors?.values?.rate || 0) * 100).toFixed(2)}%
║ STATUT: ${(metrics.errors?.values?.rate || 0) < 0.1 ? '✅ OK' : '❌ ÉCHEC'}
╚════════════════════════════════════════════════════════════╝
`;
}

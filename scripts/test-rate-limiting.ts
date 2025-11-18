#!/usr/bin/env ts-node

/**
 * Script de test du Rate Limiting
 *
 * Teste que le rate limiting fonctionne correctement sur les API routes
 * Usage: npx ts-node scripts/test-rate-limiting.ts
 */

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

interface RateLimitTest {
  endpoint: string;
  description: string;
  maxRequests: number;
  windowSeconds: number;
}

const tests: RateLimitTest[] = [
  {
    endpoint: '/api/test-connection',
    description: 'Route générale',
    maxRequests: 10,
    windowSeconds: 10,
  },
  {
    endpoint: '/api/auth/login',
    description: 'Route sensible (login)',
    maxRequests: 5,
    windowSeconds: 60,
  },
];

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testRateLimit(test: RateLimitTest): Promise<void> {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🧪 Test: ${test.description}`);
  console.log(`📍 Endpoint: ${test.endpoint}`);
  console.log(`📊 Limite: ${test.maxRequests} requêtes / ${test.windowSeconds}s`);
  console.log(`${'='.repeat(70)}\n`);

  let successCount = 0;
  let rateLimited = false;
  let rateLimitHeaders: any = {};

  // Faire des requêtes jusqu'à atteindre la limite
  for (let i = 1; i <= test.maxRequests + 3; i++) {
    try {
      const response = await fetch(`${API_URL}${test.endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const headers = {
        limit: response.headers.get('X-RateLimit-Limit'),
        remaining: response.headers.get('X-RateLimit-Remaining'),
        reset: response.headers.get('X-RateLimit-Reset'),
        retryAfter: response.headers.get('Retry-After'),
      };

      if (response.status === 429) {
        rateLimited = true;
        rateLimitHeaders = headers;
        console.log(`❌ Requête #${i}: RATE LIMITED (429)`);
        console.log(`   └─ Remaining: ${headers.remaining}`);
        console.log(`   └─ Retry-After: ${headers.retryAfter}s`);
      } else if (response.ok || response.status === 404) {
        // 404 est OK pour les endpoints de test qui n'existent pas
        successCount++;
        console.log(`✅ Requête #${i}: SUCCESS (${response.status})`);
        if (headers.limit) {
          console.log(`   └─ Remaining: ${headers.remaining}/${headers.limit}`);
        }
      } else {
        console.log(`⚠️  Requête #${i}: ${response.status}`);
      }

      // Petit délai entre les requêtes
      await sleep(100);
    } catch (error: any) {
      console.error(`❌ Requête #${i}: ERROR -`, error.message);
    }
  }

  console.log(`\n${'─'.repeat(70)}`);
  console.log(`📈 Résultats:`);
  console.log(`   ✓ Requêtes réussies: ${successCount}`);
  console.log(`   ✓ Rate limit atteint: ${rateLimited ? 'OUI ✅' : 'NON ❌'}`);

  if (rateLimited) {
    console.log(`\n✅ TEST RÉUSSI: Le rate limiting fonctionne correctement !`);
    if (successCount <= test.maxRequests) {
      console.log(`✅ La limite de ${test.maxRequests} requêtes a été respectée`);
    } else {
      console.log(`⚠️  ATTENTION: ${successCount} requêtes ont réussi (limite: ${test.maxRequests})`);
    }
  } else {
    console.log(`\n⚠️  TEST PARTIEL: Le rate limiting n'a pas été déclenché`);
    console.log(`   Cela peut être normal si Upstash n'est pas configuré en dev`);
  }
}

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`🔒 TEST DU RATE LIMITING - LAIA CONNECT`);
  console.log(`${'═'.repeat(70)}`);
  console.log(`🌐 URL de test: ${API_URL}`);
  console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);

  // Vérifier si Upstash est configuré
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.log(`\n⚠️  ATTENTION: Upstash n'est pas configuré`);
    console.log(`   Le rate limiting sera simulé (toujours autorisé)`);
    console.log(`   Variables manquantes:`);
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      console.log(`   - UPSTASH_REDIS_REST_URL`);
    }
    if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.log(`   - UPSTASH_REDIS_REST_TOKEN`);
    }
  } else {
    console.log(`\n✅ Upstash configuré - Rate limiting actif`);
  }

  // Exécuter les tests
  for (const test of tests) {
    await testRateLimit(test);
    await sleep(1000);
  }

  console.log(`\n${'═'.repeat(70)}`);
  console.log(`✅ TESTS TERMINÉS`);
  console.log(`${'═'.repeat(70)}\n`);

  console.log(`📝 NOTES:`);
  console.log(`   1. En développement sans Upstash, le rate limiting est désactivé`);
  console.log(`   2. En production, configurez UPSTASH_REDIS_REST_URL et TOKEN`);
  console.log(`   3. Les limites sont configurables dans /src/lib/rateLimit.ts`);
  console.log(``);
}

// Exécuter les tests
main().catch(console.error);

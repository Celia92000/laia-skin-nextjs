import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'laia-skin-institut.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'laia-skin-institut.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        pathname: '/**',
      }
    ],
    formats: ['image/avif', 'image/webp'],
  },
  trailingSlash: true,
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  compress: true,
  experimental: {
    // Optimiser la génération des pages pour éviter les timeouts de DB
    workerThreads: false,
    cpus: 1,
  },
  serverExternalPackages: ['pdfkit'],
  // Désactiver la génération statique au build pour multi-tenant
  output: 'standalone',
  // 🔒 Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            // Empêche ton site d'être mis dans une iframe (protection contre le clickjacking)
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            // Empêche le navigateur de "deviner" le type de fichier (protection XSS)
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            // Force HTTPS pendant 1 an (sécurité maximale)
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            // Contrôle quelles ressources peuvent être chargées (anti-injection)
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.stripe.com; frame-src 'self' https://js.stripe.com;"
          },
          {
            // Bloque les anciennes API dangereuses du navigateur
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            // Protection contre les attaques XSS (Cross-Site Scripting)
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  },
};

// Configuration Sentry pour le monitoring d'erreurs
export default withSentryConfig(nextConfig, {
  // Désactiver les logs Sentry pendant le build
  silent: true,

  // Configuration pour l'upload des source maps
  org: "laia-skin-institut",
  project: "javascript-nextjs",

  // Ne pas uploader les source maps en développement
  widenClientFileUpload: true,
  disableLogger: true,
});

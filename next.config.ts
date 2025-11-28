import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  images: {
    unoptimized: isDev, // Pas d'optimisation en dev pour accélérer
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
  compress: !isDev, // Pas de compression en dev
  experimental: {
    // Optimiser pour dev
    workerThreads: false,
    cpus: 1,
    serverMinification: false,
  },
  // Packages externes pour le serveur
  serverExternalPackages: ['@prisma/client', 'prisma', 'pdfkit'],
  // Désactiver la génération statique au build pour multi-tenant
  output: 'standalone',
  // 🔒 Headers de sécurité
  async headers() {
    // CSP stricte en production, permissive en dev (Next.js nécessite unsafe-eval/inline en dev)
    const cspPolicy = isDev
      ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.stripe.com ws: wss:; frame-src 'self' https://js.stripe.com;"
      : [
          "default-src 'self'",
          // Scripts: self + Stripe + unsafe-inline requis par Next.js hydration
          "script-src 'self' 'unsafe-inline' https://js.stripe.com",
          // Styles: self + inline (requis par styled-jsx/tailwind) + Google Fonts
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          // Fonts
          "font-src 'self' https://fonts.gstatic.com data:",
          // Images: permissif pour les CDN et uploads
          "img-src 'self' data: https: blob:",
          // Connexions API
          "connect-src 'self' https://api.stripe.com https://*.supabase.co https://*.sentry.io",
          // Frames: Stripe uniquement
          "frame-src 'self' https://js.stripe.com",
          // Objects: bloqué
          "object-src 'none'",
          // Base URI: self uniquement
          "base-uri 'self'",
          // Form actions: self uniquement
          "form-action 'self'",
          // Frame ancestors: aucun (anti-clickjacking)
          "frame-ancestors 'none'",
          // Upgrade insecure requests en prod
          "upgrade-insecure-requests",
        ].join('; ');

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
            // Force HTTPS pendant 1 an + preload (sécurité maximale)
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            // Content Security Policy
            key: 'Content-Security-Policy',
            value: cspPolicy
          },
          {
            // Bloque les anciennes API dangereuses du navigateur
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self)'
          },
          {
            // Protection contre les attaques XSS (Cross-Site Scripting)
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            // Contrôle les informations envoyées dans le Referer
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },
};

// Désactiver Sentry complètement en développement pour la performance
const finalConfig = isDev
  ? nextConfig
  : withSentryConfig(nextConfig, {
      silent: true,
      org: "laia-skin-institut",
      project: "javascript-nextjs",
      widenClientFileUpload: true,
      disableLogger: true,
    });

export default finalConfig;

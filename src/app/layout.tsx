import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, Playfair_Display, Lora, Poppins } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { QueryProvider } from "@/providers/QueryProvider";
import { getSiteConfig } from "@/lib/config-service";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter"
});

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
});

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant"
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair"
});

const lora = Lora({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-lora"
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const siteName = config.siteName || 'Mon Institut de Beauté';
  const siteDescription = config.siteDescription || 'Institut de beauté premium spécialisé dans les soins innovants du visage. Réservation en ligne 24/7.';
  const city = config.city || 'Paris';
  const website = config.customDomain || 'https://votre-institut.fr';

  return {
    metadataBase: new URL(website),
    title: {
      default: `${siteName} - Soins Esthétiques Haut de Gamme`,
      template: `%s | ${siteName}`
    },
    description: siteDescription,
    keywords: [
      `institut beauté ${city}`,
      `soin visage ${city}`,
      "hydrofacial",
      "bb glow",
      "led thérapie",
      "microneedling",
      "esthétique haut de gamme",
      siteName,
      "soins anti-âge",
      "rajeunissement visage",
      "institut esthétique",
      "soin du visage premium",
      "réservation en ligne beauté",
      `esthéticienne ${city}`,
      "traitement visage"
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    // Open Graph (Facebook, LinkedIn, WhatsApp)
    openGraph: {
      title: `${siteName} - Soins Esthétiques Premium`,
      description: siteDescription,
      url: website,
      siteName: siteName,
      images: [
        {
          url: config.logoUrl || "/logo-laia-skin.png",
          width: 1200,
          height: 630,
          alt: `${siteName} - Soins Esthétiques Premium`,
        },
      ],
      locale: "fr_FR",
      type: "website",
    },
    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: `${siteName} - Soins Esthétiques Premium`,
      description: siteDescription,
      images: [config.logoUrl || "/logo-laia-skin.png"],
    },
    // Robots & SEO
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    // Canonical URL
    alternates: {
      canonical: website,
    },
    // Vérification pour Google Search Console (à configurer)
    verification: {
      google: "votre-code-verification-google",
      // yandex: "votre-code-yandex",
      // bing: "votre-code-bing",
    },
    // Catégorie du site
    category: "beauty",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable} ${cormorant.variable} ${playfair.variable} ${lora.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body
        className={`${inter.className} antialiased`}
      >
        <JsonLd />
        <QueryProvider>
          {children}
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}

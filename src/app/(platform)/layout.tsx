import type { Metadata } from "next";
import CookieConsent from "@/components/platform/CookieConsent";
import CrispChat from "@/components/CrispChat";

export const metadata: Metadata = {
  title: "LAIA Connect - Logiciel de Gestion pour Instituts de Beauté | SaaS",
  description: "Solution SaaS complète pour instituts de beauté : site web, réservation en ligne, CRM, fidélité, emailing et WhatsApp. À partir de 49€/mois. Essai gratuit 30 jours.",
  keywords: "logiciel institut beauté, saas beauté, réservation en ligne, gestion institut, CRM beauté, site web institut",
  authors: [{ name: "LAIA Connect" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://laiaconnect.fr",
    title: "LAIA Connect - Logiciel SaaS pour Instituts de Beauté",
    description: "Gérez votre institut de beauté avec une solution tout-en-un : site web, réservations, CRM, fidélité. Dès 49€/mois.",
    siteName: "LAIA Connect",
    images: [
      {
        url: "/og-image-laia-connect.png",
        width: 1200,
        height: 630,
        alt: "LAIA Connect - Logiciel de Gestion pour Instituts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LAIA Connect - Logiciel pour Instituts de Beauté",
    description: "Solution SaaS complète : site web + réservations + CRM. Dès 49€/mois.",
    images: ["/og-image-laia-connect.png"],
  },
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
  alternates: {
    canonical: "https://laiaconnect.fr",
  },
};

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <CookieConsent />
      {process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID && (
        <CrispChat websiteId={process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID} />
      )}
    </>
  );
}

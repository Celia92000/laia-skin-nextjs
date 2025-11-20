"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Sparkles, CheckCircle } from "lucide-react";
import { useConfig } from "@/hooks/useConfig";

interface FooterProps {
  organizationData?: any;
}

export default function Footer({ organizationData }: FooterProps) {
  const pathname = usePathname();
  const { config } = useConfig();
  const [orgData, setOrgData] = useState<any>(organizationData || null);
  const organizationName = orgData?.name || config.siteName || 'MON INSTITUT';

  // Couleurs du footer
  const footerTextColor = '#8b6f47'; // Marron
  const accentColor = footerTextColor; // Alias pour la cohérence
  const footerBgGradient = 'linear-gradient(135deg, #fdfbf7 0%, #f8f6f0 100%)'; // Blanc cassé-beige

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Charger les données de l'organisation seulement si pas déjà passées en props
    if (!organizationData) {
      const loadOrgData = async () => {
        try {
          const res = await fetch('/api/organization/current');
          if (res.ok) {
            const data = await res.json();
            setOrgData(data);
          }
        } catch (error) {
          console.log('Could not load organization data');
        }
      };

      loadOrgData();
    }
  }, [organizationData]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSubscribed(true);
        setEmail("");
        setTimeout(() => setSubscribed(false), 5000);
      } else {
        setError(data.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer style={{ background: footerBgGradient, color: footerTextColor }}>
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 relative">
                <Image
                  src={orgData?.config?.logoUrl || config.logoUrl || "/logo-laia-skin.png"}
                  alt={`${organizationName} Logo`}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h3 className="text-xl font-playfair tracking-normal" style={{ color: footerTextColor }}>{pathname === '/login' ? 'LAIA CONNECT' : organizationName.toUpperCase()}</h3>
            </div>
            <p className="text-base leading-relaxed mb-4 font-playfair italic" style={{ color: footerTextColor }}>
              {orgData?.config?.siteTagline || config.siteTagline || 'Une peau respectée, une beauté révélée'}
            </p>
            <div className="flex gap-3">
              {(orgData?.config?.instagram || config.instagram) && (
                <a
                  href={orgData?.config?.instagram || config.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full transition-all flex items-center justify-center hover:opacity-70"
                  style={{ backgroundColor: `${footerTextColor}15`, color: footerTextColor }}
                  title="Suivez-nous sur Instagram"
                >
                  <Instagram size={18} />
                </a>
              )}
              {(orgData?.config?.facebook || config.facebook) && (
                <a
                  href={orgData?.config?.facebook || config.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full transition-all flex items-center justify-center hover:opacity-70"
                  style={{ backgroundColor: `${footerTextColor}15`, color: footerTextColor }}
                  title="Suivez-nous sur Facebook"
                >
                  <Facebook size={18} />
                </a>
              )}
              {(orgData?.config?.tiktok || config.tiktok) && (
                <a
                  href={orgData?.config?.tiktok || config.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full transition-all flex items-center justify-center hover:opacity-70"
                  style={{ backgroundColor: `${footerTextColor}15`, color: footerTextColor }}
                  title="Suivez-nous sur TikTok"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.37 6.37 0 0 0-1-.05A6.34 6.34 0 0 0 3 15.7a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.44a8.27 8.27 0 0 0 4.74 1.48V6.46a4.79 4.79 0 0 1-1.83.23z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-playfair text-xl mb-4" style={{ color: footerTextColor }}>Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/prestations" className="text-base transition-colors hover:opacity-70" style={{ color: footerTextColor }}>
                  Mes prestations
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="text-base transition-colors hover:opacity-70" style={{ color: footerTextColor }}>
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/reservation" className="text-base transition-colors hover:opacity-70" style={{ color: footerTextColor }}>
                  Réservation
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-base transition-colors hover:opacity-70" style={{ color: footerTextColor }}>
                  Espace client
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-base transition-colors hover:opacity-70" style={{ color: footerTextColor }}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-playfair text-xl mb-4" style={{ color: footerTextColor }}>Mes prestations</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/services/hydro-naissance" className="text-base transition-colors hover:opacity-70" style={{ color: footerTextColor }}>
                  Hydro'Naissance
                </Link>
              </li>
              <li>
                <Link href="/services/hydro-cleaning" className="text-base transition-colors hover:opacity-70" style={{ color: footerTextColor }}>
                  Hydro'Cleaning
                </Link>
              </li>
              <li>
                <Link href="/services/renaissance" className="text-base transition-colors hover:opacity-70" style={{ color: footerTextColor }}>
                  Renaissance
                </Link>
              </li>
              <li>
                <Link href="/services/bb-glow" className="text-base transition-colors hover:opacity-70" style={{ color: footerTextColor }}>
                  BB Glow
                </Link>
              </li>
              <li>
                <Link href="/services/led-therapie" className="text-base transition-colors hover:opacity-70" style={{ color: footerTextColor }}>
                  LED Thérapie
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-playfair text-xl mb-4" style={{ color: footerTextColor }}>Contact</h4>
            <ul className="space-y-3">
              {(orgData?.config?.address || config.address) && (
                <li className="flex items-start gap-3">
                  <MapPin size={16} style={{ color: footerTextColor }} className="mt-0.5 flex-shrink-0" />
                  <span className="text-base" style={{ color: footerTextColor }}>
                    {orgData?.config?.address || config.address}
                    {(orgData?.config?.city || config.city) && (orgData?.config?.postalCode || config.postalCode) && <><br />{orgData?.config?.postalCode || config.postalCode} {orgData?.config?.city || config.city}</>}
                  </span>
                </li>
              )}
              {(orgData?.config?.instagram || config.instagram) && (
                <li className="flex items-center gap-3">
                  <Instagram size={16} style={{ color: footerTextColor }} className="flex-shrink-0" />
                  <a href={orgData?.config?.instagram || config.instagram} target="_blank" rel="noopener noreferrer" className="text-base transition-colors hover:opacity-70" style={{ color: footerTextColor }}>
                    @{(orgData?.config?.instagram || config.instagram).split('/').pop() || 'laia.skin'}
                  </a>
                </li>
              )}
              {(orgData?.config?.email || config.email) && (
                <li className="flex items-center gap-3">
                  <Mail size={16} style={{ color: footerTextColor }} className="flex-shrink-0" />
                  <a href={`mailto:${orgData?.config?.email || config.email}`} className="text-base transition-colors hover:opacity-70" style={{ color: footerTextColor }}>
                    {orgData?.config?.email || config.email}
                  </a>
                </li>
              )}
              {(orgData?.config?.phone || config.phone) && (
                <li className="flex items-center gap-3">
                  <Phone size={16} style={{ color: footerTextColor }} className="flex-shrink-0" />
                  <a href={`tel:${orgData?.config?.phone || config.phone}`} className="text-base transition-colors hover:opacity-70" style={{ color: footerTextColor }}>
                    {orgData?.config?.phone || config.phone}
                  </a>
                </li>
              )}
              {(orgData?.config?.businessHours || config.businessHours) && (
                <li className="flex items-start gap-3">
                  <Clock size={16} style={{ color: footerTextColor }} className="mt-0.5 flex-shrink-0" />
                  <span className="text-base" style={{ color: footerTextColor }}>
                    {(() => {
                      try {
                        const hours = JSON.parse(orgData?.config?.businessHours || config.businessHours);
                        return Object.entries(hours).slice(0, 2).map(([day, time], i) => (
                          <span key={day}>
                            {i > 0 && <br />}
                            {day}: {time as string}
                          </span>
                        ));
                      } catch {
                        return 'Lun-Ven: 14h-20h';
                      }
                    })()}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t" style={{ borderColor: `${footerTextColor}20` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Sparkles style={{ color: footerTextColor }} size={20} />
              <div>
                <h5 className="font-serif" style={{ color: footerTextColor }}>Newsletter exclusive</h5>
                <p className="text-sm" style={{ color: `${footerTextColor}dd` }}>Recevez mes offres et actualités</p>
              </div>
            </div>
            {subscribed ? (
              <div className="flex items-center gap-2 px-6 py-3 bg-green-600/20 border border-green-500/30 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-600 font-medium">Inscription réussie ! Bienvenue 🎉</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="px-4 py-2 bg-white/50 border rounded-full text-sm focus:outline-none focus:bg-white transition-all w-full sm:w-64"
                  style={{ borderColor: `${footerTextColor}40`, color: footerTextColor }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 text-white rounded-full hover:shadow-lg transition-all text-sm font-medium whitespace-nowrap w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: footerTextColor }}
                >
                  {loading ? "Inscription..." : "S'inscrire"}
                </button>
              </form>
            )}
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t" style={{ borderColor: `${footerTextColor}20` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm" style={{ color: `${footerTextColor}cc` }}>
              © {new Date().getFullYear()} {pathname === '/login' ? 'LAIA CONNECT' : organizationName.toUpperCase()}. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <Link href="/mentions-legales" className="text-sm transition-colors hover:opacity-70" style={{ color: `${footerTextColor}cc` }}>
                Mentions légales
              </Link>
              <Link href="/politique-confidentialite" className="text-sm transition-colors hover:opacity-70" style={{ color: `${footerTextColor}cc` }}>
                Politique de confidentialité
              </Link>
              <Link href="/cgv" className="text-sm transition-colors hover:opacity-70" style={{ color: `${footerTextColor}cc` }}>
                CGV
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
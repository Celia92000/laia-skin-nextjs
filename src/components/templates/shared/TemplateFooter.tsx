'use client';

import Image from 'next/image';

interface TemplateFooterProps {
  organization: {
    name: string;
    description?: string;
    primaryColor: string;
    secondaryColor?: string;
    logoUrl?: string;
    email?: string;
    contactEmail?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    linkedin?: string;
    whatsapp?: string;
    youtube?: string;
    businessHours?: any;
    siret?: string;
    legalNotice?: string;
    privacyPolicy?: string;
    termsAndConditions?: string;
  };
  theme?: 'dark' | 'light';
}

export default function TemplateFooter({ organization, theme = 'dark' }: TemplateFooterProps) {
  const isDark = theme === 'dark';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-white/70' : 'text-gray-600';
  const textMuted = isDark ? 'text-white/40' : 'text-gray-400';
  const border = isDark ? 'border-white/10' : 'border-gray-200';
  const bgHover = isDark ? 'hover:text-white' : 'hover:text-gray-900';

  return (
    <footer className={`border-t ${border} py-16 px-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Footer Grid */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Colonne 1 - Informations */}
          <div>
            {organization.logoUrl ? (
              <Image
                src={organization.logoUrl}
                alt={organization.name}
                width={120}
                height={40}
                className="h-10 w-auto object-contain mb-4"
              />
            ) : (
              <h3 className={`text-2xl font-black mb-2 ${textPrimary}`} style={{ color: organization.primaryColor }}>
                {organization.name}
              </h3>
            )}
            <p className={`${textSecondary} text-sm mb-4`}>
              {organization.description || 'Institut de beauté'}
            </p>
            {organization.siret && (
              <p className={`${textMuted} text-xs`}>SIRET: {organization.siret}</p>
            )}
          </div>

          {/* Colonne 2 - Contact */}
          <div>
            <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${textPrimary}`} style={{ color: organization.primaryColor }}>
              Contact
            </h4>
            <div className={`space-y-2 text-sm ${textSecondary}`}>
              {organization.phone && (
                <div>
                  <a href={`tel:${organization.phone}`} className={`${bgHover} transition-colors`}>
                    {organization.phone}
                  </a>
                </div>
              )}
              {(organization.email || organization.contactEmail) && (
                <div>
                  <a
                    href={`mailto:${organization.email || organization.contactEmail}`}
                    className={`${bgHover} transition-colors`}
                  >
                    {organization.email || organization.contactEmail}
                  </a>
                </div>
              )}
              {organization.address && (
                <div className="mt-4">
                  <div>{organization.address}</div>
                  <div>{organization.postalCode} {organization.city}</div>
                </div>
              )}
            </div>
          </div>

          {/* Colonne 3 - Horaires */}
          {organization.businessHours && (
            <div>
              <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${textPrimary}`} style={{ color: organization.primaryColor }}>
                Horaires
              </h4>
              <div className={`space-y-1 text-sm ${textSecondary}`}>
                {Object.entries(organization.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between gap-4">
                    <span className="capitalize">{day}</span>
                    <span className={textMuted}>{hours as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Colonne 4 - Réseaux sociaux */}
          <div>
            <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${textPrimary}`} style={{ color: organization.primaryColor }}>
              Suivez-nous
            </h4>
            <div className="flex flex-col gap-3">
              {organization.facebook && (
                <a
                  href={organization.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${textSecondary} ${bgHover} transition-colors flex items-center gap-2`}
                >
                  <span className="text-lg">📘</span> Facebook
                </a>
              )}
              {organization.instagram && (
                <a
                  href={organization.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${textSecondary} ${bgHover} transition-colors flex items-center gap-2`}
                >
                  <span className="text-lg">📸</span> Instagram
                </a>
              )}
              {organization.tiktok && (
                <a
                  href={organization.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${textSecondary} ${bgHover} transition-colors flex items-center gap-2`}
                >
                  <span className="text-lg">🎵</span> TikTok
                </a>
              )}
              {organization.linkedin && (
                <a
                  href={organization.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${textSecondary} ${bgHover} transition-colors flex items-center gap-2`}
                >
                  <span className="text-lg">💼</span> LinkedIn
                </a>
              )}
              {organization.youtube && (
                <a
                  href={organization.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${textSecondary} ${bgHover} transition-colors flex items-center gap-2`}
                >
                  <span className="text-lg">📺</span> YouTube
                </a>
              )}
              {organization.whatsapp && (
                <a
                  href={`https://wa.me/${organization.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${textSecondary} ${bgHover} transition-colors flex items-center gap-2`}
                >
                  <span className="text-lg">💬</span> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className={`border-t ${border} pt-8`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Mentions légales */}
            <div className={`flex flex-wrap gap-4 text-sm ${textMuted}`}>
              {organization.legalNotice && (
                <a href="/mentions-legales" className={`${bgHover} transition-colors`}>
                  Mentions légales
                </a>
              )}
              {organization.privacyPolicy && (
                <a href="/politique-confidentialite" className={`${bgHover} transition-colors`}>
                  Politique de confidentialité
                </a>
              )}
              {organization.termsAndConditions && (
                <a href="/cgv" className={`${bgHover} transition-colors`}>
                  CGV
                </a>
              )}
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className={`${textMuted} text-sm`}>
                © {new Date().getFullYear()} {organization.name}. All rights reserved.
              </p>
              <p className={`${textMuted} text-xs mt-1 opacity-50`}>
                Powered by{' '}
                <a
                  href="https://laiaconnect.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-100 transition-opacity"
                >
                  LAIA Connect
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

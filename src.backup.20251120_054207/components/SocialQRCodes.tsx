'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Instagram, Facebook, Phone, Share2, X, Image as ImageIcon } from 'lucide-react';
import { useConfig } from '@/hooks/useConfig';
import Image from 'next/image';
import Link from 'next/link';

interface SocialQRCodesProps {
  showTitle?: boolean;
  size?: 'small' | 'medium' | 'large';
  showGallery?: boolean;
}

interface GalleryPhoto {
  id: string;
  url: string;
  title: string;
  type: string;
  link?: string;
}

export function SocialQRCodes({ showTitle = true, size = 'medium', showGallery = true }: SocialQRCodesProps) {
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const { config } = useConfig();

  // Charger les photos de galerie
  useEffect(() => {
    if (showGallery && config.showGallerySection) {
      fetchGalleryPhotos();
    }
  }, [showGallery, config.showGallerySection]);

  const fetchGalleryPhotos = async () => {
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        setGalleryPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la galerie:', error);
    } finally {
      setLoadingGallery(false);
    }
  };

  // Ne pas afficher si la section est désactivée
  if (config.showQRCodesSection === false && config.showGallerySection === false) {
    return null;
  }

  // Extraire le handle Instagram de l'URL
  const getInstagramHandle = (url: string) => {
    if (!url) return '';
    const match = url.match(/instagram\.com\/([^/?]+)/);
    return match ? `@${match[1]}` : '';
  };

  // Extraire le nom Facebook de l'URL
  const getFacebookHandle = (url: string) => {
    if (!url) return '';
    const match = url.match(/facebook\.com\/([^/?]+)/);
    return match ? match[1] : config.siteName || 'Mon Institut';
  };

  // Formater le numéro WhatsApp
  const formatWhatsAppNumber = (phone: string) => {
    if (!phone) return '';
    // Supprimer tous les caractères non numériques sauf le +
    const cleaned = phone.replace(/[^\d+]/g, '');
    return cleaned;
  };

  const socialLinks: any = {};

  if (config.instagram) {
    socialLinks.instagram = {
      url: config.instagram,
      icon: <Instagram className="w-8 h-8" />,
      name: 'Instagram',
      color: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500',
      bgColor: 'from-purple-50 to-pink-50',
      handle: getInstagramHandle(config.instagram)
    };
  }

  if (config.facebook) {
    socialLinks.facebook = {
      url: config.facebook,
      icon: <Facebook className="w-8 h-8" />,
      name: 'Facebook',
      color: 'bg-[#1877F2]',
      bgColor: 'from-blue-50 to-blue-100',
      handle: getFacebookHandle(config.facebook)
    };
  }

  if (config.phone || config.whatsapp) {
    const whatsappNumber = config.whatsapp || formatWhatsAppNumber(config.phone || '');
    socialLinks.whatsapp = {
      url: `https://wa.me/${whatsappNumber.replace(/\+/g, '')}`,
      icon: <Phone className="w-8 h-8" />,
      name: 'WhatsApp',
      color: 'bg-[#25D366]',
      bgColor: 'from-green-50 to-green-100',
      handle: config.phone || whatsappNumber
    };
  }

  const qrSizes = {
    small: 120,
    medium: 160,
    large: 200
  };

  const currentSize = qrSizes[size];

  // Ajouter TikTok
  if (config.tiktok) {
    socialLinks.tiktok = {
      url: config.tiktok,
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
      name: 'TikTok',
      color: 'bg-black',
      bgColor: 'from-gray-50 to-gray-100',
      handle: config.tiktok?.split('/')?.filter(x => x)?.pop()?.replace('@', '') || 'compte'
    };
  }

  // Couleurs dynamiques
  const primaryColor = config.primaryColor || '#d4b5a0';
  const accentColor = config.accentColor || '#2c3e50';

  // Si aucun réseau social n'est configuré et que la section est désactivée
  if (Object.keys(socialLinks).length === 0 && !config.showGallerySection) {
    return null;
  }

  // Titres configurables
  const qrCodesTitle = config.qrCodesSectionTitle || 'Suivez-nous sur les réseaux';
  const qrCodesDescription = config.qrCodesSectionDescription || 'Scannez les QR codes pour nous rejoindre et ne manquer aucune de nos actualités';
  const galleryTitle = config.gallerySectionTitle || 'Notre galerie';
  const galleryDescription = config.gallerySectionDescription || 'Découvrez nos prestations et nos réalisations';

  return (
    <>
      <div>
        {/* Section QR Codes */}
        {config.showQRCodesSection !== false && Object.keys(socialLinks).length > 0 && showTitle && (
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-serif font-bold mb-3 flex items-center justify-center gap-3" style={{ color: accentColor }}>
              <Share2 className="w-7 h-7" style={{ color: primaryColor }} />
              {qrCodesTitle}
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: `${accentColor}b3` }}>
              {qrCodesDescription}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(socialLinks).map(([key, social]) => (
            <div
              key={key}
              className="group relative"
              onClick={() => setSelectedQR(key)}
            >
              {/* Carte principale */}
              <div className={`relative bg-gradient-to-br ${social.bgColor} rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200/50 hover:scale-105`}>

                {/* Icône en haut */}
                <div className="flex justify-center mb-6">
                  <div className={`${social.color} text-white rounded-2xl p-5 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    {social.icon}
                  </div>
                </div>

                {/* QR Code */}
                <div className="bg-white p-4 rounded-2xl shadow-md mb-6 flex justify-center items-center">
                  <QRCode
                    value={social.url}
                    size={currentSize}
                    level="H"
                    fgColor="#2c3e50"
                    bgColor="#ffffff"
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  />
                </div>

                {/* Informations */}
                <div className="text-center space-y-2">
                  <p className="font-bold text-xl text-[#2c3e50]">{social.name}</p>
                  <p className="text-sm font-medium text-[#2c3e50]/60">{social.handle}</p>
                  <p className="text-xs text-[#2c3e50]/50 italic mt-3">Scannez pour suivre</p>
                </div>

                {/* Indicateur hover */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-2 h-2 rounded-full bg-[#d4b5a0] animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section partageable - design amélioré */}
        {config.showQRCodesSection !== false && Object.keys(socialLinks).length > 0 && (
          <div className="mt-10 bg-gradient-to-br rounded-2xl p-6 border shadow-md" style={{
            backgroundImage: `linear-gradient(to bottom right, ${primaryColor}10, rgba(255,255,255,1), ${primaryColor}10)`,
            borderColor: `${primaryColor}33`
          }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="font-bold text-lg mb-1 flex items-center gap-2 justify-center md:justify-start" style={{ color: accentColor }}>
                  <Share2 className="w-5 h-5" style={{ color: primaryColor }} />
                  Partagez notre institut
                </p>
                <p className="text-sm" style={{ color: `${accentColor}b3` }}>
                  Recommandez-nous et profitez de réductions exclusives
                </p>
              </div>
              <button
                onClick={() => {
                  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
                  if (navigator.share) {
                    navigator.share({
                      title: config.siteName || 'Mon Institut de Beauté',
                      text: `Découvrez ${config.siteName || 'Mon Institut de Beauté'}, ${config.siteTagline || 'votre expert beauté'}`,
                      url: siteUrl
                    });
                  } else {
                    navigator.clipboard.writeText(siteUrl);
                    alert('Lien copié dans le presse-papier !');
                  }
                }}
                className="px-6 py-3 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 font-semibold"
                style={{ background: `linear-gradient(to right, ${primaryColor}, ${config.secondaryColor || primaryColor})` }}
              >
                <Share2 className="w-5 h-5" />
                Partager maintenant
              </button>
            </div>
          </div>
        )}

        {/* Section Galerie Photos */}
        {showGallery && config.showGallerySection && (
          <div className="mt-16">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-serif font-bold mb-3 flex items-center justify-center gap-3" style={{ color: accentColor }}>
                <ImageIcon className="w-7 h-7" style={{ color: primaryColor }} />
                {galleryTitle}
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: `${accentColor}b3` }}>
                {galleryDescription}
              </p>
            </div>

            {/* Grille de galerie */}
            {loadingGallery ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl overflow-hidden shadow-md animate-pulse"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  />
                ))}
              </div>
            ) : galleryPhotos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryPhotos.map((photo) => {
                  const PhotoWrapper = photo.link ? Link : 'div';
                  const wrapperProps = photo.link ? { href: photo.link } : {};

                  return (
                    <PhotoWrapper
                      key={photo.id}
                      {...wrapperProps}
                      className="aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group relative"
                    >
                      <Image
                        src={photo.url}
                        alt={photo.title || 'Photo de galerie'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                      {photo.title && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          {photo.title}
                        </div>
                      )}
                    </PhotoWrapper>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 mx-auto mb-4" style={{ color: `${primaryColor}40` }} />
                <p className="text-sm" style={{ color: `${accentColor}80` }}>
                  Suivez-nous sur Instagram pour découvrir nos réalisations !
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal QR Code agrandi */}
      {selectedQR && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedQR(null)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-[#2c3e50]">
                {socialLinks[selectedQR as keyof typeof socialLinks].name}
              </h3>
              <button
                onClick={() => setSelectedQR(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Icône */}
            <div className="flex justify-center mb-6">
              <div className={`${socialLinks[selectedQR as keyof typeof socialLinks].color} text-white rounded-2xl p-4 shadow-lg`}>
                {socialLinks[selectedQR as keyof typeof socialLinks].icon}
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-gray-50 p-6 rounded-2xl mb-6 flex justify-center border-2 border-gray-100">
              <QRCode
                value={socialLinks[selectedQR as keyof typeof socialLinks].url}
                size={250}
                level="H"
                fgColor="#2c3e50"
                bgColor="transparent"
              />
            </div>

            <div className="text-center space-y-4">
              <div>
                <p className="text-lg font-bold text-[#2c3e50] mb-1">
                  {socialLinks[selectedQR as keyof typeof socialLinks].handle}
                </p>
                <p className="text-sm text-[#2c3e50]/60">
                  Scannez ce code avec votre téléphone
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={socialLinks[selectedQR as keyof typeof socialLinks].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-3 px-8 py-4 ${socialLinks[selectedQR as keyof typeof socialLinks].color} text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 w-full justify-center`}
                >
                  {socialLinks[selectedQR as keyof typeof socialLinks].icon}
                  Ouvrir {socialLinks[selectedQR as keyof typeof socialLinks].name}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
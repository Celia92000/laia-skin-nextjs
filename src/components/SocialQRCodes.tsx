'use client';

import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Instagram, Facebook, Phone, Share2, X } from 'lucide-react';

interface SocialQRCodesProps {
  showTitle?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function SocialQRCodes({ showTitle = true, size = 'medium' }: SocialQRCodesProps) {
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  const socialLinks = {
    instagram: {
      url: 'https://instagram.com/laiaskin_institut',
      icon: <Instagram className="w-8 h-8" />,
      name: 'Instagram',
      color: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500',
      bgColor: 'from-purple-50 to-pink-50',
      handle: '@laiaskin_institut'
    },
    facebook: {
      url: 'https://facebook.com/laiaskininstitut',
      icon: <Facebook className="w-8 h-8" />,
      name: 'Facebook',
      color: 'bg-[#1877F2]',
      bgColor: 'from-blue-50 to-blue-100',
      handle: 'LAIA SKIN Institut'
    },
    whatsapp: {
      url: 'https://wa.me/33631107531',
      icon: <Phone className="w-8 h-8" />,
      name: 'WhatsApp',
      color: 'bg-[#25D366]',
      bgColor: 'from-green-50 to-green-100',
      handle: '+33 6 31 10 75 31'
    }
  };

  const qrSizes = {
    small: 120,
    medium: 160,
    large: 200
  };

  const currentSize = qrSizes[size];

  return (
    <>
      <div>
        {showTitle && (
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-serif font-bold text-[#2c3e50] mb-3 flex items-center justify-center gap-3">
              <Share2 className="w-7 h-7 text-[#d4b5a0]" />
              Suivez-nous sur les réseaux
            </h2>
            <p className="text-lg text-[#2c3e50]/70 max-w-2xl mx-auto">
              Scannez les QR codes pour nous rejoindre et ne manquer aucune de nos actualités
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
        <div className="mt-10 bg-gradient-to-br from-[#d4b5a0]/10 via-white to-[#c4a590]/10 rounded-2xl p-6 border border-[#d4b5a0]/20 shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="font-bold text-lg text-[#2c3e50] mb-1 flex items-center gap-2 justify-center md:justify-start">
                <Share2 className="w-5 h-5 text-[#d4b5a0]" />
                Partagez notre institut
              </p>
              <p className="text-sm text-[#2c3e50]/70">
                Recommandez-nous et profitez de réductions exclusives
              </p>
            </div>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'LAIA SKIN Institut',
                    text: 'Découvrez LAIA SKIN Institut, votre expert beauté',
                    url: 'https://laia-skin-institut.vercel.app'
                  });
                } else {
                  navigator.clipboard.writeText('https://laia-skin-institut.vercel.app');
                  alert('Lien copié dans le presse-papier !');
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c4a590] text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 font-semibold"
            >
              <Share2 className="w-5 h-5" />
              Partager maintenant
            </button>
          </div>
        </div>
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
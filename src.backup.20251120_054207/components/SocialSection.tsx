'use client';

import React from 'react';
import { SocialQRCodes } from './SocialQRCodes';
import { useConfig } from '@/hooks/useConfig';

export function SocialSection() {
  const { config } = useConfig();

  // Ne pas afficher la section si les QR codes et la galerie sont désactivés
  if (config.showQRCodesSection === false && config.showGallerySection === false) {
    return null;
  }

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-[#f9f5f2] via-[#fef8f3] to-[#fff5ee]">
      {/* Décoration subtile en arrière-plan */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#d4b5a0] rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#c4a590] rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* QR Codes et Galerie avec titres configurables */}
        <SocialQRCodes showTitle={true} size="medium" showGallery={true} />

        {/* Programme de Parrainage redesigné */}
        <div className="mt-16">
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-white to-[#f9f5f2] rounded-3xl shadow-2xl overflow-hidden">
              {/* Accent coloré en haut */}
              <div className="h-2 bg-gradient-to-r from-[#d4b5a0] via-[#c4a590] to-[#d4b5a0]"></div>

              <div className="p-8 md:p-12 text-center">
                <div className="inline-block mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#d4b5a0] to-[#c4a590] rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#2c3e50] mb-4">
                  Programme de Parrainage
                </h3>

                <p className="text-lg text-[#2c3e50]/80 mb-6 max-w-2xl mx-auto leading-relaxed">
                  Partagez votre expérience LAIA avec vos proches et profitez de{' '}
                  <span className="font-bold text-[#d4b5a0]">15€ de réduction</span>
                  {' '}sur votre prochain soin pour chaque ami parrainé !
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                  <div className="flex items-center gap-2 text-[#2c3e50]/70">
                    <svg className="w-5 h-5 text-[#d4b5a0]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Inscription gratuite</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#2c3e50]/70">
                    <svg className="w-5 h-5 text-[#d4b5a0]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Parrainages illimités</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#2c3e50]/70">
                    <svg className="w-5 h-5 text-[#d4b5a0]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Récompenses cumulables</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/login"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#d4b5a0] to-[#c4a590] text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    Rejoindre le programme
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>

                  <a
                    href="/parrainage"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-[#d4b5a0] text-[#d4b5a0] rounded-full font-semibold text-lg hover:bg-[#d4b5a0] hover:text-white hover:shadow-lg transition-all duration-300"
                  >
                    En savoir plus
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
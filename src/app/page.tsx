"use client";

import Link from "next/link";
import { Clock, ArrowRight, Sparkles, Star } from 'lucide-react';
import ServicesList from '@/components/ServicesList';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[500px] sm:min-h-[600px] md:min-h-[650px] lg:min-h-[700px] bg-gradient-to-br from-[#f8f5f0] via-white to-[#fdf8f3] flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-playfair text-[#2c3e50] leading-tight">
                Une peau respectée,<br />
                <span className="text-[#d4b5a0] italic">une beauté révélée</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-[#2c3e50]/70 max-w-xl mx-auto lg:mx-0">
                Offrez à votre peau les soins d'exception qu'elle mérite dans un écrin de douceur et d'expertise
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4 sm:pt-6">
                <Link
                  href="/reservation"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-full hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm sm:text-base"
                >
                  <span>Réserver mon soin</span>
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                
                <Link
                  href="/prestations"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#2c3e50] rounded-full border-2 border-[#d4b5a0]/20 hover:border-[#d4b5a0] hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm sm:text-base"
                >
                  <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#d4b5a0]" />
                  <span>Découvrir nos Soins</span>
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#d4b5a0]/20 to-transparent rounded-full blur-3xl"></div>
                <img 
                  src="/hero-beauty.jpg" 
                  alt="LAIA SKIN Institut"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-normal text-[#2c3e50] mb-4 tracking-normal">
              Mes Prestations
            </h2>
            <p className="font-inter text-base md:text-lg text-[#2c3e50]/60 max-w-2xl mx-auto tracking-normal">
              Découvrez notre gamme exclusive de soins innovants pour une peau éclatante et rajeunie
            </p>
          </div>

          <ServicesList />

          <div className="text-center mt-12">
            <Link
              href="/prestations"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-full hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
            >
              <span>Voir toutes nos prestations</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, Sparkles, Star } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration: number;
  category?: string;
  image?: string;
  featured: boolean;
  active: boolean;
}

export default function ServicesList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data.filter((s: Service) => s.active));
      }
    } catch (error) {
      console.error('Erreur chargement services:', error);
      // Services par défaut en cas d'erreur
      setServices([
        {
          id: '1',
          slug: 'hydro-naissance',
          name: "Hydro'Naissance",
          description: 'Le soin signature qui révolutionne votre peau',
          price: 110,
          duration: 75,
          category: 'Soins Signature',
          featured: true,
          active: true
        },
        {
          id: '2',
          slug: 'hydro-cleaning',
          name: "Hydro'Cleaning",
          description: 'Nettoyage profond et hydratation',
          price: 70,
          duration: 60,
          category: 'Soins Essentiels',
          featured: false,
          active: true
        },
        {
          id: '3',
          slug: 'renaissance',
          name: 'Renaissance',
          description: 'Soin anti-âge global',
          price: 90,
          duration: 60,
          category: 'Soins Anti-âge',
          featured: true,
          active: true
        },
        {
          id: '4',
          slug: 'bb-glow',
          name: 'BB Glow',
          description: 'Teint parfait effet bonne mine',
          price: 120,
          duration: 90,
          category: 'Soins Innovants',
          featured: true,
          active: true
        },
        {
          id: '5',
          slug: 'led-therapie',
          name: 'LED Thérapie',
          description: 'Technologie avancée de photomodulation',
          price: 50,
          duration: 30,
          category: 'Soins Technologiques',
          featured: false,
          active: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const sortedServices = [...services].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {sortedServices.map((service) => (
        <Link
          key={service.id}
          href={`/services/${service.slug}`}
          className="group block h-full"
        >
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 h-full flex flex-col min-h-[400px]">
            {/* Image/Header */}
            <div className="h-48 bg-gradient-to-br from-[#d4b5a0]/30 to-[#c9a084]/30 relative overflow-hidden flex-shrink-0">
              {service.featured && (
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-full shadow-lg">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold uppercase tracking-wider">Soin Signature</span>
                </div>
              )}
              
              <div className="w-full h-full flex items-center justify-center">
                <Sparkles className="w-20 h-20 text-[#d4b5a0]/40" />
              </div>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-6 text-white w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Découvrir ce soin</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-2xl font-bold text-[#2c3e50] mb-3 group-hover:text-[#d4b5a0] transition-colors">
                {service.name}
              </h3>
              
              <p className="text-[#2c3e50]/70 mb-4 line-clamp-2">
                {service.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-[#2c3e50]/60">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration} min</span>
                </div>
                
                {service.category && (
                  <span className="text-xs px-3 py-1 bg-[#d4b5a0]/10 text-[#d4b5a0] rounded-full">
                    {service.category}
                  </span>
                )}
              </div>

              {/* Prix */}
              <div className="border-t pt-4 mt-auto">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-[#d4b5a0]">
                    {service.price}€
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
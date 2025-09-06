'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, Euro, Check, AlertCircle, ArrowRight, Star, ChevronRight, Info, Sparkles, FileText, Image } from 'lucide-react';

interface Service {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string | null;
  price: number;
  promoPrice: number | null;
  duration: number;
  forfaitPrice: number | null;
  forfaitPromo: number | null;
  active: boolean;
  featured: boolean;
  canBeOption: boolean;
  order: number;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  benefits: string | null;
  process: string | null;
  recommendations: string | null;
  contraindications: string | null;
  mainImage: string | null;
  gallery: string | null;
  videoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export default function ServicePage({ params }: ServicePageProps) {
  const [service, setService] = useState<Service | null>(null);
  const [otherServices, setOtherServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadService() {
      const { slug } = await params;
      
      try {
        // Charger le service
        const serviceRes = await fetch(`/api/services/${slug}`);
        if (!serviceRes.ok) {
          notFound();
        }
        const serviceData = await serviceRes.json();
        setService(serviceData);

        // Charger les autres services
        const otherRes = await fetch(`/api/services?exclude=${slug}&limit=3`);
        const otherData = await otherRes.json();
        setOtherServices(otherData);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    loadService();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0]"></div>
      </div>
    );
  }

  if (!service) {
    notFound();
  }

  const benefits = service.benefits ? JSON.parse(service.benefits) : [];
  const process = service.process ? JSON.parse(service.process) : [];
  const gallery = service.gallery ? JSON.parse(service.gallery) : [];
  const discount = service.promoPrice ? Math.round((1 - service.promoPrice / service.price) * 100) : 0;

  const tabs = [
    { id: 'description', label: 'Description', icon: <Info className="w-4 h-4" /> },
    { id: 'protocole', label: 'Protocole', icon: <FileText className="w-4 h-4" /> },
    { id: 'tarifs', label: 'Tarifs', icon: <Euro className="w-4 h-4" /> },
    { id: 'galerie', label: 'Galerie', icon: <Image className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfbf7] to-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d4b5a0]/10 to-[#c9a084]/10"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Texte et infos */}
            <div>
              {service.featured && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-full mb-4">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-bold uppercase tracking-wider text-sm">Soin Signature</span>
                </div>
              )}
              
              <h1 className="text-4xl md:text-5xl font-bold text-[#2c3e50] mb-4">
                {service.name}
              </h1>
              
              <p className="text-xl text-[#2c3e50]/70 mb-6">
                {service.shortDescription}
              </p>

              <div className="flex flex-wrap gap-6 items-center mb-8">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#d4b5a0]" />
                  <span className="text-[#2c3e50]/70">{service.duration} minutes</span>
                </div>
                
                {service.promoPrice ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl line-through text-[#2c3e50]/40">{service.price}€</span>
                    <span className="text-3xl font-bold text-[#d4b5a0]">{service.promoPrice}€</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full">
                      -{discount}%
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-[#2c3e50]">{service.price}€</span>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/reservation"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-xl transition-all"
                >
                  Réserver ce soin
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#d4b5a0] text-[#d4b5a0] rounded-lg hover:bg-[#d4b5a0]/10 transition-all"
                >
                  Poser une question
                </Link>
              </div>
            </div>

            {/* Image principale */}
            <div className="relative">
              {service.mainImage ? (
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={service.mainImage} 
                    alt={service.name}
                    className="w-full h-[500px] object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 h-[500px] flex items-center justify-center">
                  <Sparkles className="w-32 h-32 text-[#d4b5a0]/40" />
                </div>
              )}
              
              {service.canBeOption && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium shadow-lg">
                  Peut être ajouté en option
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="sticky top-0 z-10 bg-white border-b border-[#d4b5a0]/20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#d4b5a0] text-[#d4b5a0] font-semibold'
                    : 'border-transparent text-[#2c3e50]/60 hover:text-[#2c3e50]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Description Tab */}
          {activeTab === 'description' && (
            <div className="animate-fadeIn">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                  <h2 className="text-3xl font-bold text-[#2c3e50] mb-6 text-center">
                    <Sparkles className="inline-block w-8 h-8 text-[#d4b5a0] mr-3" />
                    En quoi consiste ce soin ?
                  </h2>
                  <p className="text-lg text-[#2c3e50]/80 leading-relaxed whitespace-pre-line">
                    {service.description}
                  </p>
                </div>

                {benefits.length > 0 && (
                  <div className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-2xl shadow-lg p-8 mb-8">
                    <h3 className="text-2xl font-bold text-[#2c3e50] mb-6 text-center">Les bénéfices pour votre peau</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {benefits.map((benefit: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-600" />
                          </div>
                          <span className="text-[#2c3e50]/80">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {service.recommendations && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-6 h-6 text-green-600" />
                        </div>
                        <h4 className="font-bold text-[#2c3e50] text-lg">Recommandations</h4>
                      </div>
                      <p className="text-[#2c3e50]/70">{service.recommendations}</p>
                    </div>
                  )}

                  {service.contraindications && (
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <h4 className="font-bold text-[#2c3e50] text-lg">Contre-indications</h4>
                      </div>
                      <p className="text-[#2c3e50]/70">{service.contraindications}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Protocole Tab */}
          {activeTab === 'protocole' && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl font-bold text-[#2c3e50] mb-8 text-center">Le protocole étape par étape</h2>
              
              {process.length > 0 ? (
                <div className="max-w-4xl mx-auto">
                  <div className="space-y-6">
                    {process.map((step: string, index: number) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 pb-6 border-l-2 border-[#d4b5a0]/20 pl-6 ml-5 relative">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 bg-[#d4b5a0] rounded-full"></div>
                          <p className="text-lg text-[#2c3e50]/80">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 p-6 bg-[#fdfbf7] rounded-2xl text-center">
                    <Sparkles className="w-12 h-12 text-[#d4b5a0] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-[#2c3e50] mb-2">Durée totale du soin</h3>
                    <p className="text-3xl font-bold text-[#d4b5a0]">{service.duration} minutes</p>
                    <p className="text-[#2c3e50]/60 mt-2">Un moment de détente et de transformation</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-[#2c3e50]/60">Le protocole détaillé sera bientôt disponible.</p>
                </div>
              )}
            </div>
          )}

          {/* Tarifs Tab */}
          {activeTab === 'tarifs' && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl font-bold text-[#2c3e50] mb-8 text-center">Nos tarifs</h2>
              
              <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                {/* Séance unique */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-[#d4b5a0]/20">
                  <h3 className="text-2xl font-bold text-[#2c3e50] mb-4">Séance unique</h3>
                  
                  {service.promoPrice ? (
                    <div className="mb-6">
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-4xl font-bold text-[#d4b5a0]">{service.promoPrice}€</span>
                        <span className="text-2xl line-through text-[#2c3e50]/40">{service.price}€</span>
                      </div>
                      <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                        TARIF DE LANCEMENT -{discount}%
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-[#2c3e50]">{service.price}€</span>
                    </div>
                  )}
                  
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-[#2c3e50]/70">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Consultation incluse</span>
                    </li>
                    <li className="flex items-center gap-2 text-[#2c3e50]/70">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Produits premium</span>
                    </li>
                    <li className="flex items-center gap-2 text-[#2c3e50]/70">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Suivi personnalisé</span>
                    </li>
                  </ul>

                  <Link
                    href="/reservation"
                    className="block w-full text-center py-3 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c4a590] transition-all"
                  >
                    Réserver
                  </Link>
                </div>

                {/* Forfait */}
                {(service.forfaitPrice || service.forfaitPromo) && (
                  <div className="bg-gradient-to-br from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-2xl shadow-xl p-8 border-2 border-[#d4b5a0] relative">
                    <div className="absolute -top-3 -right-3 px-4 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-sm font-bold">
                      Économisez
                    </div>
                    
                    <h3 className="text-2xl font-bold text-[#2c3e50] mb-4">Forfait 4 séances</h3>
                    
                    {service.forfaitPromo ? (
                      <div className="mb-6">
                        <div className="flex items-baseline gap-3 mb-2">
                          <span className="text-4xl font-bold text-[#d4b5a0]">{service.forfaitPromo}€</span>
                          {service.forfaitPrice && (
                            <span className="text-2xl line-through text-[#2c3e50]/40">{service.forfaitPrice}€</span>
                          )}
                        </div>
                        <div className="text-green-600 font-semibold">
                          Soit {Math.round(service.forfaitPromo / 4)}€ la séance
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-[#2c3e50]">{service.forfaitPrice}€</span>
                        <div className="text-[#2c3e50]/60 mt-2">
                          Soit {service.forfaitPrice ? Math.round(service.forfaitPrice / 4) : 0}€ la séance
                        </div>
                      </div>
                    )}
                    
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2 text-[#2c3e50]/70">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Résultats optimaux</span>
                      </li>
                      <li className="flex items-center gap-2 text-[#2c3e50]/70">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Valable 6 mois</span>
                      </li>
                      <li className="flex items-center gap-2 text-[#2c3e50]/70">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>Paiement en 2 fois</span>
                      </li>
                    </ul>

                    <Link
                      href="/reservation"
                      className="block w-full text-center py-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      Choisir le forfait
                    </Link>
                  </div>
                )}
              </div>

              {service.canBeOption && (
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl text-center max-w-2xl mx-auto">
                  <p className="text-blue-800 font-medium">
                    💡 Ce soin peut être ajouté en option à d'autres prestations pour un tarif préférentiel
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Galerie Tab */}
          {activeTab === 'galerie' && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl font-bold text-[#2c3e50] mb-8 text-center">Galerie</h2>
              
              {gallery.length > 0 || service.videoUrl ? (
                <div className="space-y-8">
                  {gallery.length > 0 && (
                    <div className="grid md:grid-cols-3 gap-6">
                      {gallery.map((image: string, index: number) => (
                        <div key={index} className="rounded-xl overflow-hidden shadow-lg">
                          <img
                            src={image}
                            alt={`${service.name} ${index + 1}`}
                            className="w-full h-64 object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {service.videoUrl && (
                    <div className="max-w-4xl mx-auto">
                      <h3 className="text-2xl font-bold text-[#2c3e50] mb-4 text-center">Vidéo de présentation</h3>
                      <div className="aspect-video rounded-xl overflow-hidden shadow-xl">
                        <iframe
                          src={service.videoUrl}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Image className="w-16 h-16 text-[#d4b5a0]/30 mx-auto mb-4" />
                  <p className="text-[#2c3e50]/60">La galerie sera bientôt disponible.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Autres services */}
      {otherServices.length > 0 && (
        <section className="py-16 px-4 bg-[#fdfbf7]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-[#2c3e50] mb-8 text-center">Découvrez aussi</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {otherServices.map((otherService) => (
                <Link
                  key={otherService.id}
                  href={`/services/${otherService.slug}`}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group"
                >
                  <h3 className="text-xl font-semibold text-[#2c3e50] mb-2 group-hover:text-[#d4b5a0] transition-colors">
                    {otherService.name}
                  </h3>
                  <p className="text-[#2c3e50]/70 text-sm mb-4 line-clamp-2">{otherService.shortDescription}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[#d4b5a0] font-semibold">
                      {otherService.promoPrice || otherService.price}€
                    </span>
                    <ChevronRight className="w-5 h-5 text-[#d4b5a0] group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt(e) à transformer votre peau ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Réservez votre {service.name} dès maintenant et bénéficiez de nos tarifs de lancement
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/reservation"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#d4b5a0] rounded-lg hover:bg-[#fdfbf7] transition-colors font-semibold shadow-lg"
            >
              Réserver en ligne
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="tel:0123456789"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition-colors font-semibold"
            >
              01 23 45 67 89
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
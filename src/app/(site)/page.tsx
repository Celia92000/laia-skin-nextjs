import Link from "next/link";
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Clock, ArrowRight, Sparkles, Star } from 'lucide-react';
import { getDisplayPrice, getForfaitDisplayPrice, hasPromotion, getDiscountPercentage } from '@/lib/price-utils';
import { SocialSection } from '@/components/SocialSection';
import { getSiteConfig } from '@/lib/config-service';
import { HoverButton } from '@/components/HoverButton';
import { TemplateRenderer } from '@/components/TemplateRenderer';

// Force dynamic rendering to avoid build-time database queries
export const dynamic = 'force-dynamic';
export const revalidate = false;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export default async function Home() {
  // Routing par domaine : laiaconnect.fr → /platform
  const headersList = await headers();
  const host = headersList.get('host') || '';

  if (host.includes('laiaconnect.fr')) {
    redirect('/platform');
  }

  // Récupérer l'organisation par domaine personnalisé ou subdomain
  const cleanHost = host.split(':')[0].toLowerCase();

  console.log(`🌐 Host reçu: ${host} → Clean host: ${cleanHost}`);

  let organization = null;

  // 1️⃣ D'abord, essayer de trouver par domaine personnalisé (custom domain)
  // Ex: beaute-eternelle.fr → chercher dans organization.domain
  if (!cleanHost.includes('localhost')) {
    organization = await prisma.organization.findUnique({
      where: { domain: cleanHost },
      include: { config: true }
    });

    if (organization) {
      console.log(`✅ Organisation trouvée par domaine personnalisé: ${organization.name}`);
    }
  }

  // 2️⃣ Si pas trouvé, extraire le subdomain (première partie avant le premier point)
  // Ex: belle-peau-institut.localhost → belle-peau-institut
  if (!organization) {
    const parts = cleanHost.split('.');
    let subdomain = 'laia-skin-institut'; // Par défaut

    if (parts.length > 1 && parts[0] !== 'localhost' && parts[0] !== 'www') {
      subdomain = parts[0];
    }

    console.log(`🔍 Recherche par subdomain: ${subdomain}`);

    organization = await prisma.organization.findUnique({
      where: { subdomain: subdomain },
      include: { config: true }
    });

    if (organization) {
      console.log(`✅ Organisation trouvée par subdomain: ${organization.name}`);
    }
  }

  // 3️⃣ Fallback vers l'organisation par défaut (LAIA SKIN INSTITUT)
  if (!organization) {
    console.log(`⚠️ Aucune organisation trouvée, utilisation de laia-skin-institut par défaut`);
    organization = await prisma.organization.findFirst({
      where: { slug: 'laia-skin-institut' },
      include: { config: true }
    });

    if (!organization) {
      return <div>Organisation non trouvée</div>;
    }
  }

  const config = organization?.config || await getSiteConfig();

  // Couleurs de l'organisation
  const primaryColor = organization?.config?.primaryColor || '#d4b5a0';
  const secondaryColor = organization?.config?.secondaryColor || '#c9a084';
  const accentColor = organization?.config?.accentColor || '#2c3e50';

  let services: any[] = [];

  // Parse testimonials from config (JSON)
  let testimonials: any[] = [];
  try {
    if (config.testimonials) {
      testimonials = JSON.parse(config.testimonials);
    }
  } catch (e) {
    console.error('Error parsing testimonials:', e);
  }

  try {
    // Récupérer les services depuis la base de données (sans les forfaits)
    services = await prisma.service.findMany({
      where: {
        organizationId: organization.id, // Filtrer par organisation
        active: true,
        category: { not: 'forfaits' } // Exclure les forfaits
      }
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    // En cas d'erreur, on continue avec un tableau vide
  }

  // Trier pour mettre les services featured en premier, puis par ordre
  const sortedServices = [...services].sort((a, b) => {
    // D'abord trier par featured
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    // Ensuite par ordre
    return (a.order || 0) - (b.order || 0);
  });

  // Si l'organisation a un template personnalisé ET que ce n'est pas LAIA Skin Institut
  // Utiliser le système de templates
  if (organization.websiteTemplateId && organization.subdomain !== 'laia-skin-institut') {
    return (
      <TemplateRenderer
        templateId={organization.websiteTemplateId}
        organization={organization}
        services={sortedServices}
        config={config}
        testimonials={testimonials}
      />
    );
  }

  // Sinon, utiliser le design par défaut (pour LAIA Skin Institut principalement)
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0] overflow-x-hidden">
      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 min-h-[80vh] sm:min-h-screen flex items-center justify-center relative overflow-hidden px-3 sm:px-4">
        {/* Background Image (if configured) */}
        {config.heroImage && (
          <div className="absolute inset-0">
            <img
              src={config.heroImage}
              alt="Hero background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20"></div>
          </div>
        )}

        {/* Animated Background Elements - Hidden on mobile for performance */}
        <div className="absolute inset-0 overflow-hidden hidden sm:block">
          <div
            className="absolute w-96 h-96 -top-48 -right-48 rounded-full blur-3xl animate-pulse"
            style={{ background: `linear-gradient(to bottom right, ${primaryColor}33, ${secondaryColor}33)` }}
          ></div>
          <div
            className="absolute w-96 h-96 -bottom-48 -left-48 rounded-full blur-3xl animate-pulse delay-700"
            style={{ background: `linear-gradient(to top right, ${primaryColor}33, ${secondaryColor}33)` }}
          ></div>
        </div>

        <div className="relative z-10 text-center px-2 sm:px-4 max-w-5xl mx-auto">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-playfair mb-4 sm:mb-8 animate-fade-in-up leading-tight tracking-normal ${config.heroImage ? 'text-white' : ''}`} style={!config.heroImage ? { color: accentColor } : undefined}>
            <span className="block font-normal">{config.heroTitle || "Une peau respectée,"}</span>
            <span className={`block font-semibold mt-1 ${config.heroImage ? 'text-white/90' : ''}`} style={!config.heroImage ? { color: primaryColor } : undefined}>{config.heroSubtitle || "une beauté révélée"}</span>
          </h1>
          <p className={`font-inter text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-200 tracking-normal px-2 ${config.heroImage ? 'text-white/90' : ''}`} style={!config.heroImage ? { color: `${accentColor}99` } : undefined}>
            {config.siteDescription || config.siteTagline || "Institut spécialisé dans les techniques esthétiques avancées"}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-fade-in-up animation-delay-400 px-4 sm:px-0">
            <Link
              href="/reservation"
              className="text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base lg:text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
            >
              Réserver un Soin
            </Link>
            <Link
              href="/prestations"
              className="bg-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{ color: accentColor }}
            >
              Découvrir nos Soins
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-normal mb-4 tracking-normal" style={{ color: accentColor }}>
              Mes Prestations
            </h2>
            <p className="font-inter text-base md:text-lg max-w-2xl mx-auto tracking-normal" style={{ color: `${accentColor}99` }}>
              Découvrez notre gamme exclusive de soins innovants pour une peau éclatante et rajeunie
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {sortedServices.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                className="group block h-full"
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 h-full flex flex-col min-h-[400px] sm:min-h-[500px] lg:min-h-[550px]">
                  {/* Image/Header */}
                  <div className="h-48 bg-gradient-to-br from-[#d4b5a0]/30 to-[#c9a084]/30 relative overflow-hidden flex-shrink-0">
                    {/* Badge Soin Signature pour Hydro'Naissance uniquement */}
                    {service.featured && (
                      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-full shadow-lg">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-xs font-bold uppercase tracking-wider">Soin Signature</span>
                      </div>
                    )}
                    {service.mainImage ? (
                      <img
                        src={service.mainImage}
                        alt={service.name}
                        className="w-full h-full object-cover object-center"
                        style={{ objectPosition: '50% 50%' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-20 h-20 text-[#d4b5a0]/40" />
                      </div>
                    )}

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
                      <div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-bold text-[#2c3e50]">
                            {getDisplayPrice(service)}€
                          </span>
                          {hasPromotion(service) && (
                            <>
                              <span className="text-xl line-through text-[#2c3e50]/40">
                                {service.price}€
                              </span>
                              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                                -{getDiscountPercentage(service.price, service.promoPrice!)}%
                              </span>
                            </>
                          )}
                        </div>
                        {getForfaitDisplayPrice(service) && (
                          <p className="text-sm text-[#d4b5a0] mt-2">
                            Forfait 4 séances : {getForfaitDisplayPrice(service)}€
                          </p>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-[#d4b5a0] font-medium group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                        Voir les détails
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Refined Elegant Typography */}
      <section className="py-28 sm:py-32 md:py-40 relative overflow-hidden">
        {/* Sophisticated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#fdfbf7] via-white to-[#f8f6f0]">
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #d4b5a0 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Refined Title Section */}
          <div className="text-center mb-24">
            <div className="mb-2">
              <span className="font-inter text-xs md:text-sm text-[#d4b5a0] tracking-[0.3em] uppercase font-medium">Notre philosophie</span>
            </div>
            <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-[#2c3e50] mb-6">
              <span className="font-light">L'Excellence</span>
              <span className="block mt-2 font-normal italic text-[#d4b5a0]">à votre Service</span>
            </h2>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-20 h-[0.5px] bg-gradient-to-r from-transparent to-[#d4b5a0]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#d4b5a0]"></div>
              <div className="w-20 h-[0.5px] bg-gradient-to-l from-transparent to-[#d4b5a0]"></div>
            </div>
            <p className="font-inter text-lg md:text-xl text-[#2c3e50]/50 max-w-3xl mx-auto font-light leading-relaxed tracking-wide">
              Un engagement authentique pour révéler votre beauté naturelle
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16 lg:gap-20">
            {/* Expertise Card - Refined */}
            <div className="group">
              <div className="text-center transform transition-all duration-700 hover:-translate-y-3">
                <div className="relative mb-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#d4b5a0]/10 to-transparent rounded-full blur-2xl scale-150 group-hover:scale-175 transition-transform duration-700"></div>
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full animate-pulse"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-shadow duration-500">
                      <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="font-playfair text-2xl md:text-3xl text-[#2c3e50] mb-5">
                  <span className="font-light">Expertise</span>
                  <span className="block text-lg md:text-xl font-normal italic text-[#d4b5a0] mt-1">Certifiée</span>
                </h3>
                <p className="font-inter text-[#2c3e50]/60 leading-relaxed text-sm md:text-base px-6 font-light tracking-wide">
                  Plus d'une décennie dédiée à l'art de sublimer votre peau avec des techniques d'exception
                </p>
              </div>
            </div>

            {/* Technology Card - Refined */}
            <div className="group">
              <div className="text-center transform transition-all duration-700 hover:-translate-y-3">
                <div className="relative mb-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#d4b5a0]/10 to-transparent rounded-full blur-2xl scale-150 group-hover:scale-175 transition-transform duration-700"></div>
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full animate-pulse animation-delay-200"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-shadow duration-500">
                      <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="font-playfair text-2xl md:text-3xl text-[#2c3e50] mb-5">
                  <span className="font-light">Technologies</span>
                  <span className="block text-lg md:text-xl font-normal italic text-[#d4b5a0] mt-1">Innovantes</span>
                </h3>
                <p className="font-inter text-[#2c3e50]/60 leading-relaxed text-sm md:text-base px-6 font-light tracking-wide">
                  Équipements de pointe minutieusement sélectionnés pour leur efficacité cliniquement prouvée
                </p>
              </div>
            </div>

            {/* Personalized Card - Refined */}
            <div className="group">
              <div className="text-center transform transition-all duration-700 hover:-translate-y-3">
                <div className="relative mb-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#d4b5a0]/10 to-transparent rounded-full blur-2xl scale-150 group-hover:scale-175 transition-transform duration-700"></div>
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full animate-pulse animation-delay-400"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-shadow duration-500">
                      <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="font-playfair text-2xl md:text-3xl text-[#2c3e50] mb-5">
                  <span className="font-light">Approche</span>
                  <span className="block text-lg md:text-xl font-normal italic text-[#d4b5a0] mt-1">Sur-Mesure</span>
                </h3>
                <p className="font-inter text-[#2c3e50]/60 leading-relaxed text-sm md:text-base px-6 font-light tracking-wide">
                  Chaque protocole est méticuleusement conçu pour répondre à vos besoins uniques
                </p>
              </div>
            </div>
          </div>

          {/* Signature Quote */}
          <div className="mt-32 text-center">
            <div className="max-w-4xl mx-auto relative">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                <svg className="w-16 h-16 text-[#d4b5a0]/20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="font-playfair text-2xl md:text-3xl lg:text-4xl text-[#2c3e50]/60 italic font-light leading-relaxed tracking-wide px-8">
                {config.founderQuote || "La vraie beauté réside dans l'harmonie parfaite entre science, art et attention personnalisée"}
              </p>
              <div className="mt-10">
                <div className="inline-block">
                  <p className="font-inter text-sm text-[#d4b5a0] font-medium tracking-[0.3em] uppercase">{config.founderName || "Votre nom"}</p>
                  <p className="font-inter text-xs text-[#2c3e50]/40 mt-2 tracking-wider">{config.founderTitle || "Fondatrice & Experte en soins esthétiques"}</p>
                  <div className="w-24 h-[0.5px] bg-gradient-to-r from-transparent via-[#d4b5a0] to-transparent mx-auto mt-4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-12 sm:py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2c3e50] mb-4">
                Témoignages Clients
              </h2>
              <p className="text-lg text-[#2c3e50]/70 mb-4">
                La satisfaction de mes clientes est ma plus belle récompense
              </p>
              <div className="inline-flex items-center gap-2 bg-[#fdfbf7] px-4 py-2 rounded-full">
                <span className="text-sm text-[#2c3e50]/60">Bientôt disponible sur</span>
                <img
                  src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
                  alt="Google"
                  className="h-5"
                />
                <span className="text-sm text-[#2c3e50]/60">Business</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.slice(0, 3).map((testimonial: any, index: number) => (
                <div key={index} className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-2xl p-8 shadow-lg">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-[#d4b5a0] fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[#2c3e50]/80 italic mb-6">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.initials || testimonial.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-[#2c3e50]">{testimonial.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section Réseaux Sociaux */}
      <SocialSection />

      {/* CTA Section */}
      <section className="py-24 text-white" style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` }}>
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Prête pour révéler votre éclat naturel ?
          </h2>
          <p className="text-xl mb-12 opacity-95">
            Réservez dès maintenant votre soin personnalisé et découvrez la différence {config.siteName?.toUpperCase() || 'LAIA SKIN'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservation"
              className="bg-white px-10 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{ color: accentColor }}
            >
              Réserver un soin
            </Link>
            <HoverButton
              href="/contact"
              accentColor={accentColor}
              className="bg-transparent border-2 text-white px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300"
            >
              Nous contacter
            </HoverButton>
          </div>
        </div>
      </section>
    </div>
  );
}

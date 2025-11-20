import Link from "next/link";
import Image from "next/image";
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Clock, ArrowRight, Sparkles, Star } from 'lucide-react';
import { getDisplayPrice, getForfaitDisplayPrice, hasPromotion, getDiscountPercentage } from '@/lib/price-utils';
import { SocialSection } from '@/components/SocialSection';
import { getSiteConfig } from '@/lib/config-service';
import { HoverButton } from '@/components/HoverButton';
import { TemplateRenderer } from '@/components/TemplateRenderer';

// Enable ISR with 60 seconds revalidation
export const revalidate = 60;

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

  // 🔥 Sur localhost, on force Laia Skin Institut
  if (cleanHost.includes('localhost')) {
    organization = await prisma.organization.findFirst({
      where: { slug: 'laia-skin-institut' },
      include: { OrganizationConfig: true }
    });
    console.log('🏠 localhost → Force Laia Skin Institut');
  } else {
    // Optimisation: recherche parallèle par domaine, subdomain et fallback
    const parts = cleanHost.split('.');
    const subdomain = parts.length > 1 && parts[0] !== 'www'
      ? parts[0]
      : 'laia-skin-institut';

    // Paralléliser toutes les recherches possibles
    const [orgByDomain, orgBySubdomain, orgBySlug] = await Promise.all([
      prisma.organization.findUnique({
        where: { domain: cleanHost },
        include: { OrganizationConfig: true }
      }),
      prisma.organization.findUnique({
        where: { subdomain: subdomain },
        include: { OrganizationConfig: true }
      }),
      prisma.organization.findFirst({
        where: { slug: 'laia-skin-institut' },
        include: { OrganizationConfig: true }
      })
    ]);

    // Prioriser les résultats
    organization = orgByDomain || orgBySubdomain || orgBySlug;
  }

  console.log('🔍 Organisation:', organization?.name, '| Services:', organization?.id);

  if (!organization) {
    return <div>Organisation non trouvée</div>;
  }

  const config = organization.OrganizationConfig || await getSiteConfig();

  // Couleurs de l'organisation
  const primaryColor = organization?.OrganizationConfig?.primaryColor || '#d4b5a0';
  const secondaryColor = organization?.OrganizationConfig?.secondaryColor || '#c9a084';
  const accentColor = organization?.OrganizationConfig?.accentColor || '#2c3e50';

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
    console.log(`📦 ${services.length} service(s) trouvé(s) pour ${organization.name}`);
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

  console.log(`✅ Services triés: ${sortedServices.length} | Noms: ${sortedServices.map(s => s.name).join(', ')}`);

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
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 min-h-screen flex items-center justify-center relative overflow-hidden px-4">
        {/* Background Image (if configured) */}
        {config.heroImage && (
          <div className="absolute inset-0">
            <Image
              src={config.heroImage}
              alt="Hero background"
              fill
              className="object-cover"
              priority
              quality={85}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/20"></div>
          </div>
        )}

        {/* Animated Background Elements (fallback or overlay) */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute w-96 h-96 -top-48 -right-48 rounded-full blur-3xl animate-pulse"
            style={{ background: `linear-gradient(to bottom right, ${primaryColor}33, ${secondaryColor}33)` }}
          ></div>
          <div
            className="absolute w-96 h-96 -bottom-48 -left-48 rounded-full blur-3xl animate-pulse delay-700"
            style={{ background: `linear-gradient(to top right, ${primaryColor}33, ${secondaryColor}33)` }}
          ></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-playfair mb-8 animate-fade-in-up leading-tight tracking-normal ${config.heroImage ? 'text-white' : ''}`} style={!config.heroImage ? { color: accentColor } : undefined}>
            <span className="block font-normal">{config.heroTitle || "Une peau respectée,"}</span>
            <span className={`block font-semibold mt-1 ${config.heroImage ? 'text-white/90' : ''}`} style={!config.heroImage ? { color: primaryColor } : undefined}>{config.heroSubtitle || "une beauté révélée"}</span>
          </h1>
          <p className={`font-inter text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-200 tracking-normal ${config.heroImage ? 'text-white/90' : ''}`} style={!config.heroImage ? { color: `${accentColor}99` } : undefined}>
            {config.siteDescription || config.siteTagline || "Institut spécialisé dans les techniques esthétiques avancées"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Link
              href="/reservation"
              className="text-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
            >
              {config.ctaButton1 || 'Réserver un Soin'}
            </Link>
            <Link
              href="/prestations"
              className="bg-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{ color: accentColor }}
            >
              {config.servicesCTA || 'Découvrir nos Soins'}
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-normal mb-4 tracking-normal" style={{ color: accentColor }}>
              {config.servicesTitle || 'Mes Prestations'}
            </h2>
            <p className="font-inter text-base md:text-lg max-w-2xl mx-auto tracking-normal" style={{ color: `${accentColor}99` }}>
              {config.servicesDescription || 'Découvrez notre gamme exclusive de soins innovants pour une peau éclatante et rajeunie'}
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
                  <div className="h-48 relative overflow-hidden flex-shrink-0" style={{ background: `linear-gradient(to bottom right, ${primaryColor}30, ${secondaryColor}30)` }}>
                    {/* Badge Soin Signature pour Hydro'Naissance uniquement */}
                    {service.featured && (
                      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 text-white rounded-full shadow-lg" style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-xs font-bold uppercase tracking-wider">{config.featuredBadge || 'Soin Signature'}</span>
                      </div>
                    )}
                    {service.mainImage ? (
                      <Image
                        src={service.mainImage}
                        alt={service.name}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        quality={80}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-20 h-20 text-primary/40" />
                      </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-accent/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
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
                    <h3 className="text-2xl font-bold text-accent mb-3 group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>

                    <p className="text-accent/70 mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-accent/60">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration} min</span>
                      </div>

                      {service.category && (
                        <span className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full">
                          {service.category}
                        </span>
                      )}
                    </div>

                    {/* Prix */}
                    <div className="border-t pt-4 mt-auto">
                      <div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-bold text-accent">
                            {getDisplayPrice(service)}€
                          </span>
                          {hasPromotion(service) && (
                            <>
                              <span className="text-xl line-through text-accent/40">
                                {service.price}€
                              </span>
                              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                                -{getDiscountPercentage(service.price, service.promoPrice!)}%
                              </span>
                            </>
                          )}
                        </div>
                        {getForfaitDisplayPrice(service) && (
                          <p className="text-sm text-primary mt-2">
                            Forfait 4 séances : {getForfaitDisplayPrice(service)}€
                          </p>
                        )}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-6 flex items-center justify-between">
                      <span className="text-primary font-medium group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
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
            backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-primary) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Refined Title Section */}
          <div className="text-center mb-24">
            <div className="mb-2">
              <span className="font-inter text-xs md:text-sm text-primary tracking-[0.3em] uppercase font-medium">
                {config.philosophyTag || 'Notre philosophie'}
              </span>
            </div>
            <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-accent mb-6">
              <span className="font-light">{config.philosophyTitle || 'L\'Excellence'}</span>
              <span className="block mt-2 font-normal italic text-primary">{config.philosophySubtitle || 'à votre Service'}</span>
            </h2>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-20 h-[0.5px] bg-gradient-to-r from-transparent to-primary"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              <div className="w-20 h-[0.5px] bg-gradient-to-l from-transparent to-primary"></div>
            </div>
            <p className="font-inter text-lg md:text-xl text-accent/50 max-w-3xl mx-auto font-light leading-relaxed tracking-wide">
              {config.philosophyDescription || 'Un engagement authentique pour révéler votre beauté naturelle'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16 lg:gap-20">
            {/* Card 1 - Refined */}
            <div className="group">
              <div className="text-center transform transition-all duration-700 hover:-translate-y-3">
                <div className="relative mb-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl scale-150 group-hover:scale-175 transition-transform duration-700"></div>
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full animate-pulse"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-shadow duration-500">
                      <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="font-playfair text-2xl md:text-3xl text-accent mb-5">
                  <span className="font-light">{config.value1Title || 'Expertise'}</span>
                  <span className="block text-lg md:text-xl font-normal italic text-primary mt-1">{config.value1Subtitle || 'Certifiée'}</span>
                </h3>
                <p className="font-inter text-accent/60 leading-relaxed text-sm md:text-base px-6 font-light tracking-wide">
                  {config.value1Description || 'Plus d\'une décennie dédiée à l\'art de sublimer votre peau avec des techniques d\'exception'}
                </p>
              </div>
            </div>

            {/* Card 2 - Refined */}
            <div className="group">
              <div className="text-center transform transition-all duration-700 hover:-translate-y-3">
                <div className="relative mb-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl scale-150 group-hover:scale-175 transition-transform duration-700"></div>
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full animate-pulse animation-delay-200"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-shadow duration-500">
                      <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="font-playfair text-2xl md:text-3xl text-accent mb-5">
                  <span className="font-light">{config.value2Title || 'Technologies'}</span>
                  <span className="block text-lg md:text-xl font-normal italic text-primary mt-1">{config.value2Subtitle || 'Innovantes'}</span>
                </h3>
                <p className="font-inter text-accent/60 leading-relaxed text-sm md:text-base px-6 font-light tracking-wide">
                  {config.value2Description || 'Équipements de pointe minutieusement sélectionnés pour leur efficacité cliniquement prouvée'}
                </p>
              </div>
            </div>

            {/* Card 3 - Refined */}
            <div className="group">
              <div className="text-center transform transition-all duration-700 hover:-translate-y-3">
                <div className="relative mb-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl scale-150 group-hover:scale-175 transition-transform duration-700"></div>
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full animate-pulse animation-delay-400"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-shadow duration-500">
                      <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="font-playfair text-2xl md:text-3xl text-accent mb-5">
                  <span className="font-light">{config.value3Title || 'Approche'}</span>
                  <span className="block text-lg md:text-xl font-normal italic text-primary mt-1">{config.value3Subtitle || 'Sur-Mesure'}</span>
                </h3>
                <p className="font-inter text-accent/60 leading-relaxed text-sm md:text-base px-6 font-light tracking-wide">
                  {config.value3Description || 'Chaque protocole est méticuleusement conçu pour répondre à vos besoins uniques'}
                </p>
              </div>
            </div>
          </div>

          {/* Signature Quote */}
          <div className="mt-32 text-center">
            <div className="max-w-4xl mx-auto relative">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                <svg className="w-16 h-16 text-primary/20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="font-playfair text-2xl md:text-3xl lg:text-4xl text-accent/60 italic font-light leading-relaxed tracking-wide px-8">
                {config.founderQuote || "La vraie beauté réside dans l'harmonie parfaite entre science, art et attention personnalisée"}
              </p>
              <div className="mt-10">
                <div className="inline-block">
                  <p className="font-inter text-sm text-primary font-medium tracking-[0.3em] uppercase">{config.founderName || "Votre nom"}</p>
                  <p className="font-inter text-xs text-accent/40 mt-2 tracking-wider">{config.founderTitle || "Fondatrice & Experte en soins esthétiques"}</p>
                  <div className="w-24 h-[0.5px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-4"></div>
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
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-accent mb-4">
                {config.testimonialsTitle || 'Témoignages Clients'}
              </h2>
              <p className="text-lg text-accent/70 mb-4">
                {config.testimonialsDescription || 'La satisfaction de mes clientes est ma plus belle récompense'}
              </p>
              <div className="inline-flex items-center gap-2 bg-[#fdfbf7] px-4 py-2 rounded-full">
                <span className="text-sm text-accent/60">{config.testimonialsGoogleText || 'Bientôt disponible sur'}</span>
                <img
                  src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
                  alt="Google"
                  className="h-5"
                />
                <span className="text-sm text-accent/60">Business</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.slice(0, 3).map((testimonial: any, index: number) => (
                <div key={index} className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-2xl p-8 shadow-lg">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-primary fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-accent/80 italic mb-6">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.initials || testimonial.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-accent">{testimonial.name}</p>
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
            {config.ctaTitle || 'Prête pour révéler votre éclat naturel ?'}
          </h2>
          <p className="text-xl mb-12 opacity-95">
            {config.ctaDescription || 'Réservez dès maintenant votre soin personnalisé et découvrez la différence'} {config.siteName?.toUpperCase() || 'LAIA SKIN'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reservation"
              className="bg-white px-10 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{ color: accentColor }}
            >
              {config.ctaButton1 || 'Réserver un soin'}
            </Link>
            <HoverButton
              href="/contact"
              accentColor={accentColor}
              className="bg-transparent border-2 text-white px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300"
            >
              {config.ctaButton2 || 'Nous contacter'}
            </HoverButton>
          </div>
        </div>
      </section>
    </div>
  );
}

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, Euro, Check, AlertCircle, ArrowRight, Star, ChevronRight, Info, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  
  const service = await prisma.service.findUnique({
    where: { 
      slug,
      active: true 
    }
  });

  if (!service) {
    notFound();
  }

  // Récupérer les autres services pour la section "Découvrir aussi"
  const otherServices = await prisma.service.findMany({
    where: {
      active: true,
      NOT: { slug }
    },
    take: 3
  });

  // Parser les données JSON
  const benefits = service.benefits ? JSON.parse(service.benefits as string) : [];
  const contraindications = service.contraindications ? JSON.parse(service.contraindications as string) : [];
  const process = service.process ? JSON.parse(service.process as string) : [];
  const recommendations = service.recommendations ? JSON.parse(service.recommendations as string) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 -bottom-48 -left-48 bg-gradient-to-tr from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            {service.featured && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white rounded-full mb-6">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-semibold">Soin Signature</span>
              </div>
            )}
            
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#2c3e50] mb-6">
              {service.name}
            </h1>
            <p className="text-xl text-[#2c3e50]/80 max-w-3xl mx-auto">
              {service.shortDescription}
            </p>
          </div>

          {/* Quick Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Clock className="w-8 h-8 text-[#d4b5a0] mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Durée</h3>
              <p className="text-[#2c3e50]/70">{service.duration} minutes</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Euro className="w-8 h-8 text-[#d4b5a0] mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Tarif</h3>
              <div>
                {service.promoPrice ? (
                  <>
                    <p className="text-[#2c3e50]/40 line-through">{service.price}€</p>
                    <p className="text-2xl font-bold text-green-600">{service.promoPrice}€</p>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-[#2c3e50]">{service.price}€</p>
                )}
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center">
              <Sparkles className="w-8 h-8 text-[#d4b5a0] mx-auto mb-3" />
              <h3 className="font-semibold text-[#2c3e50] mb-1">Catégorie</h3>
              <p className="text-[#2c3e50]/70">{service.category || 'Soin'}</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link 
              href="/reservation"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              Réserver ce soin
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Description */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-[#2c3e50] mb-6 flex items-center gap-3">
                  <Info className="w-8 h-8 text-[#d4b5a0]" />
                  Description
                </h2>
                <p className="text-[#2c3e50]/80 leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>

              {/* Bénéfices */}
              {benefits.length > 0 && (
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-3xl font-bold text-[#2c3e50] mb-6">
                    Bénéfices
                  </h2>
                  <ul className="space-y-3">
                    {benefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-[#2c3e50]/80">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Déroulement */}
              {process.length > 0 && (
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-3xl font-bold text-[#2c3e50] mb-6">
                    Déroulement du soin
                  </h2>
                  <ol className="space-y-4">
                    {process.map((step: string, index: number) => (
                      <li key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <p className="text-[#2c3e50]/80 pt-1">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Recommandations */}
              {recommendations.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-[#2c3e50] mb-4">
                    Recommandations
                  </h3>
                  <ul className="space-y-2">
                    {recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <ChevronRight className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[#2c3e50]/80">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contre-indications */}
              {contraindications.length > 0 && (
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    Contre-indications
                  </h3>
                  <ul className="space-y-2">
                    {contraindications.map((contra: string, index: number) => (
                      <li key={index} className="text-sm text-[#2c3e50]/80">
                        • {contra}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Réserver */}
              <div className="bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-[#2c3e50] mb-4">
                  Prêt(e) à sublimer votre peau ?
                </h3>
                <Link 
                  href="/reservation"
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-all duration-300"
                >
                  Réserver maintenant
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Autres services */}
      {otherServices.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-[#2c3e50] mb-8 text-center">
              Découvrez aussi
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {otherServices.map((otherService) => (
                <Link
                  key={otherService.id}
                  href={`/services/${otherService.slug}`}
                  className="group"
                >
                  <div className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <h3 className="text-xl font-bold text-[#2c3e50] mb-2 group-hover:text-[#d4b5a0] transition-colors">
                      {otherService.name}
                    </h3>
                    <p className="text-[#2c3e50]/70 text-sm mb-4 line-clamp-2">
                      {otherService.shortDescription}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#d4b5a0] font-semibold">
                        {otherService.price}€
                      </span>
                      <ArrowRight className="w-5 h-5 text-[#d4b5a0] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
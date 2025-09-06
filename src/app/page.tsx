import Link from "next/link";
import { prisma } from '@/lib/prisma';
import ServiceCard from "@/components/ServiceCard";

export default async function Home() {
  // Récupérer les services depuis la base de données
  const services = await prisma.service.findMany({
    where: { active: true }
  });
  
  // Trier pour mettre les services featured en premier, puis par ordre
  const sortedServices = [...services].sort((a, b) => {
    // D'abord trier par featured
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    // Ensuite par ordre
    return (a.order || 0) - (b.order || 0);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
      {/* Hero Section */}
      <section className="pt-24 min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 -top-48 -right-48 bg-gradient-to-br from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute w-96 h-96 -bottom-48 -left-48 bg-gradient-to-tr from-[#d4b5a0]/20 to-[#c9a084]/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-[#2c3e50] mb-6 animate-fade-in-up">
            Une peau respectée,<br />une beauté révélée ✨
          </h2>
          <p className="text-xl md:text-2xl text-[#2c3e50]/80 mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Institut spécialisé dans les techniques esthétiques avancées.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Link href="/reservation" className="bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white px-10 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              Réserver un Soin
            </Link>
            <Link href="/prestations" className="bg-white text-[#2c3e50] px-10 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              Découvrir nos Soins
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2c3e50] mb-4">
              Mes Prestations
            </h2>
            <p className="text-lg text-[#2c3e50]/70 max-w-2xl mx-auto">
              Découvrez notre gamme exclusive de soins innovants pour une peau éclatante et rajeunie
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedServices.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.name}
                description={service.shortDescription}
                price={service.price}
                promoPrice={service.promoPrice || undefined}
                duration={`${service.duration} min`}
                href={`/services/${service.slug}`}
                image={service.mainImage || `/images/${service.slug}.jpg`}
                isRecommended={service.featured}
                badge={service.featured ? "⭐ Soin Signature" : undefined}
                icon={
                  service.featured ? (
                    <span className="text-3xl">👑</span>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  )
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-[#fdfbf7] to-[#f8f6f0]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2c3e50] mb-4">
              L'Excellence à votre Service
            </h2>
            <p className="text-lg text-[#2c3e50]/70 max-w-2xl mx-auto">
              Notre engagement pour votre beauté et votre bien-être
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif font-semibold text-[#2c3e50] mb-4">Expertise Certifiée</h3>
              <p className="text-[#2c3e50]/70">Plus de 10 ans d'expérience dans les soins esthétiques de prestige</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif font-semibold text-[#2c3e50] mb-4">Technologies Avancées</h3>
              <p className="text-[#2c3e50]/70">Équipements de dernière génération pour des résultats optimaux</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif font-semibold text-[#2c3e50] mb-4">Approche Personnalisée</h3>
              <p className="text-[#2c3e50]/70">Des protocoles sur-mesure adaptés à chaque type de peau</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
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
            <div className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-2xl p-8 shadow-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#d4b5a0] fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[#2c3e50]/80 italic mb-6">
                "Après 3 séances d'Hydro'Cleaning, ma peau est complètement transformée ! Les pores sont resserrés, plus de points noirs et un teint éclatant. Les résultats sont visibles dès la première séance."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center text-white font-semibold">
                  SD
                </div>
                <div>
                  <p className="font-semibold text-[#2c3e50]">Sophie D.</p>
                  <p className="text-sm text-[#2c3e50]/60">Cliente régulière</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-2xl p-8 shadow-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#d4b5a0] fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[#2c3e50]/80 italic mb-6">
                "Le BB Glow est une révélation ! J'ai enfin un teint unifié sans maquillage. Les gens me demandent constamment quelle est ma routine beauté. Un gain de temps précieux chaque matin !"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center text-white font-semibold">
                  ML
                </div>
                <div>
                  <p className="font-semibold text-[#2c3e50]">Marie L.</p>
                  <p className="text-sm text-[#2c3e50]/60">Nouvelle cliente</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#fdfbf7] to-white rounded-2xl p-8 shadow-lg">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#d4b5a0] fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[#2c3e50]/80 italic mb-6">
                "Je suis adepte du Renaissance depuis 6 mois. Ma peau n'a jamais été aussi ferme et lumineuse. Les ridules se sont estompées et j'ai retrouvé l'éclat de mes 30 ans. Un investissement qui vaut vraiment le coup !"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center text-white font-semibold">
                  CM
                </div>
                <div>
                  <p className="font-semibold text-[#2c3e50]">Catherine M.</p>
                  <p className="text-sm text-[#2c3e50]/60">Cliente fidèle</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Prête pour révéler votre éclat naturel ?
          </h2>
          <p className="text-xl mb-12 opacity-95">
            Réservez dès maintenant votre soin personnalisé et découvrez la différence LAIA SKIN
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reservation" className="bg-white text-[#2c3e50] px-10 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              Réserver un soin
            </Link>
            <Link href="/contact" className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-[#2c3e50] transition-all duration-300">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
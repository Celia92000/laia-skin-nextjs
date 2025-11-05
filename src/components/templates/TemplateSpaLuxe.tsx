'use client';

import Link from 'next/link';
import { Clock, Phone, MapPin, Calendar, Leaf, Sparkles, Heart } from 'lucide-react';

interface TemplateContent {
  hero: {
    badge?: string;
    title: string;
    subtitle?: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary?: string;
  };
  services: {
    title: string;
    description: string;
  };
  features?: {
    title: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  team?: {
    title: string;
    description: string;
  };
  testimonials?: {
    title: string;
    items: Array<{
      name: string;
      rating: number;
      text: string;
    }>;
  };
  cta: {
    title: string;
    description: string;
    button: string;
    secondaryButton?: string;
  };
  footer: {
    tagline?: string;
    contact: {
      phone: string;
      address?: string;
    };
    hours?: string;
  };
}

interface TemplateProps {
  organization: {
    name: string;
    description?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
    description?: string;
  }>;
  team?: Array<{
    id: string;
    name: string;
    role: string;
    imageUrl?: string;
  }>;
  content?: TemplateContent;
}

export default function TemplateSpaLuxe({ organization, services, team, content }: TemplateProps) {
  const primaryColor = organization.primaryColor;
  const secondaryColor = organization.secondaryColor;

  const defaultContent: TemplateContent = {
    hero: {
      title: 'Spa & Bien-Être',
      description: organization.description || 'Un havre de paix et de sérénité',
      ctaPrimary: 'Réserver',
      ctaSecondary: 'Découvrir'
    },
    services: {
      title: 'Nos Rituels',
      description: 'Des soins sur mesure pour votre bien-être'
    },
    features: {
      title: 'L\'Expérience',
      items: [
        { title: 'Détente', description: 'Ambiance apaisante' },
        { title: 'Expertise', description: 'Professionnels qualifiés' },
        { title: 'Produits', description: 'Cosmétiques naturels' },
        { title: 'Bien-être', description: 'Approche holistique' }
      ]
    },
    team: {
      title: 'Notre Équipe',
      description: 'Des experts passionnés à votre service'
    },
    testimonials: {
      title: 'Ils nous font confiance',
      items: [
        { name: 'Marie L.', rating: 5, text: 'Un moment de pur bonheur, une équipe aux petits soins.' },
        { name: 'Sophie D.', rating: 5, text: 'Cadre magnifique, prestations exceptionnelles.' },
        { name: 'Laura M.', rating: 5, text: 'Je ressors ressourcée à chaque visite. Merci !' }
      ]
    },
    cta: {
      title: 'Offrez-vous un Moment',
      description: 'Réservez votre parenthèse bien-être',
      button: 'Réserver',
      secondaryButton: 'Nous contacter'
    },
    footer: {
      tagline: '',
      contact: {
        phone: '01 23 45 67 89',
        address: 'Paris'
      },
      hours: 'Lun-Sam 9h-20h'
    }
  };

  const c = content || defaultContent;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50">
      {/* Header flottant zen */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Leaf className="w-6 h-6" style={{ color: primaryColor }} />
              <h1 className="text-xl font-serif" style={{ color: secondaryColor }}>
                {organization.name}
              </h1>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#soins" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                Soins
              </a>
              <a href="#equipe" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                Équipe
              </a>
              <a href="#contact" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                Contact
              </a>
              <Link
                href="/booking"
                className="px-6 py-2.5 rounded-full text-white text-sm font-medium transition-all hover:shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {c.hero.ctaPrimary}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero avec image de fond et overlay doux */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Fond avec dégradé */}
        <div className="absolute inset-0 opacity-10" style={{
          background: `radial-gradient(circle at top right, ${primaryColor}, transparent)`
        }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200 mb-8">
            <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
            <span className="text-sm text-stone-600">Bienvenue dans votre havre de paix</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-serif mb-6" style={{ color: secondaryColor }}>
            {c.hero.title}
          </h2>
          <p className="text-xl text-stone-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {c.hero.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="px-8 py-4 rounded-full text-white font-medium shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              {c.hero.ctaPrimary}
            </Link>
            {c.hero.ctaSecondary && (
              <a
                href={`tel:${c.footer.contact.phone.replace(/\s/g, '')}`}
                className="px-8 py-4 rounded-full border-2 font-medium hover:bg-stone-50 transition-all"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                {c.hero.ctaSecondary}
              </a>
            )}
          </div>
        </div>

        {/* Éléments décoratifs flottants */}
        <div className="absolute bottom-10 left-10 w-20 h-20 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: primaryColor }} />
        <div className="absolute top-20 right-10 w-32 h-32 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: secondaryColor }} />
      </section>

      {/* Soins - Cartes avec images et effets hover */}
      <section id="soins" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <Heart className="w-8 h-8 mx-auto" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-4xl font-serif mb-4" style={{ color: secondaryColor }}>
              {c.services.title}
            </h3>
            <p className="text-stone-600 max-w-2xl mx-auto">
              {c.services.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service) => (
              <Link
                key={service.id}
                href={`/booking?service=${service.id}`}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
              >
                {/* Image placeholder avec gradient */}
                <div className="aspect-[4/3] relative overflow-hidden" style={{
                  background: `linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15)`
                }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-16 h-16 opacity-20" style={{ color: primaryColor }} />
                  </div>
                  {/* Overlay au hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-6">
                  <h4 className="text-xl font-serif mb-2 group-hover:translate-x-1 transition-transform" style={{ color: secondaryColor }}>
                    {service.name}
                  </h4>
                  <p className="text-sm text-stone-500 mb-4 line-clamp-2">
                    {service.description || "Un moment de détente absolue"}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                    <div className="flex items-center gap-2 text-stone-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{service.duration} min</span>
                    </div>
                    <div className="text-2xl font-serif" style={{ color: primaryColor }}>
                      {service.price}€
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* L'Expérience - Section avec icônes */}
      {c.features && (
        <section className="py-20 px-6 bg-gradient-to-b from-white to-stone-50">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-4xl font-serif text-center mb-16" style={{ color: secondaryColor }}>
              {c.features.title}
            </h3>

            <div className="grid md:grid-cols-4 gap-8">
              {c.features.items.map((item, idx) => (
                <div key={idx} className="text-center group">
                  <div
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Leaf className="w-8 h-8" style={{ color: primaryColor }} />
                  </div>
                  <h4 className="text-lg font-serif mb-2" style={{ color: secondaryColor }}>
                    {item.title}
                  </h4>
                  <p className="text-sm text-stone-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Équipe - Photos en grille */}
      {team && team.length > 0 && c.team && (
        <section id="equipe" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-serif mb-4" style={{ color: secondaryColor }}>
                {c.team.title}
              </h3>
              <p className="text-stone-600">
                {c.team.description}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {team.slice(0, 3).map((member) => (
                <div key={member.id} className="group">
                  <div
                    className="aspect-[3/4] relative rounded-3xl overflow-hidden mb-4 bg-stone-100"
                    style={{
                      backgroundImage: member.imageUrl ? `url(${member.imageUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!member.imageUrl && (
                      <div className="absolute inset-0 flex items-center justify-center text-6xl font-serif text-stone-300">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    {/* Overlay avec info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <div className="text-white">
                        <p className="text-lg font-serif">{member.name}</p>
                        <p className="text-sm opacity-90">{member.role}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="font-serif mb-1" style={{ color: secondaryColor }}>
                      {member.name}
                    </h4>
                    <p className="text-sm text-stone-500">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Témoignages - Style carte épurée */}
      {c.testimonials && (
        <section className="py-20 px-6 bg-stone-50">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-4xl font-serif text-center mb-16" style={{ color: secondaryColor }}>
              {c.testimonials.title}
            </h3>

            <div className="grid md:grid-cols-3 gap-8">
              {c.testimonials.items.map((review, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl shadow-md hover:shadow-xl transition-shadow">
                  {/* Étoiles */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <div key={i} className="w-5 h-5 rounded-full" style={{ backgroundColor: `${primaryColor}30` }} />
                    ))}
                  </div>

                  <p className="text-stone-700 mb-6 leading-relaxed italic">
                    "{review.text}"
                  </p>

                  <p className="text-sm font-medium" style={{ color: primaryColor }}>
                    {review.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Final - Grande section immersive */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          background: `radial-gradient(circle at center, ${primaryColor}, transparent)`
        }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h3 className="text-5xl font-serif mb-6" style={{ color: secondaryColor }}>
            {c.cta.title}
          </h3>
          <p className="text-xl text-stone-600 mb-10">
            {c.cta.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="px-10 py-4 rounded-full text-white text-lg font-medium shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              {c.cta.button}
            </Link>
            {c.cta.secondaryButton && (
              <a
                href={`tel:${c.footer.contact.phone.replace(/\s/g, '')}`}
                className="px-10 py-4 rounded-full border-2 text-lg font-medium hover:bg-stone-50 transition-all"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                {c.cta.secondaryButton}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer zen */}
      <footer className="border-t border-stone-200 py-12 px-6 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-5 h-5" style={{ color: primaryColor }} />
                <h4 className="font-serif" style={{ color: secondaryColor }}>
                  {organization.name}
                </h4>
              </div>
              {c.footer.tagline && (
                <p className="text-sm text-stone-600">
                  {c.footer.tagline}
                </p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium uppercase tracking-wider mb-4 text-stone-400">Contact</h4>
              <p className="text-sm text-stone-600 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {c.footer.contact.phone}
              </p>
              {c.footer.contact.address && (
                <p className="text-sm text-stone-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {c.footer.contact.address}
                </p>
              )}
            </div>

            {c.footer.hours && (
              <div>
                <h4 className="text-sm font-medium uppercase tracking-wider mb-4 text-stone-400">Horaires</h4>
                <p className="text-sm text-stone-600">{c.footer.hours}</p>
              </div>
            )}
          </div>

          <div className="border-t border-stone-200 pt-8 text-center">
            <p className="text-sm text-stone-400">
              © 2024 {organization.name} - Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

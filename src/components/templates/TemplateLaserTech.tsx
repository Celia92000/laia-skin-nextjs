'use client';

import Link from 'next/link';
import { Clock, Check, HelpCircle, Calendar } from 'lucide-react';

interface TemplateContent {
  hero: {
    title: string;
    subtitle?: string;
    description: string;
    ctaPrimary: string;
  };
  pricing: {
    title: string;
    note?: string;
  };
  features?: {
    title: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  faq?: {
    title: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  cta: {
    title: string;
    description: string;
    button: string;
    note?: string;
  };
  footer: {
    tagline?: string;
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

export default function TemplateLaserTech({ organization, services, team, content }: TemplateProps) {
  const primaryColor = organization.primaryColor;
  const secondaryColor = organization.secondaryColor;

  // Default content
  const defaultContent: TemplateContent = {
    hero: {
      title: 'Épilation Laser Définitive - Dites Adieu aux Poils !',
      description: organization.description || 'Une peau lisse durablement grâce à notre technologie laser dernière génération',
      ctaPrimary: 'Première Séance à -50%'
    },
    pricing: {
      title: 'Nos Tarifs',
      note: 'Première séance à -50% • Paiement en plusieurs fois possible'
    },
    features: {
      title: 'Pourquoi Choisir Notre Centre ?',
      items: [
        { title: 'Technologie Laser Diode', description: 'Le laser le plus performant du marché' },
        { title: 'Tous Types de Peau', description: 'Efficace sur tous les phototypes' },
        { title: 'Résultats Durables', description: 'Élimination définitive des poils' },
        { title: 'Sans Douleur', description: 'Traitement confortable et rapide' },
        { title: 'Praticiens Formés', description: 'Équipe expérimentée et diplômée' },
        { title: 'Prix Transparents', description: 'Pas de frais cachés' }
      ]
    },
    faq: {
      title: 'Questions Fréquentes',
      items: [
        { question: 'Combien de séances sont nécessaires ?', answer: 'En moyenne, 6 à 8 séances espacées de 4 à 6 semaines sont nécessaires pour obtenir une élimination définitive.' },
        { question: 'Est-ce que ça fait mal ?', answer: 'Non, notre laser dispose d\'un système de refroidissement intégré. La sensation est comparable à un léger picotement.' },
        { question: 'Combien coûte un forfait complet ?', answer: 'Les prix varient selon les zones. Nous proposons des forfaits avantageux et un paiement en plusieurs fois.' },
        { question: 'Y a-t-il des contre-indications ?', answer: 'Très peu. Une consultation préalable (gratuite) permet de vérifier votre éligibilité au traitement.' },
        { question: 'Quand voit-on les résultats ?', answer: 'Les premiers résultats sont visibles dès la 2ème séance. Les poils repoussent de moins en moins nombreux et de plus en plus fins.' },
        { question: 'Peut-on traiter toutes les zones ?', answer: 'Oui, toutes les zones du corps peuvent être traitées : visage, aisselles, maillot, jambes, dos, etc.' }
      ]
    },
    cta: {
      title: 'Prêt(e) à Commencer ?',
      description: 'Réservez votre première séance maintenant',
      button: 'Je prends rendez-vous !',
      note: 'Première séance à -50% • Consultation gratuite'
    },
    footer: {
      tagline: undefined
    }
  };

  const c = content || defaultContent;

  return (
    <div className="min-h-screen bg-white">
      {/* Header simple */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{organization.name}</h1>
          <Link
            href="/booking"
            className="px-8 py-3 rounded-full text-white font-bold text-sm uppercase tracking-wider transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            {c.hero.ctaPrimary}
          </Link>
        </div>
      </header>

      {/* Hero avec accroche forte */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {c.hero.title.split(' - ')[0]}
            <br />
            <span style={{ color: primaryColor }}>{c.hero.title.split(' - ')[1] || c.hero.title}</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {c.hero.description}
          </p>
          <Link
            href="/booking"
            className="inline-block px-12 py-4 rounded-full text-white font-bold text-lg uppercase transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            {c.hero.ctaPrimary}
          </Link>
        </div>
      </section>

      {/* Tarifs en tableau */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">{c.pricing.title}</h3>

          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left font-bold uppercase text-sm text-gray-700">Zone</th>
                  <th className="px-6 py-4 text-left font-bold uppercase text-sm text-gray-700">Durée</th>
                  <th className="px-6 py-4 text-right font-bold uppercase text-sm text-gray-700">Prix</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {services.slice(0, 8).map((service, idx) => (
                  <tr key={service.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4 font-semibold text-gray-900">{service.name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{service.duration}min</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-2xl font-bold" style={{ color: primaryColor }}>{service.price}€</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/booking?service=${service.id}`}
                        className="px-4 py-2 rounded-full text-white font-semibold text-xs uppercase transition-all hover:opacity-90"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Réserver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {c.pricing.note && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">{c.pricing.note}</p>
            </div>
          )}
        </div>
      </section>

      {/* Pourquoi nous */}
      {c.features && (
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">{c.features.title}</h3>

            <div className="grid md:grid-cols-3 gap-8">
              {c.features.items.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                      <Check className="w-4 h-4" style={{ color: primaryColor }} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {c.faq && (
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">{c.faq.title}</h3>

            <div className="space-y-4">
              {c.faq.items.map((faq, idx) => (
                <details key={idx} className="group bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <summary className="px-6 py-4 cursor-pointer list-none flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 flex-shrink-0" style={{ color: primaryColor }} />
                      <span className="font-semibold text-gray-900">{faq.question}</span>
                    </div>
                    <svg className="w-5 h-5 transition-transform group-open:rotate-180" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-6">{c.cta.title}</h3>
          <p className="text-xl text-gray-600 mb-8">
            {c.cta.description}
          </p>
          <Link
            href="/booking"
            className="inline-block px-12 py-4 rounded-full text-white font-bold text-lg uppercase transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            {c.cta.button}
          </Link>
          {c.cta.note && (
            <p className="mt-4 text-sm text-gray-500">{c.cta.note}</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm mb-2">{c.footer.tagline || organization.name}</p>
          <p className="text-xs text-gray-400">
            © 2024 {organization.name} • Propulsé par LAIA Connect
          </p>
        </div>
      </footer>
    </div>
  );
}

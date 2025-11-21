'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BaseTemplateContent } from '@/types/template-content';

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
  content?: BaseTemplateContent;
}

export default function TemplateModern({ organization, services, team, content }: TemplateProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const defaultContent: BaseTemplateContent = {
    hero: {
      title: 'Révélez Votre Beauté Moderne',
      description: organization.description || 'Institut de beauté nouvelle génération',
      ctaPrimary: 'Book Now'
    },
    services: {
      title: 'Nos Services',
      description: 'Des soins innovants pour une beauté contemporaine'
    },
    team: {
      title: 'Our Team',
      description: 'Des experts passionnés à votre service'
    },
    cta: {
      title: 'Prêt à découvrir l\'innovation beauté ?',
      description: 'Réservez votre expérience',
      button: 'Book Your Experience'
    },
    footer: {
      tagline: 'L\'innovation au service de votre beauté'
    }
  };

  const c = content || defaultContent;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header FUTURISTE transparent fixe */}
      <header className="fixed w-full top-0 z-50 backdrop-blur-2xl bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black tracking-tighter relative">
              <span className="relative z-10 text-white">{organization.name}</span>
              <div
                className="absolute inset-0 blur-2xl opacity-50"
                style={{
                  background: `linear-gradient(90deg, ${organization.primaryColor}, ${organization.secondaryColor})`,
                  transform: 'scale(1.5)'
                }}
              />
            </h1>
            <nav className="hidden md:flex gap-8 items-center">
              {['Services', 'Team', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-white/70 hover:text-white font-bold uppercase text-sm tracking-wider transition-all relative group"
                >
                  {item}
                  <span
                    className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                    style={{ backgroundColor: organization.primaryColor }}
                  />
                </a>
              ))}
              <Link
                href="/booking"
                className="px-6 py-3 rounded-lg font-bold uppercase text-sm tracking-wider relative overflow-hidden group"
                style={{
                  background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`,
                  boxShadow: `0 0 30px ${organization.primaryColor}50`
                }}
              >
                <span className="relative z-10">{c.hero.ctaPrimary}</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* HERO FULL-SCREEN ultra moderne */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background animé avec grille */}
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(${organization.primaryColor}20 1px, transparent 1px),
              linear-gradient(90deg, ${organization.primaryColor}20 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
          }} />

          {/* Gradient circles animés */}
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${organization.primaryColor}, transparent)`,
              animation: 'float 8s ease-in-out infinite'
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${organization.secondaryColor}, transparent)`,
              animation: 'float 8s ease-in-out infinite reverse',
              animationDelay: '2s'
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Badge futuriste */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 mb-8">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: organization.primaryColor }} />
            <span className="text-sm font-bold uppercase tracking-wider text-white/80">Next-Gen Beauty Experience</span>
          </div>

          <h2 className="text-7xl md:text-9xl font-black mb-8 leading-none tracking-tighter">
            <span className="block text-white">{organization.name}</span>
            <span
              className="block mt-4 bg-clip-text text-transparent bg-gradient-to-r"
              style={{
                backgroundImage: `linear-gradient(to right, ${organization.primaryColor}, ${organization.secondaryColor})`
              }}
            >
              {c.hero.title}
            </span>
          </h2>

          <p className="text-2xl text-white/60 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
            {c.hero.description}
          </p>

          <div className="flex gap-6 justify-center flex-wrap">
            <Link
              href="/booking"
              className="group relative px-12 py-5 rounded-xl font-black uppercase tracking-wider text-lg overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`,
                boxShadow: `0 20px 60px ${organization.primaryColor}40`
              }}
            >
              <span className="relative z-10 flex items-center gap-3">
                Get Started
                <span className="text-2xl group-hover:translate-x-2 transition-transform">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Link>

            <a
              href="#services"
              className="px-12 py-5 rounded-xl font-black uppercase tracking-wider text-lg border-2 border-white/20 hover:border-white/40 backdrop-blur-xl bg-white/5 hover:bg-white/10 transition-all"
            >
              Explore
            </a>
          </div>

          {/* Stats futuristes */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto">
            {[
              { value: '500+', label: 'Happy Clients' },
              { value: '15Y', label: 'Experience' },
              { value: '4.9', label: 'Rating' }
            ].map((stat, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute inset-0 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-all" />
                <div className="relative p-6">
                  <div
                    className="text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-br"
                    style={{
                      backgroundImage: `linear-gradient(to bottom right, ${organization.primaryColor}, ${organization.secondaryColor})`
                    }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/60 uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            33% { transform: translateY(-30px) translateX(20px); }
            66% { transform: translateY(30px) translateX(-20px); }
          }
        `}</style>
      </section>

      {/* Services - Cards 3D avec effets néon */}
      <section id="services" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 mb-6">
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: organization.primaryColor }}>
                {c.services.title}
              </span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black mb-6 tracking-tighter">
              Premium Treatments
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Advanced techniques for extraordinary results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service, idx) => (
              <div
                key={service.id}
                className="group relative"
                onMouseEnter={() => setHoveredCard(service.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`,
                  perspective: '1000px'
                }}
              >
                <div
                  className="relative h-full p-8 rounded-2xl backdrop-blur-xl transition-all duration-500"
                  style={{
                    background: hoveredCard === service.id
                      ? `linear-gradient(135deg, ${organization.primaryColor}20, ${organization.secondaryColor}20)`
                      : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${hoveredCard === service.id ? organization.primaryColor + '60' : 'rgba(255, 255, 255, 0.1)'}`,
                    boxShadow: hoveredCard === service.id ? `0 20px 60px ${organization.primaryColor}30` : 'none',
                    transform: hoveredCard === service.id ? 'translateY(-10px) rotateX(5deg)' : 'translateY(0) rotateX(0deg)',
                  }}
                >
                  {/* Glow effect */}
                  {hoveredCard === service.id && (
                    <div
                      className="absolute inset-0 rounded-2xl blur-xl opacity-50"
                      style={{
                        background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`
                      }}
                    />
                  )}

                  <div className="relative">
                    {/* Icône avec effet néon */}
                    <div className="text-6xl mb-6 filter drop-shadow-lg">💆‍♀️</div>

                    <h3 className="text-2xl font-bold mb-4 text-white">{service.name}</h3>
                    <p className="text-white/60 mb-6 min-h-[60px] leading-relaxed">
                      {service.description || 'Advanced treatment for premium results and ultimate relaxation'}
                    </p>

                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                      <div>
                        <div
                          className="text-5xl font-black mb-1"
                          style={{ color: organization.primaryColor }}
                        >
                          {service.price}€
                        </div>
                        <div className="text-sm text-white/40 uppercase tracking-wider">{service.duration} min</div>
                      </div>
                      <div
                        className="w-16 h-16 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl transition-transform duration-300"
                        style={{
                          transform: hoveredCard === service.id ? 'scale(1.2) rotate(45deg)' : 'scale(1) rotate(0deg)'
                        }}
                      >
                        →
                      </div>
                    </div>

                    <Link
                      href={`/booking?service=${service.id}`}
                      className="block w-full py-4 rounded-xl font-bold uppercase tracking-wider text-center relative overflow-hidden group/btn"
                      style={{
                        background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`,
                        boxShadow: `0 10px 30px ${organization.primaryColor}40`
                      }}
                    >
                      <span className="relative z-10">{c.hero.ctaPrimary}</span>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </section>

      {/* Team - Cards horizontales modernes */}
      {team && team.length > 0 && (
        <section id="team" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-block px-4 py-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 mb-6">
                <span className="text-sm font-bold uppercase tracking-wider" style={{ color: organization.primaryColor }}>
                  {c.team?.title || 'Our Team'}
                </span>
              </div>
              <h2 className="text-6xl md:text-7xl font-black mb-6 tracking-tighter">
                Expert Specialists
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {team.slice(0, 4).map((member, idx) => (
                <div
                  key={member.id}
                  className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`
                  }}
                >
                  <div className="flex gap-6 items-center">
                    <div
                      className="w-24 h-24 rounded-2xl flex-shrink-0 relative overflow-hidden group-hover:scale-110 transition-transform duration-500"
                      style={{
                        background: member.imageUrl
                          ? `url(${member.imageUrl}) center/cover`
                          : `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`
                      }}
                    >
                      {!member.imageUrl && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-black opacity-30">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      {/* Glow au hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`,
                          mixBlendMode: 'screen'
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                      <p className="font-bold uppercase text-sm tracking-wider mb-3" style={{ color: organization.primaryColor }}>
                        {member.role}
                      </p>
                      <p className="text-white/60 text-sm">
                        Certified expert with years of experience
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact - CTA futuriste */}
      <section id="contact" className="py-32 px-6 relative overflow-hidden">
        {/* Background effet */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${organization.primaryColor}, ${organization.secondaryColor}, transparent)`
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-16 text-center">
            <h2 className="text-6xl md:text-7xl font-black mb-8 tracking-tighter">
              Ready to Transform?
            </h2>
            <p className="text-2xl text-white/70 mb-12 max-w-2xl mx-auto">
              Book your premium experience today
            </p>

            <Link
              href="/booking"
              className="inline-block px-16 py-6 rounded-2xl font-black uppercase tracking-wider text-xl relative overflow-hidden group mb-16"
              style={{
                background: `linear-gradient(135deg, ${organization.primaryColor}, ${organization.secondaryColor})`,
                boxShadow: `0 30px 80px ${organization.primaryColor}50`
              }}
            >
              <span className="relative z-10 flex items-center gap-3">
                Book Now
                <span className="text-3xl group-hover:translate-x-3 transition-transform">→</span>
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            </Link>

            <div className="grid md:grid-cols-3 gap-12 pt-16 border-t border-white/10">
              {[
                { icon: '📍', title: 'Location', info: 'Nanterre Université, 92000' },
                { icon: '📞', title: 'Phone', info: '+33 6 31 10 75 31' },
                { icon: '⏰', title: 'Hours', info: 'Mon-Sat: 9AM-7PM' }
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <div className="text-sm text-white/40 uppercase tracking-wider mb-2">{item.title}</div>
                  <div className="text-white font-semibold">{item.info}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer dark */}
      <footer className="border-t border-white/10 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <h3 className="text-3xl font-black mb-2">{organization.name}</h3>
              <p className="text-white/60">The Future of Beauty</p>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-white/60 hover:text-white transition-colors uppercase text-sm font-bold tracking-wider">Facebook</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors uppercase text-sm font-bold tracking-wider">Instagram</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors uppercase text-sm font-bold tracking-wider">TikTok</a>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-white/40 text-sm">© 2024 {organization.name}. All rights reserved.</p>
            <p className="text-white/20 text-xs mt-2">Powered by LAIA Connect</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

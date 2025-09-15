import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-accent text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 relative">
                <Image
                  src="/logo-laia-skin.png"
                  alt="LAIA SKIN Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-playfair tracking-normal text-white">LAIA SKIN INSTITUT</h3>
            </div>
            <p className="text-base text-white leading-relaxed mb-4 font-playfair italic">
              Une peau respectée, une beauté révélée
            </p>
            <div className="flex gap-3">
              <a 
                href="https://www.instagram.com/laia.skin/" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                title="Suivez-nous sur Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61578944046472" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                title="Suivez-nous sur Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://www.tiktok.com/@laiaskin" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                title="Suivez-nous sur TikTok"
              >
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.37 6.37 0 0 0-1-.05A6.34 6.34 0 0 0 3 15.7a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.44a8.27 8.27 0 0 0 4.74 1.48V6.46a4.79 4.79 0 0 1-1.83.23z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-playfair text-xl mb-4 text-white">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/prestations" className="text-base text-white/95 hover:text-white transition-colors">
                  Mes prestations
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="text-base text-white/95 hover:text-white transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/reservation" className="text-base text-white/95 hover:text-white transition-colors">
                  Réservation
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-base text-white/95 hover:text-white transition-colors">
                  Espace client
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-base text-white/95 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-playfair text-xl mb-4 text-white">Mes prestations</h4>
            <ul className="space-y-2">
              <li className="text-base text-white/95">Hydro'Naissance</li>
              <li className="text-base text-white/95">Hydro'Cleaning</li>
              <li className="text-base text-white/95">Renaissance</li>
              <li className="text-base text-white/95">BB Glow</li>
              <li className="text-base text-white/95">LED Thérapie</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-playfair text-xl mb-4 text-white">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-base text-white/95">
                  À 6 minutes de la gare<br />de Nanterre Université
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Instagram size={16} className="text-primary flex-shrink-0" />
                <a href="https://www.instagram.com/laia.skin/" target="_blank" rel="noopener noreferrer" className="text-base text-white/95 hover:text-white transition-colors">@laia.skin</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary flex-shrink-0" />
                <span className="text-base text-white/95">contact@laia-skin.fr</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-base text-white/95">
                  Lun-Ven: 14h-20h<br />
                  Sam-Dim: 14h-20h
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Sparkles className="text-primary" size={20} />
              <div>
                <h5 className="font-serif">Newsletter exclusive</h5>
                <p className="text-sm text-white/90">Recevez mes offres et actualités</p>
              </div>
            </div>
            <form className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Votre email"
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:border-primary w-full sm:w-64"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-accent rounded-full hover:bg-primary-light transition-colors text-sm font-light whitespace-nowrap w-full sm:w-auto"
              >
                S'inscrire
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/80">
              © 2024 LAIA SKIN Institut. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-white/80 hover:text-white transition-colors">
                Mentions légales
              </Link>
              <Link href="#" className="text-sm text-white/80 hover:text-white transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="#" className="text-sm text-white/80 hover:text-white transition-colors">
                CGV
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
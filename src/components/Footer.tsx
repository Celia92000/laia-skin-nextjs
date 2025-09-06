import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-accent text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
                <span className="text-white font-serif text-sm">LS</span>
              </div>
              <h3 className="text-xl font-serif">LAIA SKIN</h3>
            </div>
            <p className="text-sm text-gray-400 font-light leading-relaxed mb-4">
              Votre sanctuaire de beauté où excellence 
              et bien-être se rencontrent.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://www.instagram.com/laiaskin" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/prestations" className="text-sm text-gray-400 hover:text-white transition-colors font-light">
                  Mes prestations
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="text-sm text-gray-400 hover:text-white transition-colors font-light">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/reservation" className="text-sm text-gray-400 hover:text-white transition-colors font-light">
                  Réservation
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors font-light">
                  Espace client
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors font-light">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-lg mb-4">Mes prestations</h4>
            <ul className="space-y-2">
              <li className="text-sm text-gray-400 font-light">Hydro'Cleaning</li>
              <li className="text-sm text-gray-400 font-light">Renaissance</li>
              <li className="text-sm text-gray-400 font-light">BB Glow</li>
              <li className="text-sm text-gray-400 font-light">LED Thérapie</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400 font-light">
                  À 6 minutes de la gare<br />de Nanterre Université
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Instagram size={16} className="text-primary flex-shrink-0" />
                <a href="https://www.instagram.com/laiaskin" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 font-light hover:text-white transition-colors">@laiaskin</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary flex-shrink-0" />
                <span className="text-sm text-gray-400 font-light">contact@laia-skin.fr</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400 font-light">
                  Lun-Ven: 10h-19h<br />
                  Sam: 10h-17h
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
                <p className="text-sm text-gray-400 font-light">Recevez nos offres et actualités</p>
              </div>
            </div>
            <form className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Votre email"
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:border-primary w-full md:w-64"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-accent rounded-full hover:bg-primary-light transition-colors text-sm font-light whitespace-nowrap"
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
            <p className="text-sm text-gray-400 font-light">
              © 2024 LAIA SKIN Institut. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors font-light">
                Mentions légales
              </Link>
              <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors font-light">
                Politique de confidentialité
              </Link>
              <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors font-light">
                CGV
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
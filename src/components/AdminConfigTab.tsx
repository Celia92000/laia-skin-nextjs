'use client';

import { useState, useEffect } from 'react';
import {
  Save, Settings, Mail, Phone, MapPin, Facebook, Instagram,
  MessageCircle, Palette, Clock, FileText, Globe, Building, Shield,
  Linkedin, Youtube, Map, User, BookOpen, Star, CreditCard, Search, BarChart, Zap, Key, Layout, Eye, Smartphone
} from 'lucide-react';
import SocialMediaAPISync from './SocialMediaAPISync';
import SocialMediaPreferences from './admin/SocialMediaPreferences';
import IntegrationsTab from './IntegrationsTab';
import SocialMediaTokensManager from './SocialMediaTokensManager';
import SocialMediaPublisher from './SocialMediaPublisher';
import ApiTokensManager from './ApiTokensManager';
import AdminSMSConfigTab from './AdminSMSConfigTab';
import AdminEmailConfigTab from './AdminEmailConfigTab';
import AdminWhatsAppConfigTab from './AdminWhatsAppConfigTab';
import ConfigurationChecklist from './ConfigurationChecklist';
import { websiteTemplates, getTemplatesForPlan } from '@/lib/website-templates';
import LiveTemplatePreview from './LiveTemplatePreview';

interface SiteConfig {
  id?: string;
  siteName: string;
  siteTagline?: string;
  siteDescription?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  headingFont?: string;
  baseFontSize?: string;
  headingSize?: string;
  logoUrl?: string;
  faviconUrl?: string;
  businessHours?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  aboutText?: string;
  termsAndConditions?: string;
  privacyPolicy?: string;
  legalNotice?: string;
  emailSignature?: string;
  welcomeEmailText?: string;

  // Informations légales de l'entreprise
  legalName?: string;
  siret?: string;
  siren?: string;
  tvaNumber?: string;
  apeCode?: string;
  rcs?: string;
  capital?: string;
  legalForm?: string;
  insuranceCompany?: string;
  insuranceContract?: string;
  insuranceAddress?: string;
  legalRepName?: string;
  legalRepTitle?: string;

  // Réseaux sociaux supplémentaires
  linkedin?: string;
  youtube?: string;

  // Géolocalisation
  country?: string;
  latitude?: string;
  longitude?: string;
  googleMapsUrl?: string;

  // Fondateur
  founderName?: string;
  founderTitle?: string;
  founderQuote?: string;
  founderImage?: string;

  // Page À propos
  aboutIntro?: string;
  aboutParcours?: string;

  // Données structurées (JSON)
  testimonials?: string;
  formations?: string;

  // Finances
  bankName?: string;
  bankIban?: string;
  bankBic?: string;

  // Configuration technique
  baseUrl?: string;
  websiteTemplateId?: string;
  websiteTemplate?: string; // ID du template sélectionné

  // Tracking & Analytics
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  metaVerificationCode?: string;
  googleVerificationCode?: string;

  // SEO global
  defaultMetaTitle?: string;
  defaultMetaDescription?: string;
  defaultMetaKeywords?: string;

  // Chat en direct
  crispWebsiteId?: string;
  crispEnabled?: boolean;

  // Google My Business
  googlePlaceId?: string;
  googleBusinessUrl?: string;
  lastGoogleSync?: string;
  autoSyncGoogleReviews?: boolean;
}

export default function AdminConfigTab() {
  const [config, setConfig] = useState<SiteConfig>({
    siteName: 'Laia Skin Institut',
    siteTagline: 'Institut de Beauté & Bien-être',
    primaryColor: '#d4b5a0',
    secondaryColor: '#2c3e50',
    accentColor: '#20b2aa'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'social' | 'appearance' | 'template' | 'hours' | 'content' | 'legal' | 'company' | 'about' | 'location' | 'seo' | 'finances' | 'integrations' | 'api' | 'google' | 'sms' | 'email' | 'whatsapp'>('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [organizationPlan, setOrganizationPlan] = useState<string>('SOLO');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);

        // Récupérer le plan de l'organisation
        if (data.organizationId) {
          const orgResponse = await fetch('/api/organization/current');
          if (orgResponse.ok) {
            const orgData = await orgResponse.json();
            setOrganizationPlan(orgData.plan || 'SOLO');
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4b5a0] mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2c3e50]">Configuration du Site</h2>
            <p className="text-gray-500">Personnalisez tous les aspects de votre site</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium shadow-lg transition ${
            saving
              ? 'bg-gray-400 cursor-not-allowed'
              : saveStatus === 'success'
              ? 'bg-green-600'
              : saveStatus === 'error'
              ? 'bg-red-600'
              : 'bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] hover:shadow-xl'
          }`}
        >
          <Save className="w-5 h-5" />
          {saving ? 'Enregistrement...' : saveStatus === 'success' ? 'Enregistré !' : saveStatus === 'error' ? 'Erreur' : 'Enregistrer'}
        </button>
      </div>

      {/* Configuration Progress Checklist */}
      <ConfigurationChecklist
        currentTabId={activeTab}
        onTabChange={setActiveTab as (tabId: string) => void}
      />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-gray-200 pb-2">
        {[
          { id: 'general', label: 'Général', icon: Globe },
          { id: 'contact', label: 'Contact', icon: Phone },
          { id: 'company', label: 'Entreprise', icon: Building },
          { id: 'social', label: 'Réseaux sociaux', icon: MessageCircle },
          { id: 'appearance', label: 'Apparence', icon: Palette },
          { id: 'template', label: 'Template Web', icon: Layout },
          { id: 'hours', label: 'Horaires', icon: Clock },
          { id: 'content', label: 'Contenu', icon: FileText },
          { id: 'about', label: 'À propos', icon: User },
          { id: 'location', label: 'Localisation', icon: Map },
          { id: 'seo', label: 'SEO & Tracking', icon: Search },
          { id: 'google', label: 'Google Business', icon: Star },
          { id: 'integrations', label: 'Intégrations', icon: Zap },
          { id: 'api', label: 'API & Sécurité', icon: Key },
          { id: 'sms', label: 'SMS Marketing', icon: Smartphone },
          { id: 'email', label: 'Emailing', icon: Mail },
          { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
          { id: 'finances', label: 'Finances', icon: CreditCard },
          { id: 'legal', label: 'Légal', icon: Shield }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#d4b5a0] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu des tabs */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Informations générales</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du site *
              </label>
              <input
                type="text"
                value={config.siteName}
                onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Laia Skin Institut"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slogan
              </label>
              <input
                type="text"
                value={config.siteTagline || ''}
                onChange={(e) => setConfig({ ...config, siteTagline: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Institut de Beauté & Bien-être"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description du site
              </label>
              <textarea
                value={config.siteDescription || ''}
                onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Décrivez votre institut en quelques phrases..."
              />
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Informations de contact</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={config.email || ''}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  placeholder="contact@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={config.phone || ''}
                  onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  placeholder="+33 6 XX XX XX XX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Adresse
              </label>
              <input
                type="text"
                value={config.address || ''}
                onChange={(e) => setConfig({ ...config, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="123 Rue de la Beauté"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={config.city || ''}
                  onChange={(e) => setConfig({ ...config, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  placeholder="Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  value={config.postalCode || ''}
                  onChange={(e) => setConfig({ ...config, postalCode: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  placeholder="75001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Pays
                </label>
                <input
                  type="text"
                  value={config.country || ''}
                  onChange={(e) => setConfig({ ...config, country: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  placeholder="France"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'company' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-[#d4b5a0]" />
              Informations légales de l'entreprise
            </h3>

            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison sociale *
                </label>
                <input
                  type="text"
                  value={config.legalName || ''}
                  onChange={(e) => setConfig({ ...config, legalName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  placeholder="LAIA SKIN SARL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forme juridique
                </label>
                <select
                  value={config.legalForm || ''}
                  onChange={(e) => setConfig({ ...config, legalForm: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                >
                  <option value="">Sélectionner...</option>
                  <option value="SARL">SARL</option>
                  <option value="EURL">EURL</option>
                  <option value="SAS">SAS</option>
                  <option value="SASU">SASU</option>
                  <option value="EI">Entreprise Individuelle</option>
                  <option value="MICRO">Micro-entreprise</option>
                  <option value="AUTO">Auto-entrepreneur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capital social
                </label>
                <input
                  type="text"
                  value={config.capital || ''}
                  onChange={(e) => setConfig({ ...config, capital: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  placeholder="10 000 €"
                />
              </div>
            </div>

            {/* Numéros légaux */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-md font-semibold text-[#2c3e50] mb-3">Numéros d'identification</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SIRET <span className="text-xs text-gray-500">(14 chiffres)</span>
                  </label>
                  <input
                    type="text"
                    value={config.siret || ''}
                    onChange={(e) => setConfig({ ...config, siret: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="123 456 789 00012"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SIREN <span className="text-xs text-gray-500">(9 chiffres)</span>
                  </label>
                  <input
                    type="text"
                    value={config.siren || ''}
                    onChange={(e) => setConfig({ ...config, siren: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="123 456 789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    N° TVA intracommunautaire
                  </label>
                  <input
                    type="text"
                    value={config.tvaNumber || ''}
                    onChange={(e) => setConfig({ ...config, tvaNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="FR 12 123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code APE/NAF
                  </label>
                  <input
                    type="text"
                    value={config.apeCode || ''}
                    onChange={(e) => setConfig({ ...config, apeCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="9602B"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RCS (Registre du Commerce)
                  </label>
                  <input
                    type="text"
                    value={config.rcs || ''}
                    onChange={(e) => setConfig({ ...config, rcs: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="Paris 123 456 789"
                  />
                </div>
              </div>
            </div>

            {/* Représentant légal */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="text-md font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                Représentant légal
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={config.legalRepName || ''}
                    onChange={(e) => setConfig({ ...config, legalRepName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="Laïa Martin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={config.legalRepTitle || ''}
                    onChange={(e) => setConfig({ ...config, legalRepTitle: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="Gérante"
                  />
                </div>
              </div>
            </div>

            {/* Assurance */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="text-md font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                Assurance professionnelle
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compagnie d'assurance
                  </label>
                  <input
                    type="text"
                    value={config.insuranceCompany || ''}
                    onChange={(e) => setConfig({ ...config, insuranceCompany: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="AXA France"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    N° de contrat
                  </label>
                  <input
                    type="text"
                    value={config.insuranceContract || ''}
                    onChange={(e) => setConfig({ ...config, insuranceContract: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="1234567"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse de l'assurance
                  </label>
                  <input
                    type="text"
                    value={config.insuranceAddress || ''}
                    onChange={(e) => setConfig({ ...config, insuranceAddress: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="10 rue de la Paix, 75001 Paris"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>ℹ️ Informations importantes :</strong> Ces données seront utilisées sur vos factures,
                devis et documents légaux. Assurez-vous qu'elles sont exactes et à jour.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Réseaux sociaux</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Facebook className="w-4 h-4" />
                Facebook (URL complète)
              </label>
              <input
                type="url"
                value={config.facebook || ''}
                onChange={(e) => setConfig({ ...config, facebook: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="https://facebook.com/votre-page"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Instagram (URL complète)
              </label>
              <input
                type="url"
                value={config.instagram || ''}
                onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="https://instagram.com/votre-compte"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TikTok (URL complète)
              </label>
              <input
                type="url"
                value={config.tiktok || ''}
                onChange={(e) => setConfig({ ...config, tiktok: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="https://tiktok.com/@votre-compte"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp (numéro avec indicatif)
              </label>
              <input
                type="tel"
                value={config.whatsapp || ''}
                onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="+33612345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn (URL complète)
              </label>
              <input
                type="url"
                value={config.linkedin || ''}
                onChange={(e) => setConfig({ ...config, linkedin: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="https://linkedin.com/in/votre-profil"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Youtube className="w-4 h-4" />
                YouTube (URL complète)
              </label>
              <input
                type="url"
                value={config.youtube || ''}
                onChange={(e) => setConfig({ ...config, youtube: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="https://youtube.com/@votre-chaine"
              />
            </div>

            {/* Configuration API pour publication automatique */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Configuration API pour publication automatique</h3>
              <p className="text-sm text-gray-600 mb-6">
                Configurez vos tokens API pour publier automatiquement sur Instagram et Facebook depuis l'onglet Réseaux Sociaux
              </p>

              <div className="space-y-6">
                <SocialMediaAPISync />
                <SocialMediaPreferences />
              </div>
            </div>

            {/* Publication sur réseaux sociaux */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <SocialMediaPublisher />
            </div>

            {/* Gestion des tokens API réseaux sociaux */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Gestion des Tokens API</h3>
              <SocialMediaTokensManager />
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Apparence et couleurs</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur principale
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.primaryColor || '#d4b5a0'}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="h-12 w-16 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primaryColor || '#d4b5a0'}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="#d4b5a0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur secondaire
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.secondaryColor || '#2c3e50'}
                    onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                    className="h-12 w-16 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.secondaryColor || '#2c3e50'}
                    onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="#2c3e50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur d'accent
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.accentColor || '#20b2aa'}
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                    className="h-12 w-16 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.accentColor || '#20b2aa'}
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="#20b2aa"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo (URL)
              </label>
              <input
                type="url"
                value={config.logoUrl || ''}
                onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="https://exemple.com/logo.png"
              />
              {config.logoUrl && (
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <img src={config.logoUrl} alt="Logo" className="max-h-20" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon (URL)
              </label>
              <input
                type="url"
                value={config.faviconUrl || ''}
                onChange={(e) => setConfig({ ...config, faviconUrl: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="https://exemple.com/favicon.ico"
              />
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-md font-semibold text-[#2c3e50] mb-4">Typographie</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Police principale
                  </label>
                  <select
                    value={config.fontFamily || 'Inter'}
                    onChange={(e) => setConfig({ ...config, fontFamily: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  >
                    <option value="Inter">Inter (par défaut)</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Police des titres
                  </label>
                  <select
                    value={config.headingFont || 'Playfair Display'}
                    onChange={(e) => setConfig({ ...config, headingFont: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  >
                    <option value="Playfair Display">Playfair Display (par défaut)</option>
                    <option value="Merriweather">Merriweather</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Lora">Lora</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Poppins">Poppins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taille de texte de base
                  </label>
                  <select
                    value={config.baseFontSize || '16px'}
                    onChange={(e) => setConfig({ ...config, baseFontSize: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  >
                    <option value="14px">Petite (14px)</option>
                    <option value="16px">Normale (16px) - par défaut</option>
                    <option value="18px">Grande (18px)</option>
                    <option value="20px">Très grande (20px)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taille des titres
                  </label>
                  <select
                    value={config.headingSize || '2.5rem'}
                    onChange={(e) => setConfig({ ...config, headingSize: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  >
                    <option value="2rem">Petite (2rem)</option>
                    <option value="2.5rem">Normale (2.5rem) - par défaut</option>
                    <option value="3rem">Grande (3rem)</option>
                    <option value="3.5rem">Très grande (3.5rem)</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  💡 <strong>Aperçu :</strong> Les changements de typographie s'appliqueront immédiatement après sauvegarde.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'template' && (
          <div className="flex gap-6">
            {/* Colonne Gauche - Sélection Template (60%) */}
            <div className="w-3/5 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#2c3e50] mb-2">
                  Choix du template de site web
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Sélectionnez le design qui correspond le mieux à votre style.
                </p>
                {organizationPlan !== 'PREMIUM' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-amber-800">
                      💎 <strong>Plan {organizationPlan}</strong> : Certains templates premium nécessitent un upgrade.
                    </p>
                  </div>
                )}
              </div>

              {/* Grille Templates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                {websiteTemplates.map((template) => {
                  const isAvailable = getTemplatesForPlan(organizationPlan).some(t => t.id === template.id);
                  const isPremium = template.minTier === 'PREMIUM';

                  return (
                    <div
                      key={template.id}
                      className={`relative border-2 rounded-xl p-4 transition-all ${
                        !isAvailable
                          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                          : config.websiteTemplate === template.id
                            ? 'border-[#d4b5a0] bg-[#d4b5a0]/5 shadow-lg cursor-pointer'
                            : 'border-gray-200 hover:border-[#d4b5a0]/50 hover:shadow-md cursor-pointer'
                      }`}
                      onClick={() => isAvailable && setConfig({ ...config, websiteTemplate: template.id })}
                    >
                      {/* Badge Premium */}
                      {isPremium && (
                        <div className="absolute -top-2 -left-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                          💎 PREMIUM
                        </div>
                      )}

                      {/* Checkmark sélection */}
                      {config.websiteTemplate === template.id && isAvailable && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#d4b5a0] rounded-full flex items-center justify-center text-white">
                          ✓
                        </div>
                      )}

                      {/* Preview Thumbnail */}
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                        <span className="text-xl font-bold text-gray-400">{template.name}</span>
                        {!isAvailable && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="bg-white rounded-lg px-3 py-2 text-sm font-semibold">
                              🔒 Upgrade requis
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Infos */}
                      <h4 className="font-bold text-base mb-1">{template.name}</h4>
                      <p className="text-xs text-gray-600 mb-2">{template.description}</p>

                      {/* Features */}
                      {template.features.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-2">
                          {template.features.slice(0, 2).map((feature, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Section Couleurs */}
              <div className="border-t pt-6 mt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Personnalisation des couleurs</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur primaire
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.primaryColor || '#d4b5a0'}
                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        className="w-16 h-16 rounded border-2 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.primaryColor || '#d4b5a0'}
                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur secondaire
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.secondaryColor || '#2c3e50'}
                        onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                        className="w-16 h-16 rounded border-2 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.secondaryColor || '#2c3e50'}
                        onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur accent
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.accentColor || '#20b2aa'}
                        onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                        className="w-16 h-16 rounded border-2 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.accentColor || '#20b2aa'}
                        onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne Droite - Preview Live (40%) */}
            <div className="w-2/5 sticky top-4 h-[calc(100vh-200px)]">
              <LiveTemplatePreview
                templateId={config.websiteTemplate || 'modern'}
                organizationName={config.siteName || 'Votre Institut'}
                description={config.siteDescription}
                siteTagline={config.siteTagline}
                primaryColor={config.primaryColor || '#d4b5a0'}
                secondaryColor={config.secondaryColor || '#2c3e50'}
                accentColor={config.accentColor || '#20b2aa'}
                logoUrl={config.logoUrl}
                heroImage={config.heroImage}
                heroTitle={config.heroTitle}
                heroSubtitle={config.heroSubtitle}
                phone={config.phone}
                email={config.email}
                contactEmail={config.email}
                address={config.address}
              />
            </div>
          </div>
        )}

        {activeTab === 'hours' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Horaires d'ouverture</h3>
            <p className="text-sm text-gray-500 mb-4">
              Format JSON : {`{"lundi": "9h-18h", "mardi": "9h-18h", ...}`}
            </p>
            <textarea
              value={config.businessHours || ''}
              onChange={(e) => setConfig({ ...config, businessHours: e.target.value })}
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono text-sm"
              placeholder={`{\n  "lundi": "9h-18h",\n  "mardi": "9h-18h",\n  "mercredi": "9h-18h",\n  "jeudi": "9h-18h",\n  "vendredi": "9h-18h",\n  "samedi": "10h-17h",\n  "dimanche": "Fermé"\n}`}
            />
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Contenu de la page d'accueil</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre principal (Hero)
              </label>
              <input
                type="text"
                value={config.heroTitle || ''}
                onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Bienvenue chez Laia Skin Institut"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sous-titre (Hero)
              </label>
              <input
                type="text"
                value={config.heroSubtitle || ''}
                onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Votre beauté naturelle sublimée"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Hero (URL)
              </label>
              <input
                type="url"
                value={config.heroImage || ''}
                onChange={(e) => setConfig({ ...config, heroImage: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="https://exemple.com/hero.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Image de fond pour la section hero de la page d'accueil (recommandé: 1920x1080px minimum)
              </p>
              {config.heroImage && (
                <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Aperçu :</p>
                  <img
                    src={config.heroImage}
                    alt="Hero background preview"
                    className="w-full max-h-60 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texte "À propos"
              </label>
              <textarea
                value={config.aboutText || ''}
                onChange={(e) => setConfig({ ...config, aboutText: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Présentez votre institut..."
              />
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#d4b5a0]" />
              Page À propos
            </h3>

            {/* Fondateur */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="text-md font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                Fondateur / Fondatrice
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={config.founderName || ''}
                    onChange={(e) => setConfig({ ...config, founderName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="Laïa Martin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre / Fonction
                  </label>
                  <input
                    type="text"
                    value={config.founderTitle || ''}
                    onChange={(e) => setConfig({ ...config, founderTitle: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="Fondatrice et Esthéticienne"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo du fondateur (URL)
                  </label>
                  <input
                    type="url"
                    value={config.founderImage || ''}
                    onChange={(e) => setConfig({ ...config, founderImage: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="https://exemple.com/photo-fondateur.jpg"
                  />
                  {config.founderImage && (
                    <div className="mt-2 p-4 bg-white rounded-lg">
                      <img src={config.founderImage} alt="Fondateur" className="max-h-40 rounded-lg" />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Citation / Message du fondateur
                  </label>
                  <textarea
                    value={config.founderQuote || ''}
                    onChange={(e) => setConfig({ ...config, founderQuote: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="Ma passion est de révéler la beauté naturelle de chaque femme..."
                  />
                </div>
              </div>
            </div>

            {/* Textes de la page À propos */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-md font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Contenus de la page
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Introduction
                  </label>
                  <textarea
                    value={config.aboutIntro || ''}
                    onChange={(e) => setConfig({ ...config, aboutIntro: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="Présentation générale de votre institut..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parcours / Histoire
                  </label>
                  <textarea
                    value={config.aboutParcours || ''}
                    onChange={(e) => setConfig({ ...config, aboutParcours: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="Racontez votre parcours, votre histoire..."
                  />
                </div>
              </div>
            </div>

            {/* Témoignages */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="text-md font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-green-600" />
                Témoignages
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Témoignages (Format JSON)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Format: <code className="bg-gray-100 px-1 rounded">{`[{"name":"Nom","initials":"ND","text":"Témoignage...","rating":5}]`}</code>
                </p>
                <p className="text-xs text-blue-600 mb-2">
                  💡 Les 3 premiers témoignages seront affichés sur la page d'accueil
                </p>
                <textarea
                  value={config.testimonials || ''}
                  onChange={(e) => setConfig({ ...config, testimonials: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono text-sm"
                  placeholder='[
  {
    "name": "Sophie D.",
    "initials": "SD",
    "text": "Après 3 séances, ma peau est transformée !",
    "rating": 5
  }
]'
                />
              </div>
            </div>

            {/* Formations */}
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="text-md font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-600" />
                Formations & Certifications
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format JSON (tableau d'objets)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Exemple: {`[{"title":"CAP Esthétique","year":"2018","school":"École de beauté"}]`}
                </p>
                <textarea
                  value={config.formations || ''}
                  onChange={(e) => setConfig({ ...config, formations: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono text-sm"
                  placeholder='[{"title": "CAP Esthétique", "year": "2018", "school": "École de beauté"}]'
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'location' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
              <Map className="w-5 h-5 text-[#d4b5a0]" />
              Géolocalisation
            </h3>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-md font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Coordonnées GPS
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={config.latitude || ''}
                    onChange={(e) => setConfig({ ...config, latitude: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="48.8566"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={config.longitude || ''}
                    onChange={(e) => setConfig({ ...config, longitude: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="2.3522"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="text-md font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                <Map className="w-4 h-4 text-green-600" />
                Google Maps
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Google Maps
                </label>
                <input
                  type="url"
                  value={config.googleMapsUrl || ''}
                  onChange={(e) => setConfig({ ...config, googleMapsUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                  placeholder="https://maps.google.com/?q=votre+adresse"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Pour obtenir l'URL : ouvrez Google Maps, recherchez votre adresse, puis cliquez sur "Partager" et copiez le lien.
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>ℹ️ Astuce :</strong> Les coordonnées GPS permettent d'afficher votre institut sur une carte interactive.
                Vous pouvez trouver vos coordonnées sur <a href="https://www.latlong.net/" target="_blank" className="underline">latlong.net</a>
              </p>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-[#d4b5a0]" />
              SEO & Tracking
            </h3>

            {/* Configuration technique */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-md font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-600" />
                Configuration technique
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de base du site
                </label>
                <input
                  type="url"
                  value={config.baseUrl || ''}
                  onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                  placeholder="https://www.laia-skin.fr"
                />
                <p className="text-xs text-gray-500 mt-2">
                  URL complète de votre site (utilisée pour générer les liens canoniques et sitemaps)
                </p>
              </div>
            </div>

            {/* SEO Global */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-md font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                Métadonnées par défaut
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre SEO par défaut
                  </label>
                  <input
                    type="text"
                    value={config.defaultMetaTitle || ''}
                    onChange={(e) => setConfig({ ...config, defaultMetaTitle: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="Laia Skin Institut - Institut de beauté à Paris"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommandé : 50-60 caractères
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description SEO par défaut
                  </label>
                  <textarea
                    value={config.defaultMetaDescription || ''}
                    onChange={(e) => setConfig({ ...config, defaultMetaDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="Découvrez notre institut de beauté spécialisé en soins du visage, épilation..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommandé : 150-160 caractères
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mots-clés SEO (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    value={config.defaultMetaKeywords || ''}
                    onChange={(e) => setConfig({ ...config, defaultMetaKeywords: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="institut beauté, soins visage, épilation, paris"
                  />
                </div>
              </div>
            </div>

            {/* Analytics & Tracking */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="text-md font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                <BarChart className="w-4 h-4 text-purple-600" />
                Analytics & Tracking
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    value={config.googleAnalyticsId || ''}
                    onChange={(e) => setConfig({ ...config, googleAnalyticsId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="G-XXXXXXXXXX ou UA-XXXXXXXXX-X"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook Pixel ID
                  </label>
                  <input
                    type="text"
                    value={config.facebookPixelId || ''}
                    onChange={(e) => setConfig({ ...config, facebookPixelId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="123456789012345"
                  />
                </div>
              </div>
            </div>

            {/* Codes de vérification */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="text-md font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                Codes de vérification
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Search Console (code de vérification)
                  </label>
                  <input
                    type="text"
                    value={config.googleVerificationCode || ''}
                    onChange={(e) => setConfig({ ...config, googleVerificationCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="abcdefghijklmnopqrstuvwxyz123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta (Facebook/Instagram) - Code de vérification
                  </label>
                  <input
                    type="text"
                    value={config.metaVerificationCode || ''}
                    onChange={(e) => setConfig({ ...config, metaVerificationCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="abcdefghijklmnopqrstuvwxyz123456"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>ℹ️ Informations importantes :</strong> Ces codes permettent de suivre les performances de votre site
                et de le référencer sur Google et les réseaux sociaux.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'finances' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#d4b5a0]" />
              Informations bancaires
            </h3>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-md font-semibold text-[#2c3e50] mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Coordonnées bancaires
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la banque
                  </label>
                  <input
                    type="text"
                    value={config.bankName || ''}
                    onChange={(e) => setConfig({ ...config, bankName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                    placeholder="BNP Paribas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={config.bankIban || ''}
                    onChange={(e) => setConfig({ ...config, bankIban: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BIC / SWIFT
                  </label>
                  <input
                    type="text"
                    value={config.bankBic || ''}
                    onChange={(e) => setConfig({ ...config, bankBic: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono"
                    placeholder="BNPAFRPPXXX"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                <strong>⚠️ Sécurité :</strong> Ces informations bancaires seront utilisées sur vos factures.
                Assurez-vous de les saisir correctement et de ne jamais les partager publiquement.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'google' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#2c3e50] mb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Google My Business - Synchronisation des avis
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Synchronisez automatiquement les avis Google de votre établissement pour les afficher sur votre site.
              </p>
            </div>

            {/* Google Place ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Place ID
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={config.googlePlaceId || ''}
                onChange={(e) => setConfig({ ...config, googlePlaceId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="ChIJxxxxxxxxxxxxxxxxxxxxx"
              />
              <p className="text-xs text-gray-500 mt-1">
                Trouvez votre Place ID sur{' '}
                <a
                  href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#d4b5a0] hover:underline"
                >
                  Google Place ID Finder
                </a>
              </p>
            </div>

            {/* URL Google Business (auto-générée) */}
            {config.googlePlaceId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Google Business (générée automatiquement)
                </label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  {`https://www.google.com/maps/place/?q=place_id:${config.googlePlaceId}`}
                </div>
              </div>
            )}

            {/* Synchronisation automatique */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                checked={config.autoSyncGoogleReviews || false}
                onChange={(e) => setConfig({ ...config, autoSyncGoogleReviews: e.target.checked })}
                className="mt-1"
                id="autoSync"
              />
              <div className="flex-1">
                <label htmlFor="autoSync" className="text-sm font-medium text-blue-900 cursor-pointer">
                  Activer la synchronisation automatique quotidienne
                </label>
                <p className="text-xs text-blue-700 mt-1">
                  Les avis Google seront automatiquement synchronisés chaque jour à minuit.
                </p>
              </div>
            </div>

            {/* Dernière synchronisation */}
            {config.lastGoogleSync && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  ✓ Dernière synchronisation : {new Date(config.lastGoogleSync).toLocaleString('fr-FR')}
                </p>
              </div>
            )}

            {/* Bouton synchroniser maintenant */}
            <div>
              <button
                onClick={async () => {
                  if (!config.googlePlaceId) {
                    alert('Veuillez d\'abord entrer votre Google Place ID');
                    return;
                  }

                  try {
                    setSaving(true);
                    const res = await fetch('/api/admin/google-reviews/sync', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ googlePlaceId: config.googlePlaceId })
                    });

                    if (res.ok) {
                      const data = await res.json();
                      alert(`✓ Synchronisation réussie ! ${data.reviewsCount} avis importés.`);
                      setConfig({ ...config, lastGoogleSync: new Date().toISOString() });
                    } else {
                      const error = await res.json();
                      alert(`Erreur : ${error.message || 'Synchronisation échouée'}`);
                    }
                  } catch (error) {
                    console.error('Erreur sync:', error);
                    alert('Erreur lors de la synchronisation');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={!config.googlePlaceId || saving}
                className="w-full px-6 py-3 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Star className="w-5 h-5" />
                {saving ? 'Synchronisation en cours...' : 'Synchroniser les avis maintenant'}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Cette action récupère les avis Google et les enregistre dans votre base de données.
              </p>
            </div>

            {/* Guide d'utilisation */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">📚 Comment trouver mon Google Place ID ?</h4>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Recherchez votre établissement sur Google Maps</li>
                <li>Copiez l'URL de votre fiche Google Business</li>
                <li>Le Place ID se trouve dans l'URL ou utilisez{' '}
                  <a
                    href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#d4b5a0] hover:underline"
                  >
                    Place ID Finder
                  </a>
                </li>
                <li>Collez le Place ID ci-dessus et cliquez sur "Synchroniser"</li>
              </ol>
            </div>

            {/* Note importante */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Note importante :</strong> La synchronisation utilise l'API Google Places qui peut avoir des limitations.
                Les avis seront affichés publiquement sur votre site vitrine dans la section "Avis clients".
              </p>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <IntegrationsTab />
        )}

        {activeTab === 'api' && (
          <div className="space-y-4">
            <ApiTokensManager />
          </div>
        )}

        {activeTab === 'legal' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-4">Mentions légales et CGV</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conditions Générales de Vente (CGV)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Vous pouvez écrire vos CGV personnalisées ici. Si vide, les CGV par défaut seront affichées.
              </p>
              <p className="text-xs text-blue-600 mb-2">
                💡 Utilisez des doubles sauts de ligne pour séparer les paragraphes
              </p>
              <textarea
                value={config.termsAndConditions || ''}
                onChange={(e) => setConfig({ ...config, termsAndConditions: e.target.value })}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent font-mono text-sm"
                placeholder="Article 1 - Objet

Les présentes conditions générales de vente...

Article 2 - Tarifs

Les prix sont indiqués en euros TTC..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Politique de confidentialité
              </label>
              <textarea
                value={config.privacyPolicy || ''}
                onChange={(e) => setConfig({ ...config, privacyPolicy: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Votre politique de confidentialité..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mentions légales
              </label>
              <textarea
                value={config.legalNotice || ''}
                onChange={(e) => setConfig({ ...config, legalNotice: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                placeholder="Vos mentions légales..."
              />
            </div>
          </div>
        )}

        {/* SMS Marketing */}
        {activeTab === 'sms' && <AdminSMSConfigTab />}

        {/* Emailing */}
        {activeTab === 'email' && <AdminEmailConfigTab />}

        {/* WhatsApp */}
        {activeTab === 'whatsapp' && <AdminWhatsAppConfigTab />}
      </div>
    </div>
  );
}

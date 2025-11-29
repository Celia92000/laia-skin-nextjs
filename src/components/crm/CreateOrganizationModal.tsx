'use client';

import { useState } from 'react';
import { X, Building, User, Mail, Phone, MapPin, CreditCard, Check } from 'lucide-react';
import { sendOnboardingInvitationEmail } from '@/lib/email-service';

interface Lead {
  id: string;
  institutName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  city: string | null;
  address: string | null;
  postalCode: string | null;
  numberOfLocations: number | null;
  estimatedValue: number | null;
  notes: string | null;
}

interface CreateOrganizationModalProps {
  lead: Lead;
  onClose: () => void;
  onSuccess: () => void;
}

const PLANS = [
  {
    id: 'SOLO',
    name: 'Solo',
    price: 49,
    description: 'Pour démarrer son activité',
    roi: '+500€/mois de CA supplémentaire',
    features: [
      'Site web professionnel multi-templates',
      'Réservations en ligne 24/7',
      'Dashboard avec stats temps réel',
      'Gestion clients + historique',
      'Programme fidélité VIP complet',
      'Cartes cadeaux digitales',
      'Avis clients + photos avant/après',
      'Sync Google Reviews',
      'Comptabilité complète + factures',
      'Paiement en ligne (Stripe)',
      'Espace client sécurisé',
      '1 utilisateur • 1 emplacement'
    ]
  },
  {
    id: 'DUO',
    name: 'Duo',
    price: 69,
    description: 'Pour développer son CA',
    roi: '+1200€/mois grâce au CRM',
    features: [
      '✨ Tout Solo +',
      'CRM Commercial complet',
      'Email Marketing (campagnes illimitées)',
      'Automations marketing intelligentes',
      'Pipeline de vente & tunnel',
      'Segmentation clients avancée',
      'Gestion devis & propositions',
      'Campagnes de fidélisation auto',
      "Jusqu'à 3 utilisateurs • 1 emplacement"
    ]
  },
  {
    id: 'TEAM',
    name: 'Team',
    price: 119,
    description: '⭐ Le plus rentable',
    roi: '+3500€/mois avec e-commerce',
    features: [
      '✨ Tout Duo +',
      'Blog professionnel (SEO optimisé)',
      'Boutique en ligne complète',
      'Paiement produits & abonnements',
      'WhatsApp Business',
      'SMS Marketing',
      'Réseaux sociaux (Instagram + Facebook)',
      'Publications automatiques',
      'Analytics e-commerce complet',
      "Jusqu'à 10 utilisateurs • 3 emplacements"
    ],
    popular: true
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: 179,
    description: 'Pour les instituts établis',
    roi: '+8000€/mois avec multi-sites',
    features: [
      '✨ Tout Team +',
      'Gestion stock avancée multi-sites',
      'Alertes stock automatiques',
      'Inventaire temps réel',
      'Gestion fournisseurs',
      'Prévisions stock intelligentes',
      'API complète pour intégrations',
      'Export comptable automatique',
      'Accompagnement personnalisé',
      'Support prioritaire 24/7',
      'Utilisateurs illimités • Emplacements illimités'
    ]
  }
];

export default function CreateOrganizationModal({ lead, onClose, onSuccess }: CreateOrganizationModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'plan' | 'payment' | 'confirm'>('info');

  const [formData, setFormData] = useState({
    // Données lead (pré-remplies)
    name: lead.institutName,
    legalName: lead.institutName,
    ownerEmail: lead.contactEmail,
    ownerPhone: lead.contactPhone || '',
    city: lead.city || '',
    address: lead.address || '',
    postalCode: lead.postalCode || '',

    // Nouveau
    slug: lead.institutName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    subdomain: lead.institutName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),

    // Plan
    plan: 'SOLO',

    // SEPA (optionnel)
    siret: '',
    sepaIban: '',
    sepaBic: '',
    sepaAccountHolder: lead.contactName,
    sepaMandate: false,

    // Couleurs
    primaryColor: '#d4b5a0',
    secondaryColor: '#2c3e50'
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/super-admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          leadId: lead.id // Pour lier au lead
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Marquer le lead comme converti
        await fetch(`/api/super-admin/leads/${lead.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'WON',
            organizationId: data.id,
            convertedAt: new Date().toISOString()
          })
        });

        // Envoyer email d'invitation à l'onboarding
        try {
          await fetch('/api/super-admin/send-onboarding-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.ownerEmail,
              institutName: formData.name,
              loginEmail: data.adminEmail,
              temporaryPassword: data.defaultPassword,
              loginUrl: `${window.location.origin}/connexion`,
              leadId: lead.id // Ajouter le leadId pour créer une interaction
            })
          });
        } catch (emailError) {
          console.error('Erreur envoi email:', emailError);
        }

        alert(`✅ Organisation créée avec succès!\n\n📧 Email: ${data.adminEmail}\n🔑 Mot de passe: ${data.defaultPassword}\n\n⚠️ Notez bien ces identifiants!\n\n📬 Un email d'invitation a été envoyé au client.`);

        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(`❌ Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur création organisation:', error);
      alert('❌ Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Créer une organisation</h2>
                <p className="text-purple-100 text-sm">Depuis le lead : {lead.institutName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6">
            {['Informations', 'Plan', 'Paiement', 'Confirmation'].map((label, idx) => (
              <div key={label} className="flex items-center flex-1">
                <div className={`flex-1 text-center py-2 rounded-lg transition ${
                  step === ['info', 'plan', 'payment', 'confirm'][idx]
                    ? 'bg-white text-purple-600 font-semibold'
                    : 'bg-purple-500/30 text-white'
                }`}>
                  <span className="text-sm">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Étape 1 : Informations */}
          {step === 'info' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Données pré-remplies depuis le lead</strong> - Vérifiez et complétez si nécessaire
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'institut *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison sociale
                  </label>
                  <input
                    type="text"
                    value={formData.legalName}
                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email propriétaire *
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.ownerEmail}
                      onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.ownerPhone}
                      onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">laiaskin.com/{formData.slug}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sous-domaine
                  </label>
                  <input
                    type="text"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.subdomain}.laiaskin.com</p>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2 : Choix du plan */}
          {step === 'plan' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Choisissez le forfait</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PLANS.map((plan) => (
                  <label
                    key={plan.id}
                    className={`relative cursor-pointer border-2 rounded-xl p-6 transition ${
                      formData.plan === plan.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={formData.plan === plan.id}
                      onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                      className="sr-only"
                    />
                    {plan.popular && (
                      <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
                        ⭐ POPULAIRE
                      </div>
                    )}
                    <div className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</div>
                    <div className="text-xs text-gray-600 mb-3">{plan.description}</div>
                    <div className="text-3xl font-bold text-purple-600 mb-3">
                      {plan.price}€<span className="text-sm text-gray-600">/mois</span>
                    </div>
                    {/* ROI Badge */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg">
                      <p className="text-center text-green-800 text-xs font-bold mb-1">💰 ROI MOYEN</p>
                      <p className="text-center text-green-700 text-xs font-semibold">{plan.roi}</p>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {plan.features
                        .filter(feature =>
                          !feature.includes('utilisateur') &&
                          !feature.includes('emplacement') &&
                          !feature.includes('Utilisateurs illimités') &&
                          !feature.includes('Emplacements illimités')
                        )
                        .map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Étape 3 : Paiement SEPA (obligatoire) */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800">
                  <strong>Obligatoire</strong> - Configurez le prélèvement SEPA pour l'abonnement mensuel
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SIRET *
                </label>
                <input
                  type="text"
                  value={formData.siret}
                  onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="123 456 789 00012"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IBAN *
                  </label>
                  <input
                    type="text"
                    value={formData.sepaIban}
                    onChange={(e) => setFormData({ ...formData, sepaIban: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                    placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    BIC *
                  </label>
                  <input
                    type="text"
                    value={formData.sepaBic}
                    onChange={(e) => setFormData({ ...formData, sepaBic: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono"
                    placeholder="BNPAFRPPXXX"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titulaire du compte *
                </label>
                <input
                  type="text"
                  value={formData.sepaAccountHolder}
                  onChange={(e) => setFormData({ ...formData, sepaAccountHolder: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {formData.sepaIban && formData.sepaBic && formData.sepaAccountHolder && formData.siret && (
                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer border-2 border-purple-200">
                  <input
                    type="checkbox"
                    checked={formData.sepaMandate}
                    onChange={(e) => setFormData({ ...formData, sepaMandate: e.target.checked })}
                    className="mt-1"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    <strong>J'autorise LAIA Connect</strong> à effectuer des prélèvements SEPA sur ce compte pour le paiement mensuel de l'abonnement *
                  </span>
                </label>
              )}
            </div>
          )}

          {/* Étape 4 : Confirmation */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Prêt à créer l'organisation</h3>
                <p className="text-gray-600">Vérifiez les informations ci-dessous avant de continuer</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Institut</p>
                    <p className="font-semibold text-gray-900">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">{formData.ownerEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ville</p>
                    <p className="font-semibold text-gray-900">{formData.city}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Plan</p>
                    <p className="font-semibold text-gray-900">
                      {PLANS.find(p => p.id === formData.plan)?.name} - {PLANS.find(p => p.id === formData.plan)?.price}€/mois
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Prélèvement SEPA</p>
                    <p className="font-semibold text-gray-900">
                      {formData.sepaMandate ? '✅ Configuré' : '❌ Non configuré'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">URL</p>
                    <p className="font-semibold text-gray-900 text-xs">{formData.subdomain}.laiaskin.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800">
                  <strong>Note:</strong> Des identifiants de connexion seront générés et affichés après la création. Notez-les bien !
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200 flex justify-between">
          <button
            onClick={() => {
              if (step === 'info') {
                onClose();
              } else if (step === 'plan') {
                setStep('info');
              } else if (step === 'payment') {
                setStep('plan');
              } else if (step === 'confirm') {
                setStep('payment');
              }
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            {step === 'info' ? 'Annuler' : 'Précédent'}
          </button>

          <button
            onClick={() => {
              if (step === 'info') {
                setStep('plan');
              } else if (step === 'plan') {
                setStep('payment');
              } else if (step === 'payment') {
                setStep('confirm');
              } else if (step === 'confirm') {
                handleSubmit();
              }
            }}
            disabled={loading || (step === 'info' && (!formData.name || !formData.ownerEmail || !formData.city))}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Création...' : step === 'confirm' ? 'Créer l\'organisation' : 'Suivant'}
          </button>
        </div>
      </div>
    </div>
  );
}

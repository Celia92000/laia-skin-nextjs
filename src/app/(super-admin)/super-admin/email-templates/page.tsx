'use client'

import { useState } from 'react'
import SuperAdminNav from '@/components/SuperAdminNav'
import { Mail, Eye, Edit, Send, Check } from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  description: string
  subject: string
  usage: string
  previewData: {
    organizationName: string
    ownerFirstName: string
    ownerLastName: string
    ownerEmail: string
    tempPassword: string
    plan: string
    subdomain: string
    adminUrl: string
    monthlyAmount: number
    trialEndsAt: Date
    sepaMandateRef: string
  }
}

const emailTemplates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Email de Bienvenue Complet',
    description: 'Email envoyé après création du compte avec identifiants et guide',
    subject: '🎉 Bienvenue sur LAIA Connect - Votre site {organizationName} est prêt !',
    usage: 'Envoyé automatiquement après onboarding (actuellement utilisé)',
    previewData: {
      organizationName: 'Beauté Zen Paris',
      ownerFirstName: 'Sophie',
      ownerLastName: 'Martin',
      ownerEmail: 'sophie@beautezen.fr',
      tempPassword: 'Test123Pass!@#',
      plan: 'TEAM',
      subdomain: 'beaute-zen-paris',
      adminUrl: 'https://beaute-zen-paris.laia-connect.fr/admin',
      monthlyAmount: 149,
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      sepaMandateRef: 'LAIA-BEAUTE-ZEN-PARIS-1234567890'
    }
  },
  {
    id: 'pending',
    name: 'Confirmation Paiement (En attente)',
    description: 'Email de confirmation de paiement sans identifiants',
    subject: '✅ Paiement confirmé - Activation sous 24h - {organizationName}',
    usage: 'Pour activation manuelle (non utilisé actuellement)',
    previewData: {
      organizationName: 'Beauté Zen Paris',
      ownerFirstName: 'Sophie',
      ownerLastName: 'Martin',
      ownerEmail: 'sophie@beautezen.fr',
      tempPassword: '',
      plan: 'TEAM',
      subdomain: 'beaute-zen-paris',
      adminUrl: 'https://beaute-zen-paris.laia-connect.fr/admin',
      monthlyAmount: 149,
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      sepaMandateRef: 'LAIA-BEAUTE-ZEN-PARIS-1234567890'
    }
  },
  {
    id: 'activation',
    name: 'Activation du Compte',
    description: 'Email d\'activation avec identifiants uniquement',
    subject: '🎉 Votre compte {organizationName} est activé !',
    usage: 'Pour activation différée (non utilisé actuellement)',
    previewData: {
      organizationName: 'Beauté Zen Paris',
      ownerFirstName: 'Sophie',
      ownerLastName: 'Martin',
      ownerEmail: 'sophie@beautezen.fr',
      tempPassword: 'Test123Pass!@#',
      plan: 'TEAM',
      subdomain: 'beaute-zen-paris',
      adminUrl: 'https://beaute-zen-paris.laia-connect.fr/admin',
      monthlyAmount: 149,
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      sepaMandateRef: 'LAIA-BEAUTE-ZEN-PARIS-1234567890'
    }
  }
]

export default function EmailTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  async function previewTemplate(template: EmailTemplate) {
    setSelectedTemplate(template)
    setShowPreview(true)
  }

  return (
    <>
      <SuperAdminNav />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Mail className="w-10 h-10 text-purple-600" />
              Templates d'Emails d'Onboarding
            </h1>
            <p className="text-gray-600 text-lg">
              Gérez et prévisualisez les emails envoyés aux nouveaux clients
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Templates disponibles</p>
                  <p className="text-3xl font-bold text-gray-900">3</p>
                </div>
                <Mail className="w-12 h-12 text-purple-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Actuellement utilisé</p>
                  <p className="text-2xl font-bold text-gray-900">Welcome Email</p>
                </div>
                <Check className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Status activation</p>
                  <p className="text-2xl font-bold text-gray-900">ACTIVE</p>
                </div>
                <Send className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {emailTemplates.map((template) => (
              <div
                key={template.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border-2 ${
                  template.id === 'welcome'
                    ? 'border-green-500 ring-2 ring-green-200'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                {/* Header */}
                <div className={`p-6 ${
                  template.id === 'welcome'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : 'bg-gradient-to-r from-purple-500 to-pink-600'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <Mail className="w-8 h-8 text-white" />
                    {template.id === 'welcome' && (
                      <span className="bg-white text-green-600 text-xs font-bold px-3 py-1 rounded-full">
                        EN COURS
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {template.name}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {template.description}
                  </p>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Objet :</strong>
                    </p>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {template.subject}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Usage :</strong>
                    </p>
                    <p className="text-sm text-gray-700">
                      {template.usage}
                    </p>
                  </div>

                  {/* Contenu affiché */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-xs font-semibold text-blue-900 mb-2">
                      Contenu inclus :
                    </p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      {template.id === 'welcome' && (
                        <>
                          <li>✅ Email et mot de passe de connexion</li>
                          <li>✅ Lien vers l'espace admin</li>
                          <li>✅ Détails de la formule</li>
                          <li>✅ Guide de démarrage</li>
                          <li>✅ Facture PDF en pièce jointe</li>
                        </>
                      )}
                      {template.id === 'pending' && (
                        <>
                          <li>⏳ Message d'attente d'activation</li>
                          <li>⏳ Récapitulatif paiement</li>
                          <li>⏳ Délai d'activation (24h)</li>
                          <li>❌ Pas d'identifiants</li>
                        </>
                      )}
                      {template.id === 'activation' && (
                        <>
                          <li>✅ Email et mot de passe de connexion</li>
                          <li>✅ Lien vers l'espace admin</li>
                          <li>✅ Instructions de démarrage</li>
                          <li>❌ Pas de guide complet</li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => previewTemplate(template)}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-700 transition font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Prévisualiser
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 mb-2">
                  Configuration actuelle
                </h3>
                <p className="text-blue-800 text-sm mb-2">
                  L'email <strong>"Bienvenue Complet"</strong> est actuellement utilisé lors de l'onboarding.
                  Le compte client est activé immédiatement avec le statut <code className="bg-blue-100 px-2 py-1 rounded">ACTIVE</code>.
                </p>
                <p className="text-blue-800 text-sm">
                  📄 Fichier : <code className="bg-blue-100 px-2 py-1 rounded">/src/app/api/onboarding/complete/route.ts</code> (ligne 371)
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modal Preview */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {selectedTemplate.name}
                  </h2>
                  <p className="text-white/90 text-sm">
                    Prévisualisation du template
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition"
                >
                  Fermer
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">

              {/* Email Subject */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Objet de l'email :</p>
                <p className="font-semibold text-gray-900">
                  {selectedTemplate.subject.replace('{organizationName}', selectedTemplate.previewData.organizationName)}
                </p>
              </div>

              {/* Preview Data */}
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-semibold text-yellow-900 mb-3">
                  📋 Données de test utilisées pour la prévisualisation :
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-yellow-700">Institut :</span>
                    <span className="ml-2 font-mono bg-yellow-100 px-2 py-1 rounded">
                      {selectedTemplate.previewData.organizationName}
                    </span>
                  </div>
                  <div>
                    <span className="text-yellow-700">Propriétaire :</span>
                    <span className="ml-2 font-mono bg-yellow-100 px-2 py-1 rounded">
                      {selectedTemplate.previewData.ownerFirstName} {selectedTemplate.previewData.ownerLastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-yellow-700">Email :</span>
                    <span className="ml-2 font-mono bg-yellow-100 px-2 py-1 rounded">
                      {selectedTemplate.previewData.ownerEmail}
                    </span>
                  </div>
                  {selectedTemplate.id !== 'pending' && (
                    <div>
                      <span className="text-yellow-700">Mot de passe :</span>
                      <span className="ml-2 font-mono bg-yellow-100 px-2 py-1 rounded">
                        {selectedTemplate.previewData.tempPassword}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-yellow-700">Plan :</span>
                    <span className="ml-2 font-mono bg-yellow-100 px-2 py-1 rounded">
                      {selectedTemplate.previewData.plan}
                    </span>
                  </div>
                  <div>
                    <span className="text-yellow-700">Montant :</span>
                    <span className="ml-2 font-mono bg-yellow-100 px-2 py-1 rounded">
                      {selectedTemplate.previewData.monthlyAmount}€/mois
                    </span>
                  </div>
                </div>
              </div>

              {/* Email Content Summary */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  📧 Contenu de l'email
                </h3>

                {selectedTemplate.id === 'welcome' && (
                  <div className="space-y-4 text-sm">
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <p className="font-semibold text-purple-900 mb-2">🎉 En-tête</p>
                      <p className="text-purple-800">
                        Bienvenue sur LAIA Connect ! Votre site est prêt, {selectedTemplate.previewData.ownerFirstName} !
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="font-semibold text-green-900 mb-2">🔐 Identifiants de connexion</p>
                      <ul className="text-green-800 space-y-1">
                        <li>• URL admin : {selectedTemplate.previewData.adminUrl}</li>
                        <li>• Email : {selectedTemplate.previewData.ownerEmail}</li>
                        <li>• Mot de passe : {selectedTemplate.previewData.tempPassword}</li>
                      </ul>
                      <p className="text-green-700 text-xs mt-2">
                        ⚠️ Changez ce mot de passe dès votre première connexion
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="font-semibold text-blue-900 mb-2">💎 Votre formule {selectedTemplate.previewData.plan}</p>
                      <p className="text-blue-800">
                        Liste complète des fonctionnalités incluses dans la formule
                      </p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="font-semibold text-yellow-900 mb-2">📋 Prochaines étapes</p>
                      <ul className="text-yellow-800 text-xs space-y-1">
                        <li>1. Connectez-vous et changez votre mot de passe</li>
                        <li>2. Personnalisez les couleurs et le logo</li>
                        <li>3. Ajoutez vos services et tarifs</li>
                        <li>4. Configurez vos horaires</li>
                        <li>5. Testez une réservation</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="font-semibold text-gray-900 mb-2">💳 Informations d'abonnement</p>
                      <ul className="text-gray-700 text-xs space-y-1">
                        <li>• Formule : {selectedTemplate.previewData.plan}</li>
                        <li>• Prix : {selectedTemplate.previewData.monthlyAmount}€ HT/mois</li>
                        <li>• Période d'essai : 30 jours gratuits</li>
                        <li>• Référence SEPA : {selectedTemplate.previewData.sepaMandateRef}</li>
                      </ul>
                    </div>
                  </div>
                )}

                {selectedTemplate.id === 'pending' && (
                  <div className="space-y-4 text-sm">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="font-semibold text-green-900 mb-2">✅ Paiement confirmé</p>
                      <p className="text-green-800">
                        Votre paiement a bien été enregistré
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="font-semibold text-blue-900 mb-2">⏳ Activation sous 24h</p>
                      <p className="text-blue-800 text-xs">
                        Notre équipe prépare votre espace personnalisé. Vous recevrez vos identifiants par email.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="font-semibold text-gray-900 mb-2">📋 Récapitulatif</p>
                      <ul className="text-gray-700 text-xs space-y-1">
                        <li>• Plan {selectedTemplate.previewData.plan}</li>
                        <li>• {selectedTemplate.previewData.monthlyAmount}€/mois</li>
                        <li>• 30 jours gratuits</li>
                      </ul>
                    </div>
                  </div>
                )}

                {selectedTemplate.id === 'activation' && (
                  <div className="space-y-4 text-sm">
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <p className="font-semibold text-purple-900 mb-2">🎉 Compte activé</p>
                      <p className="text-purple-800">
                        Votre espace {selectedTemplate.previewData.organizationName} est prêt !
                      </p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="font-semibold text-yellow-900 mb-2">🔐 Identifiants</p>
                      <ul className="text-yellow-800 text-xs space-y-1">
                        <li>• Email : {selectedTemplate.previewData.ownerEmail}</li>
                        <li>• Mot de passe : {selectedTemplate.previewData.tempPassword}</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="font-semibold text-green-900 mb-2">🎯 Pour bien démarrer</p>
                      <ul className="text-green-800 text-xs space-y-1">
                        <li>1. Connectez-vous</li>
                        <li>2. Changez votre mot de passe</li>
                        <li>3. Complétez votre profil</li>
                        <li>4. Ajoutez vos services</li>
                      </ul>
                    </div>
                  </div>
                )}

              </div>

              {/* Code Location */}
              <div className="mt-6 p-4 bg-gray-900 rounded-lg text-white font-mono text-xs">
                <p className="text-gray-400 mb-2">📄 Code source du template :</p>
                <p className="text-green-400">
                  /src/lib/onboarding-emails.ts
                </p>
                <p className="text-gray-400 mt-2">Fonction :</p>
                <p className="text-blue-400">
                  {selectedTemplate.id === 'welcome' && 'sendWelcomeEmail()'}
                  {selectedTemplate.id === 'pending' && 'sendPendingActivationEmail()'}
                  {selectedTemplate.id === 'activation' && 'sendAccountActivationEmail()'}
                </p>
              </div>

            </div>

          </div>
        </div>
      )}

    </>
  )
}

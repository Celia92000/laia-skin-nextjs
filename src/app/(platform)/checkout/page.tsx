'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, CreditCard, Lock, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getAllPlanHighlights } from '@/lib/features-simple';

// Force dynamic rendering for pages with search params
export const dynamic = 'force-dynamic';

// Utiliser la source centralisée pour les plans - toutes les features
const plansData = getAllPlanHighlights();
const PLANS = plansData.map(p => ({
  id: p.id,
  name: p.name,
  price: p.price,
  setupFee: 0,
  description: p.description,
  features: p.features, // Toutes les features pour cohérence
  popular: p.popular
}));

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'DUO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Données du questionnaire (depuis l'URL)
  const [leadData] = useState({
    institutName: searchParams.get('institutName') || '',
    contactName: searchParams.get('contactName') || '',
    contactEmail: searchParams.get('contactEmail') || '',
    contactPhone: searchParams.get('contactPhone') || '',
    city: searchParams.get('city') || '',
    address: searchParams.get('address') || '',
    postalCode: searchParams.get('postalCode') || '',
    numberOfLocations: parseInt(searchParams.get('numberOfLocations') || '1'),
    // Réponses du questionnaire
    questionnaireData: searchParams.get('questionnaireData') || '{}',
  });

  const plan = PLANS.find(p => p.id === selectedPlan) || PLANS[1];
  const totalPrice = plan.price + plan.setupFee;

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Créer le lead avec statut PAID en attente
      const leadResponse = await fetch('/api/public/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadData,
          selectedPlan,
          status: 'NEW',
          source: 'WEBSITE',
          estimatedValue: totalPrice,
          notes: `Questionnaire: ${leadData.questionnaireData}`
        })
      });

      if (!leadResponse.ok) {
        throw new Error('Erreur lors de la création du lead');
      }

      const leadDataResult = await leadResponse.json();

      // Créer la session Stripe Checkout
      const stripeResponse = await fetch('/api/public/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          amount: totalPrice,
          leadId: leadDataResult.id,
          customerEmail: leadData.contactEmail,
          metadata: {
            institutName: leadData.institutName,
            contactName: leadData.contactName,
            plan: selectedPlan
          }
        })
      });

      if (!stripeResponse.ok) {
        throw new Error('Erreur lors de la création de la session de paiement');
      }

      const { url } = await stripeResponse.json();

      // Rediriger vers Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('URL de paiement manquante');
      }

    } catch (err: any) {
      console.error('Erreur paiement:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/platform" className="inline-block mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-6 rounded-2xl shadow-xl inline-block">
              <h1 className="text-4xl font-bold text-white">LAIA Connect</h1>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Finalisez votre commande
          </h2>
          <p className="text-gray-600">
            Essai gratuit de 30 jours • Sans engagement • Annulation à tout moment
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulaire de paiement */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Informations de paiement
              </h3>

              {/* Résumé lead */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                <h4 className="font-semibold text-blue-900 mb-3">📋 Vos informations</h4>
                <div className="grid grid-cols-2 gap-3 text-sm text-blue-800">
                  <div>
                    <p className="text-blue-600">Institut</p>
                    <p className="font-semibold">{leadData.institutName || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <p className="text-blue-600">Contact</p>
                    <p className="font-semibold">{leadData.contactName || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <p className="text-blue-600">Email</p>
                    <p className="font-semibold">{leadData.contactEmail || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <p className="text-blue-600">Ville</p>
                    <p className="font-semibold">{leadData.city || 'Non renseignée'}</p>
                  </div>
                </div>
              </div>

              {/* Choix du plan */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Sélectionnez votre forfait</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PLANS.map((p) => (
                    <label
                      key={p.id}
                      className={`relative cursor-pointer border-2 rounded-xl p-6 transition ${
                        selectedPlan === p.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={p.id}
                        checked={selectedPlan === p.id}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="sr-only"
                      />
                      {p.popular && (
                        <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
                          ⭐ POPULAIRE
                        </div>
                      )}
                      <div className="text-xl font-bold text-gray-900 mb-1">{p.name}</div>
                      <div className="text-3xl font-bold text-purple-600 mb-3">
                        {p.price}€<span className="text-sm text-gray-600">/mois</span>
                      </div>
                      <ul className="space-y-1 text-xs text-gray-600">
                        {p.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-center">
                            <Check className="w-3 h-3 text-green-500 mr-1" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </label>
                  ))}
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {/* Bouton de paiement */}
              <button
                onClick={handlePayment}
                disabled={loading || !leadData.contactEmail}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Préparation du paiement...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Payer {totalPrice}€ et commencer l'essai
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Lock className="w-4 h-4" />
                  <span>Paiement sécurisé</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  <span>Stripe</span>
                </div>
              </div>
            </div>
          </div>

          {/* Résumé de commande */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Résumé de commande
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan {plan.name}</span>
                  <span className="font-semibold">{plan.price}€/mois</span>
                </div>

                {plan.setupFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frais d'installation</span>
                    <span className="font-semibold">{plan.setupFee}€</span>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t-2 border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Total aujourd'hui</span>
                  <span className="text-2xl font-bold text-purple-600">{totalPrice}€</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>✨ 30 jours d'essai gratuit</strong><br />
                  Vous ne serez débité qu'après la période d'essai
                </p>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <h4 className="font-semibold text-gray-900">Inclus dans votre plan :</h4>
                {plan.features
                  .filter(feature =>
                    !feature.includes('utilisateur') &&
                    !feature.includes('emplacement') &&
                    !feature.includes('Utilisateurs illimités') &&
                    !feature.includes('Emplacements illimités')
                  )
                  .map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Sparkles className="w-4 h-4" />
                  <span>Annulation possible à tout moment</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Retour */}
        <div className="text-center mt-8">
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au questionnaire
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}

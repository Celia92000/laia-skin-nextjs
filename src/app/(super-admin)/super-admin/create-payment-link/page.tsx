'use client';

import { useState } from 'react';
import { CreditCard, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function CreatePaymentLinkPage() {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/super-admin/create-payment-link', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerEmail: email,
          amount: parseFloat(amount),
          description
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, url: data.url });
        setEmail('');
        setAmount('');
        setDescription('');
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch (error) {
      setResult({ success: false, error: 'Erreur réseau' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.url) {
      navigator.clipboard.writeText(result.url);
      alert('Lien copié dans le presse-papier !');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Créer un Lien de Paiement</h1>
          </div>

          <p className="text-gray-600 mb-8">
            Créez un lien de paiement unique pour les services ponctuels (migrations de données, formations, etc.)
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email du client
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="client@exemple.fr"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="199.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Le montant sera facturé avec TVA (20%)
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description du service
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                placeholder="Migration des données depuis [logiciel] vers LAIA Connect - 500 clients"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Bouton Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Créer le lien de paiement
                </>
              )}
            </button>
          </form>

          {/* Résultat */}
          {result && (
            <div className={`mt-8 p-6 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {result.success ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-900">Lien créé avec succès !</h3>
                  </div>
                  <div className="bg-white p-4 rounded border border-green-200 mb-4">
                    <p className="text-sm text-gray-600 mb-2">Lien de paiement :</p>
                    <p className="text-sm font-mono text-purple-600 break-all">{result.url}</p>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                  >
                    📋 Copier le lien
                  </button>
                  <p className="text-sm text-gray-600 mt-4">
                    Envoyez ce lien au client par email. Il sera redirigé vers Stripe pour effectuer le paiement par carte bancaire (3D Secure automatique).
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-6 h-6 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-900">Erreur</h3>
                  </div>
                  <p className="text-red-700">{result.error}</p>
                </>
              )}
            </div>
          )}

          {/* Exemples */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">💡 Exemples d'utilisation</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• <strong>Migration de données</strong> : 199€ - Migration 500 clients depuis Planity</li>
              <li>• <strong>Formation personnalisée</strong> : 299€ - Formation 2h en visio pour équipe</li>
              <li>• <strong>Personnalisation avancée</strong> : 499€ - Développement module sur mesure</li>
              <li>• <strong>Audit SEO</strong> : 149€ - Audit + optimisation du site web</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

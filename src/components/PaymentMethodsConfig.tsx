'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Banknote, FileCheck, Building2, Save, CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentMethods {
  stripe: boolean;
  cash: boolean;
  check: boolean;
  transfer: boolean;
  paypal: boolean;
}

export default function PaymentMethodsConfig() {
  const [methods, setMethods] = useState<PaymentMethods>({
    stripe: true,
    cash: true,
    check: true,
    transfer: false,
    paypal: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const data = await res.json();
        if (data.paymentMethods) {
          const parsed = typeof data.paymentMethods === 'string'
            ? JSON.parse(data.paymentMethods)
            : data.paymentMethods;
          setMethods(parsed);
        }
      }
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (method: keyof PaymentMethods) => {
    setMethods(prev => ({
      ...prev,
      [method]: !prev[method]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethods: JSON.stringify(methods)
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const paymentOptions = [
    {
      key: 'stripe' as keyof PaymentMethods,
      label: 'Stripe (Carte bancaire)',
      description: 'Paiement en ligne sécurisé par carte bancaire',
      icon: CreditCard,
      color: 'blue',
      recommended: true
    },
    {
      key: 'cash' as keyof PaymentMethods,
      label: 'Espèces',
      description: 'Paiement en espèces sur place',
      icon: Banknote,
      color: 'green'
    },
    {
      key: 'check' as keyof PaymentMethods,
      label: 'Chèque',
      description: 'Paiement par chèque bancaire',
      icon: FileCheck,
      color: 'purple'
    },
    {
      key: 'transfer' as keyof PaymentMethods,
      label: 'Virement bancaire',
      description: 'Paiement par virement',
      icon: Building2,
      color: 'orange'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Modes de paiement acceptés
        </h2>
        <p className="text-gray-600">
          Choisissez les moyens de paiement que vous souhaitez proposer à vos clients
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">Configuration sauvegardée avec succès !</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4 mb-8">
        {paymentOptions.map((option) => {
          const Icon = option.icon;
          const isEnabled = methods[option.key];

          return (
            <div
              key={option.key}
              className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                isEnabled
                  ? `border-${option.color}-500 bg-${option.color}-50`
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
              onClick={() => handleToggle(option.key)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-lg ${isEnabled ? `bg-${option.color}-100` : 'bg-gray-200'}`}>
                    <Icon className={`w-6 h-6 ${isEnabled ? `text-${option.color}-600` : 'text-gray-500'}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
                        {option.label}
                      </h3>
                      {option.recommended && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          Recommandé
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${isEnabled ? 'text-gray-600' : 'text-gray-400'}`}>
                      {option.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <button
                    type="button"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isEnabled ? `bg-${option.color}-600` : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-yellow-900 mb-2">💡 Conseil</h4>
        <p className="text-sm text-yellow-800">
          Pour activer le paiement Stripe, assurez-vous d'avoir configuré vos clés API dans l'onglet <strong>Intégrations</strong>.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
      >
        {saving ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Sauvegarde...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Sauvegarder les modes de paiement
          </>
        )}
      </button>
    </div>
  );
}

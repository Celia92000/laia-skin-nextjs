'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Smartphone, Link2, Send } from 'lucide-react';

export default function WhatsAppStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [testMessage, setTestMessage] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setStatus('checking');
    setErrorMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/whatsapp/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok && data.connected) {
        setStatus('connected');
        setAccountInfo(data.accountInfo);
      } else {
        setStatus('disconnected');
        setErrorMessage(data.error || 'Non connecté');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Erreur de vérification');
    }
  };

  const sendTestMessage = async () => {
    if (!testPhone || !testMessage) return;
    
    setSendingTest(true);
    setTestResult('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to: testPhone.replace(/\D/g, ''),
          message: testMessage
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTestResult('✅ Message envoyé avec succès !');
        setTestMessage('');
      } else {
        setTestResult(`❌ Erreur: ${data.error || 'Échec de l\'envoi'}`);
      }
    } catch (error) {
      setTestResult('❌ Erreur de connexion');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Smartphone className="w-8 h-8" />
            État de connexion WhatsApp Business
          </h2>
        </div>

        {/* Status principal */}
        <div className="p-8">
          <div className="flex items-center justify-center mb-8">
            {status === 'checking' && (
              <div className="text-center">
                <RefreshCw className="w-16 h-16 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Vérification de la connexion...</p>
              </div>
            )}
            
            {status === 'connected' && (
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-2xl font-bold text-green-600 mb-2">Connecté</p>
                <p className="text-gray-600">WhatsApp Business API est actif</p>
              </div>
            )}
            
            {status === 'disconnected' && (
              <div className="text-center">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-2xl font-bold text-red-600 mb-2">Non connecté</p>
                <p className="text-gray-600">{errorMessage}</p>
              </div>
            )}
            
            {status === 'error' && (
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                <p className="text-2xl font-bold text-orange-600 mb-2">Erreur</p>
                <p className="text-gray-600">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Informations de connexion */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                Configuration actuelle
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Numéro WhatsApp:</span>
                  <span className="font-medium">{process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || 'Non configuré'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ID du compte:</span>
                  <span className="font-medium text-xs">{accountInfo?.id || '...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version API:</span>
                  <span className="font-medium">v18.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Token:</span>
                  <span className="font-medium">{accountInfo?.hasToken ? '✅ Configuré' : '❌ Manquant'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-700 mb-4">Comment connecter votre téléphone</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li>1. Ouvrez WhatsApp Business sur votre téléphone</li>
                <li>2. Allez dans Paramètres → Outils Business → API</li>
                <li>3. Vérifiez que le numéro correspond</li>
                <li>4. Le token doit être actif dans Meta Business</li>
              </ol>
            </div>
          </div>

          {/* Zone de test */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-700 mb-4">Tester l'envoi de message</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="tel"
                placeholder="Numéro de test (ex: 0612345678)"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Message de test"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={sendTestMessage}
              disabled={sendingTest || !testPhone || !testMessage}
              className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {sendingTest ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer un test
                </>
              )}
            </button>
            
            {testResult && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm">{testResult}</p>
              </div>
            )}
          </div>

          {/* Bouton de rafraîchissement */}
          <div className="mt-6 text-center">
            <button
              onClick={checkConnection}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Vérifier à nouveau
            </button>
          </div>
        </div>

        {/* Footer avec infos */}
        <div className="bg-green-50 px-8 py-4 border-t border-green-100">
          <p className="text-sm text-green-800">
            <strong>Note :</strong> Pour que l'intégration fonctionne, votre WhatsApp Business doit être connecté via l'API Meta Business. 
            Les messages apparaîtront directement dans votre application WhatsApp Business.
          </p>
        </div>
      </div>
    </div>
  );
}
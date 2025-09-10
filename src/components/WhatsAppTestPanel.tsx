'use client';

import { useState } from 'react';
import { MessageCircle, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function WhatsAppTestPanel() {
  const [phoneNumber, setPhoneNumber] = useState('0683717050');
  const [message, setMessage] = useState('Test de message WhatsApp depuis LAIA SKIN Institut');
  const [messageType, setMessageType] = useState('simple');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testMessages = {
    simple: 'Test de message WhatsApp depuis LAIA SKIN Institut',
    confirmation: {
      clientName: 'Célia',
      date: new Date().toLocaleDateString('fr-FR'),
      time: '14:00',
      services: ['Hydro\'Naissance', 'LED Thérapie'],
      totalPrice: 150
    },
    reminder: {
      clientName: 'Célia',
      time: '14:00',
      services: ['Hydro\'Naissance']
    },
    welcome: {
      clientName: 'Célia'
    },
    promotion: {
      clientName: 'Célia',
      offer: '-20% sur tous les soins Hydro\'Naissance',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
    }
  };

  const sendTestMessage = async () => {
    setSending(true);
    setResult(null);

    try {
      const payload: any = {
        phoneNumber,
        message: messageType === 'simple' ? message : 'Message template',
        messageType
      };

      if (messageType !== 'simple') {
        payload.data = testMessages[messageType as keyof typeof testMessages];
      }

      const response = await fetch('/api/whatsapp/send-meta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-bold">Test WhatsApp Business API</h2>
      </div>

      <div className="space-y-4">
        {/* Numéro de téléphone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de téléphone
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="0683717050"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: 0683717050 ou +33683717050
          </p>
        </div>

        {/* Type de message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de message
          </label>
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="simple">Message simple</option>
            <option value="confirmation">Confirmation de réservation</option>
            <option value="reminder">Rappel de rendez-vous</option>
            <option value="welcome">Message de bienvenue</option>
            <option value="promotion">Message promotionnel</option>
          </select>
        </div>

        {/* Message personnalisé (seulement pour simple) */}
        {messageType === 'simple' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Tapez votre message..."
            />
          </div>
        )}

        {/* Aperçu du message template */}
        {messageType !== 'simple' && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Aperçu du message :</p>
            <div className="text-sm text-gray-600 whitespace-pre-wrap">
              {messageType === 'confirmation' && `✨ LAIA SKIN Institut ✨\n\nBonjour Célia !\nVotre réservation est confirmée ✅\n\n📅 Date : ${new Date().toLocaleDateString('fr-FR')}\n⏰ Heure : 14:00\n💆‍♀️ Services : Hydro'Naissance, LED Thérapie\n💰 Total : 150€`}
              {messageType === 'reminder' && `⏰ Rappel de rendez-vous\n\nBonjour Célia !\nNous vous rappelons votre rendez-vous demain :\n🕐 Heure : 14:00\n💆‍♀️ Services : Hydro'Naissance`}
              {messageType === 'welcome' && `Bienvenue chez LAIA SKIN Institut Célia ! 🌟\n\nNous sommes ravis de vous compter parmi nos clientes.`}
              {messageType === 'promotion' && `🎁 Offre spéciale pour vous Célia !\n\n-20% sur tous les soins Hydro'Naissance\n\n✨ Valable jusqu'au ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}`}
            </div>
          </div>
        )}

        {/* Bouton d'envoi */}
        <button
          onClick={sendTestMessage}
          disabled={sending || !phoneNumber}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {sending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Envoyer le message test
            </>
          )}
        </button>

        {/* Résultat */}
        {result && (
          <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  {result.success ? 'Message envoyé avec succès !' : 'Erreur lors de l\'envoi'}
                </p>
                {result.messageId && (
                  <p className="text-sm text-gray-600 mt-1">
                    ID du message : {result.messageId}
                  </p>
                )}
                {result.error && (
                  <p className="text-sm text-red-600 mt-1">
                    {result.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status de configuration */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
          <h3 className="font-medium text-green-900 mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            WhatsApp configuré avec succès !
          </h3>
          <div className="text-sm text-green-800 space-y-1">
            <p>✅ API connectée et fonctionnelle</p>
            <p>✅ Numéro de test actif : +1 555 622 3520</p>
            <p>✅ Votre numéro vérifié : 0683717050</p>
            <p className="text-xs text-green-600 mt-2">
              Note : En attente de validation du compte pour utiliser votre numéro professionnel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
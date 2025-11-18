'use client';

import { useState } from 'react';

export default function TestResendPage() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sendTestEmail = async () => {
    setSending(true);
    setResult(null);

    try {
      const response = await fetch('/api/send-email/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'celia.ivorra95@hotmail.fr',
          subject: 'Test Resend - Email personnalisé',
          message: 'Bonjour Célia,\n\nCeci est un test d\'email personnalisé envoyé avec Resend.\n\nVous pouvez maintenant envoyer des emails totalement personnalisés sans template fixe !\n\nC\'est 100% gratuit jusqu\'à 100 emails par jour.',
          clientName: 'Célia'
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          🚀 Test Resend - Emails Personnalisés
        </h1>
        
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h2 className="font-semibold text-green-900 mb-2">✅ Resend est configuré !</h2>
            <p className="text-sm text-green-800">
              Votre clé API est active. Vous pouvez envoyer jusqu\'à 100 emails gratuits par jour.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Configuration :</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Service : Resend</li>
              <li>✅ Clé API : re_V6Lwq...2aY (configurée)</li>
              <li>📧 Destinataire test : celia.ivorra95@hotmail.fr</li>
              <li>📝 Type : Message totalement personnalisé</li>
            </ul>
          </div>

          <button
            onClick={sendTestEmail}
            disabled={sending}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
              sending 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
            }`}
          >
            {sending ? 'Envoi en cours...' : '📧 Envoyer Email de Test avec Resend'}
          </button>

          {result && (
            <div className={`p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : result.error || !result.success
                ? 'bg-red-50 border border-red-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              {result.success ? (
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">
                    ✅ Email envoyé avec succès !
                  </h3>
                  <p className="text-sm text-green-800">
                    Vérifiez votre boîte mail : celia.ivorra95@hotmail.fr
                  </p>
                  {result.data && (
                    <p className="text-xs text-green-700 mt-2">
                      ID: {result.data.id}
                    </p>
                  )}
                </div>
              ) : result.instructions ? (
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    ⚠️ {result.message}
                  </h3>
                  <ol className="text-sm text-yellow-800 list-decimal list-inside space-y-1">
                    {result.instructions.map((instruction: string, i: number) => (
                      <li key={i}>{instruction}</li>
                    ))}
                  </ol>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">
                    ❌ Erreur
                  </h3>
                  <pre className="text-xs text-red-800 whitespace-pre-wrap">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">💡 Avantages de Resend :</h3>
            <ul className="text-sm space-y-1">
              <li>✅ 100 emails gratuits par jour (3000/mois !)</li>
              <li>✅ Messages totalement personnalisés</li>
              <li>✅ Pas de template fixe comme EmailJS</li>
              <li>✅ Design HTML professionnel</li>
              <li>✅ Statistiques d\'ouverture et de clic</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Send, Bell, Users, Calendar, Tag } from 'lucide-react';

export default function AdminNotificationsTab() {
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    url: '',
    target: 'all' // all, clients, staff
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; sent?: number; error?: string } | null>(null);

  async function sendNotification() {
    if (!notification.title || !notification.message) {
      alert('Veuillez remplir le titre et le message');
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const token = document.cookie.split('token=')[1]?.split(';')[0];
      const response = await fetch('/api/admin/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(notification)
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, sent: data.sent });
        // Réinitialiser le formulaire
        setNotification({
          title: '',
          message: '',
          url: '',
          target: 'all'
        });
      } else {
        setResult({ error: data.error || 'Erreur lors de l\'envoi' });
      }
    } catch (error) {
      setResult({ error: 'Erreur réseau' });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#2c3e50] flex items-center gap-2">
            <Bell className="w-7 h-7 text-[#d4b5a0]" />
            Notifications Push
          </h2>
          <p className="text-gray-600 mt-1">
            Envoyez des notifications instantanées à vos clients
          </p>
        </div>
      </div>

      {/* Formulaire d'envoi */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-[#2c3e50] mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-[#d4b5a0]" />
          Envoyer une notification
        </h3>

        <div className="space-y-4">
          {/* Destinataires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Destinataires
            </label>
            <select
              value={notification.target}
              onChange={(e) => setNotification({ ...notification, target: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
            >
              <option value="all">Tous les abonnés</option>
              <option value="clients">Clients uniquement</option>
              <option value="staff">Équipe uniquement</option>
            </select>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Titre
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={notification.title}
              onChange={(e) => setNotification({ ...notification, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              placeholder="Nouvelle promotion : -20% sur tous les soins"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              {notification.title.length}/50 caractères
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              value={notification.message}
              onChange={(e) => setNotification({ ...notification, message: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              rows={4}
              placeholder="Profitez de notre offre exceptionnelle valable jusqu'à la fin du mois. Réservez dès maintenant !"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {notification.message.length}/200 caractères
            </p>
          </div>

          {/* URL (optionnel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Lien (optionnel)
            </label>
            <input
              type="url"
              value={notification.url}
              onChange={(e) => setNotification({ ...notification, url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              placeholder="/reserver ou https://votre-site.fr/promo"
            />
            <p className="text-xs text-gray-500 mt-1">
              Les utilisateurs seront redirigés vers cette URL en cliquant sur la notification
            </p>
          </div>

          {/* Aperçu */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2">APERÇU</p>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#d4b5a0]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#d4b5a0] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#2c3e50]">
                    {notification.title || 'Titre de la notification'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message || 'Message de la notification...'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Résultat */}
          {result && (
            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? (
                  <>✅ Notification envoyée avec succès à {result.sent} abonné(s) !</>
                ) : (
                  <>❌ {result.error}</>
                )}
              </p>
            </div>
          )}

          {/* Bouton d'envoi */}
          <button
            onClick={sendNotification}
            disabled={sending || !notification.title || !notification.message}
            className="w-full px-6 py-3 bg-[#d4b5a0] text-white rounded-lg font-medium hover:bg-[#c9a589] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {sending ? 'Envoi en cours...' : 'Envoyer la notification'}
          </button>
        </div>
      </div>

      {/* Informations */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>ℹ️ À savoir :</strong>
        </p>
        <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
          <li>• Les notifications sont envoyées uniquement aux utilisateurs qui ont accepté les notifications push</li>
          <li>• Les notifications apparaissent même si le navigateur est fermé (sur mobile et desktop)</li>
          <li>• Les utilisateurs peuvent se désabonner à tout moment depuis les paramètres de leur navigateur</li>
        </ul>
      </div>
    </div>
  );
}

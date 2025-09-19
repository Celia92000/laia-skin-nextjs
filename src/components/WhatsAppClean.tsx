'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, User, Phone, Plus, ArrowLeft } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export default function WhatsAppClean() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [message, setMessage] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastSentMessage, setLastSentMessage] = useState('');
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/crm/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data.filter((c: any) => c.phone));
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    }
  };

  const formatPhone = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '33' + cleaned.substring(1);
    } else if (!cleaned.startsWith('33')) {
      cleaned = '33' + cleaned;
    }
    return cleaned;
  };

  const sendWhatsApp = async () => {
    if (!message.trim()) return;
    
    const recipient = selectedClient || (newPhone ? {
      id: 'new',
      name: newName || 'Nouveau client',
      phone: newPhone
    } : null);

    if (!recipient) {
      setErrorMessage('Sélectionnez un client ou entrez un numéro');
      setSendStatus('error');
      return;
    }

    setSending(true);
    setSendStatus('idle');
    setErrorMessage('');
    setLastSentMessage(message);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to: formatPhone(recipient.phone),
          message: message
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSendStatus('success');
        setMessage('');
        setTimeout(() => setSendStatus('idle'), 3000);
      } else {
        setSendStatus('error');
        setErrorMessage(data.error || 'Erreur d\'envoi');
      }
    } catch (error) {
      setSendStatus('error');
      setErrorMessage('Erreur de connexion');
    } finally {
      setSending(false);
    }
  };

  const selectClient = (client: Client) => {
    setSelectedClient(client);
    setShowNewForm(false);
    setNewPhone('');
    setNewName('');
    setSendStatus('idle');
    setErrorMessage('');
  };

  const startNewConversation = () => {
    setShowNewForm(true);
    setSelectedClient(null);
    setSendStatus('idle');
    setErrorMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header principal */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">WhatsApp Business</h2>
              <p className="text-green-100">Envoyez des messages à vos clients</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 divide-x divide-gray-200">
          {/* Colonne gauche - Sélection client */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">
                1. Choisissez un destinataire
              </h3>
              
              {/* Bouton nouveau numéro */}
              <button
                onClick={startNewConversation}
                className={`w-full p-3 rounded-lg border-2 transition-all mb-4 ${
                  showNewForm 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                  <Plus className="w-5 h-5" />
                  Nouveau numéro
                </div>
              </button>

              {/* Formulaire nouveau numéro */}
              {showNewForm && (
                <div className="bg-green-50 p-4 rounded-lg mb-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Nom (optionnel)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    placeholder="06 XX XX XX XX"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Liste des clients */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {clients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => selectClient(client)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      selectedClient?.id === client.id
                        ? 'border-[#d4b5a0] bg-[#d4b5a0]/10'
                        : 'border-gray-200 hover:border-[#d4b5a0]/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#d4b5a0]/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-[#d4b5a0]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#2c3e50]">{client.name}</p>
                        <p className="text-sm text-gray-500">{client.phone}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne droite - Message */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-3">
              2. Écrivez votre message
            </h3>

            {/* Destinataire sélectionné */}
            {(selectedClient || newPhone) && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Envoi à :</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">
                    {selectedClient ? selectedClient.name : (newName || 'Nouveau contact')}
                  </span>
                  <span className="text-sm text-gray-500">
                    {selectedClient ? selectedClient.phone : newPhone}
                  </span>
                </div>
              </div>
            )}

            {/* Zone de texte */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tapez votre message ici..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              disabled={!selectedClient && !newPhone}
            />

            {/* Templates de messages */}
            <div className="mt-3 mb-4">
              <p className="text-sm text-gray-600 mb-2">Messages rapides :</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setMessage('Bonjour, j\'espère que vous allez bien ! 😊')}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
                  disabled={!selectedClient && !newPhone}
                >
                  Salutation
                </button>
                <button
                  onClick={() => setMessage('Votre prochain rendez-vous est confirmé. À bientôt !')}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
                  disabled={!selectedClient && !newPhone}
                >
                  Confirmation
                </button>
                <button
                  onClick={() => setMessage('N\'hésitez pas si vous avez des questions. Belle journée !')}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
                  disabled={!selectedClient && !newPhone}
                >
                  Clôture
                </button>
              </div>
            </div>

            {/* Statut d'envoi */}
            {sendStatus === 'success' && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                ✅ Message envoyé avec succès !
              </div>
            )}
            
            {sendStatus === 'error' && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                ❌ {errorMessage}
              </div>
            )}

            {/* Bouton d'envoi */}
            <button
              onClick={sendWhatsApp}
              disabled={sending || !message.trim() || (!selectedClient && !newPhone)}
              className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Envoyer le message
                </>
              )}
            </button>

            {(!selectedClient && !newPhone) && (
              <p className="text-center text-gray-500 text-sm mt-3">
                Sélectionnez un client ou entrez un nouveau numéro
              </p>
            )}
          </div>
        </div>

        {/* Footer avec le dernier message envoyé */}
        {lastSentMessage && sendStatus === 'success' && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Dernier message envoyé :</span>
              <span className="ml-2 text-gray-800">{lastSentMessage}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
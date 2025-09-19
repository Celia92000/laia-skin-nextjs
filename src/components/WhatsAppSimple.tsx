'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Phone, User, Calendar, Check, CheckCheck, X, AlertCircle, ArrowLeft } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'client' | 'admin';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  error?: string;
}

export default function WhatsAppSimple() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConversation, setShowConversation] = useState(false); // Pour mobile
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger les clients
  useEffect(() => {
    loadClients();
  }, []);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/crm/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const clientsWithPhone = data.filter((c: any) => c.phone && c.phone !== '');
        setClients(clientsWithPhone);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    // Nettoyer le numéro
    let cleaned = phone.replace(/\D/g, '');
    
    // Ajouter le préfixe français si nécessaire
    if (cleaned.startsWith('0')) {
      cleaned = '33' + cleaned.substring(1);
    } else if (!cleaned.startsWith('33')) {
      cleaned = '33' + cleaned;
    }
    
    return cleaned;
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const recipient = selectedClient || (customPhone ? {
      id: 'custom',
      name: customName || 'Client',
      email: '',
      phone: customPhone
    } : null);

    if (!recipient) {
      alert('Veuillez sélectionner un client ou entrer un numéro de téléphone');
      return;
    }

    // Ajouter le message à la liste avec statut "sending"
    const tempMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'admin',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, tempMessage]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formattedPhone = formatPhoneNumber(recipient.phone);
      
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: newMessage,
          clientName: recipient.name
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Mettre à jour le statut du message
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'sent' }
            : msg
        ));
        setNewMessage('');
      } else {
        // Afficher l'erreur
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'error', error: data.error || 'Erreur d\'envoi' }
            : msg
        ));
        console.error('Erreur WhatsApp:', data);
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, status: 'error', error: 'Erreur de connexion' }
          : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-500" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-500" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="flex h-[600px]">
        {/* Liste des contacts */}
        <div className={`${showConversation ? 'hidden md:block' : 'block'} md:w-1/3 w-full border-r border-gray-200 bg-gray-50`}>
          <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Clients WhatsApp
            </h3>
          </div>
          
          <div className="p-3 border-b border-gray-200">
            <button
              onClick={() => {
                setShowCustomForm(!showCustomForm);
                setSelectedClient(null);
              }}
              className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              + Nouveau numéro
            </button>
          </div>

          {showCustomForm && (
            <div className="p-3 bg-green-50 border-b border-green-200">
              <input
                type="text"
                placeholder="Nom (optionnel)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm"
              />
              <input
                type="tel"
                placeholder="06 XX XX XX XX"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          )}

          <div className="overflow-y-auto" style={{ height: 'calc(100% - 180px)' }}>
            {clients.map(client => (
              <div
                key={client.id}
                onClick={() => {
                  setSelectedClient(client);
                  setShowCustomForm(false);
                  setCustomPhone('');
                  setCustomName('');
                  setShowConversation(true); // Afficher la conversation sur mobile
                }}
                className={`p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedClient?.id === client.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{client.name}</p>
                    <p className="text-xs text-gray-500">{client.phone}</p>
                  </div>
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className={`${showConversation || !selectedClient ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#d4b5a0] to-[#c9a084] text-white">
            {selectedClient ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Bouton retour pour mobile */}
                  <button
                    onClick={() => {
                      setShowConversation(false);
                      setSelectedClient(null);
                    }}
                    className="md:hidden p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedClient.name}</h3>
                    <p className="text-xs opacity-90">{selectedClient.phone}</p>
                  </div>
                </div>
              </div>
            ) : customPhone ? (
              <div className="flex items-center gap-3">
                {/* Bouton retour pour mobile */}
                <button
                  onClick={() => {
                    setShowConversation(false);
                    setCustomPhone('');
                    setCustomName('');
                  }}
                  className="md:hidden p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{customName || 'Nouveau contact'}</h3>
                  <p className="text-xs opacity-90">{customPhone}</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="font-semibold">Sélectionnez un contact</h3>
                <p className="text-xs opacity-90">ou entrez un nouveau numéro</p>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucun message</p>
                <p className="text-sm">Commencez une conversation</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender === 'admin'
                          ? message.status === 'error' 
                            ? 'bg-red-100 text-red-900'
                            : 'bg-green-500 text-white'
                          : 'bg-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-75">
                          {message.timestamp.toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {message.sender === 'admin' && (
                          <span className="ml-2">
                            {getStatusIcon(message.status)}
                          </span>
                        )}
                      </div>
                      {message.error && (
                        <p className="text-xs mt-1 text-red-700">{message.error}</p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Zone de saisie */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Tapez votre message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading || (!selectedClient && !customPhone)}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !newMessage.trim() || (!selectedClient && !customPhone)}
                className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            {(!selectedClient && !customPhone) && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Sélectionnez un client ou entrez un numéro pour commencer
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
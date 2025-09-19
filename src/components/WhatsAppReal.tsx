'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MoreVertical, Send, Paperclip, Smile, Mic,
  Check, CheckCheck, ArrowLeft
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unread?: number;
  avatar?: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'me' | 'client';
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

export default function WhatsAppReal() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/crm/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const clientsWithPhone = data.filter((c: any) => c.phone).map((c: any) => ({
          ...c,
          lastMessage: 'Cliquez pour démarrer une conversation',
          lastMessageTime: '12:00',
          unread: 0
        }));
        setClients(clientsWithPhone);
      }
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    }
  };

  const formatPhone = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '33' + cleaned.substring(1);
    }
    return cleaned;
  };

  const sendWhatsApp = async () => {
    if (!newMessage.trim() || !selectedClient) return;

    const tempMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setSending(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to: formatPhone(selectedClient.phone),
          message: tempMessage.content
        })
      });

      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id ? { ...msg, status: 'delivered' } : msg
        ));
      }
    } catch (error) {
      console.error('Erreur envoi:', error);
    } finally {
      setSending(false);
    }
  };

  const selectClient = (client: Client) => {
    setSelectedClient(client);
    setShowMobileChat(true);
    
    // Messages d'exemple
    setMessages([
      {
        id: '1',
        content: 'Bonjour, j\'aimerais prendre rendez-vous',
        sender: 'client',
        time: '10:30'
      },
      {
        id: '2',
        content: 'Bonjour ! Bien sûr, quel soin souhaitez-vous ?',
        sender: 'me',
        time: '10:32',
        status: 'read'
      }
    ]);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  return (
    <div className="h-[700px] bg-white rounded-lg overflow-hidden shadow-2xl flex">
      {/* Liste des conversations */}
      <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[400px] border-r border-gray-200`}>
        {/* Header WhatsApp */}
        <div className="bg-[#075e54] text-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">WhatsApp</h2>
            <div className="flex gap-5">
              {/* Icône Status (cercle avec points) */}
              <button className="hover:opacity-80" title="Status">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeDasharray="4 2"/>
                </svg>
              </button>
              {/* Icône Nouveau chat */}
              <button className="hover:opacity-80" title="Nouveau chat">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </button>
              {/* Menu trois points */}
              <button className="hover:opacity-80" title="Menu">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2"/>
                  <circle cx="12" cy="12" r="2"/>
                  <circle cx="12" cy="19" r="2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white p-2 border-b border-gray-100">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <Search className="w-5 h-5 text-gray-500 mr-3" />
            <input
              type="text"
              placeholder="Rechercher ou démarrer une nouvelle discussion"
              className="flex-1 bg-transparent outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Liste des chats */}
        <div className="flex-1 overflow-y-auto bg-white">
          {filteredClients.map(client => (
            <div
              key={client.id}
              onClick={() => selectClient(client)}
              className={`flex items-center px-3 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 ${
                selectedClient?.id === client.id ? 'bg-gray-100' : ''
              }`}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                <span className="text-xl text-gray-600">
                  {client.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* Info conversation */}
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium text-gray-900">{client.name}</h3>
                  <span className="text-xs text-gray-500">{client.lastMessageTime}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{client.lastMessage}</p>
              </div>

              {/* Badge non-lu */}
              {client.unread && client.unread > 0 && (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center ml-2">
                  <span className="text-xs text-white">{client.unread}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Zone de conversation */}
      <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
        {selectedClient ? (
          <>
            {/* Header de la conversation */}
            <div className="bg-[#ededed] px-4 py-3 flex items-center border-b border-gray-200">
              <button
                onClick={() => setShowMobileChat(false)}
                className="md:hidden mr-3"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                <span className="text-lg text-gray-600">
                  {selectedClient.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{selectedClient.name}</h3>
                <p className="text-xs text-gray-500">en ligne</p>
              </div>
              
              <div className="flex gap-5">
                {/* Icône recherche */}
                <button className="text-gray-600 hover:text-gray-800" title="Rechercher">
                  <Search className="w-5 h-5" />
                </button>
                {/* Menu trois points */}
                <button className="text-gray-600 hover:text-gray-800" title="Menu">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="2"/>
                    <circle cx="12" cy="12" r="2"/>
                    <circle cx="12" cy="19" r="2"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Zone des messages avec fond WhatsApp */}
            <div 
              className="flex-1 overflow-y-auto p-4"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='pattern' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Crect fill='%23e5ddd5' width='100' height='100'/%3E%3Cpath fill='%23d4cfc7' d='M0 0l50 50l50-50M0 100l50-50l50 50'/%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23pattern)' width='100' height='100'/%3E%3C/svg%3E")`,
                backgroundColor: '#e5ddd5'
              }}
            >
              <div className="space-y-2">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-3 py-2 rounded-lg shadow-sm ${
                        message.sender === 'me'
                          ? 'bg-[#dcf8c6] rounded-br-none'
                          : 'bg-white rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm text-gray-900">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs text-gray-500">{message.time}</span>
                        {message.sender === 'me' && (
                          message.status === 'read' ? (
                            <CheckCheck className="w-4 h-4 text-blue-500" />
                          ) : message.status === 'delivered' ? (
                            <CheckCheck className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Check className="w-4 h-4 text-gray-500" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Zone de saisie */}
            <div className="bg-[#f0f0f0] px-4 py-3 flex items-center gap-3">
              <button className="text-gray-600 hover:text-gray-800">
                <Smile className="w-6 h-6" />
              </button>
              <button className="text-gray-600 hover:text-gray-800">
                <Paperclip className="w-6 h-6" />
              </button>
              
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendWhatsApp()}
                placeholder="Tapez un message"
                className="flex-1 bg-white rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
                disabled={sending}
              />
              
              {newMessage ? (
                <button
                  onClick={sendWhatsApp}
                  disabled={sending}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Send className="w-6 h-6" />
                </button>
              ) : (
                <button className="text-gray-600 hover:text-gray-800">
                  <Mic className="w-6 h-6" />
                </button>
              )}
            </div>
          </>
        ) : (
          /* Écran de bienvenue */
          <div className="flex-1 flex items-center justify-center bg-[#f8f9fa]">
            <div className="text-center">
              <div className="w-80 h-60 mx-auto mb-6 opacity-50">
                <img 
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 303 172'%3E%3Cpath fill='%23c0c3c7' d='M151.5 0C67.8 0 0 38.5 0 86s67.8 86 151.5 86S303 133.5 303 86 235.2 0 151.5 0zm0 158.4c-75.7 0-137.1-32.4-137.1-72.4S75.8 13.6 151.5 13.6 288.6 46 288.6 86s-61.4 72.4-137.1 72.4z'/%3E%3C/svg%3E"
                  alt="WhatsApp"
                  className="w-full h-full"
                />
              </div>
              <h2 className="text-3xl font-light text-gray-600 mb-2">WhatsApp Business</h2>
              <p className="text-gray-500">
                Sélectionnez un client pour démarrer une conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
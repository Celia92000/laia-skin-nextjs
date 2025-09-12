'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, Search, Filter, Users, 
  PlusCircle, Image, Paperclip, Smile, Check,
  CheckCheck, Clock, Star, Archive, Trash2,
  Bell, BellOff, Phone, Video, MoreVertical,
  ChevronLeft, X, Gift, Sparkles, Calendar
} from 'lucide-react';

interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: 'client' | 'admin';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document';
}

interface Conversation {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isTyping?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  status: 'active' | 'archived';
}

interface Template {
  id: string;
  name: string;
  content: string;
  category: 'promotion' | 'reminder' | 'info' | 'greeting';
  variables?: string[];
}

export default function WhatsAppChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'broadcast' | 'templates'>('chats');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger les conversations
  useEffect(() => {
    loadConversations();
    loadTemplates();
  }, []);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    // Simuler des conversations
    setConversations([
      {
        id: '1',
        clientId: 'c1',
        clientName: 'Marie Dupont',
        clientPhone: '+33612345678',
        lastMessage: 'Merci pour le soin d\'aujourd\'hui ! 😊',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
        unreadCount: 2,
        isPinned: true,
        status: 'active'
      },
      {
        id: '2',
        clientId: 'c2',
        clientName: 'Sophie Martin',
        clientPhone: '+33687654321',
        lastMessage: 'Est-ce que vous avez des disponibilités cette semaine ?',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
        unreadCount: 0,
        status: 'active'
      },
      {
        id: '3',
        clientId: 'c3',
        clientName: 'Julie Bernard',
        clientPhone: '+33698765432',
        lastMessage: 'J\'aimerais prendre RDV pour un BB Glow',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60),
        unreadCount: 1,
        status: 'active'
      }
    ]);
  };

  const loadTemplates = () => {
    setTemplates([
      {
        id: '1',
        name: 'Promo du mois',
        category: 'promotion',
        content: '🌟 OFFRE EXCLUSIVE {clientName} ! 🌟\n\n-20% sur tous les soins ce mois-ci !\n✨ BB Glow\n✨ Hydro\'Naissance\n✨ LED Thérapie\n\nRéservez vite : laiaskin.com',
        variables: ['clientName']
      },
      {
        id: '2',
        name: 'Rappel RDV',
        category: 'reminder',
        content: '📅 Bonjour {clientName},\n\nRappel de votre RDV demain à {time} pour votre soin {service}.\n\nÀ demain ! 💕\nLAIA SKIN Institut',
        variables: ['clientName', 'time', 'service']
      },
      {
        id: '3',
        name: 'Nouveau soin',
        category: 'info',
        content: '✨ NOUVEAUTÉ chez LAIA SKIN !\n\nDécouvrez notre nouveau soin {serviceName} 🌸\n\n{description}\n\nTarif de lancement : {price}€\n\nInfos & RDV : 06 12 34 56 78',
        variables: ['serviceName', 'description', 'price']
      },
      {
        id: '4',
        name: 'Anniversaire',
        category: 'greeting',
        content: '🎂 Joyeux anniversaire {clientName} ! 🎉\n\nPour célébrer, profitez de -30% sur le soin de votre choix ce mois-ci !\n\nÀ bientôt,\nLaïa 💕',
        variables: ['clientName']
      }
    ]);
  };

  const loadMessages = (conversationId: string) => {
    // Simuler des messages
    setMessages([
      {
        id: '1',
        conversationId,
        content: 'Bonjour Laïa ! J\'espère que vous allez bien',
        sender: 'client',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        status: 'read'
      },
      {
        id: '2',
        conversationId,
        content: 'Bonjour ! Oui très bien merci 😊 Comment puis-je vous aider ?',
        sender: 'admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 55),
        status: 'read'
      },
      {
        id: '3',
        conversationId,
        content: 'J\'aimerais prendre rendez-vous pour un soin BB Glow',
        sender: 'client',
        timestamp: new Date(Date.now() - 1000 * 60 * 50),
        status: 'read'
      },
      {
        id: '4',
        conversationId,
        content: 'Avec plaisir ! J\'ai des disponibilités jeudi à 14h ou samedi à 10h. Qu\'est-ce qui vous arrange ?',
        sender: 'admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        status: 'delivered'
      }
    ]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      conversationId: selectedConversation.id,
      content: newMessage,
      sender: 'admin',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simuler l'envoi WhatsApp
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, status: 'delivered' } : m
      ));
    }, 1000);

    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, status: 'read' } : m
      ));
    }, 2000);
  };

  const sendBroadcast = async (template: Template, clientIds: string[]) => {
    console.log('Envoi de broadcast:', template, 'à', clientIds);
    // Implémenter l'envoi groupé
  };

  const MessageStatus = ({ status }: { status: string }) => {
    if (status === 'read') return <CheckCheck className="w-4 h-4 text-blue-500" />;
    if (status === 'delivered') return <CheckCheck className="w-4 h-4 text-gray-400" />;
    return <Check className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg h-[800px] flex">
      {/* Sidebar */}
      <div className="w-96 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#2c3e50] flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-green-500" />
              WhatsApp Business
            </h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Users className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Archive className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'chats' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Conversations
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'broadcast' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Diffusion
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'templates' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Templates
            </button>
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Content based on active tab */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'chats' && (
            <div>
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    loadMessages(conv.id);
                  }}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center text-white font-semibold">
                        {conv.clientName.split(' ').map(n => n[0]).join('')}
                      </div>
                      {conv.isPinned && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Star className="w-2.5 h-2.5 text-white fill-current" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[#2c3e50] truncate">
                          {conv.clientName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(conv.lastMessageTime).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'broadcast' && (
            <div className="p-4">
              <div className="mb-4">
                <h3 className="font-semibold text-[#2c3e50] mb-2">Sélectionner les clients</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Tous les clients actifs</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Clients du mois</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Anniversaires du mois</span>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-[#2c3e50] mb-2">Template à utiliser</h3>
                <select className="w-full p-2 border rounded-lg">
                  <option>Choisir un template...</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <button className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                <Send className="w-5 h-5" />
                Envoyer la campagne
              </button>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="p-4">
              <button className="w-full mb-4 bg-[#d4b5a0] text-white py-2 rounded-lg font-semibold hover:bg-[#c9a084] transition-colors flex items-center justify-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Créer un template
              </button>

              <div className="space-y-3">
                {templates.map(template => (
                  <div key={template.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-[#2c3e50]">{template.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          template.category === 'promotion' ? 'bg-red-100 text-red-600' :
                          template.category === 'reminder' ? 'bg-blue-100 text-blue-600' :
                          template.category === 'info' ? 'bg-purple-100 text-purple-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {template.category}
                        </span>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">
                      {template.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedConversation(null)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center text-white font-semibold">
                {selectedConversation.clientName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-semibold text-[#2c3e50]">
                  {selectedConversation.clientName}
                </h3>
                <p className="text-xs text-gray-500">{selectedConversation.clientPhone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Video className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f2f5]">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${
                  message.sender === 'admin' 
                    ? 'bg-[#dcf8c6] rounded-l-lg rounded-br-lg' 
                    : 'bg-white rounded-r-lg rounded-bl-lg'
                } p-3 shadow-sm`}>
                  <p className="text-sm text-[#2c3e50]">{message.content}</p>
                  <div className={`flex items-center gap-1 mt-1 ${
                    message.sender === 'admin' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {message.sender === 'admin' && <MessageStatus status={message.status} />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Smile className="w-6 h-6 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Paperclip className="w-6 h-6 text-gray-600" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Tapez un message..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={sendMessage}
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
          <div className="text-center">
            <MessageCircle className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">
              WhatsApp Business pour LAIA SKIN
            </h3>
            <p className="text-gray-400">
              Sélectionnez une conversation pour commencer
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, Search, Filter, Users, 
  PlusCircle, Image, Paperclip, Smile, Check,
  CheckCheck, Clock, Star, Archive, Trash2,
  Bell, BellOff, Phone, Video, MoreVertical,
  ChevronLeft, X, Gift, Sparkles, Calendar,
  Megaphone, Heart, TrendingUp, UserPlus,
  Zap, Target, BarChart3, MessageSquare,
  Settings, Download, Upload, Copy, Tag
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
  tags?: string[];
}

export default function WhatsAppInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'chat' | 'broadcast' | 'analytics'>('chat');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const emojis = [
    '😀', '😁', '😂', '😃', '😄', '😅', '😆', '😇',
    '😈', '😉', '😊', '😋', '😌', '😍', '😎', '😏',
    '👍', '👎', '👏', '🙏', '❤️', '💔', '💕', '💖',
    '🎉', '🎊', '🎁', '🎂', '✨', '🌟', '⭐', '🎆'
  ];

  // Charger les conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    setConversations([
      {
        id: '1',
        clientId: 'c1',
        clientName: 'Marie Dupont',
        clientPhone: '+33612345678',
        lastMessage: 'Merci beaucoup pour le soin ! C\'était parfait 😊',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
        unreadCount: 2,
        isPinned: true,
        status: 'active',
        tags: ['VIP', 'Fidèle']
      },
      {
        id: '2',
        clientId: 'c2',
        clientName: 'Sophie Martin',
        clientPhone: '+33687654321',
        lastMessage: 'Bonjour, je voudrais prendre RDV pour un BB Glow',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
        unreadCount: 1,
        status: 'active',
        tags: ['Nouveau']
      },
      {
        id: '3',
        clientId: 'c3',
        clientName: 'Julie Bernard',
        clientPhone: '+33698765432',
        lastMessage: 'Photo envoyée',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
        unreadCount: 0,
        status: 'active',
        isTyping: true
      },
      {
        id: '4',
        clientId: 'c4',
        clientName: 'Emma Rousseau',
        clientPhone: '+33611223344',
        lastMessage: 'À quelle heure demain ?',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
        unreadCount: 0,
        status: 'active',
        tags: ['Régulière']
      }
    ]);
  };

  const loadMessages = (conversationId: string) => {
    setMessages([
      {
        id: '1',
        conversationId,
        content: 'Bonjour Laïa ! 👋',
        sender: 'client',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        status: 'read'
      },
      {
        id: '2',
        conversationId,
        content: 'Bonjour ! Ravie de vous lire 😊 Comment allez-vous ?',
        sender: 'admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 115),
        status: 'read'
      },
      {
        id: '3',
        conversationId,
        content: 'Très bien merci ! Je voudrais réserver un soin Hydro\'Naissance',
        sender: 'client',
        timestamp: new Date(Date.now() - 1000 * 60 * 110),
        status: 'read'
      },
      {
        id: '4',
        conversationId,
        content: 'Parfait ! J\'ai des créneaux disponibles :\n📅 Jeudi 14h\n📅 Vendredi 10h\n📅 Samedi 15h\n\nQu\'est-ce qui vous arrangerait ?',
        sender: 'admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 100),
        status: 'read'
      },
      {
        id: '5',
        conversationId,
        content: 'Vendredi 10h ce serait parfait !',
        sender: 'client',
        timestamp: new Date(Date.now() - 1000 * 60 * 90),
        status: 'read'
      },
      {
        id: '6',
        conversationId,
        content: '✅ C\'est noté ! RDV vendredi à 10h pour votre soin Hydro\'Naissance.\n\n📍 LAIA SKIN Institut\n💰 Prix : 90€\n⏱️ Durée : 60 min\n\nJe vous envoie une confirmation par SMS.\n\nÀ vendredi ! 💕',
        sender: 'admin',
        timestamp: new Date(Date.now() - 1000 * 60 * 85),
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

    // Simuler le changement de statut
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

  const MessageStatus = ({ status }: { status: string }) => {
    if (status === 'read') return <CheckCheck className="w-4 h-4 text-blue-500" />;
    if (status === 'delivered') return <CheckCheck className="w-4 h-4 text-gray-400" />;
    return <Check className="w-4 h-4 text-gray-400" />;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hier';
    } else if (days < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  const quickReplies = [
    { icon: '👋', text: 'Bonjour ! Comment puis-je vous aider ?' },
    { icon: '📅', text: 'Quand souhaitez-vous prendre RDV ?' },
    { icon: '✅', text: 'C\'est confirmé !' },
    { icon: '💕', text: 'Avec plaisir ! À bientôt' },
    { icon: '📍', text: 'Voici l\'adresse : LAIA SKIN Institut, 123 rue de la Beauté' },
    { icon: '💰', text: 'Voici nos tarifs :' }
  ];

  const campaignStats = {
    sent: 1247,
    delivered: 1198,
    read: 987,
    replied: 234,
    conversion: 67
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl overflow-hidden h-[850px]">
      {/* Header principal */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">WhatsApp Business</h2>
              <p className="text-green-100 text-sm">LAIA SKIN Institut</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('chat')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeView === 'chat' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <MessageSquare className="w-5 h-5 inline mr-2" />
              Chat
            </button>
            <button
              onClick={() => setActiveView('broadcast')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeView === 'broadcast' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <Megaphone className="w-5 h-5 inline mr-2" />
              Campagnes
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeView === 'analytics' ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-5 h-5 inline mr-2" />
              Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100%-88px)]">
        {activeView === 'chat' ? (
          <>
            {/* Sidebar conversations */}
            <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
              {/* Recherche et filtres */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher ou démarrer un nouveau chat"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded-full">
                    <Filter className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                
                {/* Tags rapides */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    VIP (3)
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    Nouveau (5)
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Fidèle (12)
                  </span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    Non lu (3)
                  </span>
                </div>
              </div>

              {/* Liste des conversations */}
              <div className="flex-1 overflow-y-auto">
                {conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversation(conv);
                      loadMessages(conv.id);
                    }}
                    className={`flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 ${
                      selectedConversation?.id === conv.id ? 'bg-green-50' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center text-white font-bold">
                        {conv.clientName.split(' ').map(n => n[0]).join('')}
                      </div>
                      {conv.isPinned && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Star className="w-3 h-3 text-white fill-current" />
                        </div>
                      )}
                      {conv.unreadCount > 0 && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conv.clientName}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTime(conv.lastMessageTime)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-1">
                        {conv.isTyping ? (
                          <p className="text-sm text-green-600 italic">en train d\'écrire...</p>
                        ) : (
                          <p className="text-sm text-gray-600 truncate">
                            {conv.lastMessage}
                          </p>
                        )}
                      </div>

                      {/* Tags */}
                      {conv.tags && conv.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {conv.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {conv.isMuted && (
                      <BellOff className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {/* Bouton nouveau chat */}
              <div className="p-4 border-t border-gray-200">
                <button className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Nouveau chat
                </button>
              </div>
            </div>

            {/* Zone de chat */}
            {selectedConversation ? (
              <div className="flex-1 flex flex-col bg-[url('/whatsapp-bg.png')] bg-cover">
                {/* Header du chat */}
                <div className="bg-white border-b border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button className="lg:hidden p-2 hover:bg-gray-100 rounded-full">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="w-10 h-10 bg-gradient-to-br from-[#d4b5a0] to-[#c9a084] rounded-full flex items-center justify-center text-white font-bold">
                        {selectedConversation.clientName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.clientName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {selectedConversation.isTyping ? (
                            <span className="text-green-500">en ligne</span>
                          ) : (
                            `vu à ${formatTime(selectedConversation.lastMessageTime)}`
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <Phone className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <Video className="w-5 h-5 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => {
                          setShowSearchBar(!showSearchBar);
                          setSearchQuery('');
                        }}
                        className={`p-2 hover:bg-gray-100 rounded-full ${
                          showSearchBar ? 'bg-gray-100' : ''
                        }`}
                      >
                        <Search className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Barre de recherche */}
                {showSearchBar && (
                  <div className="px-4 py-2 bg-gray-50 border-b flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          // Compter les résultats
                          const results = messages.filter(m => 
                            m.content.toLowerCase().includes(e.target.value.toLowerCase())
                          ).length;
                          setSearchResults(results);
                        }}
                        placeholder="Rechercher dans la conversation..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        autoFocus
                      />
                      {searchQuery && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                          {searchResults} résultat{searchResults > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowSearchBar(false);
                        setSearchQuery('');
                      }}
                      className="p-2 hover:bg-gray-200 rounded-lg"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* Date separator */}
                  <div className="flex items-center justify-center my-4">
                    <span className="px-3 py-1 bg-white/80 backdrop-blur rounded-lg text-xs text-gray-600">
                      Aujourd\'hui
                    </span>
                  </div>

                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[65%] ${
                        message.sender === 'admin' 
                          ? 'bg-green-100 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-sm' 
                          : 'bg-white rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-sm'
                      } px-4 py-2.5 shadow-sm`}>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {searchQuery && message.content.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                            <>
                              {message.content.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, i) => (
                                <span key={i} className={
                                  part.toLowerCase() === searchQuery.toLowerCase() 
                                    ? 'bg-yellow-200 font-medium' 
                                    : ''
                                }>
                                  {part}
                                </span>
                              ))}
                            </>
                          ) : (
                            message.content
                          )}
                        </p>
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

                {/* Réponses rapides */}
                <div className="px-4 py-2 bg-white/90 backdrop-blur border-t border-gray-100">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {quickReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => setNewMessage(reply.text)}
                        className="flex-shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors flex items-center gap-1"
                      >
                        <span>{reply.icon}</span>
                        <span className="whitespace-nowrap">{reply.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input message */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2.5 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Smile className="w-6 h-6 text-gray-600" />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-12 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2 grid grid-cols-8 gap-1 z-50">
                          {emojis.map((emoji, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setNewMessage(newMessage + emoji);
                                setShowEmojiPicker(false);
                              }}
                              className="p-2 hover:bg-gray-100 rounded text-xl"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button className="p-2.5 hover:bg-gray-100 rounded-full transition-colors">
                      <Paperclip className="w-6 h-6 text-gray-600" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Tapez un message"
                      className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {newMessage ? (
                      <button
                        onClick={sendMessage}
                        className="p-2.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsRecording(!isRecording)}
                        className={`p-2.5 rounded-full transition-colors ${
                          isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v7c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.41 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-16 h-16 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Bienvenue sur WhatsApp Business
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Sélectionnez une conversation pour commencer à chatter avec vos clients
                  </p>
                  <button className="mt-6 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center gap-2 mx-auto">
                    <UserPlus className="w-5 h-5" />
                    Démarrer une nouvelle conversation
                  </button>
                </div>
              </div>
            )}
          </>
        ) : activeView === 'broadcast' ? (
          <div className="flex-1 p-6 bg-white">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Megaphone className="w-7 h-7 text-green-500" />
                Campagnes Marketing WhatsApp
              </h3>

              {/* Stats rapides */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Send className="w-8 h-8 text-blue-500" />
                    <span className="text-2xl font-bold text-blue-900">1,247</span>
                  </div>
                  <p className="text-blue-700 text-sm font-medium">Messages envoyés</p>
                  <p className="text-blue-600 text-xs mt-1">+12% ce mois</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCheck className="w-8 h-8 text-green-500" />
                    <span className="text-2xl font-bold text-green-900">96%</span>
                  </div>
                  <p className="text-green-700 text-sm font-medium">Taux de délivrance</p>
                  <p className="text-green-600 text-xs mt-1">Excellent</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <MessageSquare className="w-8 h-8 text-purple-500" />
                    <span className="text-2xl font-bold text-purple-900">234</span>
                  </div>
                  <p className="text-purple-700 text-sm font-medium">Réponses reçues</p>
                  <p className="text-purple-600 text-xs mt-1">18.8% taux de réponse</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-orange-500" />
                    <span className="text-2xl font-bold text-orange-900">67</span>
                  </div>
                  <p className="text-orange-700 text-sm font-medium">Conversions</p>
                  <p className="text-orange-600 text-xs mt-1">5.4% taux de conversion</p>
                </div>
              </div>

              {/* Créer une campagne */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Nouvelle Campagne</h4>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la campagne
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Promo Novembre 2024"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Audience cible
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option>Tous les clients actifs (89)</option>
                      <option>Clients VIP (12)</option>
                      <option>Nouveaux clients (23)</option>
                      <option>Clients inactifs (34)</option>
                      <option>Anniversaires du mois (5)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <button className="p-3 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors">
                      <Gift className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <span className="text-xs text-gray-700">Promotion</span>
                    </button>
                    <button className="p-3 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors">
                      <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <span className="text-xs text-gray-700">Rappel RDV</span>
                    </button>
                    <button className="p-3 bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors">
                      <Sparkles className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <span className="text-xs text-gray-700">Nouveauté</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Tapez votre message ici... Utilisez {clientName} pour personnaliser"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-4">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Ajouter image
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Variables
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                      Sauvegarder brouillon
                    </button>
                    <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Envoyer maintenant
                    </button>
                  </div>
                </div>
              </div>

              {/* Campagnes récentes */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Campagnes récentes</h4>
                <div className="space-y-3">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <Gift className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">Black Friday -30%</h5>
                          <p className="text-sm text-gray-500">Envoyé il y a 2 jours • 89 destinataires</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600 font-medium">87 délivrés</span>
                        <span className="text-blue-600 font-medium">45 lus</span>
                        <span className="text-purple-600 font-medium">12 réponses</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">Rappels RDV semaine</h5>
                          <p className="text-sm text-gray-500">Envoyé il y a 5 jours • 23 destinataires</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600 font-medium">23 délivrés</span>
                        <span className="text-blue-600 font-medium">20 lus</span>
                        <span className="text-purple-600 font-medium">5 confirmations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-6 bg-white">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-7 h-7 text-green-500" />
                Analytics WhatsApp
              </h3>

              {/* Graphiques et statistiques */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Performance des messages</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taux d\'ouverture</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '79%'}}></div>
                        </div>
                        <span className="text-sm font-medium">79%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taux de réponse</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '32%'}}></div>
                        </div>
                        <span className="text-sm font-medium">32%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taux de conversion</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{width: '12%'}}></div>
                        </div>
                        <span className="text-sm font-medium">12%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Meilleurs horaires d\'envoi</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <span className="text-sm text-gray-700">10h-11h</span>
                      <span className="text-sm font-medium text-green-600">87% d\'ouverture</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <span className="text-sm text-gray-700">14h-15h</span>
                      <span className="text-sm font-medium text-green-600">82% d\'ouverture</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <span className="text-sm text-gray-700">18h-19h</span>
                      <span className="text-sm font-medium text-green-600">79% d\'ouverture</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
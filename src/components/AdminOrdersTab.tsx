'use client';

import { useEffect, useState } from 'react';
import { Gift, CheckCircle, Calendar, CreditCard, X, Plus, Edit, Trash2, Eye, Search, Mail, Settings, Save, User, Download, Package, GraduationCap, Clock, ShoppingBag, FileDown, Star, Cake, Edit2 } from 'lucide-react';
import { formatDateLocal } from '@/lib/date-utils';
import { downloadGiftCardPDF, downloadMultipleGiftCardsPDF } from '@/lib/pdf-gift-card';
import { downloadGiftCardsCSV, downloadGiftCardsExcel, downloadGiftCardsStatsCSV } from '@/lib/export-gift-cards-csv';
import GiftCardStatistics from './GiftCardStatistics';

interface GiftCard {
  id: string;
  code: string;
  amount: number;
  initialAmount: number;
  balance: number;
  purchasedBy?: string;
  purchasedFor?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  message?: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  purchaseDate: string;
  createdAt: string;
  expiryDate?: string;
  usedDate?: string;
  notes?: string;
  purchaser?: {
    id: string;
    name: string;
    email: string;
  };
  reservations?: any[];
}

interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  orderType: string; // "product" ou "formation"
  items: string; // JSON
  subtotal: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  paymentDate?: string;
  status: string;
  scheduledDate?: string;
  scheduledTime?: string;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export default function AdminOrdersTab({ filterType }: { filterType?: 'giftcard' | 'shop' } = {}) {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending-cards' | 'all-cards' | 'statistics' | 'pending-orders' | 'settings'>(
    filterType === 'shop' ? 'pending-orders' : 'pending-cards'
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Modal états
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GiftCard | Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('CB');
  const [processing, setProcessing] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCardPreview, setShowCardPreview] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [previewCard, setPreviewCard] = useState<GiftCard | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Settings
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settings, setSettings] = useState({
    emailSubject: "Vous avez reçu une carte cadeau Laia Skin Institut !",
    emailTitle: "🎁 Vous avez reçu une Carte Cadeau !",
    emailIntro: "Quelle belle attention ! Vous venez de recevoir une carte cadeau pour découvrir ou redécouvrir les soins d'exception de Laia Skin Institut.",
    emailInstructions: "Utilisez le code ci-dessous lors de votre réservation en ligne ou contactez-nous pour prendre rendez-vous.",
    emailFooter: "Cette carte cadeau est valable 1 an à partir de la date d'émission.",
    physicalCardTitle: "CARTE CADEAU",
    physicalCardSubtitle: "Laia Skin Institut",
    cardColorFrom: "#ec4899",
    cardColorTo: "#be185d",
  });

  // Loyalty Settings
  const [loyaltySettings, setLoyaltySettings] = useState({
    serviceThreshold: 5,  // Réduction au 5ème soin
    serviceDiscount: 20,
    packageThreshold: 2,   // Réduction après 2 forfaits complétés
    packageDiscount: 40,
    birthdayDiscount: 10,
    referralSponsorDiscount: 15,  // Réduction pour le parrain
    referralReferredDiscount: 10, // Réduction pour le filleul
    referralBonus: 1,
    reviewBonus: 1
  });
  const [savingLoyaltySettings, setSavingLoyaltySettings] = useState(false);

  const getDefaultExpiryDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return formatDateLocal(date);
  };

  const [newCard, setNewCard] = useState({
    amount: 50,
    senderName: '',
    purchasedFor: '',
    recipientEmail: '',
    recipientPhone: '',
    message: '',
    expiryDate: getDefaultExpiryDate(),
    notes: '',
    paymentMethod: 'CB'
  });

  useEffect(() => {
    fetchGiftCards();
    fetchOrders();
    if (activeTab === 'settings') {
      fetchSettings();
      fetchLoyaltySettings();
    }
  }, [activeTab]);

  const fetchGiftCards = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/admin/gift-cards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setGiftCards(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des cartes cadeaux:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      setOrders([]);
    }
  };

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/gift-card-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/gift-card-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        alert('✅ Paramètres sauvegardés avec succès !');
      } else {
        alert('❌ Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSavingSettings(false);
    }
  };

  const fetchLoyaltySettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/loyalty-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLoyaltySettings(data);
      }
    } catch (error) {
      console.error('Erreur chargement paramètres fidélité:', error);
    }
  };

  const saveLoyaltySettings = async () => {
    setSavingLoyaltySettings(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/loyalty-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loyaltySettings)
      });

      if (response.ok) {
        alert('✅ Paramètres de fidélité mis à jour avec succès !');
      } else {
        alert('❌ Erreur lors de la sauvegarde des paramètres');
      }
    } catch (error) {
      console.error('Erreur sauvegarde paramètres fidélité:', error);
      alert('❌ Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSavingLoyaltySettings(false);
    }
  };

  const handlePaymentRecord = async () => {
    if (!selectedItem) return;

    setProcessing(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Check if it's a gift card or order
      if ('code' in selectedItem) {
        // It's a gift card
        const res = await fetch(`/api/admin/gift-cards/${selectedItem.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            paymentStatus: 'paid',
            paymentMethod: paymentMethod,
            status: 'active'
          })
        });

        if (res.ok) {
          if (selectedItem.purchaser?.email) {
            try {
              await fetch(`/api/admin/gift-cards/${selectedItem.id}/send-email`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
            } catch (emailError) {
              console.error('Erreur envoi email:', emailError);
            }
          }

          alert('✅ Paiement enregistré avec succès !');
          fetchGiftCards();
        } else {
          alert('❌ Erreur lors de l\'enregistrement du paiement');
        }
      } else {
        // It's an order
        const res = await fetch(`/api/admin/orders/${selectedItem.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            paymentStatus: 'paid',
            paymentMethod: paymentMethod,
            paymentDate: new Date().toISOString(),
            status: 'confirmed'
          })
        });

        if (res.ok) {
          alert('✅ Paiement enregistré avec succès !');
          fetchOrders();
        } else {
          alert('❌ Erreur lors de l\'enregistrement du paiement');
        }
      }

      setShowPaymentModal(false);
      setSelectedItem(null);
      setPaymentMethod('CB');
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de l\'enregistrement du paiement');
    } finally {
      setProcessing(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'GIFT-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateCard = async () => {
    try {
      const token = localStorage.getItem('token');
      const code = generateCode();

      const response = await fetch('/api/admin/gift-cards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newCard,
          code,
          expiryDate: newCard.expiryDate || null
        })
      });

      if (response.ok) {
        const createdCard = await response.json();

        if (newCard.recipientEmail && createdCard.id) {
          try {
            await fetch(`/api/admin/gift-cards/${createdCard.id}/send-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            alert(`✅ Carte cadeau créée et envoyée à ${newCard.recipientEmail} !`);
          } catch (emailError) {
            alert('✅ Carte créée mais erreur lors de l\'envoi de l\'email.');
          }
        } else {
          alert('✅ Carte cadeau créée avec succès !');
        }

        setShowCreateModal(false);
        setNewCard({
          amount: 50,
          senderName: '',
          purchasedFor: '',
          recipientEmail: '',
          recipientPhone: '',
          message: '',
          expiryDate: getDefaultExpiryDate(),
          notes: '',
          paymentMethod: 'CB'
        });
        fetchGiftCards();
      } else {
        const error = await response.json();
        alert(`❌ Erreur: ${error.error || 'Erreur lors de la création'}`);
      }
    } catch (error) {
      console.error('Erreur création carte cadeau:', error);
      alert('❌ Erreur lors de la création de la carte cadeau');
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte cadeau ?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/gift-cards/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('✅ Carte cadeau supprimée');
        fetchGiftCards();
      }
    } catch (error) {
      console.error('Erreur suppression carte cadeau:', error);
      alert('❌ Erreur lors de la suppression');
    }
  };

  const handleSendEmail = async (card: GiftCard) => {
    if (!card.recipientEmail && !card.purchaser?.email) {
      alert('❌ Aucun email disponible pour l\'envoi');
      return;
    }

    const email = card.recipientEmail || card.purchaser?.email;
    if (!confirm(`Envoyer la carte cadeau à ${email} ?`)) return;

    setSendingEmail(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/gift-cards/${card.id}/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert(`✅ Carte cadeau envoyée à ${email} !`);
      } else {
        const error = await response.json();
        alert(`❌ Erreur: ${error.error || 'Erreur lors de l\'envoi'}`);
      }
    } catch (error) {
      console.error('Erreur envoi email:', error);
      alert('❌ Erreur lors de l\'envoi de l\'email');
    } finally {
      setSendingEmail(false);
    }
  };

  // Filtrer les cartes selon l'onglet actif
  const filteredGiftCards = () => {
    let cards = Array.isArray(giftCards) ? giftCards : [];

    if (activeTab === 'pending-cards') {
      cards = cards.filter(gc => gc.paymentStatus === 'pending' || !gc.paymentStatus);
    }

    if (searchTerm) {
      cards = cards.filter(card =>
        card.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.purchasedFor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.recipientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.purchaser?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return cards;
  };

  // Filtrer les commandes
  const filteredOrders = () => {
    let filtered = Array.isArray(orders) ? orders : [];

    if (activeTab === 'pending-orders') {
      filtered = filtered.filter(o => o.paymentStatus === 'pending');
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const displayedCards = filteredGiftCards();
  const displayedOrders = filteredOrders();
  const pendingCardsCount = Array.isArray(giftCards) ? giftCards.filter(gc => gc.paymentStatus === 'pending' || !gc.paymentStatus).length : 0;
  const pendingOrdersCount = Array.isArray(orders) ? orders.filter(o => o.paymentStatus === 'pending').length : 0;

  // Statistiques CA (filtrées selon le type)
  const paidCardsRevenue = filterType === 'shop' ? 0 : (Array.isArray(giftCards) ? giftCards
    .filter(gc => gc.paymentStatus === 'paid')
    .reduce((sum, gc) => sum + gc.amount, 0) : 0);

  const paidOrdersRevenue = filterType === 'giftcard' ? 0 : (Array.isArray(orders) ? orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0) : 0);

  const pendingCardsRevenue = filterType === 'shop' ? 0 : (Array.isArray(giftCards) ? giftCards
    .filter(gc => gc.paymentStatus === 'pending' || !gc.paymentStatus)
    .reduce((sum, gc) => sum + gc.amount, 0) : 0);

  const pendingOrdersRevenue = filterType === 'giftcard' ? 0 : (Array.isArray(orders) ? orders
    .filter(o => o.paymentStatus === 'pending')
    .reduce((sum, o) => sum + o.totalAmount, 0) : 0);

  const totalPaidRevenue = paidCardsRevenue + paidOrdersRevenue;
  const totalPendingRevenue = pendingCardsRevenue + pendingOrdersRevenue;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              {filterType === 'giftcard' ? (
                <>
                  <Gift className="w-8 h-8 text-pink-600" />
                  Cartes Cadeaux
                </>
              ) : filterType === 'shop' ? (
                <>
                  <ShoppingBag className="w-8 h-8 text-purple-600" />
                  Commandes Boutique
                </>
              ) : (
                <>
                  <ShoppingBag className="w-8 h-8 text-pink-600" />
                  Commandes & Cartes Cadeaux
                </>
              )}
            </h2>
            <p className="text-gray-600 mt-2">
              {filterType === 'giftcard'
                ? 'Gérez vos cartes cadeaux (programme de fidélité)'
                : filterType === 'shop'
                ? 'Gérez vos commandes produits et formations'
                : 'Gérez les cartes cadeaux, commandes produits et formations'}
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{totalPaidRevenue.toFixed(2)}€</p>
              <p className="text-sm text-gray-600">CA réglé</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{totalPendingRevenue.toFixed(2)}€</p>
              <p className="text-sm text-gray-600">CA en attente</p>
              <p className="text-xs text-gray-500 mt-1">({pendingCardsCount + pendingOrdersCount} commandes)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation moderne par cartes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {filterType !== 'shop' && (
          <>
            <button
              onClick={() => setActiveTab('pending-cards')}
              className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                activeTab === 'pending-cards'
                  ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg scale-105'
                  : 'bg-white hover:bg-orange-50 text-gray-700 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`p-3 rounded-xl transition-colors ${
                  activeTab === 'pending-cards' ? 'bg-white/20' : 'bg-orange-100 group-hover:bg-orange-200'
                }`}>
                  <Clock className={`w-6 h-6 ${activeTab === 'pending-cards' ? 'text-white' : 'text-orange-600'}`} />
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm mb-1">En attente</div>
                  {pendingCardsCount > 0 && (
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      activeTab === 'pending-cards' ? 'bg-white text-orange-600' : 'bg-orange-500 text-white'
                    }`}>
                      {pendingCardsCount}
                    </div>
                  )}
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('all-cards')}
              className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                activeTab === 'all-cards'
                  ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg scale-105'
                  : 'bg-white hover:bg-pink-50 text-gray-700 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`p-3 rounded-xl transition-colors ${
                  activeTab === 'all-cards' ? 'bg-white/20' : 'bg-pink-100 group-hover:bg-pink-200'
                }`}>
                  <Gift className={`w-6 h-6 ${activeTab === 'all-cards' ? 'text-white' : 'text-pink-600'}`} />
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm mb-1">Toutes</div>
                  <div className={`text-xs ${activeTab === 'all-cards' ? 'text-white/80' : 'text-gray-500'}`}>
                    {giftCards.length} cartes
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('statistics')}
              className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                activeTab === 'statistics'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg scale-105'
                  : 'bg-white hover:bg-blue-50 text-gray-700 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`p-3 rounded-xl transition-colors ${
                  activeTab === 'statistics' ? 'bg-white/20' : 'bg-blue-100 group-hover:bg-blue-200'
                }`}>
                  <Download className={`w-6 h-6 ${activeTab === 'statistics' ? 'text-white' : 'text-blue-600'}`} />
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm">Stats & Export</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-br from-gray-700 to-gray-900 text-white shadow-lg scale-105'
                  : 'bg-white hover:bg-gray-50 text-gray-700 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`p-3 rounded-xl transition-colors ${
                  activeTab === 'settings' ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'
                }`}>
                  <Settings className={`w-6 h-6 ${activeTab === 'settings' ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm">Paramètres</div>
                </div>
              </div>
            </button>
          </>
        )}

        {filterType !== 'giftcard' && (
          <button
            onClick={() => setActiveTab('pending-orders')}
            className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
              activeTab === 'pending-orders'
                ? 'bg-gradient-to-br from-purple-500 to-violet-500 text-white shadow-lg scale-105'
                : 'bg-white hover:bg-purple-50 text-gray-700 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`p-3 rounded-xl transition-colors ${
                activeTab === 'pending-orders' ? 'bg-white/20' : 'bg-purple-100 group-hover:bg-purple-200'
              }`}>
                <Clock className={`w-6 h-6 ${activeTab === 'pending-orders' ? 'text-white' : 'text-purple-600'}`} />
              </div>
              <div className="text-center">
                <div className="font-bold text-sm mb-1">Commandes</div>
                {pendingOrdersCount > 0 && (
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                    activeTab === 'pending-orders' ? 'bg-white text-purple-600' : 'bg-purple-500 text-white'
                  }`}>
                    {pendingOrdersCount}
                  </div>
                )}
              </div>
            </div>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          {activeTab === 'statistics' ? (
            // Onglet Statistiques & Export
            <div className="space-y-8">
              {/* En-tête avec titre et description */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Statistiques & Exports</h2>
                <p className="text-gray-600">Analysez vos ventes et exportez vos données en quelques clics</p>
              </div>

              {/* Section Export de données */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Exporter les données</h3>
                    <p className="text-sm text-gray-600">Téléchargez toutes vos cartes cadeaux dans le format de votre choix</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => downloadGiftCardsCSV(giftCards)}
                    className="group relative overflow-hidden bg-white hover:bg-gradient-to-br hover:from-green-500 hover:to-emerald-600 rounded-xl p-6 border-2 border-green-200 hover:border-transparent transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <div className="flex flex-col items-center gap-3 text-gray-700 group-hover:text-white transition-colors">
                      <div className="w-14 h-14 bg-green-100 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                        <Download className="w-7 h-7 text-green-600 group-hover:text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg mb-1">CSV</div>
                        <div className="text-xs opacity-75">Format universel</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => downloadGiftCardsExcel(giftCards)}
                    className="group relative overflow-hidden bg-white hover:bg-gradient-to-br hover:from-blue-500 hover:to-cyan-600 rounded-xl p-6 border-2 border-blue-200 hover:border-transparent transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <div className="flex flex-col items-center gap-3 text-gray-700 group-hover:text-white transition-colors">
                      <div className="w-14 h-14 bg-blue-100 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                        <Download className="w-7 h-7 text-blue-600 group-hover:text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg mb-1">Excel</div>
                        <div className="text-xs opacity-75">Format .xls</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => downloadGiftCardsStatsCSV(giftCards)}
                    className="group relative overflow-hidden bg-white hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-600 rounded-xl p-6 border-2 border-purple-200 hover:border-transparent transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <div className="flex flex-col items-center gap-3 text-gray-700 group-hover:text-white transition-colors">
                      <div className="w-14 h-14 bg-purple-100 group-hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                        <Download className="w-7 h-7 text-purple-600 group-hover:text-white" />
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg mb-1">Statistiques</div>
                        <div className="text-xs opacity-75">Résumé CSV</div>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-4 p-4 bg-white/60 rounded-xl">
                  <p className="text-sm text-gray-600 text-center">
                    💡 <strong>Astuce :</strong> Les exports contiennent toutes les données : code, montant, solde, bénéficiaire, dates, etc.
                  </p>
                </div>
              </div>

              {/* Section Statistiques */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Analyse des ventes</h3>
                    <p className="text-sm text-gray-600">Visualisez vos performances en temps réel</p>
                  </div>
                </div>
                <GiftCardStatistics giftCards={giftCards} />
              </div>
            </div>
          ) : activeTab === 'settings' ? (
            // Onglet Paramètres
            <div className="space-y-8">
              {/* Apparence de la carte */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">🎨 Apparence de la carte cadeau</h3>
                {settingsLoading ? (
                  <div className="text-center py-8">Chargement des paramètres...</div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Titre de la carte
                        </label>
                        <input
                          type="text"
                          value={settings.physicalCardTitle}
                          onChange={(e) => setSettings({...settings, physicalCardTitle: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                          placeholder="CARTE CADEAU"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sous-titre
                        </label>
                        <input
                          type="text"
                          value={settings.physicalCardSubtitle}
                          onChange={(e) => setSettings({...settings, physicalCardSubtitle: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                          placeholder="Laia Skin Institut"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Couleur de début (gradient)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings.cardColorFrom}
                            onChange={(e) => setSettings({...settings, cardColorFrom: e.target.value})}
                            className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.cardColorFrom}
                            onChange={(e) => setSettings({...settings, cardColorFrom: e.target.value})}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 font-mono"
                            placeholder="#ec4899"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Couleur de fin (gradient)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={settings.cardColorTo}
                            onChange={(e) => setSettings({...settings, cardColorTo: e.target.value})}
                            className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.cardColorTo}
                            onChange={(e) => setSettings({...settings, cardColorTo: e.target.value})}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 font-mono"
                            placeholder="#be185d"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Prévisualisation */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-3">Prévisualisation :</p>
                      <div
                        className="rounded-xl p-6 text-white shadow-lg max-w-sm"
                        style={{ background: `linear-gradient(135deg, ${settings.cardColorFrom} 0%, ${settings.cardColorTo} 100%)` }}
                      >
                        <div className="text-center">
                          <Gift className="w-12 h-12 mx-auto mb-3 text-white/80" />
                          <h4 className="text-2xl font-bold">{settings.physicalCardTitle}</h4>
                          <p className="text-white/80">{settings.physicalCardSubtitle}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Emails */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">📧 Personnaliser les emails de cartes cadeaux</h3>
                {settingsLoading ? (
                  <div className="text-center py-8">Chargement des paramètres...</div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre de l'email
                      </label>
                      <input
                        type="text"
                        value={settings.emailTitle}
                        onChange={(e) => setSettings({...settings, emailTitle: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Introduction de l'email
                      </label>
                      <textarea
                        value={settings.emailIntro}
                        onChange={(e) => setSettings({...settings, emailIntro: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 h-24"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instructions
                      </label>
                      <textarea
                        value={settings.emailInstructions}
                        onChange={(e) => setSettings({...settings, emailInstructions: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 h-24"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pied de page
                      </label>
                      <input
                        type="text"
                        value={settings.emailFooter}
                        onChange={(e) => setSettings({...settings, emailFooter: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Configuration des Réductions Fidélité */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">💎 Programme de Fidélité & Réductions</h3>
                {settingsLoading ? (
                  <div className="text-center py-8">Chargement des paramètres...</div>
                ) : (
                  <div className="space-y-6">
                    {/* Carte Soins Individuels */}
                    <div className="bg-gradient-to-r from-[#d4b5a0]/10 to-[#c9a084]/10 rounded-xl p-5 border border-[#d4b5a0]/30">
                      <h4 className="font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-[#d4b5a0]" />
                        Carte Soins Individuels
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                            Nombre de soins requis
                          </label>
                          <input
                            type="number"
                            value={loyaltySettings.serviceThreshold}
                            onChange={(e) => setLoyaltySettings({...loyaltySettings, serviceThreshold: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                            Montant de la réduction (€)
                          </label>
                          <input
                            type="number"
                            value={loyaltySettings.serviceDiscount}
                            onChange={(e) => setLoyaltySettings({...loyaltySettings, serviceDiscount: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-[#2c3e50]/60 mt-2">
                        Actuellement : {loyaltySettings.serviceThreshold} soins = -{loyaltySettings.serviceDiscount}€
                      </p>
                    </div>

                    {/* Carte Forfaits */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                      <h4 className="font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-600" />
                        Carte Forfaits Premium
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                            Nombre de forfaits requis
                          </label>
                          <input
                            type="number"
                            value={loyaltySettings.packageThreshold}
                            onChange={(e) => setLoyaltySettings({...loyaltySettings, packageThreshold: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                            Montant de la réduction (€)
                          </label>
                          <input
                            type="number"
                            value={loyaltySettings.packageDiscount}
                            onChange={(e) => setLoyaltySettings({...loyaltySettings, packageDiscount: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-[#2c3e50]/60 mt-2">
                        Actuellement : {loyaltySettings.packageThreshold} forfaits = -{loyaltySettings.packageDiscount}€
                      </p>
                    </div>

                    {/* Réductions spéciales */}
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-5 border border-pink-200">
                      <h4 className="font-bold text-[#2c3e50] mb-4 flex items-center gap-2">
                        <Cake className="w-5 h-5 text-pink-600" />
                        Réductions Spéciales
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                            Réduction anniversaire (€)
                          </label>
                          <input
                            type="number"
                            value={loyaltySettings.birthdayDiscount}
                            onChange={(e) => setLoyaltySettings({...loyaltySettings, birthdayDiscount: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                              Réduction parrain (€)
                            </label>
                            <input
                              type="number"
                              value={loyaltySettings.referralSponsorDiscount}
                              onChange={(e) => setLoyaltySettings({...loyaltySettings, referralSponsorDiscount: parseInt(e.target.value)})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                              Réduction filleul (€)
                            </label>
                            <input
                              type="number"
                              value={loyaltySettings.referralReferredDiscount}
                              onChange={(e) => setLoyaltySettings({...loyaltySettings, referralReferredDiscount: parseInt(e.target.value)})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                              Bonus parrainage (soins)
                            </label>
                            <input
                              type="number"
                              value={loyaltySettings.referralBonus}
                              onChange={(e) => setLoyaltySettings({...loyaltySettings, referralBonus: parseInt(e.target.value)})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#2c3e50]/70 mb-1">
                              Bonus avis Google (soins)
                            </label>
                            <input
                              type="number"
                              value={loyaltySettings.reviewBonus}
                              onChange={(e) => setLoyaltySettings({...loyaltySettings, reviewBonus: parseInt(e.target.value)})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions pour les réductions */}
                    <div className="flex justify-end pt-4 border-t">
                      <button
                        onClick={saveLoyaltySettings}
                        disabled={savingLoyaltySettings}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2 disabled:opacity-50"
                      >
                        <Save className="w-5 h-5" />
                        {savingLoyaltySettings ? 'Enregistrement...' : 'Enregistrer les réductions'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {!settingsLoading && (
                <button
                  onClick={saveSettings}
                  disabled={savingSettings}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {savingSettings ? 'Enregistrement...' : 'Enregistrer les paramètres cartes cadeaux'}
                </button>
              )}
            </div>
          ) : activeTab === 'pending-orders' ? (
            // Onglet Commandes en attente
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par numéro, client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {displayedOrders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Aucune commande en attente de paiement</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedOrders.map((order) => {
                    let items = [];
                    try {
                      items = JSON.parse(order.items || '[]');
                    } catch (e) {}

                    return (
                      <div key={order.id} className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {order.orderType === 'product' ? (
                                <Package className="w-5 h-5 text-purple-600" />
                              ) : (
                                <GraduationCap className="w-5 h-5 text-purple-600" />
                              )}
                              <span className="font-mono font-bold text-purple-700">{order.orderNumber}</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                order.paymentStatus === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {order.paymentStatus === 'pending' ? '⏳ Paiement en attente' : '✓ Payée'}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                order.orderType === 'product' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {order.orderType === 'product' ? 'Produit' : 'Formation'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Client */}
                        <div className="bg-purple-100 border border-purple-300 rounded-lg p-3 mb-3">
                          <p className="text-xs text-purple-600 font-medium mb-1">Client</p>
                          <p className="text-purple-900 font-bold">{order.customerName}</p>
                          <p className="text-purple-700 text-xs">{order.customerEmail}</p>
                          {order.customerPhone && (
                            <p className="text-purple-700 text-xs">{order.customerPhone}</p>
                          )}
                        </div>

                        {/* Articles */}
                        <div className="bg-white/50 rounded-lg p-3 mb-3">
                          <p className="text-xs text-gray-600 font-medium mb-2">Articles</p>
                          <div className="space-y-1">
                            {items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span>{item.name} <span className="text-gray-500">x{item.quantity}</span></span>
                                <span className="font-semibold">{(item.price * item.quantity).toFixed(2)}€</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center text-lg font-bold text-purple-900 mb-4 pt-3 border-t border-purple-200">
                          <span>Total</span>
                          <span>{order.totalAmount.toFixed(2)}€</span>
                        </div>

                        {/* Dates */}
                        <div className="text-xs text-gray-500 mb-3">
                          <p>Commande: {new Date(order.createdAt).toLocaleDateString('fr-FR')} à {new Date(order.createdAt).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</p>
                          {order.scheduledDate && (
                            <p className="text-purple-600 font-medium">
                              📅 Prévu le {new Date(order.scheduledDate).toLocaleDateString('fr-FR')}
                              {order.scheduledTime && ` à ${order.scheduledTime}`}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                          {order.paymentStatus === 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedItem(order);
                                setShowPaymentModal(true);
                              }}
                              className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
                            >
                              <CreditCard className="w-4 h-4" />
                              Enregistrer le paiement
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetails(true);
                            }}
                            className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-2 font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            Voir les détails
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            // Onglets Cartes Cadeaux (pending-cards et all-cards)
            <>
              <div className="flex items-center justify-between mb-6 gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par code, bénéficiaire, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div className="flex gap-2">
                  {displayedCards.length > 0 && (
                    <button
                      onClick={() => {
                        downloadMultipleGiftCardsPDF(
                          displayedCards.map(card => ({
                            code: card.code,
                            amount: card.amount,
                            balance: card.balance,
                            purchasedFor: card.purchasedFor,
                            purchasedBy: card.purchaser?.name,
                            message: card.message,
                            createdAt: card.createdAt || card.purchaseDate,
                            expiryDate: card.expiryDate,
                            purchaser: card.purchaser
                          })),
                          settings
                        );
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2"
                      title={`Télécharger ${displayedCards.length} carte(s) en PDF`}
                    >
                      <FileDown className="w-5 h-5" />
                      PDF ({displayedCards.length})
                    </button>
                  )}

                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Nouvelle carte
                  </button>
                </div>
              </div>

              {displayedCards.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {activeTab === 'pending-cards' ? 'Aucune carte en attente de paiement' : 'Aucune carte cadeau trouvée'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {displayedCards.map((card) => (
                    <div key={card.id} className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-5 border-2 border-pink-200 shadow-sm hover:shadow-md transition-shadow">
                      {/* Contenu identique à avant - Carte cadeau complète */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Gift className="w-5 h-5 text-pink-600" />
                            <span className="font-mono font-bold text-pink-700">{card.code}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              card.status === 'active' ? 'bg-green-100 text-green-700' :
                              card.status === 'used' ? 'bg-gray-100 text-gray-700' :
                              card.status === 'expired' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {card.status === 'active' ? '✓ Active' :
                               card.status === 'used' ? 'Utilisée' :
                               card.status === 'expired' ? 'Expirée' : 'Annulée'}
                            </span>
                            {(card.paymentStatus === 'pending' || !card.paymentStatus) && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                ⏳ Paiement en attente
                              </span>
                            )}
                            {card.paymentStatus === 'paid' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                ✓ Payée
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {card.purchasedFor && (
                        <div className="bg-pink-100 border border-pink-300 rounded-lg p-2 mb-2">
                          <p className="text-xs text-pink-600 font-medium mb-1">Bénéficiaire</p>
                          <p className="text-pink-900 font-bold">{card.purchasedFor}</p>
                          {card.recipientEmail && (
                            <p className="text-pink-700 text-xs truncate">{card.recipientEmail}</p>
                          )}
                        </div>
                      )}

                      {card.purchaser && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
                          <p className="text-xs text-blue-600 font-medium mb-1">Acheté par</p>
                          <p className="text-blue-900 font-semibold">{card.purchaser.name}</p>
                          <p className="text-blue-700 text-xs truncate">{card.purchaser.email}</p>
                        </div>
                      )}

                      {card.message && (
                        <div className="bg-white/50 rounded-lg p-2 mb-2">
                          <p className="text-xs text-gray-700 italic">"{card.message}"</p>
                        </div>
                      )}

                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Montant:</span>
                          <span className="font-bold text-pink-600">{card.amount}€</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Solde:</span>
                          <span className={`font-bold ${card.balance > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                            {card.balance}€
                          </span>
                        </div>
                        {card.paymentMethod && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <CreditCard className="w-3 h-3" />
                            <span>Payée par: <strong>{card.paymentMethod}</strong></span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 space-y-1 mb-3">
                        <p>Créée: {new Date(card.createdAt || card.purchaseDate).toLocaleDateString('fr-FR')}</p>
                        {card.expiryDate && (
                          <p className="text-orange-600">
                            Expire: {new Date(card.expiryDate).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>

                      {card.reservations && card.reservations.length > 0 && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 mb-3">
                          <p className="text-xs text-purple-600 font-medium mb-1">
                            Utilisations ({card.reservations.length})
                          </p>
                          <div className="space-y-1">
                            {card.reservations.map((res: any) => (
                              <div key={res.id} className="text-xs text-purple-800 flex justify-between">
                                <span>{new Date(res.date).toLocaleDateString('fr-FR')}</span>
                                <span className="font-semibold">{res.giftCardUsedAmount || 0}€</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {(card.paymentStatus === 'pending' || !card.paymentStatus) && (
                          <button
                            onClick={() => {
                              setSelectedItem(card);
                              setShowPaymentModal(true);
                            }}
                            className="w-full px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold text-sm"
                          >
                            <CreditCard className="w-4 h-4" />
                            Enregistrer le paiement
                          </button>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setPreviewCard(card);
                              setShowCardPreview(true);
                            }}
                            className="flex-1 px-3 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            Voir
                          </button>

                          <button
                            onClick={() => {
                              downloadGiftCardPDF({
                                code: card.code,
                                amount: card.amount,
                                balance: card.balance,
                                purchasedFor: card.purchasedFor,
                                purchasedBy: card.purchaser?.name,
                                message: card.message,
                                createdAt: card.createdAt || card.purchaseDate,
                                expiryDate: card.expiryDate,
                                purchaser: card.purchaser
                              }, settings);
                            }}
                            className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                            title="Télécharger le PDF de la carte cadeau"
                          >
                            <FileDown className="w-4 h-4" />
                            PDF
                          </button>

                          {(card.recipientEmail || card.purchaser?.email) && (
                            <button
                              onClick={() => handleSendEmail(card)}
                              disabled={sendingEmail}
                              className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                            >
                              <Mail className="w-4 h-4" />
                              Email
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de paiement unifié (cartes + commandes) */}
      {showPaymentModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowPaymentModal(false); setSelectedItem(null); }}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Enregistrer le paiement</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedItem(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className={`${('code' in selectedItem ? "bg-pink-50" : "bg-purple-50")} rounded-lg p-4 mb-4`}>
              {'code' in selectedItem ? (
                <>
                  <p className="text-sm text-gray-600">Carte cadeau</p>
                  <p className="font-mono font-bold text-pink-700">{selectedItem.code}</p>
                  <p className="font-bold text-2xl text-pink-600 mt-2">{selectedItem.amount}€</p>
                  {selectedItem.purchasedFor && (
                    <p className="text-sm text-gray-600 mt-2">Pour: {selectedItem.purchasedFor}</p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">Commande</p>
                  <p className="font-mono font-bold text-purple-700">{selectedItem.orderNumber}</p>
                  <p className="font-bold text-2xl text-purple-600 mt-2">{selectedItem.totalAmount.toFixed(2)}€</p>
                  <p className="text-sm text-gray-600 mt-2">Client: {selectedItem.customerName}</p>
                </>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode de paiement *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="CB">Carte bancaire</option>
                <option value="especes">Espèces</option>
                <option value="cheque">Chèque</option>
                <option value="virement">Virement</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedItem(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handlePaymentRecord}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Enregistrement...' : 'Valider le paiement'}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              {('code' in selectedItem) ? '💌 Un email sera automatiquement envoyé au client' : '✅ Le statut de la commande sera mis à jour'}
            </p>
          </div>
        </div>
      )}

      {/* Modal création carte - Identique à avant */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Nouvelle carte cadeau</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant (€) *</label>
                <input
                  type="number"
                  value={newCard.amount}
                  onChange={(e) => setNewCard({...newCard, amount: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'émetteur</label>
                <input
                  type="text"
                  value={newCard.senderName}
                  onChange={(e) => setNewCard({...newCard, senderName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du bénéficiaire</label>
                <input
                  type="text"
                  value={newCard.purchasedFor}
                  onChange={(e) => setNewCard({...newCard, purchasedFor: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email du bénéficiaire</label>
                <input
                  type="email"
                  value={newCard.recipientEmail}
                  onChange={(e) => setNewCard({...newCard, recipientEmail: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={newCard.recipientPhone}
                  onChange={(e) => setNewCard({...newCard, recipientPhone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message personnalisé</label>
                <textarea
                  value={newCard.message}
                  onChange={(e) => setNewCard({...newCard, message: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 h-20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date d'expiration</label>
                <input
                  type="date"
                  value={newCard.expiryDate}
                  onChange={(e) => setNewCard({...newCard, expiryDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mode de paiement</label>
                <select
                  value={newCard.paymentMethod}
                  onChange={(e) => setNewCard({...newCard, paymentMethod: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="CB">Carte bancaire</option>
                  <option value="especes">Espèces</option>
                  <option value="cheque">Chèque</option>
                  <option value="virement">Virement</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes internes</label>
                <textarea
                  value={newCard.notes}
                  onChange={(e) => setNewCard({...newCard, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 h-20"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateCard}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Créer la carte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal prévisualisation carte - Identique à avant */}
      {showCardPreview && previewCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => { setShowCardPreview(false); setPreviewCard(null); }}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Aperçu de la carte cadeau</h3>
              <button
                onClick={() => {
                  setShowCardPreview(false);
                  setPreviewCard(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div
              className="rounded-xl p-8 text-white"
              style={{ background: `linear-gradient(135deg, ${settings.cardColorFrom || '#ec4899'} 0%, ${settings.cardColorTo || '#be185d'} 100%)` }}
            >
              <div className="text-center mb-6">
                <Gift className="w-16 h-16 mx-auto mb-4 text-white/80" />
                <h4 className="text-3xl font-bold mb-2">{settings.physicalCardTitle || 'CARTE CADEAU'}</h4>
                <p className="text-white/80 text-lg">{settings.physicalCardSubtitle || 'Laia Skin Institut'}</p>
              </div>

              <div className="bg-white/20 rounded-lg p-6 mb-6">
                <p className="text-white/80 text-sm mb-2">Code de la carte</p>
                <p className="font-mono font-bold text-2xl tracking-wider">{previewCard.code}</p>
              </div>

              <div className="bg-white/20 rounded-lg p-6 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Valeur</span>
                  <span className="text-4xl font-bold">{previewCard.amount}€</span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-white/80">Solde restant</span>
                  <span className="text-2xl font-bold">{previewCard.balance}€</span>
                </div>
              </div>

              {previewCard.purchasedFor && (
                <div className="bg-white/20 rounded-lg p-4 mb-4">
                  <p className="text-white/70 text-sm mb-2">Bénéficiaire</p>
                  <p className="font-semibold text-lg">{previewCard.purchasedFor}</p>
                  {previewCard.recipientEmail && (
                    <p className="text-white/80 text-sm mt-1">📧 {previewCard.recipientEmail}</p>
                  )}
                  {previewCard.recipientPhone && (
                    <p className="text-white/80 text-sm mt-1">📱 {previewCard.recipientPhone}</p>
                  )}
                </div>
              )}

              {previewCard.purchaser && (
                <div className="bg-white/20 rounded-lg p-4 mb-4">
                  <p className="text-white/70 text-sm mb-2">Acheteur</p>
                  <p className="font-semibold text-lg">{previewCard.purchaser.name || 'Non renseigné'}</p>
                  {previewCard.purchaser.email && (
                    <p className="text-white/80 text-sm mt-1">📧 {previewCard.purchaser.email}</p>
                  )}
                  {(previewCard.purchaser as any).phone && (
                    <p className="text-white/80 text-sm mt-1">📱 {(previewCard.purchaser as any).phone}</p>
                  )}
                </div>
              )}

              {previewCard.message && (
                <div className="bg-white/20 rounded-lg p-4 mb-4">
                  <p className="text-white/70 text-sm mb-2">Message personnalisé</p>
                  <p className="italic">"{previewCard.message}"</p>
                </div>
              )}

              <div className="text-center text-white/70 text-xs">
                <p>Valable jusqu'au {previewCard.expiryDate ? new Date(previewCard.expiryDate).toLocaleDateString('fr-FR') : 'Non spécifié'}</p>
                <p className="mt-2">Utilisable pour tous les soins et services de l'institut</p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowCardPreview(false);
                setPreviewCard(null);
              }}
              className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modal détails commande */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowOrderDetails(false); setSelectedOrder(null); }}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Détails de la commande</h3>
              <button
                onClick={() => {
                  setShowOrderDetails(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="font-mono font-bold text-purple-700 text-xl mb-2">{selectedOrder.orderNumber}</p>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {selectedOrder.paymentStatus === 'paid' ? '✓ Payée' : 'En attente de paiement'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedOrder.orderType === 'product' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {selectedOrder.orderType === 'product' ? 'Produit' : 'Formation'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Client</p>
                  <p className="font-semibold">{selectedOrder.customerName}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.customerEmail}</p>
                  {selectedOrder.customerPhone && (
                    <p className="text-sm text-gray-500">{selectedOrder.customerPhone}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date de commande</p>
                  <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR')}</p>
                  <p className="text-sm text-gray-500">{new Date(selectedOrder.createdAt).toLocaleTimeString('fr-FR')}</p>
                </div>
              </div>

              {(() => {
                let items = [];
                try {
                  items = JSON.parse(selectedOrder.items || '[]');
                } catch (e) {}

                return (
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">Articles commandés</p>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center pb-2 border-b border-gray-200 last:border-0">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">Quantité: {item.quantity} × {item.price.toFixed(2)}€</p>
                          </div>
                          <p className="font-bold text-lg">{(item.price * item.quantity).toFixed(2)}€</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{selectedOrder.subtotal.toFixed(2)}€</span>
                </div>
                {selectedOrder.shippingCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frais de port</span>
                    <span className="font-medium">{selectedOrder.shippingCost.toFixed(2)}€</span>
                  </div>
                )}
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction</span>
                    <span className="font-medium">-{selectedOrder.discount.toFixed(2)}€</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span>Total</span>
                  <span>{selectedOrder.totalAmount.toFixed(2)}€</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Notes du client</p>
                  <p className="text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-200">{selectedOrder.notes}</p>
                </div>
              )}

              {selectedOrder.adminNotes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-medium">Notes internes</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">{selectedOrder.adminNotes}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setShowOrderDetails(false);
                setSelectedOrder(null);
              }}
              className="w-full mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import {
  Euro, Download, Calendar, TrendingUp, FileText,
  Calculator, PieChart, BarChart3, DollarSign,
  ArrowUpRight, ArrowDownRight, Filter, FileDown,
  Receipt, BookOpen, AlertCircle, CheckCircle, Clock,
  Package, Users, Briefcase, ChevronDown, ChevronUp,
  Printer, Mail, Search, X, RefreshCw, Eye
} from 'lucide-react';
import { generateInvoiceNumber, calculateInvoiceTotals, formatInvoiceHTML, generateCSVExport, downloadFile, OrganizationInvoiceConfig } from '@/lib/invoice-generator';
import { formatDateLocal } from '@/lib/date-utils';
import LaiaInvoicesSection from './LaiaInvoicesSection';

interface AdminComptabiliteTabProps {
  reservations: any[];
  fetchReservations: () => void;
  orders?: any[];
  fetchOrders?: () => void;
}

export default function AdminComptabiliteTab({ reservations, fetchReservations, orders: externalOrders, fetchOrders: externalFetchOrders }: AdminComptabiliteTabProps) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedReservations, setSelectedReservations] = useState<string[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('paid');
  const [organizationConfig, setOrganizationConfig] = useState<OrganizationInvoiceConfig | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    stats: true,
    factures: true,
    export: true
  });

  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const [selectedInvoiceForAction, setSelectedInvoiceForAction] = useState<any>(null);
  const [creditNoteData, setCreditNoteData] = useState({
    reason: '',
    partialAmount: ''
  });

  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidAmount: 0,
    pendingAmount: 0,
    taxAmount: 0,
    servicesCount: 0,
    averageTicket: 0,
    clientsCount: 0,
    recurringRate: 0,
    vatCollected: 0,
    vatDue: 0,
    monthlyGrowth: 0,
    yearlyGrowth: 0
  });

  const [orders, setOrders] = useState<any[]>(externalOrders || []);
  const [giftCards, setGiftCards] = useState<any[]>([]);

  // Utiliser les commandes externes si disponibles
  useEffect(() => {
    if (externalOrders) {
      setOrders(externalOrders);
    }
  }, [externalOrders]);

  useEffect(() => {
    calculateStats();
  }, [reservations, orders, giftCards, period]);

  // Charger les cartes cadeaux
  useEffect(() => {
    const fetchGiftCards = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/gift-cards', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setGiftCards(data);
        }
      } catch (error) {
        console.error('Erreur chargement cartes cadeaux:', error);
      }
    };
    fetchGiftCards();
  }, []);

  // Charger la configuration de l'organisation pour les factures
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/admin/organization/config');
        if (response.ok) {
          const data = await response.json();
          setOrganizationConfig(data.config);
        }
      } catch (error) {
        console.error('Erreur chargement config organisation:', error);
      }
    };
    fetchConfig();
  }, []);

  // Charger les commandes localement si pas fournies
  useEffect(() => {
    if (!externalOrders) {
      const fetchOrders = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('/api/admin/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setOrders(data);
          }
        } catch (error) {
          console.error('Erreur chargement commandes:', error);
        }
      };
      fetchOrders();
    }
  }, [externalOrders]);

  const calculateStats = () => {
    const now = new Date();
    let filteredData = reservations;
    let filteredOrders = orders;
    let filteredGiftCards = giftCards;

    // Filtrer les réservations, commandes et cartes cadeaux par période
    switch (period) {
      case 'day':
        filteredData = reservations.filter(r => {
          const date = new Date(r.date);
          return date.toDateString() === now.toDateString();
        });
        filteredOrders = orders.filter(o => {
          const date = new Date(o.createdAt);
          return date.toDateString() === now.toDateString();
        });
        filteredGiftCards = giftCards.filter(gc => {
          const date = new Date(gc.createdAt);
          return date.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        filteredData = reservations.filter(r => {
          const date = new Date(r.date);
          return date >= weekStart;
        });
        filteredOrders = orders.filter(o => {
          const date = new Date(o.createdAt);
          return date >= weekStart;
        });
        filteredGiftCards = giftCards.filter(gc => {
          const date = new Date(gc.createdAt);
          return date >= weekStart;
        });
        break;
      case 'month':
        filteredData = reservations.filter(r => {
          const date = new Date(r.date);
          return date.getMonth() === now.getMonth() &&
                 date.getFullYear() === now.getFullYear();
        });
        filteredOrders = orders.filter(o => {
          const date = new Date(o.createdAt);
          return date.getMonth() === now.getMonth() &&
                 date.getFullYear() === now.getFullYear();
        });
        filteredGiftCards = giftCards.filter(gc => {
          const date = new Date(gc.createdAt);
          return date.getMonth() === now.getMonth() &&
                 date.getFullYear() === now.getFullYear();
        });
        break;
      case 'quarter':
        const quarterStart = new Date(now);
        quarterStart.setMonth(Math.floor(now.getMonth() / 3) * 3);
        quarterStart.setDate(1);
        filteredData = reservations.filter(r => {
          const date = new Date(r.date);
          return date >= quarterStart;
        });
        filteredOrders = orders.filter(o => {
          const date = new Date(o.createdAt);
          return date >= quarterStart;
        });
        filteredGiftCards = giftCards.filter(gc => {
          const date = new Date(gc.createdAt);
          return date >= quarterStart;
        });
        break;
      case 'year':
        filteredData = reservations.filter(r => {
          const date = new Date(r.date);
          return date.getFullYear() === now.getFullYear();
        });
        filteredOrders = orders.filter(o => {
          const date = new Date(o.createdAt);
          return date.getFullYear() === now.getFullYear();
        });
        filteredGiftCards = giftCards.filter(gc => {
          const date = new Date(gc.createdAt);
          return date.getFullYear() === now.getFullYear();
        });
        break;
    }
    
    const paidReservations = filteredData.filter(r => r.paymentStatus === 'paid');
    const pendingReservations = filteredData.filter(r => r.paymentStatus !== 'paid' && r.status !== 'cancelled');

    // Commandes payées et en attente
    const paidOrders = filteredOrders.filter(o => o.paymentStatus === 'paid');
    const pendingOrders = filteredOrders.filter(o => o.paymentStatus !== 'paid' && o.status !== 'cancelled');

    // Cartes cadeaux validées (les cartes active sont considérées comme payées)
    const validatedGiftCards = filteredGiftCards.filter(gc => gc.status === 'active' || gc.status === 'used');

    // Calculer les revenus des commandes
    const ordersRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const paidOrdersRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingOrdersRevenue = pendingOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Calculer les revenus des cartes cadeaux
    const giftCardsRevenue = validatedGiftCards.reduce((sum, gc) => sum + (gc.amount || 0), 0);

    // Calculer les clients uniques (réservations + commandes)
    const reservationEmails = new Set(filteredData.map(r => r.userEmail));
    const orderEmails = new Set(filteredOrders.map(o => o.customerEmail));
    const uniqueClients = new Set([...reservationEmails, ...orderEmails]).size;
    const recurringClients = reservations.filter(r => {
      const clientReservations = reservations.filter(res => res.userEmail === r.userEmail);
      return clientReservations.length > 1;
    });

    // Calculer la croissance
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthRevenue = reservations
      .filter(r => {
        const date = new Date(r.date);
        return date.getMonth() === lastMonth.getMonth() && 
               date.getFullYear() === lastMonth.getFullYear() &&
               r.paymentStatus === 'paid';
      })
      .reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice || 0), 0);
    
    const currentMonthRevenue = paidReservations
      .filter(r => {
        const date = new Date(r.date);
        return date.getMonth() === now.getMonth() && 
               date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice || 0), 0);
    
    const monthlyGrowth = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;
    
    // Calcul correct de la TVA : TTC - (TTC / 1.20) = TVA
    const calculateTVA = (ttc: number) => ttc - (ttc / 1.20);

    // Revenus combinés (réservations + commandes + cartes cadeaux)
    const reservationsRevenue = filteredData.reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice || 0), 0);
    const totalRevenueAmount = reservationsRevenue + ordersRevenue + giftCardsRevenue;
    const totalPaidAmount = paidReservations.reduce((sum, r) => sum + (r.paymentAmount || r.totalPrice || 0), 0) + paidOrdersRevenue + giftCardsRevenue;
    const totalPendingAmount = pendingReservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0) + pendingOrdersRevenue;

    setStats({
      totalRevenue: totalRevenueAmount,
      paidAmount: totalPaidAmount,
      pendingAmount: totalPendingAmount,
      taxAmount: paidReservations.reduce((sum, r) => sum + calculateTVA(r.paymentAmount || r.totalPrice || 0), 0) + paidOrders.reduce((sum, o) => sum + calculateTVA(o.totalAmount || 0), 0),
      servicesCount: filteredData.length + filteredOrders.length,
      averageTicket: (filteredData.length + filteredOrders.length) > 0 ?
        totalRevenueAmount / (filteredData.length + filteredOrders.length) : 0,
      clientsCount: uniqueClients,
      recurringRate: uniqueClients > 0 ? (recurringClients.length / uniqueClients) * 100 : 0,
      vatCollected: paidReservations.reduce((sum, r) => sum + calculateTVA(r.paymentAmount || r.totalPrice || 0), 0) + paidOrders.reduce((sum, o) => sum + calculateTVA(o.totalAmount || 0), 0),
      vatDue: filteredData.reduce((sum, r) => sum + calculateTVA(r.totalPrice || 0), 0) + filteredOrders.reduce((sum, o) => sum + calculateTVA(o.totalAmount || 0), 0),
      monthlyGrowth,
      yearlyGrowth: 0
    });
  };

  const exportToExcel = () => {
    const headers = [
      'Date',
      'N° Facture',
      'Client',
      'Email',
      'Téléphone',
      'Services',
      'Réductions',
      'Montant HT',
      'TVA 20%',
      'Montant TTC',
      'Statut paiement',
      'Mode de paiement',
      'Date de paiement'
    ];

    // Exporter uniquement les réservations filtrées
    const rows = filteredReservations.map(r => {
      const montantTTC = r.paymentAmount || r.totalPrice || 0;
      const montantHT = montantTTC / 1.20;
      const montantTVA = montantTTC - montantHT;

      return {
        'Date': new Date(r.date).toLocaleDateString('fr-FR'),
        'N° Facture': r.invoiceNumber || generateInvoiceNumber(new Date(r.date), r.id),
        'Client': r.userName || 'Client',
        'Email': r.userEmail || '',
        'Téléphone': r.phone || '',
        'Services': Array.isArray(r.services) ? r.services.join(', ') : r.services || '',
        'Réductions': r.appliedDiscounts ? JSON.stringify(r.appliedDiscounts) : '',
        'Montant HT': montantHT.toFixed(2),
        'TVA 20%': montantTVA.toFixed(2),
        'Montant TTC': montantTTC.toFixed(2),
        'Statut paiement': r.paymentStatus === 'paid' ? 'Payé' : 'En attente',
        'Mode de paiement': r.paymentMethod || '',
        'Date de paiement': r.paymentStatus === 'paid' ? new Date(r.paymentDate || r.createdAt).toLocaleDateString('fr-FR') : ''
      };
    });
    
    const csv = generateCSVExport(rows, headers);
    downloadFile(csv, `comptabilite_laia_${formatDateLocal(new Date())}.csv`, 'text/csv;charset=utf-8;');
  };

  const exportLivreRecettes = () => {
    const paidReservations = reservations.filter(r => r.paymentStatus === 'paid');
    const headers = [
      'Date',
      'N° Pièce',
      'Client',
      'Mode de règlement',
      'Montant HT',
      'TVA',
      'Montant TTC',
      'Cumul HT',
      'Cumul TVA',
      'Cumul TTC'
    ];
    
    let cumulHT = 0;
    let cumulTVA = 0;
    let cumulTTC = 0;
    
    const rows = paidReservations
      .sort((a, b) => {
        // Trier par date de paiement (la plus récente en premier), puis par date de réservation
        const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : new Date(a.date).getTime();
        const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : new Date(b.date).getTime();
        return dateB - dateA;
      })
      .map(r => {
        const ttc = r.paymentAmount || r.totalPrice || 0;
        const ht = ttc / 1.20;
        const tva = ttc - ht;

        cumulHT += ht;
        cumulTVA += tva;
        cumulTTC += ttc;

        return {
          'Date': new Date(r.date).toLocaleDateString('fr-FR'),
          'N° Pièce': r.invoiceNumber || generateInvoiceNumber(new Date(r.date), r.id),
          'Client': r.userName || 'Client',
          'Mode de règlement': r.paymentMethod || 'CB',
          'Montant HT': ht.toFixed(2),
          'TVA': tva.toFixed(2),
          'Montant TTC': ttc.toFixed(2),
          'Cumul HT': cumulHT.toFixed(2),
          'Cumul TVA': cumulTVA.toFixed(2),
          'Cumul TTC': cumulTTC.toFixed(2)
        };
      });
    
    const csv = generateCSVExport(rows, headers);
    downloadFile(csv, `livre_recettes_laia_${formatDateLocal(new Date())}.csv`, 'text/csv;charset=utf-8;');
  };

  const exportDeclarationTVA = () => {
    const vatReport = {
      periode: period,
      montantHT: (stats.paidAmount / 1.20).toFixed(2),
      tvaCollectee: stats.vatCollected.toFixed(2),
      montantTTC: stats.paidAmount.toFixed(2),
      nombreOperations: reservations.filter(r => r.paymentStatus === 'paid').length
    };

    const content = `DÉCLARATION TVA - LAIA SKIN INSTITUT
========================================
Période: ${period === 'month' ? 'Mensuelle' : period === 'quarter' ? 'Trimestrielle' : 'Annuelle'}
Date: ${new Date().toLocaleDateString('fr-FR')}

CHIFFRE D'AFFAIRES
------------------
Montant HT: ${vatReport.montantHT}€
TVA Collectée (20%): ${vatReport.tvaCollectee}€
Montant TTC: ${vatReport.montantTTC}€
Nombre d'opérations: ${vatReport.nombreOperations}

TVA À REVERSER
--------------
Montant: ${vatReport.tvaCollectee}€

Régime: TVA sur les encaissements
SIRET: 123 456 789 00000
N° TVA Intracommunautaire: FR12 345678900`;

    downloadFile(content, `declaration_tva_${formatDateLocal(new Date())}.txt`, 'text/plain');
  };

  // Export FEC (Fichier des Écritures Comptables) - Format normalisé
  const exportFEC = () => {
    const now = new Date();
    const year = period === 'year' ? now.getFullYear() : now.getFullYear();

    // En-têtes FEC normalisés (18 colonnes obligatoires)
    const headers = [
      'JournalCode',
      'JournalLib',
      'EcritureNum',
      'EcritureDate',
      'CompteNum',
      'CompteLib',
      'CompAuxNum',
      'CompAuxLib',
      'PieceRef',
      'PieceDate',
      'EcritureLib',
      'Debit',
      'Credit',
      'EcritureLet',
      'DateLet',
      'ValidDate',
      'Montantdevise',
      'Idevise'
    ];

    const paidReservations = reservations.filter(r => r.paymentStatus === 'paid');
    const rows: any[] = [];

    paidReservations.forEach((r, index) => {
      const ecritureNum = `VTE${year}${String(index + 1).padStart(6, '0')}`;
      const ecritureDate = new Date(r.date).toISOString().split('T')[0].replace(/-/g, '');
      const pieceRef = r.invoiceNumber || generateInvoiceNumber(new Date(r.date), r.id);
      const pieceDate = ecritureDate;
      const validDate = r.paymentDate ? new Date(r.paymentDate).toISOString().split('T')[0].replace(/-/g, '') : ecritureDate;

      const montantTTC = r.paymentAmount || r.totalPrice || 0;
      const montantHT = montantTTC / 1.20;
      const montantTVA = montantTTC - montantHT;

      // Ligne 1 : Débit compte client (411)
      rows.push({
        'JournalCode': 'VTE',
        'JournalLib': 'Ventes',
        'EcritureNum': ecritureNum,
        'EcritureDate': ecritureDate,
        'CompteNum': '411000',
        'CompteLib': 'Clients',
        'CompAuxNum': r.userId || '',
        'CompAuxLib': r.userName || 'Client',
        'PieceRef': pieceRef,
        'PieceDate': pieceDate,
        'EcritureLib': Array.isArray(r.services) ? r.services.join(', ') : r.services || 'Prestation',
        'Debit': montantTTC.toFixed(2),
        'Credit': '0.00',
        'EcritureLet': '',
        'DateLet': '',
        'ValidDate': validDate,
        'Montantdevise': montantTTC.toFixed(2),
        'Idevise': 'EUR'
      });

      // Ligne 2 : Crédit compte vente (706)
      rows.push({
        'JournalCode': 'VTE',
        'JournalLib': 'Ventes',
        'EcritureNum': ecritureNum,
        'EcritureDate': ecritureDate,
        'CompteNum': '706000',
        'CompteLib': 'Prestations de services',
        'CompAuxNum': '',
        'CompAuxLib': '',
        'PieceRef': pieceRef,
        'PieceDate': pieceDate,
        'EcritureLib': Array.isArray(r.services) ? r.services.join(', ') : r.services || 'Prestation',
        'Debit': '0.00',
        'Credit': montantHT.toFixed(2),
        'EcritureLet': '',
        'DateLet': '',
        'ValidDate': validDate,
        'Montantdevise': montantHT.toFixed(2),
        'Idevise': 'EUR'
      });

      // Ligne 3 : Crédit compte TVA collectée (44571)
      rows.push({
        'JournalCode': 'VTE',
        'JournalLib': 'Ventes',
        'EcritureNum': ecritureNum,
        'EcritureDate': ecritureDate,
        'CompteNum': '445710',
        'CompteLib': 'TVA collectée',
        'CompAuxNum': '',
        'CompAuxLib': '',
        'PieceRef': pieceRef,
        'PieceDate': pieceDate,
        'EcritureLib': 'TVA collectée 20%',
        'Debit': '0.00',
        'Credit': montantTVA.toFixed(2),
        'EcritureLet': '',
        'DateLet': '',
        'ValidDate': validDate,
        'Montantdevise': montantTVA.toFixed(2),
        'Idevise': 'EUR'
      });

      // Ligne 4 : Encaissement - Débit compte banque (512)
      rows.push({
        'JournalCode': 'BQ',
        'JournalLib': 'Banque',
        'EcritureNum': `BQ${year}${String(index + 1).padStart(6, '0')}`,
        'EcritureDate': validDate,
        'CompteNum': '512000',
        'CompteLib': 'Banque',
        'CompAuxNum': '',
        'CompAuxLib': '',
        'PieceRef': pieceRef,
        'PieceDate': validDate,
        'EcritureLib': `Règlement ${pieceRef} - ${r.paymentMethod || 'CB'}`,
        'Debit': montantTTC.toFixed(2),
        'Credit': '0.00',
        'EcritureLet': '',
        'DateLet': '',
        'ValidDate': validDate,
        'Montantdevise': montantTTC.toFixed(2),
        'Idevise': 'EUR'
      });

      // Ligne 5 : Encaissement - Crédit compte client (411)
      rows.push({
        'JournalCode': 'BQ',
        'JournalLib': 'Banque',
        'EcritureNum': `BQ${year}${String(index + 1).padStart(6, '0')}`,
        'EcritureDate': validDate,
        'CompteNum': '411000',
        'CompteLib': 'Clients',
        'CompAuxNum': r.userId || '',
        'CompAuxLib': r.userName || 'Client',
        'PieceRef': pieceRef,
        'PieceDate': validDate,
        'EcritureLib': `Règlement ${pieceRef}`,
        'Debit': '0.00',
        'Credit': montantTTC.toFixed(2),
        'EcritureLet': '',
        'DateLet': '',
        'ValidDate': validDate,
        'Montantdevise': montantTTC.toFixed(2),
        'Idevise': 'EUR'
      });
    });

    // Générer le CSV avec séparateur pipe (|) ou tabulation
    const csv = [
      headers.join('\t'),
      ...rows.map(row => headers.map(h => row[h] || '').join('\t'))
    ].join('\n');

    downloadFile(csv, `FEC_${year}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.txt`, 'text/plain;charset=utf-8;');
  };

  // Export Grand Livre
  const exportGrandLivre = () => {
    const paidReservations = reservations.filter(r => r.paymentStatus === 'paid');

    // Regrouper par compte comptable
    const comptes: Record<string, any[]> = {
      '411000': [], // Clients
      '512000': [], // Banque
      '706000': [], // Prestations de services
      '445710': []  // TVA collectée
    };

    paidReservations.forEach(r => {
      const montantTTC = r.paymentAmount || r.totalPrice || 0;
      const montantHT = montantTTC / 1.20;
      const montantTVA = montantTTC - montantHT;
      const date = new Date(r.date).toLocaleDateString('fr-FR');
      const pieceRef = r.invoiceNumber || generateInvoiceNumber(new Date(r.date), r.id);

      // Compte Clients (411)
      comptes['411000'].push({
        date,
        piece: pieceRef,
        libelle: `Vente - ${r.userName}`,
        debit: montantTTC.toFixed(2),
        credit: '0.00',
        solde: montantTTC
      });

      comptes['411000'].push({
        date: r.paymentDate ? new Date(r.paymentDate).toLocaleDateString('fr-FR') : date,
        piece: pieceRef,
        libelle: `Règlement ${r.paymentMethod || 'CB'}`,
        debit: '0.00',
        credit: montantTTC.toFixed(2),
        solde: -montantTTC
      });

      // Compte Banque (512)
      comptes['512000'].push({
        date: r.paymentDate ? new Date(r.paymentDate).toLocaleDateString('fr-FR') : date,
        piece: pieceRef,
        libelle: `Encaissement ${r.userName}`,
        debit: montantTTC.toFixed(2),
        credit: '0.00',
        solde: montantTTC
      });

      // Compte Ventes (706)
      comptes['706000'].push({
        date,
        piece: pieceRef,
        libelle: Array.isArray(r.services) ? r.services.join(', ') : r.services,
        debit: '0.00',
        credit: montantHT.toFixed(2),
        solde: -montantHT
      });

      // Compte TVA (445710)
      comptes['445710'].push({
        date,
        piece: pieceRef,
        libelle: 'TVA collectée 20%',
        debit: '0.00',
        credit: montantTVA.toFixed(2),
        solde: -montantTVA
      });
    });

    const comptesLibelles: Record<string, string> = {
      '411000': 'Clients',
      '512000': 'Banque',
      '706000': 'Prestations de services',
      '445710': 'TVA collectée'
    };

    let content = `═══════════════════════════════════════════════════════════════
                    GRAND LIVRE COMPTABLE
                    LAIA SKIN INSTITUT
═══════════════════════════════════════════════════════════════

Période : ${period === 'day' ? 'Journée' : period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : period === 'quarter' ? 'Trimestre' : 'Année'}
Date d'édition : ${new Date().toLocaleDateString('fr-FR')}

`;

    Object.entries(comptes).forEach(([numero, lignes]) => {
      if (lignes.length === 0) return;

      let soldeTotal = 0;
      lignes.forEach(l => soldeTotal += l.solde);

      content += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPTE ${numero} - ${comptesLibelles[numero]}
Solde : ${soldeTotal.toFixed(2)}€ ${soldeTotal >= 0 ? 'DÉBITEUR' : 'CRÉDITEUR'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date       | N° Pièce        | Libellé                          | Débit      | Crédit     | Solde
-----------|-----------------|----------------------------------|------------|------------|-------------
`;

      let soldeCumul = 0;
      lignes.forEach(l => {
        soldeCumul += l.solde;
        content += `${l.date.padEnd(10)} | ${l.piece.padEnd(15)} | ${l.libelle.substring(0, 32).padEnd(32)} | ${l.debit.padStart(10)} | ${l.credit.padStart(10)} | ${soldeCumul.toFixed(2).padStart(11)}\n`;
      });

      content += `                                                           TOTAL | ${lignes.reduce((sum, l) => sum + parseFloat(l.debit), 0).toFixed(2).padStart(10)} | ${lignes.reduce((sum, l) => sum + parseFloat(l.credit), 0).toFixed(2).padStart(10)} | ${soldeTotal.toFixed(2).padStart(11)}\n`;
    });

    content += `\n
═══════════════════════════════════════════════════════════════
Document généré le ${new Date().toLocaleString('fr-FR')}
LAIA SKIN INSTITUT
═══════════════════════════════════════════════════════════════
`;

    downloadFile(content, `grand_livre_${formatDateLocal(new Date())}.txt`, 'text/plain;charset=utf-8;');
  };

  // Export Journal des Ventes
  const exportJournalVentes = () => {
    const paidReservations = reservations
      .filter(r => r.paymentStatus === 'paid')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let content = `═══════════════════════════════════════════════════════════════
                   JOURNAL DES VENTES
                   LAIA SKIN INSTITUT
═══════════════════════════════════════════════════════════════

Période : ${period === 'day' ? 'Journée' : period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : period === 'quarter' ? 'Trimestre' : 'Année'}
Date d'édition : ${new Date().toLocaleDateString('fr-FR')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date       | N° Facture      | Client                    | HT        | TVA       | TTC       | Mode
-----------|-----------------|---------------------------|-----------|-----------|-----------|--------
`;

    let totalHT = 0;
    let totalTVA = 0;
    let totalTTC = 0;

    paidReservations.forEach(r => {
      const montantTTC = r.paymentAmount || r.totalPrice || 0;
      const montantHT = montantTTC / 1.20;
      const montantTVA = montantTTC - montantHT;
      const date = new Date(r.date).toLocaleDateString('fr-FR');
      const pieceRef = r.invoiceNumber || generateInvoiceNumber(new Date(r.date), r.id);

      totalHT += montantHT;
      totalTVA += montantTVA;
      totalTTC += montantTTC;

      content += `${date.padEnd(10)} | ${pieceRef.padEnd(15)} | ${(r.userName || 'Client').substring(0, 25).padEnd(25)} | ${montantHT.toFixed(2).padStart(9)} | ${montantTVA.toFixed(2).padStart(9)} | ${montantTTC.toFixed(2).padStart(9)} | ${(r.paymentMethod || 'CB').padEnd(6)}\n`;
    });

    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAUX                                                  | ${totalHT.toFixed(2).padStart(9)} | ${totalTVA.toFixed(2).padStart(9)} | ${totalTTC.toFixed(2).padStart(9)} |
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nombre d'opérations : ${paidReservations.length}
Taux de TVA : 20%

═══════════════════════════════════════════════════════════════
Document généré le ${new Date().toLocaleString('fr-FR')}
LAIA SKIN INSTITUT
═══════════════════════════════════════════════════════════════
`;

    downloadFile(content, `journal_ventes_${formatDateLocal(new Date())}.txt`, 'text/plain;charset=utf-8;');
  };

  // 📊 Export Balance Comptable (synthèse des comptes)
  const exportBalanceComptable = () => {
    const now = new Date();
    const periodName = {
      day: 'Journée',
      week: 'Semaine',
      month: 'Mois',
      quarter: 'Trimestre',
      year: 'Année'
    }[period];

    const paidReservations = reservations.filter(r => r.paymentStatus === 'paid');

    // Calculer les totaux par compte
    const comptes: Record<string, { numero: string; libelle: string; debit: number; credit: number }> = {
      '411000': { numero: '411000', libelle: 'Clients', debit: 0, credit: 0 },
      '512000': { numero: '512000', libelle: 'Banque', debit: 0, credit: 0 },
      '706000': { numero: '706000', libelle: 'Prestations de services', debit: 0, credit: 0 },
      '445710': { numero: '445710', libelle: 'TVA collectée', debit: 0, credit: 0 }
    };

    paidReservations.forEach(r => {
      const montantTTC = r.paymentAmount || r.totalPrice || 0;
      const montantHT = montantTTC / 1.20;
      const montantTVA = montantTTC - montantHT;

      // Compte Clients (411) - Débit puis Crédit (encaissement)
      comptes['411000'].debit += montantTTC;
      comptes['411000'].credit += montantTTC;

      // Compte Banque (512) - Débit (encaissement)
      comptes['512000'].debit += montantTTC;

      // Compte Ventes (706) - Crédit
      comptes['706000'].credit += montantHT;

      // Compte TVA collectée (44571) - Crédit
      comptes['445710'].credit += montantTVA;
    });

    // Calculer les soldes
    const comptesArray = Object.values(comptes).map(c => ({
      ...c,
      solde: c.debit - c.credit,
      soldeDebiteur: c.debit - c.credit > 0 ? c.debit - c.credit : 0,
      soldeCrediteur: c.credit - c.debit > 0 ? c.credit - c.debit : 0
    }));

    // Calculer totaux généraux
    const totalDebit = comptesArray.reduce((sum, c) => sum + c.debit, 0);
    const totalCredit = comptesArray.reduce((sum, c) => sum + c.credit, 0);
    const totalSoldeDebiteur = comptesArray.reduce((sum, c) => sum + c.soldeDebiteur, 0);
    const totalSoldeCrediteur = comptesArray.reduce((sum, c) => sum + c.soldeCrediteur, 0);

    let content = `═══════════════════════════════════════════════════════════════
                  BALANCE COMPTABLE
                  LAIA SKIN INSTITUT
═══════════════════════════════════════════════════════════════

Période: ${periodName}
Date d'édition: ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}

═══════════════════════════════════════════════════════════════
Compte  | Libellé                      | Débit        | Crédit       | Solde Débiteur | Solde Créditeur
─────────────────────────────────────────────────────────────────────────────────────────────────────────────
`;

    comptesArray.forEach(c => {
      content += `${c.numero.padEnd(8)}| ${c.libelle.padEnd(28)} | ${c.debit.toFixed(2).padStart(12)} | ${c.credit.toFixed(2).padStart(12)} | ${c.soldeDebiteur.toFixed(2).padStart(14)} | ${c.soldeCrediteur.toFixed(2).padStart(15)}\n`;
    });

    content += `─────────────────────────────────────────────────────────────────────────────────────────────────────────────
TOTAUX  |                              | ${totalDebit.toFixed(2).padStart(12)} | ${totalCredit.toFixed(2).padStart(12)} | ${totalSoldeDebiteur.toFixed(2).padStart(14)} | ${totalSoldeCrediteur.toFixed(2).padStart(15)}
═══════════════════════════════════════════════════════════════

✅ VÉRIFICATION COMPTABLE
───────────────────────────────────────────────────────────────
Total Débit  = Total Crédit     : ${totalDebit.toFixed(2)} € = ${totalCredit.toFixed(2)} €
Balance équilibrée              : ${Math.abs(totalDebit - totalCredit) < 0.01 ? '✅ OUI' : '❌ NON'}
Différence                      : ${Math.abs(totalDebit - totalCredit).toFixed(2)} €

═══════════════════════════════════════════════════════════════

📋 INFORMATION
───────────────────────────────────────────────────────────────
La balance comptable est un document de synthèse obligatoire qui
récapitule tous les comptes avec leurs mouvements (débits/crédits)
et leurs soldes. Elle permet de vérifier l'équilibre comptable.

La balance doit toujours être équilibrée (total débits = total crédits).

═══════════════════════════════════════════════════════════════
Document généré le ${now.toLocaleString('fr-FR')}
LAIA SKIN INSTITUT
═══════════════════════════════════════════════════════════════
`;

    downloadFile(content, `balance_comptable_${formatDateLocal(now)}.txt`, 'text/plain;charset=utf-8;');
  };

  // 💾 Export format Sage/EBP/Ciel (format compatible logiciels comptables)
  const exportFormatSage = () => {
    const now = new Date();
    const paidReservations = reservations.filter(r => r.paymentStatus === 'paid');

    // Format CSV compatible Sage/EBP : Journal, Date, Compte, Libellé, Débit, Crédit, Pièce
    const headers = ['Journal', 'Date', 'N° Compte', 'Libellé', 'Débit', 'Crédit', 'N° Pièce', 'Référence'];
    const rows: any[] = [];

    paidReservations.forEach((r, index) => {
      const dateComptable = new Date(r.date);
      const dateStr = `${String(dateComptable.getDate()).padStart(2, '0')}/${String(dateComptable.getMonth() + 1).padStart(2, '0')}/${dateComptable.getFullYear()}`;
      const pieceRef = `VTE${now.getFullYear()}${String(index + 1).padStart(6, '0')}`;

      const montantTTC = r.paymentAmount || r.totalPrice || 0;
      const montantHT = montantTTC / 1.20;
      const montantTVA = montantTTC - montantHT;

      // Ligne 1: Débit Client (411)
      rows.push({
        'Journal': 'VTE',
        'Date': dateStr,
        'N° Compte': '411000',
        'Libellé': `Vente - ${r.userName || 'Client'}`,
        'Débit': montantTTC.toFixed(2),
        'Crédit': '0.00',
        'N° Pièce': pieceRef,
        'Référence': r.invoiceNumber || pieceRef
      });

      // Ligne 2: Crédit Prestation (706)
      rows.push({
        'Journal': 'VTE',
        'Date': dateStr,
        'N° Compte': '706000',
        'Libellé': `Prestation - ${Array.isArray(r.services) ? r.services.join(', ') : r.services || 'Service'}`,
        'Débit': '0.00',
        'Crédit': montantHT.toFixed(2),
        'N° Pièce': pieceRef,
        'Référence': r.invoiceNumber || pieceRef
      });

      // Ligne 3: Crédit TVA (44571)
      rows.push({
        'Journal': 'VTE',
        'Date': dateStr,
        'N° Compte': '445710',
        'Libellé': 'TVA collectée 20%',
        'Débit': '0.00',
        'Crédit': montantTVA.toFixed(2),
        'N° Pièce': pieceRef,
        'Référence': r.invoiceNumber || pieceRef
      });

      // Ligne 4: Débit Banque (512) pour encaissement
      if (r.paymentStatus === 'paid') {
        rows.push({
          'Journal': 'BQ',
          'Date': dateStr,
          'N° Compte': '512000',
          'Libellé': `Encaissement ${r.paymentMethod || 'CB'}`,
          'Débit': montantTTC.toFixed(2),
          'Crédit': '0.00',
          'N° Pièce': pieceRef,
          'Référence': r.invoiceNumber || pieceRef
        });

        // Ligne 5: Crédit Client (411) pour solde
        rows.push({
          'Journal': 'BQ',
          'Date': dateStr,
          'N° Compte': '411000',
          'Libellé': `Encaissement - ${r.userName || 'Client'}`,
          'Débit': '0.00',
          'Crédit': montantTTC.toFixed(2),
          'N° Pièce': pieceRef,
          'Référence': r.invoiceNumber || pieceRef
        });
      }
    });

    // Générer le CSV avec point-virgule comme séparateur (standard français)
    const csv = [
      headers.join(';'),
      ...rows.map(row => headers.map(h => row[h] || '').join(';'))
    ].join('\n');

    downloadFile(csv, `export_sage_${formatDateLocal(now)}.csv`, 'text/csv;charset=utf-8;');
  };

  const generateBilanSimple = () => {
    const dateDebut = new Date();
    const dateFin = new Date();

    // Déterminer les dates selon la période
    switch (period) {
      case 'day':
        dateDebut.setHours(0, 0, 0, 0);
        dateFin.setHours(23, 59, 59, 999);
        break;
      case 'week':
        dateDebut.setDate(dateDebut.getDate() - dateDebut.getDay());
        dateDebut.setHours(0, 0, 0, 0);
        break;
      case 'month':
        dateDebut.setDate(1);
        dateDebut.setHours(0, 0, 0, 0);
        dateFin.setMonth(dateFin.getMonth() + 1, 0);
        dateFin.setHours(23, 59, 59, 999);
        break;
      case 'quarter':
        const quarterStart = Math.floor(dateDebut.getMonth() / 3) * 3;
        dateDebut.setMonth(quarterStart, 1);
        dateDebut.setHours(0, 0, 0, 0);
        dateFin.setMonth(quarterStart + 3, 0);
        dateFin.setHours(23, 59, 59, 999);
        break;
      case 'year':
        dateDebut.setMonth(0, 1);
        dateDebut.setHours(0, 0, 0, 0);
        dateFin.setMonth(11, 31);
        dateFin.setHours(23, 59, 59, 999);
        break;
    }

    const periodeName = {
      day: 'Journée',
      week: 'Semaine',
      month: 'Mois',
      quarter: 'Trimestre',
      year: 'Année'
    }[period];

    const content = `╔═══════════════════════════════════════════════════════════════╗
║             BILAN COMPTABLE SIMPLIFIÉ                         ║
║             LAIA SKIN INSTITUT                                ║
╚═══════════════════════════════════════════════════════════════╝

Période: ${periodeName}
Du ${dateDebut.toLocaleDateString('fr-FR')} au ${dateFin.toLocaleDateString('fr-FR')}
Date d'édition: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}

═══════════════════════════════════════════════════════════════

📊 CHIFFRE D'AFFAIRES
───────────────────────────────────────────────────────────────
Chiffre d'affaires total TTC    ${stats.totalRevenue.toFixed(2).padStart(15)} €
  - Montant HT                   ${(stats.totalRevenue / 1.20).toFixed(2).padStart(15)} €
  - TVA 20%                      ${stats.taxAmount.toFixed(2).padStart(15)} €

Encaissements (payés)            ${stats.paidAmount.toFixed(2).padStart(15)} €
En attente de paiement           ${stats.pendingAmount.toFixed(2).padStart(15)} €

═══════════════════════════════════════════════════════════════

💰 TRÉSORERIE
───────────────────────────────────────────────────────────────
Montant encaissé TTC             ${stats.paidAmount.toFixed(2).padStart(15)} €
  - dont TVA collectée           ${stats.vatCollected.toFixed(2).padStart(15)} €
TVA à reverser à l'État          ${stats.vatCollected.toFixed(2).padStart(15)} €

═══════════════════════════════════════════════════════════════

📈 ACTIVITÉ
───────────────────────────────────────────────────────────────
Nombre de prestations            ${stats.servicesCount.toString().padStart(15)}
Nombre de clients                ${stats.clientsCount.toString().padStart(15)}
Panier moyen                     ${stats.averageTicket.toFixed(2).padStart(15)} €
Taux de fidélisation             ${stats.recurringRate.toFixed(1).padStart(15)} %
Croissance vs mois précédent     ${stats.monthlyGrowth >= 0 ? '+' : ''}${stats.monthlyGrowth.toFixed(1).padStart(14)} %

═══════════════════════════════════════════════════════════════

💡 RÉSUMÉ
───────────────────────────────────────────────────────────────
Chiffre d'affaires encaissé      ${stats.paidAmount.toFixed(2).padStart(15)} €
- TVA à reverser                 ${stats.vatCollected.toFixed(2).padStart(15)} €
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
= Résultat net (HT)              ${((stats.paidAmount / 1.20)).toFixed(2).padStart(15)} €

═══════════════════════════════════════════════════════════════

ℹ️  INFORMATIONS LÉGALES
───────────────────────────────────────────────────────────────
Régime TVA: TVA sur les encaissements
Taux de TVA applicable: 20%
SIRET: 123 456 789 00000
N° TVA Intracommunautaire: FR12 345678900

═══════════════════════════════════════════════════════════════

Document généré automatiquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
LAIA SKIN INSTITUT - Institut de beauté
Pour toute question: contact@laia-skin-institut.com`;

    downloadFile(content, `bilan_simplifie_${period}_${formatDateLocal(new Date())}.txt`, 'text/plain;charset=utf-8;');
  };

  const generateInvoice = (reservation: any) => {
    // Utiliser paymentAmount si disponible (montant réellement payé avec réductions)
    const montantTTC = reservation.paymentAmount || reservation.totalPrice || 0;
    const montantHT = montantTTC / 1.20;
    const montantTVA = montantTTC - montantHT;

    const invoice = {
      invoiceNumber: reservation.invoiceNumber || generateInvoiceNumber(new Date(reservation.date), reservation.id),
      date: new Date(reservation.date),
      client: {
        name: reservation.userName || 'Client',
        email: reservation.userEmail || '',
        phone: reservation.phone,
        address: ''
      },
      services: Array.isArray(reservation.services)
        ? reservation.services.map((s: string) => ({
            name: s,
            quantity: 1,
            unitPrice: montantHT / reservation.services.length,
            vatRate: 20
          }))
        : [{
            name: reservation.services || 'Prestation',
            quantity: 1,
            unitPrice: montantHT,
            vatRate: 20
          }],
      totalHT: montantHT,
      totalVAT: montantTVA,
      totalTTC: montantTTC,
      paymentMethod: reservation.paymentMethod || 'CB',
      paymentStatus: reservation.paymentStatus as 'paid' | 'pending',
      notes: reservation.notes
    };

    setCurrentInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const downloadInvoice = () => {
    if (!currentInvoice) return;
    const html = formatInvoiceHTML(currentInvoice, organizationConfig || undefined);
    downloadFile(html, `facture_${currentInvoice.invoiceNumber}.html`, 'text/html');
  };

  const printInvoice = () => {
    if (!currentInvoice) return;
    const html = formatInvoiceHTML(currentInvoice, organizationConfig || undefined);

    // Ajouter des boutons d'action dans la facture
    const htmlWithActions = html.replace(
      '</body>',
      `
      <div style="position: fixed; top: 20px; right: 20px; display: flex; gap: 10px; z-index: 1000; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <button onclick="window.print()" style="padding: 10px 20px; background: #d4b5a0; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 500;">
          🖨️ Imprimer
        </button>
        <button onclick="downloadInvoice()" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 500;">
          📥 Télécharger
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: 500;">
          ✕ Fermer
        </button>
      </div>
      <script>
        function downloadInvoice() {
          const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'facture_${currentInvoice.invoiceNumber}.html';
          a.click();
          URL.revokeObjectURL(url);
        }
      </script>
      <style>
        @media print {
          button, div[style*="position: fixed"] { display: none !important; }
        }
      </style>
      </body>`
    );

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlWithActions);
      printWindow.document.close();
    }
  };

  // Filtrer par période d'abord
  const now = new Date();
  let reservationsByPeriod = reservations;

  switch (period) {
    case 'day':
      reservationsByPeriod = reservations.filter(r => {
        const date = new Date(r.date);
        return date.toDateString() === now.toDateString();
      });
      break;
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      reservationsByPeriod = reservations.filter(r => {
        const date = new Date(r.date);
        return date >= weekStart;
      });
      break;
    case 'month':
      reservationsByPeriod = reservations.filter(r => {
        const date = new Date(r.date);
        return date.getMonth() === now.getMonth() &&
               date.getFullYear() === now.getFullYear();
      });
      break;
    case 'quarter':
      const quarterStart = new Date(now);
      quarterStart.setMonth(Math.floor(now.getMonth() / 3) * 3);
      quarterStart.setDate(1);
      reservationsByPeriod = reservations.filter(r => {
        const date = new Date(r.date);
        return date >= quarterStart;
      });
      break;
    case 'year':
      reservationsByPeriod = reservations.filter(r => {
        const date = new Date(r.date);
        return date.getFullYear() === now.getFullYear();
      });
      break;
  }

  const filteredReservations = reservationsByPeriod
    .filter(r => {
      const matchesSearch = searchTerm === '' ||
        r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'paid' && r.paymentStatus === 'paid') ||
        (filterStatus === 'pending' && r.paymentStatus !== 'paid');

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Trier par date de paiement (plus récent en premier), puis par date de mise à jour
      const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : new Date(a.updatedAt || a.date).getTime();
      const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : new Date(b.updatedAt || b.date).getTime();
      return dateB - dateA;
    });


  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Créer un avoir
  async function createCreditNote() {
    if (!selectedInvoiceForAction) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/invoices/${selectedInvoiceForAction.id}/credit-note`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: creditNoteData.reason || 'Annulation',
          partialAmount: creditNoteData.partialAmount ? parseFloat(creditNoteData.partialAmount) : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ Avoir ${data.creditNote.invoiceNumber} créé avec succès`);
        setShowCreditNoteModal(false);
        setSelectedInvoiceForAction(null);
        setCreditNoteData({ reason: '', partialAmount: '' });
        fetchReservations(); // Rafraîchir les données

        // Télécharger le PDF
        if (data.pdfBuffer) {
          const blob = new Blob([Buffer.from(data.pdfBuffer, 'base64')], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Avoir_${data.creditNote.invoiceNumber}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      } else {
        const error = await response.json();
        alert(`❌ Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur création avoir:', error);
      alert('❌ Erreur serveur');
    }
  }

  // Régénérer une facture
  async function regenerateInvoice(reservation: any) {
    if (!confirm('Créer une nouvelle facture et marquer l\'ancienne comme remplacée ?')) {
      return;
    }

    const reason = prompt('Motif de la régénération (optionnel):');

    try {
      const token = localStorage.getItem('token');

      // Si la réservation n'a pas encore d'invoice dans Invoice model, on ne peut pas régénérer
      // On va d'abord chercher l'invoice correspondante
      const invoicesResponse = await fetch('/api/admin/invoices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!invoicesResponse.ok) {
        alert('❌ Impossible de récupérer les factures');
        return;
      }

      const { invoices } = await invoicesResponse.json();

      // Trouver la facture correspondant à cette réservation
      const matchingInvoice = invoices.find((inv: any) =>
        inv.invoiceNumber === reservation.invoiceNumber ||
        inv.metadata?.reservationId === reservation.id
      );

      if (!matchingInvoice) {
        alert('⚠️ Aucune facture trouvée pour cette réservation. Veuillez d\'abord générer une facture.');
        return;
      }

      const response = await fetch(`/api/admin/invoices/${matchingInvoice.id}/regenerate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason || undefined })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ ${data.message}`);
        fetchReservations();

        // Télécharger le PDF
        if (data.pdfBuffer) {
          const blob = new Blob([Buffer.from(data.pdfBuffer, 'base64')], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Facture_${data.newInvoice.invoiceNumber}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      } else {
        const error = await response.json();
        alert(`❌ Erreur: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur régénération facture:', error);
      alert('❌ Erreur serveur');
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Période et Actions Rapides */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Analyse Financière
          </h2>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                console.log('🔄 Actualisation en cours...');
                // Invalider le cache d'abord
                try {
                  const token = localStorage.getItem('token');
                  const clearResponse = await fetch('/api/admin/clear-cache', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  console.log('✅ Cache invalidé:', await clearResponse.json());
                } catch (error) {
                  console.error('❌ Erreur invalidation cache:', error);
                }

                // Forcer un rechargement complet de la page
                window.location.reload();
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={exportLivreRecettes}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Livre Recettes
            </button>
          </div>
        </div>
        
        <div className="flex gap-2">
          {[
            { value: 'day' as const, label: 'Jour' },
            { value: 'week' as const, label: 'Semaine' },
            { value: 'month' as const, label: 'Mois' },
            { value: 'quarter' as const, label: 'Trimestre' },
            { value: 'year' as const, label: 'Année' }
          ].map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                period === p.value
                  ? 'bg-[#d4b5a0] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistiques Principales */}
      <div>
        <div 
          className="bg-white rounded-t-xl shadow-sm p-4 cursor-pointer flex items-center justify-between"
          onClick={() => toggleSection('stats')}
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Vue d'Ensemble
          </h3>
          {expandedSections.stats ? <ChevronUp /> : <ChevronDown />}
        </div>
        
        {expandedSections.stats && (
          <div className="bg-white rounded-b-xl shadow-sm p-6 border-t">
            {/* KPIs principaux */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* CA Total */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <Euro className="w-5 h-5 text-green-600" />
                  {stats.monthlyGrowth > 0 && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +{stats.monthlyGrowth.toFixed(0)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-1">Chiffre d'Affaires</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)}€</p>
                <div className="mt-2 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">HT</span>
                    <span className="font-medium">{(stats.totalRevenue / 1.20).toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">TVA</span>
                    <span className="font-medium">{(stats.totalRevenue * 0.20 / 1.20).toFixed(2)}€</span>
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        setFilterStatus('all');
                        document.getElementById('factures-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="text-green-600 hover:text-green-700 underline"
                    >
                      Voir le détail →
                    </button>
                  </div>
                </div>
              </div>

              {/* Encaissé */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <ArrowUpRight className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Encaissé</p>
                <p className="text-2xl font-bold text-blue-600">{stats.paidAmount.toFixed(2)}€</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${stats.totalRevenue > 0 ? (stats.paidAmount / stats.totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.totalRevenue > 0 ? Math.round((stats.paidAmount / stats.totalRevenue) * 100) : 0}% du CA
                  </p>
                  <div className="mt-2 text-xs">
                    <button
                      onClick={() => {
                        setFilterStatus('paid');
                        document.getElementById('factures-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Voir les paiements →
                    </button>
                  </div>
                </div>
              </div>

              {/* En attente */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-xs text-orange-600 font-bold">
                    {reservations.filter(r => r.paymentStatus !== 'paid' && r.status !== 'cancelled').length}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">En attente</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingAmount.toFixed(2)}€</p>
                <div className="mt-2 text-xs">
                  <button
                    onClick={() => {
                      setFilterStatus('pending');
                      // Scroll vers la section factures
                      document.getElementById('factures-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="text-orange-600 hover:text-orange-700 underline"
                  >
                    Voir les impayés →
                  </button>
                </div>
              </div>

              {/* TVA à reverser */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <Receipt className="w-5 h-5 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">20%</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">TVA Collectée</p>
                <p className="text-2xl font-bold text-red-600">{stats.vatCollected.toFixed(2)}€</p>
                <div className="mt-2">
                  <button
                    onClick={exportDeclarationTVA}
                    className="text-xs text-red-600 hover:text-red-700 underline"
                  >
                    Préparer déclaration →
                  </button>
                </div>
              </div>
            </div>

            {/* Métriques secondaires */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">Prestations</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.servicesCount}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">Clients</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.clientsCount}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">Panier moy.</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.averageTicket.toFixed(0)}€</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">Récurrence</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.recurringRate.toFixed(0)}%</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <PieChart className="w-4 h-4 text-gray-600" />
                  <span className="text-xs text-gray-600">Taux encais.</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {stats.totalRevenue > 0 ? Math.round((stats.paidAmount / stats.totalRevenue) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gestion des Factures */}
      <div id="factures-section">
        <div
          className="bg-white rounded-t-xl shadow-sm p-4 flex items-center justify-between"
        >
          <div 
            className="flex-1 flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('factures')}
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Factures et Paiements
            </h3>
            {expandedSections.factures ? <ChevronUp /> : <ChevronDown />}
          </div>
        </div>
        
        {expandedSections.factures && (
          <div className="bg-white rounded-b-xl shadow-sm p-6 border-t">
            {/* Barre de recherche et actions */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par n° facture, client, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0] focus:border-transparent"
              >
                <option value="all">Tous</option>
                <option value="paid">Payées</option>
                <option value="pending">En attente</option>
              </select>
              
              {/* Boutons d'export */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Export PDF de toutes les factures du mois
                    const paidReservations = filteredReservations.filter(r => r.paymentStatus === 'paid');
                    if (paidReservations.length === 0) {
                      alert('Aucune facture à exporter');
                      return;
                    }
                    
                    // Ouvrir une nouvelle fenêtre avec toutes les factures
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write('<html><head><title>Factures du mois</title></head><body>');
                      printWindow.document.write('<h1>Chargement des factures...</h1>');
                      
                      // Charger chaque facture
                      paidReservations.forEach((reservation, index) => {
                        if (index > 0) printWindow.document.write('<div style="page-break-after: always;"></div>');
                        fetch(`/api/invoice/${reservation.id}`)
                          .then(res => res.text())
                          .then(html => {
                            printWindow.document.write(html);
                            if (index === paidReservations.length - 1) {
                              printWindow.document.write('</body></html>');
                              setTimeout(() => printWindow.print(), 1000);
                            }
                          });
                      });
                    }
                  }}
                  className="px-4 py-2 bg-[#d4b5a0] text-white rounded-lg hover:bg-[#c9a084] flex items-center gap-2"
                  title="Imprimer toutes les factures"
                >
                  <FileText className="w-4 h-4" />
                  Imprimer
                </button>
                <button
                  onClick={exportToExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  title="Exporter en Excel"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>
              </div>
            </div>

            {/* Table simplifiée */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">N° Facture</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Services</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Montant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredReservations.slice(0, 50).map(reservation => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-semibold text-[#d4b5a0]">
                            {reservation.invoiceNumber || (reservation.paymentStatus === 'paid' ? `FAC-${new Date(reservation.date).getFullYear()}${String(new Date(reservation.date).getMonth() + 1).padStart(2, '0')}-AUTO` : '-')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(reservation.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium">{reservation.userName}</p>
                          <p className="text-xs text-gray-500">{reservation.userEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {Array.isArray(reservation.services) ? reservation.services.join(', ') : reservation.services}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-col">
                          <span className="font-bold">
                            {(reservation.paymentAmount || reservation.totalPrice)?.toFixed(2)}€
                          </span>
                          {reservation.paymentAmount && reservation.paymentAmount !== reservation.totalPrice && (
                            <span className="text-xs text-gray-500">
                              (sur {reservation.totalPrice?.toFixed(2)}€)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {reservation.paymentStatus === 'paid' ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              ✓ Payée
                            </span>
                          ) : reservation.paymentStatus === 'pending' && reservation.paymentMethod === 'Stripe' ? (
                            <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full flex items-center gap-1 w-fit">
                              💳 Stripe - En attente
                            </span>
                          ) : reservation.paymentStatus === 'pending' && reservation.paymentMethod === 'PayPal' ? (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full flex items-center gap-1 w-fit">
                              💳 PayPal - En attente
                            </span>
                          ) : reservation.paymentStatus === 'pending' && reservation.paymentMethod === 'Mollie' ? (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full flex items-center gap-1 w-fit">
                              💳 Mollie - En attente
                            </span>
                          ) : reservation.paymentStatus === 'pending' && reservation.paymentMethod === 'SumUp' ? (
                            <span className="px-2 py-1 text-xs font-medium bg-cyan-100 text-cyan-800 rounded-full flex items-center gap-1 w-fit">
                              💳 SumUp - En attente
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                              En attente
                            </span>
                          )}
                          {reservation.paymentMethod === 'Stripe' && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-600 rounded w-fit">
                              💳 Stripe
                            </span>
                          )}
                          {reservation.paymentMethod === 'PayPal' && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded w-fit">
                              💳 PayPal
                            </span>
                          )}
                          {reservation.paymentMethod === 'Mollie' && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-gray-50 text-gray-600 rounded w-fit">
                              💳 Mollie
                            </span>
                          )}
                          {reservation.paymentMethod === 'SumUp' && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-cyan-50 text-cyan-600 rounded w-fit">
                              💳 SumUp
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Voir */}
                          <button
                            onClick={() => {
                              generateInvoice(reservation);
                              setTimeout(printInvoice, 100);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Télécharger */}
                          <button
                            onClick={() => {
                              generateInvoice(reservation);
                              setTimeout(downloadInvoice, 100);
                            }}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {/* Créer un avoir (si payée) */}
                          {reservation.paymentStatus === 'paid' && (
                            <button
                              onClick={async () => {
                                const token = localStorage.getItem('token');
                                const invoicesResponse = await fetch('/api/admin/invoices', {
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                if (invoicesResponse.ok) {
                                  const { invoices } = await invoicesResponse.json();
                                  const matchingInvoice = invoices.find((inv: any) =>
                                    inv.invoiceNumber === reservation.invoiceNumber
                                  );
                                  if (matchingInvoice) {
                                    setSelectedInvoiceForAction(matchingInvoice);
                                    setShowCreditNoteModal(true);
                                  } else {
                                    alert('⚠️ Aucune facture trouvée');
                                  }
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-orange-600"
                              title="Créer un avoir"
                            >
                              <span className="text-sm">📝</span>
                            </button>
                          )}
                          {/* Régénérer (si en attente) */}
                          {reservation.paymentStatus !== 'paid' && (
                            <button
                              onClick={() => regenerateInvoice(reservation)}
                              className="p-1 text-gray-400 hover:text-blue-600"
                              title="Régénérer la facture"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section Commandes Produits/Formations */}
            <div className="mt-8 border-t pt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Commandes Produits & Formations
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-y">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">N° Commande</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Articles</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Montant</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.filter(o => {
                      const matchesSearch = searchTerm === '' ||
                        o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());

                      const matchesStatus = filterStatus === 'all' ||
                        (filterStatus === 'paid' && o.paymentStatus === 'paid') ||
                        (filterStatus === 'pending' && o.paymentStatus !== 'paid');

                      return matchesSearch && matchesStatus;
                    }).slice(0, 10).map(order => {
                      let items = [];
                      try {
                        items = JSON.parse(order.items || '[]');
                      } catch (e) {
                        console.error('Erreur parsing items:', e);
                      }

                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <span className="font-mono font-semibold text-purple-600">
                              {order.orderNumber}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div>
                              <p className="font-medium">{order.customerName}</p>
                              <p className="text-xs text-gray-500">{order.customerEmail}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              order.orderType === 'product'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {order.orderType === 'product' ? 'Produit' : 'Formation'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                            {items.map((item: any) => `${item.name} (x${item.quantity})`).join(', ') || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold">
                            {order.totalAmount?.toFixed(2)}€
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              {order.paymentStatus === 'paid' ? (
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                  Payé
                                </span>
                              ) : order.paymentStatus === 'pending' && order.paymentMethod === 'Stripe' ? (
                                <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full flex items-center gap-1 w-fit">
                                  💳 Stripe - En attente
                                </span>
                              ) : order.paymentStatus === 'pending' && order.paymentMethod === 'PayPal' ? (
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full flex items-center gap-1 w-fit">
                                  💳 PayPal - En attente
                                </span>
                              ) : order.paymentStatus === 'pending' && order.paymentMethod === 'Mollie' ? (
                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full flex items-center gap-1 w-fit">
                                  💳 Mollie - En attente
                                </span>
                              ) : order.paymentStatus === 'pending' && order.paymentMethod === 'SumUp' ? (
                                <span className="px-2 py-1 text-xs font-medium bg-cyan-100 text-cyan-800 rounded-full flex items-center gap-1 w-fit">
                                  💳 SumUp - En attente
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                  En attente
                                </span>
                              )}
                              {order.paymentMethod === 'Stripe' && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-600 rounded w-fit">
                                  💳 Stripe
                                </span>
                              )}
                              {order.paymentMethod === 'PayPal' && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 rounded w-fit">
                                  💳 PayPal
                                </span>
                              )}
                              {order.paymentMethod === 'Mollie' && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-gray-50 text-gray-600 rounded w-fit">
                                  💳 Mollie
                                </span>
                              )}
                              {order.paymentMethod === 'SumUp' && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-cyan-50 text-cyan-600 rounded w-fit">
                                  💳 SumUp
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {orders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucune commande enregistrée
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Documents et Export */}
      <div>
        <div 
          className="bg-white rounded-t-xl shadow-sm p-4 cursor-pointer flex items-center justify-between"
          onClick={() => toggleSection('export')}
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Documents Comptables
          </h3>
          {expandedSections.export ? <ChevronUp /> : <ChevronDown />}
        </div>
        
        {expandedSections.export && (
          <div className="bg-white rounded-b-xl shadow-sm p-6 border-t">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <button
                onClick={exportFEC}
                className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
                title="Fichier des Écritures Comptables (obligatoire)"
              >
                <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium text-sm">FEC</p>
                <p className="text-xs text-gray-500 mt-1">Obligatoire</p>
              </button>

              <button
                onClick={exportGrandLivre}
                className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-sm">Grand Livre</p>
                <p className="text-xs text-gray-500 mt-1">Comptabilité</p>
              </button>

              <button
                onClick={exportBalanceComptable}
                className="p-4 border-2 border-dashed border-cyan-300 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-all"
                title="Balance de tous les comptes avec soldes"
              >
                <BarChart3 className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
                <p className="font-medium text-sm">Balance</p>
                <p className="text-xs text-gray-500 mt-1">Synthèse</p>
              </button>

              <button
                onClick={exportJournalVentes}
                className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <FileDown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-medium text-sm">Journal Ventes</p>
                <p className="text-xs text-gray-500 mt-1">Recettes</p>
              </button>

              <button
                onClick={exportLivreRecettes}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#d4b5a0] hover:bg-gray-50"
              >
                <BookOpen className="w-8 h-8 text-[#d4b5a0] mx-auto mb-2" />
                <p className="font-medium text-sm">Livre Recettes</p>
                <p className="text-xs text-gray-500 mt-1">Simplifié</p>
              </button>

              <button
                onClick={exportDeclarationTVA}
                className="p-4 border-2 border-dashed border-red-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all"
              >
                <Receipt className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="font-medium text-sm">Déclaration TVA</p>
                <p className="text-xs text-gray-500 mt-1">Fiscalité</p>
              </button>

              <button
                onClick={exportToExcel}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#d4b5a0] hover:bg-gray-50"
              >
                <FileDown className="w-8 h-8 text-[#d4b5a0] mx-auto mb-2" />
                <p className="font-medium text-sm">Export Excel</p>
                <p className="text-xs text-gray-500 mt-1">Détaillé</p>
              </button>

              <button
                onClick={generateBilanSimple}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#d4b5a0] hover:bg-gray-50"
              >
                <BarChart3 className="w-8 h-8 text-[#d4b5a0] mx-auto mb-2" />
                <p className="font-medium text-sm">Bilan Simplifié</p>
                <p className="text-xs text-gray-500 mt-1">KPIs</p>
              </button>

              <button
                onClick={exportFormatSage}
                className="p-4 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
                title="Format CSV pour Sage, EBP, Ciel"
              >
                <Download className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="font-medium text-sm">Format Sage</p>
                <p className="text-xs text-gray-500 mt-1">CSV</p>
              </button>

              <button
                onClick={() => {
                  alert('📚 Exports comptables disponibles:\n\n' +
                    '✅ FEC : Format normalisé pour l\'administration fiscale\n' +
                    '✅ Grand Livre : État détaillé de tous les comptes\n' +
                    '✅ Balance Comptable : Synthèse de tous les comptes avec soldes\n' +
                    '✅ Journal des Ventes : Récapitulatif chronologique\n' +
                    '✅ Livre de Recettes : Obligatoire pour micro-entrepreneurs\n' +
                    '✅ Déclaration TVA : Prête à l\'emploi\n' +
                    '✅ Format Sage/EBP : Import direct dans logiciels comptables\n\n' +
                    '💡 Ces documents sont conformes à la législation française');
                }}
                className="p-4 border-2 border-dashed border-indigo-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
              >
                <AlertCircle className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <p className="font-medium text-sm">Aide</p>
                <p className="text-xs text-gray-500 mt-1">Documentation</p>
              </button>
            </div>

            {/* Avertissement légal */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold mb-2">📋 Documents comptables obligatoires</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li><strong>FEC (Fichier des Écritures Comptables)</strong> : Obligatoire en cas de contrôle fiscal (format normalisé)</li>
                    <li><strong>Grand Livre</strong> : Document comptable légal regroupant toutes les écritures</li>
                    <li><strong>Journal des Ventes</strong> : Enregistrement chronologique de toutes les ventes</li>
                    <li><strong>Déclaration TVA</strong> : Mensuelle ou trimestrielle selon votre régime</li>
                    <li>Conservation obligatoire : <strong>10 ans minimum</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Informations légales */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Rappels légaux</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>TVA 20% sur toutes les prestations</li>
              <li>Conservation des documents : 10 ans</li>
              <li>Déclaration TVA mensuelle ou trimestrielle selon CA</li>
              <li>Facture obligatoire pour tout montant supérieur à 25€</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal Facture */}
      {showInvoiceModal && currentInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Facture {currentInvoice.invoiceNumber}</h2>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div dangerouslySetInnerHTML={{ __html: formatInvoiceHTML(currentInvoice, organizationConfig || undefined) }} />
            </div>

            <div className="p-6 border-t flex gap-3 justify-end">
              <button
                onClick={printInvoice}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </button>
              <button
                onClick={downloadInvoice}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Créer un Avoir */}
      {showCreditNoteModal && selectedInvoiceForAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold mb-2">📝 Créer un avoir</h2>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Facture d'origine</p>
                <p className="font-bold">{selectedInvoiceForAction.invoiceNumber}</p>
                <p className="text-gray-700">
                  {formatCurrency(selectedInvoiceForAction.amount)}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif de l'avoir *
                </label>
                <textarea
                  value={creditNoteData.reason}
                  onChange={(e) => setCreditNoteData({ ...creditNoteData, reason: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                  placeholder="Ex: Annulation de l'abonnement, Erreur de facturation..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant de l'avoir
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={creditNoteData.partialAmount}
                  onChange={(e) => setCreditNoteData({ ...creditNoteData, partialAmount: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#d4b5a0]"
                  placeholder={`Laisser vide pour un avoir complet (${formatCurrency(selectedInvoiceForAction.amount)})`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Laisser vide pour créer un avoir du montant total
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  ⚠️ <strong>Règles légales :</strong><br />
                  • Un avoir annule ou corrige une facture<br />
                  • Il référence la facture d'origine<br />
                  • La facture d'origine reste dans l'historique<br />
                  • Un PDF sera automatiquement généré
                </p>
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={createCreditNote}
                disabled={!creditNoteData.reason.trim()}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Créer l'avoir
              </button>
              <button
                onClick={() => {
                  setShowCreditNoteModal(false);
                  setSelectedInvoiceForAction(null);
                  setCreditNoteData({ reason: '', partialAmount: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Factures d'abonnement LAIA */}
      <LaiaInvoicesSection />
    </div>
  );
}
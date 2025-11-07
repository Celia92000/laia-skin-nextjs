'use client';

import { useState } from 'react';
import {
  FileText, BookOpen, Receipt, FileDown, Download, AlertCircle, BarChart3
} from 'lucide-react';

interface SuperAdminAccountingExportsProps {
  invoices: any[];
}

export default function SuperAdminAccountingExports({ invoices }: SuperAdminAccountingExportsProps) {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  // Fonction utilitaire pour télécharger un fichier
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format date local
  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  // Filtrer les factures payées par période
  const getFilteredInvoices = () => {
    const now = new Date();
    return invoices.filter(inv => {
      if (inv.status !== 'paid') return false;
      const invDate = new Date(inv.createdAt);

      switch (period) {
        case 'month':
          return invDate.getMonth() === now.getMonth() &&
                 invDate.getFullYear() === now.getFullYear();
        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          return invDate.getMonth() >= quarterStart &&
                 invDate.getMonth() < quarterStart + 3 &&
                 invDate.getFullYear() === now.getFullYear();
        case 'year':
          return invDate.getFullYear() === now.getFullYear();
        default:
          return false;
      }
    });
  };

  // Export FEC (Fichier des Écritures Comptables)
  const exportFEC = () => {
    const now = new Date();
    const year = now.getFullYear();
    const filtered = getFilteredInvoices();

    // En-têtes FEC normalisés
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

    const rows: any[] = [];

    filtered.forEach((inv, index) => {
      const ecritureNum = `VTE${year}${String(index + 1).padStart(6, '0')}`;
      const ecritureDate = new Date(inv.createdAt).toISOString().split('T')[0].replace(/-/g, '');
      const pieceRef = inv.invoiceNumber || `LAIA-${year}-${String(index + 1).padStart(4, '0')}`;
      const pieceDate = ecritureDate;
      const validDate = inv.paidAt ? new Date(inv.paidAt).toISOString().split('T')[0].replace(/-/g, '') : ecritureDate;

      const montantTTC = inv.amount;
      const montantHT = montantTTC / 1.20;
      const montantTVA = montantTTC - montantHT;

      // Débit compte client
      rows.push({
        'JournalCode': 'VTE',
        'JournalLib': 'Ventes SaaS',
        'EcritureNum': ecritureNum,
        'EcritureDate': ecritureDate,
        'CompteNum': '411000',
        'CompteLib': 'Clients abonnements',
        'CompAuxNum': inv.organizationId || '',
        'CompAuxLib': inv.organization?.name || 'Organisation',
        'PieceRef': pieceRef,
        'PieceDate': pieceDate,
        'EcritureLib': `Abonnement ${inv.organization?.plan || 'LAIA Connect'}`,
        'Debit': montantTTC.toFixed(2),
        'Credit': '0.00',
        'EcritureLet': '',
        'DateLet': '',
        'ValidDate': validDate,
        'Montantdevise': montantTTC.toFixed(2),
        'Idevise': 'EUR'
      });

      // Crédit compte vente
      rows.push({
        'JournalCode': 'VTE',
        'JournalLib': 'Ventes SaaS',
        'EcritureNum': ecritureNum,
        'EcritureDate': ecritureDate,
        'CompteNum': '706100',
        'CompteLib': 'Prestations logiciels SaaS',
        'CompAuxNum': '',
        'CompAuxLib': '',
        'PieceRef': pieceRef,
        'PieceDate': pieceDate,
        'EcritureLib': `Abonnement ${inv.organization?.plan || 'LAIA Connect'}`,
        'Debit': '0.00',
        'Credit': montantHT.toFixed(2),
        'EcritureLet': '',
        'DateLet': '',
        'ValidDate': validDate,
        'Montantdevise': montantHT.toFixed(2),
        'Idevise': 'EUR'
      });

      // Crédit TVA collectée
      rows.push({
        'JournalCode': 'VTE',
        'JournalLib': 'Ventes SaaS',
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

      // Encaissement banque
      rows.push({
        'JournalCode': 'BQ',
        'JournalLib': 'Banque',
        'EcritureNum': `BQ${year}${String(index + 1).padStart(6, '0')}`,
        'EcritureDate': validDate,
        'CompteNum': '512000',
        'CompteLib': 'Banque Stripe',
        'CompAuxNum': '',
        'CompAuxLib': '',
        'PieceRef': pieceRef,
        'PieceDate': validDate,
        'EcritureLib': `Règlement Stripe ${pieceRef}`,
        'Debit': montantTTC.toFixed(2),
        'Credit': '0.00',
        'EcritureLet': '',
        'DateLet': '',
        'ValidDate': validDate,
        'Montantdevise': montantTTC.toFixed(2),
        'Idevise': 'EUR'
      });

      rows.push({
        'JournalCode': 'BQ',
        'JournalLib': 'Banque',
        'EcritureNum': `BQ${year}${String(index + 1).padStart(6, '0')}`,
        'EcritureDate': validDate,
        'CompteNum': '411000',
        'CompteLib': 'Clients abonnements',
        'CompAuxNum': inv.organizationId || '',
        'CompAuxLib': inv.organization?.name || 'Organisation',
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

    const csv = [
      headers.join('\t'),
      ...rows.map(row => headers.map(h => row[h] || '').join('\t'))
    ].join('\n');

    downloadFile(csv, `FEC_LAIA_${formatDateLocal(now)}.txt`, 'text/plain;charset=utf-8;');
  };

  // Export Grand Livre
  const exportGrandLivre = () => {
    const filtered = getFilteredInvoices();

    const comptes: Record<string, any[]> = {
      '411000': [],
      '512000': [],
      '706100': [],
      '445710': []
    };

    filtered.forEach(inv => {
      const montantTTC = inv.amount;
      const montantHT = montantTTC / 1.20;
      const montantTVA = montantTTC - montantHT;
      const date = new Date(inv.createdAt).toLocaleDateString('fr-FR');
      const pieceRef = inv.invoiceNumber || `LAIA-${new Date(inv.createdAt).getFullYear()}-AUTO`;

      comptes['411000'].push(
        {
          date,
          piece: pieceRef,
          libelle: `Vente - ${inv.organization?.name}`,
          debit: montantTTC.toFixed(2),
          credit: '0.00',
          solde: montantTTC
        },
        {
          date: inv.paidAt ? new Date(inv.paidAt).toLocaleDateString('fr-FR') : date,
          piece: pieceRef,
          libelle: `Règlement Stripe`,
          debit: '0.00',
          credit: montantTTC.toFixed(2),
          solde: -montantTTC
        }
      );

      comptes['512000'].push({
        date: inv.paidAt ? new Date(inv.paidAt).toLocaleDateString('fr-FR') : date,
        piece: pieceRef,
        libelle: `Encaissement ${inv.organization?.name}`,
        debit: montantTTC.toFixed(2),
        credit: '0.00',
        solde: montantTTC
      });

      comptes['706100'].push({
        date,
        piece: pieceRef,
        libelle: `Abonnement ${inv.organization?.plan}`,
        debit: '0.00',
        credit: montantHT.toFixed(2),
        solde: -montantHT
      });

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
      '411000': 'Clients abonnements SaaS',
      '512000': 'Banque Stripe',
      '706100': 'Prestations logiciels SaaS',
      '445710': 'TVA collectée'
    };

    let content = `═══════════════════════════════════════════════════════════════
                    GRAND LIVRE COMPTABLE
                         LAIA CONNECT
═══════════════════════════════════════════════════════════════

Période : ${period === 'month' ? 'Mois' : period === 'quarter' ? 'Trimestre' : 'Année'}
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
LAIA CONNECT - Plateforme SaaS
═══════════════════════════════════════════════════════════════
`;

    downloadFile(content, `grand_livre_LAIA_${formatDateLocal(new Date())}.txt`, 'text/plain;charset=utf-8;');
  };

  // Export Journal des Ventes
  const exportJournalVentes = () => {
    const filtered = getFilteredInvoices().sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    let content = `═══════════════════════════════════════════════════════════════
                   JOURNAL DES VENTES
                      LAIA CONNECT
═══════════════════════════════════════════════════════════════

Période : ${period === 'month' ? 'Mois' : period === 'quarter' ? 'Trimestre' : 'Année'}
Date d'édition : ${new Date().toLocaleDateString('fr-FR')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date       | N° Facture      | Organisation              | Plan     | HT        | TVA       | TTC
-----------|-----------------|---------------------------|----------|-----------|-----------|----------
`;

    let totalHT = 0;
    let totalTVA = 0;
    let totalTTC = 0;

    filtered.forEach(inv => {
      const montantTTC = inv.amount;
      const montantHT = montantTTC / 1.20;
      const montantTVA = montantTTC - montantHT;
      const date = new Date(inv.createdAt).toLocaleDateString('fr-FR');
      const pieceRef = inv.invoiceNumber || `LAIA-AUTO`;

      totalHT += montantHT;
      totalTVA += montantTVA;
      totalTTC += montantTTC;

      content += `${date.padEnd(10)} | ${pieceRef.padEnd(15)} | ${(inv.organization?.name || 'Organisation').substring(0, 25).padEnd(25)} | ${(inv.organization?.plan || 'N/A').padEnd(8)} | ${montantHT.toFixed(2).padStart(9)} | ${montantTVA.toFixed(2).padStart(9)} | ${montantTTC.toFixed(2).padStart(8)}\n`;
    });

    content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAUX                                                          | ${totalHT.toFixed(2).padStart(9)} | ${totalTVA.toFixed(2).padStart(9)} | ${totalTTC.toFixed(2).padStart(8)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nombre d'abonnements facturés : ${filtered.length}
Taux de TVA : 20%
Revenus récurrents mensuels (MRR) : ${(totalTTC / (period === 'year' ? 12 : period === 'quarter' ? 3 : 1)).toFixed(2)}€

═══════════════════════════════════════════════════════════════
Document généré le ${new Date().toLocaleString('fr-FR')}
LAIA CONNECT - Plateforme SaaS
═══════════════════════════════════════════════════════════════
`;

    downloadFile(content, `journal_ventes_LAIA_${formatDateLocal(new Date())}.txt`, 'text/plain;charset=utf-8;');
  };

  // Export Déclaration TVA
  const exportDeclarationTVA = () => {
    const filtered = getFilteredInvoices();

    const totalTTC = filtered.reduce((sum, inv) => sum + inv.amount, 0);
    const totalHT = totalTTC / 1.20;
    const totalTVA = totalTTC - totalHT;

    const content = `═══════════════════════════════════════════════════════════════
              DÉCLARATION TVA - LAIA CONNECT
═══════════════════════════════════════════════════════════════

Période: ${period === 'month' ? 'Mensuelle' : period === 'quarter' ? 'Trimestrielle' : 'Annuelle'}
Date: ${new Date().toLocaleDateString('fr-FR')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHIFFRE D'AFFAIRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Montant HT                          ${totalHT.toFixed(2).padStart(15)} €
TVA Collectée (20%)                 ${totalTVA.toFixed(2).padStart(15)} €
Montant TTC                         ${totalTTC.toFixed(2).padStart(15)} €

Nombre d'opérations                 ${filtered.length.toString().padStart(15)}
Abonnements SaaS actifs             ${filtered.length.toString().padStart(15)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TVA À REVERSER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Montant total                       ${totalTVA.toFixed(2).padStart(15)} €

Régime: TVA sur les encaissements (SaaS)
Type d'activité: Prestations de services numériques
SIRET: 98869193700001
N° TVA Intracommunautaire: FR[à compléter]

═══════════════════════════════════════════════════════════════

📋 NOTES IMPORTANTES:
- Les abonnements SaaS sont soumis à la TVA française (20%)
- Régime d'encaissement: TVA due au moment du paiement
- Conservation obligatoire: 10 ans
- Déclaration à effectuer selon votre régime fiscal

═══════════════════════════════════════════════════════════════
Document généré le ${new Date().toLocaleString('fr-FR')}
LAIA CONNECT - Plateforme SaaS pour instituts de beauté
═══════════════════════════════════════════════════════════════
`;

    downloadFile(content, `declaration_tva_LAIA_${formatDateLocal(new Date())}.txt`, 'text/plain');
  };

  // 📊 Export Balance Comptable (synthèse des comptes)
  const exportBalanceComptable = () => {
    const now = new Date();
    const periodName = {
      month: 'Mois',
      quarter: 'Trimestre',
      year: 'Année'
    }[period];

    const filtered = getFilteredInvoices();

    // Calculer les totaux par compte
    const comptes: Record<string, { numero: string; libelle: string; debit: number; credit: number }> = {
      '411000': { numero: '411000', libelle: 'Clients (Organisations)', debit: 0, credit: 0 },
      '512000': { numero: '512000', libelle: 'Banque Stripe', debit: 0, credit: 0 },
      '706100': { numero: '706100', libelle: 'Services SaaS', debit: 0, credit: 0 },
      '445710': { numero: '445710', libelle: 'TVA collectée', debit: 0, credit: 0 }
    };

    filtered.forEach(inv => {
      const montantTTC = inv.amount;
      const montantHT = montantTTC / 1.20;
      const montantTVA = montantTTC - montantHT;

      // Compte Clients (411) - Débit puis Crédit (encaissement)
      comptes['411000'].debit += montantTTC;
      comptes['411000'].credit += montantTTC;

      // Compte Banque (512) - Débit (encaissement)
      comptes['512000'].debit += montantTTC;

      // Compte Services SaaS (706100) - Crédit
      comptes['706100'].credit += montantHT;

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
                  LAIA CONNECT (SaaS)
═══════════════════════════════════════════════════════════════

Période: ${periodName}
Date d'édition: ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}

═══════════════════════════════════════════════════════════════
Compte  | Libellé                          | Débit        | Crédit       | Solde Débiteur | Solde Créditeur
─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
`;

    comptesArray.forEach(c => {
      content += `${c.numero.padEnd(8)}| ${c.libelle.padEnd(32)} | ${c.debit.toFixed(2).padStart(12)} | ${c.credit.toFixed(2).padStart(12)} | ${c.soldeDebiteur.toFixed(2).padStart(14)} | ${c.soldeCrediteur.toFixed(2).padStart(15)}\n`;
    });

    content += `─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
TOTAUX  |                                  | ${totalDebit.toFixed(2).padStart(12)} | ${totalCredit.toFixed(2).padStart(12)} | ${totalSoldeDebiteur.toFixed(2).padStart(14)} | ${totalSoldeCrediteur.toFixed(2).padStart(15)}
═══════════════════════════════════════════════════════════════

✅ VÉRIFICATION COMPTABLE
───────────────────────────────────────────────────────────────
Total Débit  = Total Crédit     : ${totalDebit.toFixed(2)} € = ${totalCredit.toFixed(2)} €
Balance équilibrée              : ${Math.abs(totalDebit - totalCredit) < 0.01 ? '✅ OUI' : '❌ NON'}
Différence                      : ${Math.abs(totalDebit - totalCredit).toFixed(2)} €

═══════════════════════════════════════════════════════════════

📋 INFORMATION
───────────────────────────────────────────────────────────────
La balance comptable récapitule tous les comptes avec leurs
mouvements (débits/crédits) et leurs soldes. Document obligatoire
permettant de vérifier l'équilibre comptable.

Spécificités SaaS LAIA Connect :
- Compte 706100 : Revenus SaaS récurrents (abonnements)
- Compte 512000 : Encaissements via Stripe
- TVA 20% sur prestations de services numériques

═══════════════════════════════════════════════════════════════
Document généré le ${now.toLocaleString('fr-FR')}
LAIA CONNECT - Plateforme SaaS pour instituts de beauté
═══════════════════════════════════════════════════════════════
`;

    downloadFile(content, `balance_comptable_LAIA_${formatDateLocal(now)}.txt`, 'text/plain;charset=utf-8;');
  };

  // 💾 Export format Sage/EBP/Ciel (format compatible logiciels comptables)
  const exportFormatSage = () => {
    const now = new Date();
    const filtered = getFilteredInvoices();

    // Format CSV compatible Sage/EBP : Journal, Date, Compte, Libellé, Débit, Crédit, Pièce
    const headers = ['Journal', 'Date', 'N° Compte', 'Libellé', 'Débit', 'Crédit', 'N° Pièce', 'Référence'];
    const rows: any[] = [];

    filtered.forEach((inv, index) => {
      const dateComptable = new Date(inv.createdAt);
      const dateStr = `${String(dateComptable.getDate()).padStart(2, '0')}/${String(dateComptable.getMonth() + 1).padStart(2, '0')}/${dateComptable.getFullYear()}`;
      const pieceRef = inv.invoiceNumber || `LAIA-${now.getFullYear()}-${String(index + 1).padStart(6, '0')}`;

      const montantTTC = inv.amount;
      const montantHT = montantTTC / 1.20;
      const montantTVA = montantTTC - montantHT;

      const orgName = inv.organization?.name || 'Organisation';
      const orgPlan = inv.organization?.plan || 'N/A';

      // Ligne 1: Débit Client (411)
      rows.push({
        'Journal': 'VTE',
        'Date': dateStr,
        'N° Compte': '411000',
        'Libellé': `Abonnement ${orgPlan} - ${orgName}`,
        'Débit': montantTTC.toFixed(2),
        'Crédit': '0.00',
        'N° Pièce': pieceRef,
        'Référence': pieceRef
      });

      // Ligne 2: Crédit Service SaaS (706100)
      rows.push({
        'Journal': 'VTE',
        'Date': dateStr,
        'N° Compte': '706100',
        'Libellé': `Service SaaS ${orgPlan}`,
        'Débit': '0.00',
        'Crédit': montantHT.toFixed(2),
        'N° Pièce': pieceRef,
        'Référence': pieceRef
      });

      // Ligne 3: Crédit TVA (44571)
      rows.push({
        'Journal': 'VTE',
        'Date': dateStr,
        'N° Compte': '445710',
        'Libellé': 'TVA collectée 20% (SaaS)',
        'Débit': '0.00',
        'Crédit': montantTVA.toFixed(2),
        'N° Pièce': pieceRef,
        'Référence': pieceRef
      });

      // Ligne 4: Débit Banque Stripe (512) pour encaissement
      rows.push({
        'Journal': 'BQ',
        'Date': dateStr,
        'N° Compte': '512000',
        'Libellé': `Encaissement Stripe - ${orgName}`,
        'Débit': montantTTC.toFixed(2),
        'Crédit': '0.00',
        'N° Pièce': pieceRef,
        'Référence': pieceRef
      });

      // Ligne 5: Crédit Client (411) pour solde
      rows.push({
        'Journal': 'BQ',
        'Date': dateStr,
        'N° Compte': '411000',
        'Libellé': `Encaissement - ${orgName}`,
        'Débit': '0.00',
        'Crédit': montantTTC.toFixed(2),
        'N° Pièce': pieceRef,
        'Référence': pieceRef
      });
    });

    // Générer le CSV avec point-virgule comme séparateur (standard français)
    const csv = [
      headers.join(';'),
      ...rows.map(row => headers.map(h => row[h] || '').join(';'))
    ].join('\n');

    downloadFile(csv, `export_sage_LAIA_${formatDateLocal(now)}.csv`, 'text/csv;charset=utf-8;');
  };

  return (
    <div className="space-y-6">
      {/* Sélection de période */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Période d'export</h3>
        <div className="flex gap-3">
          {[
            { value: 'month' as const, label: 'Mois en cours' },
            { value: 'quarter' as const, label: 'Trimestre en cours' },
            { value: 'year' as const, label: 'Année en cours' }
          ].map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                period === p.value
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Boutons d'export */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents comptables LAIA Connect</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={exportFEC}
            className="p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
            title="Fichier des Écritures Comptables (obligatoire)"
          >
            <FileText className="w-10 h-10 text-green-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-sm mb-1">FEC</p>
            <p className="text-xs text-gray-500">Format normalisé</p>
          </button>

          <button
            onClick={exportGrandLivre}
            className="p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <BookOpen className="w-10 h-10 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-sm mb-1">Grand Livre</p>
            <p className="text-xs text-gray-500">Comptes consolidés</p>
          </button>

          <button
            onClick={exportBalanceComptable}
            className="p-6 border-2 border-dashed border-cyan-300 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-all group"
            title="Balance de tous les comptes avec soldes"
          >
            <BarChart3 className="w-10 h-10 text-cyan-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-sm mb-1">Balance</p>
            <p className="text-xs text-gray-500">Synthèse</p>
          </button>

          <button
            onClick={exportJournalVentes}
            className="p-6 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <FileDown className="w-10 h-10 text-purple-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-sm mb-1">Journal Ventes</p>
            <p className="text-xs text-gray-500">Abonnements SaaS</p>
          </button>

          <button
            onClick={exportDeclarationTVA}
            className="p-6 border-2 border-dashed border-red-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all group"
          >
            <Receipt className="w-10 h-10 text-red-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-sm mb-1">Déclaration TVA</p>
            <p className="text-xs text-gray-500">Fiscalité SaaS</p>
          </button>

          <button
            onClick={exportFormatSage}
            className="p-6 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
            title="Format CSV pour Sage, EBP, Ciel"
          >
            <Download className="w-10 h-10 text-orange-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-sm mb-1">Format Sage</p>
            <p className="text-xs text-gray-500">CSV</p>
          </button>
        </div>

        {/* Statistiques */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Factures payées</p>
            <p className="text-2xl font-bold text-green-600">{getFilteredInvoices().length}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">CA TTC</p>
            <p className="text-2xl font-bold text-blue-600">
              {getFilteredInvoices().reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}€
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">TVA collectée</p>
            <p className="text-2xl font-bold text-purple-600">
              {(getFilteredInvoices().reduce((sum, inv) => sum + inv.amount, 0) * 0.20 / 1.20).toFixed(2)}€
            </p>
          </div>
        </div>
      </div>

      {/* Avertissement légal */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-2">📋 Obligations comptables LAIA Connect (SaaS)</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>FEC</strong> : Obligatoire en cas de contrôle fiscal (Article 47 A I du LPF)</li>
              <li><strong>Grand Livre</strong> : Conservation 10 ans (Article L123-22 du Code de commerce)</li>
              <li><strong>TVA sur encaissements</strong> : Applicable aux prestations SaaS</li>
              <li><strong>Déclaration TVA</strong> : Mensuelle ou trimestrielle selon CA</li>
              <li><strong>Conservation</strong> : Tous documents comptables 10 ans minimum</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

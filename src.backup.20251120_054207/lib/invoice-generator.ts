import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  client: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  services: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
  }>;
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  paymentMethod?: string;
  paymentStatus: 'paid' | 'pending';
  notes?: string;
}

export interface OrganizationInvoiceConfig {
  siteName: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  siret?: string;
  tvaNumber?: string | null;
  invoicePrefix?: string;
  invoiceLegalDiscount?: string;
  invoiceLegalPenalty?: string;
  invoiceLegalRecoveryFee?: string;
  invoiceLegalPaymentTerms?: string;
  invoiceLegalFooter?: string;
}

/**
 * Récupère la configuration de facturation d'une organisation depuis la base de données
 */
export async function getOrganizationConfig(organizationId: string): Promise<OrganizationInvoiceConfig> {
  try {
    const config = await prisma.organizationConfig.findUnique({
      where: { organizationId },
      select: {
        siteName: true,
        address: true,
        postalCode: true,
        city: true,
        phone: true,
        email: true,
        siret: true,
        tvaNumber: true,
        invoicePrefix: true,
        invoiceLegalDiscount: true,
        invoiceLegalPenalty: true,
        invoiceLegalRecoveryFee: true,
        invoiceLegalPaymentTerms: true,
        invoiceLegalFooter: true,
      }
    })

    if (!config) {
      // Si pas de config, créer une config par défaut
      const newConfig = await prisma.organizationConfig.create({
        data: {
          organizationId,
          siteName: 'Institut de Beauté',
          address: 'Adresse à configurer',
          postalCode: '00000',
          city: 'Ville',
          phone: '00 00 00 00 00',
          email: 'contact@institut.fr',
          invoicePrefix: 'FACT',
          invoiceLegalDiscount: 'Aucun escompte accordé pour paiement anticipé',
          invoiceLegalPenalty: 'En cas de retard de paiement : pénalités au taux de 3 fois le taux d\'intérêt légal',
          invoiceLegalRecoveryFee: 'Indemnité forfaitaire de 40€ pour frais de recouvrement en cas de retard',
          invoiceLegalPaymentTerms: 'Paiement à réception',
          invoiceLegalFooter: 'Facture à conserver 10 ans',
        },
        select: {
          siteName: true,
          address: true,
          postalCode: true,
          city: true,
          phone: true,
          email: true,
          siret: true,
          tvaNumber: true,
          invoicePrefix: true,
          invoiceLegalDiscount: true,
          invoiceLegalPenalty: true,
          invoiceLegalRecoveryFee: true,
          invoiceLegalPaymentTerms: true,
          invoiceLegalFooter: true,
        }
      })
      return newConfig as OrganizationInvoiceConfig
    }

    return config as OrganizationInvoiceConfig
  } catch (error) {
    console.error('Erreur lors de la récupération de la config organisation:', error)
    // Retourner une config par défaut en cas d'erreur
    return {
      siteName: 'Institut de Beauté',
      address: 'Adresse à configurer',
      postalCode: '00000',
      city: 'Ville',
      phone: '00 00 00 00 00',
      email: 'contact@institut.fr',
      invoicePrefix: 'FACT',
      invoiceLegalDiscount: 'Aucun escompte accordé pour paiement anticipé',
      invoiceLegalPenalty: 'En cas de retard de paiement : pénalités au taux de 3 fois le taux d\'intérêt légal',
      invoiceLegalRecoveryFee: 'Indemnité forfaitaire de 40€ pour frais de recouvrement en cas de retard',
      invoiceLegalPaymentTerms: 'Paiement à réception',
      invoiceLegalFooter: 'Facture à conserver 10 ans',
    }
  }
}

export function generateInvoiceNumber(date: Date = new Date(), reservationId?: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  // Si on a un ID de réservation, utiliser les 4 derniers caractères pour un numéro unique
  if (reservationId) {
    const uniqueId = reservationId.slice(-4).toUpperCase();
    return `LAIA-${year}${month}-${uniqueId}`;
  }

  // Sinon, générer un numéro séquentiel basé sur la date et l'heure
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `LAIA-${year}${month}${day}-${hours}${minutes}`;
}

export function calculateInvoiceTotals(services: InvoiceData['services']) {
  let totalHT = 0;
  let totalVAT = 0;

  services.forEach(service => {
    const serviceHT = service.quantity * service.unitPrice;
    const serviceVAT = serviceHT * (service.vatRate / 100);
    totalHT += serviceHT;
    totalVAT += serviceVAT;
  });

  return {
    totalHT: Math.round(totalHT * 100) / 100,
    totalVAT: Math.round(totalVAT * 100) / 100,
    totalTTC: Math.round((totalHT + totalVAT) * 100) / 100
  };
}

export function formatInvoiceHTML(invoice: InvoiceData, config?: OrganizationInvoiceConfig): string {
  const formattedDate = new Intl.DateTimeFormat('fr-FR').format(invoice.date);

  // Valeurs par défaut si config n'est pas fournie
  const orgName = config?.siteName || 'LAIA SKIN INSTITUT';
  const orgAddress = config?.address || '123 Rue de la Beauté';
  const orgPostalCode = config?.postalCode || '75000';
  const orgCity = config?.city || 'Paris';
  const orgPhone = config?.phone || '01 23 45 67 89';
  const orgEmail = config?.email || 'contact@laiaskin.com';
  const orgSiret = config?.siret || '123 456 789 00000';
  const orgVatNumber = config?.tvaNumber || 'FR12 345678900';

  // Mentions légales configurables
  const legalPaymentTerms = config?.invoiceLegalPaymentTerms || 'Paiement à réception de facture';
  const legalPenalty = config?.invoiceLegalPenalty || '3 fois le taux d\'intérêt légal';
  const legalRecoveryFee = config?.invoiceLegalRecoveryFee || '40€';
  const legalDiscount = config?.invoiceLegalDiscount || 'Aucun escompte accordé pour paiement anticipé';
  const legalFooter = config?.invoiceLegalFooter || 'TVA sur les encaissements - Auto-entrepreneur dispensé d\'immatriculation au RCS';

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Facture ${invoice.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .company-info { text-align: left; }
    .invoice-info { text-align: right; }
    .client-info { margin: 30px 0; padding: 20px; background: #f5f5f5; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #d4b5a0; color: white; }
    .totals { text-align: right; margin-top: 30px; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; }
    .paid-stamp { color: green; font-weight: bold; font-size: 18px; }
    .pending-stamp { color: orange; font-weight: bold; font-size: 18px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <h2>${orgName}</h2>
      <p>${orgAddress}<br>${orgPostalCode} ${orgCity}<br>
      Tél: ${orgPhone}<br>
      Email: ${orgEmail}<br>
      ${orgSiret ? `SIRET: ${orgSiret}<br>` : ''}
      ${orgVatNumber ? `TVA: ${orgVatNumber}` : ''}</p>
    </div>
    <div class="invoice-info">
      <p><strong>Facture N°:</strong> ${invoice.invoiceNumber}<br>
      <strong>Date:</strong> ${formattedDate}<br>
      <span class="${invoice.paymentStatus === 'paid' ? 'paid-stamp' : 'pending-stamp'}">
        ${invoice.paymentStatus === 'paid' ? 'PAYÉE' : 'EN ATTENTE'}
      </span></p>
    </div>
  </div>

  <div class="client-info">
    <h3>Client</h3>
    <p><strong>${invoice.client.name}</strong><br>
    ${invoice.client.email}<br>
    ${invoice.client.phone || ''}<br>
    ${invoice.client.address || ''}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Désignation</th>
        <th>Quantité</th>
        <th>Prix unitaire HT</th>
        <th>TVA</th>
        <th>Total HT</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.services.map(service => `
        <tr>
          <td>${service.name}</td>
          <td>${service.quantity}</td>
          <td>${service.unitPrice.toFixed(2)}€</td>
          <td>${service.vatRate}%</td>
          <td>${(service.quantity * service.unitPrice).toFixed(2)}€</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <table style="width: auto; margin-left: auto;">
      <tr>
        <td><strong>Total HT:</strong></td>
        <td style="text-align: right; padding-left: 20px;">${invoice.totalHT.toFixed(2)}€</td>
      </tr>
      <tr>
        <td><strong>TVA 20%:</strong></td>
        <td style="text-align: right; padding-left: 20px;">${invoice.totalVAT.toFixed(2)}€</td>
      </tr>
      <tr style="font-size: 1.2em; font-weight: bold;">
        <td><strong>Total TTC:</strong></td>
        <td style="text-align: right; padding-left: 20px;">${invoice.totalTTC.toFixed(2)}€</td>
      </tr>
    </table>
  </div>

  ${invoice.paymentMethod ? `
  <div style="margin-top: 30px;">
    <p><strong>Mode de paiement:</strong> ${invoice.paymentMethod}</p>
  </div>
  ` : ''}

  ${invoice.notes ? `
  <div style="margin-top: 30px; padding: 15px; background: #f9f9f9;">
    <p><strong>Notes:</strong><br>${invoice.notes}</p>
  </div>
  ` : ''}

  <div class="footer">
    <h3 style="margin-bottom: 10px; font-size: 14px; color: #333;">Mentions légales (Art. L441-9 du Code de commerce)</h3>
    <div style="font-size: 11px; line-height: 1.6; color: #555;">
      <p style="margin: 5px 0;"><strong>Conditions de paiement :</strong><br>
      ${legalPaymentTerms.split('\n').map(line => `${line}`).join('<br>')}</p>

      <p style="margin: 10px 0 5px 0;"><strong>Escompte pour paiement anticipé :</strong><br>
      ${legalDiscount.split('\n').map(line => `${line}`).join('<br>')}</p>

      <p style="margin: 10px 0 5px 0;"><strong>Pénalités de retard :</strong><br>
      ${legalPenalty.split('\n').map(line => `${line}`).join('<br>')}</p>

      <p style="margin: 10px 0 5px 0;"><strong>Indemnité forfaitaire pour frais de recouvrement :</strong><br>
      ${legalRecoveryFee.split('\n').map(line => `${line}`).join('<br>')}</p>

      <p style="margin: 15px 0 5px 0; font-size: 10px; color: #666;">
      ${legalFooter.split('\n').map(line => `${line}`).join('<br>')}</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateCSVExport(data: any[], headers: string[]): string {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Échapper les guillemets et encapsuler si nécessaire
      if (value && value.toString().includes(',')) {
        return `"${value.toString().replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
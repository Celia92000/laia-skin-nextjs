import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { log } from '@/lib/logger';

/**
 * GET /api/admin/laia-invoices/[id]/download
 * Télécharger une facture d'abonnement LAIA en PDF
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId || !decoded.organizationId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    const { id } = await context.params

    // Récupérer la facture
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        organizationId: decoded.organizationId
      },
      include: {
        organization: {
          select: {
            name: true,
            address: true,
            city: true,
            postalCode: true,
            country: true,
            siret: true,
            ownerEmail: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }

    // Récupérer les settings de facturation
    const invoiceSettings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            'invoiceCompanyName',
            'invoiceAddress',
            'invoicePostalCode',
            'invoiceCity',
            'invoiceCountry',
            'invoiceSiret',
            'invoiceVatNumber',
            'invoiceCapital',
            'invoiceRcs',
            'invoiceEmail',
            'invoicePhone'
          ]
        }
      }
    })

    const settings = invoiceSettings.reduce((acc: any, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {})

    // Générer le HTML de la facture
    const html = generateInvoiceHTML(invoice, settings)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="Facture_${invoice.invoiceNumber}.html"`
      }
    })

  } catch (error) {
    log.error('Erreur téléchargement facture LAIA:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

function generateInvoiceHTML(invoice: any, settings: any): string {
  const lineItems = invoice.metadata?.lineItems || []

  // Utiliser les settings ou des valeurs par défaut
  const companyName = settings.invoiceCompanyName || 'LAIA SAS'
  const address = settings.invoiceAddress || '123 Avenue de l\'Innovation'
  const postalCode = settings.invoicePostalCode || '75008'
  const city = settings.invoiceCity || 'Paris'
  const country = settings.invoiceCountry || 'France'
  const siret = settings.invoiceSiret || '123 456 789 00012'
  const vatNumber = settings.invoiceVatNumber || 'FR12345678900'
  const capital = settings.invoiceCapital || '10 000€'
  const rcs = settings.invoiceRcs || 'RCS Paris 123 456 789'
  const email = settings.invoiceEmail || 'facturation@laia.fr'
  const phone = settings.invoicePhone || '+33 6 31 10 75 31'

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${invoice.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #7c3aed;
    }

    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #7c3aed;
    }

    .invoice-info {
      text-align: right;
    }

    .invoice-number {
      font-size: 24px;
      font-weight: bold;
      color: #7c3aed;
      margin-bottom: 5px;
    }

    .invoice-date {
      color: #666;
      font-size: 14px;
    }

    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
    }

    .party {
      flex: 1;
    }

    .party h3 {
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .party-details {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
    }

    .party-details p {
      margin: 3px 0;
      font-size: 14px;
    }

    .party-details strong {
      display: block;
      font-size: 16px;
      color: #111;
      margin-bottom: 5px;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    .items-table thead {
      background: #f3f4f6;
    }

    .items-table th {
      padding: 12px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }

    .items-table td {
      padding: 15px 12px;
      border-bottom: 1px solid #f3f4f6;
      font-size: 14px;
    }

    .items-table tbody tr:hover {
      background: #fafafa;
    }

    .text-right {
      text-align: right;
    }

    .total-section {
      margin-left: auto;
      width: 300px;
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }

    .total-row.final {
      border-top: 2px solid #7c3aed;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 18px;
      font-weight: bold;
      color: #7c3aed;
    }

    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-paid {
      background: #d1fae5;
      color: #065f46;
    }

    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-overdue {
      background: #fee2e2;
      color: #991b1b;
    }

    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 12px;
    }

    .footer p {
      margin: 5px 0;
    }

    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #7c3aed;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .print-button:hover {
      background: #6d28d9;
    }

    @media print {
      body {
        padding: 20px;
      }

      .print-button {
        display: none;
      }
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">🖨️ Imprimer / Sauvegarder en PDF</button>

  <div class="header">
    <div class="logo">${companyName}</div>
    <div class="invoice-info">
      <div class="invoice-number">Facture ${invoice.invoiceNumber}</div>
      <div class="invoice-date">
        Date d'émission : ${new Date(invoice.issueDate).toLocaleDateString('fr-FR')}<br>
        Date d'échéance : ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
      </div>
      ${invoice.status === 'PAID' ? `<div style="margin-top: 10px;"><span class="status-badge status-paid">✓ Payée</span></div>` : ''}
      ${invoice.status === 'PENDING' ? `<div style="margin-top: 10px;"><span class="status-badge status-pending">En attente</span></div>` : ''}
      ${invoice.status === 'OVERDUE' ? `<div style="margin-top: 10px;"><span class="status-badge status-overdue">En retard</span></div>` : ''}
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>De</h3>
      <div class="party-details">
        <strong>${companyName}</strong>
        <p>${address}</p>
        <p>${postalCode} ${city}, ${country}</p>
        <p>SIRET : ${siret}</p>
        <p>Email : ${email}</p>
      </div>
    </div>

    <div class="party">
      <h3>À</h3>
      <div class="party-details">
        <strong>${invoice.organization.name}</strong>
        ${invoice.organization.address ? `<p>${invoice.organization.address}</p>` : ''}
        ${invoice.organization.postalCode && invoice.organization.city ? `<p>${invoice.organization.postalCode} ${invoice.organization.city}</p>` : ''}
        ${invoice.organization.country ? `<p>${invoice.organization.country}</p>` : ''}
        ${invoice.organization.siret ? `<p>SIRET : ${invoice.organization.siret}</p>` : ''}
        ${invoice.organization.ownerEmail ? `<p>Email : ${invoice.organization.ownerEmail}</p>` : ''}
      </div>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Description</th>
        <th class="text-right">Quantité</th>
        <th class="text-right">Prix unitaire</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${lineItems.length > 0 ? lineItems.map((item: any) => `
        <tr>
          <td>${item.description}</td>
          <td class="text-right">${item.quantity || 1}</td>
          <td class="text-right">${(item.unitPrice || item.total || 0).toFixed(2)}€</td>
          <td class="text-right"><strong>${(item.total || item.unitPrice || 0).toFixed(2)}€</strong></td>
        </tr>
      `).join('') : `
        <tr>
          <td>${invoice.description}</td>
          <td class="text-right">1</td>
          <td class="text-right">${invoice.amount.toFixed(2)}€</td>
          <td class="text-right"><strong>${invoice.amount.toFixed(2)}€</strong></td>
        </tr>
      `}
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-row">
      <span>Sous-total HT</span>
      <span>${(invoice.amount / 1.20).toFixed(2)}€</span>
    </div>
    <div class="total-row">
      <span>TVA (20%)</span>
      <span>${(invoice.amount - invoice.amount / 1.20).toFixed(2)}€</span>
    </div>
    <div class="total-row final">
      <span>Total TTC</span>
      <span>${invoice.amount.toFixed(2)}€</span>
    </div>
  </div>

  ${invoice.paidAt ? `
    <div style="margin-top: 30px; padding: 15px; background: #d1fae5; border-left: 4px solid #059669; border-radius: 8px;">
      <p style="color: #065f46; font-weight: 600; margin: 0;">
        ✓ Facture payée le ${new Date(invoice.paidAt).toLocaleDateString('fr-FR')}
      </p>
    </div>
  ` : ''}

  <div class="footer">
    <p><strong>${companyName}</strong> - Capital social : ${capital} - ${rcs}</p>
    <p>TVA intracommunautaire : ${vatNumber}</p>
    <p>Email : ${email} - Tél : ${phone}</p>
    <p style="margin-top: 15px; font-style: italic;">
      En cas de retard de paiement, des pénalités de 3 fois le taux d'intérêt légal seront appliquées.<br>
      Indemnité forfaitaire pour frais de recouvrement : 40€
    </p>
  </div>
</body>
</html>
  `.trim()
}

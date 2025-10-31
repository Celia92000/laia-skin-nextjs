import jsPDF from 'jspdf';

interface GiftCardData {
  code: string;
  amount: number;
  balance: number;
  purchasedFor?: string;
  purchasedBy?: string;
  message?: string;
  createdAt: string;
  expiryDate?: string;
  purchaser?: {
    name: string;
    email?: string;
  };
}

interface GiftCardSettings {
  physicalCardTitle?: string;
  physicalCardSubtitle?: string;
  cardColorFrom?: string;
  cardColorTo?: string;
  emailFooter?: string;
}

/**
 * Génère un PDF de carte cadeau pour impression
 */
export async function generateGiftCardPDF(
  card: GiftCardData,
  settings?: GiftCardSettings
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [150, 100] // Format carte de crédit agrandi
  });

  // Couleurs
  const primaryColor = settings?.cardColorFrom || '#ec4899'; // rose par défaut
  const secondaryColor = settings?.cardColorTo || '#be185d'; // rose foncé

  // Convertir hex to RGB pour jsPDF
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 236, g: 72, b: 153 };
  };

  const color1 = hexToRgb(primaryColor);
  const color2 = hexToRgb(secondaryColor);

  // Fond dégradé (simulé avec rectangles)
  for (let i = 0; i < 100; i++) {
    const ratio = i / 100;
    const r = Math.round(color1.r + (color2.r - color1.r) * ratio);
    const g = Math.round(color1.g + (color2.g - color1.g) * ratio);
    const b = Math.round(color1.b + (color2.b - color1.b) * ratio);

    doc.setFillColor(r, g, b);
    doc.rect(0, i, 150, 1, 'F');
  }

  // Titre
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  const title = settings?.physicalCardTitle || 'CARTE CADEAU';
  doc.text(title, 75, 25, { align: 'center' });

  // Sous-titre
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  const subtitle = settings?.physicalCardSubtitle || 'Laia Skin Institut';
  doc.text(subtitle, 75, 35, { align: 'center' });

  // Montant (encadré blanc)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(45, 42, 60, 20, 3, 3, 'F');
  doc.setTextColor(color2.r, color2.g, color2.b);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(`${card.amount}€`, 75, 55, { align: 'center' });

  // Code de la carte (encadré)
  doc.setFillColor(255, 255, 255, 0.2);
  doc.roundedRect(20, 67, 110, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('courier', 'bold');
  doc.text(`Code: ${card.code}`, 75, 75, { align: 'center' });

  // Informations supplémentaires
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  let yPos = 85;

  if (card.purchasedFor) {
    doc.text(`Pour: ${card.purchasedFor}`, 75, yPos, { align: 'center' });
    yPos += 4;
  }

  if (card.purchaser?.name) {
    doc.text(`De la part de: ${card.purchaser.name}`, 75, yPos, { align: 'center' });
    yPos += 4;
  }

  // Date d'expiration
  if (card.expiryDate) {
    const expiryDate = new Date(card.expiryDate);
    doc.text(
      `Valable jusqu'au ${expiryDate.toLocaleDateString('fr-FR')}`,
      75,
      95,
      { align: 'center' }
    );
  }

  // Message personnalisé (si présent, sur une 2ème page)
  if (card.message && card.message.trim().length > 0) {
    doc.addPage('landscape', [150, 100]);

    // Fond blanc
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 150, 100, 'F');

    // Bordure rose
    doc.setDrawColor(color1.r, color1.g, color1.b);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 140, 90);

    // Titre du message
    doc.setTextColor(color2.r, color2.g, color2.b);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Message personnel', 75, 20, { align: 'center' });

    // Message
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    // Découper le message en lignes
    const maxWidth = 130;
    const lines = doc.splitTextToSize(card.message, maxWidth);
    let messageY = 35;

    lines.forEach((line: string) => {
      if (messageY < 85) {
        doc.text(line, 75, messageY, { align: 'center' });
        messageY += 6;
      }
    });
  }

  return doc;
}

/**
 * Télécharge le PDF généré
 */
export async function downloadGiftCardPDF(
  card: GiftCardData,
  settings?: GiftCardSettings
) {
  const doc = await generateGiftCardPDF(card, settings);
  const fileName = `Carte_Cadeau_${card.code.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
}

/**
 * Génère un PDF contenant plusieurs cartes cadeaux (format impression batch)
 */
export async function generateMultipleGiftCardsPDF(
  cards: GiftCardData[],
  settings?: GiftCardSettings
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let pageCount = 0;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    if (i > 0) {
      doc.addPage('portrait', 'a4');
    }

    pageCount++;

    // Position centrée sur la page A4
    const xOffset = 30;
    const yOffset = 50;

    // Créer une version temporaire du PDF pour cette carte
    const singleDoc = await generateGiftCardPDF(card, settings);

    // Note: jsPDF ne supporte pas nativement l'import d'autres PDF
    // Pour une vraie implémentation multi-cartes, il faudrait redessiner chaque carte

    // Pour l'instant, on crée une page par carte avec un format plus petit
    const color1 = { r: 236, g: 72, b: 153 };
    const color2 = { r: 190, g: 24, b: 93 };

    // Dessiner la carte au centre de la page A4
    for (let j = 0; j < 100; j++) {
      const ratio = j / 100;
      const r = Math.round(color1.r + (color2.r - color1.r) * ratio);
      const g = Math.round(color1.g + (color2.g - color1.g) * ratio);
      const b = Math.round(color1.b + (color2.b - color1.b) * ratio);

      doc.setFillColor(r, g, b);
      doc.rect(xOffset, yOffset + j, 150, 1, 'F');
    }

    // Contenu de la carte
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('CARTE CADEAU', xOffset + 75, yOffset + 25, { align: 'center' });

    doc.setFontSize(16);
    doc.text('Laia Skin Institut', xOffset + 75, yOffset + 35, { align: 'center' });

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(xOffset + 45, yOffset + 42, 60, 20, 3, 3, 'F');
    doc.setTextColor(color2.r, color2.g, color2.b);
    doc.setFontSize(32);
    doc.text(`${card.amount}€`, xOffset + 75, yOffset + 55, { align: 'center' });

    doc.setFillColor(255, 255, 255, 0.2);
    doc.roundedRect(xOffset + 20, yOffset + 67, 110, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('courier', 'bold');
    doc.text(`Code: ${card.code}`, xOffset + 75, yOffset + 75, { align: 'center' });

    // Numéro de page
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Carte ${i + 1} / ${cards.length}`, 105, 285, { align: 'center' });
  }

  return doc;
}

/**
 * Télécharge un PDF avec plusieurs cartes
 */
export async function downloadMultipleGiftCardsPDF(
  cards: GiftCardData[],
  settings?: GiftCardSettings
) {
  const doc = await generateMultipleGiftCardsPDF(cards, settings);
  const fileName = `Cartes_Cadeaux_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

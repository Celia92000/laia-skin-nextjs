/**
 * Service d'envoi SMS via Brevo (anciennement SendinBlue)
 * Documentation: https://developers.brevo.com/reference/sendtransacsms
 */

interface SendSMSParams {
  phoneNumber: string;
  message: string;
  organizationName?: string;
}

interface SendSMSResult {
  success: boolean;
  messageId?: string;
  status?: 'sent' | 'delivered' | 'failed';
  cost?: number;
  errorMessage?: string;
}

/**
 * Envoie un SMS via l'API Brevo
 */
export async function sendSMS({
  phoneNumber,
  message,
  organizationName = 'LAIA'
}: SendSMSParams): Promise<SendSMSResult> {
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!brevoApiKey) {
    console.error('BREVO_API_KEY non configurée');
    return {
      success: false,
      status: 'failed',
      errorMessage: 'API Brevo non configurée'
    };
  }

  // Nettoyer le numéro de téléphone
  const cleanPhone = cleanPhoneNumber(phoneNumber);

  if (!cleanPhone) {
    return {
      success: false,
      status: 'failed',
      errorMessage: 'Numéro de téléphone invalide'
    };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: organizationName.substring(0, 11), // Max 11 caractères pour l'expéditeur
        recipient: cleanPhone,
        content: message,
        type: 'transactional'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur Brevo SMS:', errorData);

      return {
        success: false,
        status: 'failed',
        errorMessage: errorData.message || 'Erreur lors de l\'envoi du SMS'
      };
    }

    const data = await response.json();

    return {
      success: true,
      messageId: data.reference,
      status: 'sent', // Brevo confirme l'envoi, la livraison sera mise à jour via webhook
      cost: 0.035 // Coût moyen d'un SMS en France via Brevo
    };
  } catch (error: any) {
    console.error('Exception lors de l\'envoi SMS:', error);

    return {
      success: false,
      status: 'failed',
      errorMessage: error.message || 'Erreur inconnue'
    };
  }
}

/**
 * Envoie des SMS en masse (campagne)
 */
export async function sendBulkSMS(
  recipients: Array<{ phoneNumber: string; message: string }>,
  organizationName?: string
): Promise<{
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  results: SendSMSResult[];
}> {
  const results: SendSMSResult[] = [];
  let totalSent = 0;
  let totalDelivered = 0;
  let totalFailed = 0;

  // Envoyer les SMS en parallèle par batch de 10
  const batchSize = 10;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(recipient =>
        sendSMS({
          phoneNumber: recipient.phoneNumber,
          message: recipient.message,
          organizationName
        })
      )
    );

    results.push(...batchResults);

    // Compter les résultats
    batchResults.forEach(result => {
      if (result.success) {
        totalSent++;
        if (result.status === 'delivered') {
          totalDelivered++;
        }
      } else {
        totalFailed++;
      }
    });

    // Pause de 100ms entre chaque batch pour ne pas surcharger l'API
    if (i + batchSize < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return {
    totalSent,
    totalDelivered,
    totalFailed,
    results
  };
}

/**
 * Nettoie et formate un numéro de téléphone au format international
 */
function cleanPhoneNumber(phone: string): string | null {
  if (!phone) return null;

  // Supprimer tous les caractères non numériques sauf le +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Si le numéro commence par 0, remplacer par +33
  if (cleaned.startsWith('0')) {
    cleaned = '+33' + cleaned.substring(1);
  }

  // Si le numéro ne commence pas par +, ajouter +33 (France par défaut)
  if (!cleaned.startsWith('+')) {
    cleaned = '+33' + cleaned;
  }

  // Vérifier que le numéro est valide (au moins 10 chiffres après le code pays)
  if (cleaned.length < 12) {
    return null;
  }

  return cleaned;
}

/**
 * Remplace les variables dans un message SMS
 */
export function replaceVariables(
  message: string,
  variables: {
    prenom?: string;
    nom?: string;
    dateRDV?: string;
    heureRDV?: string;
    service?: string;
    institut?: string;
    points?: number;
    lienReservation?: string;
  }
): string {
  let result = message;

  // Remplacer toutes les variables
  if (variables.prenom) result = result.replace(/\{\{prenom\}\}/g, variables.prenom);
  if (variables.nom) result = result.replace(/\{\{nom\}\}/g, variables.nom);
  if (variables.dateRDV) result = result.replace(/\{\{dateRDV\}\}/g, variables.dateRDV);
  if (variables.heureRDV) result = result.replace(/\{\{heureRDV\}\}/g, variables.heureRDV);
  if (variables.service) result = result.replace(/\{\{service\}\}/g, variables.service);
  if (variables.institut) result = result.replace(/\{\{institut\}\}/g, variables.institut);
  if (variables.points !== undefined) result = result.replace(/\{\{points\}\}/g, String(variables.points));
  if (variables.lienReservation) result = result.replace(/\{\{lienReservation\}\}/g, variables.lienReservation);

  return result;
}

/**
 * Calcule le nombre de SMS nécessaires pour un message
 */
export function calculateSMSCount(message: string): number {
  const length = message.length;

  if (length === 0) return 0;
  if (length <= 160) return 1;
  if (length <= 306) return 2; // 2 SMS = 153 chars chacun
  if (length <= 459) return 3; // 3 SMS = 153 chars chacun

  return Math.ceil(length / 153);
}

/**
 * Calcule le coût d'un message SMS
 */
export function calculateSMSCost(message: string): number {
  const count = calculateSMSCount(message);
  return count * 0.035; // 0.035€ par SMS via Brevo
}

import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { prisma } from './prisma';
import { log } from './logger';

interface EmailConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
}

// Configuration IMAP pour Gandi
export const GANDI_IMAP_CONFIG: EmailConfig = {
  user: process.env.GANDI_EMAIL || 'contact@laiaconnect.fr',
  password: process.env.GANDI_EMAIL_PASSWORD || '',
  host: 'mail.gandi.net',
  port: 993,
  tls: true
};

/**
 * Extrait le numéro de ticket depuis le sujet de l'email
 * Exemples de sujets :
 * - "Re: TICKET-2025-001 - Problème de connexion"
 * - "Re: Ticket TICKET-2025-001"
 * - "TICKET-2025-001"
 */
function extractTicketNumber(subject: string): string | null {
  const match = subject.match(/TICKET-\d{4}-\d{3,}/i)
  return match ? match[0].toUpperCase() : null
}

/**
 * Nettoie le contenu de l'email pour extraire seulement la nouvelle réponse
 * (retire les citations d'emails précédents)
 */
function cleanEmailContent(text: string): string {
  // Supprimer les citations d'emails (lignes commençant par ">")
  const lines = text.split('\n')
  const cleanedLines = []

  for (const line of lines) {
    // Arrêter si on rencontre une ligne de citation
    if (line.trim().startsWith('>')) break
    if (line.includes('Le ') && line.includes('a écrit')) break
    if (line.includes('On ') && line.includes('wrote:')) break
    if (line.includes('From:') && line.includes('Sent:')) break
    if (line.includes('-----Message d\'origine-----')) break

    cleanedLines.push(line)
  }

  return cleanedLines.join('\n').trim()
}

export class EmailSyncService {
  private imap: Imap | null = null;
  private config: EmailConfig;

  constructor(config?: EmailConfig) {
    this.config = config || GANDI_IMAP_CONFIG;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap = new Imap({
        user: this.config.user,
        password: this.config.password,
        host: this.config.host,
        port: this.config.port,
        tls: this.config.tls,
        tlsOptions: { rejectUnauthorized: false }
      });

      this.imap.once('ready', () => {
        console.log('Connexion IMAP établie avec Gandi');
        resolve();
      });

      this.imap.once('error', (err: Error) => {
        console.error('Erreur IMAP:', err);
        reject(err);
      });

      this.imap.connect();
    });
  }

  async syncTicketEmails(): Promise<{ processed: number; errors: number }> {
    if (!this.imap) {
      throw new Error('Non connecté à IMAP');
    }

    let processed = 0;
    let errors = 0;

    return new Promise((resolve, reject) => {
      this.imap!.openBox('INBOX', false, (err, box) => {
        if (err) {
          log.error('[Email Sync] Erreur ouverture INBOX:', err);
          reject(err);
          return;
        }

        log.info(`[Email Sync] INBOX ouverte (${box.messages.total} messages)`);

        // Chercher les emails non lus des dernières 24h
        const searchCriteria = ['UNSEEN'];

        this.imap!.search(searchCriteria, (err, results) => {
          if (err) {
            log.error('[Email Sync] Erreur recherche:', err);
            reject(err);
            return;
          }

          if (!results || results.length === 0) {
            log.info('[Email Sync] Aucun nouvel email');
            resolve({ processed: 0, errors: 0 });
            return;
          }

          log.info(`[Email Sync] ${results.length} nouveaux emails trouvés`);

          const fetch = this.imap!.fetch(results, {
            bodies: '',
            struct: true,
            markSeen: true
          });

          fetch.on('message', (msg, seqno) => {
            msg.on('body', (stream) => {
              simpleParser(stream as any, async (err, parsed) => {
                if (err) {
                  log.error('[Email Sync] Erreur parsing email:', err);
                  errors++;
                  return;
                }

                try {
                  const from = parsed.from?.value?.[0]?.address || '';
                  const subject = parsed.subject || '';
                  const text = parsed.text || '';

                  log.info(`[Email Sync] Email #${seqno} - De: ${from} - Sujet: ${subject}`);

                  // Extraire le numéro de ticket
                  const ticketNumber = extractTicketNumber(subject);

                  if (!ticketNumber) {
                    log.info(`[Email Sync] Pas de numéro de ticket trouvé dans: "${subject}"`);
                    return;
                  }

                  log.info(`[Email Sync] Ticket trouvé: ${ticketNumber}`);

                  // Chercher le ticket dans la base
                  const ticket = await prisma.supportTicket.findFirst({
                    where: { ticketNumber },
                    include: {
                      createdBy: {
                        select: { id: true, email: true }
                      }
                    }
                  });

                  if (!ticket) {
                    log.warn(`[Email Sync] Ticket ${ticketNumber} non trouvé en base`);
                    return;
                  }

                  // Vérifier que l'email vient bien du créateur du ticket
                  const senderEmail = from.toLowerCase();
                  if (senderEmail !== ticket.createdBy.email.toLowerCase()) {
                    log.warn(`[Email Sync] Email de ${senderEmail} ne correspond pas au créateur ${ticket.createdBy.email}`);
                    return;
                  }

                  // Nettoyer le contenu de l'email
                  const cleanedContent = cleanEmailContent(text);

                  if (!cleanedContent || cleanedContent.length < 10) {
                    log.warn(`[Email Sync] Contenu de l'email trop court ou vide`);
                    return;
                  }

                  // Vérifier qu'on n'a pas déjà ce message
                  const existingMessage = await prisma.ticketMessage.findFirst({
                    where: {
                      ticketId: ticket.id,
                      message: cleanedContent,
                      authorId: ticket.createdBy.id
                    }
                  });

                  if (existingMessage) {
                    log.info(`[Email Sync] Message déjà existant pour ${ticketNumber}`);
                    return;
                  }

                  // Ajouter le message au ticket
                  await prisma.ticketMessage.create({
                    data: {
                      ticketId: ticket.id,
                      authorId: ticket.createdBy.id,
                      message: cleanedContent,
                      isInternal: false
                    }
                  });

                  // Mettre à jour le statut du ticket si nécessaire
                  if (ticket.status === 'WAITING_CUSTOMER') {
                    await prisma.supportTicket.update({
                      where: { id: ticket.id },
                      data: { status: 'IN_PROGRESS' }
                    });
                  }

                  log.info(`[Email Sync] ✅ Réponse ajoutée au ticket ${ticketNumber}`);
                  processed++;

                } catch (error) {
                  log.error('[Email Sync] Erreur traitement email:', error);
                  errors++;
                }
              });
            });
          });

          fetch.once('end', () => {
            log.info(`[Email Sync] Synchronisation terminée - ${processed} traités, ${errors} erreurs`);
            resolve({ processed, errors });
          });

          fetch.once('error', (err) => {
            log.error('[Email Sync] Erreur fetch:', err);
            reject(err);
          });
        });
      });
    });
  }

  disconnect(): void {
    if (this.imap) {
      this.imap.end();
      this.imap = null;
    }
  }

}

/**
 * Fonction utilitaire pour synchroniser les emails de tickets
 * À appeler depuis un cron job ou endpoint API
 */
export async function syncTicketEmailsFromGandi(): Promise<{
  success: boolean
  processed: number
  errors: number
}> {
  const sync = new EmailSyncService();

  try {
    log.info('[Email Sync] Début de la synchronisation...');
    await sync.connect();
    const result = await sync.syncTicketEmails();
    sync.disconnect();
    log.info('[Email Sync] Synchronisation terminée avec succès');
    return { success: true, ...result };
  } catch (error) {
    log.error('[Email Sync] Erreur de synchronisation:', error);
    sync.disconnect();
    return { success: false, processed: 0, errors: 1 };
  }
}
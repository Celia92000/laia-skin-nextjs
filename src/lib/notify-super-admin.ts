/**
 * Notifications email pour le SUPER_ADMIN
 * Envoi automatique quand événements importants se produisent
 */

import { sendEmail } from '@/lib/email-service';

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'contact@laiaconnect.fr';

interface NotificationData {
  type: 'new_client' | 'new_organization' | 'new_demo_booking' | 'new_lead';
  subject: string;
  details: Record<string, any>;
}

/**
 * Envoie une notification email au SUPER_ADMIN
 */
export async function notifySuperAdmin(data: NotificationData): Promise<void> {
  try {
    let emailContent = '';

    switch (data.type) {
      case 'new_client':
        emailContent = `
          <h2>🎉 Nouveau client créé</h2>
          <p><strong>Nom:</strong> ${data.details.clientName}</p>
          <p><strong>Email:</strong> ${data.details.clientEmail}</p>
          <p><strong>Téléphone:</strong> ${data.details.clientPhone || 'Non renseigné'}</p>
          <p><strong>Organisation:</strong> ${data.details.organizationName}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        `;
        break;

      case 'new_organization':
        emailContent = `
          <h2>🏢 Nouvelle organisation créée</h2>
          <p><strong>Nom:</strong> ${data.details.organizationName}</p>
          <p><strong>Email admin:</strong> ${data.details.adminEmail}</p>
          <p><strong>Plan:</strong> ${data.details.plan}</p>
          <p><strong>Statut:</strong> ${data.details.status}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        `;
        break;

      case 'new_demo_booking':
        emailContent = `
          <h2>📅 Nouvelle réservation de démo</h2>
          <p><strong>Nom:</strong> ${data.details.contactName}</p>
          <p><strong>Email:</strong> ${data.details.contactEmail}</p>
          <p><strong>Téléphone:</strong> ${data.details.contactPhone || 'Non renseigné'}</p>
          <p><strong>Entreprise:</strong> ${data.details.companyName || 'Non renseigné'}</p>
          <p><strong>Date souhaitée:</strong> ${data.details.preferredDate || 'Non précisée'}</p>
          <p><strong>Message:</strong> ${data.details.message || 'Aucun message'}</p>
        `;
        break;

      case 'new_lead':
        emailContent = `
          <h2>💼 Nouveau lead enregistré</h2>
          <p><strong>Nom:</strong> ${data.details.leadName}</p>
          <p><strong>Email:</strong> ${data.details.leadEmail}</p>
          <p><strong>Téléphone:</strong> ${data.details.leadPhone || 'Non renseigné'}</p>
          <p><strong>Source:</strong> ${data.details.source || 'Non renseignée'}</p>
          <p><strong>Statut:</strong> ${data.details.status || 'NOUVEAU'}</p>
        `;
        break;

      default:
        emailContent = `
          <h2>Nouvelle notification</h2>
          <p>${JSON.stringify(data.details, null, 2)}</p>
        `;
    }

    // Ajouter footer commun
    emailContent += `
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        Cette notification automatique a été envoyée depuis LAIA Connect.
        <br>
        <a href="https://laiaconnect.fr/super-admin">Accéder au tableau de bord</a>
      </p>
    `;

    await sendEmail({
      to: SUPER_ADMIN_EMAIL,
      subject: data.subject,
      html: emailContent,
    });

    console.log(`✅ Notification envoyée au SUPER_ADMIN: ${data.subject}`);
  } catch (error) {
    // Ne pas bloquer l'exécution si l'email échoue
    console.error('❌ Erreur envoi notification SUPER_ADMIN:', error);
  }
}

/**
 * Raccourcis pour notifications fréquentes
 */
export const SuperAdminNotifications = {
  newClient: async (client: any, organization: any) => {
    await notifySuperAdmin({
      type: 'new_client',
      subject: `🎉 Nouveau client: ${client.name} - ${organization.name}`,
      details: {
        clientName: client.name,
        clientEmail: client.email,
        clientPhone: client.phone,
        organizationName: organization.name,
      },
    });
  },

  newOrganization: async (organization: any, admin: any) => {
    await notifySuperAdmin({
      type: 'new_organization',
      subject: `🏢 Nouvelle organisation: ${organization.name}`,
      details: {
        organizationName: organization.name,
        adminEmail: admin.email,
        plan: organization.plan,
        status: organization.status,
      },
    });
  },

  newDemoBooking: async (booking: any) => {
    await notifySuperAdmin({
      type: 'new_demo_booking',
      subject: `📅 Nouvelle demande de démo: ${booking.contactName}`,
      details: {
        contactName: booking.contactName,
        contactEmail: booking.contactEmail,
        contactPhone: booking.contactPhone,
        companyName: booking.companyName,
        preferredDate: booking.preferredDate,
        message: booking.message,
      },
    });
  },

  newLead: async (lead: any) => {
    await notifySuperAdmin({
      type: 'new_lead',
      subject: `💼 Nouveau lead: ${lead.name}`,
      details: {
        leadName: lead.name,
        leadEmail: lead.email,
        leadPhone: lead.phone,
        source: lead.source,
        status: lead.status,
      },
    });
  },
};

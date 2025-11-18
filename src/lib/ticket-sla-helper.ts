/**
 * Helper pour gérer les SLA des tickets de support
 * Utilisé lors de la création/modification des tickets
 */

import { prisma } from '@/lib/prisma'
import { calculateTicketSLADeadlines, TicketPriority } from '@/lib/sla-config'

/**
 * Créer un ticket avec calcul automatique des SLA
 */
export async function createTicketWithSLA(data: {
  ticketNumber: string
  subject: string
  description: string
  priority: TicketPriority
  category: string
  organizationId: string
  createdById: string
  assignedToId?: string
}) {
  const now = new Date()

  // Calculer les deadlines SLA basées sur la priorité
  const { responseDeadline, resolutionDeadline } = calculateTicketSLADeadlines(now, data.priority)

  // Créer le ticket avec les champs SLA
  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber: data.ticketNumber,
      subject: data.subject,
      description: data.description,
      priority: data.priority,
      category: data.category as any,
      organizationId: data.organizationId,
      createdById: data.createdById,
      assignedToId: data.assignedToId,
      slaResponseDeadline: responseDeadline,
      slaResolutionDeadline: resolutionDeadline,
      slaResponseBreach: false,
      slaResolutionBreach: false
    },
    include: {
      organization: true,
      createdBy: true,
      assignedTo: true
    }
  })

  // Logger la création
  await prisma.activityLog.create({
    data: {
      userId: data.createdById,
      action: 'TICKET_CREATED',
      entityType: 'TICKET',
      entityId: ticket.id,
      description: `Ticket #${data.ticketNumber} créé`,
      metadata: {
        ticketNumber: data.ticketNumber,
        priority: data.priority,
        slaResponseDeadline: responseDeadline,
        slaResolutionDeadline: resolutionDeadline
      }
    }
  })

  return ticket
}

/**
 * Enregistrer la première réponse au ticket et mettre à jour le SLA
 */
export async function recordFirstResponse(ticketId: string, responderId: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { firstResponseAt: true, slaResponseDeadline: true, ticketNumber: true }
  })

  if (!ticket) {
    throw new Error('Ticket introuvable')
  }

  // Si c'est déjà la première réponse, ne rien faire
  if (ticket.firstResponseAt) {
    return ticket
  }

  const now = new Date()

  // Vérifier si le SLA de réponse a été respecté
  const responseBreached = ticket.slaResponseDeadline
    ? now > ticket.slaResponseDeadline
    : false

  // Mettre à jour le ticket
  const updatedTicket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      firstResponseAt: now,
      slaResponseBreach: responseBreached
    },
    include: {
      organization: true,
      createdBy: true,
      assignedTo: true
    }
  })

  // Logger l'événement
  await prisma.activityLog.create({
    data: {
      userId: responderId,
      action: responseBreached ? 'FIRST_RESPONSE_SLA_BREACHED' : 'FIRST_RESPONSE_SLA_MET',
      entityType: 'TICKET',
      entityId: ticketId,
      description: responseBreached
        ? `Première réponse au ticket #${ticket.ticketNumber} avec violation du SLA`
        : `Première réponse au ticket #${ticket.ticketNumber} dans les délais SLA`,
      metadata: {
        ticketNumber: ticket.ticketNumber,
        responseTime: now,
        deadline: ticket.slaResponseDeadline,
        breached: responseBreached
      }
    }
  })

  return updatedTicket
}

/**
 * Marquer un ticket comme résolu et mettre à jour le SLA
 */
export async function resolveTicket(ticketId: string, resolverId: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { resolvedAt: true, slaResolutionDeadline: true, ticketNumber: true, status: true }
  })

  if (!ticket) {
    throw new Error('Ticket introuvable')
  }

  // Si déjà résolu, ne rien faire
  if (ticket.resolvedAt) {
    return ticket
  }

  const now = new Date()

  // Vérifier si le SLA de résolution a été respecté
  const resolutionBreached = ticket.slaResolutionDeadline
    ? now > ticket.slaResolutionDeadline
    : false

  // Mettre à jour le ticket
  const updatedTicket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: 'RESOLVED',
      resolvedAt: now,
      slaResolutionBreach: resolutionBreached
    },
    include: {
      organization: true,
      createdBy: true,
      assignedTo: true
    }
  })

  // Logger l'événement
  await prisma.activityLog.create({
    data: {
      userId: resolverId,
      action: resolutionBreached ? 'TICKET_RESOLVED_SLA_BREACHED' : 'TICKET_RESOLVED_SLA_MET',
      entityType: 'TICKET',
      entityId: ticketId,
      description: resolutionBreached
        ? `Ticket #${ticket.ticketNumber} résolu avec violation du SLA`
        : `Ticket #${ticket.ticketNumber} résolu dans les délais SLA`,
      metadata: {
        ticketNumber: ticket.ticketNumber,
        resolutionTime: now,
        deadline: ticket.slaResolutionDeadline,
        breached: resolutionBreached
      }
    }
  })

  return updatedTicket
}

/**
 * Mettre à jour la priorité d'un ticket et recalculer les SLA
 */
export async function updateTicketPriority(
  ticketId: string,
  newPriority: TicketPriority,
  updaterId: string
) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: {
      createdAt: true,
      firstResponseAt: true,
      resolvedAt: true,
      ticketNumber: true,
      priority: true
    }
  })

  if (!ticket) {
    throw new Error('Ticket introuvable')
  }

  // Recalculer les deadlines SLA avec la nouvelle priorité
  const { responseDeadline, resolutionDeadline } = calculateTicketSLADeadlines(
    ticket.createdAt,
    newPriority
  )

  // Recalculer les violations SLA
  const now = new Date()
  const responseBreached = !ticket.firstResponseAt && responseDeadline < now
  const resolutionBreached = !ticket.resolvedAt && resolutionDeadline < now

  // Mettre à jour le ticket
  const updatedTicket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      priority: newPriority,
      slaResponseDeadline: responseDeadline,
      slaResolutionDeadline: resolutionDeadline,
      slaResponseBreach: responseBreached,
      slaResolutionBreach: resolutionBreached
    },
    include: {
      organization: true,
      createdBy: true,
      assignedTo: true
    }
  })

  // Logger l'événement
  await prisma.activityLog.create({
    data: {
      userId: updaterId,
      action: 'TICKET_PRIORITY_UPDATED',
      entityType: 'TICKET',
      entityId: ticketId,
      description: `Priorité du ticket #${ticket.ticketNumber} changée de ${ticket.priority} à ${newPriority}`,
      metadata: {
        ticketNumber: ticket.ticketNumber,
        oldPriority: ticket.priority,
        newPriority,
        newResponseDeadline: responseDeadline,
        newResolutionDeadline: resolutionDeadline
      }
    }
  })

  return updatedTicket
}

/**
 * Obtenir les statistiques SLA pour le dashboard
 */
export async function getSLAStats(timeRange: 'day' | 'week' | 'month' = 'month') {
  const now = new Date()
  const startDate = new Date()

  switch (timeRange) {
    case 'day':
      startDate.setDate(now.getDate() - 1)
      break
    case 'week':
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(now.getMonth() - 1)
      break
  }

  // Tickets créés dans la période
  const tickets = await prisma.supportTicket.findMany({
    where: {
      createdAt: { gte: startDate }
    },
    select: {
      id: true,
      priority: true,
      slaResponseBreach: true,
      slaResolutionBreach: true,
      firstResponseAt: true,
      resolvedAt: true,
      status: true
    }
  })

  const totalTickets = tickets.length
  const responseBreaches = tickets.filter(t => t.slaResponseBreach).length
  const resolutionBreaches = tickets.filter(t => t.slaResolutionBreach).length
  const resolvedTickets = tickets.filter(t => t.resolvedAt).length

  const responseComplianceRate = totalTickets > 0
    ? Math.round(((totalTickets - responseBreaches) / totalTickets) * 100)
    : 100

  const resolutionComplianceRate = resolvedTickets > 0
    ? Math.round(((resolvedTickets - resolutionBreaches) / resolvedTickets) * 100)
    : 100

  // Tickets actuellement en violation
  const openTicketsWithBreach = await prisma.supportTicket.count({
    where: {
      status: { notIn: ['RESOLVED', 'CLOSED'] },
      OR: [
        { slaResponseBreach: true },
        { slaResolutionBreach: true }
      ]
    }
  })

  return {
    totalTickets,
    responseBreaches,
    resolutionBreaches,
    responseComplianceRate,
    resolutionComplianceRate,
    openTicketsWithBreach
  }
}

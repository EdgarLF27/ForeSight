import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { AiService } from '../ai/ai.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private aiService: AiService,
    private eventsGateway: EventsGateway,
  ) {}

  async findAll(companyId: string, user: any) {
    const { id: userId, role } = user;
    const isAdmin = role?.name === 'Administrador' || user.role === 'EMPRESA';
    const isTechnician = role?.name === 'Técnico';

    const where: any = { companyId };
    if (isAdmin) {
    } else if (isTechnician) {
      where.OR = [{ assignedToId: userId }, { assignedToId: null, status: 'OPEN' }];
    } else {
      where.OR = [{ createdById: userId }, { assignedToId: userId }];
    }

    return this.prisma.ticket.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
        area: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async claim(ticketId: string, userId: string, companyId: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (ticket.companyId !== companyId) throw new ForbiddenException('No tienes acceso');
    if (ticket.assignedToId) throw new ForbiddenException('Ya reclamado');

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { assignedToId: userId, status: 'IN_PROGRESS' },
      include: { assignedTo: { select: { id: true, name: true, avatar: true } }, createdBy: { select: { id: true, name: true } }, area: { select: { id: true, name: true } } },
    });

    await this.prisma.ticketActivity.create({
      data: { ticketId, userId, action: 'ASSIGNED', details: 'Ticket reclamado por el técnico' },
    });

    try {
      await this.notificationsService.create(ticket.createdById, {
        title: 'Técnico asignado',
        message: `El técnico ${updated.assignedTo?.name} ha tomado tu ticket: ${ticket.title}`,
        type: 'TICKET_ASSIGNED',
        link: ticket.id
      });
      // Notificar a todos en la empresa que el ticket se actualizó
      this.eventsGateway.server.to(`company_${companyId}`).emit('ticketUpdated', updated);
    } catch (e) {}

    return updated;
  }

  async unclaim(ticketId: string, userId: string, companyId: string, user: any) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    
    const isAdmin = user.role?.name === 'Administrador';
    if (ticket.assignedToId !== userId && !isAdmin) throw new ForbiddenException('No puedes liberar este ticket');

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { assignedToId: null, status: 'OPEN' },
      include: { assignedTo: { select: { id: true, name: true, avatar: true } }, createdBy: { select: { id: true, name: true } }, area: { select: { id: true, name: true } } },
    });

    await this.prisma.ticketActivity.create({
      data: { ticketId, userId, action: 'UNASSIGNED', details: isAdmin ? 'Liberado por admin' : 'Liberado por técnico' },
    });

    this.eventsGateway.server.to(`company_${companyId}`).emit('ticketUpdated', updated);

    return updated;
  }

  async findOne(id: string, user: any) {
    const { id: userId, role, companyId: userCompanyId } = user;
    const isAdmin = role?.name === 'Administrador' || user.role === 'EMPRESA';
    const isTechnician = role?.name === 'Técnico';

    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true, avatar: true } },
        assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
        area: { select: { id: true, name: true } },
        company: { select: { id: true, name: true, ownerId: true } }, // CORREGIDO: Incluimos ownerId
        comments: {
          include: { user: { select: { id: true, name: true, avatar: true, role: { select: { name: true } } } } },
          orderBy: { createdAt: 'asc' },
        },
        activities: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (userCompanyId && ticket.companyId !== userCompanyId) throw new ForbiddenException('Acceso denegado');
    
    const isOwner = user.id === ticket.company.ownerId;
    if (!isAdmin && !isTechnician && !isOwner && ticket.createdById !== userId && ticket.assignedToId !== userId) {
      throw new ForbiddenException('Sin permiso para ver este ticket');
    }

    // ANÁLISIS POR IA BAJO DEMANDA: Si no tiene resumen ni sentimiento, lo analizamos ahora
    if (!ticket.aiSummary && !ticket.aiSentiment && ticket.description) {
      const processLazyAi = async () => {
        try {
          console.log(`TicketsService: Iniciando análisis diferido para ticket ${ticket.id}`);
          const analysis = await this.aiService.analyzeTicket(ticket.description);
          
          if (analysis) {
            // AUTO-CLASIFICACIÓN DIFERIDA
            let autoAreaId = ticket.areaId;
            let activityLog = '';

            if (!ticket.areaId && analysis.suggestedArea) {
              const area = await this.prisma.area.findFirst({
                where: { 
                  name: { contains: analysis.suggestedArea, mode: 'insensitive' },
                  companyId: ticket.companyId 
                }
              });
              if (area) {
                autoAreaId = area.id;
                activityLog += `Área auto-asignada a: ${area.name}. `;
              }
            }

            let autoPriority = ticket.priority;
            if (analysis.suggestedPriority && (ticket.priority === 'LOW' || ticket.priority === 'MEDIUM')) {
              autoPriority = analysis.suggestedPriority as any;
              activityLog += `Prioridad ajustada a: ${autoPriority}. `;
            }

            const updatedAnalysis = await this.prisma.ticket.update({
              where: { id: ticket.id },
              data: {
                aiSentiment: analysis.sentiment,
                aiSummary: analysis.summary,
                aiReasoning: analysis.ai_reasoning,
                aiSuggestedArea: analysis.suggestedArea,
                aiSuggestedPriority: analysis.suggestedPriority,
                areaId: autoAreaId,
                priority: autoPriority,
              },
              include: { assignedTo: { select: { id: true, name: true, avatar: true } }, createdBy: { select: { id: true, name: true } }, area: { select: { id: true, name: true } } },
            });

            if (activityLog) {
              await this.prisma.ticketActivity.create({
                data: { 
                  ticketId: ticket.id, 
                  userId: ticket.createdById, 
                  action: 'SYSTEM_AUTO_CLASSIFY', 
                  details: `IA Core: ${activityLog}` 
                }
              });
            }
            console.log(`TicketsService: Análisis diferido completado para ticket ${ticket.id}`);
            this.eventsGateway.server.to(`company_${ticket.companyId}`).emit('ticketUpdated', updatedAnalysis);
          }
        } catch (err) {
          console.error('Error en análisis IA diferido:', err);
        }
      };
      
      processLazyAi();
    }

    return ticket;
  }

  async create(data: any) {
    // EVITAR DUPLICADOS: Buscar si existe un ticket idéntico creado hace menos de 1 minuto
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const existingDuplicate = await this.prisma.ticket.findFirst({
      where: {
        title: data.title,
        description: data.description,
        createdById: data.createdById,
        createdAt: { gte: oneMinuteAgo },
      }
    });

    if (existingDuplicate) {
      throw new BadRequestException('Ya has enviado un ticket idéntico recientemente. Por favor, espera un momento.');
    }

    // BUSCAMOS EL ÁREA DEL USUARIO CREADOR PARA EL LOG Y LA ASIGNACIÓN
    const user = await this.prisma.user.findUnique({
      where: { id: data.createdById },
      include: { area: true }
    });

    const ticket = await this.prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        priority: 'MEDIUM',
        category: data.category || 'General',
        companyId: data.companyId,
        createdById: data.createdById,
        areaId: user?.areaId || null,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        area: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } }
      },
    });

    await this.prisma.ticketActivity.create({
      data: { 
        ticketId: ticket.id, 
        userId: data.createdById, 
        action: 'CREATED', 
        details: `Ticket registrado desde el área: ${user?.area?.name || 'Área General'}` 
      },
    });
    
    // Emitir creación inmediata
    this.eventsGateway.server.to(`company_${data.companyId}`).emit('ticketCreated', ticket);

    // ANÁLISIS POR IA Y PREDICCIÓN DE TIEMPO
    try {
      console.log('TicketsService: Iniciando análisis de IA para nuevo ticket...');
      const analysis = await this.aiService.analyzeTicket(data.description);
      
      const history = await this.prisma.ticket.findMany({
        where: { 
          companyId: data.companyId, 
          status: { in: ['RESOLVED', 'CLOSED'] },
          resolvedAt: { not: null }
        },
        take: 10,
        orderBy: { resolvedAt: 'desc' },
        include: { area: { select: { name: true } } }
      });

      const prediction = await this.aiService.predictResolutionTime(ticket, history);

      if (analysis || prediction) {
        let finalAreaId = ticket.areaId;
        let activityLog = '';

        if (analysis?.suggestedArea) {
          const suggestedArea = await this.prisma.area.findFirst({
            where: { 
              name: { contains: analysis.suggestedArea, mode: 'insensitive' },
              companyId: data.companyId 
            }
          });
          
          if (suggestedArea && suggestedArea.id !== ticket.areaId) {
            finalAreaId = suggestedArea.id;
            activityLog += `Área re-clasificada técnicamente a: ${suggestedArea.name}. `;
          }
        }

        let finalPriority = ticket.priority;
        if (analysis?.suggestedPriority && (analysis.suggestedPriority === 'HIGH' || analysis.suggestedPriority === 'URGENT')) {
          finalPriority = analysis.suggestedPriority as any;
          activityLog += `Prioridad elevada automáticamente a: ${finalPriority}. `;
        }

        const updatedTicket = await this.prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            aiSentiment: analysis?.sentiment,
            aiSummary: analysis?.summary,
            aiReasoning: analysis?.ai_reasoning,
            aiSuggestedArea: analysis?.suggestedArea,
            aiSuggestedPriority: analysis?.suggestedPriority,
            aiEstimatedTime: prediction?.estimatedMinutes,
            aiConfidence: prediction?.confidence,
            areaId: finalAreaId,
            priority: finalPriority,
          },
          include: {
            createdBy: { select: { id: true, name: true, email: true, avatar: true } },
            assignedTo: { select: { id: true, name: true, email: true, avatar: true } },
            area: { select: { id: true, name: true } },
          }
        });

        if (activityLog) {
          await this.prisma.ticketActivity.create({
            data: { 
              ticketId: ticket.id, 
              userId: data.createdById, 
              action: 'SYSTEM_AUTO_CLASSIFY', 
              details: `IA Core: ${activityLog}` 
            }
          });
        }
        
        // Emitir actualización tras IA
        this.eventsGateway.server.to(`company_${data.companyId}`).emit('ticketUpdated', updatedTicket);
        return updatedTicket;
      }
    } catch (err) {
      console.error('Error en proceso de inteligencia de ticket:', err);
    }

    return ticket;
  }

  async update(id: string, data: any, companyId: string, currentUserId: string, user?: any) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { area: true, assignedTo: true, company: true }
    });

    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    if (companyId && ticket.companyId !== companyId) throw new ForbiddenException('Acceso denegado');

    if (user) {
      const isAdmin = user.role === 'EMPRESA' || user.role?.name === 'Administrador' || user.id === ticket.company.ownerId;
      const isTechnician = user.role?.name === 'Técnico';
      const isEmployee = user.role === 'EMPLEADO' || user.role?.name === 'Empleado';

      if (isEmployee && !isAdmin) {
        if (ticket.createdById !== user.id) throw new ForbiddenException('Solo tus tickets');
        if (data.status && data.status !== 'CANCELLED') throw new ForbiddenException('Solo puedes cancelar');
      }
    }

    if (data.status && data.status !== ticket.status) {
      this.validateStatusTransition(ticket.status, data.status);
    }

    const updateData = { ...data };
    if (data.status === 'RESOLVED' && ticket.status !== 'RESOLVED') {
      updateData.resolvedAt = new Date();
    } else if (data.status && data.status !== 'RESOLVED' && ticket.status === 'RESOLVED') {
      // Si se reabre, limpiamos la fecha de resolución
      updateData.resolvedAt = null;
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: updateData,
      include: { 
        area: { select: { id: true, name: true } }, 
        assignedTo: { select: { id: true, name: true, avatar: true } },
        createdBy: { select: { id: true, name: true, avatar: true } }
      },
    });

    try {
      if (data.status && data.status !== ticket.status) {
        await this.prisma.ticketActivity.create({
          data: { ticketId: id, userId: currentUserId, action: 'STATUS_CHANGE', details: `De ${ticket.status} a ${data.status}` }
        });

        if (currentUserId !== ticket.createdById) {
          const statusLabels = { 'OPEN': 'Abierto', 'IN_PROGRESS': 'en progreso', 'RESOLVED': 'resuelto', 'CLOSED': 'cerrado', 'CANCELLED': 'cancelado' };
          await this.notificationsService.create(ticket.createdById, {
            title: 'Actualización de estado',
            message: `Tu ticket "${ticket.title}" ahora está ${statusLabels[data.status] || data.status}.`,
            type: 'STATUS_CHANGED',
            link: ticket.id
          });
        }
      }

      if (data.assignedToId && data.assignedToId !== ticket.assignedToId) {
        await this.prisma.ticketActivity.create({
          data: { ticketId: id, userId: currentUserId, action: 'ASSIGNED', details: `Asignado a ${updated.assignedTo?.name}` }
        });

        await this.notificationsService.create(data.assignedToId, {
          title: 'Nuevo ticket asignado',
          message: `Se te ha asignado el ticket: ${updated.title}`,
          type: 'TICKET_ASSIGNED',
          link: ticket.id
        });
      }
    } catch (e) {
      console.error('Error en disparadores de notificación:', e);
    }

    // Emitir evento WebSocket a toda la compañía
    this.eventsGateway.server.to(`company_${companyId}`).emit('ticketUpdated', updated);
    // Y a la sala específica del ticket para la vista de detalle
    this.eventsGateway.server.to(`ticket_${id}`).emit('ticketDetailUpdated', updated);

    return updated;
  }

  private validateStatusTransition(current: TicketStatus, next: TicketStatus) {
    const allowed: Record<TicketStatus, TicketStatus[]> = {
      [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
      [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED, TicketStatus.OPEN, TicketStatus.CANCELLED],
      [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.IN_PROGRESS],
      [TicketStatus.CLOSED]: [],
      [TicketStatus.CANCELLED]: [],
    };
    if (!allowed[current].includes(next)) throw new BadRequestException(`Transición no permitida`);
  }

  async delete(id: string, companyId: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket || ticket.companyId !== companyId) throw new NotFoundException();
    await this.prisma.ticket.delete({ where: { id } });
    
    // Emitir eliminación
    this.eventsGateway.server.to(`company_${companyId}`).emit('ticketDeleted', id);
    
    return { message: 'Eliminado' };
  }

  async getStats(companyId: string) {
    const [total, open, inProgress, resolved, closed, cancelled] = await Promise.all([
      this.prisma.ticket.count({ where: { companyId } }),
      this.prisma.ticket.count({ where: { companyId, status: 'OPEN' } }),
      this.prisma.ticket.count({ where: { companyId, status: 'IN_PROGRESS' } }),
      this.prisma.ticket.count({ where: { companyId, status: 'RESOLVED' } }),
      this.prisma.ticket.count({ where: { companyId, status: 'CLOSED' } }),
      this.prisma.ticket.count({ where: { companyId, status: 'CANCELLED' } }),
    ]);
    return { total, open, inProgress, resolved, closed, cancelled };
  }
}

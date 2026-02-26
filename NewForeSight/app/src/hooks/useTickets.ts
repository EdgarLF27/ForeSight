import { useState, useEffect, useCallback } from 'react';
import type { Ticket, Comment, TicketStatus } from '@/types';
import { api } from '@/lib/api';

export function useTickets(companyId?: string, userId?: string) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      const query = userId ? '?myTickets=true' : '';
      const response = await api.get(`/tickets${query}`);
      setTickets(response);
    } catch (error) {
      console.error('Error al cargar los tickets:', error);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, userId]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const createTicket = useCallback(async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket | null> => {
    try {
      const response = await api.post('/tickets', ticketData);
      setTickets(prev => [response, ...prev]);
      return response;
    } catch (error) {
      console.error('Error al crear el ticket:', error);
      return null;
    }
  }, []);

  const updateTicket = useCallback(async (ticketId: string, updates: Partial<Ticket>): Promise<boolean> => {
    try {
      const response = await api.put(`/tickets/${ticketId}`, updates);
      setTickets(prev => prev.map(t => t.id === ticketId ? response : t));
      return true;
    } catch (error) {
      console.error('Error al actualizar el ticket:', error);
      return false;
    }
  }, []);

  const deleteTicket = useCallback(async (ticketId: string): Promise<boolean> => {
    try {
      await api.delete(`/tickets/${ticketId}`);
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      return true;
    } catch (error) {
      console.error('Error al eliminar el ticket:', error);
      return false;
    }
  }, []);

  const getTicketById = useCallback(async (ticketId: string): Promise<Ticket | null> => {
    try {
      return await api.get(`/tickets/${ticketId}`);
    } catch (error) {
      console.error('Error al obtener el ticket:', error);
      return null;
    }
  }, []);

  const getStats = useCallback(async () => {
    try {
      return await api.get('/tickets/stats');
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return null;
    }
  }, []);

  return {
    tickets,
    isLoading,
    createTicket,
    updateTicket,
    deleteTicket,
    getTicketById,
    getStats,
    refresh: loadTickets,
  };
}

export function useComments(ticketId?: string) {
  const [comments, setComments] = useState<Comment[]>([]);

  const loadComments = useCallback(async () => {
    if (!ticketId) return;
    try {
      const response = await api.get(`/comments/ticket/${ticketId}`);
      setComments(response);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    }
  }, [ticketId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const addComment = useCallback(async (content: string): Promise<Comment | null> => {
    if (!ticketId) return null;
    try {
      const response = await api.post('/comments', { content, ticketId });
      setComments(prev => [...prev, response]);
      return response;
    } catch (error) {
      console.error('Error al añadir comentario:', error);
      return null;
    }
  }, [ticketId]);

  return {
    comments,
    addComment,
    refresh: loadComments,
  };
}

export function useTeam(companyId?: string) {
  const getTeamMembers = useCallback(async () => {
    if (!companyId) return [];
    try {
      return await api.get(`/users?companyId=${companyId}`);
    } catch (error) {
      console.error('Error al obtener miembros del equipo:', error);
      return [];
    }
  }, [companyId]);

  const getCompanyById = useCallback(async (id: string) => {
    try {
      return await api.get(`/companies/${id}`);
    } catch (error) {
      console.error('Error al obtener la empresa:', error);
      return null;
    }
  }, []);

  const regenerateInviteCode = useCallback(async (companyId: string): Promise<string | null> => {
    try {
      const response = await api.post(`/companies/${companyId}/regenerate-code`, {});
      return response.inviteCode;
    } catch (error) {
      console.error('Error al regenerar el código:', error);
      return null;
    }
  }, []);

  return {
    getTeamMembers,
    getCompanyById,
    regenerateInviteCode,
  };
}

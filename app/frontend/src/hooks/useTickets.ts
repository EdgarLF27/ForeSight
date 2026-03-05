import { useState, useEffect, useCallback } from 'react';
<<<<<<< HEAD
import { ticketsApi, commentsApi, companiesApi, usersApi } from '@/services/api';
import type { Ticket, Comment, TicketStatus } from '@/types';

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTickets = useCallback(async (myTickets = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await ticketsApi.getAll(myTickets);
      setTickets(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar tickets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTicket = useCallback(async (ticketData: any): Promise<Ticket | null> => {
    try {
      const { data } = await ticketsApi.create(ticketData);
      setTickets(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear ticket');
=======
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
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
      return null;
    }
  }, []);

<<<<<<< HEAD
  const updateTicket = useCallback(async (ticketId: string, updates: any): Promise<boolean> => {
    try {
      const { data } = await ticketsApi.update(ticketId, updates);
      setTickets(prev => prev.map(t => t.id === ticketId ? data : t));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar ticket');
=======
  const updateTicket = useCallback(async (ticketId: string, updates: Partial<Ticket>): Promise<boolean> => {
    try {
      const response = await api.put(`/tickets/${ticketId}`, updates);
      setTickets(prev => prev.map(t => t.id === ticketId ? response : t));
      return true;
    } catch (error) {
      console.error('Error al actualizar el ticket:', error);
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
      return false;
    }
  }, []);

  const deleteTicket = useCallback(async (ticketId: string): Promise<boolean> => {
    try {
<<<<<<< HEAD
      await ticketsApi.delete(ticketId);
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar ticket');
=======
      await api.delete(`/tickets/${ticketId}`);
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      return true;
    } catch (error) {
      console.error('Error al eliminar el ticket:', error);
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
      return false;
    }
  }, []);

  const getTicketById = useCallback(async (ticketId: string): Promise<Ticket | null> => {
    try {
<<<<<<< HEAD
      const { data } = await ticketsApi.getById(ticketId);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener ticket');
=======
      return await api.get(`/tickets/${ticketId}`);
    } catch (error) {
      console.error('Error al obtener el ticket:', error);
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
      return null;
    }
  }, []);

  const getStats = useCallback(async () => {
    try {
<<<<<<< HEAD
      const { data } = await ticketsApi.getStats();
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener estadísticas');
=======
      return await api.get('/tickets/stats');
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
      return null;
    }
  }, []);

  return {
    tickets,
    isLoading,
<<<<<<< HEAD
    error,
    loadTickets,
=======
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
    createTicket,
    updateTicket,
    deleteTicket,
    getTicketById,
    getStats,
<<<<<<< HEAD
=======
    refresh: loadTickets,
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
  };
}

export function useComments(ticketId?: string) {
  const [comments, setComments] = useState<Comment[]>([]);
<<<<<<< HEAD
  const [isLoading, setIsLoading] = useState(false);
=======
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b

  const loadComments = useCallback(async () => {
    if (!ticketId) return;
    try {
<<<<<<< HEAD
      setIsLoading(true);
      const { data } = await commentsApi.getByTicket(ticketId);
      setComments(data);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  const addComment = useCallback(async (content: string): Promise<Comment | null> => {
    if (!ticketId) return null;
    try {
      const { data } = await commentsApi.create({ content, ticketId });
      setComments(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error adding comment:', err);
=======
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
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
      return null;
    }
  }, [ticketId]);

  return {
    comments,
<<<<<<< HEAD
    isLoading,
    loadComments,
    addComment,
=======
    addComment,
    refresh: loadComments,
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
  };
}

export function useTeam(companyId?: string) {
<<<<<<< HEAD
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      const { data } = await usersApi.getAll(companyId);
      setMembers(data);
    } catch (err) {
      console.error('Error loading team members:', err);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  const regenerateInviteCode = useCallback(async (): Promise<string | null> => {
    if (!companyId) return null;
    try {
      const { data } = await companiesApi.regenerateCode(companyId);
      return data.inviteCode;
    } catch (err) {
      console.error('Error regenerating code:', err);
      return null;
    }
  }, [companyId]);

  return {
    members,
    isLoading,
    loadMembers,
=======
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
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
    regenerateInviteCode,
  };
}

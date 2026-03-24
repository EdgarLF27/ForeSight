import { useState, useCallback, useEffect } from 'react';
import { ticketsApi } from '@/services/api';
import { socketService } from '@/services/socket';
import type { Ticket } from '@/types';

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Escuchar eventos de WebSocket para mantener la lista actualizada
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleTicketCreated = (newTicket: Ticket) => {
      setTickets(prev => {
        // Evitar duplicados si fue el creador quien emitió la acción
        if (prev.find(t => t.id === newTicket.id)) return prev;
        return [newTicket, ...prev];
      });
    };

    const handleTicketUpdated = (updatedTicket: Ticket) => {
      setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    };

    const handleTicketDeleted = (deletedId: string) => {
      setTickets(prev => prev.filter(t => t.id !== deletedId));
    };

    socket.on('ticketCreated', handleTicketCreated);
    socket.on('ticketUpdated', handleTicketUpdated);
    socket.on('ticketDeleted', handleTicketDeleted);

    return () => {
      socket.off('ticketCreated', handleTicketCreated);
      socket.off('ticketUpdated', handleTicketUpdated);
      socket.off('ticketDeleted', handleTicketDeleted);
    };
  }, []);

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
      setIsLoading(true);
      setError(null);
      const { data } = await ticketsApi.create(ticketData);
      setTickets(prev => {
        if (prev.find(t => t.id === data.id)) return prev;
        return [data, ...prev];
      });
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al crear ticket';
      setError(message);
      throw err; // Relanzamos para que App.tsx lo capture
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTicket = useCallback(async (ticketId: string, updates: any): Promise<boolean> => {
    try {
      const { data } = await ticketsApi.update(ticketId, updates);
      setTickets(prev => prev.map(t => t.id === ticketId ? data : t));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar ticket');
      return false;
    }
  }, []);

  const deleteTicket = useCallback(async (ticketId: string): Promise<boolean> => {
    try {
      await ticketsApi.delete(ticketId);
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar ticket');
      return false;
    }
  }, []);

  const claimTicket = useCallback(async (ticketId: string): Promise<boolean> => {
    try {
      const { data } = await ticketsApi.claim(ticketId);
      setTickets(prev => prev.map(t => t.id === ticketId ? data : t));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reclamar ticket');
      return false;
    }
  }, []);

  const getTicketById = useCallback(async (ticketId: string): Promise<Ticket | null> => {
    try {
      const { data } = await ticketsApi.getById(ticketId);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener ticket');
      return null;
    }
  }, []);

  const getStats = useCallback(async () => {
    try {
      const { data } = await ticketsApi.getStats();
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener estadísticas');
      return null;
    }
  }, []);

  return {
    tickets,
    isLoading,
    error,
    loadTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    claimTicket,
    getTicketById,
    getStats,
  };
}

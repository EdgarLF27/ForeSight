import { useState, useCallback } from 'react';
import { ticketsApi } from '@/services/api';
import type { Ticket } from '@/types';

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
      return null;
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
    getTicketById,
    getStats,
  };
}

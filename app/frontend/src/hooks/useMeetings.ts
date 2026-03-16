import { useState, useCallback } from 'react';
import { meetingsApi } from '@/services/api';
import type { Meeting, MeetingStatus } from '@/types';
import { toast } from 'sonner';

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [agenda, setAgenda] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMeetingsByTicket = useCallback(async (ticketId: string) => {
    try {
      setIsLoading(true);
      const { data } = await meetingsApi.getByTicket(ticketId);
      setMeetings(data);
    } catch (err: any) {
      console.error('Error al cargar reuniones:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadAgenda = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await meetingsApi.getAgenda();
      setAgenda(data);
    } catch (err: any) {
      console.error('Error al cargar agenda:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProposal = useCallback(async (data: {
    title: string;
    description?: string;
    scheduledAt: string;
    duration?: number;
    type: string;
    ticketId: string;
  }) => {
    try {
      setIsLoading(true);
      const { data: newMeeting } = await meetingsApi.createProposal(data);
      setMeetings(prev => [...prev, newMeeting]);
      toast.success('Propuesta de reunión enviada');
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al proponer reunión';
      toast.error(Array.isArray(message) ? message[0] : message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: MeetingStatus) => {
    try {
      const { data: updatedMeeting } = await meetingsApi.updateStatus(id, status);
      setMeetings(prev => prev.map(m => m.id === id ? { ...m, status: updatedMeeting.status } : m));
      toast.success(`Reunión ${status.toLowerCase()}`);
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al actualizar estado';
      toast.error(Array.isArray(message) ? message[0] : message);
      return false;
    }
  }, []);

  const repropose = useCallback(async (id: string, data: { scheduledAt: string; duration?: number }) => {
    try {
      setIsLoading(true);
      const { data: updatedMeeting } = await meetingsApi.repropose(id, data);
      setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updatedMeeting } : m));
      toast.success('Nueva propuesta de horario enviada');
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al enviar nueva propuesta';
      toast.error(Array.isArray(message) ? message[0] : message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    meetings,
    agenda,
    isLoading,
    error,
    loadMeetingsByTicket,
    loadAgenda,
    createProposal,
    updateStatus,
    repropose,
  };
}

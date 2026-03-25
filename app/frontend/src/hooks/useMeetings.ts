import { useState, useCallback, useEffect } from 'react';
import { meetingsApi } from '@/services/api';
import { socketService } from '@/services/socket';
import type { Meeting } from '@/types';
import { toast } from 'sonner';

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Escuchar actualizaciones de reuniones vía WebSocket
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleMeetingUpdated = (updatedMeeting: Meeting) => {
      console.log('⚡ WS: Reunión actualizada:', updatedMeeting.id);
      
      setMeetings(prev => {
        const index = prev.findIndex(m => m.id === updatedMeeting.id);
        if (index === -1) {
          return [...prev, updatedMeeting].sort((a, b) => 
            new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
          );
        }
        return prev.map(m => m.id === updatedMeeting.id ? updatedMeeting : m);
      });

      if (updatedMeeting.status === 'ACCEPTED') {
        toast.success(`Reunión confirmada: ${updatedMeeting.title}`);
      } else if (updatedMeeting.status === 'PROPOSED') {
        toast.info(`Nueva propuesta de horario: ${updatedMeeting.title}`);
      }
    };

    socket.on('meetingUpdated', handleMeetingUpdated);

    return () => {
      socket.off('meetingUpdated', handleMeetingUpdated);
    };
  }, [isLoading]);

  const loadMeetings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await meetingsApi.getMyMeetings();
      setMeetings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar agenda');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCompanyAgenda = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await meetingsApi.getCompanyAgenda();
      setMeetings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar agenda global');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMeetingsByTicket = useCallback(async (ticketId: string) => {
    try {
      setIsLoading(true);
      const { data } = await meetingsApi.getByTicket(ticketId);
      setMeetings(data);
    } catch (err) {
      console.error('Error al cargar reuniones del ticket');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const proposeMeeting = useCallback(async (data: any) => {
    try {
      const res = await meetingsApi.createProposal(data);
      setMeetings(prev => [...prev, res.data].sort((a, b) => 
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      ));
      toast.success('Propuesta enviada correctamente');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al proponer reunión');
      return false;
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: string) => {
    try {
      const res = await meetingsApi.updateStatus(id, status);
      setMeetings(prev => prev.map(m => m.id === id ? res.data : m));
      toast.success(`Estado actualizado a: ${status}`);
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar estado');
      return false;
    }
  }, []);

  const repropose = useCallback(async (id: string, data: { scheduledAt: string; duration: number }) => {
    try {
      const res = await meetingsApi.repropose(id, data);
      setMeetings(prev => prev.map(m => m.id === id ? res.data : m));
      toast.success('Nueva propuesta de horario enviada');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al reprogramar');
      return false;
    }
  }, []);

  return {
    meetings,
    agenda: meetings, // Alias para AgendaPage
    isLoading,
    error,
    loadMeetings,
    loadCompanyAgenda,
    loadAgenda: loadMeetings, // Alias para AgendaPage
    loadMeetingsByTicket,
    proposeMeeting,
    updateStatus,
    repropose,
  };
}

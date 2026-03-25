import { useState, useCallback, useEffect } from 'react';
import { teamApi, usersApi } from '@/services/api';
import { socketService } from '@/services/socket';
import type { User } from '@/types';
import { toast } from 'sonner';

export function useTeam(companyId?: string) {
  const [members, setMembers] = useState<User[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Escuchar cuando alguien se une al equipo vía WebSocket
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleUserJoined = (newUser: User) => {
      console.log('⚡ WS: Nuevo integrante detectado:', newUser.name);
      setMembers(prev => {
        if (prev.find(u => u.id === newUser.id)) return prev;
        return [...prev, newUser];
      });
      toast.success(`${newUser.name} se ha unido al equipo`);
    };

    const handleUserUpdated = (updatedUser: User) => {
      console.log('⚡ WS: Usuario actualizado:', updatedUser.name);
      setMembers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      setTechnicians(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    socket.on('userJoined', handleUserJoined);
    socket.on('userUpdated', handleUserUpdated);

    return () => {
      socket.off('userJoined', handleUserJoined);
      socket.off('userUpdated', handleUserUpdated);
    };
  }, [isLoading]);

  const loadMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await teamApi.getAll();
      setMembers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar equipo');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTechnicians = useCallback(async (areaId?: string) => {
    try {
      const { data } = await usersApi.getTechnicians(areaId);
      setTechnicians(data);
    } catch (err: any) {
      console.error('Error al cargar técnicos');
    }
  }, []);

  const changeUserRole = useCallback(async (userId: string, roleId: string) => {
    try {
      const res = await teamApi.updateRole(userId, roleId);
      setMembers(prev => prev.map(u => u.id === userId ? res.data : u));
      toast.success('Rol actualizado correctamente');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar rol');
      return false;
    }
  }, []);

  const changeUserArea = useCallback(async (userId: string, areaId: string | null) => {
    try {
      const res = await teamApi.updateArea(userId, areaId);
      setMembers(prev => prev.map(u => u.id === userId ? res.data : u));
      toast.success('Área asignada correctamente');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al asignar área');
      return false;
    }
  }, []);

  const deleteMember = useCallback(async (userId: string) => {
    try {
      await teamApi.delete(userId);
      setMembers(prev => prev.filter(u => u.id !== userId));
      toast.success('Miembro eliminado');
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar miembro');
      return false;
    }
  }, []);

  const regenerateInviteCode = useCallback(async () => {
    toast.error('Función no implementada en este hook');
    return false;
  }, []);

  return {
    members,
    technicians,
    isLoading,
    error,
    loadMembers,
    loadTechnicians,
    changeUserRole,
    changeUserArea,
    deleteMember,
    regenerateInviteCode
  };
}

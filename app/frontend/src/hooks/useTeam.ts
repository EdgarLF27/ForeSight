import { useState, useCallback } from 'react';
import { usersApi, companiesApi } from '@/services/api';
import type { User } from '@/types';

export function useTeam(companyId?: string) {
  const [members, setMembers] = useState<User[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async (id?: string) => {
    const targetId = id || companyId;
    if (!targetId) return;

    try {
      setIsLoading(true);
      setError(null);
      const { data } = await usersApi.getAll(targetId);
      setMembers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar miembros del equipo');
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  const loadTechnicians = useCallback(async (areaId?: string) => {
    try {
      setIsLoading(true);
      const { data } = await usersApi.getTechnicians(areaId);
      setTechnicians(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar técnicos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const regenerateInviteCode = useCallback(async () => {
    if (!companyId) return null;
    try {
      const { data } = await companiesApi.regenerateCode(companyId);
      return data.inviteCode;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al regenerar código');
      return null;
    }
  }, [companyId]);

  const changeUserRole = useCallback(async (userId: string, roleId: string) => {
    try {
      setIsLoading(true);
      await usersApi.updateUserRole(userId, roleId);
      await loadMembers(); // Recargar la lista
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar rol');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadMembers]);

  const changeUserArea = useCallback(async (userId: string, areaId: string | null) => {
    try {
      setIsLoading(true);
      await usersApi.updateUserArea(userId, areaId);
      await loadMembers(); // Recargar la lista
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar área');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadMembers]);

  return {
    members,
    technicians,
    isLoading,
    error,
    loadMembers,
    loadTechnicians,
    regenerateInviteCode,
    changeUserRole,
    changeUserArea,
  };
}

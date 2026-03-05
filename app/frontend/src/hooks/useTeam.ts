import { useState, useCallback } from 'react';
import { usersApi } from '@/services/api';
import type { User } from '@/types';

export function useTeam() {
  const [members, setMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async (companyId?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await usersApi.getAll(companyId);
      setMembers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar miembros del equipo');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    members,
    isLoading,
    error,
    loadMembers,
  };
}

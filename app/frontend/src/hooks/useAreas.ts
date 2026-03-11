import { useState, useCallback } from 'react';
import { areasApi } from '@/services/api';
import type { Area } from '@/types';

export function useAreas() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAreas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await areasApi.getAll();
      setAreas(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar áreas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createArea = useCallback(async (name: string, description?: string) => {
    try {
      const { data } = await areasApi.create({ name, description });
      setAreas(prev => [...prev, data]);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear área');
      return false;
    }
  }, []);

  const updateArea = useCallback(async (id: string, name: string, description?: string) => {
    try {
      const { data } = await areasApi.update(id, { name, description });
      setAreas(prev => prev.map(a => a.id === id ? data : a));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar área');
      return false;
    }
  }, []);

  const deleteArea = useCallback(async (id: string) => {
    try {
      await areasApi.delete(id);
      setAreas(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar área');
      return false;
    }
  }, []);

  return {
    areas,
    isLoading,
    error,
    loadAreas,
    createArea,
    updateArea,
    deleteArea,
  };
}

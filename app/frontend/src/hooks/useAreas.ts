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

  const createArea = useCallback(async (formData: { name: string; description?: string }) => {
    try {
      setIsLoading(true);
      const { data } = await areasApi.create(formData);
      setAreas(prev => [...prev, data]);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al crear área';
      setError(msg);
      throw err; // Lanzamos el error para que el componente lo maneje con toast
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateArea = useCallback(async (id: string, formData: { name: string; description?: string }) => {
    try {
      setIsLoading(true);
      const { data } = await areasApi.update(id, formData);
      setAreas(prev => prev.map(a => a.id === id ? data : a));
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al actualizar área';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteArea = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      await areasApi.delete(id);
      setAreas(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al eliminar área';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
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

import { useState, useCallback, useEffect } from 'react';
import { areasApi } from '@/services/api';
import { socketService } from '@/services/socket';
import type { Area } from '@/types';
import { toast } from 'sonner';

export function useAreas() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Escuchar eventos de WebSocket para Áreas
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleAreaCreated = (newArea: Area) => {
      console.log('⚡ WS: Nueva área detectada:', newArea.name);
      setAreas(prev => {
        if (prev.find(a => a.id === newArea.id)) return prev;
        return [...prev, newArea].sort((a, b) => a.name.localeCompare(b.name));
      });
      toast.info(`Nueva área registrada: ${newArea.name}`);
    };

    const handleAreaUpdated = (updatedArea: Area) => {
      console.log('⚡ WS: Área actualizada detectada:', updatedArea.name);
      setAreas(prev => prev.map(a => a.id === updatedArea.id ? updatedArea : a));
    };

    const handleAreaDeleted = (deletedId: string) => {
      console.log('⚡ WS: Área eliminada detectada:', deletedId);
      setAreas(prev => prev.filter(a => a.id !== deletedId));
    };

    socket.on('areaCreated', handleAreaCreated);
    socket.on('areaUpdated', handleAreaUpdated);
    socket.on('areaDeleted', handleAreaDeleted);

    return () => {
      socket.off('areaCreated', handleAreaCreated);
      socket.off('areaUpdated', handleAreaUpdated);
      socket.off('areaDeleted', handleAreaDeleted);
    };
  }, [isLoading]);

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

  const createArea = useCallback(async (areaData: { name: string; description?: string }) => {
    try {
      const { data } = await areasApi.create(areaData);
      setAreas(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear área');
      return false;
    }
  }, []);

  const updateArea = useCallback(async (id: string, areaData: { name: string; description?: string }) => {
    try {
      const { data } = await areasApi.update(id, areaData);
      setAreas(prev => prev.map(a => a.id === id ? data : a));
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar área');
      return false;
    }
  }, []);

  const deleteArea = useCallback(async (id: string) => {
    try {
      await areasApi.delete(id);
      setAreas(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar área');
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
    deleteArea
  };
}

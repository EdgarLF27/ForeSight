import { useState, useCallback, useEffect } from 'react';
import { rolesApi, permissionsApi } from '@/services/api';
import { socketService } from '@/services/socket';
import type { Role, Permission } from '@/types';
import { toast } from 'sonner';

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // WebSocket Listeners for Roles
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleRoleCreated = (newRole: Role) => {
      console.log('⚡ WS: Nuevo rol detectado:', newRole.name);
      setRoles(prev => {
        if (prev.find(r => r.id === newRole.id)) return prev;
        return [...prev, newRole];
      });
      toast.info(`Nuevo rol de sistema: ${newRole.name}`);
    };

    const handleRoleUpdated = (updatedRole: Role) => {
      console.log('⚡ WS: Rol actualizado detectado:', updatedRole.name);
      setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
    };

    const handleRoleDeleted = (deletedId: string) => {
      console.log('⚡ WS: Rol eliminado detectado:', deletedId);
      setRoles(prev => prev.filter(r => r.id !== deletedId));
    };

    socket.on('roleCreated', handleRoleCreated);
    socket.on('roleUpdated', handleRoleUpdated);
    socket.on('roleDeleted', handleRoleDeleted);

    return () => {
      socket.off('roleCreated', handleRoleCreated);
      socket.off('roleUpdated', handleRoleUpdated);
      socket.off('roleDeleted', handleRoleDeleted);
    };
  }, [isLoading]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [rolesRes, permsRes] = await Promise.all([
        rolesApi.getAll(),
        permissionsApi.getAll()
      ]);
      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar datos de roles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRole = useCallback(async (data: { name: string; description?: string; permissionIds: string[] }) => {
    try {
      const res = await rolesApi.create(data);
      setRoles(prev => [...prev, res.data]);
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear rol');
      return false;
    }
  }, []);

  const updateRole = useCallback(async (id: string, data: { name?: string; description?: string; permissionIds?: string[] }) => {
    try {
      const res = await rolesApi.update(id, data);
      setRoles(prev => prev.map(r => r.id === id ? res.data : r));
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar rol');
      return false;
    }
  }, []);

  const deleteRole = useCallback(async (id: string) => {
    try {
      await rolesApi.delete(id);
      setRoles(prev => prev.filter(r => r.id !== id));
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar rol');
      return false;
    }
  }, []);

  return {
    roles,
    permissions,
    isLoading,
    error,
    loadData,
    createRole,
    updateRole,
    deleteRole
  };
}

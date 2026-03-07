import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface Permission {
  id: string;
  name: string;
  module: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: Permission[];
  _count?: {
    users: number;
  };
}

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(Array.isArray(response) ? response : response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar roles');
      setRoles([]);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions');
      setPermissions(Array.isArray(response) ? response : response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar permisos');
      setPermissions([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchRoles(), fetchPermissions()]);
      setLoading(false);
    };
    init();
  }, []);

  const createRole = async (data: { name: string; description?: string; permissionIds: string[] }) => {
    try {
      const response = await api.post('/roles', data);
      setRoles([...roles, response]);
      return response;
    } catch (err: any) {
      throw new Error(err.message || 'Error al crear rol');
    }
  };

  const updateRole = async (id: string, data: { name?: string; description?: string; permissionIds?: string[] }) => {
    try {
      const response = await api.patch(`/roles/${id}`, data);
      setRoles(roles.map(r => r.id === id ? response : r));
      return response;
    } catch (err: any) {
      throw new Error(err.message || 'Error al actualizar rol');
    }
  };

  const deleteRole = async (id: string) => {
    try {
      await api.delete(`/roles/${id}`);
      setRoles(roles.filter(r => r.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error al eliminar rol');
    }
  };

  return {
    roles,
    permissions,
    loading,
    error,
    createRole,
    updateRole,
    deleteRole,
    refreshRoles: fetchRoles
  };
};

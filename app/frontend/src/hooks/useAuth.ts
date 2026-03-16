import { useState, useEffect, useCallback } from 'react';
import { authApi, usersApi } from '@/services/api';
import type { UserRole, AuthState } from '@/types';

const TOKEN_KEY = 'foresight_token';
const USER_KEY = 'foresight_user';

export function useAuth() {
  // INICIALIZACIÓN SINCRÓNICA: Leer del storage antes de que React respire
  const getInitialState = (): AuthState => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Validar que el usuario tenga los campos mínimos (como name)
        if (user && user.name) {
          return {
            user,
            company: user.company || null,
            isAuthenticated: true,
            isLoading: false,
          };
        }
      } catch (e) {
        console.error("Error parseando cache:", e);
      }
    }
    return {
      user: null,
      company: null,
      isAuthenticated: false,
      isLoading: true, // Empezamos en loading solo si no hay cache
    };
  };

  const [state, setState] = useState<AuthState>(getInitialState());

  const loadStoredAuth = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
      return;
    }

    try {
      // Validar silenciosamente con el servidor
      const response = await authApi.getProfile();
      const freshUser = response.data.user || response.data; // Manejar si el objeto viene envuelto

      setState({
        user: freshUser,
        company: freshUser.company || null,
        isAuthenticated: true,
        isLoading: false,
      });

      localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn("Token inválido al refrescar, cerrando sesión.");
        logout();
      } else {
        // Error de red, mantenemos lo que tenemos en cache
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, []);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  const login = async (email: string, pass: string) => {
    try {
      const { data } = await authApi.login({ email, password: pass });
      const { access_token, user } = data;
      
      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      authApi.setToken(access_token);

      setState({
        user,
        company: user.company || null,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      console.error("Login hook error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('foresight_auth'); // Limpiar llave vieja
    authApi.setToken(null);
    setState({
      user: null,
      company: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const register = async (name: string, email: string, pass: string, role: UserRole, companyName?: string) => {
    try {
      const { data } = await authApi.register({ name, email, password: pass, role, companyName });
      const { access_token, user } = data;
      
      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      authApi.setToken(access_token);

      setState({
        user,
        company: user.company || null,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const joinCompany = async (inviteCode: string) => {
    if (!state.user) return false;
    try {
      const { data } = await authApi.joinCompany(inviteCode);
      const { user } = data;
      
      setState(prev => ({
        ...prev,
        user,
        company: user.company,
      }));
      
      // Actualizar localStorage
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const authData = JSON.parse(stored);
        authData.user = user;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const updateUser = async (updates: { name?: string; email?: string; avatar?: string }) => {
    try {
      const { data } = await usersApi.updateMe(updates);
      
      setState(prev => ({
        ...prev,
        user: { ...prev.user, ...data },
      }));

      // Actualizar localStorage
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const authData = JSON.parse(stored);
        authData.user = { ...authData.user, ...data };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    ...state,
    login,
    logout,
    register,
    joinCompany,
    updateUser,
  };
}

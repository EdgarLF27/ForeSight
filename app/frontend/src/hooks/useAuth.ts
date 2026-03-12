import { useState, useEffect, useCallback } from 'react';
import { authApi, usersApi } from '@/services/api';
import type { UserRole, AuthState } from '@/types';

const AUTH_STORAGE_KEY = 'foresight_auth';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    company: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const loadStoredAuth = useCallback(async () => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { token } = JSON.parse(stored);
      authApi.setToken(token);

      // PASO DE MAESTRO: Pedir al servidor la versión real y actualizada del perfil
      const { data: user } = await authApi.getProfile();

      setState({
        user,
        company: user.company || null,
        isAuthenticated: true,
        isLoading: false,
      });

      // Guardar los datos frescos para la próxima vez
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
    } catch (error) {
      console.error("Auth refresh error:", error);
      // Si el token falló o expiró, limpiamos todo
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('token');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  const login = async (email: string, pass: string) => {
    try {
      const { data } = await authApi.login({ email, password: pass });
      const { access_token, user } = data;
      
      const authData = { token: access_token, user };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      localStorage.setItem('token', access_token);
      
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
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('token');
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
      
      const authData = { token: access_token, user };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      localStorage.setItem('token', access_token);
      
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

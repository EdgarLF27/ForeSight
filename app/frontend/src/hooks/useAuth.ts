import { useState, useEffect, useCallback } from 'react';
import { authApi, usersApi, companiesApi } from '@/services/api';
import { socketService } from '@/services/socket';
import type { UserRole, AuthState } from '@/types';

const TOKEN_KEY = 'token';
const USER_KEY = 'foresight_user';

export function useAuth() {
  const getInitialState = (): AuthState => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const userStr = sessionStorage.getItem(USER_KEY);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.name) {
          return {
            user,
            company: user.company || null,
            isAuthenticated: true,
            isLoading: false,
          };
        }
      } catch (e) {}
    }
    return {
      user: null,
      company: null,
      isAuthenticated: false,
      isLoading: false,
    };
  };

  const [state, setState] = useState<AuthState>(getInitialState());

  const loadStoredAuth = useCallback(async () => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
      return;
    }

    try {
      const response = await authApi.getProfile();
      const freshUser = response.data.user || response.data;

      setState({
        user: freshUser,
        company: freshUser.company || null,
        isAuthenticated: true,
        isLoading: false,
      });

      sessionStorage.setItem(USER_KEY, JSON.stringify(freshUser));
    } catch (error: any) {
      if (error.response?.status === 401) {
        logout();
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, []);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  // ESCUCHAR ACTUALIZACIONES DE PERFIL EN TIEMPO REAL (Socket)
  useEffect(() => {
    const socket = socketService.getSocket();
    if (state.isAuthenticated && socket) {
      const handleProfileUpdate = (updatedUser: any) => {
        // Solo actualizar si es el mismo usuario (aunque el backend ya filtra por sala, doble check)
        if (updatedUser.id === state.user?.id) {
          console.log('👤 Perfil actualizado vía WebSocket:', updatedUser);
          setState(prev => ({
            ...prev,
            user: updatedUser,
            company: updatedUser.company || prev.company
          }));
          sessionStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        }
      };

      socket.on('profileUpdated', handleProfileUpdate);
      return () => {
        socket.off('profileUpdated', handleProfileUpdate);
      };
    }
  }, [state.isAuthenticated, state.user?.id]);

  const login = async (email: string, pass: string) => {
    try {
      const { data } = await authApi.login({ email, password: pass });
      const { access_token, user } = data;
      
      sessionStorage.setItem(TOKEN_KEY, access_token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      
      setState({
        user,
        company: user.company || null,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error de conexión con el servidor';
      return { success: false, message: Array.isArray(message) ? message[0] : message };
    }
  };

  const googleLogin = async (token: string) => {
    try {
      const { data } = await authApi.googleLogin(token);
      const { access_token, user } = data;
      
      sessionStorage.setItem(TOKEN_KEY, access_token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      
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

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
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
      sessionStorage.setItem(TOKEN_KEY, access_token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
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
    try {
      const { data } = await authApi.joinCompany(inviteCode);
      const { access_token, user: freshUser } = data;
      
      sessionStorage.setItem(TOKEN_KEY, access_token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      
      setState({
        user: freshUser,
        company: freshUser.company || null,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const createCompany = async (name: string) => {
    try {
      const { data } = await companiesApi.create({ name });
      const { access_token, user: freshUser } = data;
      
      sessionStorage.setItem(TOKEN_KEY, access_token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      
      setState({
        user: freshUser,
        company: freshUser.company || null,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    } catch (error: any) {
      console.error('Error detallado en createCompany:', error);
      const message = error.response?.data?.message || 'Error de conexión';
      return { success: false, message: Array.isArray(message) ? message[0] : message };
    }
  };

  const updateUser = async (updates: { name?: string; email?: string }) => {
    try {
      const { data } = await usersApi.updateMe(updates);
      const updatedUser = { ...state.user, ...data };
      setState(prev => ({ ...prev, user: updatedUser }));
      sessionStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      return false;
    }
  };

  const updatePassword = async (data: any) => {
    try {
      await usersApi.updatePassword(data);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      const { data } = await usersApi.uploadAvatar(file);
      const updatedUser = { ...state.user, ...data };
      setState(prev => ({ ...prev, user: updatedUser }));
      sessionStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    ...state,
    login,
    googleLogin,
    logout,
    register,
    joinCompany,
    createCompany,
    updateUser,
    updatePassword,
    uploadAvatar
  };
}


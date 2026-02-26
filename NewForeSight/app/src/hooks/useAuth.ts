import { useState, useEffect, useCallback } from 'react';
import type { User, Company, UserRole, AuthState } from '@/types';
import { api } from '@/lib/api';

const TOKEN_KEY = 'ticketclass_token';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    company: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Verificar sesión existente al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token) {
      api.get('/auth/me')
        .then(user => {
          setState({
            user,
            company: user.company || null,
            isAuthenticated: true,
            isLoading: false,
          });
        })
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
          setState(prev => ({ ...prev, isLoading: false }));
        });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response;
      
      localStorage.setItem(TOKEN_KEY, access_token);
      
      setState({
        user,
        company: user.company || null,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return false;
    }
  }, []);

  const register = useCallback(async (
    name: string, 
    email: string, 
    password: string, 
    role: UserRole, 
    companyName?: string
  ): Promise<boolean> => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role, companyName });
      const { access_token, user } = response;
      
      localStorage.setItem(TOKEN_KEY, access_token);
      
      setState({
        user,
        company: user.company || null,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      console.error('Error al registrarse:', error);
      return false;
    }
  }, []);

  const joinCompany = useCallback(async (inviteCode: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/join-company', { inviteCode });
      const { user } = response;
      
      setState(prev => ({
        ...prev,
        user,
        company: user.company || null,
      }));
      
      return true;
    } catch (error) {
      console.error('Error al unirse a la empresa:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({
      user: null,
      company: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    try {
      const updatedUser = await api.put('/users/me', updates);
      setState(prev => ({ ...prev, user: updatedUser }));
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
    }
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    joinCompany,
    updateUser,
  };
}

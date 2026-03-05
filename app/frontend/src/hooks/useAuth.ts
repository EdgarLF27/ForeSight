import { useState, useEffect, useCallback } from 'react';
<<<<<<< HEAD
import { authApi, usersApi } from '@/services/api';
import type { User, Company, UserRole, AuthState } from '@/types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
=======
import type { User, Company, UserRole, AuthState } from '@/types';
import { api } from '@/lib/api';

const TOKEN_KEY = 'ticketclass_token';
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    company: null,
    isAuthenticated: false,
    isLoading: true,
  });

<<<<<<< HEAD
  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);

      if (token && savedUser) {
        try {
          // Verify token is still valid
          const { data } = await usersApi.getMe();
          const user = data;
          
=======
  // Verificar sesión existente al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token) {
      api.get('/auth/me')
        .then(user => {
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
          setState({
            user,
            company: user.company || null,
            isAuthenticated: true,
            isLoading: false,
          });
<<<<<<< HEAD
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setState({
            user: null,
            company: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
=======
        })
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
          setState(prev => ({ ...prev, isLoading: false }));
        });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
<<<<<<< HEAD
      const { data } = await authApi.login(email, password);
      
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      
      setState({
        user: data.user,
        company: data.user.company || null,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return true;
    } catch (error: any) {
      console.error('Login error:', error.response?.data?.message || error.message);
=======
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
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
      return false;
    }
  }, []);

  const register = useCallback(async (
<<<<<<< HEAD
    name: string,
    email: string,
    password: string,
    role: UserRole,
    companyName?: string
  ): Promise<boolean> => {
    try {
      const { data } = await authApi.register({
        name,
        email,
        password,
        role,
        companyName,
      });
      
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      
      setState({
        user: data.user,
        company: data.user.company || null,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return true;
    } catch (error: any) {
      console.error('Register error:', error.response?.data?.message || error.message);
=======
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
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
      return false;
    }
  }, []);

  const joinCompany = useCallback(async (inviteCode: string): Promise<boolean> => {
    try {
<<<<<<< HEAD
      const { data } = await authApi.joinCompany(inviteCode);
      
      // Update user with new company
      const updatedUser = { ...state.user!, companyId: data.user.companyId, company: data.user.company };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        company: data.user.company,
      }));
      
      return true;
    } catch (error: any) {
      console.error('Join company error:', error.response?.data?.message || error.message);
      return false;
    }
  }, [state.user]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
=======
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
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b
    setState({
      user: null,
      company: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    try {
<<<<<<< HEAD
      const { data } = await usersApi.updateMe(updates);
      
      const updatedUser = { ...state.user!, ...data };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      
      setState(prev => ({ ...prev, user: updatedUser }));
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  }, [state.user]);
=======
      const updatedUser = await api.put('/users/me', updates);
      setState(prev => ({ ...prev, user: updatedUser }));
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
    }
  }, []);
>>>>>>> 6f3429e07b8309fafef7c06f473605b95ac0d78b

  return {
    ...state,
    login,
    register,
    logout,
    joinCompany,
    updateUser,
  };
}

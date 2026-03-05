import { useState, useEffect, useCallback } from 'react';
import { authApi, usersApi } from '@/services/api';
import type { User, Company, UserRole, AuthState } from '@/types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    company: null,
    isAuthenticated: false,
    isLoading: true,
  });

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
          
          setState({
            user,
            company: user.company || null,
            isAuthenticated: true,
            isLoading: false,
          });
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
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
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
      return false;
    }
  }, []);

  const joinCompany = useCallback(async (inviteCode: string): Promise<boolean> => {
    try {
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
    setState({
      user: null,
      company: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    try {
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

  return {
    ...state,
    login,
    register,
    logout,
    joinCompany,
    updateUser,
  };
}

/**
 * AuthContext.tsx — Global authentication state for Gharelu Hub
 * Wraps the app and provides auth state + actions to all components.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, profileApi, favoritesApi, type ApiUser } from './api';
import { useApp } from '../store';

interface AuthState {
  user: ApiUser | null;
  loading: boolean;
  isLoggedIn: boolean;
  showAuthModal: boolean;
  authModalMode: 'login' | 'register';
  openLogin: () => void;
  openRegister: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<string | null>;
  loginPhone: (phone: string, password: string) => Promise<string | null>;
  register: (name: string, phone: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<ApiUser, 'name' | 'email' | 'vegMode' | 'addresses'>>) => Promise<string | null>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Load current user from cookie on mount
  const refreshUser = useCallback(async () => {
    const { data } = await authApi.me();
    setUser(data?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (user) {
      favoritesApi.list().then(({ data }) => {
        if (data?.dishIds) {
          useApp.getState().syncFavorites(data.dishIds);
        }
      });
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await authApi.login(email, password);
    if (error) return error;
    setUser(data!.user);
    setShowAuthModal(false);
    return null;
  };

  const loginPhone = async (phone: string, password: string): Promise<string | null> => {
    const { data, error } = await authApi.loginPhone(phone, password);
    if (error) return error;
    setUser(data!.user);
    setShowAuthModal(false);
    return null;
  };

  const register = async (name: string, phone: string, email: string, password: string): Promise<string | null> => {
    const { data, error } = await authApi.register(name, phone, email, password);
    if (error) return error;
    setUser(data!.user);
    setShowAuthModal(false);
    return null;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const updateProfile = async (patch: Partial<Pick<ApiUser, 'name' | 'email' | 'vegMode' | 'addresses'>>): Promise<string | null> => {
    const { data, error } = await profileApi.update(patch);
    if (error) return error;
    setUser(data!.user);
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn: !!user,
        showAuthModal,
        authModalMode,
        openLogin: () => { setAuthModalMode('login'); setShowAuthModal(true); },
        openRegister: () => { setAuthModalMode('register'); setShowAuthModal(true); },
        closeAuthModal: () => setShowAuthModal(false),
        login,
        loginPhone,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

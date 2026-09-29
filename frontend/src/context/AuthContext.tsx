import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError, authLogin, authMe, authRegister, patchMe } from '../lib/api';
import { clearTokens, getAccessToken, setTokens } from '../lib/auth';
import type { RegisterResponse, User } from '../types/api';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (payload: { name: string; email: string; password: string; role: User['role']; department?: string; faculty?: string }) => Promise<User>;
  signOut: () => void;
  refreshUser: () => Promise<User | null>;
  updateUser: (payload: Partial<Pick<User, 'name' | 'department' | 'faculty' | 'avatar'>>) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      return null;
    }
    try {
      const nextUser = await authMe();
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) clearTokens();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    refreshUser().finally(() => {
      if (active) setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [refreshUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const tokens = await authLogin(email, password);
    setTokens(tokens.access, tokens.refresh);
    const nextUser = await authMe();
    setUser(nextUser);
    return nextUser;
  }, []);

  const signUp = useCallback(async (payload: { name: string; email: string; password: string; role: User['role']; department?: string; faculty?: string }) => {
    const response: RegisterResponse = await authRegister(payload);
    setTokens(response.access, response.refresh);
    setUser(response.user);
    return response.user;
  }, []);

  const signOut = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const updateUser = useCallback(async (payload: Partial<Pick<User, 'name' | 'department' | 'faculty' | 'avatar'>>) => {
    const nextUser = await patchMe(payload);
    setUser(nextUser);
    return nextUser;
  }, []);

  const value = useMemo(() => ({ user, isLoading, setUser, signIn, signUp, signOut, refreshUser, updateUser }), [
    user, isLoading, signIn, signUp, signOut, refreshUser, updateUser,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
};

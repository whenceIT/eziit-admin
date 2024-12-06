'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authClient } from '@/lib/auth/client';
import type { User } from '@/types/user';

interface UserContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (first_name: string, last_name: string, email: string, password: string, user_type: string) => Promise<void>;
  signOut: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    setLoading(true);
    const userData = await authClient.getUser();
    setUser(userData);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signIn = async (email: string, password: string) => {
    try {
      const user = await authClient.signIn({ email, password });
      setUser(user);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unexpected error occurred')
    }
  };

  const signUp = async (first_name: string, last_name: string, email: string, password: string, user_type: string) => {
    const user = await authClient.signUp({ first_name, last_name, email, password, user_type });
    setUser(user);
  };

  const signOut = () => {
    authClient.signOut();
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authClient.updateUser(userData);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}
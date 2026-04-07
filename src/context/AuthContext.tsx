'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signin: (email: string, password: string) => Promise<User>;
  signout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('blog_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('blog_user');
      }
    }
    setIsLoading(false);
  }, []);

  const signin = async (email: string, password: string): Promise<User> => {
    const userData = await authService.signin({ email, password });
    setUser(userData);
    localStorage.setItem('blog_user', JSON.stringify(userData));
    return userData;
  };

  const signout = async () => {
    await authService.signout();
    setUser(null);
    localStorage.removeItem('blog_user');
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('blog_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signin, signout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// ============================================================
// AUTH CONTEXT
// ============================================================
// Uses the auth service layer. When you switch to Supabase,
// update src/services/auth.ts — this file stays the same.
//
// For Supabase real-time auth, add onAuthStateChange in useEffect:
// supabase.auth.onAuthStateChange((event, session) => { ... });
// ============================================================

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { User } from '../types';
import * as authService from '../services/auth';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    authService.getCurrentUser()
      .then(u => setUser(u))
      .finally(() => setIsLoading(false));

    // TODO: For Supabase, use onAuthStateChange listener:
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(
    //   async (event, session) => {
    //     if (session?.user) {
    //       const profile = await fetchProfile(session.user.id);
    //       setUser(profile);
    //     } else {
    //       setUser(null);
    //     }
    //     setIsLoading(false);
    //   }
    // );
    // return () => subscription.unsubscribe();
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName: string) => {
    const result = await authService.signUp(email, password, displayName);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return { success: result.success, error: result.error };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.signIn(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return { success: result.success, error: result.error };
  }, []);

  const logout = useCallback(async () => {
    await authService.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

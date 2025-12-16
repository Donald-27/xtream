'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode, DependencyList } from 'react';
import { createClient } from './client';
import { User, Session, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

interface SupabaseContextState {
  supabase: SupabaseClient<Database>;
  user: User | null;
  session: Session | null;
  isUserLoading: boolean;
  userError: Error | null;
}

interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

const SupabaseContext = createContext<SupabaseContextState | undefined>(undefined);

interface SupabaseProviderProps {
  children: ReactNode;
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsUserLoading(false);
        setUserError(null);
      }
    );

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setUserError(error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setIsUserLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const contextValue = useMemo((): SupabaseContextState => ({
    supabase,
    user,
    session,
    isUserLoading,
    userError,
  }), [supabase, user, session, isUserLoading, userError]);

  return (
    <SupabaseContext.Provider value={contextValue}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}

export function useSupabaseClient(): SupabaseClient<Database> {
  const { supabase } = useSupabase();
  return supabase;
}

export function useUser(): UserHookResult {
  const { user, isUserLoading, userError } = useSupabase();
  return { user, isUserLoading, userError };
}

export function useSession() {
  const { session } = useSupabase();
  return session;
}

export function useMemoSupabase<T>(factory: () => T, deps: DependencyList): T {
  return useMemo(factory, deps);
}

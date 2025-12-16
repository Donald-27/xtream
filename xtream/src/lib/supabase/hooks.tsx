'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSupabaseClient } from './provider';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: Error | null;
}

export interface UseDocResult<T> {
  data: WithId<T> | null;
  isLoading: boolean;
  error: Error | null;
}

interface QueryOptions {
  table: string;
  select?: string;
  filters?: Array<{ column: string; operator: string; value: any }>;
  orderBy?: { column: string; ascending?: boolean };
  orderBySecondary?: { column: string; ascending?: boolean };
  limit?: number;
}

export function useCollection<T = any>(
  options: QueryOptions | null | undefined
): UseCollectionResult<T> {
  const supabase = useSupabaseClient();
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const optionsKey = useMemo(() => JSON.stringify(options), [options]);

  useEffect(() => {
    if (!options) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        let query = supabase
          .from(options.table)
          .select(options.select || '*');

        if (options.filters) {
          for (const filter of options.filters) {
            query = query.filter(filter.column, filter.operator, filter.value);
          }
        }

        if (options.orderBy) {
          query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? false });
        }

        if (options.orderBySecondary) {
          query = query.order(options.orderBySecondary.column, { ascending: options.orderBySecondary.ascending ?? false });
        }

        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data: result, error: queryError } = await query;

        if (queryError) {
          setError(new Error(queryError.message));
          setData(null);
        } else {
          setData(result as WithId<T>[]);
          setError(null);
        }
      } catch (err: any) {
        setError(err);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const channel: RealtimeChannel = supabase
      .channel(`${options.table}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: options.table },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.eventType === 'INSERT') {
            setData(prev => prev ? [...prev, payload.new as WithId<T>] : [payload.new as WithId<T>]);
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => prev?.map(item => item.id === payload.new.id ? payload.new as WithId<T> : item) ?? null);
          } else if (payload.eventType === 'DELETE') {
            setData(prev => prev?.filter(item => item.id !== payload.old.id) ?? null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [optionsKey, supabase]);

  return { data, isLoading, error };
}

export function useDoc<T = any>(
  table: string | null | undefined,
  id: string | null | undefined
): UseDocResult<T> {
  const supabase = useSupabaseClient();
  const [data, setData] = useState<WithId<T> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!table || !id) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const fetchDoc = async () => {
      try {
        const { data: result, error: queryError } = await supabase
          .from(table)
          .select('*')
          .eq('id', id)
          .single();

        if (queryError) {
          if (queryError.code === 'PGRST116') {
            setData(null);
            setError(null);
          } else {
            setError(new Error(queryError.message));
            setData(null);
          }
        } else {
          setData(result as WithId<T>);
          setError(null);
        }
      } catch (err: any) {
        setError(err);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoc();

    const channel = supabase
      .channel(`${table}_${id}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `id=eq.${id}` },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.eventType === 'DELETE') {
            setData(null);
          } else {
            setData(payload.new as WithId<T>);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, id, supabase]);

  return { data, isLoading, error };
}

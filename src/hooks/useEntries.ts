// ============================================================
// ENTRIES HOOK
// ============================================================
// Uses the entries service layer. When you switch to Supabase,
// update src/services/entries.ts — this hook stays the same.
//
// For Supabase real-time, add a subscription in the useEffect:
// supabase.channel('entries').on('postgres_changes', ...).subscribe()
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { BlogEntry } from '../types';
import * as entriesService from '../services/entries';

export function useEntries(userId: string | null) {
  const [entries, setEntries] = useState<BlogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load entries when userId changes
  useEffect(() => {
    if (!userId) {
      setEntries([]);
      return;
    }

    setIsLoading(true);
    entriesService.fetchEntries(userId)
      .then(data => setEntries(data))
      .finally(() => setIsLoading(false));

    // TODO: For Supabase real-time, subscribe to changes:
    // const channel = supabase
    //   .channel('entries_changes')
    //   .on('postgres_changes',
    //     { event: '*', schema: 'public', table: 'entries', filter: `user_id=eq.${userId}` },
    //     () => { refetch(); }
    //   )
    //   .subscribe();
    // return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const addEntry = useCallback(async (data: Omit<BlogEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) return null;
    const newEntry = await entriesService.createEntry(userId, data);
    setEntries(prev => [newEntry, ...prev]);
    return newEntry;
  }, [userId]);

  const updateEntry = useCallback(async (id: string, data: Partial<Omit<BlogEntry, 'id' | 'userId' | 'createdAt'>>) => {
    if (!userId) return;
    await entriesService.updateEntry(userId, id, data);
    setEntries(prev =>
      prev.map(e => e.id === id ? { ...e, ...data, updatedAt: Date.now() } : e)
    );
  }, [userId]);

  const deleteEntry = useCallback(async (id: string) => {
    if (!userId) return;
    await entriesService.deleteEntry(userId, id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }, [userId]);

  return { entries, isLoading, addEntry, updateEntry, deleteEntry };
}

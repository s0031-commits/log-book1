// ============================================================
// ENTRIES SERVICE
// ============================================================
// Currently uses localStorage. Replace with Supabase DB calls.
//
// To migrate to Supabase:
// 1. import { supabase } from '../lib/supabase';
// 2. Replace each function body with the Supabase query shown in comments
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import { BlogEntry, getSampleEntries } from '../types';

function getStorageKey(userId: string) {
  return `codelog_entries_${userId}`;
}

/**
 * Fetch all entries for a user
 *
 * TODO: Replace with Supabase:
 * const { data, error } = await supabase
 *   .from('entries')
 *   .select('*')
 *   .eq('user_id', userId)
 *   .order('created_at', { ascending: false });
 * return data.map(mapRowToEntry);
 */
export async function fetchEntries(userId: string): Promise<BlogEntry[]> {
  try {
    const stored = localStorage.getItem(getStorageKey(userId));
    if (stored) {
      return JSON.parse(stored);
    }
    // First time user — seed with samples
    const samples = getSampleEntries(userId);
    localStorage.setItem(getStorageKey(userId), JSON.stringify(samples));
    return samples;
  } catch {
    return getSampleEntries(userId);
  }
}

/**
 * Create a new entry
 *
 * TODO: Replace with Supabase:
 * const { data, error } = await supabase
 *   .from('entries')
 *   .insert({
 *     user_id: userId,
 *     title: data.title,
 *     language: data.language,
 *     code: data.code,
 *     summary: data.summary,
 *     reflection: data.reflection,
 *     tags: data.tags,
 *     date: data.date,
 *   })
 *   .select()
 *   .single();
 * return mapRowToEntry(data);
 */
export async function createEntry(
  userId: string,
  data: Omit<BlogEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<BlogEntry> {
  const now = Date.now();
  const newEntry: BlogEntry = {
    ...data,
    id: uuidv4(),
    userId,
    createdAt: now,
    updatedAt: now,
  };

  const entries = await fetchEntries(userId);
  const updated = [newEntry, ...entries];
  localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));

  return newEntry;
}

/**
 * Update an existing entry
 *
 * TODO: Replace with Supabase:
 * const { error } = await supabase
 *   .from('entries')
 *   .update({
 *     title: data.title,
 *     language: data.language,
 *     code: data.code,
 *     summary: data.summary,
 *     reflection: data.reflection,
 *     tags: data.tags,
 *     date: data.date,
 *     updated_at: new Date().toISOString(),
 *   })
 *   .eq('id', entryId)
 *   .eq('user_id', userId);
 */
export async function updateEntry(
  userId: string,
  entryId: string,
  data: Partial<Omit<BlogEntry, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const entries = await fetchEntries(userId);
  const updated = entries.map(e =>
    e.id === entryId ? { ...e, ...data, updatedAt: Date.now() } : e
  );
  localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
}

/**
 * Delete an entry
 *
 * TODO: Replace with Supabase:
 * const { error } = await supabase
 *   .from('entries')
 *   .delete()
 *   .eq('id', entryId)
 *   .eq('user_id', userId);
 */
export async function deleteEntry(userId: string, entryId: string): Promise<void> {
  const entries = await fetchEntries(userId);
  const updated = entries.filter(e => e.id !== entryId);
  localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
}

import { v4 as uuidv4 } from 'uuid';
import { BlogEntry, getSampleEntries } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function getStorageKey(userId: string) {
  return `codelog_entries_${userId}`;
}

// Helper to map DB row to BlogEntry
function mapRowToEntry(row: any): BlogEntry {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    language: row.language,
    code: row.code,
    summary: row.summary,
    reflection: row.reflection,
    tags: row.tags || [],
    date: row.date,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

export async function fetchEntries(userId: string): Promise<BlogEntry[]> {
  // ------------------------------------------------------------
  // 🚀 SUPABASE MODE
  // ------------------------------------------------------------
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching entries:', error);
      return [];
    }
    return data.map(mapRowToEntry);
  }

  // ------------------------------------------------------------
  // 💾 LOCALSTORAGE MODE
  // ------------------------------------------------------------
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

export async function createEntry(
  userId: string,
  data: Omit<BlogEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<BlogEntry> {
  // ------------------------------------------------------------
  // 🚀 SUPABASE MODE
  // ------------------------------------------------------------
  if (isSupabaseConfigured() && supabase) {
    const { data: row, error } = await supabase
      .from('entries')
      .insert({
        user_id: userId,
        title: data.title,
        language: data.language,
        code: data.code,
        summary: data.summary,
        reflection: data.reflection,
        tags: data.tags,
        date: data.date,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapRowToEntry(row);
  }

  // ------------------------------------------------------------
  // 💾 LOCALSTORAGE MODE
  // ------------------------------------------------------------
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

export async function updateEntry(
  userId: string,
  entryId: string,
  data: Partial<Omit<BlogEntry, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  // ------------------------------------------------------------
  // 🚀 SUPABASE MODE
  // ------------------------------------------------------------
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('entries')
      .update({
        title: data.title,
        language: data.language,
        code: data.code,
        summary: data.summary,
        reflection: data.reflection,
        tags: data.tags,
        date: data.date,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return;
  }

  // ------------------------------------------------------------
  // 💾 LOCALSTORAGE MODE
  // ------------------------------------------------------------
  const entries = await fetchEntries(userId);
  const updated = entries.map(e =>
    e.id === entryId ? { ...e, ...data, updatedAt: Date.now() } : e
  );
  localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
}

export async function deleteEntry(userId: string, entryId: string): Promise<void> {
  // ------------------------------------------------------------
  // 🚀 SUPABASE MODE
  // ------------------------------------------------------------
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return;
  }

  // ------------------------------------------------------------
  // 💾 LOCALSTORAGE MODE
  // ------------------------------------------------------------
  const entries = await fetchEntries(userId);
  const updated = entries.filter(e => e.id !== entryId);
  localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
}

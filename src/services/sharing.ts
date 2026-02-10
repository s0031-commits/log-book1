import { v4 as uuidv4 } from 'uuid';
import { ShareInvite, AcceptedShare, BlogEntry } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ---------- localStorage helpers ----------
function getSharesKey(userId: string) { return `codelog_shares_${userId}`; }
function getAcceptedKey(userId: string) { return `codelog_accepted_${userId}`; }
function getGlobalShareKey(code: string) { return `codelog_invite_${code}`; }

function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code.slice(0, 4) + '-' + code.slice(4);
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
// -----------------------------------------------------------------------

export async function fetchMyShares(userId: string): Promise<ShareInvite[]> {
  // ------------------------------------------------------------
  // 🚀 SUPABASE MODE
  // ------------------------------------------------------------
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('shares')
      .select('*, share_entries(entry_id)')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];
    
    return data.map((row: any) => ({
      id: row.id,
      code: row.code,
      ownerId: row.owner_id,
      ownerName: '', // Not stored on share row, usually joined
      ownerEmail: '',
      label: row.label,
      permission: row.permission,
      createdAt: new Date(row.created_at).getTime(),
      entryIds: row.share_entries.map((se: any) => se.entry_id),
    }));
  }

  // ------------------------------------------------------------
  // 💾 LOCALSTORAGE MODE
  // ------------------------------------------------------------
  try {
    const data = localStorage.getItem(getSharesKey(userId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function fetchAcceptedShares(userId: string): Promise<AcceptedShare[]> {
  // ------------------------------------------------------------
  // 🚀 SUPABASE MODE
  // ------------------------------------------------------------
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('accepted_shares')
      .select(`
        *,
        shares (
          id, code, label,
          profiles (display_name, email)
        )
      `)
      .eq('user_id', userId);

    if (error) return [];

    return data.map((row: any) => ({
      shareId: row.share_id,
      shareCode: row.shares.code,
      ownerId: row.shares.profiles.id, // Profile ID not directly on accepted_share
      ownerName: row.shares.profiles.display_name,
      ownerEmail: row.shares.profiles.email,
      label: row.shares.label,
      acceptedAt: new Date(row.accepted_at).getTime(),
    }));
  }

  // ------------------------------------------------------------
  // 💾 LOCALSTORAGE MODE
  // ------------------------------------------------------------
  try {
    const data = localStorage.getItem(getAcceptedKey(userId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function createShareInvite(
  userId: string,
  ownerName: string,
  ownerEmail: string,
  label: string,
  entryIds: string[],
  entries: BlogEntry[]
): Promise<ShareInvite> {
  const code = generateShareCode();

  // ------------------------------------------------------------
  // 🚀 SUPABASE MODE
  // ------------------------------------------------------------
  if (isSupabaseConfigured() && supabase) {
    // 1. Create Share
    const { data: share, error } = await supabase
      .from('shares')
      .insert({
        code,
        owner_id: userId,
        label,
        permission: 'view',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // 2. Link Entries
    if (entryIds.length > 0) {
      const { error: linkError } = await supabase
        .from('share_entries')
        .insert(entryIds.map(id => ({ share_id: share.id, entry_id: id })));
      
      if (linkError) throw new Error(linkError.message);
    }

    return {
      id: share.id,
      code,
      ownerId: userId,
      ownerName, 
      ownerEmail,
      label,
      permission: 'view',
      createdAt: Date.now(),
      entryIds,
    };
  }

  // ------------------------------------------------------------
  // 💾 LOCALSTORAGE MODE
  // ------------------------------------------------------------
  const invite: ShareInvite = {
    id: uuidv4(),
    code,
    entryIds,
    ownerId: userId,
    ownerName,
    ownerEmail,
    permission: 'view',
    createdAt: Date.now(),
    label: label || 'Shared entries',
  };

  const sharedEntries = entries.filter(e => entryIds.includes(e.id));
  localStorage.setItem(getGlobalShareKey(code), JSON.stringify({ invite, entries: sharedEntries }));

  const myShares = await fetchMyShares(userId);
  myShares.push(invite);
  localStorage.setItem(getSharesKey(userId), JSON.stringify(myShares));

  return invite;
}

export async function revokeShare(userId: string, shareId: string): Promise<void> {
  // ------------------------------------------------------------
  // 🚀 SUPABASE MODE
  // ------------------------------------------------------------
  if (isSupabaseConfigured() && supabase) {
    await supabase.from('shares').delete().eq('id', shareId).eq('owner_id', userId);
    return;
  }

  // ------------------------------------------------------------
  // 💾 LOCALSTORAGE MODE
  // ------------------------------------------------------------
  const myShares = await fetchMyShares(userId);
  const share = myShares.find(s => s.id === shareId);
  if (share) {
    localStorage.removeItem(getGlobalShareKey(share.code));
  }
  const updated = myShares.filter(s => s.id !== shareId);
  localStorage.setItem(getSharesKey(userId), JSON.stringify(updated));
}

export async function acceptInvite(
  userId: string,
  code: string
): Promise<{ success: boolean; accepted?: AcceptedShare; error?: string }> {
  const normalizedCode = code.toUpperCase().trim();

  // ------------------------------------------------------------
  // 🚀 SUPABASE MODE
  // ------------------------------------------------------------
  if (isSupabaseConfigured() && supabase) {
    // 1. Find the share
    const { data: share, error: findError } = await supabase
      .from('shares')
      .select('*, profiles(display_name, email)')
      .eq('code', normalizedCode)
      .single();

    if (findError || !share) return { success: false, error: 'Invalid code' };
    if (share.owner_id === userId) return { success: false, error: "Can't accept own share" };

    // 2. Insert acceptance
    const { error: acceptError } = await supabase
      .from('accepted_shares')
      .insert({ share_id: share.id, user_id: userId });

    if (acceptError) {
      if (acceptError.code === '23505') { // Unique violation
        return { success: false, error: 'You have already accepted this invite.' };
      }
      return { success: false, error: acceptError.message };
    }

    return {
      success: true,
      accepted: {
        shareId: share.id,
        shareCode: share.code,
        ownerId: share.owner_id,
        ownerName: share.profiles.display_name,
        ownerEmail: share.profiles.email,
        label: share.label,
        acceptedAt: Date.now(),
      }
    };
  }

  // ------------------------------------------------------------
  // 💾 LOCALSTORAGE MODE
  // ------------------------------------------------------------
  const accepted = await fetchAcceptedShares(userId);
  if (accepted.some(s => s.shareCode === normalizedCode)) {
    return { success: false, error: 'You have already accepted this invite.' };
  }

  const globalData = localStorage.getItem(getGlobalShareKey(normalizedCode));
  if (!globalData) {
    return { success: false, error: 'Invalid invite code. Please check and try again.' };
  }

  try {
    const { invite } = JSON.parse(globalData) as { invite: ShareInvite; entries: BlogEntry[] };

    if (invite.ownerId === userId) {
      return { success: false, error: "You can't accept your own invite." };
    }

    const newAccepted: AcceptedShare = {
      shareId: invite.id,
      shareCode: normalizedCode,
      ownerId: invite.ownerId,
      ownerName: invite.ownerName,
      ownerEmail: invite.ownerEmail,
      label: invite.label,
      acceptedAt: Date.now(),
    };

    accepted.push(newAccepted);
    localStorage.setItem(getAcceptedKey(userId), JSON.stringify(accepted));

    return { success: true, accepted: newAccepted };
  } catch {
    return { success: false, error: 'Failed to process invite.' };
  }
}

export async function getSharedEntries(code: string): Promise<BlogEntry[]> {
  // ------------------------------------------------------------
  // 🚀 SUPABASE MODE
  // ------------------------------------------------------------
  if (isSupabaseConfigured() && supabase) {
    // Query goes through shares -> share_entries -> entries
    const { data, error } = await supabase
      .from('shares')
      .select(`
        share_entries (
          entries (*)
        )
      `)
      .eq('code', code)
      .single();

    if (error || !data) return [];
    
    // Flatten structure
    return data.share_entries
      .map((se: any) => se.entries ? mapRowToEntry(se.entries) : null)
      .filter((e: any) => e !== null);
  }

  // ------------------------------------------------------------
  // 💾 LOCALSTORAGE MODE
  // ------------------------------------------------------------
  try {
    const globalData = localStorage.getItem(getGlobalShareKey(code));
    if (!globalData) return [];
    const { entries } = JSON.parse(globalData) as { invite: ShareInvite; entries: BlogEntry[] };
    return entries;
  } catch {
    return [];
  }
}

export async function removeAcceptedShare(userId: string, shareCode: string): Promise<void> {
  // ------------------------------------------------------------
  // 🚀 SUPABASE MODE
  // ------------------------------------------------------------
  if (isSupabaseConfigured() && supabase) {
    // Need to find share ID first from code
    const { data: share } = await supabase
      .from('shares')
      .select('id')
      .eq('code', shareCode)
      .single();
      
    if (share) {
      await supabase
        .from('accepted_shares')
        .delete()
        .eq('share_id', share.id)
        .eq('user_id', userId);
    }
    return;
  }

  // ------------------------------------------------------------
  // 💾 LOCALSTORAGE MODE
  // ------------------------------------------------------------
  const accepted = await fetchAcceptedShares(userId);
  const updated = accepted.filter(s => s.shareCode !== shareCode);
  localStorage.setItem(getAcceptedKey(userId), JSON.stringify(updated));
}

export async function refreshShareData(userId: string, entries: BlogEntry[]): Promise<void> {
  // ------------------------------------------------------------
  // 🚀 SUPABASE MODE
  // ------------------------------------------------------------
  if (isSupabaseConfigured()) {
    // No-op for Supabase; data is relational and always fresh
    return;
  }

  // ------------------------------------------------------------
  // 💾 LOCALSTORAGE MODE
  // ------------------------------------------------------------
  const myShares = await fetchMyShares(userId);
  myShares.forEach(share => {
    const sharedEntries = entries.filter(e => share.entryIds.includes(e.id));
    const globalKey = getGlobalShareKey(share.code);
    const existing = localStorage.getItem(globalKey);
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        parsed.entries = sharedEntries;
        localStorage.setItem(globalKey, JSON.stringify(parsed));
      } catch {
        // ignore
      }
    }
  });
}

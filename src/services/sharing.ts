// ============================================================
// SHARING SERVICE
// ============================================================
// Currently uses localStorage. Replace with Supabase DB calls.
//
// To migrate to Supabase:
// 1. import { supabase } from '../lib/supabase';
// 2. Replace each function body with the Supabase queries in comments
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import { ShareInvite, AcceptedShare, BlogEntry } from '../types';

// ---------- localStorage helpers (remove when using Supabase) ----------
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
// -----------------------------------------------------------------------

/**
 * Fetch all shares created by a user
 *
 * TODO: Replace with Supabase:
 * const { data } = await supabase
 *   .from('shares')
 *   .select('*, share_entries(entry_id)')
 *   .eq('owner_id', userId)
 *   .order('created_at', { ascending: false });
 */
export async function fetchMyShares(userId: string): Promise<ShareInvite[]> {
  try {
    const data = localStorage.getItem(getSharesKey(userId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Fetch all shares accepted by a user
 *
 * TODO: Replace with Supabase:
 * const { data } = await supabase
 *   .from('accepted_shares')
 *   .select('*, shares(*, profiles(display_name, email))')
 *   .eq('user_id', userId);
 */
export async function fetchAcceptedShares(userId: string): Promise<AcceptedShare[]> {
  try {
    const data = localStorage.getItem(getAcceptedKey(userId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Create a new share invite
 *
 * TODO: Replace with Supabase:
 * const code = generateShareCode();
 * const { data: share } = await supabase
 *   .from('shares')
 *   .insert({ code, owner_id: userId, label, permission: 'view' })
 *   .select()
 *   .single();
 * await supabase.from('share_entries').insert(
 *   entryIds.map(id => ({ share_id: share.id, entry_id: id }))
 * );
 */
export async function createShareInvite(
  userId: string,
  ownerName: string,
  ownerEmail: string,
  label: string,
  entryIds: string[],
  entries: BlogEntry[]
): Promise<ShareInvite> {
  const code = generateShareCode();
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

  // Store globally so other users can find it
  const sharedEntries = entries.filter(e => entryIds.includes(e.id));
  localStorage.setItem(getGlobalShareKey(code), JSON.stringify({ invite, entries: sharedEntries }));

  // Store in user's shares list
  const myShares = await fetchMyShares(userId);
  myShares.push(invite);
  localStorage.setItem(getSharesKey(userId), JSON.stringify(myShares));

  return invite;
}

/**
 * Revoke a share
 *
 * TODO: Replace with Supabase:
 * await supabase.from('shares').delete().eq('id', shareId).eq('owner_id', userId);
 * (cascade will delete share_entries and accepted_shares)
 */
export async function revokeShare(userId: string, shareId: string): Promise<void> {
  const myShares = await fetchMyShares(userId);
  const share = myShares.find(s => s.id === shareId);
  if (share) {
    localStorage.removeItem(getGlobalShareKey(share.code));
  }
  const updated = myShares.filter(s => s.id !== shareId);
  localStorage.setItem(getSharesKey(userId), JSON.stringify(updated));
}

/**
 * Accept an invite by code
 *
 * TODO: Replace with Supabase:
 * const { data: share } = await supabase
 *   .from('shares')
 *   .select('*, profiles(display_name, email)')
 *   .eq('code', code)
 *   .single();
 * if (!share) return { success: false, error: 'Invalid code' };
 * if (share.owner_id === userId) return { success: false, error: "Can't accept own share" };
 * const { error } = await supabase
 *   .from('accepted_shares')
 *   .insert({ share_id: share.id, user_id: userId });
 */
export async function acceptInvite(
  userId: string,
  code: string
): Promise<{ success: boolean; accepted?: AcceptedShare; error?: string }> {
  const normalizedCode = code.toUpperCase().trim();

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

/**
 * Get shared entries for a specific share code
 *
 * TODO: Replace with Supabase:
 * const { data: share } = await supabase
 *   .from('shares')
 *   .select('share_entries(entries(*))')
 *   .eq('code', code)
 *   .single();
 * return share.share_entries.map(se => mapRowToEntry(se.entries));
 */
export async function getSharedEntries(code: string): Promise<BlogEntry[]> {
  try {
    const globalData = localStorage.getItem(getGlobalShareKey(code));
    if (!globalData) return [];
    const { entries } = JSON.parse(globalData) as { invite: ShareInvite; entries: BlogEntry[] };
    return entries;
  } catch {
    return [];
  }
}

/**
 * Remove an accepted share
 *
 * TODO: Replace with Supabase:
 * await supabase
 *   .from('accepted_shares')
 *   .delete()
 *   .eq('share_id', shareId)
 *   .eq('user_id', userId);
 */
export async function removeAcceptedShare(userId: string, shareCode: string): Promise<void> {
  const accepted = await fetchAcceptedShares(userId);
  const updated = accepted.filter(s => s.shareCode !== shareCode);
  localStorage.setItem(getAcceptedKey(userId), JSON.stringify(updated));
}

/**
 * Refresh shared entry data when source entries change
 *
 * TODO: With Supabase this is automatic since share_entries references
 * the entries table. You can use Supabase Realtime to listen for changes.
 * This function becomes a no-op.
 */
export async function refreshShareData(userId: string, entries: BlogEntry[]): Promise<void> {
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

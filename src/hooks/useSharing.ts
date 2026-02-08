// ============================================================
// SHARING HOOK
// ============================================================
// Uses the sharing service layer. When you switch to Supabase,
// update src/services/sharing.ts — this hook stays the same.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { ShareInvite, AcceptedShare, BlogEntry } from '../types';
import * as sharingService from '../services/sharing';

export function useSharing(userId: string | null) {
  const [myShares, setMyShares] = useState<ShareInvite[]>([]);
  const [acceptedShares, setAcceptedShares] = useState<AcceptedShare[]>([]);

  // Load sharing data
  useEffect(() => {
    if (!userId) {
      setMyShares([]);
      setAcceptedShares([]);
      return;
    }

    Promise.all([
      sharingService.fetchMyShares(userId),
      sharingService.fetchAcceptedShares(userId),
    ]).then(([shares, accepted]) => {
      setMyShares(shares);
      setAcceptedShares(accepted);
    });
  }, [userId]);

  const createShare = useCallback(async (
    entryIds: string[],
    ownerName: string,
    ownerEmail: string,
    label: string,
    entries: BlogEntry[]
  ) => {
    if (!userId) return null;
    const invite = await sharingService.createShareInvite(
      userId, ownerName, ownerEmail, label, entryIds, entries
    );
    setMyShares(prev => [...prev, invite]);
    return invite;
  }, [userId]);

  const revokeShare = useCallback(async (shareId: string) => {
    if (!userId) return;
    await sharingService.revokeShare(userId, shareId);
    setMyShares(prev => prev.filter(s => s.id !== shareId));
  }, [userId]);

  const acceptInvite = useCallback(async (code: string) => {
    if (!userId) return { success: false, error: 'Not logged in' };
    const result = await sharingService.acceptInvite(userId, code);
    if (result.success && result.accepted) {
      setAcceptedShares(prev => [...prev, result.accepted!]);
    }
    return { success: result.success, error: result.error };
  }, [userId]);

  const getSharedEntries = useCallback(async (code: string) => {
    return sharingService.getSharedEntries(code);
  }, []);

  const removeAcceptedShare = useCallback(async (code: string) => {
    if (!userId) return;
    await sharingService.removeAcceptedShare(userId, code);
    setAcceptedShares(prev => prev.filter(s => s.shareCode !== code));
  }, [userId]);

  const refreshShareData = useCallback(async (entries: BlogEntry[]) => {
    if (!userId) return;
    await sharingService.refreshShareData(userId, entries);
  }, [userId]);

  return {
    myShares,
    acceptedShares,
    createShare,
    revokeShare,
    acceptInvite,
    getSharedEntries,
    removeAcceptedShare,
    refreshShareData,
  };
}

// ============================================================
// AUTH SERVICE
// ============================================================
// Currently uses localStorage. Replace with Supabase Auth calls.
//
// To migrate to Supabase:
// 1. import { supabase } from '../lib/supabase';
// 2. Replace each function body with the Supabase call shown in comments
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import { User, AVATAR_COLORS } from '../types';

// ---------- localStorage helpers (remove when using Supabase) ----------
function getAccounts(): Record<string, { user: User; passwordHash: string }> {
  try {
    const data = localStorage.getItem('codelog_accounts');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveAccounts(accounts: Record<string, { user: User; passwordHash: string }>) {
  localStorage.setItem('codelog_accounts', JSON.stringify(accounts));
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}
// -----------------------------------------------------------------------

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Sign up a new user
 *
 * TODO: Replace with Supabase:
 * const { data, error } = await supabase.auth.signUp({
 *   email,
 *   password,
 *   options: {
 *     data: { display_name: displayName, avatar_color: avatarColor }
 *   }
 * });
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResult> {
  const normalizedEmail = email.toLowerCase().trim();
  const accounts = getAccounts();

  if (accounts[normalizedEmail]) {
    return { success: false, error: 'An account with this email already exists.' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const newUser: User = {
    id: uuidv4(),
    email: normalizedEmail,
    displayName: displayName.trim(),
    avatarColor,
    createdAt: Date.now(),
  };

  accounts[normalizedEmail] = { user: newUser, passwordHash: simpleHash(password) };
  saveAccounts(accounts);
  localStorage.setItem('codelog_session', newUser.id);

  return { success: true, user: newUser };
}

/**
 * Sign in an existing user
 *
 * TODO: Replace with Supabase:
 * const { data, error } = await supabase.auth.signInWithPassword({ email, password });
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.toLowerCase().trim();
  const accounts = getAccounts();
  const account = accounts[normalizedEmail];

  if (!account) {
    return { success: false, error: 'No account found with this email.' };
  }
  if (account.passwordHash !== simpleHash(password)) {
    return { success: false, error: 'Incorrect password.' };
  }

  localStorage.setItem('codelog_session', account.user.id);
  return { success: true, user: account.user };
}

/**
 * Sign out the current user
 *
 * TODO: Replace with Supabase:
 * await supabase.auth.signOut();
 */
export async function signOut(): Promise<void> {
  localStorage.removeItem('codelog_session');
}

/**
 * Get the currently logged-in user (restore session)
 *
 * TODO: Replace with Supabase:
 * const { data: { user } } = await supabase.auth.getUser();
 * if (user) {
 *   const { data: profile } = await supabase
 *     .from('profiles')
 *     .select('*')
 *     .eq('id', user.id)
 *     .single();
 *   return mapProfileToUser(profile);
 * }
 */
export async function getCurrentUser(): Promise<User | null> {
  const sessionUserId = localStorage.getItem('codelog_session');
  if (!sessionUserId) return null;

  const accounts = getAccounts();
  const account = Object.values(accounts).find(a => a.user.id === sessionUserId);
  return account?.user ?? null;
}

/**
 * Update user profile
 *
 * TODO: Replace with Supabase:
 * const { error } = await supabase
 *   .from('profiles')
 *   .update({ display_name: updates.displayName, avatar_color: updates.avatarColor })
 *   .eq('id', userId);
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<User, 'displayName' | 'avatarColor'>>
): Promise<{ success: boolean; error?: string }> {
  const accounts = getAccounts();
  const account = Object.values(accounts).find(a => a.user.id === userId);
  if (!account) return { success: false, error: 'User not found' };

  const updatedUser = { ...account.user, ...updates };
  accounts[account.user.email] = { ...account, user: updatedUser };
  saveAccounts(accounts);
  return { success: true };
}

/**
 * Listen for auth state changes
 *
 * TODO: Replace with Supabase:
 * supabase.auth.onAuthStateChange((event, session) => {
 *   if (session?.user) {
 *     // Fetch profile and call callback
 *   } else {
 *     callback(null);
 *   }
 * });
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  // For localStorage, we just check on init — no real-time subscription
  getCurrentUser().then(callback);

  // Return unsubscribe function (no-op for localStorage)
  return () => {};
}

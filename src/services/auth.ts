import { v4 as uuidv4 } from 'uuid';
import { User, AVATAR_COLORS } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ---------- localStorage helpers ----------
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

// Map Supabase profile to User type
function mapProfileToUser(profile: any): User {
  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.display_name,
    avatarColor: profile.avatar_color,
    createdAt: new Date(profile.created_at).getTime(),
  };
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResult> {
  // ------------------------------------------------------------
  // 🚀 SUPABASE MODE
  // ------------------------------------------------------------
  if (isSupabaseConfigured() && supabase) {
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          avatar_color: avatarColor,
        },
      },
    });

    if (error) return { success: false, error: error.message };
    if (data.user) {
      // We manually construct the user object because the trigger might take a ms to run
      // In a real app we might wait or fetch the profile, but this is faster for UI
      return { 
        success: true, 
        user: {
          id: data.user.id,
          email: email,
          displayName: displayName,
          avatarColor: avatarColor,
          createdAt: Date.now()
        }
      };
    }
    return { success: false, error: 'Signup failed.' };
  }

  // ------------------------------------------------------------
  // 💾 LOCALSTORAGE MODE
  // ------------------------------------------------------------
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

export async function signIn(email: string, password: string): Promise<AuthResult> {
  // ------------------------------------------------------------
  // 🚀 SUPABASE MODE
  // ------------------------------------------------------------
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { success: false, error: error.message };
    
    // Fetch profile to get display name and avatar
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profile) {
        return { success: true, user: mapProfileToUser(profile) };
      }
    }
    return { success: false, error: 'Login succeeded but profile not found.' };
  }

  // ------------------------------------------------------------
  // 💾 LOCALSTORAGE MODE
  // ------------------------------------------------------------
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

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    await supabase.auth.signOut();
  } else {
    localStorage.removeItem('codelog_session');
  }
}

export async function getCurrentUser(): Promise<User | null> {
  // ------------------------------------------------------------
  // 🚀 SUPABASE MODE
  // ------------------------------------------------------------
  if (isSupabaseConfigured() && supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return profile ? mapProfileToUser(profile) : null;
  }

  // ------------------------------------------------------------
  // 💾 LOCALSTORAGE MODE
  // ------------------------------------------------------------
  const sessionUserId = localStorage.getItem('codelog_session');
  if (!sessionUserId) return null;

  const accounts = getAccounts();
  const account = Object.values(accounts).find(a => a.user.id === sessionUserId);
  return account?.user ?? null;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<User, 'displayName' | 'avatarColor'>>
): Promise<{ success: boolean; error?: string }> {
  // ------------------------------------------------------------
  // 🚀 SUPABASE MODE
  // ------------------------------------------------------------
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: updates.displayName,
        avatar_color: updates.avatarColor,
      })
      .eq('id', userId);

    return { success: !error, error: error?.message };
  }

  // ------------------------------------------------------------
  // 💾 LOCALSTORAGE MODE
  // ------------------------------------------------------------
  const accounts = getAccounts();
  const account = Object.values(accounts).find(a => a.user.id === userId);
  if (!account) return { success: false, error: 'User not found' };

  const updatedUser = { ...account.user, ...updates };
  accounts[account.user.email] = { ...account, user: updatedUser };
  saveAccounts(accounts);
  return { success: true };
}

export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  // ------------------------------------------------------------
  // 🚀 SUPABASE MODE
  // ------------------------------------------------------------
  if (isSupabaseConfigured() && supabase) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch full profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        callback(profile ? mapProfileToUser(profile) : null);
      } else {
        callback(null);
      }
    });
    return () => subscription.unsubscribe();
  }

  // ------------------------------------------------------------
  // 💾 LOCALSTORAGE MODE
  // ------------------------------------------------------------
  getCurrentUser().then(callback);
  return () => {};
}

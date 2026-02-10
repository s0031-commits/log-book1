
import { createClient } from '@supabase/supabase-js';

// ============================================================
// 🚀 SUPABASE SETUP (Optional)
// ============================================================
// To enable cloud sync & real user auth:
// 1. Run: npm install @supabase/supabase-js
// 2. Create project at https://supabase.com
// 3. Paste your keys below
// ============================================================

// 👇 PASTE KEYS HERE TO ENABLE BACKEND 👇
const SUPABASE_URL = 'https://uvtpsbvogdfvyudctfwr.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dHBzYnZvZ2Rmdnl1ZGN0ZndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjIwNjAsImV4cCI6MjA4NjEzODA2MH0.yvjJnbKDAjtKsUApOHkQLsj-ThLAdqIoFgmFHpF3LVM';

// Check if keys are configured
export const isSupabaseConfigured = () => {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
};

// Export client (or null if not configured)
export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ============================================================
// 📜 DATABASE SCHEMA (Run this in Supabase SQL Editor)
// ============================================================
/*
-- 1. Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text not null,
  avatar_color text not null default '#10b981',
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Public profiles" on public.profiles for select to authenticated using (true);
create policy "User update own" on public.profiles for update to authenticated using (auth.uid() = id);

-- Trigger for new users
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_color)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), coalesce(new.raw_user_meta_data->>'avatar_color', '#10b981'));
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- 2. Entries table
create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  language text not null,
  code text not null default '',
  summary text default '',
  reflection text default '',
  tags text[] default '{}',
  date date not null default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.entries enable row level security;
create policy "Users view own" on public.entries for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own" on public.entries for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own" on public.entries for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own" on public.entries for delete to authenticated using (auth.uid() = user_id);

-- 3. Shares table
create table public.shares (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  label text not null default 'Shared entries',
  permission text not null default 'view',
  created_at timestamptz default now()
);
alter table public.shares enable row level security;
create policy "Users view own shares" on public.shares for select to authenticated using (auth.uid() = owner_id);
create policy "Users insert shares" on public.shares for insert to authenticated with check (auth.uid() = owner_id);
create policy "Users delete shares" on public.shares for delete to authenticated using (auth.uid() = owner_id);
create policy "Public lookup by code" on public.shares for select to authenticated using (true);

-- 4. Share Entries (Junction)
create table public.share_entries (
  share_id uuid references public.shares(id) on delete cascade,
  entry_id uuid references public.entries(id) on delete cascade,
  primary key (share_id, entry_id)
);
alter table public.share_entries enable row level security;
create policy "Public view share entries" on public.share_entries for select to authenticated using (true);
create policy "Owner insert share entries" on public.share_entries for insert to authenticated with check (exists (select 1 from public.shares where id = share_id and owner_id = auth.uid()));

-- 5. Accepted Shares
create table public.accepted_shares (
  id uuid primary key default gen_random_uuid(),
  share_id uuid references public.shares(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  accepted_at timestamptz default now(),
  unique(share_id, user_id)
);
alter table public.accepted_shares enable row level security;
create policy "Users view accepted" on public.accepted_shares for select to authenticated using (auth.uid() = user_id);
create policy "Users insert accepted" on public.accepted_shares for insert to authenticated with check (auth.uid() = user_id);
create policy "Users delete accepted" on public.accepted_shares for delete to authenticated using (auth.uid() = user_id);

-- 6. Shared Access Policy (Critical)
create policy "View shared entries" on public.entries for select to authenticated using (
  exists (
    select 1 from public.share_entries se
    join public.shares s on s.id = se.share_id
    join public.accepted_shares a on a.share_id = s.id
    where se.entry_id = entries.id and a.user_id = auth.uid()
  )
);
*/

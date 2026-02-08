// ============================================================
// SUPABASE CLIENT — Fill this in when you have your project
// ============================================================
// 1. npm install @supabase/supabase-js
// 2. Create a Supabase project at https://supabase.com
// 3. Uncomment below and add your credentials
// ============================================================

// ──────────────────────────────────────────────────
// 👇 PASTE YOUR SUPABASE KEYS HERE 👇
// ──────────────────────────────────────────────────
// import { createClient } from '@supabase/supabase-js';
//
// const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';   // ← paste your Project URL
// const SUPABASE_ANON_KEY = 'eyJ...your-anon-key-here';         // ← paste your anon/public key
//
// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ──────────────────────────────────────────────────

// ============================================================
// REQUIRED SUPABASE TABLES — Run this SQL in your Supabase SQL Editor:
// ============================================================
/*

-- 1. Profiles table (extends Supabase Auth users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text not null,
  avatar_color text not null default '#10b981',
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Users can read any profile (needed for sharing)
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated using (true);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated using (auth.uid() = id);

-- Auto-create profile on signup (trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_color)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_color', '#10b981')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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

-- Users can CRUD their own entries
create policy "Users can view own entries"
  on public.entries for select
  to authenticated using (auth.uid() = user_id);

create policy "Users can insert own entries"
  on public.entries for insert
  to authenticated with check (auth.uid() = user_id);

create policy "Users can update own entries"
  on public.entries for update
  to authenticated using (auth.uid() = user_id);

create policy "Users can delete own entries"
  on public.entries for delete
  to authenticated using (auth.uid() = user_id);

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

create policy "Users can view own shares"
  on public.shares for select
  to authenticated using (auth.uid() = owner_id);

create policy "Users can insert own shares"
  on public.shares for insert
  to authenticated with check (auth.uid() = owner_id);

create policy "Users can delete own shares"
  on public.shares for delete
  to authenticated using (auth.uid() = owner_id);

-- Anyone authenticated can look up a share by code (for joining)
create policy "Anyone can lookup shares by code"
  on public.shares for select
  to authenticated using (true);

-- 4. Share-entries junction table
create table public.share_entries (
  share_id uuid references public.shares(id) on delete cascade,
  entry_id uuid references public.entries(id) on delete cascade,
  primary key (share_id, entry_id)
);

alter table public.share_entries enable row level security;

create policy "Share entries viewable by share owner"
  on public.share_entries for select
  to authenticated using (true);

create policy "Share entries insertable by share owner"
  on public.share_entries for insert
  to authenticated with check (
    exists (select 1 from public.shares where id = share_id and owner_id = auth.uid())
  );

-- 5. Accepted shares table
create table public.accepted_shares (
  id uuid primary key default gen_random_uuid(),
  share_id uuid references public.shares(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  accepted_at timestamptz default now(),
  unique(share_id, user_id)
);

alter table public.accepted_shares enable row level security;

create policy "Users can view own accepted shares"
  on public.accepted_shares for select
  to authenticated using (auth.uid() = user_id);

create policy "Users can insert accepted shares"
  on public.accepted_shares for insert
  to authenticated with check (auth.uid() = user_id);

create policy "Users can delete own accepted shares"
  on public.accepted_shares for delete
  to authenticated using (auth.uid() = user_id);

-- 6. View for shared entries (users can read entries shared with them)
create policy "Users can view entries shared with them"
  on public.entries for select
  to authenticated using (
    exists (
      select 1 from public.share_entries se
      join public.shares s on s.id = se.share_id
      join public.accepted_shares a on a.share_id = s.id
      where se.entry_id = entries.id
      and a.user_id = auth.uid()
    )
  );

*/

// Placeholder export so imports don't break
export const supabase = null;

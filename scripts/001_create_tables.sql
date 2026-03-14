-- Profiles table (auto-created on signup via trigger)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, company)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'company', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'in-progress', 'completed', 'paused')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  start_date date,
  estimated_end date,
  technologies text[] default '{}',
  image_url text,
  goals text[] default '{}',
  notion_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects enable row level security;

create policy "projects_select_own" on public.projects for select using (auth.uid() = user_id);
create policy "projects_insert_own" on public.projects for insert with check (auth.uid() = user_id);
create policy "projects_update_own" on public.projects for update using (auth.uid() = user_id);
create policy "projects_delete_own" on public.projects for delete using (auth.uid() = user_id);

-- Websites table
create table if not exists public.websites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  url text not null,
  status text not null default 'online' check (status in ('online', 'offline', 'maintenance')),
  uptime numeric(5,2) default 99.9,
  last_checked text default 'Just now',
  response_time integer default 200,
  visitors_total integer default 0,
  visitors_change numeric(5,1) default 0,
  bounce_rate numeric(5,1) default 0,
  top_referrers jsonb default '[]',
  traffic_by_country jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.websites enable row level security;

create policy "websites_select_own" on public.websites for select using (auth.uid() = user_id);
create policy "websites_insert_own" on public.websites for insert with check (auth.uid() = user_id);
create policy "websites_update_own" on public.websites for update using (auth.uid() = user_id);
create policy "websites_delete_own" on public.websites for delete using (auth.uid() = user_id);

-- Subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null,
  price numeric(10,2) not null,
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'quarterly', 'yearly')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'past_due')),
  next_billing date,
  start_date date,
  features text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own" on public.subscriptions for select using (auth.uid() = user_id);
create policy "subscriptions_update_own" on public.subscriptions for update using (auth.uid() = user_id);

-- Documents table
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  type text not null check (type in ('contract', 'proposal', 'invoice', 'report', 'design')),
  size text,
  file_url text,
  uploaded_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.documents enable row level security;

create policy "documents_select_own" on public.documents for select using (auth.uid() = user_id);
create policy "documents_insert_own" on public.documents for insert with check (auth.uid() = user_id);
create policy "documents_delete_own" on public.documents for delete using (auth.uid() = user_id);

-- Bookings table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  time text not null,
  call_type text not null default 'general' check (call_type in ('general', 'technical', 'strategy', 'urgent')),
  notes text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
  created_at timestamptz default now()
);

alter table public.bookings enable row level security;

create policy "bookings_select_own" on public.bookings for select using (auth.uid() = user_id);
create policy "bookings_insert_own" on public.bookings for insert with check (auth.uid() = user_id);
create policy "bookings_update_own" on public.bookings for update using (auth.uid() = user_id);

-- Time slots table (managed by admin/you)
create table if not exists public.time_slots (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time text not null,
  available boolean not null default true,
  created_at timestamptz default now()
);

-- Time slots are readable by all authenticated users
alter table public.time_slots enable row level security;

create policy "time_slots_select_authenticated" on public.time_slots for select using (auth.role() = 'authenticated');

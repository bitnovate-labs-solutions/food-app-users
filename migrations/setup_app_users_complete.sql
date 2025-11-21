-- Complete setup script for app_users table and trigger
-- Run this script in order to set up everything needed

-- ============================================
-- STEP 1: Create the app_users table
-- ============================================
create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null,
  display_name text,
  email text unique not null,
  referral_code text unique not null,
  referred_by_user_id uuid references app_users(id),
  
  -- Points system
  points_balance integer default 0 check (points_balance >= 0),
  total_points_earned integer default 0,
  
  -- Location tracking
  current_latitude numeric(10, 8),
  current_longitude numeric(11, 8),
  location_updated_at timestamptz,
  
  -- Treasure hunt state
  active_treasure_hunt_id uuid,
  preferred_mode text default 'solo' check (preferred_mode in ('solo', 'team')),
  
  -- Status
  status text default 'active' check (status in ('active','suspended','deleted')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- STEP 2: Create indexes
-- ============================================
create index if not exists idx_app_users_auth_user_id on app_users(auth_user_id);
create index if not exists idx_app_users_email on app_users(email);
create index if not exists idx_app_users_referral_code on app_users(referral_code);
create index if not exists idx_app_users_location on app_users(current_latitude, current_longitude) 
  where current_latitude is not null and current_longitude is not null;
create index if not exists idx_app_users_active_hunt on app_users(active_treasure_hunt_id) 
  where active_treasure_hunt_id is not null;
create index if not exists idx_app_users_points on app_users(total_points_earned desc, points_balance desc);
create index if not exists idx_app_users_status on app_users(status) where status = 'active';

-- ============================================
-- STEP 3: Set up RLS (Row Level Security)
-- ============================================
-- Enable RLS
alter table app_users enable row level security;

-- Policy: Users can view their own record
drop policy if exists "Users can view their own record" on app_users;
create policy "Users can view their own record"
on app_users
for select
using (auth.uid() = auth_user_id);

-- Policy: Users can update their own record
drop policy if exists "Users can update their own record" on app_users;
create policy "Users can update their own record"
on app_users
for update
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

-- Policy: Service role can insert users (for trigger)
drop policy if exists "Service role can insert users" on app_users;
create policy "Service role can insert users"
on app_users
for insert
to service_role
with check (true);

-- ============================================
-- STEP 4: Create referral code generation function
-- ============================================
create or replace function generate_referral_code()
returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- ============================================
-- STEP 5: Create trigger function (SIMPLIFIED)
-- ============================================
create or replace function handle_new_user()
returns trigger as $$
declare
  referral_code text;
begin
  -- Generate a unique referral code using UUID (first 8 chars, uppercase, no dashes)
  referral_code := upper(replace(substr(new.id::text, 1, 8) || substr(md5(random()::text), 1, 4), '-', ''));
  
  -- Ensure it's unique (very unlikely collision, but just in case)
  while exists (select 1 from public.app_users where app_users.referral_code = referral_code) loop
    referral_code := upper(replace(substr(gen_random_uuid()::text, 1, 8) || substr(md5(random()::text), 1, 4), '-', ''));
  end loop;

  -- Insert into app_users table
  insert into public.app_users (
    auth_user_id,
    display_name,
    email,
    referral_code,
    points_balance,
    total_points_earned,
    status
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email,
    referral_code,
    0,
    0,
    'active'
  )
  on conflict (auth_user_id) do nothing;

  return new;
exception
  when others then
    -- Log error but don't fail auth signup
    raise warning 'Error creating app_users record for user %: %', new.id, sqlerrm;
    return new;
end;
$$ language plpgsql security definer
set search_path = public;

-- ============================================
-- STEP 6: Create trigger
-- ============================================
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- STEP 7: Grant permissions
-- ============================================
grant usage on schema public to authenticated;
grant select, update on public.app_users to authenticated;
grant execute on function handle_new_user() to authenticated;
grant execute on function generate_referral_code() to authenticated;

-- ============================================
-- Verification queries (run these to check)
-- ============================================
-- Check if table exists
-- select * from information_schema.tables where table_name = 'app_users';

-- Check if trigger exists
-- select * from pg_trigger where tgname = 'on_auth_user_created';

-- Check if function exists
-- select * from pg_proc where proname = 'handle_new_user';

-- Check RLS policies
-- select * from pg_policies where tablename = 'app_users';


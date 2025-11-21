-- Simplified app_users table WITHOUT role field
-- Use this if you don't need role-based permissions

create table app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  display_name text,
  email text unique,
  referral_code text unique,
  referred_by_user_id uuid references app_users(id),
  
  -- Points system
  points_balance integer default 0 check (points_balance >= 0),
  total_points_earned integer default 0,
  
  -- Location tracking
  current_latitude numeric(10, 8),
  current_longitude numeric(11, 8),
  location_updated_at timestamptz,
  
  -- Treasure hunt state
  active_treasure_hunt_id uuid, -- references treasure_hunts(id)
  preferred_mode text default 'solo' check (preferred_mode in ('solo', 'team')),
  
  -- Status only (no role needed)
  status text default 'active' check (status in ('active','suspended','deleted')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- If you need vendor management, create a separate table:
-- create table vendors (
--   id uuid primary key default gen_random_uuid(),
--   user_id uuid references app_users(id),
--   business_name text,
--   -- vendor-specific fields
-- );

-- If you need admin functionality, use a separate table or RLS policies:
-- create table admin_users (
--   user_id uuid references app_users(id) primary key,
--   admin_level text check (admin_level in ('super_admin', 'moderator')),
--   created_at timestamptz default now()
-- );


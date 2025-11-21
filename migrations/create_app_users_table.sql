-- Create app_users table for treasure hunt app
-- This table stores all user data including points, location, and treasure hunt state

create table app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null,
  display_name text,
  email text unique not null,
  referral_code text unique not null,
  referred_by_user_id uuid references app_users(id),
  
  -- Points system (CRITICAL for rewards, discounts, leaderboards)
  points_balance integer default 0 check (points_balance >= 0),
  total_points_earned integer default 0,
  
  -- Location tracking (for "near you" suggestions)
  current_latitude numeric(10, 8),
  current_longitude numeric(11, 8),
  location_updated_at timestamptz,
  
  -- Treasure hunt state
  active_treasure_hunt_id uuid, -- references treasure_hunts(id) - add FK later
  preferred_mode text default 'solo' check (preferred_mode in ('solo', 'team')),
  
  -- Status (no role field - all users are regular users)
  status text default 'active' check (status in ('active','suspended','deleted')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index idx_app_users_auth_user_id on app_users(auth_user_id);
create index idx_app_users_email on app_users(email);
create index idx_app_users_referral_code on app_users(referral_code);
create index idx_app_users_location on app_users(current_latitude, current_longitude) 
  where current_latitude is not null and current_longitude is not null;
create index idx_app_users_active_hunt on app_users(active_treasure_hunt_id) 
  where active_treasure_hunt_id is not null;
create index idx_app_users_points on app_users(total_points_earned desc, points_balance desc);
create index idx_app_users_status on app_users(status) where status = 'active';


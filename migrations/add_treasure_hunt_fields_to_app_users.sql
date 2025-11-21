-- Add fields to app_users table for treasure hunt functionality

-- Points system (CRITICAL for rewards, discounts, leaderboards)
alter table app_users 
  add column if not exists points_balance integer default 0 check (points_balance >= 0),
  add column if not exists total_points_earned integer default 0;

-- Location tracking (for "near you" suggestions)
alter table app_users
  add column if not exists current_latitude numeric(10, 8),
  add column if not exists current_longitude numeric(11, 8),
  add column if not exists location_updated_at timestamptz;

-- Treasure hunt state
alter table app_users
  add column if not exists active_treasure_hunt_id uuid, -- references treasure_hunts(id) - add FK later
  add column if not exists preferred_mode text default 'solo' check (preferred_mode in ('solo', 'team'));

-- Add index for location-based queries (for "near you" suggestions)
create index if not exists idx_app_users_location on app_users(current_latitude, current_longitude) 
  where current_latitude is not null and current_longitude is not null;

-- Add index for active treasure hunts
create index if not exists idx_app_users_active_hunt on app_users(active_treasure_hunt_id) 
  where active_treasure_hunt_id is not null;

-- Add index for points leaderboard queries
create index if not exists idx_app_users_points on app_users(total_points_earned desc, points_balance desc);


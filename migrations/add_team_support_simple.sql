-- SIMPLEST approach: Add team support with just one column
-- This assumes users can only be in one team at a time (which matches the current UI)

-- Add team leader reference to app_users
alter table app_users
  add column if not exists current_team_leader_id uuid references app_users(id) on delete set null;

-- Add index for team queries
create index if not exists idx_app_users_team_leader on app_users(current_team_leader_id) 
  where current_team_leader_id is not null;

-- How it works:
-- 1. When a user starts a new team hunt, they become the leader (current_team_leader_id = NULL for them)
-- 2. When someone joins via referral code, set their current_team_leader_id to the leader's user ID
-- 3. To get team members: SELECT * FROM app_users WHERE current_team_leader_id = leader_id OR id = leader_id
-- 4. To leave a team: UPDATE app_users SET current_team_leader_id = NULL WHERE id = user_id


-- Create treasure_hunt_teams table
-- This table manages team relationships for treasure hunts

create table treasure_hunt_teams (
  id uuid primary key default gen_random_uuid(),
  team_leader_id uuid not null references app_users(id) on delete cascade,
  team_name text, -- Optional: allow teams to have custom names
  team_referral_code text unique not null, -- Same as leader's referral code for simplicity
  
  -- Team status
  status text default 'active' check (status in ('active', 'disbanded', 'completed')),
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create team_members table (many-to-many relationship)
-- This tracks which users belong to which teams
create table treasure_hunt_team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references treasure_hunt_teams(id) on delete cascade,
  user_id uuid not null references app_users(id) on delete cascade,
  
  -- Member status
  status text default 'active' check (status in ('active', 'left', 'removed')),
  is_leader boolean default false,
  
  -- Metadata
  joined_at timestamptz default now(),
  left_at timestamptz,
  
  -- Ensure a user can only be in a team once
  unique(team_id, user_id)
);

-- Indexes for performance
create index idx_teams_leader on treasure_hunt_teams(team_leader_id);
create index idx_teams_referral_code on treasure_hunt_teams(team_referral_code);
create index idx_teams_status on treasure_hunt_teams(status) where status = 'active';

create index idx_team_members_team on treasure_hunt_team_members(team_id);
create index idx_team_members_user on treasure_hunt_team_members(user_id);
create index idx_team_members_status on treasure_hunt_team_members(team_id, status) where status = 'active';

-- Function to automatically create a team when a user becomes a leader
-- This can be called when a user starts a new team hunt
create or replace function create_team_for_user(user_uuid uuid)
returns uuid as $$
declare
  team_id uuid;
  user_referral_code text;
begin
  -- Get the user's referral code
  select referral_code into user_referral_code
  from app_users
  where id = user_uuid;
  
  if user_referral_code is null then
    raise exception 'User referral code not found';
  end if;
  
  -- Create the team
  insert into treasure_hunt_teams (team_leader_id, team_referral_code)
  values (user_uuid, user_referral_code)
  returning id into team_id;
  
  -- Add the leader as a team member
  insert into treasure_hunt_team_members (team_id, user_id, is_leader, status)
  values (team_id, user_uuid, true, 'active');
  
  return team_id;
end;
$$ language plpgsql security definer;

-- Function to add a member to a team by referral code
create or replace function join_team_by_referral_code(
  user_uuid uuid,
  referral_code_input text
)
returns uuid as $$
declare
  team_id uuid;
  existing_member boolean;
begin
  -- Find the team by referral code
  select id into team_id
  from treasure_hunt_teams
  where team_referral_code = upper(referral_code_input)
    and status = 'active';
  
  if team_id is null then
    raise exception 'Team not found with referral code: %', referral_code_input;
  end if;
  
  -- Check if user is already a member
  select exists(
    select 1 from treasure_hunt_team_members
    where team_id = team_id
      and user_id = user_uuid
      and status = 'active'
  ) into existing_member;
  
  if existing_member then
    raise exception 'User is already a member of this team';
  end if;
  
  -- Add user to team
  insert into treasure_hunt_team_members (team_id, user_id, is_leader, status)
  values (team_id, user_uuid, false, 'active');
  
  return team_id;
end;
$$ language plpgsql security definer;

-- Grant permissions
grant usage on schema public to authenticated;
grant select, insert, update on treasure_hunt_teams to authenticated;
grant select, insert, update on treasure_hunt_team_members to authenticated;
grant execute on function create_team_for_user(uuid) to authenticated;
grant execute on function join_team_by_referral_code(uuid, text) to authenticated;


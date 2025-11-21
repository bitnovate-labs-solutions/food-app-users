-- MINIMAL VERSION - As simple as possible
-- This is the simplest version that should work

create or replace function handle_new_user()
returns trigger as $$
begin
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
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    upper(substr(replace(new.id::text, '-', ''), 1, 12)), -- Simple referral code from UUID
    0,
    0,
    'active'
  )
  on conflict (auth_user_id) do nothing;

  return new;
exception
  when others then
    -- Don't fail auth signup - just log the error
    raise warning 'Error in handle_new_user: %', sqlerrm;
    return new;
end;
$$ language plpgsql security definer
set search_path = public;

-- Drop and recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


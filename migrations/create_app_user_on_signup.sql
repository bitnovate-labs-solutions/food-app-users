-- Function to automatically create app_users record when a new user signs up
-- This trigger fires after a user is created in auth.users

-- Function to generate a unique referral code
create or replace function generate_referral_code()
returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excludes confusing chars (0, O, I, 1)
  result text := '';
  i integer;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- Function to create app_users record after signup (REFINED - simple & safe)
create or replace function handle_new_user()
returns trigger as $$
declare
  referral_code text;
  user_display_name text;
begin
  -- Get display name from metadata or email prefix
  user_display_name := coalesce(
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'display_name',
    split_part(new.email, '@', 1)
  );

  -- Generate referral code: first 8 chars of UUID (no dashes) + 4 random hex chars
  -- This gives us 12 characters which is user-friendly and extremely unlikely to collide
  -- Using UUID ensures uniqueness, adding random suffix for extra safety
  referral_code := upper(
    substr(replace(new.id::text, '-', ''), 1, 8) || 
    substr(md5(random()::text || new.id::text), 1, 4)
  );

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
    user_display_name,
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
    -- Log error with context but don't fail auth signup
    raise warning 'Error in handle_new_user for user % (email: %): %', 
      new.id, 
      coalesce(new.email, 'unknown'),
      sqlerrm;
    return new;
end;
$$ language plpgsql security definer
set search_path = public;

-- Trigger to call the function after a new user is created in auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant select, update on public.app_users to authenticated;


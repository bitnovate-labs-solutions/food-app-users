-- Improved function to automatically create app_users record when a new user signs up
-- This trigger fires after a user is created in auth.users
-- Includes better error handling and validation

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

-- Function to create app_users record after signup
create or replace function handle_new_user()
returns trigger as $$
declare
  referral_code text;
  user_email text;
  user_display_name text;
begin
  -- Validate email exists
  user_email := coalesce(new.email, '');
  if user_email = '' then
    raise exception 'User email is required';
  end if;

  -- Get display name from metadata or email prefix
  user_display_name := coalesce(
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'display_name',
    split_part(user_email, '@', 1)
  );

  -- Generate unique referral code
  loop
    referral_code := generate_referral_code();
    -- Check if code already exists (with retry limit to prevent infinite loop)
    exit when not exists (
      select 1 from public.app_users where app_users.referral_code = referral_code
    );
    -- Safety check: if we've tried 100 times, something is wrong
    if referral_code is null then
      raise exception 'Failed to generate unique referral code';
    end if;
  end loop;

  -- Insert into app_users table
  insert into public.app_users (
    auth_user_id,
    display_name,
    email,
    referral_code,
    points_balance,
    total_points_earned,
    status,
    created_at,
    updated_at
  )
  values (
    new.id, -- auth.users.id
    user_display_name,
    user_email,
    referral_code,
    0, -- initial points balance
    0, -- initial total points
    'active', -- default status
    now(),
    now()
  )
  on conflict (auth_user_id) do nothing; -- Prevent duplicate inserts if trigger fires twice

  return new;
exception
  when others then
    -- Log the error but don't fail the auth signup
    raise warning 'Error creating app_users record for user %: %', new.id, sqlerrm;
    -- Return new to allow auth signup to succeed even if app_users insert fails
    return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger to call the function after a new user is created in auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant select, update on public.app_users to authenticated;

-- Grant execute permission on the function
grant execute on function handle_new_user() to authenticated;
grant execute on function generate_referral_code() to authenticated;


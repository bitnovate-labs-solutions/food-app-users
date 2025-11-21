-- Enable pg_net extension for HTTP requests
-- Note: This extension must be enabled in Supabase Dashboard > Database > Extensions
-- The extension creates functions in the 'net' schema automatically
create extension if not exists pg_net;

-- IMPORTANT: Before using this function, you must set the following configuration:
-- ALTER DATABASE postgres SET app.settings.edge_url = 'https://your-project-ref.supabase.co/functions/v1';
-- ALTER DATABASE postgres SET app.settings.service_role_key = 'your-service-role-key';
-- 
-- Or set them per session:
-- SET app.settings.edge_url = 'https://your-project-ref.supabase.co/functions/v1';
-- SET app.settings.service_role_key = 'your-service-role-key';

-- Function to handle profile deletion and cleanup storage
-- This trigger fires after a profile is deleted from the profiles table
create or replace function handle_profile_deleted()
returns trigger as $$
declare
  edge_url text;
  service_role_key text;
  request_id bigint;
begin
  -- Get configuration from settings
  edge_url := current_setting('app.settings.edge_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);

  -- Validate settings exist
  if edge_url is null or service_role_key is null then
    raise warning 'Missing app.settings.edge_url or app.settings.service_role_key - skipping storage cleanup for profile %', old.id;
    return old;
  end if;

  -- Make HTTP POST request to Edge Function
  -- Note: net.http_post returns a request ID (bigint), not the response
  -- The request is asynchronous, so we don't wait for the result
  -- Using positional parameters (pg_net may not support named parameters)
  request_id := net.http_post(
    edge_url || '/cleanup-user-storage',
    jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    jsonb_build_object('profile_id', old.id)
  );

  -- Log the request ID for debugging (optional)
  raise notice 'Storage cleanup request sent for profile % (request_id: %)', old.id, request_id;

  return old;
exception
  when others then
    -- Log error but don't fail the deletion
    raise warning 'Error sending storage cleanup request for profile %: %', old.id, sqlerrm;
    return old;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists
drop trigger if exists on_profile_deleted on public.profiles;

-- Create trigger to call the function after a profile is deleted
create trigger on_profile_deleted
  after delete on public.profiles
  for each row execute function handle_profile_deleted();

-- Grant necessary permissions
grant execute on function handle_profile_deleted() to authenticated;


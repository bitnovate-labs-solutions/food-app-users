-- Debug script to check what's wrong with the trigger

-- 1. Check if table exists
select 
  'Table exists: ' || case when exists (select 1 from information_schema.tables where table_name = 'app_users') 
    then 'YES' else 'NO' end as check_table;

-- 2. Check table structure
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_name = 'app_users'
order by ordinal_position;

-- 3. Check if function exists
select 
  'Function exists: ' || case when exists (select 1 from pg_proc where proname = 'handle_new_user') 
    then 'YES' else 'NO' end as check_function;

-- 4. Check function definition
select pg_get_functiondef(oid) as function_definition
from pg_proc
where proname = 'handle_new_user';

-- 5. Check if trigger exists
select 
  'Trigger exists: ' || case when exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') 
    then 'YES' else 'NO' end as check_trigger;

-- 6. Check trigger details
select 
  tgname as trigger_name,
  tgtype::text as trigger_type,
  tgenabled as enabled,
  pg_get_triggerdef(oid) as trigger_definition
from pg_trigger
where tgname = 'on_auth_user_created';

-- 7. Check RLS policies
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where tablename = 'app_users';

-- 8. Test manual insert (replace with test values)
-- Uncomment and modify to test:
/*
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
  gen_random_uuid(),
  'Test User',
  'test@example.com',
  'TEST1234',
  0,
  0,
  'active'
);
*/

-- 9. Check recent errors in PostgreSQL logs
-- (Run this in Supabase Dashboard > Logs > Database)


# Troubleshooting "Database error saving new user"

## Common Issues and Solutions

### 1. **Table doesn't exist**
Make sure you've run the table creation script first:
```sql
-- Run this FIRST
\i migrations/create_app_users_table.sql
```

### 2. **RLS Policies blocking insert**
The trigger runs with `security definer` which should bypass RLS, but check if there are any policies:
```sql
-- Check RLS policies
select * from pg_policies where tablename = 'app_users';

-- If needed, allow service role to insert
create policy "Service role can insert users"
on app_users
for insert
to service_role
with check (true);
```

### 3. **Check if trigger exists**
```sql
-- Check if trigger exists
select * from pg_trigger where tgname = 'on_auth_user_created';

-- Check if function exists
select * from pg_proc where proname = 'handle_new_user';
```

### 4. **Test the function manually**
```sql
-- Test referral code generation
select generate_referral_code();

-- Test the trigger function (replace with actual auth.users id)
-- Note: This is just to test the logic, not the actual trigger
```

### 5. **Check Supabase logs**
In Supabase Dashboard:
- Go to Logs > Database
- Look for errors related to `handle_new_user` or `app_users`

### 6. **Verify table structure matches**
```sql
-- Check table structure
\d app_users

-- Should have these NOT NULL columns:
-- auth_user_id, email, referral_code
```

### 7. **Temporary workaround: Disable trigger**
If you need to debug, temporarily disable the trigger:
```sql
-- Disable trigger
alter table auth.users disable trigger on_auth_user_created;

-- Re-enable trigger
alter table auth.users enable trigger on_auth_user_created;
```

### 8. **Manual insert test**
Test if you can insert manually (replace values):
```sql
insert into app_users (
  auth_user_id,
  display_name,
  email,
  referral_code,
  points_balance,
  total_points_earned,
  status
) values (
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Test User',
  'test@example.com',
  'TEST1234',
  0,
  0,
  'active'
);
```

## Migration Order

1. **First**: Create the table
   ```sql
   \i migrations/create_app_users_table.sql
   ```

2. **Second**: Create the trigger function
   ```sql
   \i migrations/create_app_user_on_signup.sql
   ```

3. **Verify**: Check everything is set up
   ```sql
   select * from pg_trigger where tgname = 'on_auth_user_created';
   select * from pg_proc where proname = 'handle_new_user';
   ```


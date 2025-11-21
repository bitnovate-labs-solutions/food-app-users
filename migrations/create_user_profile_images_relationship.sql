-- Update user_profile_images table to reference app_users instead of user_profiles
-- This fixes the relationship error: "Could not find a relationship between 'app_users' and 'user_profile_images'"

-- Step 1: Drop the old foreign key constraint (if it exists)
alter table user_profile_images 
  drop constraint if exists user_profile_images_user_profile_id_fkey;

-- Step 2: Add new foreign key constraint pointing to app_users.id
alter table user_profile_images
  add constraint user_profile_images_app_user_id_fkey 
  foreign key (user_profile_id) references app_users(id) on delete cascade;

-- Note: The column name stays as user_profile_id for backward compatibility,
-- but the foreign key now points to app_users.id instead of user_profiles.id
-- This allows existing queries to continue working while fixing the relationship


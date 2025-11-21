-- Add user profile fields to app_users table
-- This migration adds the necessary fields for user profile information
-- Note: education and occupation are NOT included as per requirements

-- Add phone number field
alter table app_users 
  add column if not exists phone_number text;

-- Add age field (stored as integer)
alter table app_users
  add column if not exists age integer;

-- Add birthdate field (alternative to age, stored as date)
alter table app_users
  add column if not exists birthdate date;

-- Note: email already exists in the app_users table schema
-- Note: education and occupation are intentionally NOT added


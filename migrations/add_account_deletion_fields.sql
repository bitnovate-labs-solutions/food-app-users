-- Add account deletion fields to app_users table
-- These fields store information about why and when a user deleted their account

ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS deletion_reason text,
  ADD COLUMN IF NOT EXISTS deletion_reason_other text,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Add index for querying deleted accounts
CREATE INDEX IF NOT EXISTS idx_app_users_deleted_at ON app_users(deleted_at)
  WHERE deleted_at IS NOT NULL;

-- Notes:
-- - deletion_reason: Stores the selected reason from the predefined list
-- - deletion_reason_other: Stores custom text if user selected "Other"
-- - deleted_at: Timestamp when the account was deleted (set when status changes to 'deleted')
-- - These fields are optional and only populated when account is deleted


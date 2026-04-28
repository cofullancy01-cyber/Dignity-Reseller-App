/*
  # Add Approval Status to Profiles

  1. Schema Changes
    - Add `approval_status` column to profiles table
    - Values: 'approved' (default), 'pending', 'rejected'
    - This enables the admin to approve/reject new reseller registrations

  2. Security
    - New users default to 'pending' approval status
    - Only admins/super_admins can update approval_status
    - Existing profiles are set to 'approved' so current users aren't locked out

  3. RLS Updates
    - Add policy for admins to update approval_status
*/

-- Add approval_status column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'approved'
  CHECK (approval_status IN ('approved', 'pending', 'rejected'));

-- Set existing profiles to approved (they were created before this feature)
UPDATE profiles SET approval_status = 'approved' WHERE approval_status IS NULL;

-- Change default for new registrations to 'pending'
ALTER TABLE profiles ALTER COLUMN approval_status SET DEFAULT 'pending';

-- Add index for quick pending-approval lookups
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON profiles(approval_status);

-- Add RLS policy for admins to update approval_status
CREATE POLICY "Admins can update approval status"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

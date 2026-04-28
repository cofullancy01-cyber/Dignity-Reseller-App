/*
  # Add Role Column and Create Super Admin Account

  1. Schema Changes
    - Add `role` column to profiles table (text, default 'user')
    - Values: 'super_admin', 'admin', 'user'
    - This distinguishes Super Admins (full control) from regular Admins

  2. Super Admin Account
    - Create auth user for Dr. Vivian (vivian@dignityorganicsanitaries.com)
    - Set profile role to 'super_admin' and is_admin to true
    - Password: Dignity2026!

  3. Security
    - Updated RLS policies for admin actions check role IN ('admin', 'super_admin')
*/

-- Add role column to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user';
  END IF;
END $$;

-- Update existing is_admin=true profiles to have role='admin'
UPDATE profiles SET role = 'admin' WHERE is_admin = true AND role = 'user';

-- Create the Super Admin auth user only if email doesn't exist
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'vivian@dignityorganicsanitaries.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token,
      raw_app_meta_data,
      raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'vivian@dignityorganicsanitaries.com',
      crypt('Dignity2026!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '',
      '',
      '',
      '',
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Dr. Vivian"}'
    )
    RETURNING id INTO new_user_id;

    -- The trigger will auto-create the profile, but we need to update it
    -- Use a small delay approach: update after trigger runs
    UPDATE profiles
    SET
      is_admin = true,
      role = 'super_admin',
      full_name = 'Dr. Vivian'
    WHERE id = new_user_id;
  ELSE
    -- User exists, just ensure profile is set as super admin
    UPDATE profiles
    SET
      is_admin = true,
      role = 'super_admin',
      full_name = 'Dr. Vivian'
    WHERE email = 'vivian@dignityorganicsanitaries.com';
  END IF;
END $$;

-- Update RLS policies to check role for admin actions
DROP POLICY IF EXISTS "Admins can insert training videos" ON training_videos;
CREATE POLICY "Admins can insert training videos"
  ON training_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "Admins can update training videos" ON training_videos;
CREATE POLICY "Admins can update training videos"
  ON training_videos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "Admins can delete training videos" ON training_videos;
CREATE POLICY "Admins can delete training videos"
  ON training_videos FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "Admins can insert events" ON events;
CREATE POLICY "Admins can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "Admins can update events" ON events;
CREATE POLICY "Admins can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

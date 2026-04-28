/*
  # Add Helper Functions and RLS Policies

  1. New Functions
    - `increment_likes(post_id uuid)`: Increments likes_count on a post
    - `decrement_likes(post_id uuid)`: Decrements likes_count on a post
    - `increment_comments(post_id uuid)`: Increments comments_count on a post
    - `handle_new_user()`: Auto-creates profile when user signs up

  2. New Triggers
    - `on_auth_user_created`: Calls handle_new_user() after user insertion

  3. RLS Policies
    - profiles: users can read all, update own
    - posts: authenticated users can read all, insert own, update own, delete own
    - post_comments: authenticated users can read all, insert own, delete own
    - post_likes: authenticated users can read all, insert own, delete own
    - training_videos: anyone can read, admins can insert/update/delete
    - sales: users can read own, insert own
    - notifications: users can read own, update own
    - events: anyone can read, admins can insert
    - live_streams: anyone can read, authenticated can insert
    - stream_comments: anyone can read, authenticated can insert

  4. Security
    - All policies require authentication unless data is truly public
    - Admin-only write access for training_videos and events
*/

-- Helper functions for post interactions
CREATE OR REPLACE FUNCTION increment_likes(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE posts SET likes_count = likes_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_likes(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_comments(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE posts SET comments_count = comments_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================
-- PROFILES RLS POLICIES
-- =====================
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================
-- POSTS RLS POLICIES
-- =====================
DROP POLICY IF EXISTS "Authenticated users can view posts" ON posts;
CREATE POLICY "Authenticated users can view posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create own posts" ON posts;
CREATE POLICY "Users can create own posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================
-- POST COMMENTS RLS POLICIES
-- =====================
DROP POLICY IF EXISTS "Authenticated users can view comments" ON post_comments;
CREATE POLICY "Authenticated users can view comments"
  ON post_comments FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create own comments" ON post_comments;
CREATE POLICY "Users can create own comments"
  ON post_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON post_comments;
CREATE POLICY "Users can delete own comments"
  ON post_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================
-- POST LIKES RLS POLICIES
-- =====================
DROP POLICY IF EXISTS "Authenticated users can view likes" ON post_likes;
CREATE POLICY "Authenticated users can view likes"
  ON post_likes FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create own likes" ON post_likes;
CREATE POLICY "Users can create own likes"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own likes" ON post_likes;
CREATE POLICY "Users can delete own likes"
  ON post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================
-- TRAINING VIDEOS RLS POLICIES
-- =====================
DROP POLICY IF EXISTS "Anyone can view training videos" ON training_videos;
CREATE POLICY "Anyone can view training videos"
  ON training_videos FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert training videos" ON training_videos;
CREATE POLICY "Admins can insert training videos"
  ON training_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "Admins can update training videos" ON training_videos;
CREATE POLICY "Admins can update training videos"
  ON training_videos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "Admins can delete training videos" ON training_videos;
CREATE POLICY "Admins can delete training videos"
  ON training_videos FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- =====================
-- SALES RLS POLICIES
-- =====================
DROP POLICY IF EXISTS "Users can view own sales" ON sales;
CREATE POLICY "Users can view own sales"
  ON sales FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sales" ON sales;
CREATE POLICY "Users can insert own sales"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================
-- NOTIFICATIONS RLS POLICIES
-- =====================
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================
-- EVENTS RLS POLICIES
-- =====================
DROP POLICY IF EXISTS "Anyone can view events" ON events;
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert events" ON events;
CREATE POLICY "Admins can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

DROP POLICY IF EXISTS "Admins can update events" ON events;
CREATE POLICY "Admins can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- =====================
-- LIVE STREAMS RLS POLICIES
-- =====================
DROP POLICY IF EXISTS "Anyone can view live streams" ON live_streams;
CREATE POLICY "Anyone can view live streams"
  ON live_streams FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create own streams" ON live_streams;
CREATE POLICY "Users can create own streams"
  ON live_streams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

-- =====================
-- STREAM COMMENTS RLS POLICIES
-- =====================
DROP POLICY IF EXISTS "Anyone can view stream comments" ON stream_comments;
CREATE POLICY "Anyone can view stream comments"
  ON stream_comments FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can create own stream comments" ON stream_comments;
CREATE POLICY "Users can create own stream comments"
  ON stream_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

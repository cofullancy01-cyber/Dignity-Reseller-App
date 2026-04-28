export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  region: string | null;
  avatar_url: string | null;
  total_sales: number;
  total_earnings: number;
  rank: string;
  is_admin: boolean;
  role: 'super_admin' | 'admin' | 'user';
  approval_status: 'approved' | 'pending' | 'rejected';
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profile?: Profile;
  is_liked?: boolean;
};

export type PostComment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
};

export type PostLike = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

export type TrainingVideo = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string | null;
  duration: number | null;
  views_count: number;
  created_at: string;
};

export type Sale = {
  id: string;
  user_id: string;
  product_name: string;
  quantity: number;
  amount: number;
  customer_name: string | null;
  customer_phone: string | null;
  status: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export type LiveStream = {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_live: boolean;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  viewer_count: number;
  created_at: string;
  profile?: Profile;
};

export type StreamComment = {
  id: string;
  stream_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
};

export type Event = {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  scheduled_at: string;
  location: string | null;
  created_by: string;
  created_at: string;
  profile?: Profile;
};

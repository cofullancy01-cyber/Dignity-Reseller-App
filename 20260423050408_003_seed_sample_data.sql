/*
  # Seed Sample Data

  1. Training Videos
    - 6 sample training videos across categories (Sales, Marketing, Leadership, Product)

  Note: Events require a user profile reference, so they will be created
  when the first admin user signs up. User-specific data (posts, sales, 
  notifications) will be created dynamically as users interact with the app.
*/

-- Training Videos
INSERT INTO training_videos (title, description, video_url, thumbnail_url, category, duration, views_count) VALUES
  ('Mastering Cold Calls', 'Learn the art of cold calling with proven scripts and techniques that convert prospects into customers.', 'https://example.com/videos/cold-calls', 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400', 'Sales', 1845, 342),
  ('Social Media Sales Strategy', 'Discover how to leverage social media platforms to generate leads and close deals online.', 'https://example.com/videos/social-media', 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400', 'Marketing', 2400, 528),
  ('Leadership in Sales Teams', 'Build and lead high-performing sales teams with effective management strategies.', 'https://example.com/videos/leadership', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400', 'Leadership', 3120, 189),
  ('Product Demo Best Practices', 'Create compelling product demonstrations that highlight value and drive conversions.', 'https://example.com/videos/product-demo', 'https://images.pexels.com/photos/3184460/pexels-photo-3184460.jpeg?auto=compress&cs=tinysrgb&w=400', 'Product', 1560, 415),
  ('Negotiation Mastery', 'Advanced negotiation techniques to close bigger deals and build lasting partnerships.', 'https://example.com/videos/negotiation', 'https://images.pexels.com/photos/3184328/pexels-photo-3184328.jpeg?auto=compress&cs=tinysrgb&w=400', 'Sales', 2760, 267),
  ('Content Marketing for Sales', 'Use content marketing to attract qualified leads and nurture them through your sales funnel.', 'https://example.com/videos/content-marketing', 'https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=400', 'Marketing', 1980, 378);

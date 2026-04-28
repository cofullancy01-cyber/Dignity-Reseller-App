import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Colors, FontFamilies, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { Post } from '@/types/database';
import { Heart, MessageCircle, Send, Image as ImageIcon, Users } from 'lucide-react-native';
import { FadeInFromBelow } from '@/components/Animations';

export default function CommunityScreen() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = useCallback(async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, profile:profiles(*)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data && user) {
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id);
      const likedIds = new Set(likes?.map((l) => l.post_id) ?? []);
      setPosts(data.map((p) => ({ ...p, is_liked: likedIds.has(p.id) })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    setPosting(true);
    const { data } = await supabase
      .from('posts')
      .insert({ user_id: user.id, content: newPost.trim() })
      .select('*, profile:profiles(*)')
      .single();

    if (data) {
      setPosts([{ ...data, is_liked: false }, ...posts]);
      setNewPost('');
    }
    setPosting(false);
  };

  const toggleLike = async (post: Post) => {
    if (!user) return;

    if (post.is_liked) {
      await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', user.id);
      await supabase.rpc('decrement_likes', { post_id: post.id });
      setPosts(posts.map((p) =>
        p.id === post.id ? { ...p, is_liked: false, likes_count: p.likes_count - 1 } : p
      ));
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id });
      await supabase.rpc('increment_likes', { post_id: post.id });
      setPosts(posts.map((p) =>
        p.id === post.id ? { ...p, is_liked: true, likes_count: p.likes_count + 1 } : p
      ));
    }
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const initials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <LinearGradient colors={['#4A1942', '#6B2D6B']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Users size={22} color={Colors.white} />
              <Text style={styles.headerTitle}>Community</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Compose */}
      <View style={styles.composeCard}>
        <View style={styles.composeAvatar}>
          <Text style={styles.composeAvatarText}>{initials(profile?.full_name || 'U')}</Text>
        </View>
        <View style={styles.composeInputWrap}>
          <TextInput
            style={styles.composeInput}
            placeholder="Share a win, tip, or question..."
            placeholderTextColor={Colors.textTertiary}
            value={newPost}
            onChangeText={setNewPost}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.postButton, (!newPost.trim() || posting) && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={!newPost.trim() || posting}
          >
            {posting ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Send size={16} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.mediumPurple} />}
        contentContainerStyle={styles.feed}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.mediumPurple} style={styles.loader} />
        ) : posts.length === 0 ? (
          <View style={styles.empty}>
            <Users size={48} color={Colors.neutral[300]} />
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptyText}>Be the first to share something!</Text>
          </View>
        ) : (
          posts.map((post, i) => (
            <FadeInFromBelow key={post.id} delay={i * 50}>
              <View style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.avatar}>
                    {post.profile?.avatar_url ? (
                      <Image source={{ uri: post.profile.avatar_url }} style={styles.avatarImg} />
                    ) : (
                      <LinearGradient colors={[Colors.mediumPurple, Colors.purple]} style={styles.avatarGrad}>
                        <Text style={styles.avatarText}>
                          {initials(post.profile?.full_name || '?')}
                        </Text>
                      </LinearGradient>
                    )}
                  </View>
                  <View style={styles.postMeta}>
                    <Text style={styles.posterName}>{post.profile?.full_name || 'User'}</Text>
                    <Text style={styles.postTime}>{formatTime(post.created_at)}</Text>
                  </View>
                  {(post.profile?.is_admin) && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminBadgeText}>Admin</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.postContent}>{post.content}</Text>

                {post.image_url && (
                  <Image source={{ uri: post.image_url }} style={styles.postImage} />
                )}

                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.postAction} onPress={() => toggleLike(post)}>
                    <Heart
                      size={18}
                      color={post.is_liked ? Colors.error[500] : Colors.textTertiary}
                      fill={post.is_liked ? Colors.error[500] : 'transparent'}
                    />
                    <Text style={[styles.postActionText, post.is_liked && styles.postActionActive]}>
                      {post.likes_count}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postAction}>
                    <MessageCircle size={18} color={Colors.textTertiary} />
                    <Text style={styles.postActionText}>{post.comments_count}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </FadeInFromBelow>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    paddingBottom: Spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontFamily: FontFamilies.heading,
    fontSize: Typography.xxl,
    color: Colors.white,
    letterSpacing: 1,
  },
  composeCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  composeAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.mediumPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composeAvatarText: {
    fontFamily: FontFamilies.headingMedium,
    fontSize: Typography.sm,
    color: Colors.white,
  },
  composeInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 44,
  },
  composeInput: {
    flex: 1,
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.md,
    color: Colors.text,
    maxHeight: 100,
    paddingTop: 0,
    paddingBottom: 0,
  },
  postButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.mediumPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonDisabled: {
    backgroundColor: Colors.neutral[300],
  },
  feed: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  loader: {
    marginTop: Spacing.xxl,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontFamily: FontFamilies.headingMedium,
    fontSize: Typography.xl,
    color: Colors.text,
  },
  emptyText: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.md,
    color: Colors.textSecondary,
  },
  postCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  avatarImg: {
    width: 40,
    height: 40,
  },
  avatarGrad: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamilies.headingMedium,
    fontSize: Typography.sm,
    color: Colors.white,
  },
  postMeta: {
    flex: 1,
  },
  posterName: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: Typography.md,
    color: Colors.text,
  },
  postTime: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  adminBadge: {
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  adminBadgeText: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.xs,
    color: Colors.purple,
  },
  postContent: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.md,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    resizeMode: 'cover',
  },
  postActions: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  postActionText: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  postActionActive: {
    color: Colors.error[500],
  },
});

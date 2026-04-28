import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Colors, FontFamilies, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { TrainingVideo } from '@/types/database';
import { BookOpen, Search, Play, Clock, Eye } from 'lucide-react-native';
import { FadeInFromBelow } from '@/components/Animations';

const CATEGORIES = ['All', 'Sales', 'Marketing', 'Leadership', 'Product'];

export default function TrainingScreen() {
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [filtered, setFiltered] = useState<TrainingVideo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadVideos = useCallback(async () => {
    const { data } = await supabase
      .from('training_videos')
      .select('*')
      .order('views_count', { ascending: false });

    if (data) {
      setVideos(data);
      setFiltered(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  useEffect(() => {
    let result = videos;
    if (selectedCategory !== 'All') {
      result = result.filter((v) => v.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          (v.description?.toLowerCase().includes(q) ?? false)
      );
    }
    setFiltered(result);
  }, [videos, selectedCategory, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVideos();
    setRefreshing(false);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatViews = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4A1942', '#6B2D6B']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <BookOpen size={22} color={Colors.white} />
              <Text style={styles.headerTitle}>Training Library</Text>
            </View>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Search size={16} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search videos..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Categories */}
      <View style={styles.categoriesWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.mediumPurple} />
        }
        contentContainerStyle={styles.videoList}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.mediumPurple} style={styles.loader} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <BookOpen size={48} color={Colors.neutral[300]} />
            <Text style={styles.emptyTitle}>No videos found</Text>
            <Text style={styles.emptyText}>Try a different category or search term</Text>
          </View>
        ) : (
          filtered.map((video, i) => (
            <FadeInFromBelow key={video.id} delay={i * 60}>
              <TouchableOpacity style={styles.videoCard} activeOpacity={0.85}>
                <View style={styles.thumbnailContainer}>
                  {video.thumbnail_url ? (
                    <Image source={{ uri: video.thumbnail_url }} style={styles.thumbnail} />
                  ) : (
                    <LinearGradient colors={[Colors.primary[200], Colors.primary[400]]} style={styles.thumbnail} />
                  )}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.playOverlay}>
                    <View style={styles.playBtn}>
                      <Play size={20} color={Colors.white} fill={Colors.white} />
                    </View>
                  </View>
                  {video.duration && (
                    <View style={styles.durationBadge}>
                      <Clock size={10} color={Colors.white} />
                      <Text style={styles.durationText}>{formatDuration(video.duration)}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.videoMeta}>
                  <View style={styles.videoHeader}>
                    <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                    {video.category && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{video.category}</Text>
                      </View>
                    )}
                  </View>
                  {video.description && (
                    <Text style={styles.videoDescription} numberOfLines={2}>
                      {video.description}
                    </Text>
                  )}
                  <View style={styles.videoStats}>
                    <View style={styles.videoStat}>
                      <Eye size={13} color={Colors.textTertiary} />
                      <Text style={styles.videoStatText}>{formatViews(video.views_count)} views</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </FadeInFromBelow>
          ))
        )}
      </ScrollView>
    </View>
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
    marginBottom: Spacing.md,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.md,
    color: Colors.text,
  },
  categoriesWrap: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categories: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.mediumPurple,
    borderColor: Colors.mediumPurple,
  },
  categoryText: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.white,
  },
  videoList: {
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
  videoCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  thumbnailContainer: {
    height: 180,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(139,74,139,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  durationBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 3,
  },
  durationText: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.xs,
    color: Colors.white,
  },
  videoMeta: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  videoTitle: {
    flex: 1,
    fontFamily: FontFamilies.bodyBold,
    fontSize: Typography.lg,
    color: Colors.text,
    lineHeight: 22,
  },
  categoryBadge: {
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 3,
    flexShrink: 0,
  },
  categoryBadgeText: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.xs,
    color: Colors.purple,
  },
  videoDescription: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  videoStats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  videoStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoStatText: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
});

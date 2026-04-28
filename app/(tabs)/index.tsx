import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Colors, FontFamilies, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { CountUp, FadeInFromBelow, SlideInFromBottom } from '@/components/Animations';
import {
  TrendingUp,
  DollarSign,
  Award,
  Bell,
  ChevronRight,
  Calendar,
  Play,
  Settings,
} from 'lucide-react-native';
import { Sale, Event, TrainingVideo, Notification } from '@/types/database';

export default function DashboardScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<TrainingVideo[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  const loadDashboard = useCallback(async () => {
    if (!user) return;

    const [salesRes, eventsRes, videosRes, notifRes] = await Promise.all([
      supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('events')
        .select('*')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(2),
      supabase.from('training_videos').select('*').order('views_count', { ascending: false }).limit(3),
      supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false),
    ]);

    if (salesRes.data) setRecentSales(salesRes.data);
    if (eventsRes.data) setUpcomingEvents(eventsRes.data);
    if (videosRes.data) setFeaturedVideos(videosRes.data);
    setUnreadCount(notifRes.count ?? 0);
  }, [user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadDashboard(), refreshProfile()]);
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.white} />}
      >
        {/* Header */}
        <LinearGradient colors={['#4A1942', '#6B2D6B', '#8B4A8B']} style={styles.header}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <View style={styles.greeting}>
                  <Text style={styles.greetingText}>Good day,</Text>
                  <Text style={styles.greetingName}>{profile?.full_name?.split(' ')[0] || 'Sales Pro'}</Text>
                </View>
                <View style={styles.headerActions}>
                  {isAdmin && (
                    <TouchableOpacity
                      style={styles.headerButton}
                      onPress={() => router.push('/admin')}
                    >
                      <Settings size={20} color={Colors.white} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => router.push('/notifications')}
                  >
                    <Bell size={20} color={Colors.white} />
                    {unreadCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <TrendingUp size={16} color="rgba(255,255,255,0.7)" />
                  <CountUp value={profile?.total_sales ?? 0} style={styles.statValue} />
                  <Text style={styles.statLabel}>Total Sales</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCard}>
                  <DollarSign size={16} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.statValue}>{formatCurrency(profile?.total_earnings ?? 0)}</Text>
                  <Text style={styles.statLabel}>Earnings</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCard}>
                  <Award size={16} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.statValue}>{profile?.rank ?? 'Starter'}</Text>
                  <Text style={styles.statLabel}>Rank</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.body}>
          {/* Quick Actions */}
          <FadeInFromBelow delay={100}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/record-sale')} activeOpacity={0.8}>
                  <LinearGradient colors={[Colors.mediumPurple, Colors.purple]} style={styles.quickActionIcon}>
                    <TrendingUp size={22} color={Colors.white} />
                  </LinearGradient>
                  <Text style={styles.quickActionText}>Record Sale</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(tabs)/training')} activeOpacity={0.8}>
                  <LinearGradient colors={['#2563eb', '#1d4ed8']} style={styles.quickActionIcon}>
                    <Play size={22} color={Colors.white} />
                  </LinearGradient>
                  <Text style={styles.quickActionText}>Training</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(tabs)/leaderboard')} activeOpacity={0.8}>
                  <LinearGradient colors={['#d97706', '#b45309']} style={styles.quickActionIcon}>
                    <Award size={22} color={Colors.white} />
                  </LinearGradient>
                  <Text style={styles.quickActionText}>Leaderboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/(tabs)/community')} activeOpacity={0.8}>
                  <LinearGradient colors={['#059669', '#047857']} style={styles.quickActionIcon}>
                    <Calendar size={22} color={Colors.white} />
                  </LinearGradient>
                  <Text style={styles.quickActionText}>Community</Text>
                </TouchableOpacity>
              </View>
            </View>
          </FadeInFromBelow>

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <FadeInFromBelow delay={200}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Upcoming Events</Text>
                  <TouchableOpacity onPress={() => router.push('/events')}>
                    <Text style={styles.seeAll}>See All</Text>
                  </TouchableOpacity>
                </View>
                {upcomingEvents.map((event) => (
                  <TouchableOpacity key={event.id} style={styles.eventCard} activeOpacity={0.8}>
                    <View style={styles.eventDateBadge}>
                      <Text style={styles.eventDay}>
                        {new Date(event.scheduled_at).getDate()}
                      </Text>
                      <Text style={styles.eventMonth}>
                        {new Date(event.scheduled_at).toLocaleString('default', { month: 'short' })}
                      </Text>
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                      <Text style={styles.eventMeta}>{event.location || 'Online'}</Text>
                      <View style={styles.eventTypeBadge}>
                        <Text style={styles.eventTypeText}>{event.event_type}</Text>
                      </View>
                    </View>
                    <ChevronRight size={16} color={Colors.textTertiary} />
                  </TouchableOpacity>
                ))}
              </View>
            </FadeInFromBelow>
          )}

          {/* Featured Training */}
          {featuredVideos.length > 0 && (
            <FadeInFromBelow delay={300}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Featured Training</Text>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/training')}>
                    <Text style={styles.seeAll}>See All</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.videosScroll}>
                  {featuredVideos.map((video) => (
                    <TouchableOpacity key={video.id} style={styles.videoCard} activeOpacity={0.85}>
                      {video.thumbnail_url ? (
                        <Image source={{ uri: video.thumbnail_url }} style={styles.videoThumbnail} />
                      ) : (
                        <View style={[styles.videoThumbnail, { backgroundColor: Colors.primary[100] }]} />
                      )}
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.videoOverlay}
                      />
                      <View style={styles.playButton}>
                        <Play size={16} color={Colors.white} fill={Colors.white} />
                      </View>
                      <View style={styles.videoInfo}>
                        <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                        <Text style={styles.videoDuration}>
                          {video.duration ? formatDuration(video.duration) : ''}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </FadeInFromBelow>
          )}

          {/* Recent Sales */}
          <SlideInFromBottom delay={400}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Sales</Text>
                <TouchableOpacity onPress={() => router.push('/sales-history')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>
              {recentSales.length === 0 ? (
                <View style={styles.emptyState}>
                  <TrendingUp size={32} color={Colors.neutral[300]} />
                  <Text style={styles.emptyTitle}>No sales yet</Text>
                  <Text style={styles.emptyText}>Start recording your sales to track performance</Text>
                  <TouchableOpacity
                    style={styles.emptyAction}
                    onPress={() => router.push('/record-sale')}
                  >
                    <LinearGradient colors={[Colors.mediumPurple, Colors.purple]} style={styles.emptyActionGrad}>
                      <Text style={styles.emptyActionText}>Record First Sale</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                recentSales.map((sale) => (
                  <View key={sale.id} style={styles.saleRow}>
                    <View style={styles.saleIcon}>
                      <DollarSign size={16} color={Colors.mediumPurple} />
                    </View>
                    <View style={styles.saleInfo}>
                      <Text style={styles.saleProduct}>{sale.product_name}</Text>
                      <Text style={styles.saleMeta}>
                        {sale.customer_name || 'Unknown customer'} · Qty {sale.quantity}
                      </Text>
                    </View>
                    <View style={styles.saleRight}>
                      <Text style={styles.saleAmount}>{formatCurrency(sale.amount)}</Text>
                      <View style={[styles.saleBadge, sale.status === 'completed' && styles.saleBadgeSuccess]}>
                        <Text style={[styles.saleBadgeText, sale.status === 'completed' && styles.saleBadgeTextSuccess]}>
                          {sale.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </SlideInFromBottom>
        </View>
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
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  greeting: {},
  greetingText: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.md,
    color: 'rgba(255,255,255,0.7)',
  },
  greetingName: {
    fontFamily: FontFamilies.heading,
    fontSize: Typography.xxxl,
    color: Colors.white,
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.error[500],
    borderRadius: BorderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: 10,
    color: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statValue: {
    fontFamily: FontFamilies.headingMedium,
    fontSize: Typography.xl,
    color: Colors.white,
  },
  statLabel: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.xs,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  body: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: FontFamilies.headingMedium,
    fontSize: Typography.xl,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.sm,
    color: Colors.mediumPurple,
    marginBottom: Spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionText: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.xs,
    color: Colors.text,
    textAlign: 'center',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  eventDateBadge: {
    width: 48,
    height: 52,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[100],
  },
  eventDay: {
    fontFamily: FontFamilies.heading,
    fontSize: Typography.xxl,
    color: Colors.purple,
    lineHeight: 28,
  },
  eventMonth: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.xs,
    color: Colors.mediumPurple,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventInfo: {
    flex: 1,
    gap: 2,
  },
  eventTitle: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: Typography.md,
    color: Colors.text,
  },
  eventMeta: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  eventTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  eventTypeText: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.xs,
    color: Colors.purple,
    textTransform: 'capitalize',
  },
  videosScroll: {
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  videoCard: {
    width: 200,
    height: 130,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    overflow: 'hidden',
    backgroundColor: Colors.neutral[100],
  },
  videoThumbnail: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  playButton: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(139,74,139,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.sm,
  },
  videoTitle: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: Typography.sm,
    color: Colors.white,
    lineHeight: 16,
  },
  videoDuration: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  saleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  saleIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  saleInfo: {
    flex: 1,
  },
  saleProduct: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: Typography.md,
    color: Colors.text,
  },
  saleMeta: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  saleRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  saleAmount: {
    fontFamily: FontFamilies.headingMedium,
    fontSize: Typography.md,
    color: Colors.text,
  },
  saleBadge: {
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  saleBadgeSuccess: {
    backgroundColor: Colors.success[100],
  },
  saleBadgeText: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  saleBadgeTextSuccess: {
    color: Colors.success[600],
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
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
    textAlign: 'center',
  },
  emptyAction: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  emptyActionGrad: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  emptyActionText: {
    fontFamily: FontFamilies.headingMedium,
    fontSize: Typography.md,
    color: Colors.white,
  },
});

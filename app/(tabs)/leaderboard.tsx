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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Colors, FontFamilies, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { Profile } from '@/types/database';
import { Trophy, TrendingUp, Crown } from 'lucide-react-native';
import { FadeInFromBelow, CountUp } from '@/components/Animations';

type LeaderEntry = Profile & { rank_position: number };

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('approval_status', 'approved')
      .order('total_sales', { ascending: false })
      .limit(50);

    if (data) {
      const ranked = data.map((p, i) => ({ ...p, rank_position: i + 1 }));
      setLeaders(ranked);
      if (user) {
        const myPos = ranked.findIndex((p) => p.id === user.id);
        setMyRank(myPos >= 0 ? myPos + 1 : null);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const getRankColor = (pos: number) => {
    if (pos === 1) return '#FFD700';
    if (pos === 2) return Colors.silver;
    if (pos === 3) return Colors.bronze;
    return Colors.textTertiary;
  };

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4A1942', '#6B2D6B']} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Trophy size={22} color={Colors.white} />
              <Text style={styles.headerTitle}>Leaderboard</Text>
            </View>
            {myRank && (
              <View style={styles.myRankBadge}>
                <Text style={styles.myRankText}>Your Rank: #{myRank}</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.white} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.mediumPurple} style={styles.loader} />
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length >= 3 && (
              <LinearGradient colors={['#6B2D6B', '#8B4A8B', '#9B6B9B']} style={styles.podium}>
                <Text style={styles.podiumTitle}>TOP PERFORMERS</Text>
                <View style={styles.podiumRow}>
                  {/* 2nd place */}
                  <FadeInFromBelow delay={200}>
                    <View style={[styles.podiumItem, styles.podiumSecond]}>
                      <View style={styles.podiumAvatar}>
                        {top3[1]?.avatar_url ? (
                          <Image source={{ uri: top3[1].avatar_url }} style={styles.podiumAvatarImg} />
                        ) : (
                          <View style={[styles.podiumAvatarPlaceholder, { borderColor: Colors.silver }]}>
                            <Text style={styles.podiumAvatarText}>{initials(top3[1]?.full_name || '')}</Text>
                          </View>
                        )}
                        <View style={[styles.rankBadge, { backgroundColor: Colors.silver }]}>
                          <Text style={styles.rankBadgeText}>2</Text>
                        </View>
                      </View>
                      <Text style={styles.podiumName} numberOfLines={1}>{top3[1]?.full_name?.split(' ')[0]}</Text>
                      <Text style={styles.podiumSales}>{top3[1]?.total_sales} sales</Text>
                      <View style={[styles.podiumBase, styles.podiumBase2]} />
                    </View>
                  </FadeInFromBelow>

                  {/* 1st place */}
                  <FadeInFromBelow delay={100}>
                    <View style={[styles.podiumItem, styles.podiumFirst]}>
                      <Crown size={24} color="#FFD700" style={{ marginBottom: 4 }} />
                      <View style={styles.podiumAvatar}>
                        {top3[0]?.avatar_url ? (
                          <Image source={{ uri: top3[0].avatar_url }} style={styles.podiumAvatarImgLarge} />
                        ) : (
                          <View style={[styles.podiumAvatarPlaceholderLarge, { borderColor: '#FFD700' }]}>
                            <Text style={styles.podiumAvatarTextLarge}>{initials(top3[0]?.full_name || '')}</Text>
                          </View>
                        )}
                        <View style={[styles.rankBadge, { backgroundColor: '#FFD700' }]}>
                          <Text style={[styles.rankBadgeText, { color: Colors.text }]}>1</Text>
                        </View>
                      </View>
                      <Text style={[styles.podiumName, styles.podiumNameFirst]} numberOfLines={1}>
                        {top3[0]?.full_name?.split(' ')[0]}
                      </Text>
                      <Text style={styles.podiumSales}>{top3[0]?.total_sales} sales</Text>
                      <View style={[styles.podiumBase, styles.podiumBase1]} />
                    </View>
                  </FadeInFromBelow>

                  {/* 3rd place */}
                  <FadeInFromBelow delay={300}>
                    <View style={[styles.podiumItem, styles.podiumThird]}>
                      <View style={styles.podiumAvatar}>
                        {top3[2]?.avatar_url ? (
                          <Image source={{ uri: top3[2].avatar_url }} style={styles.podiumAvatarImg} />
                        ) : (
                          <View style={[styles.podiumAvatarPlaceholder, { borderColor: Colors.bronze }]}>
                            <Text style={styles.podiumAvatarText}>{initials(top3[2]?.full_name || '')}</Text>
                          </View>
                        )}
                        <View style={[styles.rankBadge, { backgroundColor: Colors.bronze }]}>
                          <Text style={styles.rankBadgeText}>3</Text>
                        </View>
                      </View>
                      <Text style={styles.podiumName} numberOfLines={1}>{top3[2]?.full_name?.split(' ')[0]}</Text>
                      <Text style={styles.podiumSales}>{top3[2]?.total_sales} sales</Text>
                      <View style={[styles.podiumBase, styles.podiumBase3]} />
                    </View>
                  </FadeInFromBelow>
                </View>
              </LinearGradient>
            )}

            {/* Rest of leaderboard */}
            <View style={styles.listSection}>
              {rest.map((entry, i) => (
                <FadeInFromBelow key={entry.id} delay={i * 40}>
                  <View style={[styles.listRow, entry.id === user?.id && styles.listRowHighlight]}>
                    <Text style={[styles.listRank, { color: getRankColor(entry.rank_position) }]}>
                      #{entry.rank_position}
                    </Text>
                    <View style={styles.listAvatar}>
                      {entry.avatar_url ? (
                        <Image source={{ uri: entry.avatar_url }} style={styles.listAvatarImg} />
                      ) : (
                        <LinearGradient
                          colors={[Colors.mediumPurple, Colors.purple]}
                          style={styles.listAvatarGrad}
                        >
                          <Text style={styles.listAvatarText}>{initials(entry.full_name)}</Text>
                        </LinearGradient>
                      )}
                    </View>
                    <View style={styles.listInfo}>
                      <Text style={styles.listName}>{entry.full_name}</Text>
                      <Text style={styles.listRegion}>{entry.region || 'Global'}</Text>
                    </View>
                    <View style={styles.listStats}>
                      <View style={styles.listStat}>
                        <TrendingUp size={12} color={Colors.mediumPurple} />
                        <Text style={styles.listStatValue}>{entry.total_sales}</Text>
                      </View>
                      <Text style={styles.listEarnings}>{formatCurrency(entry.total_earnings)}</Text>
                    </View>
                  </View>
                </FadeInFromBelow>
              ))}
            </View>
          </>
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
  myRankBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  myRankText: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: Typography.sm,
    color: Colors.white,
  },
  loader: {
    marginTop: Spacing.xxl,
  },
  podium: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  podiumTitle: {
    fontFamily: FontFamilies.heading,
    fontSize: Typography.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: Spacing.xl,
  },
  podiumRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  podiumItem: {
    alignItems: 'center',
    width: 100,
  },
  podiumFirst: {
    marginBottom: 0,
  },
  podiumSecond: {
    marginBottom: -10,
  },
  podiumThird: {
    marginBottom: -20,
  },
  podiumAvatar: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  podiumAvatarImg: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    borderColor: Colors.silver,
  },
  podiumAvatarImgLarge: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  podiumAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  podiumAvatarPlaceholderLarge: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  podiumAvatarText: {
    fontFamily: FontFamilies.headingMedium,
    fontSize: Typography.md,
    color: Colors.white,
  },
  podiumAvatarTextLarge: {
    fontFamily: FontFamilies.heading,
    fontSize: Typography.xl,
    color: Colors.white,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  rankBadgeText: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: Typography.xs,
    color: Colors.white,
  },
  podiumName: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: Typography.sm,
    color: Colors.white,
    textAlign: 'center',
  },
  podiumNameFirst: {
    fontSize: Typography.md,
  },
  podiumSales: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  podiumBase: {
    width: 90,
    borderRadius: 4,
    marginTop: Spacing.sm,
  },
  podiumBase1: {
    height: 70,
    backgroundColor: 'rgba(255,215,0,0.3)',
    borderTopWidth: 3,
    borderTopColor: '#FFD700',
  },
  podiumBase2: {
    height: 50,
    backgroundColor: 'rgba(192,192,192,0.3)',
    borderTopWidth: 3,
    borderTopColor: Colors.silver,
  },
  podiumBase3: {
    height: 35,
    backgroundColor: 'rgba(205,127,50,0.3)',
    borderTopWidth: 3,
    borderTopColor: Colors.bronze,
  },
  listSection: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  listRowHighlight: {
    borderWidth: 2,
    borderColor: Colors.mediumPurple,
    backgroundColor: Colors.primary[50],
  },
  listRank: {
    fontFamily: FontFamilies.headingMedium,
    fontSize: Typography.md,
    width: 36,
    textAlign: 'center',
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  listAvatarImg: {
    width: 40,
    height: 40,
  },
  listAvatarGrad: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listAvatarText: {
    fontFamily: FontFamilies.headingMedium,
    fontSize: Typography.sm,
    color: Colors.white,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: Typography.md,
    color: Colors.text,
  },
  listRegion: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  listStats: {
    alignItems: 'flex-end',
    gap: 2,
  },
  listStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  listStatValue: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: Typography.md,
    color: Colors.mediumPurple,
  },
  listEarnings: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
});

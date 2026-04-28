import { Tabs, router } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Colors, FontFamilies } from '@/constants/theme';
import { Hop as Home, Users, BookOpen, Trophy, User } from 'lucide-react-native';

export default function TabLayout() {
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/(auth)/login');
    }
  }, [session, loading]);

  useEffect(() => {
    if (!loading && session && profile?.approval_status === 'pending') {
      router.replace('/(auth)/pending');
    }
  }, [session, profile, loading]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.mediumPurple,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => <View style={styles.tabBarBg} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: 'Training',
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 16,
    backgroundColor: 'transparent',
  },
  tabBarBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tabLabel: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: 10,
  },
});

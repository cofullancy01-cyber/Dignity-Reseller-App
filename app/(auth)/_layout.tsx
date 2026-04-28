import { Stack } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function AuthLayout() {
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      if (profile?.approval_status === 'pending') {
        return;
      }
      router.replace('/(tabs)');
    }
  }, [session, loading, profile]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="pending" />
    </Stack>
  );
}

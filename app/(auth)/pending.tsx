import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/lib/auth';
import { Colors, FontFamilies, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { Clock, LogOut } from 'lucide-react-native';

export default function PendingScreen() {
  const { signOut, profile } = useAuth();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4A1942', '#2D0F2A', '#1A0818']} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Clock size={48} color={Colors.white} strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>Approval Pending</Text>
        <Text style={styles.name}>Hello, {profile?.full_name || 'there'}!</Text>
        <Text style={styles.message}>
          Your account registration has been submitted. An administrator will review and approve your
          account shortly. You'll be able to access the platform once approved.
        </Text>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Account under review</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, styles.statusDotInactive]} />
            <Text style={[styles.statusText, styles.statusTextInactive]}>Access granted</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={signOut} activeOpacity={0.8}>
          <LogOut size={18} color={Colors.white} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: Spacing.xl,
    maxWidth: 360,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  title: {
    fontFamily: FontFamilies.heading,
    fontSize: Typography.display,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  name: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.lg,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.md,
  },
  message: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.md,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  statusCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: '100%',
    marginBottom: Spacing.xl,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success[500],
  },
  statusDotInactive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statusText: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.md,
    color: Colors.white,
  },
  statusTextInactive: {
    color: 'rgba(255,255,255,0.4)',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  signOutText: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.md,
    color: Colors.white,
  },
});

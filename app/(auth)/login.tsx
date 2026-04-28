import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { Colors, FontFamilies, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { FloatingShape } from '@/components/Animations';
import { Eye, EyeOff, Mail, Lock, TrendingUp } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await signIn(email.trim(), password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#4A1942', '#2D0F2A', '#1A0818']} style={StyleSheet.absoluteFill} />

      <FloatingShape delay={0} size={60} color="rgba(107,45,107,0.2)" />
      <FloatingShape delay={1000} size={40} color="rgba(139,74,139,0.15)" />
      <FloatingShape delay={2000} size={80} color="rgba(74,25,66,0.25)" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[Colors.mediumPurple, Colors.purple]}
              style={styles.logoGradient}
            >
              <TrendingUp size={32} color={Colors.white} strokeWidth={2.5} />
            </LinearGradient>
          </View>
          <Text style={styles.appName}>SALESHUB</Text>
          <Text style={styles.tagline}>Empower Your Sales Team</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Mail size={18} color={Colors.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Lock size={18} color={Colors.textTertiary} />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Your password"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={18} color={Colors.textTertiary} />
                ) : (
                  <Eye size={18} color={Colors.textTertiary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[Colors.mediumPurple, Colors.purple]}
              style={styles.loginButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.7}
          >
            <Text style={styles.registerButtonText}>
              Don't have an account?{' '}
              <Text style={styles.registerButtonLink}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    marginBottom: Spacing.md,
  },
  logoGradient: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  appName: {
    fontFamily: FontFamilies.heading,
    fontSize: 36,
    color: Colors.white,
    letterSpacing: 4,
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.md,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },
  title: {
    fontFamily: FontFamilies.heading,
    fontSize: Typography.xxxl,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  errorContainer: {
    backgroundColor: Colors.error[50],
    borderWidth: 1,
    borderColor: Colors.error[100],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.sm,
    color: Colors.error[600],
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.sm,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.md,
    color: Colors.text,
  },
  loginButton: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontFamily: FontFamilies.headingMedium,
    fontSize: Typography.lg,
    color: Colors.white,
    letterSpacing: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  registerButton: {
    alignItems: 'center',
  },
  registerButtonText: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.md,
    color: Colors.textSecondary,
  },
  registerButtonLink: {
    color: Colors.purple,
    fontFamily: FontFamilies.bodyBold,
  },
});

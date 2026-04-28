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
import { Eye, EyeOff, Mail, Lock, User, Phone, TrendingUp, ArrowLeft } from 'lucide-react-native';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await signUp(email.trim(), password, fullName.trim());
    if (result.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#4A1942', '#2D0F2A', '#1A0818']} style={StyleSheet.absoluteFill} />

      <FloatingShape delay={500} size={50} color="rgba(107,45,107,0.2)" />
      <FloatingShape delay={1500} size={70} color="rgba(139,74,139,0.12)" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient colors={[Colors.mediumPurple, Colors.purple]} style={styles.logoGradient}>
              <TrendingUp size={28} color={Colors.white} strokeWidth={2.5} />
            </LinearGradient>
          </View>
          <Text style={styles.appName}>SALESHUB</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Join Our Team</Text>
          <Text style={styles.subtitle}>Create your reseller account</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputContainer}>
              <User size={18} color={Colors.textTertiary} />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={Colors.textTertiary}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <View style={styles.inputContainer}>
              <Mail size={18} color={Colors.textTertiary} />
              <TextInput
                ref={emailRef}
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Phone size={18} color={Colors.textTertiary} />
              <TextInput
                ref={phoneRef}
                style={styles.input}
                placeholder="+1 234 567 8900"
                placeholderTextColor={Colors.textTertiary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.inputContainer}>
              <Lock size={18} color={Colors.textTertiary} />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Min. 6 characters"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password *</Text>
            <View style={styles.inputContainer}>
              <Lock size={18} color={Colors.textTertiary} />
              <TextInput
                ref={confirmRef}
                style={styles.input}
                placeholder="Repeat password"
                placeholderTextColor={Colors.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? (
                  <EyeOff size={18} color={Colors.textTertiary} />
                ) : (
                  <Eye size={18} color={Colors.textTertiary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              Your account will be reviewed by an admin before you can access the platform.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[Colors.mediumPurple, Colors.purple]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.7}
          >
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <Text style={styles.loginLinkBold}>Sign In</Text>
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
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoContainer: {
    marginBottom: Spacing.sm,
  },
  logoGradient: {
    width: 60,
    height: 60,
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
    fontSize: 28,
    color: Colors.white,
    letterSpacing: 4,
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
  noteContainer: {
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.mediumPurple,
  },
  noteText: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.sm,
    color: Colors.purple,
    lineHeight: 20,
  },
  registerButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: FontFamilies.headingMedium,
    fontSize: Typography.lg,
    color: Colors.white,
    letterSpacing: 1,
  },
  loginLink: {
    alignItems: 'center',
  },
  loginLinkText: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.md,
    color: Colors.textSecondary,
  },
  loginLinkBold: {
    color: Colors.purple,
    fontFamily: FontFamilies.bodyBold,
  },
});

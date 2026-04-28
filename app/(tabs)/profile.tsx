import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Colors, FontFamilies, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { User, Phone, MapPin, CreditCard as Edit3, LogOut, Save, X, TrendingUp, DollarSign, Award, Shield } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [region, setRegion] = useState(profile?.region ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  const startEditing = () => {
    setFullName(profile?.full_name ?? '');
    setPhone(profile?.phone ?? '');
    setRegion(profile?.region ?? '');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setError(null);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), phone: phone.trim() || null, region: region.trim() || null })
      .eq('id', user.id);

    if (err) {
      setError(err.message);
    } else {
      await refreshProfile();
      setEditing(false);
    }
    setSaving(false);
  };

  const handleSignOut = () => {
    signOut();
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const initials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const getRoleColor = () => {
    if (profile?.role === 'super_admin') return Colors.error[500];
    if (profile?.role === 'admin') return Colors.mediumPurple;
    return Colors.success[500];
  };

  const getRoleLabel = () => {
    if (profile?.role === 'super_admin') return 'Super Admin';
    if (profile?.role === 'admin') return 'Admin';
    return 'Reseller';
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#4A1942', '#6B2D6B', '#8B4A8B']} style={styles.header}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Profile</Text>
              {!editing && (
                <TouchableOpacity style={styles.editButton} onPress={startEditing}>
                  <Edit3 size={18} color={Colors.white} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                {profile?.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>{initials(profile?.full_name || 'U')}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
              <Text style={styles.profileEmail}>{profile?.email}</Text>
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor() }]}>
                <Shield size={12} color={Colors.white} />
                <Text style={styles.roleText}>{getRoleLabel()}</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <TrendingUp size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.statVal}>{profile?.total_sales ?? 0}</Text>
                <Text style={styles.statLbl}>Sales</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <DollarSign size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.statVal}>{formatCurrency(profile?.total_earnings ?? 0)}</Text>
                <Text style={styles.statLbl}>Earnings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Award size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.statVal}>{profile?.rank ?? 'Starter'}</Text>
                <Text style={styles.statLbl}>Rank</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={styles.body}>
          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Info Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Personal Information</Text>

            {editing ? (
              <View style={styles.editForm}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <View style={styles.fieldInput}>
                    <User size={16} color={Colors.textTertiary} />
                    <TextInput
                      style={styles.input}
                      value={fullName}
                      onChangeText={setFullName}
                      placeholder="Full Name"
                      placeholderTextColor={Colors.textTertiary}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Phone</Text>
                  <View style={styles.fieldInput}>
                    <Phone size={16} color={Colors.textTertiary} />
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="Phone Number"
                      placeholderTextColor={Colors.textTertiary}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Region</Text>
                  <View style={styles.fieldInput}>
                    <MapPin size={16} color={Colors.textTertiary} />
                    <TextInput
                      style={styles.input}
                      value={region}
                      onChangeText={setRegion}
                      placeholder="Your Region"
                      placeholderTextColor={Colors.textTertiary}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
                <View style={styles.editActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={cancelEditing}>
                    <X size={16} color={Colors.textSecondary} />
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                    onPress={saveProfile}
                    disabled={saving}
                  >
                    <LinearGradient
                      colors={[Colors.mediumPurple, Colors.purple]}
                      style={styles.saveBtnGrad}
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                      ) : (
                        <>
                          <Save size={16} color={Colors.white} />
                          <Text style={styles.saveText}>Save</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.infoList}>
                <InfoRow icon={<User size={16} color={Colors.mediumPurple} />} label="Full Name" value={profile?.full_name || '—'} />
                <InfoRow icon={<Phone size={16} color={Colors.mediumPurple} />} label="Phone" value={profile?.phone || '—'} />
                <InfoRow icon={<MapPin size={16} color={Colors.mediumPurple} />} label="Region" value={profile?.region || '—'} />
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Actions</Text>

            {isAdmin && (
              <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/admin')}>
                <View style={[styles.actionIcon, { backgroundColor: Colors.primary[50] }]}>
                  <Shield size={18} color={Colors.mediumPurple} />
                </View>
                <Text style={styles.actionText}>Admin Dashboard</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/record-sale')}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.success[50] }]}>
                <TrendingUp size={18} color={Colors.success[600]} />
              </View>
              <Text style={styles.actionText}>Record a Sale</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionRow, styles.signOutRow]}
              onPress={handleSignOut}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.error[50] }]}>
                <LogOut size={18} color={Colors.error[500]} />
              </View>
              <Text style={[styles.actionText, styles.signOutText]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.iconWrap}>{icon}</View>
      <View style={rowStyles.content}>
        <Text style={rowStyles.label}>{label}</Text>
        <Text style={rowStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  label: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.md,
    color: Colors.text,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    paddingBottom: Spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontFamily: FontFamilies.heading,
    fontSize: Typography.xxl,
    color: Colors.white,
    letterSpacing: 1,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  avatarWrapper: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: FontFamilies.heading,
    fontSize: Typography.xxxl,
    color: Colors.white,
  },
  profileName: {
    fontFamily: FontFamilies.heading,
    fontSize: Typography.xxl,
    color: Colors.white,
    marginBottom: 4,
  },
  profileEmail: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.sm,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  roleText: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.sm,
    color: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statVal: {
    fontFamily: FontFamilies.headingMedium,
    fontSize: Typography.lg,
    color: Colors.white,
  },
  statLbl: {
    fontFamily: FontFamilies.body,
    fontSize: Typography.xs,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  body: {
    padding: Spacing.md,
    gap: Spacing.md,
    marginTop: -Spacing.lg,
  },
  errorCard: {
    backgroundColor: Colors.error[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error[100],
  },
  errorText: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.sm,
    color: Colors.error[600],
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: FontFamilies.headingMedium,
    fontSize: Typography.xl,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  infoList: {
    gap: 0,
  },
  editForm: {
    gap: Spacing.md,
  },
  field: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.sm,
    color: Colors.text,
  },
  fieldInput: {
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
  editActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cancelText: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.md,
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  saveText: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: Typography.md,
    color: Colors.white,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  signOutRow: {
    borderBottomWidth: 0,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontFamily: FontFamilies.bodyMedium,
    fontSize: Typography.md,
    color: Colors.text,
    flex: 1,
  },
  signOutText: {
    color: Colors.error[500],
  },
});

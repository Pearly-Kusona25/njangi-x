import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/supabase';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

const FREQUENCIES = ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly'];

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function CreateNjangiScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    contribution_amount: '',
    frequency: 'Monthly',
    total_members: '',
    start_date: new Date().toISOString().split('T')[0],
    duration_cycles: '',
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const validateStep1 = () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Please enter a group name'); return false; }
    if (!form.contribution_amount || isNaN(form.contribution_amount)) { Alert.alert('Error', 'Enter a valid contribution amount'); return false; }
    if (!form.total_members || isNaN(form.total_members) || parseInt(form.total_members) < 2) {
      Alert.alert('Error', 'Group must have at least 2 members'); return false;
    }
    return true;
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const inviteCode = generateInviteCode();

      const { data: group, error } = await db.createGroup({
        name: form.name.trim(),
        description: form.description.trim(),
        leader_id: profile.id,
        contribution_amount: parseInt(form.contribution_amount),
        frequency: form.frequency.toLowerCase(),
        total_members: parseInt(form.total_members),
        start_date: form.start_date,
        duration_cycles: parseInt(form.duration_cycles) || parseInt(form.total_members),
        invite_code: inviteCode,
        status: 'active',
        created_at: new Date().toISOString(),
      });

      if (error) throw new Error(error.message);

      // Auto-join as leader (position 1)
      await db.joinGroup(profile.id, group.id, 1);

      setLoading(false);
      navigation.replace('GroupDetail', { groupId: group.id });
      Alert.alert('Success!', `Group "${form.name}" created!\nInvite code: ${inviteCode}`);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  const stepTitles = ['Group Details', 'Contribution Rules', 'Review & Create'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.navy, COLORS.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Njangi</Text>
        <Text style={styles.headerSubtitle}>{stepTitles[step - 1]}</Text>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Step {step} of 3</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Group Name *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="people-outline" size={18} color={COLORS.gray400} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Family Njangi 2025"
                  placeholderTextColor={COLORS.gray400}
                  value={form.name}
                  onChangeText={v => update('name', v)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <View style={[styles.inputWrapper, styles.textareaWrapper]}>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="What is this Njangi for?"
                  placeholderTextColor={COLORS.gray400}
                  multiline
                  numberOfLines={3}
                  value={form.description}
                  onChangeText={v => update('description', v)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Number of Members *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-add-outline" size={18} color={COLORS.gray400} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 10"
                  placeholderTextColor={COLORS.gray400}
                  keyboardType="numeric"
                  value={form.total_members}
                  onChangeText={v => update('total_members', v)}
                />
              </View>
              <Text style={styles.hint}>You will be member #1 (first payout)</Text>
            </View>

            <TouchableOpacity onPress={() => validateStep1() && setStep(2)} style={styles.nextBtn}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.nextGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.nextBtnText}>Next Step</Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Contribution Rules</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contribution Amount (FCFA) *</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencyPrefix}>FCFA</Text>
                <TextInput
                  style={[styles.input, { marginLeft: SPACING.sm }]}
                  placeholder="e.g. 10000"
                  placeholderTextColor={COLORS.gray400}
                  keyboardType="numeric"
                  value={form.contribution_amount}
                  onChangeText={v => update('contribution_amount', v)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Frequency *</Text>
              <View style={styles.frequencyRow}>
                {FREQUENCIES.map(freq => (
                  <TouchableOpacity
                    key={freq}
                    style={[styles.freqBtn, form.frequency === freq && styles.freqBtnActive]}
                    onPress={() => update('frequency', freq)}
                  >
                    <Text style={[styles.freqText, form.frequency === freq && styles.freqTextActive]}>
                      {freq}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Start Date</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.gray400} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.gray400}
                  value={form.start_date}
                  onChangeText={v => update('start_date', v)}
                />
              </View>
            </View>

            {form.contribution_amount && form.total_members ? (
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>💡 Group Summary</Text>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Each member pays</Text>
                  <Text style={styles.previewValue}>
                    FCFA {parseInt(form.contribution_amount).toLocaleString()} {form.frequency}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Payout per turn</Text>
                  <Text style={styles.previewValue}>
                    FCFA {(parseInt(form.contribution_amount) * parseInt(form.total_members)).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Total cycles</Text>
                  <Text style={styles.previewValue}>{form.total_members} ({form.frequency})</Text>
                </View>
              </View>
            ) : null}

            <TouchableOpacity onPress={() => setStep(3)} style={styles.nextBtn}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.nextGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.nextBtnText}>Review Group</Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Review Your Njangi</Text>

            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewIcon}>
                  <Ionicons name="people" size={32} color={COLORS.white} />
                </View>
                <Text style={styles.reviewGroupName}>{form.name}</Text>
                {form.description ? (
                  <Text style={styles.reviewDescription}>{form.description}</Text>
                ) : null}
              </View>

              {[
                { label: 'Contribution', value: `FCFA ${parseInt(form.contribution_amount || 0).toLocaleString()}`, icon: 'cash' },
                { label: 'Frequency', value: form.frequency, icon: 'repeat' },
                { label: 'Members', value: form.total_members, icon: 'people' },
                { label: 'Payout Amount', value: `FCFA ${(parseInt(form.contribution_amount || 0) * parseInt(form.total_members || 0)).toLocaleString()}`, icon: 'wallet' },
                { label: 'Start Date', value: form.start_date, icon: 'calendar' },
                { label: 'Platform Fee', value: '1% per transaction', icon: 'information-circle' },
              ].map((row, i) => (
                <View key={i} style={styles.reviewRow}>
                  <View style={styles.reviewRowLeft}>
                    <View style={styles.reviewRowIcon}>
                      <Ionicons name={row.icon} size={16} color={COLORS.primary} />
                    </View>
                    <Text style={styles.reviewLabel}>{row.label}</Text>
                  </View>
                  <Text style={styles.reviewValue}>{row.value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.leaderNote}>
              <Ionicons name="star" size={16} color={COLORS.warning} />
              <Text style={styles.leaderNoteText}>
                You'll be the Group Leader. You can add members, manage the rotation, and send announcements.
              </Text>
            </View>

            <TouchableOpacity onPress={handleCreate} disabled={loading} style={styles.createBtn}>
              <LinearGradient
                colors={loading ? [COLORS.gray300, COLORS.gray300] : [COLORS.primary, COLORS.primaryDark]}
                style={styles.createGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                    <Text style={styles.createBtnText}>Create Njangi</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 56,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  backBtn: { marginBottom: SPACING.md },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.lg,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.white, borderRadius: 3 },
  progressText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.6)',
  },
  content: { flex: 1, padding: SPACING.xl },
  formSection: { paddingBottom: SPACING['3xl'] },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.navy,
    marginBottom: SPACING.lg,
  },
  inputGroup: { marginBottom: SPACING.md },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  hint: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray400,
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    height: 52,
    ...SHADOWS.sm,
  },
  textareaWrapper: { height: 'auto', paddingVertical: SPACING.md, alignItems: 'flex-start' },
  inputIcon: { marginRight: SPACING.sm },
  currencyPrefix: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray500,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.navy,
  },
  textarea: { minHeight: 72, textAlignVertical: 'top' },
  frequencyRow: { flexDirection: 'row', gap: SPACING.sm },
  freqBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  freqBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.lightGreen },
  freqText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
  },
  freqTextActive: { color: COLORS.primary, fontFamily: FONTS.semiBold },
  previewCard: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  previewTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.base,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  previewLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  previewValue: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.navy,
  },
  nextBtn: { marginTop: SPACING.lg, borderRadius: RADIUS.lg, overflow: 'hidden' },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 56,
    borderRadius: RADIUS.lg,
  },
  nextBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
    marginBottom: SPACING.md,
  },
  reviewHeader: {
    backgroundColor: COLORS.navy,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  reviewIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  reviewGroupName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.white,
    textAlign: 'center',
  },
  reviewDescription: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  reviewRowLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  reviewRowIcon: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray600,
  },
  reviewValue: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.base,
    color: COLORS.navy,
  },
  leaderNote: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: '#FFFBEB',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  leaderNoteText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    lineHeight: 20,
  },
  createBtn: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  createGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 56,
    borderRadius: RADIUS.lg,
  },
  createBtnText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
});

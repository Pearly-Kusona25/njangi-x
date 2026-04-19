import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/supabase';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { formatCurrency } from '../../utils/helpers';

export default function JoinGroupScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const [code, setCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [joining, setJoining] = useState(false);
  const [foundGroup, setFoundGroup] = useState(null);

  const handleSearch = async () => {
    if (!code.trim() || code.length < 4) {
      Alert.alert('Error', 'Please enter a valid invite code');
      return;
    }
    setSearching(true);
    setFoundGroup(null);
    const { data, error } = await db.getGroupByCode(code.trim().toUpperCase());
    setSearching(false);
    if (error || !data) {
      Alert.alert('Not Found', 'No group found with that code. Please check and try again.');
    } else {
      setFoundGroup(data);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    const { data: members } = await db.getGroupMembers(foundGroup.id);
    const alreadyMember = members?.some(m => m.user_id === profile.id);
    if (alreadyMember) {
      setJoining(false);
      Alert.alert('Already Joined', 'You are already a member of this group.');
      return;
    }
    const nextPos = (members?.length || 0) + 1;
    const { error } = await db.joinGroup(profile.id, foundGroup.id, nextPos);
    setJoining(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      navigation.replace('GroupDetail', { groupId: foundGroup.id });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.navy, COLORS.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Join a Njangi</Text>
        <Text style={styles.headerSubtitle}>Enter the invite code from your group leader</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.searchCard}>
          <Text style={styles.searchLabel}>Invite Code</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.codeInput}
              placeholder="Enter 6-digit code"
              placeholderTextColor={COLORS.gray400}
              value={code}
              onChangeText={t => setCode(t.toUpperCase())}
              maxLength={8}
              autoCapitalize="characters"
            />
            <TouchableOpacity onPress={handleSearch} disabled={searching} style={styles.searchBtn}>
              {searching ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.searchBtnGradient}
                >
                  <Ionicons name="search" size={20} color={COLORS.white} />
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {foundGroup && (
          <View style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <View style={styles.groupAvatar}>
                <Ionicons name="people" size={28} color={COLORS.white} />
              </View>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{foundGroup.name}</Text>
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>Active</Text>
                </View>
              </View>
            </View>

            <View style={styles.groupStats}>
              {[
                { icon: 'people', label: 'Members', value: `${foundGroup.total_members}` },
                { icon: 'cash', label: 'Contribution', value: `FCFA ${formatCurrency(foundGroup.contribution_amount)}` },
                { icon: 'repeat', label: 'Frequency', value: foundGroup.frequency },
              ].map((stat, i) => (
                <View key={i} style={styles.statItem}>
                  <View style={styles.statIcon}>
                    <Ionicons name={stat.icon} size={16} color={COLORS.primary} />
                  </View>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.joinNote}>
              <Ionicons name="information-circle" size={16} color={COLORS.info} />
              <Text style={styles.joinNoteText}>
                Joining this group means committing to pay FCFA {formatCurrency(foundGroup.contribution_amount)} {foundGroup.frequency}
              </Text>
            </View>

            <TouchableOpacity onPress={handleJoin} disabled={joining} style={styles.joinBtn}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.joinGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {joining ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="enter" size={20} color={COLORS.white} />
                    <Text style={styles.joinBtnText}>Join This Njangi</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {!foundGroup && (
          <View style={styles.hintCard}>
            <Ionicons name="bulb-outline" size={24} color={COLORS.warning} />
            <Text style={styles.hintTitle}>How to join?</Text>
            <Text style={styles.hintText}>
              Ask your Njangi group leader for the 6-digit invite code. The code is generated when the group is created.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 56, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
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
  },
  content: { flex: 1, padding: SPACING.xl },
  searchCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  searchLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  searchRow: { flexDirection: 'row', gap: SPACING.sm },
  codeInput: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.navy,
    letterSpacing: 4,
    height: 56,
  },
  searchBtn: { width: 56, height: 56, borderRadius: RADIUS.md, overflow: 'hidden' },
  searchBtnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  groupCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.navy,
  },
  groupAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {},
  groupName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  activeText: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.7)' },
  groupStats: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  statItem: { flex: 1, alignItems: 'center', gap: SPACING.xs },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, color: COLORS.gray500 },
  statValue: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZES.sm, color: COLORS.navy, textAlign: 'center' },
  joinNote: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: '#EFF6FF',
    margin: SPACING.lg,
    marginTop: 0,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: 0,
  },
  joinNoteText: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm, color: COLORS.info, lineHeight: 20 },
  joinBtn: { margin: SPACING.lg, borderRadius: RADIUS.lg, overflow: 'hidden' },
  joinGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 52,
  },
  joinBtnText: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZES.base, color: COLORS.white },
  hintCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  hintTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZES.base, color: COLORS.navy },
  hintText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 24,
  },
});

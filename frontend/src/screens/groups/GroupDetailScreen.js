import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, Share, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/supabase';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function GroupDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { profile } = useAuth();
  const { groupId } = route.params || {};

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    setLoading(true);
    const [groupRes, membersRes, contribRes] = await Promise.all([
      db.getGroupById(groupId),
      db.getGroupMembers(groupId),
      db.getContributions(profile?.id, groupId),
    ]);
    if (!groupRes.error) setGroup(groupRes.data);
    if (!membersRes.error) setMembers(membersRes.data || []);
    if (!contribRes.error) setContributions(contribRes.data || []);
    setLoading(false);
  };

  const handleShareInvite = async () => {
    try {
      await Share.share({
        message: `Join my Njangi group "${group?.name}" on NjangiX!\n\nUse invite code: ${group?.invite_code}\n\nDownload NjangiX to get started.`,
        title: 'Join my Njangi Group',
      });
    } catch (e) {}
  };

  const handleShareWhatsApp = async () => {
    const msg = `🤝 *NjangiX - ${group?.name}*\n\n` +
      `👥 Members: ${members.length}/${group?.total_members}\n` +
      `💰 Contribution: FCFA ${formatCurrency(group?.contribution_amount)} ${group?.frequency}\n` +
      `📅 Next Payout: TBD\n\n` +
      `Join us! Code: *${group?.invite_code}*\nDownload NjangiX 📱`;
    await Share.share({ message: msg });
  };

  const isLeader = group?.leader_id === profile?.id;
  const myMember = members.find(m => m.user_id === profile?.id);
  const paidCount = contributions.filter(c => c.status === 'paid').length;
  const totalContributed = contributions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.navy, COLORS.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.groupIcon}>
            <Ionicons name="people" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.groupName}>{group?.name}</Text>
          <Text style={styles.groupCode}>Code: {group?.invite_code}</Text>
          {myMember?.payout_position && (
            <View style={styles.positionBadge}>
              <Text style={styles.positionText}>
                Position #{myMember.payout_position}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShareInvite} style={styles.actionBtn}>
            <Ionicons name="share-outline" size={20} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShareWhatsApp} style={[styles.actionBtn, styles.whatsappBtn]}>
            <Ionicons name="logo-whatsapp" size={20} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('GroupChat', { groupId, groupName: group?.name })}
            style={styles.actionBtn}
          >
            <Ionicons name="chatbubble-outline" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Members', value: `${members.length}/${group?.total_members}`, icon: 'people' },
          { label: 'Contributed', value: `FCFA ${formatCurrency(totalContributed)}`, icon: 'cash' },
          { label: 'Cycles Done', value: `${paidCount}`, icon: 'checkmark-circle' },
        ].map((stat, i) => (
          <View key={i} style={styles.statCard}>
            <Ionicons name={stat.icon} size={20} color={COLORS.primary} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['members', 'contributions', 'rotation'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'members' && (
          <View style={styles.membersList}>
            {members.map((member, i) => (
              <View key={i} style={styles.memberItem}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {member.users?.name?.charAt(0)?.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.users?.name}</Text>
                  <Text style={styles.memberPhone}>{member.users?.phone}</Text>
                </View>
                <View style={styles.memberRight}>
                  <Text style={styles.memberPosition}>#{member.payout_position}</Text>
                  {group?.leader_id === member.user_id && (
                    <View style={styles.leaderBadge}>
                      <Text style={styles.leaderBadgeText}>Leader</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'contributions' && (
          <View>
            {contributions.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No contributions yet</Text>
              </View>
            ) : (
              contributions.map((c, i) => (
                <View key={i} style={styles.contribItem}>
                  <View style={[styles.contribDot, {
                    backgroundColor: c.status === 'paid' ? COLORS.primary : COLORS.warning
                  }]} />
                  <View style={styles.contribInfo}>
                    <Text style={styles.contribAmount}>FCFA {formatCurrency(c.amount)}</Text>
                    <Text style={styles.contribDate}>{formatDate(c.created_at)}</Text>
                  </View>
                  <View style={[styles.statusBadge, {
                    backgroundColor: c.status === 'paid' ? COLORS.lightGreen : '#FEF3C7'
                  }]}>
                    <Text style={[styles.statusText, {
                      color: c.status === 'paid' ? COLORS.primary : COLORS.warning
                    }]}>
                      {c.status}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'rotation' && (
          <View>
            {members.sort((a, b) => a.payout_position - b.payout_position).map((m, i) => (
              <View key={i} style={[styles.rotationItem,
                m.user_id === profile?.id && styles.rotationItemHighlight]}>
                <View style={styles.rotationPos}>
                  <Text style={styles.rotationPosText}>{m.payout_position}</Text>
                </View>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>
                    {m.users?.name?.charAt(0)?.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{m.users?.name}</Text>
                  {m.user_id === profile?.id && (
                    <Text style={styles.youLabel}>That's you!</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.gray300} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.payBtn}
          onPress={() => navigation.navigate('Payment', { groupId, group })}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.payGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="wallet" size={20} color={COLORS.white} />
            <Text style={styles.payBtnText}>Pay Contribution</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: 56,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  backBtn: { marginBottom: SPACING.md },
  headerInfo: { alignItems: 'center', marginBottom: SPACING.lg },
  groupIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  groupName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  groupCode: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.sm,
  },
  positionBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  positionText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsappBtn: { backgroundColor: '#25D366AA' },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.xl,
    marginTop: -16,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.navy,
    textAlign: 'center',
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  tabActive: { backgroundColor: COLORS.white, ...SHADOWS.sm },
  tabText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
  },
  tabTextActive: { color: COLORS.primary, fontFamily: FONTS.semiBold },
  tabContent: { flex: 1, paddingHorizontal: SPACING.xl, marginTop: SPACING.md },
  membersList: { gap: SPACING.sm, paddingBottom: SPACING.xl },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  memberAvatarText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.base,
    color: COLORS.navy,
  },
  memberPhone: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
  },
  memberRight: { alignItems: 'flex-end', gap: SPACING.xs },
  memberPosition: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.base,
    color: COLORS.primary,
  },
  leaderBadge: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  leaderBadgeText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
  },
  contribItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  contribDot: { width: 12, height: 12, borderRadius: 6, marginRight: SPACING.md },
  contribInfo: { flex: 1 },
  contribAmount: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.base,
    color: COLORS.navy,
  },
  contribDate: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    textTransform: 'capitalize',
  },
  rotationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  rotationItemHighlight: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  rotationPos: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rotationPosText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.base,
    color: COLORS.primary,
  },
  youLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
  },
  empty: { alignItems: 'center', paddingVertical: SPACING['2xl'] },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray400,
  },
  footer: {
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  payBtn: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  payGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 56,
    borderRadius: RADIUS.lg,
  },
  payBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
});

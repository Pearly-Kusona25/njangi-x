import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/supabase';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { formatCurrency, formatDate, getDaysUntil } from '../../utils/helpers';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const [groups, setGroups] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [nextPayout, setNextPayout] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const loadData = async () => {
    if (!profile) return;
    const [groupsRes, txRes] = await Promise.all([
      db.getGroups(profile.id),
      db.getTransactions(profile.id),
    ]);
    if (!groupsRes.error) setGroups(groupsRes.data || []);
    if (!txRes.error) {
      const txData = txRes.data || [];
      setTransactions(txData.slice(0, 5));
      const nextP = txData.find(t => t.type === 'payout' && t.status === 'scheduled');
      setNextPayout(nextP);
    }
  };

  useEffect(() => { loadData(); }, [profile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [profile]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickActions = [
    { icon: 'people', label: 'My Njangis', color: COLORS.primary, screen: 'Njangis' },
    { icon: 'add-circle', label: 'Create Njangi', color: COLORS.navy, screen: 'Njangis', params: { screen: 'CreateNjangi' } },
    { icon: 'receipt', label: 'Transactions', color: '#0EA5E9', screen: 'History' },
    { icon: 'person-add', label: 'Invite', color: '#8B5CF6', screen: 'Njangis', params: { screen: 'JoinGroup' } },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.navy, '#0D3B27']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>
                {profile?.name?.split(' ')[0] || 'User'} 👋
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            style={styles.notifBtn}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>

        {/* Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletRow}>
            <Text style={styles.walletLabel}>Wallet Balance</Text>
            <TouchableOpacity onPress={() => setBalanceVisible(!balanceVisible)}>
              <Ionicons
                name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={COLORS.gray400}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.walletBalance}>
            {balanceVisible
              ? `FCFA ${formatCurrency(profile?.wallet_balance || 0)}`
              : 'FCFA ••••••'}
          </Text>
          <TouchableOpacity style={styles.depositBtn}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.depositGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add" size={16} color={COLORS.white} />
              <Text style={styles.depositText}>Deposit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        {quickActions.map((action, i) => (
          <TouchableOpacity
            key={i}
            style={styles.actionItem}
            onPress={() => navigation.navigate(action.screen, action.params)}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
              <Ionicons name={action.icon} size={24} color={action.color} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Next Payout Banner */}
      {nextPayout && (
        <View style={styles.payoutBanner}>
          <View style={styles.payoutInfo}>
            <View style={[styles.payoutAvatar, { backgroundColor: COLORS.lightGreen }]}>
              <Ionicons name="people" size={24} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.payoutGroupName}>{nextPayout.group_name || 'Group'}</Text>
              <Text style={styles.payoutAmount}>
                FCFA {formatCurrency(nextPayout.amount)}
              </Text>
              <Text style={styles.payoutDate}>{formatDate(nextPayout.scheduled_date)}</Text>
            </View>
          </View>
          <View style={styles.payoutCountdown}>
            <Text style={styles.countdownLabel}>Next Payout</Text>
            <View style={styles.countdownBadge}>
              <Text style={styles.countdownText}>
                {getDaysUntil(nextPayout.scheduled_date)} Days
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Active Groups */}
      {groups.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Njangis</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Njangis')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {groups.slice(0, 5).map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.groupCard}
                onPress={() => navigation.navigate('Njangis', { screen: 'GroupDetail', params: { groupId: item.groups?.id } })}
              >
                <View style={styles.groupCardTop}>
                  <View style={styles.groupAvatar}>
                    <Ionicons name="people" size={20} color={COLORS.primary} />
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: COLORS.primary }]} />
                </View>
                <Text style={styles.groupName} numberOfLines={1}>{item.groups?.name}</Text>
                <Text style={styles.groupAmount}>
                  FCFA {formatCurrency(item.groups?.contribution_amount)}
                </Text>
                <Text style={styles.groupFrequency}>{item.groups?.frequency}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={40} color={COLORS.gray300} />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          transactions.map((tx, i) => (
            <View key={i} style={styles.txItem}>
              <View style={[styles.txIcon, {
                backgroundColor: tx.type === 'payout' ? COLORS.lightGreen :
                  tx.type === 'deposit' ? '#EFF6FF' : '#FEF2F2'
              }]}>
                <Ionicons
                  name={tx.type === 'payout' ? 'arrow-down' : tx.type === 'deposit' ? 'wallet' : 'arrow-up'}
                  size={18}
                  color={tx.type === 'payout' ? COLORS.primary : tx.type === 'deposit' ? COLORS.info : COLORS.error}
                />
              </View>
              <View style={styles.txDetails}>
                <Text style={styles.txTitle}>
                  {tx.type === 'payout' ? 'Payout Received' :
                    tx.type === 'deposit' ? 'Deposit' : 'Contribution'}
                </Text>
                <Text style={styles.txMeta}>{formatDate(tx.created_at)}</Text>
              </View>
              <Text style={[styles.txAmount, {
                color: tx.type === 'contribution' ? COLORS.error : COLORS.primary
              }]}>
                {tx.type === 'contribution' ? '-' : '+'}FCFA {formatCurrency(tx.amount)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: SPACING['3xl'] },
  headerGradient: {
    paddingTop: 56,
    paddingBottom: SPACING['2xl'],
    paddingHorizontal: SPACING.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
  },
  greeting: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
  notifBtn: { position: 'relative' },
  notifBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  walletCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.md,
  },
  walletRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  walletLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
  },
  walletBalance: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['3xl'],
    color: COLORS.navy,
  },
  depositBtn: { borderRadius: RADIUS.full, overflow: 'hidden' },
  depositGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  depositText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.xl,
    marginTop: -20,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.md,
  },
  actionItem: { alignItems: 'center', gap: SPACING.sm },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  payoutBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  payoutInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  payoutAvatar: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payoutGroupName: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.base,
    color: COLORS.navy,
  },
  payoutAmount: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
  },
  payoutDate: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
  },
  payoutCountdown: { alignItems: 'flex-end' },
  countdownLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  countdownBadge: {
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  countdownText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  section: { marginTop: SPACING.xl, paddingHorizontal: SPACING.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.navy,
  },
  seeAll: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  groupCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginRight: SPACING.md,
    width: 140,
    ...SHADOWS.sm,
  },
  groupCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  groupAvatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  groupName: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.navy,
    marginBottom: 4,
  },
  groupAmount: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.base,
    color: COLORS.primary,
    marginBottom: 2,
  },
  groupFrequency: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
    textTransform: 'capitalize',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  txDetails: { flex: 1 },
  txTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.base,
    color: COLORS.navy,
  },
  txMeta: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  txAmount: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.base,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
    gap: SPACING.md,
  },
  emptyText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray400,
  },
});

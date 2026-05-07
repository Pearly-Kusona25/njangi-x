import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/supabase';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { formatCurrency } from '../../utils/helpers';

export default function NjangiListScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  const loadGroups = async () => {
    const { data, error } = await db.getGroups(profile?.id);
    if (!error) setGroups(data || []);
    setLoading(false);
  };

  useEffect(() => { loadGroups(); }, [profile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  }, [profile]);

  const activeGroups = groups.filter(g => g.groups?.status === 'active');
  const completedGroups = groups.filter(g => g.groups?.status === 'completed');
  const displayGroups = activeTab === 'active' ? activeGroups : completedGroups;

  const renderGroupCard = ({ item }) => {
    const group = item.groups;
    const isLeader = group?.leader_id === profile?.id;
    const isMyTurn = false; // TODO: check payout rotation

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('GroupDetail', { groupId: group?.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          <View style={styles.groupAvatar}>
            <Ionicons name="people" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.groupName}>{group?.name}</Text>
            <Text style={styles.groupMeta}>
              FCFA {formatCurrency(group?.contribution_amount)} • {group?.total_members} Members
            </Text>
          </View>
          {isMyTurn && (
            <View style={styles.yourTurnBadge}>
              <Text style={styles.yourTurnText}>Your Turn</Text>
            </View>
          )}
          {isLeader && !isMyTurn && (
            <View style={styles.leaderBadge}>
              <Text style={styles.leaderText}>Leader</Text>
            </View>
          )}
          {!isLeader && !isMyTurn && (
            <View style={styles.waitingBadge}>
              <Text style={styles.waitingText}>Active</Text>
            </View>
          )}
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBottom}>
          <View style={styles.cardStat}>
            <Ionicons name="wallet-outline" size={14} color={COLORS.gray500} />
            <Text style={styles.cardStatText}>
              You Pay: FCFA {formatCurrency(group?.contribution_amount)} {group?.frequency}
            </Text>
          </View>
          <View style={styles.cardStat}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.gray500} />
            <Text style={styles.cardStatText}>Next Payout: TBD</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.navy, '#0D3B27']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>My Njangis</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('JoinGroup')}
              style={styles.joinBtn}
            >
              <Ionicons name="enter-outline" size={18} color={COLORS.white} />
              <Text style={styles.joinBtnText}>Join</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('CreateNjangi')}
              style={styles.createBtn}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.createGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add" size={18} color={COLORS.white} />
                <Text style={styles.createBtnText}>Create</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.tabActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
              Active ({activeGroups.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
              Completed ({completedGroups.length})
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={displayGroups}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderGroupCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="people-outline" size={48} color={COLORS.gray300} />
              </View>
              <Text style={styles.emptyTitle}>No Njangis Yet</Text>
              <Text style={styles.emptySubtitle}>
                Create a new group or join an existing one with an invite code
              </Text>
              <View style={styles.emptyActions}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('CreateNjangi')}
                  style={styles.emptyCreateBtn}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    style={styles.emptyCreateGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="add" size={18} color={COLORS.white} />
                    <Text style={styles.emptyCreateText}>Create Njangi</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('JoinGroup')}
                  style={styles.emptyJoinBtn}
                >
                  <Text style={styles.emptyJoinText}>Join with Code</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 56,
    paddingHorizontal: SPACING.xl,
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.white,
  },
  headerActions: { flexDirection: 'row', gap: SPACING.sm },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  joinBtnText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
  },
  createBtn: { borderRadius: RADIUS.full, overflow: 'hidden' },
  createGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  createBtnText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  tab: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginRight: SPACING.lg,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.white,
  },
  tabText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.base,
    color: 'rgba(255,255,255,0.5)',
  },
  tabTextActive: { color: COLORS.white, fontFamily: FONTS.semiBold },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: SPACING.xl, gap: SPACING.md, paddingBottom: SPACING['3xl'] },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  groupAvatar: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: { flex: 1 },
  groupName: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.base,
    color: COLORS.navy,
    marginBottom: 2,
  },
  groupMeta: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
  },
  yourTurnBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  yourTurnText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
  },
  leaderBadge: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  leaderText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
  },
  waitingBadge: {
    backgroundColor: COLORS.lightGreen,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  waitingText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
  },
  cardDivider: { height: 1, backgroundColor: COLORS.gray100, marginVertical: SPACING.md },
  cardBottom: { gap: SPACING.xs },
  cardStat: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  cardStatText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
  },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: SPACING.xl },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.navy,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING['2xl'],
  },
  emptyActions: { width: '100%', gap: SPACING.md },
  emptyCreateBtn: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  emptyCreateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 52,
  },
  emptyCreateText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
  },
  emptyJoinBtn: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  emptyJoinText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.base,
    color: COLORS.primary,
  },
});

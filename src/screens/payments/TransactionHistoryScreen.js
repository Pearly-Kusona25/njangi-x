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
import { formatCurrency, formatDate } from '../../utils/helpers';

const TX_TYPES = ['All', 'Contribution', 'Payout', 'Deposit'];

const TX_CONFIG = {
  contribution: { icon: 'arrow-up-circle', color: COLORS.error, bg: '#FEF2F2', label: 'Contribution', sign: '-' },
  payout: { icon: 'arrow-down-circle', color: COLORS.primary, bg: COLORS.lightGreen, label: 'Payout Received', sign: '+' },
  deposit: { icon: 'wallet', color: '#0EA5E9', bg: '#EFF6FF', label: 'Deposit', sign: '+' },
  commission: { icon: 'cut', color: COLORS.warning, bg: '#FFFBEB', label: 'Platform Fee', sign: '-' },
};

export default function TransactionHistoryScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const loadTransactions = async () => {
    const { data, error } = await db.getTransactions(profile?.id);
    if (!error) {
      setTransactions(data || []);
      setFiltered(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { loadTransactions(); }, [profile]);

  useEffect(() => {
    if (activeFilter === 'All') {
      setFiltered(transactions);
    } else {
      setFiltered(transactions.filter(t => t.type === activeFilter.toLowerCase()));
    }
  }, [activeFilter, transactions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  }, [profile]);

  const totalIn = transactions
    .filter(t => ['payout', 'deposit'].includes(t.type))
    .reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions
    .filter(t => ['contribution', 'commission'].includes(t.type))
    .reduce((s, t) => s + t.amount, 0);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.navy, '#0D3B27']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Transaction History</Text>

        {/* Summary Row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total In</Text>
            <Text style={[styles.summaryValue, { color: '#4ADE80' }]}>
              + FCFA {formatCurrency(totalIn)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Out</Text>
            <Text style={[styles.summaryValue, { color: '#F87171' }]}>
              - FCFA {formatCurrency(totalOut)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersWrapper}>
        <FlatList
          horizontal
          data={TX_TYPES}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterBtn, activeFilter === item && styles.filterBtnActive]}
              onPress={() => setActiveFilter(item)}
            >
              <Text style={[styles.filterText, activeFilter === item && styles.filterTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          renderItem={({ item }) => {
            const config = TX_CONFIG[item.type] || TX_CONFIG.contribution;
            return (
              <View style={styles.txItem}>
                <View style={[styles.txIcon, { backgroundColor: config.bg }]}>
                  <Ionicons name={config.icon} size={22} color={config.color} />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txTitle}>{config.label}</Text>
                  <Text style={styles.txDate}>{formatDate(item.created_at)}</Text>
                  {item.status && (
                    <View style={[styles.txStatus, {
                      backgroundColor: item.status === 'completed' ? COLORS.lightGreen : '#FEF3C7'
                    }]}>
                      <Text style={[styles.txStatusText, {
                        color: item.status === 'completed' ? COLORS.primary : COLORS.warning
                      }]}>
                        {item.status}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.txAmount, {
                  color: ['payout', 'deposit'].includes(item.type) ? COLORS.primary : COLORS.error
                }]}>
                  {config.sign} FCFA {formatCurrency(item.amount)}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={COLORS.gray300} />
              <Text style={styles.emptyTitle}>No Transactions</Text>
              <Text style={styles.emptyText}>Your transaction history will appear here</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 56, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.6)', marginBottom: SPACING.xs },
  summaryValue: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.lg },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  filtersWrapper: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  filters: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, gap: SPACING.sm },
  filterBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray100,
  },
  filterBtnActive: { backgroundColor: COLORS.primary },
  filterText: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm, color: COLORS.gray500 },
  filterTextActive: { color: COLORS.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: SPACING.xl, gap: SPACING.sm, paddingBottom: SPACING['3xl'] },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  txIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  txInfo: { flex: 1 },
  txTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZES.base, color: COLORS.navy },
  txDate: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, color: COLORS.gray400, marginTop: 2 },
  txStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginTop: 4,
  },
  txStatusText: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.xs, textTransform: 'capitalize' },
  txAmount: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.base },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: SPACING.md },
  emptyTitle: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZES.lg, color: COLORS.navy },
  emptyText: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.base, color: COLORS.gray400 },
});

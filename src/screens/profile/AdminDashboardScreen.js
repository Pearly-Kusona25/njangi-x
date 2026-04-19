import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, supabase } from '../../services/supabase';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

export default function AdminDashboardScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState({ users: 0, groups: 0, transactions: 0, commission: 0 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [usersRes, groupsRes, txRes, logsRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('groups').select('id', { count: 'exact', head: true }),
        supabase.from('transactions').select('amount, type'),
        db.getActivityLogs(20),
      ]);
      const commission = (txRes.data || [])
        .filter(t => t.type === 'commission')
        .reduce((s, t) => s + Number(t.amount), 0);
      setStats({
        users: usersRes.count || 0,
        groups: groupsRes.count || 0,
        transactions: (txRes.data || []).length,
        commission,
      });
      setLogs(logsRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: 'people', color: COLORS.primary },
    { label: 'Active Groups', value: stats.groups, icon: 'layers', color: COLORS.navy },
    { label: 'Transactions', value: stats.transactions, icon: 'receipt', color: '#0EA5E9' },
    { label: 'Commission Earned', value: `FCFA ${formatCurrency(stats.commission)}`, icon: 'cash', color: '#8B5CF6' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={[COLORS.navy, '#1a5c3a']} style={{ paddingTop: 56, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl }}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: SPACING.md }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES['2xl'], color: COLORS.white }}>Admin Dashboard</Text>
        <Text style={{ fontFamily: FONTS.regular, fontSize: FONT_SIZES.base, color: 'rgba(255,255,255,0.7)' }}>Platform Overview</Text>
      </LinearGradient>

      <View style={{ padding: SPACING.xl }}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md }}>
            {statCards.map((card, i) => (
              <View key={i} style={{
                width: '47%', backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
                padding: SPACING.lg, ...SHADOWS.md,
              }}>
                <View style={{
                  width: 48, height: 48, borderRadius: RADIUS.lg,
                  backgroundColor: card.color + '15', justifyContent: 'center',
                  alignItems: 'center', marginBottom: SPACING.md,
                }}>
                  <Ionicons name={card.icon} size={24} color={card.color} />
                </View>
                <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.xl, color: COLORS.navy, marginBottom: 4 }}>
                  {card.value}
                </Text>
                <Text style={{ fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm, color: COLORS.gray500 }}>
                  {card.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ marginTop: SPACING.xl, backgroundColor: COLORS.lightGreen, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.primary + '30' }}>
          <Text style={{ fontFamily: FONTS.semiBold, fontSize: FONT_SIZES.base, color: COLORS.primary, marginBottom: SPACING.sm }}>
            💡 Admin Notes
          </Text>
          <Text style={{ fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm, color: COLORS.gray700, lineHeight: 22 }}>
            • 1% platform commission is automatically deducted per transaction.{'\n'}
            • All payments are processed through Fapshi Mobile Money.{'\n'}
            • Monitor suspicious activity and review flagged transactions.{'\n'}
            • Use Supabase dashboard for deeper analytics.
          </Text>
        </View>

        <View style={{ marginTop: SPACING.xl }}>
          <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.lg, color: COLORS.navy, marginBottom: SPACING.md }}>
            Recent Activity Logs
          </Text>
          {logs.length > 0 ? logs.map((log) => (
            <View key={log.id} style={{ backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.sm }}>
              <Text style={{ fontFamily: FONTS.semiBold, fontSize: FONT_SIZES.sm, color: COLORS.primary }}>
                {log.users?.name || 'Unknown user'} • {log.event_type.replace('_', ' ')}
              </Text>
              <Text style={{ fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, color: COLORS.gray400, marginTop: SPACING.xs }}>
                {formatDateTime(log.created_at)}{log.duration_seconds ? ` • ${log.duration_seconds}s` : ''}
              </Text>
              {log.metadata ? (
                <Text style={{ fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm, color: COLORS.gray600, marginTop: SPACING.xs }}>
                  {log.metadata}
                </Text>
              ) : null}
            </View>
          )) : (
            <Text style={{ fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm, color: COLORS.gray500 }}>
              No activity logs available yet.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

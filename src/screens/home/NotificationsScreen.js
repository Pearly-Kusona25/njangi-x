import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { formatDateTime } from '../../utils/helpers';

const NOTIF_ICONS = {
  payment_reminder: { icon: 'alarm', color: COLORS.warning, bg: '#FFFBEB' },
  payout_alert: { icon: 'cash', color: COLORS.primary, bg: COLORS.lightGreen },
  new_member: { icon: 'person-add', color: '#0EA5E9', bg: '#EFF6FF' },
  announcement: { icon: 'megaphone', color: '#8B5CF6', bg: '#F5F3FF' },
  system: { icon: 'information-circle', color: COLORS.navy, bg: COLORS.gray100 },
};

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { profile } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });
      setNotifs(data || []);
      setLoading(false);
    };
    load();
  }, [profile]);

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', profile?.id);
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={[COLORS.navy, COLORS.primary]} style={{ paddingTop: 56, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl }}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.lg, color: COLORS.white }}>
            Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
          </Text>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllRead}>
              <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.8)' }}>Mark all read</Text>
            </TouchableOpacity>
          ) : <View style={{ width: 60 }} />}
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={notifs}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: SPACING.xl, gap: SPACING.sm, paddingBottom: SPACING['3xl'] }}
          renderItem={({ item }) => {
            const cfg = NOTIF_ICONS[item.type] || NOTIF_ICONS.system;
            return (
              <View style={{
                flexDirection: 'row', backgroundColor: item.is_read ? COLORS.white : COLORS.lightGreen,
                borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.md,
                borderLeftWidth: item.is_read ? 0 : 4, borderLeftColor: COLORS.primary, ...SHADOWS.sm,
              }}>
                <View style={{ width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: cfg.bg, justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name={cfg.icon} size={20} color={cfg.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.semiBold, fontSize: FONT_SIZES.base, color: COLORS.navy }}>{item.title}</Text>
                  <Text style={{ fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm, color: COLORS.gray500, marginTop: 2, lineHeight: 20 }}>{item.body}</Text>
                  <Text style={{ fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, color: COLORS.gray400, marginTop: SPACING.xs }}>{formatDateTime(item.created_at)}</Text>
                </View>
                {!item.is_read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginTop: 6 }} />}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <Ionicons name="notifications-off-outline" size={48} color={COLORS.gray300} />
              <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.lg, color: COLORS.gray500, marginTop: SPACING.md }}>No notifications yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

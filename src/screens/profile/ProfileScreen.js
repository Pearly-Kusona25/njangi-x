import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { profile, signOut, isAdmin } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', onPress: () => navigation.navigate('EditProfile') },
        { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
        { icon: 'shield-checkmark-outline', label: 'Security', onPress: () => {} },
      ],
    },
    {
      title: 'Njangi',
      items: [
        { icon: 'people-outline', label: 'My Groups', onPress: () => navigation.navigate('Njangis') },
        { icon: 'time-outline', label: 'Transaction History', onPress: () => navigation.navigate('History') },
        { icon: 'help-circle-outline', label: 'How It Works', onPress: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'chatbubble-outline', label: 'Contact Support', onPress: () => {} },
        { icon: 'star-outline', label: 'Rate NjangiX', onPress: () => {} },
        { icon: 'document-text-outline', label: 'Terms & Privacy', onPress: () => {} },
      ],
    },
  ];

  if (isAdmin) {
    menuSections[0].items.unshift({
      icon: 'stats-chart-outline',
      label: 'Admin Dashboard',
      onPress: () => navigation.navigate('AdminDashboard'),
      badge: 'Admin',
    });
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <LinearGradient
        colors={[COLORS.navy, COLORS.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <TouchableOpacity style={styles.editAvatarBtn}>
            <Ionicons name="camera" size={14} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{profile?.name}</Text>
        <Text style={styles.userEmail}>{profile?.email}</Text>
        <View style={styles.roleBadge}>
          <Ionicons
            name={isAdmin ? 'shield-checkmark' : profile?.role === 'leader' ? 'star' : 'person'}
            size={12}
            color={COLORS.white}
          />
          <Text style={styles.roleText}>
            {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Wallet', value: `FCFA ${(profile?.wallet_balance || 0).toLocaleString()}` },
            { label: 'Phone', value: profile?.phone || '-' },
            { label: 'Member Since', value: new Date(profile?.created_at || Date.now()).getFullYear() },
          ].map((stat, i) => (
            <View key={i} style={[styles.statItem, i > 0 && styles.statDivider]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Menu */}
      <View style={styles.menuContainer}>
        {menuSections.map((section, si) => (
          <View key={si} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[styles.menuItem, ii < section.items.length - 1 && styles.menuItemBorder]}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIcon}>
                      <Ionicons name={item.icon} size={18} color={COLORS.primary} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={16} color={COLORS.gray300} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out */}
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <View style={styles.signOutIcon}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
          </View>
          <Text style={styles.signOutText}>Sign Out</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.gray300} />
        </TouchableOpacity>

        <Text style={styles.version}>NjangiX v1.0.0 • Save Together. Grow Together.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 56,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  avatarContainer: { position: 'relative', marginBottom: SPACING.md },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { fontFamily: FONTS.bold, fontSize: FONT_SIZES['3xl'], color: COLORS.white },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.xl, color: COLORS.white, marginBottom: SPACING.xs },
  userEmail: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.7)', marginBottom: SPACING.sm },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xl,
  },
  roleText: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.xs, color: COLORS.white },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' },
  statValue: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.sm, color: COLORS.white, textAlign: 'center' },
  statLabel: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.6)' },
  menuContainer: { padding: SPACING.xl, paddingBottom: SPACING['3xl'] },
  menuSection: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.gray100 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.base, color: COLORS.navy },
  menuItemRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  badge: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  badgeText: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.xs, color: COLORS.white },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    gap: SPACING.md,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  signOutIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: { flex: 1, fontFamily: FONTS.medium, fontSize: FONT_SIZES.base, color: COLORS.error },
  version: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray400,
    textAlign: 'center',
  },
});

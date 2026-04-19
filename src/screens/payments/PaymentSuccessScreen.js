import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS } from '../../utils/theme';
import { formatCurrency } from '../../utils/helpers';

export default function PaymentSuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { amount, groupName, transId } = route.params || {};

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleShare = async () => {
    await Share.share({
      message: `✅ I just made my NjangiX contribution!\n\n💰 Amount: FCFA ${formatCurrency(amount)}\n👥 Group: ${groupName}\n📅 ${new Date().toLocaleDateString()}\n\nRef: ${transId}`,
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark, '#0D3B27']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Success Icon */}
        <Animated.View style={[styles.successIcon, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={52} color={COLORS.primary} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: opacityAnim, alignItems: 'center' }}>
          <Text style={styles.successTitle}>Payment Successful!</Text>

          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>FCFA</Text>
            <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
            <Text style={styles.groupText}>contributed to</Text>
            <Text style={styles.groupName}>{groupName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.infoText}>
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              {' • '}
              {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          {transId && (
            <View style={styles.refRow}>
              <Text style={styles.refLabel}>Reference: </Text>
              <Text style={styles.refValue}>{transId}</Text>
            </View>
          )}
        </Animated.View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
            <Ionicons name="share-social-outline" size={20} color={COLORS.primary} />
            <Text style={styles.shareBtnText}>Share Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.homeBtn}
          >
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  successIcon: { marginBottom: SPACING['2xl'] },
  checkCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  successTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['3xl'],
    color: COLORS.white,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  amountCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  amountLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.xs,
  },
  amountValue: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['4xl'],
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  groupText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: SPACING.xs,
  },
  groupName: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  refLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.5)',
  },
  refValue: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  actions: { width: '100%', gap: SPACING.md, position: 'absolute', bottom: 48, left: SPACING.xl, right: SPACING.xl },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    height: 52,
  },
  shareBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.base,
    color: COLORS.primary,
  },
  homeBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.lg,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  homeBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
  },
});

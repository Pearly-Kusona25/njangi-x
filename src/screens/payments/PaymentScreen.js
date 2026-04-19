import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ScrollView, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { FapshiService } from '../../services/fapshi';
import { db } from '../../services/supabase';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../../utils/theme';
import { formatCurrency } from '../../utils/helpers';

const PAYMENT_METHODS = [
  { id: 'mtn', label: 'MTN Mobile Money', icon: 'phone-portrait', color: '#FCD34D', bg: '#FEF3C7' },
  { id: 'orange', label: 'Orange Money', icon: 'phone-portrait', color: '#F97316', bg: '#FFF7ED' },
];

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { profile } = useAuth();
  const { groupId, group } = route.params || {};

  const [phone, setPhone] = useState(profile?.phone || '');
  const [selectedMethod, setSelectedMethod] = useState('mtn');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: details, 2: confirm

  const amount = group?.contribution_amount || 0;
  const calc = FapshiService.calculateWithCommission(amount);

  const handleContinue = () => {
    if (!phone || phone.length < 9) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    setStep(2);
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      // Format phone (remove leading 0 or +237)
      let formattedPhone = phone.replace(/^\+?237/, '').replace(/^0/, '');

      // Create pending contribution record
      const { data: contrib, error: contribError } = await db.createContribution({
        user_id: profile.id,
        group_id: groupId,
        amount: calc.baseAmount,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      if (contribError) throw new Error(contribError.message);

      // Initiate Fapshi payment
      const payResult = await FapshiService.directPay({
        amount: calc.totalAmount,
        phone: formattedPhone,
        medium: selectedMethod === 'mtn' ? 'mobile money' : 'orange money',
        name: profile.name,
        email: profile.email,
        userId: profile.id,
        externalId: contrib.id,
      });

      if (!payResult.success) {
        throw new Error(payResult.error || 'Payment failed');
      }

      // Poll for payment confirmation (simplified - in production use webhooks)
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        const statusRes = await FapshiService.checkPaymentStatus(payResult.data.transId);

        if (statusRes.data?.status === 'SUCCESSFUL') {
          clearInterval(pollInterval);

          // Update contribution status
          await db.updateContribution(contrib.id, {
            status: 'paid',
            payment_reference: payResult.data.transId,
          });

          // Create transaction record
          await db.createTransaction({
            user_id: profile.id,
            amount: calc.baseAmount,
            type: 'contribution',
            status: 'completed',
            group_id: groupId,
            created_at: new Date().toISOString(),
          });

          // Record commission
          await db.createTransaction({
            user_id: profile.id,
            amount: calc.commission,
            type: 'commission',
            status: 'completed',
            group_id: groupId,
            created_at: new Date().toISOString(),
          });

          setLoading(false);
          navigation.replace('PaymentSuccess', {
            amount: calc.baseAmount,
            groupName: group?.name,
            transId: payResult.data.transId,
          });
        } else if (statusRes.data?.status === 'FAILED' || attempts > 30) {
          clearInterval(pollInterval);
          await db.updateContribution(contrib.id, { status: 'failed' });
          setLoading(false);
          Alert.alert('Payment Failed', 'The payment was not completed. Please try again.');
        }
      }, 5000);

    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.navy, COLORS.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => step === 2 ? setStep(1) : navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay Contribution</Text>
        <Text style={styles.headerSubtitle}>{group?.name || 'Njangi Group'}</Text>

        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          {[1, 2].map(s => (
            <View key={s} style={styles.stepRow}>
              <View style={[styles.stepDot, step >= s && styles.stepDotActive]}>
                {step > s ? (
                  <Ionicons name="checkmark" size={12} color={COLORS.white} />
                ) : (
                  <Text style={styles.stepDotText}>{s}</Text>
                )}
              </View>
              {s < 2 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Contribution Amount</Text>
          <Text style={styles.amountValue}>FCFA {formatCurrency(calc.baseAmount)}</Text>
          <View style={styles.amountBreakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Platform fee (1%)</Text>
              <Text style={styles.breakdownValue}>+ FCFA {formatCurrency(calc.commission)}</Text>
            </View>
            <View style={[styles.breakdownRow, styles.breakdownTotal]}>
              <Text style={styles.totalLabel}>Total to Pay</Text>
              <Text style={styles.totalValue}>FCFA {formatCurrency(calc.totalAmount)}</Text>
            </View>
          </View>
        </View>

        {step === 1 && (
          <>
            {/* Payment Method */}
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {PAYMENT_METHODS.map(method => (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodCard, selectedMethod === method.id && styles.methodCardActive]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <View style={[styles.methodIcon, { backgroundColor: method.bg }]}>
                  <Ionicons name={method.icon} size={24} color={method.color} />
                </View>
                <Text style={styles.methodLabel}>{method.label}</Text>
                <View style={[styles.radioOuter, selectedMethod === method.id && styles.radioOuterActive]}>
                  {selectedMethod === method.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}

            {/* Phone Number */}
            <Text style={styles.sectionTitle}>Mobile Number</Text>
            <View style={styles.phoneInput}>
              <View style={styles.phonePrefix}>
                <Text style={styles.phonePrefixText}>🇨🇲 +237</Text>
              </View>
              <TextInput
                style={styles.phoneField}
                placeholder="6XX XXX XXX"
                placeholderTextColor={COLORS.gray400}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={9}
              />
            </View>

            <TouchableOpacity onPress={handleContinue} style={styles.continueBtn}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.continueBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.continueBtnText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            {/* Confirmation */}
            <View style={styles.confirmCard}>
              <Text style={styles.confirmTitle}>Confirm Payment</Text>
              {[
                { label: 'Group', value: group?.name },
                { label: 'Method', value: selectedMethod === 'mtn' ? 'MTN Mobile Money' : 'Orange Money' },
                { label: 'Number', value: `+237 ${phone}` },
                { label: 'Amount', value: `FCFA ${formatCurrency(calc.totalAmount)}` },
              ].map((row, i) => (
                <View key={i} style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>{row.label}</Text>
                  <Text style={styles.confirmValue}>{row.value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.warningCard}>
              <Ionicons name="information-circle" size={20} color={COLORS.info} />
              <Text style={styles.warningText}>
                You'll receive a prompt on your phone to complete the payment. Make sure your phone is on.
              </Text>
            </View>

            <TouchableOpacity onPress={handlePay} disabled={loading} style={styles.payBtn}>
              <LinearGradient
                colors={loading ? [COLORS.gray300, COLORS.gray300] : [COLORS.primary, COLORS.primaryDark]}
                style={styles.payBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color={COLORS.white} />
                    <Text style={styles.payBtnText}>Processing Payment...</Text>
                  </View>
                ) : (
                  <>
                    <Ionicons name="lock-closed" size={18} color={COLORS.white} />
                    <Text style={styles.payBtnText}>Pay FCFA {formatCurrency(calc.totalAmount)}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
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
  stepIndicator: { flexDirection: 'row', alignItems: 'center' },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: { backgroundColor: COLORS.white },
  stepDotText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  stepLine: { width: 40, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: SPACING.xs },
  stepLineActive: { backgroundColor: COLORS.white },
  content: { flex: 1, padding: SPACING.xl },
  amountCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  amountLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  amountValue: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['3xl'],
    color: COLORS.navy,
    marginBottom: SPACING.md,
  },
  amountBreakdown: { borderTopWidth: 1, borderTopColor: COLORS.gray100, paddingTop: SPACING.md },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  breakdownLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
  },
  breakdownValue: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  breakdownTotal: { marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.gray100 },
  totalLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.base,
    color: COLORS.navy,
  },
  totalValue: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.base,
    color: COLORS.navy,
    marginBottom: SPACING.md,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.sm,
  },
  methodCardActive: { borderColor: COLORS.primary },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  methodLabel: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.base,
    color: COLORS.navy,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  phoneInput: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    height: 56,
  },
  phonePrefix: {
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    backgroundColor: COLORS.gray50,
    borderRightWidth: 1,
    borderRightColor: COLORS.gray200,
  },
  phonePrefixText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.base,
    color: COLORS.navy,
  },
  phoneField: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.navy,
  },
  continueBtn: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  continueBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 56,
    borderRadius: RADIUS.lg,
  },
  continueBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
  confirmCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  confirmTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.navy,
    marginBottom: SPACING.lg,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  confirmLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray500,
  },
  confirmValue: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.base,
    color: COLORS.navy,
  },
  warningCard: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: '#EFF6FF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  warningText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.info,
    lineHeight: 20,
  },
  payBtn: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  payBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 56,
    borderRadius: RADIUS.lg,
  },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  payBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
});

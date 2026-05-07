// ForgotPasswordScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS } from '../../utils/theme';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) { Alert.alert('Error', 'Please enter your email'); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (error) { Alert.alert('Error', error.message); } else { setSent(true); }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.navy, COLORS.primary]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <Text style={styles.headerSubtitle}>Enter your email to receive a reset link</Text>
      </LinearGradient>
      <View style={styles.form}>
        {sent ? (
          <View style={styles.successCard}>
            <View style={styles.successIcon}><Ionicons name="mail-open" size={40} color={COLORS.primary} /></View>
            <Text style={styles.successTitle}>Email Sent!</Text>
            <Text style={styles.successText}>Check your inbox for a password reset link. It may take a few minutes.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backToLoginBtn}>
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={COLORS.gray400} style={{ marginRight: SPACING.sm }} />
                <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor={COLORS.gray400}
                  keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
              </View>
            </View>
            <TouchableOpacity onPress={handleReset} disabled={loading} style={styles.resetBtn}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.resetGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.resetBtnText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 56, paddingHorizontal: SPACING.xl, paddingBottom: SPACING['2xl'] },
  backBtn: { marginBottom: SPACING.md },
  headerTitle: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.xl, color: COLORS.white, marginBottom: SPACING.xs },
  headerSubtitle: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.base, color: 'rgba(255,255,255,0.7)' },
  form: { flex: 1, backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, padding: SPACING.xl },
  inputGroup: { marginBottom: SPACING.lg },
  label: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm, color: COLORS.gray700, marginBottom: SPACING.xs },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md, height: 52,
  },
  input: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZES.base, color: COLORS.navy },
  resetBtn: { borderRadius: RADIUS.md, overflow: 'hidden' },
  resetGradient: { height: 56, justifyContent: 'center', alignItems: 'center', borderRadius: RADIUS.md },
  resetBtnText: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZES.md, color: COLORS.white },
  successCard: { alignItems: 'center', paddingTop: SPACING['2xl'] },
  successIcon: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.lightGreen,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.xl,
  },
  successTitle: { fontFamily: FONTS.bold, fontSize: FONT_SIZES['2xl'], color: COLORS.navy, marginBottom: SPACING.md },
  successText: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.base, color: COLORS.gray500, textAlign: 'center', lineHeight: 24, marginBottom: SPACING['2xl'] },
  backToLoginBtn: { paddingVertical: SPACING.md },
  backToLoginText: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZES.base, color: COLORS.primary },
});

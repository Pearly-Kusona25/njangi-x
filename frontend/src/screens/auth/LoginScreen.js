import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    const result = await signIn({ email: email.trim(), password });
    setLoading(false);
    if (!result.success) {
      Alert.alert('Login Failed', result.error || 'Invalid credentials');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.navy, COLORS.primary]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>NX</Text>
          </View>
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>Sign in to your NjangiX account</Text>
        </LinearGradient>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color={COLORS.gray400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.gray400}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.gray400} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.gray400}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.gray400} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={styles.loginBtn}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.loginGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <Text style={styles.loginBtnText}>Signing In...</Text>
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.registerBtn}
          >
            <Text style={styles.registerBtnText}>
              Don't have an account? <Text style={styles.registerLink}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1 },
  header: {
    paddingTop: 80,
    paddingBottom: 48,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  logoBox: {
    width: 72,
    height: 72,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.white,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: 'rgba(255,255,255,0.7)',
  },
  form: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS['2xl'],
    borderTopRightRadius: RADIUS['2xl'],
    marginTop: -24,
    padding: SPACING.xl,
    flex: 1,
    ...SHADOWS.lg,
  },
  inputGroup: { marginBottom: SPACING.base },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  inputIcon: { marginRight: SPACING.sm },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.navy,
  },
  eyeBtn: { padding: SPACING.xs },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: SPACING.xl },
  forgotText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  loginBtn: { borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: SPACING.xl },
  loginGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  loginBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.gray200 },
  dividerText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    marginHorizontal: SPACING.md,
  },
  registerBtn: { alignItems: 'center' },
  registerBtnText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray600,
  },
  registerLink: {
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
});

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

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { signUp } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [role, setRole] = useState('member');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.phone || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    const result = await signUp({ ...form, role });
    setLoading(false);

    if (!result.success) {
      Alert.alert('Registration Failed', result.error);
    }
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const InputField = ({ icon, placeholder, field, type, secureEntry, rightIcon }) => (
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={18} color={COLORS.gray400} style={styles.inputIcon} />
      <TextInput
        style={[styles.input, { flex: 1 }]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray400}
        keyboardType={type || 'default'}
        autoCapitalize={field === 'email' ? 'none' : 'words'}
        secureTextEntry={secureEntry}
        value={form[field]}
        onChangeText={v => update(field, v)}
      />
      {rightIcon}
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.navy]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join the NjangiX community</Text>
        </LinearGradient>

        <View style={styles.form}>
          {/* Role Selection */}
          <Text style={styles.sectionLabel}>I want to</Text>
          <View style={styles.roleContainer}>
            {['member', 'leader'].map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                onPress={() => setRole(r)}
              >
                <Ionicons
                  name={r === 'member' ? 'person' : 'people'}
                  size={16}
                  color={role === r ? COLORS.white : COLORS.gray500}
                />
                <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                  {r === 'member' ? 'Join Groups' : 'Create Groups'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <InputField icon="person-outline" placeholder="Your full name" field="name" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <InputField icon="mail-outline" placeholder="Email address" field="email" type="email-address" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <InputField icon="call-outline" placeholder="e.g. 67XXXXXXX" field="phone" type="phone-pad" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <InputField
              icon="lock-closed-outline"
              placeholder="Min. 8 characters"
              field="password"
              secureEntry={!showPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.gray400} />
                </TouchableOpacity>
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <InputField icon="lock-closed-outline" placeholder="Re-enter password" field="confirmPassword" secureEntry={!showPassword} />
          </View>

          <TouchableOpacity onPress={handleRegister} disabled={loading} style={styles.registerBtn}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.registerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.registerBtnText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: SPACING.xl,
  },
  backBtn: { marginBottom: SPACING.lg },
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
    marginTop: -20,
    padding: SPACING.xl,
    flex: 1,
  },
  sectionLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray700,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    gap: SPACING.xs,
  },
  roleBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
  },
  roleTextActive: { color: COLORS.white },
  inputGroup: { marginBottom: SPACING.md },
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
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.navy,
  },
  registerBtn: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.lg, marginBottom: SPACING.lg },
  registerGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
  loginLink: { alignItems: 'center', paddingBottom: SPACING.xl },
  loginLinkText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray600,
  },
  loginLinkBold: {
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
});

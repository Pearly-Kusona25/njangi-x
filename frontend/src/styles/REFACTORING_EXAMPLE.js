/**
 * EXAMPLE: Refactored LoginScreen Using Centralized Styles
 * 
 * This is a template showing how to refactor screens to use centralized styles.
 * Copy this pattern to update other screens.
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../utils/theme';
import { authScreenStyles } from '../../styles/screens';

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
      style={authScreenStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={authScreenStyles.scroll} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={[COLORS.navy, COLORS.primary]}
          style={authScreenStyles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={authScreenStyles.logoBox}>
            <Text style={authScreenStyles.logoText}>NX</Text>
          </View>
          <Text style={authScreenStyles.headerTitle}>Welcome Back</Text>
          <Text style={authScreenStyles.headerSubtitle}>Sign in to your NjangiX account</Text>
        </LinearGradient>

        {/* Form */}
        <View style={authScreenStyles.form}>
          {/* Email Input */}
          <View style={authScreenStyles.inputGroup}>
            <Text style={authScreenStyles.label}>Email Address</Text>
            <View style={authScreenStyles.inputWrapper}>
              <Ionicons 
                name="mail-outline" 
                size={18} 
                color={COLORS.gray400} 
                style={authScreenStyles.inputIcon} 
              />
              <TextInput
                style={authScreenStyles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.gray400}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={authScreenStyles.inputGroup}>
            <Text style={authScreenStyles.label}>Password</Text>
            <View style={authScreenStyles.inputWrapper}>
              <Ionicons 
                name="lock-closed-outline" 
                size={18} 
                color={COLORS.gray400} 
                style={authScreenStyles.inputIcon} 
              />
              <TextInput
                style={[authScreenStyles.input, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.gray400}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)} 
                style={authScreenStyles.eyeBtn}
              >
                <Ionicons 
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                  size={18} 
                  color={COLORS.gray400} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={authScreenStyles.forgotBtn}
          >
            <Text style={authScreenStyles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={authScreenStyles.loginBtn}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={authScreenStyles.loginGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={authScreenStyles.loginBtnText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={authScreenStyles.divider}>
            <View style={authScreenStyles.dividerLine} />
            <Text style={authScreenStyles.dividerText}>or</Text>
            <View style={authScreenStyles.dividerLine} />
          </View>

          {/* Register Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={authScreenStyles.registerBtn}
          >
            <Text style={authScreenStyles.registerBtnText}>
              Don't have an account? <Text style={authScreenStyles.registerLink}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/**
 * KEY CHANGES FROM INLINE STYLES:
 * 
 * 1. Removed: const styles = StyleSheet.create({...})
 * 2. Removed: import React, { ... } StyleSheet statement
 * 3. Added: import { authScreenStyles } from '../../styles/screens'
 * 4. Replaced all: styles.xxx with authScreenStyles.xxx
 * 
 * BENEFITS:
 * ✓ Cleaner component code
 * ✓ Reusable across all auth screens
 * ✓ Centralized style management
 * ✓ Easier to maintain consistency
 * ✓ Better performance (styles compiled once)
 * ✓ Easier to test and update
 */

// EditProfileScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../../utils/theme';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { profile, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: profile?.name || '', phone: profile?.phone || '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Name is required'); return; }
    setLoading(true);
    const result = await updateProfile(form);
    setLoading(false);
    if (result.success) { Alert.alert('Success', 'Profile updated!'); navigation.goBack(); }
    else { Alert.alert('Error', result.error); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient colors={[COLORS.navy, COLORS.primary]} style={{ paddingTop: 56, paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl }}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: SPACING.md }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={{ fontFamily: FONTS.bold, fontSize: FONT_SIZES.xl, color: COLORS.white }}>Edit Profile</Text>
      </LinearGradient>
      <View style={{ backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, padding: SPACING.xl }}>
        {[
          { label: 'Full Name', field: 'name', placeholder: 'Your full name', icon: 'person-outline' },
          { label: 'Phone Number', field: 'phone', placeholder: '6XX XXX XXX', icon: 'call-outline', type: 'phone-pad' },
        ].map(({ label, field, placeholder, icon, type }) => (
          <View key={field} style={{ marginBottom: SPACING.md }}>
            <Text style={{ fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm, color: COLORS.gray700, marginBottom: SPACING.xs }}>{label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray50, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.gray200, paddingHorizontal: SPACING.md, height: 52 }}>
              <Ionicons name={icon} size={18} color={COLORS.gray400} style={{ marginRight: SPACING.sm }} />
              <TextInput
                style={{ flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZES.base, color: COLORS.navy }}
                placeholder={placeholder} placeholderTextColor={COLORS.gray400} keyboardType={type || 'default'}
                value={form[field]} onChangeText={v => setForm(p => ({ ...p, [field]: v }))}
              />
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={handleSave} disabled={loading} style={{ marginTop: SPACING.xl, borderRadius: RADIUS.lg, overflow: 'hidden' }}>
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={{ height: 56, justifyContent: 'center', alignItems: 'center' }} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={{ fontFamily: FONTS.semiBold, fontSize: FONT_SIZES.md, color: COLORS.white }}>{loading ? 'Saving...' : 'Save Changes'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

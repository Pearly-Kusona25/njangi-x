import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, FONT_SIZES } from '../utils/theme';

export default function SplashScreen() {
  const navigation = useNavigation();
  const logoScale = new Animated.Value(0);
  const logoOpacity = new Animated.Value(0);
  const textOpacity = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(async () => {
      const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
      navigation.replace(hasOnboarded ? 'Auth' : 'Onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={[COLORS.navy, '#0D3B27', COLORS.primary]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
        {/* Logo Icon */}
        <View style={styles.logoIcon}>
          <Text style={styles.logoLetter}>N</Text>
          <View style={styles.xMark}>
            <Text style={styles.xLetter}>X</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.appName}>NjangiX</Text>
        <Text style={styles.tagline}>Save Together. Grow Together.</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Fapshi Mobile Money</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoIcon: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
  },
  logoLetter: {
    fontFamily: FONTS.bold,
    fontSize: 52,
    color: COLORS.white,
  },
  xMark: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xLetter: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.white,
  },
  appName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['4xl'],
    color: COLORS.white,
    letterSpacing: 1,
  },
  tagline: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.5)',
  },
});

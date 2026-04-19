import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../utils/theme';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: 'people',
    title: 'Save Together',
    subtitle: 'Join or create a Njangi group with friends, family, or colleagues. Pool your savings and help each other grow.',
    bgColor: COLORS.primary,
    iconBg: 'rgba(255,255,255,0.2)',
  },
  {
    id: '2',
    icon: 'phone-portrait',
    title: 'Pay with Mobile Money',
    subtitle: 'Make contributions easily with MTN Mobile Money or Orange Money. Fast, secure, and tracked automatically.',
    bgColor: COLORS.navy,
    iconBg: 'rgba(22,163,74,0.3)',
  },
  {
    id: '3',
    icon: 'trending-up',
    title: 'Track & Grow',
    subtitle: 'See your contribution history, upcoming payouts, and group progress. Full transparency, zero confusion.',
    bgColor: '#0D3B27',
    iconBg: 'rgba(255,255,255,0.15)',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const flatListRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      await AsyncStorage.setItem('hasOnboarded', 'true');
      navigation.replace('Auth');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    navigation.replace('Auth');
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <LinearGradient
              colors={[item.bgColor, item.bgColor + 'CC']}
              style={styles.slideGradient}
            >
              <View style={styles.iconWrapper}>
                <View style={[styles.iconBg, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={72} color={COLORS.white} />
                </View>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.slideTitle}>{item.title}</Text>
                <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
              </View>
            </LinearGradient>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => {
          const opacity = scrollX.interpolate({
            inputRange: [(index - 1) * width, index * width, (index + 1) * width],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          const dotWidth = scrollX.interpolate({
            inputRange: [(index - 1) * width, index * width, (index + 1) * width],
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={index}
              style={[styles.dot, { opacity, width: dotWidth }]}
            />
          );
        })}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.nextGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextText}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} style={{ marginLeft: 6 }} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navy },
  slide: { flex: 1 },
  slideGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING['2xl'] },
  iconWrapper: { marginBottom: SPACING['3xl'] },
  iconBg: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: { alignItems: 'center' },
  slideTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['3xl'],
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.base,
  },
  slideSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 26,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.navy,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginHorizontal: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING['3xl'],
    backgroundColor: COLORS.navy,
  },
  skipBtn: { padding: SPACING.md },
  skipText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.base,
    color: 'rgba(255,255,255,0.5)',
  },
  nextBtn: { borderRadius: 50, overflow: 'hidden' },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 50,
  },
  nextText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
  },
});

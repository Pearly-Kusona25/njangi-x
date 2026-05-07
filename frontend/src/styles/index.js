/**
 * Centralized Styles Module for Njangi-Sure
 * All screen styles exported from one location
 * Usage: import { screenStyles } from '../styles/index.js'
 */

import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../utils/theme';

const { width, height } = Dimensions.get('window');

// ============================================
// GLOBAL STYLES
// ============================================

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  containerDark: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  flex: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ============================================
// TYPOGRAPHY STYLES
// ============================================

export const textStyles = StyleSheet.create({
  h1: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['4xl'],
    color: COLORS.gray700,
    lineHeight: 38,
  },
  h2: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['3xl'],
    color: COLORS.gray700,
    lineHeight: 34,
  },
  h3: {
    fontFamily: FONTS.semibold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.gray700,
    lineHeight: 30,
  },
  h4: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.gray700,
    lineHeight: 26,
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray600,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    lineHeight: 20,
  },
  label: {
    fontFamily: FONTS.semibold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    lineHeight: 18,
  },
  caption: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray400,
    lineHeight: 16,
  },
  white: {
    color: COLORS.white,
  },
  primary: {
    color: COLORS.primary,
  },
  gray400: {
    color: COLORS.gray400,
  },
  gray600: {
    color: COLORS.gray600,
  },
});

// ============================================
// GRADIENT BACKGROUNDS
// ============================================

export const gradients = StyleSheet.create({
  primaryGradient: {
    backgroundColor: COLORS.primary,
  },
  navyGradient: {
    backgroundColor: COLORS.navy,
  },
  headerGradient: {
    backgroundColor: COLORS.navy,
  },
});

// ============================================
// SPACING UTILITIES
// ============================================

export const spacing = StyleSheet.create({
  p0: { padding: 0 },
  p1: { padding: SPACING.sm },
  p2: { padding: SPACING.md },
  p3: { padding: SPACING.lg },
  p4: { padding: SPACING.xl },
  p5: { padding: SPACING['2xl'] },
  p6: { padding: SPACING['3xl'] },

  px1: { paddingHorizontal: SPACING.sm },
  px2: { paddingHorizontal: SPACING.md },
  px3: { paddingHorizontal: SPACING.lg },
  px4: { paddingHorizontal: SPACING.xl },

  py1: { paddingVertical: SPACING.sm },
  py2: { paddingVertical: SPACING.md },
  py3: { paddingVertical: SPACING.lg },
  py4: { paddingVertical: SPACING.xl },

  m0: { margin: 0 },
  m1: { margin: SPACING.sm },
  m2: { margin: SPACING.md },
  m3: { margin: SPACING.lg },
  m4: { margin: SPACING.xl },

  mb1: { marginBottom: SPACING.sm },
  mb2: { marginBottom: SPACING.md },
  mb3: { marginBottom: SPACING.lg },
  mb4: { marginBottom: SPACING.xl },

  mt1: { marginTop: SPACING.sm },
  mt2: { marginTop: SPACING.md },
  mt3: { marginTop: SPACING.lg },
  mt4: { marginTop: SPACING.xl },
});

// ============================================
// BUTTON STYLES
// ============================================

export const buttonStyles = StyleSheet.create({
  primary: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  primaryDark: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryDark,
  },
  secondary: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.gray400,
  },
  ghost: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  small: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
});

export const buttonTextStyles = StyleSheet.create({
  primary: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
  },
  secondary: {
    fontFamily: FONTS.semibold,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray700,
  },
});

// ============================================
// INPUT STYLES
// ============================================

export const inputStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    height: 56,
    marginBottom: SPACING.lg,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.gray700,
    marginLeft: SPACING.md,
  },
  label: {
    fontFamily: FONTS.semibold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
});

// ============================================
// CARD STYLES
// ============================================

export const cardStyles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  compact: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray700,
  },
});

// ============================================
// HEADER STYLES
// ============================================

export const headerStyles = StyleSheet.create({
  container: {
    paddingTop: SPACING['3xl'],
    paddingBottom: SPACING['2xl'],
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.navy,
  },
  containerDark: {
    paddingTop: SPACING['3xl'],
    paddingBottom: SPACING['2xl'],
    paddingHorizontal: SPACING.xl,
    backgroundColor: COLORS.navy,
  },
  logoBox: {
    width: 72,
    height: 72,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.white,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: 'rgba(255,255,255,0.7)',
  },
});

// ============================================
// AVATAR STYLES
// ============================================

export const avatarStyles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  large: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
  },
});

// ============================================
// BADGE STYLES
// ============================================

export const badgeStyles = StyleSheet.create({
  container: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  text: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
  },
});

// ============================================
// DIVIDER STYLES
// ============================================

export const dividerStyles = StyleSheet.create({
  horizontal: {
    height: 1,
    backgroundColor: COLORS.gray400,
    marginVertical: SPACING.xl,
    opacity: 0.2,
  },
  vertical: {
    width: 1,
    backgroundColor: COLORS.gray400,
    marginHorizontal: SPACING.lg,
    opacity: 0.2,
  },
  withText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray400,
    opacity: 0.2,
  },
  text: {
    marginHorizontal: SPACING.lg,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
  },
});

// ============================================
// EMPTY STATE STYLES
// ============================================

export const emptyStateStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: SPACING.xl,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray700,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray400,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
});

// ============================================
// MODAL STYLES
// ============================================

export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray700,
  },
});

// ============================================
// EXPORT ALL STYLES
// ============================================

export default {
  globalStyles,
  textStyles,
  gradients,
  spacing,
  buttonStyles,
  buttonTextStyles,
  inputStyles,
  cardStyles,
  headerStyles,
  avatarStyles,
  badgeStyles,
  dividerStyles,
  emptyStateStyles,
  modalStyles,
};

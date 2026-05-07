/**
 * Screen-Specific Styles Module
 * All styles extracted from individual screens and centralized here
 * Usage: import { authScreenStyles, homeScreenStyles, etc. } from '../styles/screens.js'
 */

import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../utils/theme';

const { width, height } = Dimensions.get('window');

// ============================================
// ONBOARDING SCREEN STYLES
// ============================================

export const onboardingScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  slide: {
    flex: 1,
  },
  slideGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING['2xl'],
  },
  iconWrapper: {
    marginBottom: SPACING['3xl'],
  },
  iconBg: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  slideTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.white,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  slideSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 160,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    marginHorizontal: 6,
  },
  actions: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipBtn: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  skipText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
    opacity: 0.7,
  },
  nextBtn: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    minWidth: 140,
  },
  nextGradient: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
  },
});

// ============================================
// SPLASH SCREEN STYLES
// ============================================

export const splashScreenStyles = StyleSheet.create({
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

// ============================================
// AUTH SCREENS STYLES
// ============================================

export const authScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
  },
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
  inputGroup: {
    marginBottom: SPACING.base,
  },
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
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.navy,
  },
  eyeBtn: {
    padding: SPACING.xs,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.xl,
  },
  forgotText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  loginBtn: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  loginGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  loginBtnText: {
    fontFamily: FONTS.semibold,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray200,
  },
  dividerText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
    marginHorizontal: SPACING.md,
  },
  registerBtn: {
    alignItems: 'center',
  },
  registerBtnText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray600,
  },
  registerLink: {
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
  },
});

// ============================================
// HOME SCREEN STYLES
// ============================================

export const homeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingBottom: SPACING['2xl'],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  avatarText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    color: COLORS.white,
  },
  greeting: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
  },
  notifBtn: {
    padding: SPACING.md,
    borderRadius: 12,
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
  },
  walletCard: {
    marginHorizontal: SPACING.xl,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  walletLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  walletBalance: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['3xl'],
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
  depositBtn: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  depositGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  depositText: {
    fontFamily: FONTS.semibold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    gap: SPACING.lg,
  },
  actionItem: {
    flex: 0.47,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  actionLabel: {
    fontFamily: FONTS.semibold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    textAlign: 'center',
  },
  payoutBanner: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  payoutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payoutAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.lg,
  },
});

// ============================================
// PAYMENT SCREEN STYLES
// ============================================

export const paymentScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.xl,
  },
  header: {
    marginBottom: SPACING['2xl'],
  },
  headerText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  amountInput: {
    fontSize: FONT_SIZES['3xl'],
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textAlign: 'center',
    marginVertical: SPACING.xl,
  },
  methodSelector: {
    marginVertical: SPACING.xl,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    marginVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray200,
  },
  methodButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '10',
  },
  methodIcon: {
    marginRight: SPACING.lg,
  },
  methodText: {
    fontFamily: FONTS.semibold,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray700,
  },
});

// ============================================
// GROUP SCREENS STYLES
// ============================================

export const groupScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  groupCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    marginBottomPadding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    ...SHADOWS.md,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  groupTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray700,
  },
  groupMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray400,
    marginBottom: SPACING.xs,
  },
  metaValue: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
  },
});

// ============================================
// CHAT SCREEN STYLES
// ============================================

export const chatScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messageList: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  messageBubble: {
    marginVertical: SPACING.sm,
    maxWidth: '80%',
  },
  messageBubbleOwn: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  messageBubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    borderTopRightRadius: RADIUS.lg,
    borderBottomLeftRadius: RADIUS.sm,
    borderBottomRightRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...SHADOWS.sm,
  },
  messageText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
  },
  messageTextOwn: {
    color: COLORS.white,
  },
  messageTextOther: {
    color: COLORS.gray700,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  inputField: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    marginRight: SPACING.md,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ============================================
// PROFILE SCREEN STYLES
// ============================================

export const profileScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.navy,
    paddingVertical: SPACING['2xl'],
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  profileName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  profileEmail: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  section: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray700,
    marginBottom: SPACING.lg,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  menuItemText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray700,
  },
});

// ============================================
// EXPORT ALL SCREEN STYLES
// ============================================

export default {
  onboardingScreenStyles,
  splashScreenStyles,
  authScreenStyles,
  homeScreenStyles,
  paymentScreenStyles,
  groupScreenStyles,
  chatScreenStyles,
  profileScreenStyles,
};

// src/theme/typography.js
// Green Fibre — Editorial type scale
// Serif: Playfair Display — headlines, hero, editorial
// Sans:  DM Sans          — body, UI labels, buttons
// Mono:  DM Mono          — overlines, captions, category tags

import { colors } from './colors';

// Font family constants — matched to installed expo-google-fonts packages
export const fontFamilies = {
  serifRegular: 'PlayfairDisplay_400Regular',
  serifItalic: 'PlayfairDisplay_400Regular_Italic',
  serifSemiBold: 'PlayfairDisplay_600SemiBold',
  serifBold: 'PlayfairDisplay_700Bold',
  serifExtraBold: 'PlayfairDisplay_800ExtraBold',
  sansRegular: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansSemiBold: 'DMSans_600SemiBold',
  sansBold: 'DMSans_700Bold',
  monoRegular: 'DMMono_400Regular',
  monoMedium: 'DMMono_500Medium',
};

export const typography = {
  // ── Hero / Editorial ────────────────────────────────────────
  hero: {
    fontFamily: fontFamilies.serifBold,
    fontSize: 38,
    lineHeight: 46,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  heroLight: {
    fontFamily: fontFamilies.serifRegular,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.3,
    color: colors.textOnDark,
  },

  // ── Headings ────────────────────────────────────────────────
  h1: {
    fontFamily: fontFamilies.serifBold,
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  h2: {
    fontFamily: fontFamilies.serifSemiBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  h3: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.textPrimary,
  },
  h4: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 17,
    lineHeight: 24,
    color: colors.textPrimary,
  },

  // ── Overline / Label ────────────────────────────────────────
  // DM Mono caps — category tags, section labels, RAW BAMBOO style
  overline: {
    fontFamily: fontFamilies.monoMedium,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  overlineSm: {
    fontFamily: fontFamilies.monoRegular,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },

  // ── Body ────────────────────────────────────────────────────
  body: {
    fontFamily: fontFamilies.sansRegular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  body1: {
    fontFamily: fontFamilies.sansRegular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  body2: {
    fontFamily: fontFamilies.sansRegular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  bodySmall: {
    fontFamily: fontFamilies.sansRegular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  bodyLarge: {
    fontFamily: fontFamilies.sansRegular,
    fontSize: 17,
    lineHeight: 27,
    color: colors.textPrimary,
  },

  // ── UI Labels ───────────────────────────────────────────────
  subtitle1: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  subtitle2: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  label: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.3,
    color: colors.textSecondary,
  },
  caption: {
    fontFamily: fontFamilies.sansRegular,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textLight,
  },

  // ── Button ──────────────────────────────────────────────────
  button: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  buttonSm: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
  },

  // ── Price ───────────────────────────────────────────────────
  price: {
    fontFamily: fontFamilies.sansBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.primary,
  },
  priceSm: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.primary,
  },
};
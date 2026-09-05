// export const typography = {
//     hero: {
//         fontSize: 32,
//         fontWeight: '700',
//         lineHeight: 40,
//         letterSpacing: -0.5,
//     },
//     h1: {
//         fontSize: 28,
//         fontWeight: '700',
//         lineHeight: 36,
//     },
//     h2: {
//         fontSize: 22,
//         fontWeight: '600',
//         lineHeight: 30,
//     },
//     h3: {
//         fontSize: 18,
//         fontWeight: '600',
//         lineHeight: 26,
//     },
//     body: {
//         fontSize: 15,
//         fontWeight: '400',
//         lineHeight: 24,
//     },
//     bodySmall: {
//         fontSize: 13,
//         fontWeight: '400',
//         lineHeight: 20,
//     },
//     caption: {
//         fontSize: 11,
//         fontWeight: '500',
//         lineHeight: 16,
//         letterSpacing: 0.5,
//         textTransform: 'uppercase',
//     },
//     button: {
//         fontSize: 15,
//         fontWeight: '600',
//         lineHeight: 20,
//     },
//     stat: {
//         fontSize: 26,
//         fontWeight: '700',
//         lineHeight: 32,
//     },
// };


// src/theme/typography.js

import { colors } from './colors';

export const typography = {
  h1: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 41,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 34,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 30,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 26,
  },
  subtitle1: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textPrimary,
    lineHeight: 24,
  },
  subtitle2: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 22,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textLight,
    lineHeight: 16,
  },
  hero: {
    fontSize: 38,
    fontWeight: '900',
    color: colors.textPrimary,
    lineHeight: 44,
  },
};
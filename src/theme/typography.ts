/**
 * Type scale — DESIGN §2. Fraunces for editorial headings, Manrope for everything functional.
 * Sizes in pt; font scaling from the OS stays enabled (accessibility), so layouts must not
 * depend on fixed text heights.
 */
import type { TextStyle } from 'react-native';

import { Fraunces_400Regular } from '@expo-google-fonts/fraunces/400Regular';
import { Fraunces_500Medium } from '@expo-google-fonts/fraunces/500Medium';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';

import { colors } from './tokens';

export const fontAssets = {
  Fraunces_400Regular,
  Fraunces_500Medium,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
};

export const fonts = {
  serif: 'Fraunces_400Regular',
  serifMedium: 'Fraunces_500Medium',
  sans: 'Manrope_400Regular',
  sansMedium: 'Manrope_500Medium',
  sansSemiBold: 'Manrope_600SemiBold',
  sansBold: 'Manrope_700Bold',
} as const;

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'labelStrong'
  | 'eyebrow'
  | 'button';

/**
 * H1 follows `clamp(2rem, 7vw, 2.75rem)`; phones land on 32, tablets grow toward 44.
 * `h1Size(width)` returns the responsive size; the static entry is the phone value.
 */
export function h1Size(windowWidth: number): number {
  return Math.min(44, Math.max(32, windowWidth * 0.07));
}

export const textStyles: Record<TextVariant, TextStyle> = {
  h1: { fontFamily: fonts.serif, fontSize: 32, lineHeight: 36, color: colors.ink, letterSpacing: -0.3 },
  h2: { fontFamily: fonts.serif, fontSize: 27, lineHeight: 31, color: colors.ink, letterSpacing: -0.2 },
  /** Card titles: Susurro / Equilibrio / Declaración, zone names. */
  h3: { fontFamily: fonts.serif, fontSize: 21, lineHeight: 26, color: colors.ink },
  body: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.ink },
  bodyStrong: { fontFamily: fonts.sansSemiBold, fontSize: 16, lineHeight: 24, color: colors.ink },
  /** Minimum size for any important instruction (0.875rem). */
  label: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.muted },
  labelStrong: { fontFamily: fonts.sansSemiBold, fontSize: 14, lineHeight: 20, color: colors.ink },
  /** Spaced small caps label, e.g. "CÓMO APLICARLO". Decorative-level info only. */
  eyebrow: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  button: { fontFamily: fonts.sansSemiBold, fontSize: 16, lineHeight: 22, letterSpacing: 0.2 },
};

/**
 * Screen scaffold: cream background, safe areas, BrandHeader, scrollable body centered at
 * max 560pt, and an optional sticky footer for the primary CTA (bottom safe area included).
 * Entrance: opacity + 8px rise over 360ms (DESIGN §6); none with reduced motion.
 */
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, easing, layout, motion, space } from '@/theme';

import { BrandHeader, type BrandHeaderProps } from './BrandHeader';

const SCREEN_ENTER = FadeInDown.duration(motion.emphasis)
  .easing(easing.enter)
  .withInitialValues({
    transform: [{ translateY: space[2] }],
  });

export interface ScreenProps {
  header?: BrandHeaderProps | false;
  children: ReactNode;
  footer?: ReactNode;
  /** Decorative layer (RibbonAccent) rendered behind content. */
  background?: ReactNode;
  /** Disable scroll for full-bleed screens (camera). */
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Screen({ header = {}, children, footer, background, scroll = true, contentStyle }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const entering = reduceMotion ? undefined : SCREEN_ENTER;

  const body = (
    <Animated.View entering={entering} style={[styles.content, contentStyle]}>
      {children}
    </Animated.View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {background}
      {header !== false && <BrandHeader {...header} />}
      {/* Keeps the sticky CTA above the keyboard on both platforms (Android edge-to-edge included). */}
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        {scroll ? (
          <KeyboardAwareScrollView
            bottomOffset={space[6]}
            style={styles.flex}
            contentContainerStyle={[styles.scroll, !footer && { paddingBottom: insets.bottom + space[8] }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {body}
          </KeyboardAwareScrollView>
        ) : (
          <View style={styles.flex}>{body}</View>
        )}
        {footer ? (
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space[4]) }]}>
            <View style={styles.footerInner}>{footer}</View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingTop: space[4] },
  content: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
    gap: space[6],
  },
  footer: {
    paddingTop: space[3],
    paddingHorizontal: layout.gutter,
  },
  footerInner: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', gap: space[3] },
});

/**
 * Screen scaffold: cream background, safe areas, BrandHeader, scrollable body centered at
 * max 560pt, and an optional sticky footer for the primary CTA (bottom safe area included).
 * Entrance: opacity + 8px rise over 360ms (DESIGN §6); none with reduced motion.
 */
import { createContext, useCallback, useContext, useRef, type ComponentRef, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewRef,
} from 'react-native-keyboard-controller';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, easing, layout, motion, space } from '@/theme';

import { BrandHeader, type BrandHeaderProps } from './BrandHeader';

const SCREEN_ENTER = FadeInDown.duration(motion.emphasis)
  .easing(easing.enter)
  .withInitialValues({
    transform: [{ translateY: space[2] }],
  });

type RevealElement = (element: ComponentRef<typeof View>, onRevealed: () => void) => void;
const RevealContext = createContext<RevealElement>((_element, onRevealed) => onRevealed());
export const useRevealInScreen = () => useContext(RevealContext);

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
  const scrollRef = useRef<KeyboardAwareScrollViewRef>(null);
  const contentRef = useRef<ComponentRef<typeof View>>(null);
  const reveal = useCallback<RevealElement>((element, onRevealed) => {
    if (!contentRef.current || !scrollRef.current) return onRevealed();
    element.measureLayout(
      contentRef.current,
      (_x, y) => {
        scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: false });
        requestAnimationFrame(onRevealed);
      },
      onRevealed,
    );
  }, []);

  const body = (
    <Animated.View ref={contentRef} collapsable={false} entering={entering} style={[styles.content, contentStyle]}>
      {children}
    </Animated.View>
  );

  return (
    <RevealContext.Provider value={reveal}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {background}
        {header !== false && <BrandHeader {...header} />}
        {/* Keeps the sticky CTA above the keyboard on both platforms (Android edge-to-edge included). */}
        <KeyboardAvoidingView style={styles.flex} behavior="padding">
          {scroll ? (
            <KeyboardAwareScrollView
              ref={scrollRef}
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
    </RevealContext.Provider>
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

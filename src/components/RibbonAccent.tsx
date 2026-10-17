/**
 * RibbonAccent (DESIGN §2, §5, §6): the silk ribbon artwork (`vl_cintas_pie_v01`, A8) behind
 * the footer. Decorative only (hidden from screen readers), one per screen; its top third is
 * transparent so text can pass over it. Motion: slow 6px drift on an 8s cycle, UI thread,
 * transform only. Paused when reduced motion is on, the app is backgrounded, or the screen
 * loses focus.
 */
import { Image } from 'expo-image';
import { useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/theme';

const RIBBONS = require('../../assets/art/vl_cintas_pie_v01.webp');
/** Horizontal drift amplitude (DESIGN §6: 4–8px); the art bleeds this much past each edge. */
const DRIFT = 6;

export interface RibbonAccentProps {
  /** Where the bands sit; the component fills its parent edge-to-edge. */
  placement?: 'bottom' | 'top';
  height?: number;
  style?: StyleProp<ViewStyle>;
}

function useAppActive(): boolean {
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setActive(s === 'active'));
    return () => sub.remove();
  }, []);
  return active;
}

export function RibbonAccent({ placement = 'bottom', height = 140, style }: RibbonAccentProps) {
  const reduceMotion = useReducedMotion();
  const focused = useIsFocused();
  const appActive = useAppActive();
  const drift = useSharedValue(0);
  const animate = !reduceMotion && focused && appActive;

  useEffect(() => {
    if (animate) {
      const halfCycle = motion.ribbonCycle / 2;
      const current = drift.get();
      const curve = Easing.inOut(Easing.sin);

      drift.set(
        withSequence(
          withTiming(0, {
            duration: halfCycle * current,
            easing: curve,
          }),
          withRepeat(
            withTiming(1, {
              duration: halfCycle,
              easing: curve,
            }),
            -1,
            true,
          ),
        ),
      );
    } else {
      cancelAnimation(drift);
    }
    return () => cancelAnimation(drift);
  }, [animate, drift]);

  const driftStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -DRIFT / 2 + drift.get() * DRIFT }],
  }));

  return (
    <View
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.wrap, placement === 'bottom' ? styles.bottom : styles.top, { height }, style]}
    >
      <Animated.View style={[styles.art, driftStyle]}>
        <Image
          source={RIBBONS}
          contentFit="cover"
          contentPosition={placement === 'bottom' ? 'bottom' : 'top'}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, overflow: 'hidden' },
  bottom: { bottom: 0 },
  top: { top: 0 },
  art: { position: 'absolute', top: 0, bottom: 0, left: -DRIFT, right: -DRIFT },
});
